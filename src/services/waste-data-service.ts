
// IMPORTANT: This service now uses Firestore.
// You will need to set up Firestore in your Firebase project and
// create collections named 'materials', 'wasteLog', and 'disposalEvents'.
// The initial data from `src/lib/data.ts` can be used to populate these collections.
// For example, each object in the `materials` array in `data.ts` should be a document in the 'materials' collection.
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { wasteData, weeklyReportData, monthlyReportData } from "@/lib/data";
import type { WasteEntry, Material, DisposalEvent, ReportData, Company } from "@/lib/types";

// --- Company Service Functions ---

export async function getCompanies(companyId?: string): Promise<Company[]> {
  const companiesCol = collection(db, "companies");
  let q;
  if (companyId) {
    // A client should only fetch their own company information
    q = query(companiesCol, where('__name__', '==', companyId));
  } else {
    // An admin fetches all companies
    q = query(companiesCol, orderBy("name", "asc"));
  }
  const companySnapshot = await getDocs(q);
  const companyList = companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
  return companyList;
}


export async function addCompany(name: string): Promise<Company> {
  const companyData = { name };
  const companiesCol = collection(db, "companies");
  const docRef = await addDoc(companiesCol, companyData);
  return { id: docRef.id, ...companyData };
}

// --- Material Service Functions ---

export async function getMaterials(): Promise<Material[]> {
  const materialsCol = collection(db, "materials");
  const q = query(materialsCol, orderBy("name", "asc"));
  const materialSnapshot = await getDocs(q);
  const materialsList = materialSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material));
  return materialsList;
}

export async function addMaterial(material: Omit<Material, 'id'>): Promise<Material> {
  const materialsCol = collection(db, "materials");
  const docRef = await addDoc(materialsCol, material);
  return { id: docRef.id, ...material };
}

export async function updateMaterial(material: Material): Promise<void> {
  const materialDoc = doc(db, "materials", material.id);
  const { id, ...materialData } = material;
  await updateDoc(materialDoc, materialData);
}

export async function deleteMaterial(materialId: string): Promise<void> {
  const materialDoc = doc(db, "materials", materialId);
  await deleteDoc(materialDoc);
}


// --- Waste Log Service Functions ---

export async function getWasteLog(companyId?: string): Promise<WasteEntry[]> {
  const wasteLogCol = collection(db, "wasteLog");
  let q;
  if (companyId) {
    q = query(wasteLogCol, where("companyId", "==", companyId), orderBy("date", "desc"));
  } else {
    q = query(wasteLogCol, orderBy("date", "desc"));
  }
  
  const wasteLogSnapshot = await getDocs(q);
  const wasteLogList = wasteLogSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date.toDate(), // Convert Firestore Timestamp to JS Date
    } as WasteEntry;
  });
  return wasteLogList;
}

export async function addWasteEntry(entry: Omit<WasteEntry, 'id' | 'date'> & { date: Date }): Promise<WasteEntry> {
  const wasteLogCol = collection(db, "wasteLog");
  // Firestore handles the timestamp conversion
  const docRef = await addDoc(wasteLogCol, {
      ...entry,
      date: entry.date,
  });

  return { 
      id: docRef.id, 
      ...entry
  };
}

// --- Disposal Event Service Functions ---

export async function getDisposalEvents(companyId?: string): Promise<DisposalEvent[]> {
  const eventsCol = collection(db, "disposalEvents");
  let q;
  if (companyId) {
      q = query(eventsCol, where("companyId", "==", companyId), orderBy("date", "desc"));
  } else {
      q = query(eventsCol, orderBy("date", "desc"));
  }
  
  const eventSnapshot = await getDocs(q);
  const eventList = eventSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date.toDate(),
    } as DisposalEvent;
  });
  return eventList;
}

export async function addDisposalEvent(event: Omit<DisposalEvent, 'id'>): Promise<DisposalEvent> {
    const eventsCol = collection(db, "disposalEvents");
    const docRef = await addDoc(eventsCol, event);
    return { id: docRef.id, ...event };
}


// --- Mocked Data for Reports and Chart (can be migrated to Firestore Cloud Functions later) ---

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
