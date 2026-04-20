import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../../lib/utils';

type Tab = 'workout' | 'nutrition' | 'progress' | 'habits';

interface Exercise { id: string; name: string; sets: number; reps: string; weight: string }
interface Meal { id: string; name: string; calories: number; time: 'breakfast' | 'lunch' | 'dinner' | 'snack' }
interface Measurement { id: string; date: string; weight: string; waist: string; notes: string }
interface Habit { id: string; name: string; days: Record<string, boolean> }

const tabs: { id: Tab; label: string; height: string }[] = [
  { id: 'workout', label: 'Workout', height: 'h-24' },
  { id: 'nutrition', label: 'Nutrition', height: 'h-24' },
  { id: 'progress', label: 'Progress', height: 'h-24' },
  { id: 'habits', label: 'Habits', height: 'h-20' },
];

const MEAL_TIMES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

export default function FitnessPlanner({ plannerId, userId }: { plannerId: string; userId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('workout');
  return (
    <>
      <div className="w-12 bg-tab flex flex-col pt-12 space-y-4 shrink-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={cn(`${t.height} w-12 rounded-l-md -mr-1 flex items-center justify-center [writing-mode:vertical-lr] text-[10px] font-bold uppercase tracking-tighter transition-all`, activeTab === t.id ? 'bg-white text-ink' : 'opacity-60 text-ink/80 hover:bg-white/50')}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-10 overflow-auto">
        {activeTab === 'workout' && <WorkoutView plannerId={plannerId} userId={userId} />}
        {activeTab === 'nutrition' && <NutritionView plannerId={plannerId} userId={userId} />}
        {activeTab === 'progress' && <ProgressView plannerId={plannerId} userId={userId} />}
        {activeTab === 'habits' && <HabitsView plannerId={plannerId} userId={userId} />}
      </div>
    </>
  );
}

function WorkoutView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const dateKey = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `fitness_workout_${userId}_${plannerId}_${dateKey}`;
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: '1', name: 'Bench Press', sets: 4, reps: '8-10', weight: '60kg' },
      { id: '2', name: 'Pull-ups', sets: 3, reps: '8', weight: 'BW' },
    ];
  });
  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weight, setWeight] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(exercises)); }, [exercises, storageKey]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setExercises([...exercises, { id: uuidv4(), name: name.trim(), sets: parseInt(sets) || 3, reps, weight }]);
    setName(''); setWeight('');
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">Workout Log</h1>
        <p className="text-sm opacity-50">{format(new Date(), 'EEEE, MMMM do')}</p>
      </div>
      <table className="w-full text-left border-collapse mb-6">
        <thead>
          <tr>
            <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-accent">Exercise</th>
            <th className="pb-4 text-center text-[10px] uppercase tracking-widest font-bold text-accent">Sets</th>
            <th className="pb-4 text-center text-[10px] uppercase tracking-widest font-bold text-accent">Reps</th>
            <th className="pb-4 text-center text-[10px] uppercase tracking-widest font-bold text-accent">Weight</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {exercises.map(ex => (
            <tr key={ex.id} className="border-t border-line group">
              <td className="py-3 text-sm font-medium">{ex.name}</td>
              <td className="py-3 text-center">
                <input type="number" value={ex.sets} min={1} onChange={e => setExercises(exercises.map(x => x.id === ex.id ? { ...x, sets: parseInt(e.target.value) || 1 } : x))} className="w-10 text-center bg-transparent border-b border-line focus:outline-none text-sm" />
              </td>
              <td className="py-3 text-center">
                <input value={ex.reps} onChange={e => setExercises(exercises.map(x => x.id === ex.id ? { ...x, reps: e.target.value } : x))} className="w-16 text-center bg-transparent border-b border-line focus:outline-none text-sm" />
              </td>
              <td className="py-3 text-center">
                <input value={ex.weight} onChange={e => setExercises(exercises.map(x => x.id === ex.id ? { ...x, weight: e.target.value } : x))} className="w-16 text-center bg-transparent border-b border-line focus:outline-none text-sm" />
              </td>
              <td className="py-3 text-right">
                <button onClick={() => setExercises(exercises.filter(x => x.id !== ex.id))} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
              </td>
            </tr>
          ))}
          {exercises.length === 0 && <tr><td colSpan={5} className="py-6 text-sm opacity-50 italic">No exercises logged.</td></tr>}
        </tbody>
      </table>
      <form onSubmit={add} className="flex gap-3 max-w-lg">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Exercise name…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
        <input value={sets} onChange={e => setSets(e.target.value)} type="number" min={1} className="w-10 text-center border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent" />
        <input value={reps} onChange={e => setReps(e.target.value)} placeholder="Reps" className="w-14 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
        <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="kg" className="w-14 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
    </div>
  );
}

function NutritionView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const dateKey = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `fitness_nutrition_${userId}_${plannerId}_${dateKey}`;
  const [meals, setMeals] = useState<Meal[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [];
  });
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [time, setTime] = useState<Meal['time']>('breakfast');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(meals)); }, [meals, storageKey]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setMeals([...meals, { id: uuidv4(), name: name.trim(), calories: parseInt(calories) || 0, time }]);
    setName(''); setCalories('');
  };

  const total = meals.reduce((s, m) => s + m.calories, 0);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-serif italic">Nutrition</h1>
          <p className="text-sm opacity-50">{format(new Date(), 'MMMM do')} · {total} kcal total</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-serif italic text-accent">{total}</p>
          <p className="text-[10px] uppercase tracking-widest opacity-50">kcal today</p>
        </div>
      </div>
      {MEAL_TIMES.map(mt => {
        const list = meals.filter(m => m.time === mt);
        if (list.length === 0) return null;
        return (
          <div key={mt} className="mb-6">
            <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-2">{mt}</label>
            {list.map(m => (
              <div key={m.id} className="flex items-center justify-between py-2 border-b border-canvas group">
                <span className="text-sm">{m.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-serif italic text-accent">{m.calories} kcal</span>
                  <button onClick={() => setMeals(meals.filter(x => x.id !== m.id))} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
      {meals.length === 0 && <p className="text-sm opacity-50 italic mb-6">No meals logged yet.</p>}
      <form onSubmit={add} className="flex gap-3 max-w-lg mt-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Food item…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
        <input value={calories} onChange={e => setCalories(e.target.value)} type="number" min={0} placeholder="kcal" className="w-16 border-b border-line bg-transparent pb-2 text-sm text-right focus:outline-none focus:border-accent placeholder:opacity-40" />
        <select value={time} onChange={e => setTime(e.target.value as Meal['time'])} className="border-b border-line bg-transparent pb-2 text-[10px] uppercase font-bold text-accent focus:outline-none">
          {MEAL_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
    </div>
  );
}

function ProgressView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `fitness_progress_${userId}_${plannerId}`;
  const [measurements, setMeasurements] = useState<Measurement[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [];
  });
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(measurements)); }, [measurements, storageKey]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight && !waist) return;
    setMeasurements([{ id: uuidv4(), date: format(new Date(), 'yyyy-MM-dd'), weight, waist, notes }, ...measurements]);
    setWeight(''); setWaist(''); setNotes('');
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">Progress Log</h1>
        <p className="text-sm opacity-50">Track measurements over time.</p>
      </div>
      <form onSubmit={add} className="bg-sidebar rounded-2xl p-6 border border-line mb-8">
        <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-4">Log Today — {format(new Date(), 'MMM d')}</label>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-50 block mb-1">Weight (kg)</label>
            <input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 72.5" className="w-full border-b border-line bg-transparent pb-2 text-lg font-serif italic focus:outline-none focus:border-accent placeholder:opacity-30" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest opacity-50 block mb-1">Waist (cm)</label>
            <input value={waist} onChange={e => setWaist(e.target.value)} placeholder="e.g. 82" className="w-full border-b border-line bg-transparent pb-2 text-lg font-serif italic focus:outline-none focus:border-accent placeholder:opacity-30" />
          </div>
        </div>
        <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)…" className="w-full border-b border-line bg-transparent pb-2 text-sm mb-4 focus:outline-none focus:border-accent placeholder:opacity-40" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold bg-accent text-white px-5 py-2 rounded hover:opacity-90 transition-opacity">Save Entry</button>
      </form>
      <div className="space-y-3">
        {measurements.map(m => (
          <div key={m.id} className="flex items-center gap-6 py-3 border-b border-canvas group">
            <span className="text-[11px] opacity-40 w-20 shrink-0">{format(new Date(m.date + 'T12:00'), 'MMM d, yyyy')}</span>
            {m.weight && <span className="text-sm font-serif italic"><span className="opacity-40 text-[10px] uppercase mr-1">W</span>{m.weight}kg</span>}
            {m.waist && <span className="text-sm font-serif italic"><span className="opacity-40 text-[10px] uppercase mr-1">Waist</span>{m.waist}cm</span>}
            {m.notes && <span className="text-xs opacity-50 flex-1 truncate">{m.notes}</span>}
            <button onClick={() => setMeasurements(measurements.filter(x => x.id !== m.id))} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">Del</button>
          </div>
        ))}
        {measurements.length === 0 && <p className="text-sm opacity-50 italic">No measurements yet.</p>}
      </div>
    </div>
  );
}

function HabitsView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `fitness_habits_${userId}_${plannerId}`;
  const [habits, setHabits] = useState<Habit[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: 'h1', name: 'Train today', days: {} },
      { id: 'h2', name: '8k+ steps', days: {} },
      { id: 'h3', name: 'No processed food', days: {} },
      { id: 'h4', name: 'Sleep 7-9h', days: {} },
    ];
  });
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(habits)); }, [habits, storageKey]);

  const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
  const toggle = (hId: string, day: string) => setHabits(habits.map(h => h.id === hId ? { ...h, days: { ...h.days, [day]: !h.days[day] } } : h));
  const add = (e: React.FormEvent) => { e.preventDefault(); if (!newHabit.trim()) return; setHabits([...habits, { id: uuidv4(), name: newHabit.trim(), days: {} }]); setNewHabit(''); };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">Fitness Habits</h1>
        <p className="text-sm opacity-50">Consistency is the key to results.</p>
      </div>
      <table className="w-full text-left border-collapse mb-6 min-w-[500px]">
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
              {last7.map(d => { const key = format(d, 'yyyy-MM-dd'); return (
                <td key={key} className="py-4 text-center">
                  <button onClick={() => toggle(h.id, key)} className={cn('w-5 h-5 rounded border-2 border-accent mx-auto transition-colors block', h.days[key] ? 'bg-accent' : 'bg-transparent hover:bg-canvas')} />
                </td>
              ); })}
              <td className="py-4 text-right">
                <button onClick={() => setHabits(habits.filter(x => x.id !== h.id))} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form onSubmit={add} className="flex gap-2 max-w-sm">
        <input value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder="New habit…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
    </div>
  );
}
