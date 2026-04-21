import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, usePurchases, PRODUCTS } from '../store';
import { useCloudSync } from '../lib/useCloudSync';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  getDay, 
  isSameDay
} from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '../lib/utils';
import { Moon, Sun, Printer, Maximize, Minimize, Play, Pause, RotateCcw, Headphones, Mic, MicOff, Brain, Coffee, Sparkles, Smile, ListChecks, Calendar, Receipt, Briefcase, BookHeart } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

// --- Reusable Views ---

function TaskView({ plannerId, userId, title, subtitle, storagePrefix, initialTasks }: any) {
  const dateKey = format(new Date(), 'yyyy-MM-dd');
  const docId = `${storagePrefix}_${plannerId}_${dateKey}`;
  const { t } = useTranslation();
  
  const [tasks, setTasks, isSyncing] = useCloudSync<Task[]>(docId, initialTasks || []);
  const [newTask, setNewTask] = useState("");

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks((prev) => [...prev, { id: uuidv4(), text: newTask.trim(), completed: false }]);
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter((t: Task) => t.completed).length;

  // --- Pomodoro Logic ---
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);
  const [soundActive, setSoundActive] = useState(false);

  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const audioSourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  const toggleSound = () => {
    if (soundActive) {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
      setSoundActive(false);
      return;
    }

    try {
      const AudioCtxConstructor = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxConstructor();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; 
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;
      audioSourceRef.current = noiseSource;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400; 

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.5; 

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      noiseSource.start();
      setSoundActive(true);
    } catch (e) {
      console.warn("Áudio não suportado", e);
    }
  };

  useEffect(() => {
    let interval: any;
    if (pomoActive && pomoTime > 0) {
      interval = setInterval(() => setPomoTime(t => t - 1), 1000);
    } else if (pomoTime === 0) {
      setPomoActive(false);
      // Pomo finished!
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoTime]);

  const togglePomo = () => {
    if (!pomoActive && !document.fullscreenElement) {
       document.documentElement.requestFullscreen().catch(() => {});
    }
    setPomoActive(!pomoActive);
  };
  const resetPomo = () => {
    setPomoActive(false);
    setPomoTime(25 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- Voice to Task Logic ---
  const [isListening, setIsListening] = useState(false);
  const toggleVoice = (e: React.MouseEvent) => {
    e.preventDefault();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta digitação por voz.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNewTask(prev => prev + (prev.length > 0 ? " " : "") + transcript);
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      console.warn("SpeechRec error:", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  return (
    <div className={cn("animate-in fade-in duration-500 h-full flex flex-col", isSyncing && "opacity-70")}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 md:mb-10 gap-4 shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{t(title)}</h1>
            <p className="text-xs md:text-sm opacity-50">{format(new Date(), 'EEEE, MMMM do')} • {t(subtitle)}</p>
          </div>
          
          {/* Pomodoro Pill */}
          <div className="hidden sm:flex items-center gap-3 bg-sidebar border border-line rounded-full px-4 py-2 shadow-sm">
             <div className="font-serif italic font-bold text-accent text-lg w-14 text-center">
               {formatTime(pomoTime)}
             </div>
             <div className="h-4 w-[1px] bg-line"></div>
             <button onClick={togglePomo} className="text-ink hover:text-accent transition-colors" title="Iniciar/Pausar Foco">
                {pomoActive ? <Pause size={16} /> : <Play size={16} />}
             </button>
             <button onClick={resetPomo} className="text-ink hover:text-accent transition-colors" title="Resetar Timer">
                <RotateCcw size={16} />
             </button>
             <button onClick={toggleSound} className={cn("transition-colors ml-1", soundActive ? "text-accent animate-pulse" : "text-ink/40 hover:text-ink")} title="Ruído Marrom">
                <Headphones size={16} />
             </button>
          </div>
        </div>
        <div className="flex space-x-2 print:hidden">
          <button onClick={() => document.documentElement.classList.toggle('dark')} title={t('dark_mode')} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-line flex items-center justify-center text-ink hover:bg-sidebar transition-colors">
             <Moon size={16} className="hidden dark:block" />
             <Sun size={16} className="block dark:hidden" />
          </button>
          <button onClick={() => window.print()} title={t('print_planner')} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-line flex items-center justify-center text-ink hover:bg-sidebar transition-colors">
            <Printer size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 flex-1 overflow-auto pb-8">
        {/* Column 1 */}
        <div className="space-y-8">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">{t('quick_add')}</label>
            <form onSubmit={addTask} className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder={t('task_placeholder')}
                className="flex-1 w-full border-b border-line bg-transparent pb-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors placeholder:opacity-40"
              />
              <button type="button" onClick={toggleVoice} className={cn("px-2 hover:opacity-70 transition-colors", isListening ? "text-red-500 animate-pulse" : "text-ink")} title="Despejo por Voz">
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">
                {t('add_btn')}
              </button>
            </form>
          </div>
          
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">{t('trackers')}</label>
            <div className="flex space-x-4">
              <div className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center text-xs font-bold text-ink">
                {completedCount}/{tasks.length}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-[11px] font-medium mb-1 uppercase tracking-widest text-ink">{t('action_items')}</div>
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
          <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">{t('checklist')}</label>
          <ul className="space-y-4">
            {tasks.length === 0 ? (
               <li className="text-sm opacity-50 italic">{t('no_tasks')}</li>
            ) : (
              tasks.map((task: Task) => (
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
                    {t(task.text)}
                  </span>
                  <button 
                     onClick={() => removeTask(task.id)}
                     className="text-[10px] uppercase tracking-widest font-bold text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {t('del_btn')}
                  </button>
                </li>
              ))
            )}
          </ul>

          <div className="mt-12 p-6 bg-sidebar rounded-2xl border border-dashed border-accent/30">
            <h5 className="text-sm font-serif italic mb-2 text-ink">{t('daily_inspiration')}</h5>
            <p className="text-xs opacity-50 italic">{t('inspiration_quote')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextAreaView({ plannerId, userId, title, subtitle, storagePrefix, placeholder }: any) {
  const docId = `${storagePrefix}_${plannerId}`;
  const [content, setContent, isSyncing] = useCloudSync<string>(docId, "");
  const { t } = useTranslation();

  return (
    <div className={cn("animate-in fade-in duration-500 h-full flex flex-col", isSyncing && "opacity-70")}>
      <div className="flex justify-between items-start mb-6 md:mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{t(title)}</h1>
          <p className="text-xs md:text-sm opacity-50">{t(subtitle)}</p>
        </div>
        <div className="flex space-x-2 print:hidden">
          <button onClick={() => document.documentElement.classList.toggle('dark')} title={t('dark_mode')} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-line flex items-center justify-center text-ink hover:bg-sidebar transition-colors">
             <Moon size={16} className="hidden dark:block" />
             <Sun size={16} className="block dark:hidden" />
          </button>
          <button onClick={() => window.print()} title={t('print_planner')} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-line flex items-center justify-center text-ink hover:bg-sidebar transition-colors">
            <Printer size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col pb-4 md:pb-8 min-h-[300px]">
        <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-2 md:mb-3">{t('workspace')}</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t(placeholder)}
          className="flex-1 w-full border border-line bg-sidebar rounded-lg p-4 md:p-6 text-sm font-serif leading-relaxed text-ink focus:outline-none focus:border-accent transition-colors resize-none shadow-inner"
        />
      </div>
    </div>
  );
}

function HabitsView({ plannerId, userId, title, subtitle, storagePrefix, initialHabits }: any) {
  const docId = `${storagePrefix}_${plannerId}`;
  const { t } = useTranslation();
  
  const [habits, setHabits, isSyncing] = useCloudSync<{ id: string; name: string; days: Record<string, boolean> }[]>(docId, initialHabits || []);
  const [newHabit, setNewHabit] = useState("");

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setHabits((prev) => [...prev, { id: uuidv4(), name: newHabit.trim(), days: {} }]);
    setNewHabit("");
  };

  const removeHabit = (id: string) => {
    setHabits((prev) => prev.filter(h => h.id !== id));
  };

  const toggleDay = (habitId: string, dayPrefix: string) => {
    setHabits((prev) => prev.map(h => {
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
    <div className={cn("animate-in fade-in duration-500 flex flex-col h-full", isSyncing && "opacity-70")}>
      <div className="flex justify-between items-start mb-6 md:mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{t(title)}</h1>
          <p className="text-xs md:text-sm opacity-50">{t(subtitle)}</p>
        </div>
      </div>

      <div className="mb-8 md:mb-10 overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse min-w-[400px] md:min-w-[500px]">
          <thead>
            <tr>
              <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-accent w-1/3">{t('trackers')}</th>
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
            {habits.map((habit: any) => (
              <tr key={habit.id} className="border-t border-line group">
                <td className="py-4 text-sm font-medium text-ink">{t(habit.name)}</td>
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
                    {t('del_btn')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {habits.length === 0 && (
          <div className="text-center py-8 opacity-50 text-sm font-serif italic border-t border-line">{t('no_habits')}</div>
        )}
      </div>

      <form onSubmit={addHabit} className="flex gap-2 max-w-sm mt-auto">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder={t('habit_placeholder')}
          className="flex-1 border-b border-line bg-transparent pb-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors placeholder:opacity-40"
        />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">
          {t('add_btn')}
        </button>
      </form>
    </div>
  );
}

function TableDataView({ plannerId, userId, title, subtitle, storagePrefix, columnHeaders, initialData }: any) {
  const docId = `${storagePrefix}_${plannerId}`;
  const { t } = useTranslation();
  
  const [rows, setRows, isSyncing] = useCloudSync<{id: string, col1: string, col2: string}[]>(docId, initialData || []);
  
  const [newVal1, setNewVal1] = useState("");
  const [newVal2, setNewVal2] = useState("");

  const addRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVal1.trim()) return;
    setRows((prev) => [...prev, { id: uuidv4(), col1: newVal1.trim(), col2: newVal2.trim() }]);
    setNewVal1("");
    setNewVal2("");
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter(r => r.id !== id));
  };

  return (
    <div className={cn("animate-in fade-in duration-500 flex flex-col h-full", isSyncing && "opacity-70")}>
      <div className="flex justify-between items-start mb-6 md:mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{t(title)}</h1>
          <p className="text-xs md:text-sm opacity-50">{t(subtitle)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse min-w-[400px] md:min-w-[500px]">
          <thead>
            <tr>
              <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-accent w-1/2">{t(columnHeaders[0])}</th>
              <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-accent w-1/3 text-center">{t(columnHeaders[1])}</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={row.id} className="border-t border-line group">
                <td className="py-4 text-sm font-medium text-ink">{t(row.col1)}</td>
                <td className="py-4 text-sm font-serif italic text-ink text-center">{t(row.col2)}</td>
                <td className="py-4 text-right">
                  <button 
                    onClick={() => removeRow(row.id)}
                    className="text-[10px] uppercase tracking-widest font-bold text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {t('del_btn')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="text-center py-8 opacity-50 text-sm font-serif italic border-t border-line">{t('no_data')}</div>
        )}
      </div>

      <form onSubmit={addRow} className="flex gap-4 max-w-lg mt-auto pt-6 border-t border-line shrink-0">
        <input
          type="text"
          value={newVal1}
          onChange={(e) => setNewVal1(e.target.value)}
          placeholder={t(columnHeaders[0])}
          className="flex-1 border-b border-line bg-transparent pb-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors placeholder:opacity-40"
        />
        <input
          type="text"
          value={newVal2}
          onChange={(e) => setNewVal2(e.target.value)}
          placeholder={t(columnHeaders[1])}
          className="w-1/3 border-b border-line bg-transparent pb-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors placeholder:opacity-40"
        />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">
          {t('add_btn')}
        </button>
      </form>
    </div>
  );
}

// --- Specific Views ---

function MonthlyCalendarView({ plannerId, userId, title, subtitle, storagePrefix }: any) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthKey = format(currentMonth, 'yyyy-MM');
  const docId = `${storagePrefix}_${plannerId}_${monthKey}`;
  const { t } = useTranslation();
  
  const [notes, setNotes, isSyncing] = useCloudSync<Record<string, string>>(docId, {});

  const handleNoteChange = (dayKey: string, val: string) => {
    setNotes((prev: Record<string, string>) => ({ ...prev, [dayKey]: val }));
  };

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });
  const startDayOfWeek = getDay(start); // 0 (Sun) to 6 (Sat)
  
  const emptyDaysBefore = Array.from({ length: startDayOfWeek }, (_, i) => i);

  return (
    <div className={cn("animate-in fade-in duration-500 flex flex-col h-full", isSyncing && "opacity-70")}>
      <div className="flex justify-between items-center mb-6 md:mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{format(currentMonth, 'MMMM yyyy')}</h1>
          <p className="text-xs md:text-sm opacity-50">{t(subtitle)}</p>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-xs hover:bg-sidebar transition-colors text-ink">&larr;</button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-xs hover:bg-sidebar transition-colors text-ink">&rarr;</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto rounded-xl border border-line bg-sidebar shadow-inner flex flex-col">
        <div className="grid grid-cols-7 gap-px bg-line shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="bg-sidebar p-2 text-center text-[10px] uppercase font-bold text-accent tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-line flex-1 min-h-[400px]">
          {emptyDaysBefore.map(i => (
            <div key={`empty-${i}`} className="bg-canvas/50" />
          ))}
          {days.map(day => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const isToday = isSameDay(day, new Date());
            return (
              <div key={dayKey} className={cn("bg-sidebar p-2 flex flex-col h-full min-h-[80px] hover:bg-sidebar/50 transition-colors", isToday && "bg-accent/5")}>
                <span className={cn("text-xs font-serif italic mb-1", isToday ? "font-bold text-accent" : "text-ink opacity-50")}>{format(day, 'd')}</span>
                <textarea 
                  value={notes[dayKey] || ''}
                  onChange={e => handleNoteChange(dayKey, e.target.value)}
                  className="w-full flex-1 resize-none bg-transparent outline-none text-xs text-ink/80 leading-relaxed font-sans scrollbar-hide"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DailyScheduleView({ plannerId, userId, title, subtitle, storagePrefix }: any) {
  const dateKey = format(new Date(), 'yyyy-MM-dd');
  const docId = `${storagePrefix}_${plannerId}_${dateKey}`;
  const HOURS = Array.from({length: 17}, (_, i) => i + 6); // 6 AM to 10 PM
  const { t } = useTranslation();
  
  const [data, setData, isSyncing] = useCloudSync<any>(docId, {
    schedule: {}, // { "6": "Wake up", "7": "Gym" }
    priorities: ["", "", ""]
  });

  const handleScheduleChange = (hour: number | string, val: string) => {
    setData((prev: any) => ({ ...prev, schedule: { ...prev.schedule, [hour]: val } }));
  };

  const handlePriorityChange = (index: number, val: string) => {
    setData((prev: any) => {
      const newP = [...prev.priorities];
      newP[index] = val;
      return { ...prev, priorities: newP };
    });
  };

  return (
    <div className={cn("animate-in fade-in duration-500 h-full flex flex-col", isSyncing && "opacity-70")}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 md:mb-10 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{t(title)}</h1>
          <p className="text-xs md:text-sm opacity-50">{format(new Date(), 'EEEE, MMMM do')} • {t(subtitle)}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-y-auto pr-2 pb-4">
        {/* Left: Schedule */}
        <div className="flex-1">
          <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-4 block">{t('hourly_schedule')}</label>
          <div className="space-y-1">
            {HOURS.map(hour => {
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const displayHour = hour > 12 ? hour - 12 : hour;
              return (
                <div key={hour} className="flex items-center group">
                  <div className="w-14 text-[10px] font-bold text-ink opacity-40 group-hover:text-accent transition-colors text-right pr-4">
                    {displayHour}:00 {ampm}
                  </div>
                  <input 
                    type="text" 
                    value={data.schedule[hour] || ''}
                    onChange={e => handleScheduleChange(hour, e.target.value)}
                    className="flex-1 border-b border-line bg-transparent py-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors text-ink placeholder:opacity-20"
                    placeholder="—"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Priorities */}
        <div className="w-full lg:w-64 shrink-0 flex flex-col gap-8">
          <div>
            <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-4 block">{t('top_priorities')}</label>
            <div className="space-y-4">
              {[0, 1, 2].map(i => (
                <div key={`p-${i}`} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border-2 border-accent flex items-center justify-center text-[10px] font-bold text-accent shrink-0 mt-0.5">{i+1}</div>
                  <textarea 
                    value={data.priorities[i]}
                    onChange={e => handlePriorityChange(i, e.target.value)}
                    className="flex-1 border-b border-line bg-transparent pb-1 text-sm font-sans focus:outline-none focus:border-accent transition-colors text-ink resize-none min-h-[2rem]"
                    placeholder={t('focus_item')}
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 bg-sidebar rounded-2xl border border-dashed border-accent/30 p-6 flex flex-col">
            <h5 className="text-[10px] uppercase font-bold text-accent tracking-widest mb-4">{t('daily_notes')}</h5>
            <textarea 
              value={data.schedule['notes'] || ''}
              onChange={e => handleScheduleChange('notes', e.target.value)}
              className="flex-1 bg-transparent border-none resize-none focus:outline-none text-sm font-serif italic leading-relaxed text-ink/80 placeholder:opacity-40"
              placeholder={t('thoughts_placeholder')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function WeeklyMealView({ plannerId, userId, title, subtitle, storagePrefix }: any) {
  const docId = `${storagePrefix}_${plannerId}`;
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const { t } = useTranslation();

  const init: Record<string, Record<string, string>> = {};
  DAYS.forEach(d => {
    init[d] = {};
    MEALS.forEach(m => init[d][m] = '');
  });

  const [meals, setMeals, isSyncing] = useCloudSync<Record<string, Record<string, string>>>(docId, init);

  const handleChange = (day: string, meal: string, val: string) => {
    setMeals((prev: Record<string, Record<string, string>>) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: val
      }
    }));
  };

  return (
    <div className={cn("animate-in fade-in duration-500 flex flex-col h-full", isSyncing && "opacity-70")}>
      <div className="flex justify-between items-start mb-6 md:mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{t(title)}</h1>
          <p className="text-xs md:text-sm opacity-50">{t(subtitle)}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-line bg-sidebar shadow-inner pb-4">
        <div className="min-w-[600px] p-4 sm:p-6">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-4 border-b border-line pb-2">
            <div className="text-[10px] uppercase font-bold text-accent tracking-widest pl-2">{t('day_col')}</div>
            <div className="text-[10px] uppercase font-bold text-accent tracking-widest leading-tight">{t('meal_breakfast')}</div>
            <div className="text-[10px] uppercase font-bold text-accent tracking-widest leading-tight">{t('meal_lunch')}</div>
            <div className="text-[10px] uppercase font-bold text-accent tracking-widest leading-tight">{t('meal_dinner')}</div>
            <div className="text-[10px] uppercase font-bold text-accent tracking-widest leading-tight">{t('meal_snacks')}</div>
          </div>
          <div className="flex flex-col gap-3">
            {DAYS.map(day => (
              <div key={day} className="grid grid-cols-5 gap-2 sm:gap-4 items-center group bg-sidebar/50 p-2 rounded-lg border border-transparent hover:border-line transition-colors">
                <div className="text-sm font-serif font-bold italic opacity-70 group-hover:opacity-100 pl-2 text-ink">{day}</div>
                {MEALS.map(meal => (
                  <input
                    key={`${day}-${meal}`}
                    value={meals[day]?.[meal] || ''}
                    onChange={e => handleChange(day, meal, e.target.value)}
                    placeholder="..."
                    className="w-full bg-sidebar border border-transparent hover:border-line focus:border-accent text-xs sm:text-sm px-2 py-2 sm:py-1.5 rounded transition-all focus:outline-none focus:shadow-sm text-ink font-sans placeholder:opacity-30"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeightTrackerView({ plannerId, userId, title, subtitle, storagePrefix }: any) {
  const docId = `${storagePrefix}_${plannerId}`;
  const { t } = useTranslation();
  const [data, setData, isSyncing] = useCloudSync<any>(docId, {
    startWeight: '80.0',
    goalWeight: '65.0',
    unit: 'kg',
    logs: [] // {id, date, weight, note}
  });

  const [newWeight, setNewWeight] = useState("");
  const [newNote, setNewNote] = useState("");

  const addLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight.trim()) return;
    
    const newLog = {
      id: uuidv4(),
      date: format(new Date(), 'MMM dd, yyyy'),
      weight: parseFloat(newWeight).toFixed(1),
      note: newNote.trim()
    };
    
    setData((prev: any) => ({ ...prev, logs: [newLog, ...prev.logs] }));
    setNewWeight("");
    setNewNote("");
  };

  const removeLog = (id: string) => {
    setData((prev: any) => ({ ...prev, logs: prev.logs.filter((l: any) => l.id !== id) }));
  };

  const startW = parseFloat(data.startWeight) || 0;
  const goalW = parseFloat(data.goalWeight) || 0;
  const currentW = data.logs.length > 0 ? parseFloat(data.logs[0].weight) : startW;
  
  const totalToLose = Math.abs(startW - goalW);
  const lostSoFar = startW > goalW ? (startW - currentW) : (currentW - startW); // supports weight gain goals too
  const progressPercent = totalToLose > 0 
    ? Math.max(0, Math.min(100, (lostSoFar / totalToLose) * 100))
    : 0;

  return (
    <div className={cn("animate-in fade-in duration-500 flex flex-col h-full", isSyncing && "opacity-70")}>
      <div className="flex justify-between items-start mb-6 md:mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{t(title)}</h1>
          <p className="text-xs md:text-sm opacity-50">{t(subtitle)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {/* Goal Config & Progress */}
        <div className="p-6 bg-sidebar rounded-2xl border border-line mb-8 shadow-inner">
          <div className="flex flex-col md:flex-row gap-6 mb-8 border-b border-line pb-6">
             <div className="flex-1">
               <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-2 block">{t('start_weight')}</label>
               <div className="flex items-end">
                 <input 
                   type="number" step="0.1" 
                   value={data.startWeight} 
                   onChange={e => setData({...data, startWeight: e.target.value})} 
                   className="bg-transparent w-24 outline-none font-serif text-3xl text-ink placeholder:opacity-30 border-b border-line focus:border-accent transition-colors" 
                 />
                 <span className="text-sm opacity-50 ml-2 mb-1">{data.unit}</span>
               </div>
             </div>
             <div className="flex-1 md:border-l border-line md:pl-6">
               <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-2 block">{t('current_weight')}</label>
               <div className="font-serif text-3xl text-ink">
                 {typeof currentW === 'number' ? currentW.toFixed(1) : currentW} <span className="text-sm opacity-50 font-sans">{data.unit}</span>
               </div>
             </div>
             <div className="flex-1 md:border-l border-line md:pl-6">
               <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-2 block">{t('goal_weight')}</label>
               <div className="flex items-end">
                 <input 
                   type="number" step="0.1" 
                   value={data.goalWeight} 
                   onChange={e => setData({...data, goalWeight: e.target.value})} 
                   className="bg-transparent w-24 outline-none font-serif text-3xl text-ink placeholder:opacity-30 border-b border-line focus:border-accent transition-colors" 
                 />
                 <select 
                   value={data.unit} 
                   onChange={e => setData({...data, unit: e.target.value})} 
                   className="bg-transparent text-sm opacity-50 outline-none ml-2 mb-1 cursor-pointer"
                 >
                   <option value="kg">kg</option>
                   <option value="lbs">lbs</option>
                 </select>
               </div>
             </div>
          </div>

          <div className="mb-2 flex justify-between text-[10px] font-bold text-ink/70 uppercase tracking-widest">
            <span>{t('progress_goal')}</span>
            <span>{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full bg-line rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Entry Form */}
        <div className="mb-8">
           <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-3 block">{t('new_checkin')}</label>
           <form onSubmit={addLog} className="flex gap-4">
             <input type="number" step="0.1" placeholder={`${t('weight_placeholder')} (${data.unit})`} value={newWeight} onChange={e => setNewWeight(e.target.value)} className="w-24 md:w-32 border-b border-line bg-transparent pb-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors placeholder:opacity-40 text-ink" />
             <input type="text" placeholder={t('notes_placeholder')} value={newNote} onChange={e => setNewNote(e.target.value)} className="flex-1 border-b border-line bg-transparent pb-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors placeholder:opacity-40 text-ink" />
             <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-white bg-accent hover:opacity-90 px-5 rounded transition-opacity shadow-sm">{t('log_btn')}</button>
           </form>
        </div>

        {/* History Table */}
        <div className="pt-6 border-t border-line">
          <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-4 block">{t('history_log')}</label>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr>
                  <th className="pb-3 text-xs font-serif italic text-ink/50 w-1/4">{t('date_col')}</th>
                  <th className="pb-3 text-xs font-serif italic text-ink/50 w-1/4">{t('weight_col')}</th>
                  <th className="pb-3 text-xs font-serif italic text-ink/50">{t('notes_reflections')}</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log: any) => (
                  <tr key={log.id} className="border-t border-line/50 group hover:bg-sidebar transition-colors">
                    <td className="py-4 text-sm font-sans text-ink pl-2">{log.date}</td>
                    <td className="py-4 text-sm font-serif italic text-ink font-bold">{log.weight} {data.unit}</td>
                    <td className="py-4 text-sm text-ink opacity-70">{log.note}</td>
                    <td className="py-4 text-right pr-2">
                      <button onClick={() => removeLog(log.id)} className="text-[10px] uppercase tracking-widest font-bold text-red-800 opacity-0 group-hover:opacity-100 transition-opacity p-2">{t('del_btn')}</button>
                    </td>
                  </tr>
                ))}
                {data.logs.length === 0 && (
                  <tr><td colSpan={4} className="py-10 text-center text-sm font-serif italic opacity-50 border-t border-line/50">{t('no_logs')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Planner Configs (Multi-Tenant Architecture) ---

const PLANNER_CONFIGS: Record<string, any> = {
  'adhd-planner-2026': {
    bundleName: 'bundle_adhd',
    tabs: [
      { id: 'focus', label: 'Foco de Hoje', icon: Brain, color: '#B8E1FF', component: TaskView, props: { title: "Foco Profundo", subtitle: "Prioridade #1", storagePrefix: "adhd_focus" } },
      { id: 'dopamine', label: 'Dopamina', icon: Sparkles, color: '#FFFFCC', component: TaskView, props: { title: "Dopamine Menu", subtitle: "Recarregue as energias", storagePrefix: "adhd_dopamine" } },
      { id: 'braindump', label: 'Brain Dump', icon: Coffee, color: '#FFF5E1', component: TextAreaView, props: { title: "Despejo Caótico", subtitle: "Limpeza de RAM mental", storagePrefix: "adhd_bd" } },
      { id: 'projects', label: 'Projetos', icon: Briefcase, color: '#CCFFCC', component: TableDataView, props: { title: "Meus Projetos", subtitle: "Visão Geral", storagePrefix: "adhd_proj", columnHeaders: ["Projeto", "Status"] } },
      { id: 'finances', label: 'Finanças', icon: Receipt, color: '#FFCCE5', component: TableDataView, props: { title: "Controle Financeiro", subtitle: "Entradas/Saídas", storagePrefix: "adhd_money", columnHeaders: ["Item", "Valor"] } },
      { id: 'notes', label: 'Anotações', icon: ListChecks, color: '#E5CCFF', component: TextAreaView, props: { title: "Notas Rápidas", subtitle: "Idéias voláteis", storagePrefix: "adhd_notes" } }
    ]
  },
  'it-girl-wellness': {
    bundleName: 'bundle_wellness',
    tabs: [
      { id: 'routine_am', label: 'Morning', icon: Sun, color: '#FFFFCC', component: TaskView, props: { title: "Rotina Matinal", subtitle: "Comece Radiante", storagePrefix: "well_am" } },
      { id: 'routine_pm', label: 'Night', icon: Moon, color: '#B8E1FF', component: TaskView, props: { title: "Rotina Noturna", subtitle: "Desacelere", storagePrefix: "well_pm" } },
      { id: 'journal', label: 'Journal', icon: BookHeart, color: '#E5CCFF', component: TextAreaView, props: { title: "Diário Mágico", subtitle: "Gratidão e Reflexão", storagePrefix: "well_journal" } },
      { id: 'selfcare', label: 'Self-Care', icon: Sparkles, color: '#FFCCE5', component: TaskView, props: { title: "Checklist Autocuidado", subtitle: "Priorize-se", storagePrefix: "well_self" } },
      { id: 'fitness', label: 'Fitness', icon: ListChecks, color: '#CCFFCC', component: HabitsView, props: { title: "Treino & Movimento", subtitle: "Atividade Física", storagePrefix: "well_fit" } },
      { id: 'mood', label: 'Mood', icon: Smile, color: '#FFE5CC', component: HabitsView, props: { title: "Rastreador de Humor", subtitle: "Sentimentos", storagePrefix: "well_mood" } }
    ]
  },
  'small-business-os': {
    bundleName: 'bundle_creator',
    tabs: [
      { id: 'kanban', label: 'Sprint', icon: Briefcase, color: '#94a3b8', component: TableDataView, props: { title: "Sprint Kanban", subtitle: "Tarefas do Negócio", storagePrefix: "biz_tasks", columnHeaders: ["Tarefa", "Status"] } },
      { id: 'cashflow', label: 'Fluxo', icon: Receipt, color: '#10b981', component: TableDataView, props: { title: "Fluxo de Caixa", subtitle: "Financeiro", storagePrefix: "biz_cash", columnHeaders: ["Descrição", "Valor"] } },
      { id: 'clients', label: 'Clientes', icon: Briefcase, color: '#6366f1', component: TableDataView, props: { title: "CRM / Clientes", subtitle: "Contatos e Status", storagePrefix: "biz_crm", columnHeaders: ["Nome", "Status"] } },
      { id: 'brainstorm', label: 'Lançamentos', icon: Sparkles, color: '#0ea5e9', component: TextAreaView, props: { title: "Brainstorm Estratégico", subtitle: "Novos Produtos", storagePrefix: "biz_launch" } }
    ]
  },
  'undated-digital-planner': {
    bundleName: 'bundle_undated',
    tabs: [
      {
        id: 'monthly',
        label: 'tab_monthly',
        component: MonthlyCalendarView,
        props: {
          title: "title_monthly_spread",
          subtitle: "sub_monthly",
          storagePrefix: "monthly_view"
        }
      },
      {
        id: 'daily',
        label: 'tab_daily',
        component: DailyScheduleView,
        props: {
          title: "title_daily_agenda",
          subtitle: "sub_daily",
          storagePrefix: "daily_agenda"
        }
      },
      {
        id: 'tasks',
        label: 'tab_run_tasks',
        component: TaskView,
        props: {
          title: "title_run_tasks",
          subtitle: "sub_run_tasks",
          storagePrefix: "running_tasks",
          initialTasks: [
            { id: 't1', text: 'task_call_doc', completed: false },
            { id: 't2', text: 'task_pay_bills', completed: true },
            { id: 't3', text: 'task_read_20', completed: false }
          ]
        }
      }
    ]
  },
  'meal-prep-weekly': {
    bundleName: 'bundle_nutrition',
    tabs: [
      {
        id: 'meal-plan',
        label: 'tab_weekly',
        component: WeeklyMealView,
        props: {
          title: "title_weekly_menu",
          subtitle: "sub_weekly_menu",
          storagePrefix: "mealplan_weekly"
        }
      },
      {
        id: 'groceries',
        label: 'tab_groceries',
        component: TaskView,
        props: {
          title: "title_groceries",
          subtitle: "sub_groceries",
          storagePrefix: "groceries",
          initialTasks: [
            { id: 'g1', text: 'groc_1', completed: false },
            { id: 'g2', text: 'groc_2', completed: false },
            { id: 'g3', text: 'groc_3', completed: false }
          ]
        }
      },
      {
        id: 'recipes',
        label: 'tab_recipes',
        component: TableDataView,
        props: {
          title: "title_recipes",
          subtitle: "sub_recipes",
          storagePrefix: "recipes",
          columnHeaders: ["col_recipe", "col_prep"],
          initialData: [
            { id: 'r1', col1: 'rec_1', col2: 'rec_val_1' },
            { id: 'r2', col1: 'rec_2', col2: 'rec_val_2' }
          ]
        }
      }
    ]
  },
  'weight-loss-tracker': {
    bundleName: 'bundle_fitness',
    tabs: [
      {
        id: 'progress',
        label: 'tab_progress',
        component: WeightTrackerView,
        props: {
          title: "title_progress",
          subtitle: "sub_progress",
          storagePrefix: "weight_progress"
        }
      },
      {
        id: 'measurements',
        label: 'tab_measures',
        component: TableDataView,
        props: {
          title: "title_measures",
          subtitle: "sub_measures",
          storagePrefix: "measurements_tracker",
          columnHeaders: ["col_body_part", "col_size"],
          initialData: [
            { id: 'm1', col1: 'meas_1', col2: 'meas_val_1' },
            { id: 'm2', col1: 'meas_2', col2: 'meas_val_2' }
          ]
        }
      },
      {
        id: 'milestones',
        label: 'tab_milestones',
        component: TaskView,
        props: {
          title: "title_milestones",
          subtitle: "sub_milestones",
          storagePrefix: "milestones",
          initialTasks: [
            { id: 'ms1', text: 'ms_1', completed: false },
            { id: 'ms2', text: 'ms_2', completed: false },
            { id: 'ms3', text: 'ms_3', completed: false }
          ]
        }
      }
    ]
  }
};

// --- App Container ---

export default function PlannerApp() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { purchasedIds } = usePurchases();
  const { t } = useTranslation();
  
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scratchpad, setScratchpad] = useState(() => localStorage.getItem('planner_scratchpad') || '');

  useEffect(() => {
    localStorage.setItem('planner_scratchpad', scratchpad);
  }, [scratchpad]);

  useEffect(() => {
    setActiveTabId(''); // Reset tab selection when planner ID changes
  }, [id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  if (!user) return <Navigate to="/login" replace />;
  if (!id || !purchasedIds.includes(id)) return <Navigate to="/dashboard" replace />;

  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return <Navigate to="/dashboard" replace />;

  // Resolve Template
  const config = PLANNER_CONFIGS[id] || PLANNER_CONFIGS['adhd-planner-2026'];
  const currentTabId = activeTabId || config.tabs[0].id;
  const activeTabConfig = config.tabs.find((t: any) => t.id === currentTabId) || config.tabs[0];
  const ActiveComponent = activeTabConfig.component;

  return (
    <div className="flex flex-col md:flex-row h-full w-full relative">
      {/* Mobile Topbar */}
      {!isFullscreen && (
        <div className="md:hidden flex items-center justify-between p-4 border-b border-line bg-sidebar shrink-0 shadow-sm z-10">
          <Link to="/dashboard" className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1">
            &larr; {t('back_library')}
          </Link>
          <span className="font-serif italic font-bold text-sm truncate max-w-[200px]">{t(product.nameKey)}</span>
        </div>
      )}

      {/* Sidebar Navigator */}
      {!isFullscreen && (
        <aside className="hidden md:flex w-72 border-r border-line bg-sidebar flex-col shrink-0 overflow-y-auto">
          {/* Header */}
          <div className="p-6 pb-2">
            <Link to="/dashboard" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-ink/50 hover:text-accent transition-colors mb-6 group">
              <span className="w-5 h-5 rounded border border-line flex items-center justify-center mr-2 group-hover:bg-paper transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </span>
              {t('back_library')}
            </Link>
            
            <div className="flex bg-paper border border-line rounded-xl p-3 items-center shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent mr-3 border border-accent/20">
                <BookHeart size={20} strokeWidth={1.5} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] uppercase font-bold tracking-widest text-ink/50">Planner Atual</p>
                <h3 className="font-serif italic font-bold text-base truncate text-ink">{t(product.nameKey)}</h3>
              </div>
            </div>
          </div>

          {/* Useful Widgets */}
          <div className="px-6 py-6 space-y-6 flex-1 flex flex-col overflow-hidden">
            
            {/* Quick Calendar Widget */}
            <div className="bg-paper border border-line rounded-xl p-4 shadow-sm shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-ink/70">Este Mês</h4>
                <Calendar size={14} className="text-accent" />
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['D','S','T','Q','Q','S','S'].map((d, i) => (
                  <div key={i} className="text-[8px] font-bold text-ink/40">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Simplified Calendar Grid for visual purpose */}
                {[...Array(30)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "text-xs py-1 rounded-md flex items-center justify-center font-serif text-sm",
                      i + 1 === new Date().getDate() 
                        ? "bg-accent text-white font-bold shadow-sm" 
                        : "text-ink/70 hover:bg-line/30 cursor-pointer"
                    )}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Scratchpad (Quick Notes) */}
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex flex-col flex-1 min-h-[150px]">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-accent">Scratchpad</h4>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent/60"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
              </div>
              <textarea 
                className="w-full bg-transparent resize-none flex-1 outline-none text-sm text-ink/80 placeholder:text-ink/30 font-serif"
                placeholder="Rascunhe ideias rápidas aqui..."
                value={scratchpad}
                onChange={(e) => setScratchpad(e.target.value)}
              />
            </div>
            
          </div>
  
          {/* Footer Promo */}
          <div className="p-6 pt-0 mt-auto">
            {!purchasedIds.includes('pro') && (
              <div className="p-5 bg-ink text-paper rounded-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-full blur-[30px] -mr-10 -mt-10 group-hover:bg-accent/40 transition-colors duration-700"></div>
                <p className="text-[10px] uppercase font-bold tracking-widest mb-2 opacity-60">{t('unlock_pro_title')}</p>
                <h4 className="text-sm font-bold leading-snug mb-4">{t('unlock_pro_desc')}</h4>
                <Link to="/checkout/pro" className="w-full py-2.5 bg-paper/10 hover:bg-accent hover:text-white border border-paper/20 text-paper rounded text-[10px] font-bold uppercase tracking-widest block text-center transition-all backdrop-blur-md">
                   {t('unlock_pro_btn')}
                </Link>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Main Planner Canvas */}
      <main className={cn(
        "flex-1 flex flex-col items-center bg-canvas overflow-hidden p-0 sm:p-4 md:p-8 transition-colors duration-500",
        isFullscreen ? "p-0 h-screen w-screen" : "h-[calc(100vh-3.5rem)] md:h-full"
      )}>
        <div className={cn(
          "w-full h-full flex flex-row relative",
          isFullscreen ? "max-w-none" : "max-w-6xl"
        )}>
          
          {/* Main Paper / Content */}
          <div className={cn(
            "flex-1 bg-paper shadow-2xl dark:shadow-none dark:border dark:border-line relative flex flex-col overflow-hidden z-20 transition-colors duration-500",
            isFullscreen ? "rounded-none" : "rounded-lg sm:rounded-2xl"
          )}>
            {/* Binder Spine & Rings Effect */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/5 dark:from-black/40 to-transparent pointer-events-none z-30" />
            
            {/* Physical Rings */}
            <div className="absolute left-1 top-0 bottom-0 w-6 flex flex-col justify-around py-12 z-40 pointer-events-none opacity-80 dark:opacity-40 mix-blend-multiply dark:mix-blend-normal">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-8 h-2.5 bg-gradient-to-b from-gray-300 via-gray-100 to-gray-400 dark:from-gray-600 dark:via-gray-400 dark:to-gray-700 rounded-full shadow-sm -ml-4 border border-gray-400/20 dark:border-black/50" />
              ))}
            </div>
            
            <div 
              className="flex-1 p-6 sm:p-10 md:p-16 pl-12 sm:pl-20 md:pl-24 overflow-auto relative transition-colors duration-500"
              style={{ backgroundImage: 'radial-gradient(var(--border-line) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            >
              <ActiveComponent 
                plannerId={id} 
                userId={user.id} 
                {...activeTabConfig.props} 
              />
            </div>

            {/* Floating Fullscreen Toggle - Internal */}
            <button 
              onClick={toggleFullscreen} 
              className="absolute bottom-6 left-6 z-50 w-10 h-10 rounded-full bg-paper/80 backdrop-blur border border-line shadow-lg dark:shadow-none flex items-center justify-center text-ink cursor-pointer hover:bg-accent/10 hover:text-accent transition-all"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>

          {/* Physical Right-Side Tabs */}
          <div className="hidden md:flex flex-col pt-12 space-y-px shrink-0 z-10 -ml-px">
            {config.tabs.map((tab: any, idx: number) => {
              const Icon = tab.icon || ListChecks;
              const isActive = currentTabId === tab.id;
              
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  style={{ 
                    marginTop: idx === 0 ? '0' : '-8px',
                    '--tab-color': tab.color || 'var(--bg-tab)'
                  } as React.CSSProperties}
                  className={cn(
                    "relative py-8 w-12 rounded-r-xl flex items-center justify-center transition-all duration-300 ease-in-out hover:pl-2 group overflow-hidden border-y border-r",
                    isActive 
                      ? "z-30 w-16 shadow-[-5px_0_15px_rgba(0,0,0,0.15)] dark:shadow-none translate-x-0 border-line bg-paper" 
                      : "z-0 opacity-100 hover:w-14 border-line/40 dark:border-line/20 bg-[var(--tab-color)] dark:bg-sidebar"
                  )}
                >
                  {/* Subtle tint in dark mode for inactive tabs */}
                  {!isActive && (
                    <div 
                      className="absolute inset-0 opacity-0 dark:opacity-10 z-0 rounded-r-xl pointer-events-none" 
                      style={{ backgroundColor: 'var(--tab-color)' }} 
                    />
                  )}

                  {/* Active tab glow left-edge (dark mode glow to simulate tab presence without full color) */}
                  <div 
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 z-0 pointer-events-none transition-opacity",
                      isActive ? "opacity-0 dark:opacity-100" : "opacity-0"
                    )}
                    style={{ backgroundColor: 'var(--tab-color)' }}
                  />
                  
                  <div className="relative z-10 flex flex-col items-center gap-4 [writing-mode:vertical-rl] whitespace-nowrap">
                    <Icon size={18} strokeWidth={2} className={cn(
                      "rotate-90 mb-2 transition-colors",
                      isActive ? "text-ink" : "text-black/60 dark:text-ink/60"
                    )} />
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.2em] font-sans",
                      isActive ? "text-ink" : "text-black/60 dark:text-ink/60"
                    )}>
                      {tab.label}
                    </span>
                  </div>
                  
                  {/* Connector to merge tab with paper smoothly */}
                  {isActive && (
                    <div 
                      className="absolute top-0 right-full bottom-0 w-[4px] z-40 translate-x-[2px]"
                      style={{ backgroundColor: 'var(--bg-paper)' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Navigation (Floating Bottom Bar) */}
          <div className="md:hidden fixed bottom-6 left-4 right-4 z-[100] bg-paper/90 backdrop-blur-xl border border-line shadow-2xl dark:shadow-none rounded-2xl flex items-center justify-around p-2 overflow-x-auto no-scrollbar">
            {config.tabs.map((tab: any) => {
              const Icon = tab.icon || ListChecks;
              const isActive = currentTabId === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={cn(
                    "p-3 rounded-xl transition-all",
                    isActive ? "scale-110 shadow-lg dark:shadow-none dark:opacity-90" : "text-ink/40 hover:bg-line/20"
                  )}
                  style={isActive ? { backgroundColor: tab.color || 'var(--brand-accent)', color: '#1C1B1A' } : {}}
                >
                  <Icon size={20} />
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
