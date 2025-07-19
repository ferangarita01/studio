
// IMPORTANT: This service now uses Firebase Realtime Database.
// You will need to set up Realtime Database in your Firebase project.
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  remove,
  query,
  orderByChild,
  equalTo,
  update
} from "firebase/database";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/firebase";
import { wasteData, weeklyReportData, monthlyReportData } from "@/lib/data";
import type { WasteEntry, Material, DisposalEvent, ReportData, Company, UserRole, UserProfile } from "@/lib/types";

// Helper to convert snapshot to array
const snapshotToArray = (snapshot: any) => {
    const array: any[] = [];
    snapshot.forEach((childSnapshot: any) => {
        const item = childSnapshot.val();
        item.id = childSnapshot.key;
        array.push(item);
    });
    return array;
};

// --- User Profile Service Functions ---

export async function createUserProfile(uid: string, data: Omit<UserProfile, 'id'>): Promise<void> {
  const userRef = ref(db, `users/${uid}`);
  await set(userRef, data);
}

// This function is called on the client, so we don't use unstable_cache here.
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return { id: uid, ...snapshot.val() };
    }
    return null;
}

// This function is called from client components, so it should not be cached.
export async function getUsers(role?: UserRole): Promise<UserProfile[]> {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  if (!snapshot.exists()) {
    return [];
  }
  const allUsers = snapshotToArray(snapshot);
  if (role) {
    return allUsers.filter(user => user.role === role);
  }
  return allUsers;
}


// --- Company Service Functions ---

// Non-cached version for client-side use
export async function getCompanies(userId?: string): Promise<Company[]> {
  const dbRef = ref(db, 'companies');
  
  // If a user ID is provided, it's an admin fetching their own companies.
  if (userId) {
      const q = query(dbRef, orderByChild("createdBy"), equalTo(userId));
      const snapshot = await get(q);
      if (!snapshot.exists()) {
          return [];
      }
      const companies = snapshotToArray(snapshot).map(c => ({...c, logoUrl: c.logoUrl || 'https://placehold.co/100x100.png?text=' + c.name.charAt(0)}));
      return companies.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  // If no user ID, fetch all companies.
  const snapshot = await get(dbRef);

  if (!snapshot.exists()) {
      return [];
  }

  let allCompanies = snapshotToArray(snapshot);
  
  // Add placeholder logo if missing
  allCompanies = allCompanies.map(c => ({...c, logoUrl: c.logoUrl || 'https://placehold.co/100x100.png?text=' + c.name.charAt(0)}));
  
  return allCompanies.sort((a, b) => a.name.localeCompare(b.name));
}

// Cached version for server-side use
export const getCachedCompanies = unstable_cache(
  async () => {
    return getCompanies();
  },
  ['companies'],
  { revalidate: 3600 } // Cache for 1 hour
);

export const getCompanyById = unstable_cache(
    async (companyId: string): Promise<Company | null> => {
        const companyRef = ref(db, `companies/${companyId}`);
        const snapshot = await get(companyRef);
        if (!snapshot.exists()) {
            return null;
        }
        const company = snapshot.val();
        company.id = companyId;
        company.logoUrl = company.logoUrl || `https://placehold.co/100x100.png?text=${company.name.charAt(0)}`;
        return company;
    },
    ['company-by-id'],
    { revalidate: 60 } // Cache for 1 minute
);


export async function addCompany(name: string, userId: string): Promise<Company> {
  const companyData = { 
    name, 
    createdBy: userId,
    logoUrl: `https://placehold.co/100x100.png?text=${name.charAt(0)}`
  };
  const companiesRef = ref(db, 'companies');
  const newCompanyRef = push(companiesRef);
  await set(newCompanyRef, companyData);
  return { id: newCompanyRef.key!, ...companyData };
}

export async function updateCompany(companyId: string, newName: string): Promise<void> {
  const companyRef = ref(db, `companies/${companyId}`);
  await update(companyRef, { name: newName });
}

export async function assignUserToCompany(companyId: string, userId: string | null): Promise<void> {
    const companyRef = ref(db, `companies/${companyId}`);

    // Fetch the current company data to find the previously assigned user
    const companySnap = await get(companyRef);
    if (!companySnap.exists()) {
        throw new Error("Company not found");
    }
    const companyData = companySnap.val();
    const oldUserId = companyData.assignedUserUid;

    const updates: { [key: string]: any } = {};

    // 1. Un-assign from the old user if there was one
    if (oldUserId && oldUserId !== userId) {
        updates[`/users/${oldUserId}/assignedCompanyId`] = null;
    }
    
    // 2. Update the company with the new user ID
    updates[`/companies/${companyId}/assignedUserUid`] = userId;

    // 3. Update the new user's profile with the company ID
    if (userId) {
        updates[`/users/${userId}/assignedCompanyId`] = companyId;
    }

    // Perform all updates atomically
    await update(ref(db), updates);
}


// --- Material Service Functions ---

export async function getMaterials(): Promise<Material[]> {
    const materialsRef = ref(db, 'materials');
    const snapshot = await get(materialsRef);
    if (snapshot.exists()) {
        return snapshotToArray(snapshot).sort((a,b) => a.name.localeCompare(b.name));
    }
    return [];
}

export async function addMaterial(material: Omit<Material, 'id'>): Promise<Material> {
  const materialsRef = ref(db, 'materials');
  const newMaterialRef = push(materialsRef);
  await set(newMaterialRef, material);
  return { id: newMaterialRef.key!, ...material };
}

export async function updateMaterial(material: Material): Promise<void> {
  const { id, ...materialData } = material;
  const materialRef = ref(db, `materials/${id}`);
  await update(materialRef, materialData);
}

export async function deleteMaterial(materialId: string): Promise<void> {
  const materialRef = ref(db, `materials/${materialId}`);
  await remove(materialRef);
}


// --- Waste Log Service Functions ---

export async function getWasteLog(companyId?: string): Promise<WasteEntry[]> {
    const wasteLogRef = ref(db, "wasteLog");
    let q;
    if (companyId) {
      q = query(wasteLogRef, orderByChild("companyId"), equalTo(companyId));
    } else {
      q = wasteLogRef;
    }
    
    const snapshot = await get(q);
    if(snapshot.exists()) {
        const logList = snapshotToArray(snapshot);
        // Dates are stored as ISO strings, convert them back to Date objects
        return logList.map(entry => ({...entry, date: new Date(entry.date)})).sort((a, b) => b.date.getTime() - a.date.getTime());
    }
    return [];
}

export async function addWasteEntry(entry: Omit<WasteEntry, 'id' | 'date'> & { date: Date }): Promise<WasteEntry> {
    const wasteLogRef = ref(db, 'wasteLog');
    const newEntryRef = push(wasteLogRef);
    
    // Store date as ISO string for better querying
    const entryToSave = {
        ...entry,
        date: entry.date.toISOString(),
    };
    
    await set(newEntryRef, entryToSave);
    
    return { 
        id: newEntryRef.key!, 
        ...entry
    };
}

// --- Disposal Event Service Functions ---

export async function getDisposalEvents(companyId?: string): Promise<DisposalEvent[]> {
    const eventsRef = ref(db, 'disposalEvents');
    let q;
    if (companyId) {
        q = query(eventsRef, orderByChild("companyId"), equalTo(companyId));
    } else {
        q = eventsRef;
    }
    
    const snapshot = await get(q);
    if (snapshot.exists()) {
      const eventList = snapshotToArray(snapshot);
      // Dates are stored as ISO strings, convert them back to Date objects
      return eventList.map(event => ({ ...event, date: new Date(event.date) })).sort((a,b) => b.date.getTime() - a.date.getTime());
    }
    return [];
}

export async function addDisposalEvent(event: Omit<DisposalEvent, 'id'>): Promise<DisposalEvent> {
    const eventsRef = ref(db, 'disposalEvents');
    const newEventRef = push(eventsRef);
    
    // Store date as ISO string
    const eventToSave = {
        ...event,
        date: event.date.toISOString(),
    };
    
    await set(newEventRef, eventToSave);
    
    return { id: newEventRef.key!, ...event };
}


// --- Mocked Data for Reports and Chart (can be migrated to Cloud Functions later) ---

export const getWeeklyReportData = unstable_cache(
  async () => {
    return new Promise<Record<string, ReportData>>((resolve) => {
      setTimeout(() => {
        resolve(weeklyReportData);
      }, 300);
    });
  },
  ['weekly-reports'],
  { revalidate: 10 }
);


export const getMonthlyReportData = unstable_cache(
  async () => {
    return new Promise<Record<string, ReportData>>((resolve) => {
      setTimeout(() => {
        resolve(monthlyReportData);
      }, 300);
    });
  },
  ['monthly-reports'],
  { revalidate: 10 }
);


export async function getWasteChartData() {
    return new Promise<Record<string, any[]>>((resolve) => {
      setTimeout(() => {
        resolve(wasteData);
      }, 300);
    });
}
