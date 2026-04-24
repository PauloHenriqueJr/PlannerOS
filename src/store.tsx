import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithPopup, 
  onAuthStateChanged,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export interface PlannerProduct {
  id: string;
  nameKey: string;
  descKey: string;
  priceUsd: number;
  priceBrl: number;
  image: string;
  tagKey: string;
  active?: boolean;
  order?: number;
}

export const DEFAULT_PRODUCTS: PlannerProduct[] = [
  {
    id: 'adhd-planner-2026',
    nameKey: 'prod_adhd_name',
    descKey: 'prod_adhd_desc',
    priceUsd: 14.90,
    priceBrl: 47.90,
    image: '/planner-covers/adhd-planner-2026.svg',
    tagKey: 'prod_adhd_tag',
    active: true,
    order: 1,
  },
  {
    id: 'it-girl-wellness',
    nameKey: 'prod_itgirl_name',
    descKey: 'prod_itgirl_desc',
    priceUsd: 12.90,
    priceBrl: 37.90,
    image: '/planner-covers/it-girl-wellness.svg',
    tagKey: 'prod_itgirl_tag',
    active: true,
    order: 2,
  },
  {
    id: 'undated-digital-planner',
    nameKey: 'prod_undated_name',
    descKey: 'prod_undated_desc',
    priceUsd: 14.90,
    priceBrl: 47.90,
    image: '/planner-covers/undated-digital-planner.svg',
    tagKey: 'prod_undated_tag',
    active: true,
    order: 3,
  },
  {
    id: 'small-business-os',
    nameKey: 'prod_smallbiz_name',
    descKey: 'prod_smallbiz_desc',
    priceUsd: 19.90,
    priceBrl: 67.90,
    image: '/planner-covers/small-business-os.svg',
    tagKey: 'prod_smallbiz_tag',
    active: true,
    order: 4,
  },
  {
    id: 'meal-prep-weekly',
    nameKey: 'prod_meal_name',
    descKey: 'prod_meal_desc',
    priceUsd: 9.90,
    priceBrl: 27.90,
    image: '/planner-covers/meal-prep-weekly.svg',
    tagKey: 'prod_meal_tag',
    active: true,
    order: 5,
  },
  {
    id: 'weight-loss-tracker',
    nameKey: 'prod_weight_name',
    descKey: 'prod_weight_desc',
    priceUsd: 9.90,
    priceBrl: 27.90,
    image: '/planner-covers/weight-loss-tracker.svg',
    tagKey: 'prod_weight_tag',
    active: true,
    order: 6,
  },
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
  products: PlannerProduct[];
  isLoadingProducts: boolean;
  buyPlanner: (id: string) => void;
}

const PurchasesContext = createContext<PurchasesContextType>({} as PurchasesContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [products, setProducts] = useState<PlannerProduct[]>(DEFAULT_PRODUCTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Load products from Firestore
  useEffect(() => {
    async function loadProducts() {
      try {
        const q = query(collection(db, 'products'));
        const snapshot = await getDocs(q);
        const productsList = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as PlannerProduct[];
        
        // Manual sort by order field
        const sorted = productsList.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Firestore can override the catalog, but an empty/missing collection should not blank the store.
        const activeProducts = sorted.filter(p => p.active !== false);
        setProducts(activeProducts.length > 0 ? activeProducts : DEFAULT_PRODUCTS);
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts(DEFAULT_PRODUCTS);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

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

        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await fetch('/api/access/sync-hotmart', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (Array.isArray(result.granted) && result.granted.length > 0) {
              setPurchasedIds((current) => Array.from(new Set([...current, ...result.granted])));
            }
          }
        } catch (error) {
          console.warn('Unable to sync pending purchases:', error);
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

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.id);
    return onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      setPurchasedIds(Array.isArray(data.purchasedPlanners) ? data.purchasedPlanners : []);
      setUser((current) => current ? {
        ...current,
        name: data.name || current.name,
        subscriptionStatus: data.subscriptionStatus,
      } : current);
    }, (error) => {
      console.warn('Unable to listen for purchase updates:', error);
    });
  }, [user?.id]);

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

  const buyPlanner = async () => {
    throw new Error('Purchases must be granted by a verified payment webhook.');
  };

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-paper font-serif italic text-2xl text-ink/40">Loading workspace...</div>;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <AuthContext.Provider value={{ user, login, logout, isLoading }}>
          <PurchasesContext.Provider value={{ purchasedIds, products, isLoadingProducts, buyPlanner }}>
              {children}
          </PurchasesContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const usePurchases = () => useContext(PurchasesContext);
export const useTheme = () => useContext(ThemeContext);
