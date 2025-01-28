import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC8q580wSDEbSDs4SKLMqjj5PtPHaHgRqw",
  authDomain: "gharsewa-442a2.firebaseapp.com",
  projectId: "gharsewa-442a2",
  storageBucket: "gharsewa-442a2.appspot.com",
  messagingSenderId: "306387121230",
  appId: "1:306387121230:web:c4d7888343d2881c1e7f1f",
  measurementId: "G-6N1H42ZWMZ",
  databaseURL: "https://gharsewa-442a2-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export type ServiceRequest = {
  id: string;
  customer_id: string;
  provider_id: string | null;
  description: string;
  location: string;
  wage: number;
  contactNumber: string;
  status: 'pending' | 'accepted' | 'completed';
  createdAt: number;
  updatedAt: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
};

export { app, auth, db, storage };

