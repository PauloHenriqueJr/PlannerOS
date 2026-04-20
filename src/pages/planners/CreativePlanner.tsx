import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../../lib/utils';

type Tab = 'calendar' | 'projects' | 'ideas' | 'income';

interface ContentPost { id: string; day: string; platform: string; caption: string; done: boolean }
interface Project { id: string; name: string; client: string; deadline: string; status: 'Briefing' | 'In Progress' | 'Review' | 'Done'; value: number }
interface Idea { id: string; title: string; tag: string; note: string; starred: boolean }
interface Income { id: string; date: string; client: string; description: string; amount: number }

const tabs: { id: Tab; label: string; height: string }[] = [
  { id: 'calendar', label: 'Content', height: 'h-24' },
  { id: 'projects', label: 'Projects', height: 'h-24' },
  { id: 'ideas', label: 'Ideas', height: 'h-20' },
  { id: 'income', label: 'Income', height: 'h-24' },
];

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter', 'Blog', 'Other'];
const STATUS_COLORS: Record<Project['status'], string> = {
  Briefing: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-accent/10 text-accent border-accent/30',
  Review: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Done: 'bg-green-50 text-green-700 border-green-200',
};

export default function CreativePlanner({ plannerId, userId }: { plannerId: string; userId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('calendar');
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
        {activeTab === 'calendar' && <ContentCalendarView plannerId={plannerId} userId={userId} />}
        {activeTab === 'projects' && <ProjectsView plannerId={plannerId} userId={userId} />}
        {activeTab === 'ideas' && <IdeasView plannerId={plannerId} userId={userId} />}
        {activeTab === 'income' && <IncomeView plannerId={plannerId} userId={userId} />}
      </div>
    </>
  );
}

function ContentCalendarView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const storageKey = `creative_calendar_${userId}_${plannerId}_${format(weekStart, 'yyyy-MM-dd')}`;

  const [posts, setPosts] = useState<ContentPost[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [];
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [platform, setPlatform] = useState('Instagram');
  const [caption, setCaption] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(posts)); }, [posts, storageKey]);

  const addPost = (day: string) => {
    if (!caption.trim()) return;
    setPosts([...posts, { id: uuidv4(), day, platform, caption: caption.trim(), done: false }]);
    setCaption(''); setSelected(null);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">Content Calendar</h1>
        <p className="text-sm opacity-50">Week of {format(weekStart, 'MMM d, yyyy')}</p>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map(d => {
          const key = format(d, 'yyyy-MM-dd');
          const isToday = key === format(new Date(), 'yyyy-MM-dd');
          const dayPosts = posts.filter(p => p.day === key);
          return (
            <div key={key} className={cn('rounded-xl border p-2 min-h-[120px] flex flex-col gap-1', isToday ? 'border-accent bg-accent/5' : 'border-line bg-sidebar')}>
              <div className="text-center mb-1">
                <div className="text-[9px] uppercase font-bold opacity-40">{format(d, 'EEE')}</div>
                <div className={cn('font-serif italic text-sm font-bold', isToday ? 'text-accent' : '')}>{format(d, 'd')}</div>
              </div>
              {dayPosts.map(p => (
                <div key={p.id} className={cn('text-[9px] px-1.5 py-1 rounded leading-tight group relative', p.done ? 'line-through opacity-40 bg-line' : 'bg-accent/10 text-accent')}>
                  <span className="font-bold">{p.platform[0]}</span> {p.caption.slice(0, 20)}{p.caption.length > 20 ? '…' : ''}
                  <div className="absolute top-0.5 right-0.5 hidden group-hover:flex gap-0.5">
                    <button onClick={() => setPosts(posts.map(x => x.id === p.id ? { ...x, done: !x.done } : x))} className="text-[8px] bg-white rounded px-1">✓</button>
                    <button onClick={() => setPosts(posts.filter(x => x.id !== p.id))} className="text-[8px] bg-white rounded px-1">×</button>
                  </div>
                </div>
              ))}
              <button onClick={() => setSelected(selected === key ? null : key)} className="text-[9px] opacity-30 hover:opacity-80 text-center mt-auto">+ Add</button>
            </div>
          );
        })}
      </div>
      {selected && (
        <div className="bg-sidebar rounded-xl p-4 border border-accent/30">
          <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-3">Add Post — {format(new Date(selected + 'T12:00'), 'EEE MMM d')}</p>
          <div className="flex gap-3">
            <select value={platform} onChange={e => setPlatform(e.target.value)} className="border-b border-line bg-transparent text-sm focus:outline-none text-accent font-bold">
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input value={caption} onChange={e => setCaption(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPost(selected)} placeholder="Post idea or caption…" className="flex-1 border-b border-line bg-transparent text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
            <button onClick={() => addPost(selected)} className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70">Add</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectsView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `creative_projects_${userId}_${plannerId}`;
  const [projects, setProjects] = useState<Project[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: '1', name: 'Brand Identity', client: 'Bloom Co.', deadline: '2026-05-01', status: 'In Progress', value: 2500 },
    ];
  });
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [deadline, setDeadline] = useState('');
  const [value, setValue] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(projects)); }, [projects, storageKey]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setProjects([...projects, { id: uuidv4(), name: name.trim(), client: client.trim(), deadline, status: 'Briefing', value: parseFloat(value) || 0 }]);
    setName(''); setClient(''); setDeadline(''); setValue('');
  };

  const totalPipeline = projects.filter(p => p.status !== 'Done').reduce((s, p) => s + p.value, 0);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-serif italic">Client Projects</h1>
          <p className="text-sm opacity-50">{projects.filter(p => p.status !== 'Done').length} active projects</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-1">Pipeline</p>
          <p className="text-2xl font-serif italic">${totalPipeline.toLocaleString()}</p>
        </div>
      </div>
      <div className="space-y-3 mb-6">
        {projects.map(p => (
          <div key={p.id} className="bg-sidebar rounded-xl p-4 border border-line group flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-sm">{p.name}</span>
                {p.client && <span className="text-[10px] opacity-50">{p.client}</span>}
              </div>
              {p.deadline && <p className="text-[11px] opacity-40">Due {format(new Date(p.deadline + 'T12:00'), 'MMM d')}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {p.value > 0 && <span className="text-sm font-serif italic text-accent">${p.value.toLocaleString()}</span>}
              <select value={p.status} onChange={e => setProjects(projects.map(x => x.id === p.id ? { ...x, status: e.target.value as Project['status'] } : x))} className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border focus:outline-none bg-transparent', STATUS_COLORS[p.status])}>
                {(['Briefing', 'In Progress', 'Review', 'Done'] as Project['status'][]).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => setProjects(projects.filter(x => x.id !== p.id))} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="text-sm opacity-50 italic">No projects yet.</p>}
      </div>
      <form onSubmit={add} className="grid grid-cols-2 gap-3 max-w-lg">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name…" className="border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
        <input value={client} onChange={e => setClient(e.target.value)} placeholder="Client…" className="border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
        <input value={deadline} onChange={e => setDeadline(e.target.value)} type="date" className="border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent opacity-60" />
        <input value={value} onChange={e => setValue(e.target.value)} type="number" min={0} placeholder="Value ($)" className="border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
        <button type="submit" className="col-span-2 text-left text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70">Add Project</button>
      </form>
    </div>
  );
}

function IdeasView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `creative_ideas_${userId}_${plannerId}`;
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [
      { id: '1', title: 'Tutorial: Branding on a Budget', tag: 'YouTube', note: 'Target small business owners', starred: true },
      { id: '2', title: 'Before/after client transformation', tag: 'Instagram', note: '', starred: false },
    ];
  });
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { const t = setTimeout(() => localStorage.setItem(storageKey, JSON.stringify(ideas)), 300); return () => clearTimeout(t); }, [ideas, storageKey]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIdeas([{ id: uuidv4(), title: title.trim(), tag: tag.trim(), note: note.trim(), starred: false }, ...ideas]);
    setTitle(''); setTag(''); setNote('');
  };

  const starred = ideas.filter(i => i.starred);
  const rest = ideas.filter(i => !i.starred);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-serif italic">Ideas Board</h1>
        <p className="text-sm opacity-50">{ideas.length} ideas · {starred.length} starred</p>
      </div>
      <div className="columns-2 gap-4 mb-8">
        {[...starred, ...rest].map(idea => (
          <div key={idea.id} className={cn('break-inside-avoid mb-4 p-4 rounded-xl border group', idea.starred ? 'border-accent/40 bg-accent/5' : 'border-line bg-sidebar')}>
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-semibold text-sm leading-snug">{idea.title}</span>
              <button onClick={() => setIdeas(ideas.map(x => x.id === idea.id ? { ...x, starred: !x.starred } : x))} className="text-base shrink-0 opacity-50 hover:opacity-100 transition-opacity">{idea.starred ? '⭐' : '☆'}</button>
            </div>
            {idea.tag && <span className="text-[9px] px-2 py-0.5 bg-accent/10 text-accent rounded-full font-bold inline-block mb-1">{idea.tag}</span>}
            {idea.note && <p className="text-xs opacity-50 leading-snug">{idea.note}</p>}
            <button onClick={() => setIdeas(ideas.filter(x => x.id !== idea.id))} className="text-[10px] text-red-800 mt-1 opacity-0 group-hover:opacity-100 transition-opacity block">Delete</button>
          </div>
        ))}
        {ideas.length === 0 && <p className="text-sm opacity-50 italic">No ideas yet.</p>}
      </div>
      <form onSubmit={add} className="flex gap-3 max-w-lg">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New idea…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
        <input value={tag} onChange={e => setTag(e.target.value)} placeholder="Tag" className="w-24 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
    </div>
  );
}

function IncomeView({ plannerId, userId }: { plannerId: string; userId: string }) {
  const storageKey = `creative_income_${userId}_${plannerId}`;
  const [entries, setEntries] = useState<Income[]>(() => {
    const s = localStorage.getItem(storageKey);
    return s ? JSON.parse(s) : [];
  });
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(entries)); }, [entries, storageKey]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    setEntries([{ id: uuidv4(), date: format(new Date(), 'yyyy-MM-dd'), client: client.trim(), description: description.trim(), amount: parseFloat(amount) }, ...entries]);
    setClient(''); setDescription(''); setAmount('');
  };

  const monthKey = format(new Date(), 'yyyy-MM');
  const monthTotal = entries.filter(e => e.date.startsWith(monthKey)).reduce((s, e) => s + e.amount, 0);
  const allTotal = entries.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-serif italic">Freelance Income</h1>
          <p className="text-sm opacity-50">Track every payment received.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-sidebar rounded-2xl p-5 border border-line">
          <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-2">This Month</p>
          <p className="text-3xl font-serif italic">${monthTotal.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-sidebar rounded-2xl p-5 border border-line">
          <p className="text-[10px] uppercase tracking-widest font-bold text-accent mb-2">All Time</p>
          <p className="text-3xl font-serif italic">${allTotal.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
      <form onSubmit={add} className="flex gap-3 mb-6 max-w-lg">
        <input value={client} onChange={e => setClient(e.target.value)} placeholder="Client…" className="w-28 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description…" className="flex-1 border-b border-line bg-transparent pb-2 text-sm focus:outline-none focus:border-accent placeholder:opacity-40" />
        <input value={amount} onChange={e => setAmount(e.target.value)} type="number" min="0" step="0.01" placeholder="$0.00" className="w-24 border-b border-line bg-transparent pb-2 text-sm text-right focus:outline-none focus:border-accent placeholder:opacity-40" />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">Add</button>
      </form>
      <div className="space-y-2">
        {entries.length === 0 ? <p className="text-sm opacity-50 italic">No income logged yet.</p> : entries.map(e => (
          <div key={e.id} className="flex items-center gap-4 py-3 border-b border-canvas group">
            <span className="text-[10px] opacity-40 w-20 shrink-0">{format(new Date(e.date + 'T12:00'), 'MMM d, yyyy')}</span>
            {e.client && <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full font-bold shrink-0">{e.client}</span>}
            <span className="text-sm flex-1">{e.description}</span>
            <span className="text-sm font-serif italic text-accent shrink-0">${e.amount.toFixed(2)}</span>
            <button onClick={() => setEntries(entries.filter(x => x.id !== e.id))} className="text-[10px] text-red-800 opacity-0 group-hover:opacity-100 transition-opacity">Del</button>
          </div>
        ))}
      </div>
    </div>
  );
}
