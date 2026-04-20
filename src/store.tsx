import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PlannerProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tag: string;
}

export const PRODUCTS: PlannerProduct[] = [
  {
    id: 'adhd-planner-2026',
    name: 'ADHD Dopamine Planner',
    description: 'Designed for focus & quick wins. Includes Brain Dump & micro-habit trackers.',
    price: 29.90,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
    tag: 'Bestseller'
  },
  {
    id: 'it-girl-wellness',
    name: 'Wellness "IT GIRL" Aesthetic',
    description: 'Minimalist & beige aesthetic. Skincare, mood tracking, and routines.',
    price: 34.90,
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
    tag: 'Trending'
  },
  {
    id: 'undated-digital-planner',
    name: 'Undated Digital Agenda',
    description: 'The classic iPad planner experience. Monthly calendars, hourly schedules, and daily priorities. Use it year after year.',
    price: 24.90,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    tag: 'Classic'
  },
  {
    id: 'small-business-os',
    name: 'Small Biz Complete OS',
    description: 'Manage sales, CRM, and inventory in a clean dashboard.',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    tag: 'Pro'
  },
  {
    id: 'meal-prep-weekly',
    name: 'Weekly Meal Prep Hub',
    description: 'Plan your meals visually. Generate shopping lists and save recipes effortlessly.',
    price: 19.90,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=600&q=80',
    tag: 'New'
  },
  {
    id: 'weight-loss-tracker',
    name: 'Body & Fitness Tracker',
    description: 'Track your wellness journey. Monitor weight, body measurements, and celebrate milestones.',
    price: 14.90,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=600&q=80',
    tag: 'Fitness'
  }
];

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface PurchasesContextType {
  purchasedIds: string[];
  buyPlanner: (id: string) => void;
}

const PurchasesContext = createContext<PurchasesContextType>({} as PurchasesContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('planner_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      const savedPurchases = localStorage.getItem(`purchases_${parsedUser.id}`);
      if (savedPurchases) {
        setPurchasedIds(JSON.parse(savedPurchases));
      }
    }
    setIsLoaded(true);
  }, []);

  const login = (email: string) => {
    const newUser = { id: 'u1', name: email.split('@')[0], email };
    setUser(newUser);
    localStorage.setItem('planner_user', JSON.stringify(newUser));
    
    // Load purchases for this user
    const savedPurchases = localStorage.getItem(`purchases_${newUser.id}`);
    if (savedPurchases) {
      setPurchasedIds(JSON.parse(savedPurchases));
    } else {
      setPurchasedIds([]); // Reset for new user
    }
  };

  const logout = () => {
    setUser(null);
    setPurchasedIds([]);
    localStorage.removeItem('planner_user');
  };

  const buyPlanner = (plannerId: string) => {
    if (!user) return;
    const updated = [...purchasedIds, plannerId];
    setPurchasedIds(updated);
    localStorage.setItem(`purchases_${user.id}`, JSON.stringify(updated));
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
        <PurchasesContext.Provider value={{ purchasedIds, buyPlanner }}>
            {children}
        </PurchasesContext.Provider>
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export const usePurchases = () => useContext(PurchasesContext);
