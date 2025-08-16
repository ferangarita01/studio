

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
import type { WasteEntry, Material, DisposalEvent, ReportData, Company, UserRole, UserProfile, PlanType, DisposalCertificate } from "@/lib/types";
import { string } from "zod";

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
        const profileData = snapshot.val();
        const profile: UserProfile = { id: uid, ...profileData };
        return profile;
    }
    return null;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, data);
}

export async function getUsers(role?: UserRole): Promise<UserProfile[]> {
  const usersRef = ref(db, 'users');
  let usersQuery = query(usersRef);

  if (role) {
    // If a role is specified, query for users with that role
    usersQuery = query(usersRef, orderByChild('role'), equalTo(role));
  }
  
  const snapshot = await get(usersQuery);

  if (!snapshot.exists()) {
    return [];
  }

  const users: UserProfile[] = snapshotToArray(snapshot);
  
  return users;
}

export async function updateUserPlan(userId: string, plan: PlanType): Promise<void> {
  const userRef = ref(db, `users/${userId}`);
  await update(userRef, { plan });
}


// --- Company Service Functions ---

export async function getCompanies(userId?: string, isAdmin: boolean = false): Promise<Company[]> {
  const dbRef = ref(db, 'companies');
  let snapshot;

  if (isAdmin) {
    // Admin gets all companies. This requires the rules to allow reads on the parent node.
    snapshot = await get(dbRef);
  } else if (userId) {
    // Client gets only their assigned company.
    const companiesQuery = query(dbRef, orderByChild('assignedUserUid'), equalTo(userId));
    snapshot = await get(companiesQuery);
  } else {
    // If not admin and no userId, there's nothing to fetch based on current rules.
    return [];
  }

  if (!snapshot.exists()) {
    return [];
  }
  
  const allCompanies: Company[] = snapshotToArray(snapshot);
  return allCompanies.sort((a, b) => a.name.localeCompare(b.name));
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
    plan: 'Free' as PlanType,
    planStartDate: undefined,
    planExpiryDate: undefined,
  };
  const companiesRef = ref(db, 'companies');
  const newCompanyRef = push(companiesRef);
  await set(newCompanyRef, companyData);
  return { id: newCompanyRef.key!, ...companyData };
}

export async function updateCompany(companyId: string, data: Partial<Company>): Promise<void> {
    const companyRef = ref(db, `companies/${companyId}`);
    await update(companyRef, data);

    // If the plan is updated, propagate it to the assigned user
    if (data.plan && data.assignedUserUid) {
      const userRef = ref(db, `users/${data.assignedUserUid}`);
      await update(userRef, { plan: data.plan });
    }
}

export async function updateCompanyCoverImage(companyId: string, imageUrl: string): Promise<void> {
  const companyRef = ref(db, `companies/${companyId}`);
  await update(companyRef, { coverImageUrl: imageUrl });
}


export async function assignUserToCompany(companyId: string, userId: string | null): Promise<void> {
    const companyRef = ref(db, `companies/${companyId}`);

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
        updates[`/users/${oldUserId}/plan`] = 'Free';
        updates[`/users/${oldUserId}/assignedCompany`] = null;
    }
    
    // 2. Update the company with the new user ID
    updates[`/companies/${companyId}/assignedUserUid`] = userId;

    // 3. Update the new user's profile with the company ID and plan
    if (userId) {
        // Create a lean version of company data to denormalize
        const companyForUser = {
            id: companyId,
            name: companyData.name,
            logoUrl: companyData.logoUrl || `https://placehold.co/100x100.png?text=${companyData.name.charAt(0)}`,
            coverImageUrl: companyData.coverImageUrl
        }
        updates[`/users/${userId}/assignedCompanyId`] = companyId;
        updates[`/users/${userId}/plan`] = companyData.plan || 'Free';
        updates[`/users/${userId}/assignedCompany`] = companyForUser; // Denormalize
    }

    await update(ref(db), updates);
}

export async function deleteCompany(companyId: string): Promise<void> {
    const updates: { [key: string]: any } = {};

    // 1. Find and mark users assigned to this company for deletion
    const usersRef = ref(db, 'users');
    const usersQuery = query(usersRef, orderByChild('assignedCompanyId'), equalTo(companyId));
    const usersSnapshot = await get(usersQuery);
    if (usersSnapshot.exists()) {
        usersSnapshot.forEach((childSnapshot) => {
            updates[`/users/${childSnapshot.key}`] = null;
        });
    }

    // 2. Find and mark waste logs for this company for deletion
    const wasteLogRef = ref(db, 'wasteLog');
    const wasteLogQuery = query(wasteLogRef, orderByChild('companyId'), equalTo(companyId));
    const wasteLogSnapshot = await get(wasteLogQuery);
    if (wasteLogSnapshot.exists()) {
      wasteLogSnapshot.forEach((childSnapshot) => {
        updates[`/wasteLog/${childSnapshot.key}`] = null;
      });
    }
    
    // 3. Find and mark disposal events for this company for deletion
    const disposalEventsRef = ref(db, 'disposalEvents');
    const disposalEventsQuery = query(disposalEventsRef, orderByChild('companyId'), equalTo(companyId));
    const disposalEventsSnapshot = await get(disposalEventsQuery);
    if (disposalEventsSnapshot.exists()) {
      disposalEventsSnapshot.forEach((childSnapshot) => {
        updates[`/disposalEvents/${childSnapshot.key}`] = null;
      });
    }

    // 4. Mark company itself for deletion
    updates[`/companies/${companyId}`] = null;
    
    // 5. Perform all deletions atomically
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

export async function addWasteEntry(entry: Omit<WasteEntry, 'id'>, userId: string): Promise<WasteEntry> {
    const wasteLogRef = ref(db, 'wasteLog');
    const newEntryRef = push(wasteLogRef);
    
    // Store date as ISO string for better querying
    const entryToSave = {
        ...entry,
        date: entry.date.toISOString(),
        createdBy: userId
    };
    
    await set(newEntryRef, entryToSave);
    
    return { 
        id: newEntryRef.key!, 
        ...entry
    };
}

export async function updateWasteEntry(entry: WasteEntry, userId: string): Promise<void> {
    const { id, ...entryData } = entry;
    const entryRef = ref(db, `wasteLog/${id}`);
    
    const entryToSave = {
        ...entryData,
        date: entry.date.toISOString(), // Ensure date is stored as string
        updatedBy: userId,
    };
    
    await update(entryRef, entryToSave);
}

export async function deleteWasteEntry(entryId: string, userId: string): Promise<void> {
    const entryRef = ref(db, `wasteLog/${entryId}`);
    // You could add logging here to track who deleted it, e.g., by creating another log entry for the deletion.
    await remove(entryRef);
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


// --- Disposal Certificate & Upload Service Functions ---
export async function uploadFile(file: File, path: string): Promise<string> {
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
}

export async function getDisposalCertificates(companyId?: string): Promise<DisposalCertificate[]> {
    const certificatesRef = ref(db, 'disposalCertificates');
    const q = companyId ? query(certificatesRef, orderByChild('companyId'), equalTo(companyId)) : certificatesRef;
    const snapshot = await get(q);
    if (snapshot.exists()) {
        const certs = snapshotToArray(snapshot);
        return certs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    }
    return [];
}

export async function addDisposalCertificate(
  companyId: string,
  fileName: string,
  fileUrl: string,
  userId: string
): Promise<DisposalCertificate> {
  const certificateData = {
    companyId,
    fileName,
    fileUrl,
    uploadedAt: new Date().toISOString(),
    uploadedBy: userId,
  };

  const certificatesRef = ref(db, 'disposalCertificates');
  const newCertificateRef = push(certificatesRef);
  await set(newCertificateRef, certificateData);

  return { id: newCertificateRef.key!, ...certificateData };
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
