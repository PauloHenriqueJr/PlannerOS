import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth, usePurchases, PRODUCTS } from '../store';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';

type Tab = 'today' | 'braindump' | 'habits';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function PlannerApp() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { purchasedIds } = usePurchases();
  
  const [activeTab, setActiveTab] = useState<Tab>('today');
  
  if (!user) return <Navigate to="/login" replace />;
  if (!id || !purchasedIds.includes(id)) return <Navigate to="/dashboard" replace />;

  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex flex-col md:flex-row h-full w-full">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-line bg-white shrink-0 shadow-sm z-10">
        <Link to="/dashboard" className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1">
          &larr; Back
        </Link>
        <span className="font-serif italic font-bold text-sm truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Sidebar Navigator */}
      <aside className="hidden md:flex w-64 border-r border-line bg-sidebar p-6 flex-col shrink-0 overflow-y-auto">
        <div className="mb-8">
          <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent mb-4">My Dashboard</h3>
          <ul className="space-y-3">
            <li className="flex items-center p-2 bg-white rounded-lg border border-line text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-accent mr-3 shrink-0"></span>
              <span className="truncate">{product.name}</span>
            </li>
            <li className="flex items-center p-2 text-sm opacity-60 hover:opacity-100 transition-all cursor-pointer">
               <Link to="/dashboard" className="flex items-center w-full">
                 <span className="w-2 h-2 rounded-full border border-line mr-3 shrink-0"></span>
                 Back to library
               </Link>
            </li>
          </ul>
        </div>

        <div className="mt-auto pt-10 lg:pt-48">
          <div className="p-4 bg-accent text-white rounded-xl">
            <p className="text-xs font-serif italic mb-2">Limited Pack</p>
            <h4 className="text-sm font-bold leading-tight mb-3">Summer Wellness Bundle 2026</h4>
            <Link to="/" className="w-full py-2 bg-white text-accent rounded text-[10px] font-bold uppercase tracking-wider block text-center transition-opacity hover:opacity-90">Shop Now</Link>
          </div>
        </div>
      </aside>

      {/* Main Planner Canvas */}
      <main className="flex-1 p-0 sm:p-6 md:p-10 flex flex-col items-center bg-canvas h-[calc(100vh-3.5rem)] md:h-full overflow-hidden">
        <div className="w-full max-w-4xl bg-white sm:rounded-xl md:rounded-[2rem] shadow-xl md:shadow-2xl h-full flex flex-col md:flex-row overflow-hidden border border-white/20">
          
          {/* Tabs Side */}
          <div className="w-full md:w-12 bg-tab flex flex-row md:flex-col pt-0 md:pt-12 space-y-0 md:space-y-4 shrink-0 overflow-x-auto overflow-y-hidden border-b md:border-b-0 border-line/20">
            <button 
              onClick={() => setActiveTab('today')}
              className={cn(
                "flex-1 md:flex-none h-12 md:h-20 w-auto md:w-12 md:rounded-l-md md:-mr-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter transition-all px-4 md:px-0 md:[writing-mode:vertical-lr]",
                activeTab === 'today' ? "bg-white text-ink border-b-2 md:border-b-0 border-accent md:border-transparent" : "opacity-60 text-ink/80 hover:bg-white/50"
              )}
            >
              Focus
            </button>
            <button 
              onClick={() => setActiveTab('braindump')}
              className={cn(
                "flex-1 md:flex-none h-12 md:h-32 w-auto md:w-12 md:rounded-l-md md:-mr-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter transition-all px-4 md:px-0 md:[writing-mode:vertical-lr]",
                activeTab === 'braindump' ? "bg-white text-ink border-b-2 md:border-b-0 border-accent md:border-transparent" : "opacity-60 text-ink/80 hover:bg-white/50"
              )}
            >
              Braindump
            </button>
            <button 
              onClick={() => setActiveTab('habits')}
              className={cn(
                "flex-1 md:flex-none h-12 md:h-24 w-auto md:w-12 md:rounded-l-md md:-mr-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-tighter transition-all px-4 md:px-0 md:[writing-mode:vertical-lr]",
                activeTab === 'habits' ? "bg-white text-ink border-b-2 md:border-b-0 border-accent md:border-transparent" : "opacity-60 text-ink/80 hover:bg-white/50"
              )}
            >
              Habits
            </button>
          </div>

          <div className="flex-1 p-4 sm:p-8 md:p-12 overflow-auto relative flex flex-col h-full">
            {activeTab === 'today' && <TodayView plannerId={id} userId={user.id} />}
            {activeTab === 'braindump' && <BrainDumpView plannerId={id} userId={user.id} />}
            {activeTab === 'habits' && <HabitsView plannerId={id} userId={user.id} />}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Views ---

function TodayView({ plannerId, userId }: { plannerId: string, userId: string }) {
  const dateKey = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `tasks_${userId}_${plannerId}_${dateKey}`;
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [
      { id: '1', text: 'Refine the Small Business OS dashboard', completed: false },
      { id: '2', text: 'Export Canva hyperlinked PDF for testing', completed: true },
      { id: '3', text: 'Check Hotmart market stats for April', completed: false },
    ];
  });
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, storageKey]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: uuidv4(), text: newTask.trim(), completed: false }]);
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 md:mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">Today's Focus</h1>
          <p className="text-xs md:text-sm opacity-50">{format(new Date(), 'EEEE, MMMM do')} • Mindfulness & Momentum</p>
        </div>
        <div className="flex space-x-2">
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-line flex items-center justify-center text-xs md:text-sm font-serif italic hover:bg-sidebar transition-colors">W</button>
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-line flex items-center justify-center text-xs md:text-sm hover:bg-sidebar transition-colors opacity-50">...</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        {/* Column 1 */}
        <div className="space-y-8">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">Quick Add</label>
            <form onSubmit={addTask} className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What is the next right step?"
                className="flex-1 w-full border-b border-line bg-transparent pb-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors placeholder:opacity-40"
              />
              <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">
                Add
              </button>
            </form>
          </div>
          
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">Dopamine Trackers</label>
            <div className="flex space-x-4">
              <div className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center text-xs font-bold text-ink">
                {completedCount}/{tasks.length}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-[11px] font-medium mb-1 uppercase tracking-widest text-ink">Quick Wins</div>
                <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                  <div 
                    className="h-1.5 bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">Main Focus Points</label>
          <ul className="space-y-4">
            {tasks.length === 0 ? (
               <li className="text-sm opacity-50 italic">No tasks for today.</li>
            ) : (
              tasks.map(task => (
                <li key={task.id} className="flex items-center space-x-4 pb-4 border-b border-canvas group">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "w-5 h-5 rounded border-2 border-accent flex-shrink-0 transition-colors focus:outline-none",
                      task.completed ? "bg-accent" : "bg-transparent"
                    )}
                  />
                  <span className={cn(
                    "text-sm flex-1 transition-all",
                    task.completed ? "line-through opacity-40" : "text-ink"
                  )}>
                    {task.text}
                  </span>
                  <button 
                     onClick={() => removeTask(task.id)}
                     className="text-[10px] uppercase tracking-widest font-bold text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Del
                  </button>
                </li>
              ))
            )}
          </ul>

          <div className="mt-12 p-6 bg-sidebar rounded-2xl border border-dashed border-accent/30">
            <h5 className="text-sm font-serif italic mb-2 text-ink">Daily Reflection</h5>
            <p className="text-xs opacity-50 italic">"One small victory is still a victory. Celebrate the progress made today."</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrainDumpView({ plannerId, userId }: { plannerId: string, userId: string }) {
  const storageKey = `braindump_${userId}_${plannerId}`;
  const [content, setContent] = useState(() => localStorage.getItem(storageKey) || "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(storageKey, content);
    }, 500);
    return () => clearTimeout(timeout);
  }, [content, storageKey]);

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6 md:mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">Brain Dump Area</h1>
          <p className="text-xs md:text-sm opacity-50">Clear the mind to focus on the next right step.</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col pb-4 md:pb-8 min-h-[300px]">
        <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-2 md:mb-3">Workspace</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing here..."
          className="flex-1 w-full border border-line bg-sidebar rounded-lg p-4 md:p-6 text-sm font-serif leading-relaxed text-ink focus:outline-none focus:border-accent transition-colors resize-none shadow-inner"
        />
      </div>
    </div>
  );
}

function HabitsView({ plannerId, userId }: { plannerId: string, userId: string }) {
  const storageKey = `habits_${userId}_${plannerId}`;
  
  const [habits, setHabits] = useState<{ id: string; name: string; days: Record<string, boolean> }[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [
      { id: 'h1', name: 'Drink Water', days: {} },
      { id: 'h2', name: 'Read 10 pages', days: {} }
    ];
  });
  
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(habits));
  }, [habits, storageKey]);

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setHabits([...habits, { id: uuidv4(), name: newHabit.trim(), days: {} }]);
    setNewHabit("");
  };

  const removeHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const toggleDay = (habitId: string, dayPrefix: string) => {
    setHabits(habits.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          days: {
            ...h.days,
            [dayPrefix]: !h.days[dayPrefix]
          }
        };
      }
      return h;
    }));
  };

  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6 md:mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">Habit Tracker</h1>
          <p className="text-xs md:text-sm opacity-50">Build momentum with daily actions.</p>
        </div>
      </div>

      <div className="mb-8 md:mb-10 overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse min-w-[400px] md:min-w-[500px]">
          <thead>
            <tr>
              <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-accent w-1/3">Dopamine Trackers</th>
              {last7Days.map(date => (
                <th key={date.toISOString()} className="pb-4 text-center">
                  <div className="text-[10px] uppercase font-bold opacity-40 mb-1">{format(date, 'EEE')}</div>
                  <div className="font-serif italic text-sm">{format(date, 'd')}</div>
                </th>
              ))}
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody>
            {habits.map(habit => (
              <tr key={habit.id} className="border-t border-line group">
                <td className="py-4 text-sm font-medium">{habit.name}</td>
                {last7Days.map(date => {
                  const dayKey = format(date, 'yyyy-MM-dd');
                  const isDone = habit.days[dayKey];
                  return (
                    <td key={dayKey} className="py-4 text-center">
                      <button 
                        onClick={() => toggleDay(habit.id, dayKey)}
                        className={cn(
                          "w-5 h-5 rounded border-2 border-accent flex items-center justify-center mx-auto transition-colors focus:outline-none",
                          isDone 
                            ? "bg-accent" 
                            : "bg-transparent hover:bg-canvas"
                        )}
                      />
                    </td>
                  );
                })}
                <td className="py-4 text-right">
                  <button 
                    onClick={() => removeHabit(habit.id)}
                    className="text-[10px] uppercase tracking-widest font-bold text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {habits.length === 0 && (
          <div className="text-center py-8 opacity-50 text-sm font-serif italic border-t border-line">No habits added yet.</div>
        )}
      </div>

      <form onSubmit={addHabit} className="flex gap-2 max-w-sm">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="New habit name..."
          className="flex-1 border-b border-line bg-transparent pb-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors placeholder:opacity-40"
        />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">
          Add
        </button>
      </form>
    </div>
  );
}
