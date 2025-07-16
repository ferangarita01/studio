
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

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = ref(db, `users/${uid}`);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    return { id: uid, ...snapshot.val() };
  }
  return null;
}

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

export async function getCompanies(userId?: string): Promise<Company[]> {
    const dbRef = ref(db, 'companies');
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) {
        return [];
    }

    let allCompanies = snapshotToArray(snapshot);

    if (userId) {
        // Filter in code instead of a Firebase query to avoid needing a DB index.
        allCompanies = allCompanies.filter(company => company.createdBy === userId);
    }
    
    return allCompanies.sort((a, b) => a.name.localeCompare(b.name));
}


export async function addCompany(name: string, userId: string): Promise<Company> {
  const companyData = { name, createdBy: userId };
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

export async function getWeeklyReportData(companyId?: string): Promise<Record<string, ReportData>> {
     return new Promise((resolve) => {
        setTimeout(() => {
            if (companyId) {
                resolve({ [companyId]: weeklyReportData[companyId] });
            } else {
                resolve(weeklyReportData);
            }
        }, 300);
    });
}

export async function getMonthlyReportData(companyId?: string): Promise<Record<string, ReportData>> {
    return new Promise((resolve) => {
        setTimeout(() => {
             if (companyId) {
                resolve({ [companyId]: monthlyReportData[companyId] });
            } else {
                resolve(monthlyReportData);
            }
        }, 300);
    });
}

export async function getWasteChartData(companyId?: string): Promise<Record<string, any[]>> {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (companyId) {
                resolve({ [companyId]: wasteData[companyId] });
            } else {
                resolve(wasteData);
            }
        }, 300);
    });
}
