import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../../lib/utils';

type Tab = 'revenue' | 'crm' | 'projects' | 'goals';
type CRMStage = 'Lead' | 'Proposal' | 'Active' | 'Closed';
type ProjectStatus = 'Todo' | 'In Progress' | 'Done';

interface Sale { id: string; date: string; description: string; amount: number }
interface Contact { id: string; name: string; company: string; stage: CRMStage; note: string }
interface Project { id: string; name: string; status: ProjectStatus; tasks: { id: string; text: string; done: boolean }[] }
interface Goal { id: string; title: string; target: number; current: number; unit: string }

const tabs: { id: Tab; label: string; height: string }[] = [
  { id: 'revenue', label: 'Revenue', height: 'h-24' },
  { id: 'crm', label: 'CRM', height: 'h-20' },
  { id: 'projects', label: 'Projects', height: 'h-24' },
  { id: 'goals', label: 'Goals', height: 'h-20' },
];

const STAGE_COLORS: Record<CRMStage, string> = {
  Lead: 'bg-blue-50 text-blue-700 border-blue-200',
  Proposal: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Active: 'bg-green-50 text-green-700 border-green-200',
  Closed: 'bg-gray-100 text-gray-500 border-gray-200',
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
  Todo: 'bg-sidebar text-ink/60 border-line',
  'In Progress': 'bg-accent/10 text-accent border-accent/30',
  Done: 'bg-green-50 text-green-700 border-green-200',
};

export default function BizOSPlanner({ plannerId, userId }: { plannerId: string; userId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('revenue');
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
        {activeTab === 'revenue' && <RevenueView plannerId={plannerId} userId={userId} />}
        {activeTab === 'crm' && <CRMView plannerId={plannerId} userId={userId} />}
        {activeTab === 'projects' && <ProjectsView plannerId={plannerId} userId={userId} />}
        {activeTab === 'goals' && <GoalsView plannerId={plannerId} userId={userId} />}
      </div>
    </>
  );
}

function RevenueView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `biz_revenue_${userId}_${plannerId}`;
  const [sales, setSales] = useState<Sale[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [];
  });
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(sales)); }, [sales, storageKey]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;
    setSales([{ id: uuidv4(), date: format(new Date(), 'yyyy-MM-dd'), description: desc.trim(), amount: parseFloat(amount) }, ...sales]);
    setDesc(''); setAmount('');
  };

  const total = sales.reduce((s, i) => s + i.amount, 0);
  const monthKey = format(new Date(), 'yyyy-MM');
  const monthTotal = sales.filter(s => s.date.startsWith(monthKey)).reduce((t, s) => t + s.amount, 0);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-serif italic">Revenue</h1>
          <p className="text-sm opacity-50">Log every sale and track your income.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-sidebar rounded-2xl p-5 border border-line">
          <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-2">This Month</p>
          <p className="text-3xl font-serif italic">${monthTotal.toFixed(2)}</p>
        </div>
        <div className="bg-sidebar rounded-2xl p-5 border border-line">
          <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-2">All Time</p>
          <p className="text-3xl font-serif italic">${total.toFixed(2)}</p>
        </div>
      </div>
      <form onSubmit={add} className="flex gap-3 mb-6">
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="$0.00" className="w-24 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40 text-right" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
      <div className="space-y-2">
        {sales.length === 0 ? <p className="text-sm opacity-50 italic">No sales logged yet.</p> : sales.map(s => (
          <div key={s.id} className="flex items-center justify-between py-3 border-b border-canvas group">
            <div>
              <p className="text-sm font-medium">{s.description}</p>
              <p className="text-[10px] opacity-40">{format(new Date(s.date), 'MMM d, yyyy')}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-serif italic text-accent">${s.amount.toFixed(2)}</span>
              <button onClick={() => setSales(sales.filter(x => x.id !== s.id))} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CRMView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `biz_crm_${userId}_${plannerId}`;
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: '1', name: 'Ana Oliveira', company: 'Bloom Studio', stage: 'Active', note: 'Renewing in July' },
      { id: '2', name: 'Bruno Lima', company: 'Lima Co.', stage: 'Lead', note: 'Waiting for proposal response' },
    ];
  });
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(contacts)); }, [contacts, storageKey]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setContacts([...contacts, { id: uuidv4(), name: name.trim(), company: company.trim(), stage: 'Lead', note: '' }]);
    setName(''); setCompany('');
  };

  const update = (id: string, field: keyof Contact, val: string) =>
    setContacts(contacts.map(c => c.id === id ? { ...c, [field]: val } : c));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">CRM Pipeline</h1>
        <p className="text-sm opacity-50">Track your clients and prospects.</p>
      </div>
      <div className="space-y-3 mb-6">
        {contacts.map(c => (
          <div key={c.id} className="bg-sidebar rounded-xl p-4 border border-line group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-sm">{c.name}</span>
                  {c.company && <span className="text-[10px] opacity-50">{c.company}</span>}
                </div>
                <input value={c.note} onChange={e => update(c.id, 'note', e.target.value)} placeholder="Add note…" className="text-xs opacity-60 bg-transparent focus:outline-none w-full placeholder:opacity-40 focus:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select value={c.stage} onChange={e => update(c.id, 'stage', e.target.value)} className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border focus:outline-none bg-transparent', STAGE_COLORS[c.stage])}>
                  {(['Lead', 'Proposal', 'Active', 'Closed'] as CRMStage[]).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => setContacts(contacts.filter(x => x.id !== c.id))} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
              </div>
            </div>
          </div>
        ))}
        {contacts.length === 0 && <p className="text-sm opacity-50 italic">No contacts yet.</p>}
      </div>
      <form onSubmit={add} className="flex gap-3 max-w-md">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Contact name…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company…" className="w-32 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
    </div>
  );
}

function ProjectsView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `biz_projects_${userId}_${plannerId}`;
  const [projects, setProjects] = useState<Project[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: '1', name: 'Website Redesign', status: 'In Progress', tasks: [{ id: 't1', text: 'Wireframes', done: true }, { id: 't2', text: 'Design handoff', done: false }] },
    ];
  });
  const [newProj, setNewProj] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(projects)); }, [projects, storageKey]);

  const addProj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProj.trim()) return;
    const p = { id: uuidv4(), name: newProj.trim(), status: 'Todo' as ProjectStatus, tasks: [] };
    setProjects([...projects, p]);
    setNewProj('');
    setExpanded(p.id);
  };

  const updateStatus = (id: string, status: ProjectStatus) =>
    setProjects(projects.map(p => p.id === id ? { ...p, status } : p));

  const addTask = (projId: string) => {
    if (!newTask.trim()) return;
    setProjects(projects.map(p => p.id === projId ? { ...p, tasks: [...p.tasks, { id: uuidv4(), text: newTask.trim(), done: false }] } : p));
    setNewTask('');
  };

  const toggleTask = (projId: string, taskId: string) =>
    setProjects(projects.map(p => p.id === projId ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) } : p));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">Projects</h1>
        <p className="text-sm opacity-50">Track your active work.</p>
      </div>
      <div className="space-y-3 mb-6">
        {projects.map(p => {
          const done = p.tasks.filter(t => t.done).length;
          return (
            <div key={p.id} className="bg-sidebar rounded-xl border border-line overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="flex-1 text-left font-semibold text-sm hover:text-accent transition-colors">{p.name}</button>
                {p.tasks.length > 0 && <span className="text-[10px] opacity-40">{done}/{p.tasks.length}</span>}
                <select value={p.status} onChange={e => updateStatus(p.id, e.target.value as ProjectStatus)} className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border focus:outline-none bg-transparent', STATUS_COLORS[p.status])}>
                  {(['Todo', 'In Progress', 'Done'] as ProjectStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => setProjects(projects.filter(x => x.id !== p.id))} className="text-[10px] text-red-800 opacity-60 hover:opacity-100 transition-opacity">Del</button>
              </div>
              {expanded === p.id && (
                <div className="px-4 pb-4 border-t border-line">
                  <ul className="space-y-2 mt-3 mb-3">
                    {p.tasks.map(t => (
                      <li key={t.id} className="flex items-center gap-2">
                        <button onClick={() => toggleTask(p.id, t.id)} className={cn('w-4 h-4 rounded border-2 border-accent flex-shrink-0 transition-colors', t.done ? 'bg-accent' : 'bg-transparent')} />
                        <span className={cn('text-sm', t.done ? 'line-through opacity-40' : '')}>{t.text}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask(p.id)} placeholder="Add task…" className="flex-1 border-b border-line bg-transparent pb-1 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
                    <button onClick={() => addTask(p.id)} className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70">Add</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {projects.length === 0 && <p className="text-sm opacity-50 italic">No projects yet.</p>}
      </div>
      <form onSubmit={addProj} className="flex gap-2 max-w-sm">
        <input value={newProj} onChange={e => setNewProj(e.target.value)} placeholder="New project name…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
    </div>
  );
}

function GoalsView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `biz_goals_${userId}_${plannerId}`;
  const [goals, setGoals] = useState<Goal[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: '1', title: 'Monthly Revenue', target: 5000, current: 0, unit: '$' },
      { id: '2', title: 'New Clients', target: 5, current: 0, unit: 'clients' },
    ];
  });
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(goals)); }, [goals, storageKey]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !target) return;
    setGoals([...goals, { id: uuidv4(), title: title.trim(), target: parseFloat(target), current: 0, unit: unit || '' }]);
    setTitle(''); setTarget(''); setUnit('');
  };

  const update = (id: string, current: number) =>
    setGoals(goals.map(g => g.id === id ? { ...g, current: Math.max(0, Math.min(g.target, current)) } : g));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">Business Goals</h1>
        <p className="text-sm opacity-50">Track your OKRs and milestones.</p>
      </div>
      <div className="space-y-6 mb-8">
        {goals.map(g => {
          const pct = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0;
          return (
            <div key={g.id} className="group">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-sm">{g.title}</span>
                <div className="flex items-center gap-3">
                  <input type="number" value={g.current} min={0} max={g.target} onChange={e => update(g.id, parseFloat(e.target.value))} className="w-20 text-right border-b border-line bg-transparent text-sm font-serif italic text-accent focus:outline-none focus:border-accent" />
                  <span className="text-xs opacity-40">/ {g.target} {g.unit}</span>
                  <button onClick={() => setGoals(goals.filter(x => x.id !== g.id))} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
                </div>
              </div>
              <div className="h-2 bg-line rounded-full overflow-hidden">
                <div className={cn('h-2 rounded-full transition-all duration-500', pct >= 100 ? 'bg-green-500' : 'bg-accent')} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[10px] mt-1 opacity-40">{pct}% complete</p>
            </div>
          );
        })}
        {goals.length === 0 && <p className="text-sm opacity-50 italic">No goals set yet.</p>}
      </div>
      <form onSubmit={add} className="flex gap-3 max-w-lg">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal title…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <input value={target} onChange={e => setTarget(e.target.value)} type="number" min="1" placeholder="Target" className="w-20 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Unit" className="w-16 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent transition-colors placeholder:opacity-40" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
    </div>
  );
}
