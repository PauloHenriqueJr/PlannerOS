import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithPopup, 
  onAuthStateChanged,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export interface PlannerProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag: string;
}

export const PRODUCTS = [
  {
    id: 'adhd-planner-2026',
    nameKey: 'prod_adhd_name',
    descKey: 'prod_adhd_desc',
    price: 29.90,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
    tagKey: 'prod_adhd_tag'
  },
  {
    id: 'it-girl-wellness',
    nameKey: 'prod_itgirl_name',
    descKey: 'prod_itgirl_desc',
    price: 34.90,
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
    tagKey: 'prod_itgirl_tag'
  },
  {
    id: 'undated-digital-planner',
    nameKey: 'prod_undated_name',
    descKey: 'prod_undated_desc',
    price: 24.90,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    tagKey: 'prod_undated_tag'
  },
  {
    id: 'small-business-os',
    nameKey: 'prod_smallbiz_name',
    descKey: 'prod_smallbiz_desc',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    tagKey: 'prod_smallbiz_tag'
  },
  {
    id: 'meal-prep-weekly',
    nameKey: 'prod_meal_name',
    descKey: 'prod_meal_desc',
    price: 19.90,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
    tagKey: 'prod_meal_tag'
  },
  {
    id: 'weight-loss-tracker',
    nameKey: 'prod_weight_name',
    descKey: 'prod_weight_desc',
    price: 14.90,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
    tagKey: 'prod_weight_tag'
  }
];

interface UserProfile {
  id: string;
  name: string;
  email: string;
  subscriptionStatus?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface PurchasesContextType {
  purchasedIds: string[];
  buyPlanner: (id: string) => void;
}

const PurchasesContext = createContext<PurchasesContextType>({} as PurchasesContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch or create user profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        let profileData: UserProfile;
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          profileData = {
            id: firebaseUser.uid,
            name: data.name || firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            subscriptionStatus: data.subscriptionStatus
          };
          setPurchasedIds(data.purchasedPlanners || []);
        } else {
          // New User Registration
          profileData = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || ''
          };
          await setDoc(userRef, {
            name: profileData.name,
            email: profileData.email,
            createdAt: serverTimestamp(),
            purchasedPlanners: []
          });
          setPurchasedIds([]);
        }
        
        setUser(profileData);
      } else {
        setUser(null);
        setPurchasedIds([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login Failed', error);
    }
  };

  const logout = () => {
    signOut(auth);
  };

  // Temporarily simulate a webhook purchase
  const buyPlanner = async (plannerId: string) => {
    if (!user) return;
    const updated = [...purchasedIds, plannerId];
    setPurchasedIds(updated);
    
    // In production, this is done securely by the Stripe/Kiwify Webhook!
    await setDoc(doc(db, 'users', user.id), { purchasedPlanners: updated }, { merge: true });
  };

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-paper font-serif italic text-2xl text-ink/40">Loading workspace...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
        <PurchasesContext.Provider value={{ purchasedIds, buyPlanner }}>
            {children}
        </PurchasesContext.Provider>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const usePurchases = () => useContext(PurchasesContext);
