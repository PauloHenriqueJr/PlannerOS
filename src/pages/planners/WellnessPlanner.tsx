import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../../lib/utils';

type Tab = 'routine' | 'skincare' | 'mood' | 'stats';

const MOODS = ['😴', '😕', '😐', '🙂', '😊', '✨'];
const MOOD_LABELS = ['Exhausted', 'Low', 'Neutral', 'Good', 'Great', 'Amazing'];

const tabs: { id: Tab; label: string; height: string }[] = [
  { id: 'routine', label: 'Routine', height: 'h-24' },
  { id: 'skincare', label: 'Skincare', height: 'h-24' },
  { id: 'mood', label: 'Mood', height: 'h-20' },
  { id: 'stats', label: 'Stats', height: 'h-20' },
];

export default function WellnessPlanner({ plannerId, userId }: { plannerId: string; userId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('routine');
  return (
    <>
      <div className="w-12 bg-tab flex flex-col pt-12 space-y-4 shrink-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={cn(`${t.height} w-12 rounded-l-md -mr-1 flex items-center justify-center [writing-mode:vertical-lr] text-[10px] font-bold uppercase tracking-tighter transition-all`, activeTab === t.id ? 'bg-white text-ink' : 'opacity-60 text-ink/80 hover:bg-white/50')}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-12 overflow-auto">
        {activeTab === 'routine' && <RoutineView plannerId={plannerId} userId={userId} />}
        {activeTab === 'skincare' && <SkincareView plannerId={plannerId} userId={userId} />}
        {activeTab === 'mood' && <MoodView plannerId={plannerId} userId={userId} />}
        {activeTab === 'stats' && <StatsView plannerId={plannerId} userId={userId} />}
      </div>
    </>
  );
}

function RoutineView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const dateKey = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `wellness_routine_${userId}_${plannerId}_${dateKey}`;

  const [items, setItems] = useState<{ id: string; text: string; done: boolean; time: 'am' | 'pm' }[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: '1', text: 'Wake up without hitting snooze', done: false, time: 'am' },
      { id: '2', text: 'Drink a glass of water', done: false, time: 'am' },
      { id: '3', text: '5-min journaling or gratitude', done: false, time: 'am' },
      { id: '4', text: 'Stretch or yoga', done: false, time: 'am' },
      { id: '5', text: 'Phone-free wind-down', done: false, time: 'pm' },
      { id: '6', text: 'Skincare night routine', done: false, time: 'pm' },
      { id: '7', text: 'Prep for tomorrow', done: false, time: 'pm' },
    ];
  });
  const [newItem, setNewItem] = useState('');
  const [newTime, setNewTime] = useState<'am' | 'pm'>('am');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(items)); }, [items, storageKey]);

  const toggle = (id: string) => setItems(items.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const remove = (id: string) => setItems(items.filter(i => i.id !== id));
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setItems([...items, { id: uuidv4(), text: newItem.trim(), done: false, time: newTime }]);
    setNewItem('');
  };

  const am = items.filter(i => i.time === 'am');
  const pm = items.filter(i => i.time === 'pm');

  const Section = ({ list, label }: { list: typeof items; label: string }) => (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">{label} Ritual</label>
      <ul className="space-y-3">
        {list.map(item => (
          <li key={item.id} className="flex items-center gap-3 group pb-3 border-b border-canvas">
            <button onClick={() => toggle(item.id)} className={cn('w-5 h-5 rounded-full border-2 border-accent flex-shrink-0 transition-colors', item.done ? 'bg-accent' : 'bg-transparent')} />
            <span className={cn('text-sm flex-1', item.done ? 'line-through opacity-40' : '')}>{item.text}</span>
            <button onClick={() => remove(item.id)} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
          </li>
        ))}
      </ul>
    </div>
  );

  const doneCount = items.filter(i => i.done).length;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-serif italic">Daily Ritual</h1>
          <p className="text-sm opacity-50">{format(new Date(), 'EEEE, MMMM do')} · {doneCount}/{items.length} completed</p>
        </div>
        <div className="w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center text-sm font-serif italic text-accent">
          {items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0}%
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Section list={am} label="Morning" />
        <Section list={pm} label="Evening" />
      </div>
      <form onSubmit={add} className="flex gap-3 mt-8 max-w-md">
        <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add ritual step…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <select value={newTime} onChange={e => setNewTime(e.target.value as 'am' | 'pm')} className="border-b border-line bg-transparent pb-2 text-sm focus:outline-none text-accent font-bold">
          <option value="am">AM</option>
          <option value="pm">PM</option>
        </select>
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
    </div>
  );
}

function SkincareView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const dateKey = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `wellness_skincare_${userId}_${plannerId}_${dateKey}`;

  const [steps, setSteps] = useState<{ id: string; name: string; am: boolean; pm: boolean }[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: '1', name: 'Gentle cleanser', am: false, pm: false },
      { id: '2', name: 'Toner / essence', am: false, pm: false },
      { id: '3', name: 'Vitamin C serum', am: false, pm: false },
      { id: '4', name: 'Moisturizer', am: false, pm: false },
      { id: '5', name: 'SPF 50 sunscreen', am: false, pm: false },
      { id: '6', name: 'Retinol / night serum', am: false, pm: false },
      { id: '7', name: 'Eye cream', am: false, pm: false },
    ];
  });
  const [newStep, setNewStep] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(steps)); }, [steps, storageKey]);

  const toggle = (id: string, period: 'am' | 'pm') =>
    setSteps(steps.map(s => s.id === id ? { ...s, [period]: !s[period] } : s));
  const remove = (id: string) => setSteps(steps.filter(s => s.id !== id));
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStep.trim()) return;
    setSteps([...steps, { id: uuidv4(), name: newStep.trim(), am: false, pm: false }]);
    setNewStep('');
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">Skincare Log</h1>
        <p className="text-sm opacity-50">{format(new Date(), 'MMMM do')} · Check off AM &amp; PM steps</p>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-accent w-1/2">Product / Step</th>
            <th className="pb-4 text-center text-[10px] uppercase tracking-widest font-bold text-accent">AM</th>
            <th className="pb-4 text-center text-[10px] uppercase tracking-widest font-bold text-accent">PM</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {steps.map(s => (
            <tr key={s.id} className="border-t border-line group">
              <td className="py-4 text-sm">{s.name}</td>
              {(['am', 'pm'] as const).map(period => (
                <td key={period} className="py-4 text-center">
                  <button onClick={() => toggle(s.id, period)} className={cn('w-5 h-5 rounded-full border-2 border-accent mx-auto transition-colors block', s[period] ? 'bg-accent' : 'bg-transparent hover:bg-canvas')} />
                </td>
              ))}
              <td className="py-4 text-right">
                <button onClick={() => remove(s.id)} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={add} className="flex gap-2 mt-6 max-w-sm">
        <input value={newStep} onChange={e => setNewStep(e.target.value)} placeholder="Add product or step…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
    </div>
  );
}

function MoodView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `wellness_mood_${userId}_${plannerId}`;
  const [moods, setMoods] = useState<Record<string, number>>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : {};
  });
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const s = localStorage.getItem(`${storageKey}_notes`);
    return s ? JSON.parse(s) : {};
  });

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(moods)); }, [moods, storageKey]);
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(`${storageKey}_notes`, JSON.stringify(notes)), 500);
    return () => clearTimeout(t);
  }, [notes, storageKey]);

  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">Mood Tracker</h1>
        <p className="text-sm opacity-50">How are you feeling this week?</p>
      </div>
      <div className="grid grid-cols-7 gap-3 mb-10">
        {last7.map(d => {
          const key = format(d, 'yyyy-MM-dd');
          const isToday = key === format(new Date(), 'yyyy-MM-dd');
          const selected = moods[key] ?? -1;
          return (
            <div key={key} className={cn('flex flex-col items-center gap-2 p-3 rounded-xl border transition-all', isToday ? 'border-accent bg-accent/5' : 'border-line')}>
              <span className="text-[10px] uppercase font-bold opacity-50">{format(d, 'EEE')}</span>
              <span className="font-serif italic text-sm">{format(d, 'd')}</span>
              <div className="flex flex-col gap-1 mt-1">
                {MOODS.map((emoji, i) => (
                  <button key={i} onClick={() => setMoods({ ...moods, [key]: i })} className={cn('text-base leading-none transition-all', selected === i ? 'scale-125' : 'opacity-30 hover:opacity-80')}>{emoji}</button>
                ))}
              </div>
              {selected >= 0 && <span className="text-[9px] text-accent font-bold">{MOOD_LABELS[selected]}</span>}
            </div>
          );
        })}
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">Today's Reflection</label>
        <textarea
          value={notes[format(new Date(), 'yyyy-MM-dd')] || ''}
          onChange={e => setNotes({ ...notes, [format(new Date(), 'yyyy-MM-dd')]: e.target.value })}
          placeholder="How are you feeling today? What do you need?"
          className="w-full border border-line bg-sidebar rounded-xl p-5 text-sm font-serif leading-relaxed focus:outline-none focus:border-accent transition-colors resize-none h-28"
        />
      </div>
    </div>
  );
}

function StatsView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const dateKey = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `wellness_stats_${userId}_${plannerId}_${dateKey}`;

  const [stats, setStats] = useState<{ water: number; sleep: number; steps: number; weight: string }>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : { water: 0, sleep: 0, steps: 0, weight: '' };
  });

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(stats)); }, [stats, storageKey]);

  const update = (key: keyof typeof stats, val: number | string) =>
    setStats({ ...stats, [key]: val });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">Wellness Stats</h1>
        <p className="text-sm opacity-50">{format(new Date(), 'EEEE, MMMM do')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Water */}
        <div className="bg-sidebar rounded-2xl p-6 border border-line">
          <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-4">Water Intake</label>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-serif italic">{stats.water}</span>
            <span className="text-sm opacity-50">/ 8 glasses</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 8 }, (_, i) => (
              <button key={i} onClick={() => update('water', i < stats.water ? i : i + 1)} className={cn('w-10 h-10 rounded-full border-2 border-accent text-lg transition-all', i < stats.water ? 'bg-accent text-white' : 'bg-transparent opacity-40 hover:opacity-80')}>💧</button>
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-sidebar rounded-2xl p-6 border border-line">
          <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-4">Sleep Hours</label>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-serif italic">{stats.sleep}h</span>
          </div>
          <input type="range" min={0} max={12} step={0.5} value={stats.sleep} onChange={e => update('sleep', parseFloat(e.target.value))} className="w-full accent-[#A6927C]" />
          <div className="flex justify-between text-[10px] opacity-40 mt-1"><span>0h</span><span>12h</span></div>
        </div>

        {/* Steps */}
        <div className="bg-sidebar rounded-2xl p-6 border border-line">
          <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-4">Steps Today</label>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl font-serif italic">{stats.steps.toLocaleString()}</span>
          </div>
          <input type="range" min={0} max={15000} step={250} value={stats.steps} onChange={e => update('steps', parseInt(e.target.value))} className="w-full accent-[#A6927C]" />
          <div className="flex justify-between text-[10px] opacity-40 mt-1"><span>0</span><span>15k</span></div>
        </div>

        {/* Weight */}
        <div className="bg-sidebar rounded-2xl p-6 border border-line">
          <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-4">Weight (optional)</label>
          <input type="text" value={stats.weight} onChange={e => update('weight', e.target.value)} placeholder="e.g. 60 kg" className="w-full border-b border-line bg-transparent pb-2 text-2xl font-serif italic focus:outline-none focus:border-accent transition-colors placeholder:opacity-30" />
          <p className="text-[10px] opacity-40 mt-3 uppercase tracking-wider">Your data stays private on this device.</p>
        </div>
      </div>
    </div>
  );
}
