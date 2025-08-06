
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
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { wasteData, weeklyReportData, monthlyReportData } from "@/lib/data";
import type { WasteEntry, Material, DisposalEvent, ReportData, Company, UserRole, UserProfile, PlanType } from "@/lib/types";

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
  await set(userRef, { ...data, plan: 'Free' });
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
  const allUsers: UserProfile[] = snapshotToArray(snapshot);
  
  if (role) {
    return allUsers.filter(user => user.role === role);
  }
  
  return allUsers;
}

export async function updateUserPlan(userId: string, plan: PlanType): Promise<void> {
  const userRef = ref(db, `users/${userId}`);
  await update(userRef, { plan });
}


// --- Company Service Functions ---

export async function getCompanies(userId?: string): Promise<Company[]> {
  const dbRef = ref(db, 'companies');
  // Removed the query to avoid index error. Filtering will be done client-side.
  const snapshot = await get(dbRef);

  if (!snapshot.exists()) {
    return [];
  }
  
  let allCompanies: Company[] = snapshotToArray(snapshot);

  // Filter by userId if it's provided
  if (userId) {
    allCompanies = allCompanies.filter(company => company.createdBy === userId);
  }

  const companiesWithDefaults = allCompanies.map(c => ({
    ...c,
    logoUrl: c.logoUrl || `https://placehold.co/100x100.png?text=${c.name.charAt(0)}`
  }));
  
  return companiesWithDefaults.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCompanyById(companyId: string): Promise<Company | null> {
    if (!companyId) return null;
    const companyRef = ref(db, `companies/${companyId}`);
    const snapshot = await get(companyRef);
    if (!snapshot.exists()) {
        return null;
    }
    const company = snapshot.val();
    company.id = companyId;
    company.logoUrl = company.logoUrl || `https://placehold.co/100x100.png?text=${company.name.charAt(0)}`;
    return company;
}


export async function addCompany(name: string, userId: string, assignedUserId?: string): Promise<Company> {
  const companyData = { 
    name, 
    createdBy: userId,
    assignedUserUid: assignedUserId,
    logoUrl: `https://placehold.co/100x100.png?text=${name.charAt(0)}`,
    coverImageUrl: 'https://space.gov.ae/app_themes/lg21016/images/Sustainability%20Development%20Goals.png',
    plan: 'Free'
  };
  const companiesRef = ref(db, 'companies');
  const newCompanyRef = push(companiesRef);
  await set(newCompanyRef, companyData);
  return { id: newCompanyRef.key!, ...companyData };
}

export async function updateCompany(companyId: string, data: { name: string; plan: PlanType }): Promise<void> {
    const companyRef = ref(db, `companies/${companyId}`);
    await update(companyRef, data);
}

export async function updateCompanyCoverImage(companyId: string, imageUrl: string): Promise<void> {
  const companyRef = ref(db, `companies/${companyId}`);
  await update(companyRef, { coverImageUrl: imageUrl });
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

export async function addMaterial(material: Omit<Material, 'id'>, userId: string): Promise<Material> {
  const materialsRef = ref(db, 'materials');
  const newMaterialRef = push(materialsRef);
  await set(newMaterialRef, {...material, createdBy: userId });
  return { id: newMaterialRef.key!, ...material };
}

export async function updateMaterial(material: Material, userId: string): Promise<void> {
  const { id, ...materialData } = material;
  const materialRef = ref(db, `materials/${id}`);
  await update(materialRef, {...materialData, updatedBy: userId });
}

export async function deleteMaterial(materialId: string, userId: string): Promise<void> {
  // Optional: Add a check to ensure the user has permission to delete.
  // For now, we just log who deleted it, but this isn't secure.
  const materialRef = ref(db, `materials/${materialId}`);
  // Instead of deleting, you could also mark as deleted
  // await update(materialRef, { deleted: true, deletedBy: userId });
  await remove(materialRef);
}


// --- Waste Log Service Functions ---

export async function getWasteLog(companyId?: string): Promise<WasteEntry[]> {
    const baseRef = ref(db, "wasteLog");
    // Firebase query is removed to avoid needing an index. Filtering is done client-side.
    const snapshot = await get(baseRef);
    
    if(snapshot.exists()) {
        let logList = snapshotToArray(snapshot);
        // Dates are stored as ISO strings, convert them back to Date objects
        const processedLog = logList.map(entry => ({...entry, date: new Date(entry.date)}));
        
        // Filter on the client-side if companyId is provided
        const filteredLog = companyId 
            ? processedLog.filter(entry => entry.companyId === companyId)
            : processedLog;
        
        return filteredLog.sort((a, b) => b.date.getTime() - a.date.getTime());
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
    const baseRef = ref(db, 'disposalEvents');
    const snapshot = await get(baseRef);

    if (snapshot.exists()) {
      let eventList = snapshotToArray(snapshot);
      
      // Dates are stored as ISO strings, convert them back to Date objects
      const processedEvents = eventList.map(event => ({ ...event, date: new Date(event.date) }));

      const filteredEvents = companyId 
        ? processedEvents.filter(event => event.companyId === companyId)
        : processedEvents;
      
      return filteredEvents.sort((a,b) => b.date.getTime() - a.date.getTime());
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

export async function getWeeklyReportData(): Promise<Record<string, ReportData>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(weeklyReportData);
    }, 300);
  });
}

export async function getMonthlyReportData(): Promise<Record<string, ReportData>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(monthlyReportData);
    }, 300);
  });
}

export async function getWasteChartData() {
    return new Promise<Record<string, any[]>>((resolve) => {
      setTimeout(() => {
        resolve(wasteData);
      }, 300);
    });
}


// --- File Upload Service ---
export async function uploadFile(file: File, path: string): Promise<string> {
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
}
