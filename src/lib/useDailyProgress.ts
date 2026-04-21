import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../store';

interface SyncedTask {
  completed?: boolean;
}

export function useDailyProgress(plannerId: string | undefined, taskPrefixes: string[]) {
  const { user } = useAuth();
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const dateKey = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  useEffect(() => {
    if (!user || !plannerId || taskPrefixes.length === 0) {
      setTotal(0);
      setCompleted(0);
      return;
    }

    const totalsByDoc = new Map<string, { total: number; completed: number }>();

    const publish = () => {
      const next = Array.from(totalsByDoc.values()).reduce(
        (acc, item) => ({ total: acc.total + item.total, completed: acc.completed + item.completed }),
        { total: 0, completed: 0 }
      );
      setTotal(next.total);
      setCompleted(next.completed);
    };

    const unsubscribes = taskPrefixes.map((prefix) => {
      const docId = `${prefix}_${plannerId}_${dateKey}`;
      const docRef = doc(db, 'users', user.id, 'planner_data', docId);

      return onSnapshot(docRef, (snapshot) => {
        if (!snapshot.exists()) {
          totalsByDoc.set(docId, { total: 0, completed: 0 });
          publish();
          return;
        }

        try {
          const tasks = JSON.parse(snapshot.data().payload || '[]') as SyncedTask[];
          totalsByDoc.set(docId, {
            total: Array.isArray(tasks) ? tasks.length : 0,
            completed: Array.isArray(tasks) ? tasks.filter((task) => task.completed).length : 0,
          });
        } catch (error) {
          console.warn('Unable to parse daily progress payload.', error);
          totalsByDoc.set(docId, { total: 0, completed: 0 });
        }
        publish();
      });
    });

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [dateKey, plannerId, taskPrefixes, user]);

  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percent };
}
