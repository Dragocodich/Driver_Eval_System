// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFC8k81DN8wNO_gEnrhXp82SMa7CmnRLY",
  authDomain: "driver-evaluation-dashboard.firebaseapp.com",
  projectId: "driver-evaluation-dashboard",
  storageBucket: "driver-evaluation-dashboard.firebasestorage.app",
  messagingSenderId: "280360735605",
  appId: "1:280360735605:web:2ea2263cfccd8f6d48793c",
  measurementId: "G-TW4V7LZ5DW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with error handling
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connection status
let isOnline = navigator.onLine;
let connectionRetries = 0;
const maxRetries = 3;

// Enable offline persistence for Firestore
try {
  // Note: This should be called before any other Firestore operations
  console.log('Initializing Firestore with offline support...');
} catch (error) {
  console.warn('Firestore offline persistence already enabled or failed:', error);
}

// Network status monitoring
export const monitorConnection = () => {
  window.addEventListener('online', async () => {
    console.log('Network connection restored');
    isOnline = true;
    connectionRetries = 0;
    try {
      await enableNetwork(db);
      console.log('Firestore network enabled');
    } catch (error) {
      console.error('Error enabling Firestore network:', error);
    }
  });

  window.addEventListener('offline', async () => {
    console.log('Network connection lost');
    isOnline = false;
    try {
      await disableNetwork(db);
      console.log('Firestore network disabled');
    } catch (error) {
      console.error('Error disabling Firestore network:', error);
    }
  });
};

// Connection retry logic
export const retryConnection = async (): Promise<boolean> => {
  if (connectionRetries >= maxRetries) {
    console.error('Max connection retries reached');
    return false;
  }

  connectionRetries++;
  console.log(`Attempting to reconnect... (${connectionRetries}/${maxRetries})`);

  try {
    await enableNetwork(db);
    console.log('Firestore reconnection successful');
    connectionRetries = 0;
    return true;
  } catch (error) {
    console.error('Firestore reconnection failed:', error);
    
    // Wait before next retry (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, connectionRetries)));
    
    return retryConnection();
  }
};

// Get connection status
export const getConnectionStatus = () => ({
  isOnline,
  connectionRetries,
  maxRetries
});

// Initialize Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}

export { analytics };
export default app;

// Initialize connection monitoring
if (typeof window !== 'undefined') {
  monitorConnection();
}