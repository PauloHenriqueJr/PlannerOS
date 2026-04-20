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
    description: 'Designed for focus & quick wins. Brain Dump, micro-habit trackers & dopamine rewards.',
    price: 29.90,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
    tag: 'Bestseller'
  },
  {
    id: 'it-girl-wellness',
    name: 'Wellness "IT GIRL" Aesthetic',
    description: 'Minimalist & beige aesthetic. Skincare routine, mood tracker, and self-care rituals.',
    price: 34.90,
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80',
    tag: 'Trending'
  },
  {
    id: 'small-business-os',
    name: 'Small Biz Complete OS',
    description: 'Manage your sales pipeline, CRM contacts, projects, and revenue goals in one clean dashboard.',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    tag: 'Pro'
  },
  {
    id: 'student-academic-os',
    name: 'Student Academic OS',
    description: 'Track assignments, study sessions, grades, and exam prep with a clean academic dashboard.',
    price: 24.90,
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    tag: 'New'
  },
  {
    id: 'fitness-body-goals',
    name: 'Fitness & Body Goals',
    description: 'Log workouts, track macros, measurements, and build lasting fitness habits.',
    price: 29.90,
    image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=600&q=80',
    tag: 'Popular'
  },
  {
    id: 'creative-studio-os',
    name: 'Creative Studio OS',
    description: 'Content calendar, client project tracker, ideas board and freelance revenue log.',
    price: 39.90,
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
    tag: 'Creator'
  }
];

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface PurchasesContextType {
  purchasedIds: string[];
  buyPlanner: (id: string) => void;
}

const PurchasesContext = createContext<PurchasesContextType>({} as PurchasesContextType);

function emailToId(email: string): string {
  return 'u_' + email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

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
      if (savedPurchases) setPurchasedIds(JSON.parse(savedPurchases));
    }
    setIsLoaded(true);
  }, []);

  // In production: replace with real API call to verify credentials
  const login = (email: string, password: string): boolean => {
    if (!password || password.length < 6) return false;
    const userId = emailToId(email);
    const storedPassword = localStorage.getItem(`pwd_${userId}`);
    if (storedPassword && storedPassword !== password) return false;
    if (!storedPassword) localStorage.setItem(`pwd_${userId}`, password);

    const newUser = { id: userId, name: email.split('@')[0], email };
    setUser(newUser);
    localStorage.setItem('planner_user', JSON.stringify(newUser));
    const savedPurchases = localStorage.getItem(`purchases_${userId}`);
    setPurchasedIds(savedPurchases ? JSON.parse(savedPurchases) : []);
    return true;
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

  if (!isLoaded) return null;

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
