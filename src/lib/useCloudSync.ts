import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../store';

export function useCloudSync<T>(docId: string, initialState: T) {
  const { user } = useAuth();
  const [data, setData] = useState<T>(initialState);
  const [isSyncing, setIsSyncing] = useState(true);
  const isLocalUpdate = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Read from DB & Subscribe to changes
  useEffect(() => {
    if (!user || !docId) {
      setIsSyncing(false);
      return;
    }
    
    setIsSyncing(true);
    const docRef = doc(db, 'users', user.id, 'planner_data', docId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        if (!isLocalUpdate.current) {
           try {
             const serverData = JSON.parse(docSnap.data().payload);
             setData(serverData);
           } catch (e) {
             console.error("JSON parse error from Firestore:", e);
           }
        }
        isLocalUpdate.current = false;
      }
      setIsSyncing(false);
    }, (err) => {
      console.error("Firestore Sync Error:", err);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, [user, docId]);

  // Write to DB
  const updateData = useCallback((newData: T | ((prev: T) => T)) => {
    if (!user || !docId) return;
    
    setData((prev) => {
      const resolvedData = typeof newData === 'function' ? (newData as any)(prev) : newData;
      
      // Mark as local to avoid overwriting cursor on echo back
      isLocalUpdate.current = true;
      
      // Debounce writing to prevent hitting quota and DB spam
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        const docRef = doc(db, 'users', user.id, 'planner_data', docId);
        try {
          await setDoc(docRef, {
            ownerId: user.id,
            payload: JSON.stringify(resolvedData),
            updatedAt: serverTimestamp()
          }, { merge: true });
        } catch (err) {
           console.error("Firestore Save Error:", err);
        }
      }, 700); // 700ms debounce
      
      return resolvedData;
    });
  }, [user, docId]);

  return [data, updateData, isSyncing] as const;
}
