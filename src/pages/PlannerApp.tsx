import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth, usePurchases, PRODUCTS } from '../store';
import ADHDPlanner from './planners/ADHDPlanner';
import WellnessPlanner from './planners/WellnessPlanner';
import BizOSPlanner from './planners/BizOSPlanner';
import StudentPlanner from './planners/StudentPlanner';
import FitnessPlanner from './planners/FitnessPlanner';
import CreativePlanner from './planners/CreativePlanner';

type PlannerComponent = React.ComponentType<{ plannerId: string; userId: string }>;

const PLANNERS: Record<string, PlannerComponent> = {
  'adhd-planner-2026': ADHDPlanner,
  'it-girl-wellness': WellnessPlanner,
  'small-business-os': BizOSPlanner,
  'student-academic-os': StudentPlanner,
  'fitness-body-goals': FitnessPlanner,
  'creative-studio-os': CreativePlanner,
};

export default function PlannerApp() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { purchasedIds } = usePurchases();

  if (!user) return <Navigate to="/login" replace />;
  if (!id || !purchasedIds.includes(id)) return <Navigate to="/dashboard" replace />;

  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return <Navigate to="/dashboard" replace />;

  const PlannerComponent = PLANNERS[id];

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <aside className="w-64 border-r border-line bg-sidebar p-6 flex flex-col shrink-0">
        <div className="mb-8">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent mb-4">My Library</h3>
          <ul className="space-y-2">
            <li className="flex items-center p-3 bg-white rounded-lg border border-line text-sm font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent mr-3 shrink-0"></span>
              <span className="truncate">{product.name}</span>
            </li>
            <li>
              <Link to="/dashboard" className="flex items-center p-2 text-sm opacity-60 hover:opacity-100 transition-all w-full">
                <span className="w-2 h-2 rounded-full border border-line mr-3 shrink-0"></span>
                Back to dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div className="mt-auto">
          <div className="p-4 bg-accent text-white rounded-xl">
            <p className="text-xs font-serif italic mb-1">Expand your toolkit</p>
            <h4 className="text-sm font-bold leading-tight mb-3">Browse all planners</h4>
            <Link to="/" className="block w-full py-2 bg-white text-accent rounded text-[10px] font-bold uppercase tracking-wider text-center hover:bg-sidebar transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="flex-1 p-10 flex flex-col items-center bg-canvas h-full overflow-hidden">
        <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl h-full flex overflow-hidden border border-white/20">
          {PlannerComponent ? (
            <PlannerComponent plannerId={id} userId={user.id} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="opacity-50 text-sm">Planner not available.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
