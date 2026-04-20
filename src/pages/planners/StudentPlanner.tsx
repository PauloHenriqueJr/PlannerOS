import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../../lib/utils';

type Tab = 'tasks' | 'assignments' | 'study' | 'grades';

interface Task { id: string; text: string; done: boolean; subject: string }
interface Assignment { id: string; subject: string; title: string; dueDate: string; done: boolean; priority: 'Low' | 'Medium' | 'High' }
interface Subject { id: string; name: string; grade: string; credits: number }

const tabs: { id: Tab; label: string; height: string }[] = [
  { id: 'tasks', label: 'Today', height: 'h-20' },
  { id: 'assignments', label: 'Assign.', height: 'h-24' },
  { id: 'study', label: 'Study', height: 'h-20' },
  { id: 'grades', label: 'Grades', height: 'h-20' },
];

const PRIORITY_COLORS = {
  Low: 'bg-green-50 text-green-700 border-green-200',
  Medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  High: 'bg-red-50 text-red-700 border-red-200',
};

export default function StudentPlanner({ plannerId, userId }: { plannerId: string; userId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('tasks');
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
        {activeTab === 'tasks' && <TasksView plannerId={plannerId} userId={userId} />}
        {activeTab === 'assignments' && <AssignmentsView plannerId={plannerId} userId={userId} />}
        {activeTab === 'study' && <StudyView plannerId={plannerId} userId={userId} />}
        {activeTab === 'grades' && <GradesView plannerId={plannerId} userId={userId} />}
      </div>
    </>
  );
}

function TasksView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const dateKey = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `student_tasks_${userId}_${plannerId}_${dateKey}`;
  const [tasks, setTasks] = useState<Task[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: '1', text: 'Review chapter 3 notes', done: false, subject: 'Biology' },
      { id: '2', text: 'Complete math problem set', done: false, subject: 'Math' },
      { id: '3', text: 'Read essay feedback', done: true, subject: 'English' },
    ];
  });
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(tasks)); }, [tasks, storageKey]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setTasks([...tasks, { id: uuidv4(), text: text.trim(), done: false, subject: subject.trim() }]);
    setText(''); setSubject('');
  };

  const done = tasks.filter(t => t.done).length;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-serif italic">Today's Study</h1>
          <p className="text-sm opacity-50">{format(new Date(), 'EEEE, MMMM do')} · {done}/{tasks.length} done</p>
        </div>
        <div className="w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center text-sm font-serif italic text-accent">
          {tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0}%
        </div>
      </div>
      <div className="mb-6">
        <div className="h-2 bg-line rounded-full overflow-hidden mb-6">
          <div className="h-2 bg-accent rounded-full transition-all duration-500" style={{ width: `${tasks.length > 0 ? (done / tasks.length) * 100 : 0}%` }} />
        </div>
        <ul className="space-y-3">
          {tasks.map(t => (
            <li key={t.id} className="flex items-center gap-3 pb-3 border-b border-canvas group">
              <button onClick={() => setTasks(tasks.map(x => x.id === t.id ? { ...x, done: !x.done } : x))} className={cn('w-5 h-5 rounded border-2 border-accent flex-shrink-0 transition-colors', t.done ? 'bg-accent' : 'bg-transparent')} />
              <span className={cn('text-sm flex-1', t.done ? 'line-through opacity-40' : '')}>{t.text}</span>
              {t.subject && <span className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded-full font-bold">{t.subject}</span>}
              <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
            </li>
          ))}
          {tasks.length === 0 && <li className="text-sm opacity-50 italic">No tasks for today.</li>}
        </ul>
      </div>
      <form onSubmit={add} className="flex gap-3 max-w-lg">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Task description…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-24 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
    </div>
  );
}

function AssignmentsView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `student_assignments_${userId}_${plannerId}`;
  const [items, setItems] = useState<Assignment[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: '1', subject: 'Math', title: 'Problem Set 4', dueDate: '2026-04-25', done: false, priority: 'High' },
      { id: '2', subject: 'English', title: 'Essay Draft', dueDate: '2026-04-28', done: false, priority: 'Medium' },
    ];
  });
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(items)); }, [items, storageKey]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setItems([...items, { id: uuidv4(), subject: subject.trim(), title: title.trim(), dueDate, done: false, priority }]);
    setTitle(''); setSubject(''); setDueDate('');
  };

  const pending = items.filter(i => !i.done).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const completed = items.filter(i => i.done);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">Assignments</h1>
        <p className="text-sm opacity-50">{pending.length} pending · {completed.length} completed</p>
      </div>
      <div className="space-y-3 mb-8">
        {[...pending, ...completed].map(a => (
          <div key={a.id} className={cn('flex items-start gap-3 p-4 rounded-xl border transition-all group', a.done ? 'opacity-50 bg-canvas border-line' : 'bg-sidebar border-line')}>
            <button onClick={() => setItems(items.map(x => x.id === a.id ? { ...x, done: !x.done } : x))} className={cn('w-5 h-5 rounded border-2 border-accent flex-shrink-0 mt-0.5 transition-colors', a.done ? 'bg-accent' : 'bg-transparent')} />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('text-sm font-medium', a.done ? 'line-through' : '')}>{a.title}</span>
                {a.subject && <span className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded-full font-bold">{a.subject}</span>}
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-bold', PRIORITY_COLORS[a.priority])}>{a.priority}</span>
              </div>
              {a.dueDate && <p className="text-[11px] opacity-50 mt-0.5">Due {format(new Date(a.dueDate + 'T12:00'), 'MMM d')}</p>}
            </div>
            <button onClick={() => setItems(items.filter(x => x.id !== a.id))} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm opacity-50 italic">No assignments yet.</p>}
      </div>
      <form onSubmit={add} className="grid grid-cols-2 gap-3 max-w-lg">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Assignment title…" className="col-span-2 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className="border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors opacity-60" />
        <select value={priority} onChange={e => setPriority(e.target.value as 'Low' | 'Medium' | 'High')} className="border-b border-line bg-transparent pb-2 text-sm focus:outline-none text-accent font-bold">
          <option>Low</option><option>Medium</option><option>High</option>
        </select>
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 text-left">Add Assignment</button>
      </form>
    </div>
  );
}

function StudyView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `student_pomodoro_${userId}_${plannerId}`;
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(() => parseInt(localStorage.getItem(storageKey) || '0'));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { localStorage.setItem(storageKey, String(sessions)); }, [sessions, storageKey]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === 'work') setSessions(n => n + 1);
            setMode(m => m === 'work' ? 'break' : 'work');
            return mode === 'work' ? 5 * 60 : 25 * 60;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const reset = () => { setRunning(false); setSeconds(mode === 'work' ? 25 * 60 : 5 * 60); };
  const switchMode = (m: 'work' | 'break') => { setRunning(false); setMode(m); setSeconds(m === 'work' ? 25 * 60 : 5 * 60); };

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  const pct = mode === 'work' ? 1 - seconds / (25 * 60) : 1 - seconds / (5 * 60);
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="animate-in fade-in duration-500 flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-serif italic">Pomodoro Timer</h1>
        <p className="text-sm opacity-50">Focus in 25-minute sessions. Rest 5 minutes.</p>
      </div>
      <div className="flex gap-3 mb-10">
        {(['work', 'break'] as const).map(m => (
          <button key={m} onClick={() => switchMode(m)} className={cn('px-5 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all', mode === m ? 'bg-accent text-white' : 'border border-line text-ink opacity-60 hover:opacity-100')}>
            {m === 'work' ? 'Focus 25min' : 'Break 5min'}
          </button>
        ))}
      </div>
      <div className="relative mb-10">
        <svg width="128" height="128" className="-rotate-90">
          <circle cx="64" cy="64" r="54" fill="none" stroke="#E8E1D9" strokeWidth="8" />
          <circle cx="64" cy="64" r="54" fill="none" stroke="#A6927C" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - pct)} strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-serif italic font-bold">{mins}:{secs}</span>
          <span className="text-[10px] uppercase tracking-widest opacity-50 mt-1">{mode === 'work' ? 'Focus' : 'Break'}</span>
        </div>
      </div>
      <div className="flex gap-4 mb-10">
        <button onClick={() => setRunning(!running)} className="text-[10px] uppercase tracking-widest font-bold bg-accent text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} className="text-[10px] uppercase tracking-widest font-bold border border-line text-ink px-6 py-3 rounded-full hover:bg-sidebar transition-colors">Reset</button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-3xl font-serif italic text-accent">{sessions}</p>
          <p className="text-[10px] uppercase tracking-widest opacity-50">Sessions today</p>
        </div>
        <button onClick={() => setSessions(0)} className="text-[10px] text-ink opacity-40 hover:opacity-80 uppercase tracking-wider">Reset count</button>
      </div>
    </div>
  );
}

function GradesView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `student_grades_${userId}_${plannerId}`;
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: '1', name: 'Mathematics', grade: 'A', credits: 4 },
      { id: '2', name: 'Biology', grade: 'B+', credits: 3 },
      { id: '3', name: 'English', grade: 'A-', credits: 3 },
    ];
  });
  const [name, setName] = useState('');
  const [credits, setCredits] = useState('3');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(subjects)); }, [subjects, storageKey]);

  const gradeToGPA: Record<string, number> = { 'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };
  const gpa = subjects.length > 0 ? (subjects.reduce((sum, s) => sum + (gradeToGPA[s.grade] || 0) * s.credits, 0) / subjects.reduce((sum, s) => sum + s.credits, 0)).toFixed(2) : '—';

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubjects([...subjects, { id: uuidv4(), name: name.trim(), grade: 'A', credits: parseInt(credits) || 3 }]);
    setName('');
  };

  const update = (id: string, field: keyof Subject, val: string | number) =>
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: val } : s));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-serif italic">Grade Tracker</h1>
          <p className="text-sm opacity-50">Track your academic performance.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-1">GPA</p>
          <p className="text-3xl font-serif italic">{gpa}</p>
        </div>
      </div>
      <table className="w-full text-left border-collapse mb-6">
        <thead>
          <tr>
            <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-accent">Subject</th>
            <th className="pb-4 text-center text-[10px] uppercase tracking-widest font-bold text-accent">Grade</th>
            <th className="pb-4 text-center text-[10px] uppercase tracking-widest font-bold text-accent">Credits</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {subjects.map(s => (
            <tr key={s.id} className="border-t border-line group">
              <td className="py-3 text-sm font-medium">{s.name}</td>
              <td className="py-3 text-center">
                <select value={s.grade} onChange={e => update(s.id, 'grade', e.target.value)} className="text-center font-serif italic font-bold text-accent bg-transparent border-b border-line focus:outline-none focus:border-accent text-sm">
                  {Object.keys(gradeToGPA).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </td>
              <td className="py-3 text-center">
                <input type="number" min={1} max={6} value={s.credits} onChange={e => update(s.id, 'credits', parseInt(e.target.value))} className="w-12 text-center bg-transparent border-b border-line focus:outline-none focus:border-accent text-sm" />
              </td>
              <td className="py-3 text-right">
                <button onClick={() => setSubjects(subjects.filter(x => x.id !== s.id))} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
              </td>
            </tr>
          ))}
          {subjects.length === 0 && <tr><td colSpan={4} className="py-6 text-sm opacity-50 italic">No subjects added.</td></tr>}
        </tbody>
      </table>
      <form onSubmit={add} className="flex gap-3 max-w-sm">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Subject name…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <input value={credits} onChange={e => setCredits(e.target.value)} type="number" min={1} max={6} className="w-16 border-b border-line bg-transparent pb-2 text-sm text-center focus:outline-none focus:border-accent transition-colors" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
    </div>
  );
}
