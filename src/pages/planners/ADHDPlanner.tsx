import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../../lib/utils';

type Tab = 'focus' | 'braindump' | 'habits';

interface Task { id: string; text: string; completed: boolean }
interface Habit { id: string; name: string; days: Record<string, boolean> }

const tabs: { id: Tab; label: string; height: string }[] = [
  { id: 'focus', label: 'Focus', height: 'h-20' },
  { id: 'braindump', label: 'Braindump', height: 'h-32' },
  { id: 'habits', label: 'Habits', height: 'h-24' },
];

export default function ADHDPlanner({ plannerId, userId }: { plannerId: string; userId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('focus');

  return (
    <>
      <div className="w-12 bg-tab flex flex-col pt-12 space-y-4 shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              `${t.height} w-12 rounded-l-md -mr-1 flex items-center justify-center [writing-mode:vertical-lr] text-[10px] font-bold uppercase tracking-tighter transition-all`,
              activeTab === t.id ? 'bg-white text-ink' : 'opacity-60 text-ink/80 hover:bg-white/50'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-12 overflow-auto">
        {activeTab === 'focus' && <FocusView plannerId={plannerId} userId={userId} />}
        {activeTab === 'braindump' && <BrainDumpView plannerId={plannerId} userId={userId} />}
        {activeTab === 'habits' && <HabitsView plannerId={plannerId} userId={userId} />}
      </div>
    </>
  );
}

function FocusView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const dateKey = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `tasks_${userId}_${plannerId}_${dateKey}`;

  const [tasks, setTasks] = useState<Task[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: '1', text: 'Pick one important task to start with', completed: false },
      { id: '2', text: 'Take a 5-min brain break between tasks', completed: false },
      { id: '3', text: 'Celebrate every completed item', completed: true },
    ];
  });
  const [newTask, setNewTask] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(tasks)); }, [tasks, storageKey]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: uuidv4(), text: newTask.trim(), completed: false }]);
    setNewTask('');
  };

  const toggle = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const remove = (id: string) => setTasks(tasks.filter(t => t.id !== id));
  const done = tasks.filter(t => t.completed).length;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-serif italic">Today's Focus</h1>
          <p className="text-sm opacity-50">{format(new Date(), 'EEEE, MMMM do')} · Mindfulness & Momentum</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">Quick Add</label>
            <form onSubmit={addTask} className="flex gap-2">
              <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="What is the next right step?" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
              <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
            </form>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">Dopamine Tracker</label>
            <div className="flex space-x-4">
              <div className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center text-xs font-bold">{done}/{tasks.length}</div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-[11px] font-medium mb-1 uppercase tracking-widest">Quick Wins</div>
                <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                  <div className="h-1.5 bg-accent rounded-full transition-all duration-500" style={{ width: `${tasks.length > 0 ? (done / tasks.length) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">Focus Points</label>
          <ul className="space-y-4">
            {tasks.length === 0 ? <li className="text-sm opacity-50 italic">No tasks yet.</li> : tasks.map(task => (
              <li key={task.id} className="flex items-center space-x-4 pb-4 border-b border-canvas group">
                <button onClick={() => toggle(task.id)} className={cn('w-5 h-5 rounded border-2 border-accent flex-shrink-0 transition-colors focus:outline-none', task.completed ? 'bg-accent' : 'bg-transparent')} />
                <span className={cn('text-sm flex-1 transition-all', task.completed ? 'line-through opacity-40' : '')}>{task.text}</span>
                <button onClick={() => remove(task.id)} className="text-[10px] uppercase tracking-widest font-bold text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
              </li>
            ))}
          </ul>
          <div className="mt-10 p-6 bg-sidebar rounded-2xl border border-dashed border-accent/30">
            <h5 className="text-sm font-serif italic mb-2">Daily Reflection</h5>
            <p className="text-xs opacity-50 italic">"One small victory is still a victory. Celebrate every bit of progress."</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrainDumpView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `braindump_${userId}_${plannerId}`;
  const [content, setContent] = useState(() => localStorage.getItem(storageKey) || '');

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(storageKey, content), 500);
    return () => clearTimeout(t);
  }, [content, storageKey]);

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      <div className="mb-8 shrink-0">
        <h1 className="text-4xl font-serif italic">Brain Dump Area</h1>
        <p className="text-sm opacity-50">Clear the mind. Write anything.</p>
      </div>
      <div className="flex-1 flex flex-col pb-8">
        <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">Workspace</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Start writing here…" className="flex-1 w-full border border-line bg-sidebar rounded-xl p-6 text-sm font-serif leading-relaxed focus:outline-none focus:border-accent transition-colors resize-none shadow-inner" />
      </div>
    </div>
  );
}

function HabitsView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `habits_${userId}_${plannerId}`;
  const [habits, setHabits] = useState<Habit[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: 'h1', name: 'Drink Water', days: {} },
      { id: 'h2', name: 'Move body 10 min', days: {} },
      { id: 'h3', name: 'No screens before 9am', days: {} },
    ];
  });
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(habits)); }, [habits, storageKey]);

  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setHabits([...habits, { id: uuidv4(), name: newHabit.trim(), days: {} }]);
    setNewHabit('');
  };

  const toggle = (hId: string, day: string) =>
    setHabits(habits.map(h => h.id === hId ? { ...h, days: { ...h.days, [day]: !h.days[day] } } : h));

  const remove = (id: string) => setHabits(habits.filter(h => h.id !== id));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">Habit Tracker</h1>
        <p className="text-sm opacity-50">Build momentum with daily actions.</p>
      </div>
      <div className="mb-8 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr>
              <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-accent w-1/3">Habit</th>
              {last7.map(d => (
                <th key={d.toISOString()} className="pb-4 text-center">
                  <div className="text-[10px] uppercase font-bold opacity-40 mb-1">{format(d, 'EEE')}</div>
                  <div className="font-serif italic text-sm">{format(d, 'd')}</div>
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {habits.map(h => (
              <tr key={h.id} className="border-t border-line group">
                <td className="py-4 text-sm font-medium">{h.name}</td>
                {last7.map(d => {
                  const key = format(d, 'yyyy-MM-dd');
                  return (
                    <td key={key} className="py-4 text-center">
                      <button onClick={() => toggle(h.id, key)} className={cn('w-5 h-5 rounded border-2 border-accent mx-auto transition-colors focus:outline-none flex items-center justify-center', h.days[key] ? 'bg-accent' : 'bg-transparent hover:bg-canvas')} />
                    </td>
                  );
                })}
                <td className="py-4 text-right">
                  <button onClick={() => remove(h.id)} className="text-[10px] uppercase tracking-widest font-bold text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {habits.length === 0 && <p className="text-center py-8 opacity-50 text-sm font-serif italic border-t border-line">No habits yet.</p>}
      </div>
      <form onSubmit={addHabit} className="flex gap-2 max-w-sm">
        <input value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder="New habit name…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
    </div>
  );
}
