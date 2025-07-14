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
  serverTimestamp,
  updateDoc,
  doc,
  deleteDoc,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { wasteData, weeklyReportData, monthlyReportData } from "@/lib/data";
import type { WasteEntry, Material, DisposalEvent, ReportData } from "@/lib/types";

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

export async function getWasteLog(): Promise<WasteEntry[]> {
  const wasteLogCol = collection(db, "wasteLog");
  const q = query(wasteLogCol, orderBy("date", "desc"));
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

export async function getDisposalEvents(): Promise<DisposalEvent[]> {
  const eventsCol = collection(db, "disposalEvents");
  const q = query(eventsCol, orderBy("date", "desc"));
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

export async function getWeeklyReportData(): Promise<Record<string, ReportData>> {
    // Simulate async operation
     return new Promise((resolve) => {
        setTimeout(() => {
            resolve(weeklyReportData);
        }, 300);
    });
}

export async function getMonthlyReportData(): Promise<Record<string, ReportData>> {
    // Simulate async operation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(monthlyReportData);
        }, 300);
    });
}

export async function getWasteChartData(): Promise<Record<string, any[]>> {
    // Simulate async operation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(wasteData);
        }, 300);
    });
}
