import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useAuth, usePurchases, PRODUCTS } from '../store';
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

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

// --- Reusable Views ---

function TaskView({ plannerId, userId, title, subtitle, storagePrefix, initialTasks }: any) {
  const dateKey = format(new Date(), 'yyyy-MM-dd');
  const storageKey = `${storagePrefix}_${userId}_${plannerId}_${dateKey}`;
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialTasks;
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

  const completedCount = tasks.filter((t: Task) => t.completed).length;

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 md:mb-10 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{title}</h1>
          <p className="text-xs md:text-sm opacity-50">{format(new Date(), 'EEEE, MMMM do')} • {subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-line flex items-center justify-center text-xs md:text-sm font-serif italic hover:bg-sidebar transition-colors">W</button>
          <button className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-line flex items-center justify-center text-xs md:text-sm hover:bg-sidebar transition-colors opacity-50">...</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 flex-1 overflow-auto pb-8">
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
            <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">Trackers</label>
            <div className="flex space-x-4">
              <div className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center text-xs font-bold text-ink">
                {completedCount}/{tasks.length}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-[11px] font-medium mb-1 uppercase tracking-widest text-ink">Action Items</div>
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
          <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-3">Checklist</label>
          <ul className="space-y-4">
            {tasks.length === 0 ? (
               <li className="text-sm opacity-50 italic">No tasks for today.</li>
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
            <h5 className="text-sm font-serif italic mb-2 text-ink">Daily Inspiration</h5>
            <p className="text-xs opacity-50 italic">"One small victory is still a victory. Celebrate the progress made today."</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TextAreaView({ plannerId, userId, title, subtitle, storagePrefix, placeholder }: any) {
  const storageKey = `${storagePrefix}_${userId}_${plannerId}`;
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
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{title}</h1>
          <p className="text-xs md:text-sm opacity-50">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col pb-4 md:pb-8 min-h-[300px]">
        <label className="text-[10px] uppercase tracking-widest font-bold text-accent block mb-2 md:mb-3">Workspace</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="flex-1 w-full border border-line bg-sidebar rounded-lg p-4 md:p-6 text-sm font-serif leading-relaxed text-ink focus:outline-none focus:border-accent transition-colors resize-none shadow-inner"
        />
      </div>
    </div>
  );
}

function HabitsView({ plannerId, userId, title, subtitle, storagePrefix, initialHabits }: any) {
  const storageKey = `${storagePrefix}_${userId}_${plannerId}`;
  
  const [habits, setHabits] = useState<{ id: string; name: string; days: Record<string, boolean> }[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialHabits;
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
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{title}</h1>
          <p className="text-xs md:text-sm opacity-50">{subtitle}</p>
        </div>
      </div>

      <div className="mb-8 md:mb-10 overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse min-w-[400px] md:min-w-[500px]">
          <thead>
            <tr>
              <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-accent w-1/3">Trackers</th>
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
                <td className="py-4 text-sm font-medium text-ink">{habit.name}</td>
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

      <form onSubmit={addHabit} className="flex gap-2 max-w-sm mt-auto">
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

function TableDataView({ plannerId, userId, title, subtitle, storagePrefix, columnHeaders, initialData }: any) {
  const storageKey = `${storagePrefix}_${userId}_${plannerId}`;
  
  const [rows, setRows] = useState<{id: string, col1: string, col2: string}[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : initialData;
  });
  
  const [newVal1, setNewVal1] = useState("");
  const [newVal2, setNewVal2] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(rows));
  }, [rows, storageKey]);

  const addRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVal1.trim()) return;
    setRows([...rows, { id: uuidv4(), col1: newVal1.trim(), col2: newVal2.trim() }]);
    setNewVal1("");
    setNewVal2("");
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6 md:mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{title}</h1>
          <p className="text-xs md:text-sm opacity-50">{subtitle}</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <table className="w-full text-left border-collapse min-w-[400px] md:min-w-[500px]">
          <thead>
            <tr>
              <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-accent w-1/2">{columnHeaders[0]}</th>
              <th className="pb-4 text-[10px] uppercase tracking-widest font-bold text-accent w-1/3 text-center">{columnHeaders[1]}</th>
              <th className="pb-4"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-t border-line group">
                <td className="py-4 text-sm font-medium text-ink">{row.col1}</td>
                <td className="py-4 text-sm font-serif italic text-ink text-center">{row.col2}</td>
                <td className="py-4 text-right">
                  <button 
                    onClick={() => removeRow(row.id)}
                    className="text-[10px] uppercase tracking-widest font-bold text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="text-center py-8 opacity-50 text-sm font-serif italic border-t border-line">No data added yet.</div>
        )}
      </div>

      <form onSubmit={addRow} className="flex gap-4 max-w-lg mt-auto pt-6 border-t border-line shrink-0">
        <input
          type="text"
          value={newVal1}
          onChange={(e) => setNewVal1(e.target.value)}
          placeholder={columnHeaders[0]}
          className="flex-1 border-b border-line bg-transparent pb-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors placeholder:opacity-40"
        />
        <input
          type="text"
          value={newVal2}
          onChange={(e) => setNewVal2(e.target.value)}
          placeholder={columnHeaders[1]}
          className="w-1/3 border-b border-line bg-transparent pb-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors placeholder:opacity-40"
        />
        <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-accent hover:opacity-70 px-2">
          Add
        </button>
      </form>
    </div>
  );
}

// --- Specific Views ---

function MonthlyCalendarView({ plannerId, userId, title, subtitle, storagePrefix }: any) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthKey = format(currentMonth, 'yyyy-MM');
  const storageKey = `${storagePrefix}_${userId}_${plannerId}_${monthKey}`;
  
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  }, [notes, storageKey]);

  const handleNoteChange = (dayKey: string, val: string) => {
    setNotes(prev => ({ ...prev, [dayKey]: val }));
  };

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });
  const startDayOfWeek = getDay(start); // 0 (Sun) to 6 (Sat)
  
  const emptyDaysBefore = Array.from({ length: startDayOfWeek }, (_, i) => i);

  return (
    <div className="animate-in fade-in duration-500 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 md:mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{format(currentMonth, 'MMMM yyyy')}</h1>
          <p className="text-xs md:text-sm opacity-50">{subtitle}</p>
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
              <div key={dayKey} className={cn("bg-white p-2 flex flex-col h-full min-h-[80px] hover:bg-sidebar/50 transition-colors", isToday && "bg-accent/5")}>
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
  const storageKey = `${storagePrefix}_${userId}_${plannerId}_${dateKey}`;
  const HOURS = Array.from({length: 17}, (_, i) => i + 6); // 6 AM to 10 PM
  
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : {
      schedule: {}, // { "6": "Wake up", "7": "Gym" }
      priorities: ["", "", ""]
    };
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, storageKey]);

  const handleScheduleChange = (hour: number, val: string) => {
    setData((prev: any) => ({ ...prev, schedule: { ...prev.schedule, [hour]: val } }));
  };

  const handlePriorityChange = (index: number, val: string) => {
    const newP = [...data.priorities];
    newP[index] = val;
    setData((prev: any) => ({ ...prev, priorities: newP }));
  };

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 md:mb-10 gap-4 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{title}</h1>
          <p className="text-xs md:text-sm opacity-50">{format(new Date(), 'EEEE, MMMM do')} • {subtitle}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-y-auto pr-2 pb-4">
        {/* Left: Schedule */}
        <div className="flex-1">
          <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-4 block">Hourly Schedule</label>
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
            <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-4 block">Top 3 Priorities</label>
            <div className="space-y-4">
              {[0, 1, 2].map(i => (
                <div key={`p-${i}`} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded border-2 border-accent flex items-center justify-center text-[10px] font-bold text-accent shrink-0 mt-0.5">{i+1}</div>
                  <textarea 
                    value={data.priorities[i]}
                    onChange={e => handlePriorityChange(i, e.target.value)}
                    className="flex-1 border-b border-line bg-transparent pb-1 text-sm font-sans focus:outline-none focus:border-accent transition-colors text-ink resize-none min-h-[2rem]"
                    placeholder="Focus item..."
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 bg-sidebar rounded-2xl border border-dashed border-accent/30 p-6 flex flex-col">
            <h5 className="text-[10px] uppercase font-bold text-accent tracking-widest mb-4">Daily Notes</h5>
            <textarea 
              value={data.schedule['notes'] || ''}
              onChange={e => handleScheduleChange('notes', e.target.value)}
              className="flex-1 bg-transparent border-none resize-none focus:outline-none text-sm font-serif italic leading-relaxed text-ink/80 placeholder:opacity-40"
              placeholder="Thoughts, reminders, things to carry over..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function WeeklyMealView({ plannerId, userId, title, subtitle, storagePrefix }: any) {
  const storageKey = `${storagePrefix}_${userId}_${plannerId}`;
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  const [meals, setMeals] = useState<Record<string, Record<string, string>>>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    const init: Record<string, Record<string, string>> = {};
    DAYS.forEach(d => {
      init[d] = {};
      MEALS.forEach(m => init[d][m] = '');
    });
    return init;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(meals));
  }, [meals, storageKey]);

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
    <div className="animate-in fade-in duration-500 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6 md:mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{title}</h1>
          <p className="text-xs md:text-sm opacity-50">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-line bg-sidebar shadow-inner pb-4">
        <div className="min-w-[600px] p-4 sm:p-6">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-4 border-b border-line pb-2">
            <div className="text-[10px] uppercase font-bold text-accent tracking-widest pl-2">Day</div>
            {MEALS.map(m => <div key={m} className="text-[10px] uppercase font-bold text-accent tracking-widest leading-tight">{m}</div>)}
          </div>
          <div className="flex flex-col gap-3">
            {DAYS.map(day => (
              <div key={day} className="grid grid-cols-5 gap-2 sm:gap-4 items-center group bg-white/50 p-2 rounded-lg border border-transparent hover:border-line transition-colors">
                <div className="text-sm font-serif font-bold italic opacity-70 group-hover:opacity-100 pl-2 text-ink">{day}</div>
                {MEALS.map(meal => (
                  <input
                    key={`${day}-${meal}`}
                    value={meals[day]?.[meal] || ''}
                    onChange={e => handleChange(day, meal, e.target.value)}
                    placeholder="..."
                    className="w-full bg-white border border-transparent hover:border-line focus:border-accent text-xs sm:text-sm px-2 py-2 sm:py-1.5 rounded transition-all focus:outline-none focus:shadow-sm text-ink font-sans placeholder:opacity-30"
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
  const storageKey = `${storagePrefix}_${userId}_${plannerId}`;
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : {
      startWeight: '80.0',
      goalWeight: '65.0',
      unit: 'kg',
      logs: [] // {id, date, weight, note}
    };
  });

  const [newWeight, setNewWeight] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, storageKey]);

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
    <div className="animate-in fade-in duration-500 flex flex-col h-full">
      <div className="flex justify-between items-start mb-6 md:mb-10 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-ink">{title}</h1>
          <p className="text-xs md:text-sm opacity-50">{subtitle}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-4">
        {/* Goal Config & Progress */}
        <div className="p-6 bg-sidebar rounded-2xl border border-line mb-8 shadow-inner">
          <div className="flex flex-col md:flex-row gap-6 mb-8 border-b border-line pb-6">
             <div className="flex-1">
               <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-2 block">Start Weight</label>
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
               <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-2 block">Current</label>
               <div className="font-serif text-3xl text-ink">
                 {typeof currentW === 'number' ? currentW.toFixed(1) : currentW} <span className="text-sm opacity-50 font-sans">{data.unit}</span>
               </div>
             </div>
             <div className="flex-1 md:border-l border-line md:pl-6">
               <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-2 block">Goal Weight</label>
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
            <span>Progress towards goal</span>
            <span>{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full bg-line rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-accent rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Entry Form */}
        <div className="mb-8">
           <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-3 block">New Check-in</label>
           <form onSubmit={addLog} className="flex gap-4">
             <input type="number" step="0.1" placeholder={`Weight (${data.unit})`} value={newWeight} onChange={e => setNewWeight(e.target.value)} className="w-24 md:w-32 border-b border-line bg-transparent pb-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors placeholder:opacity-40 text-ink" />
             <input type="text" placeholder="Notes (e.g. Empty stomach, post-workout)" value={newNote} onChange={e => setNewNote(e.target.value)} className="flex-1 border-b border-line bg-transparent pb-2 text-sm font-sans focus:outline-none focus:border-accent transition-colors placeholder:opacity-40 text-ink" />
             <button type="submit" className="text-[10px] uppercase tracking-widest font-bold text-white bg-accent hover:opacity-90 px-5 rounded transition-opacity shadow-sm">Log</button>
           </form>
        </div>

        {/* History Table */}
        <div className="pt-6 border-t border-line">
          <label className="text-[10px] uppercase font-bold text-accent tracking-widest mb-4 block">History Log</label>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr>
                  <th className="pb-3 text-xs font-serif italic text-ink/50 w-1/4">Date</th>
                  <th className="pb-3 text-xs font-serif italic text-ink/50 w-1/4">Weight</th>
                  <th className="pb-3 text-xs font-serif italic text-ink/50">Notes & Reflections</th>
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
                      <button onClick={() => removeLog(log.id)} className="text-[10px] uppercase tracking-widest font-bold text-red-800 opacity-0 group-hover:opacity-100 transition-opacity p-2">Del</button>
                    </td>
                  </tr>
                ))}
                {data.logs.length === 0 && (
                  <tr><td colSpan={4} className="py-10 text-center text-sm font-serif italic opacity-50 border-t border-line/50">No logs yet. Step on the scale!</td></tr>
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
    bundleName: 'Neurodivergent Pack',
    tabs: [
      {
        id: 'focus',
        label: 'Focus',
        component: TaskView,
        props: {
          title: "Today's Focus",
          subtitle: "Mindfulness & Momentum",
          storagePrefix: "tasks",
          initialTasks: [
            { id: 't1', text: '5-minute Brain Dump', completed: false },
            { id: 't2', text: 'Drink a glass of water', completed: false },
            { id: 't3', text: 'Pick ONE main priority', completed: false }
          ]
        }
      },
      {
        id: 'braindump',
        label: 'Braindump',
        component: TextAreaView,
        props: {
          title: "Brain Dump Area",
          subtitle: "Clear the mind. Get it all out.",
          storagePrefix: "braindump",
          placeholder: "Type everything that's bouncing around in your head..."
        }
      },
      {
        id: 'habits',
        label: 'Habits',
        component: HabitsView,
        props: {
          title: "Dopamine Trackers",
          subtitle: "Small wins build momentum.",
          storagePrefix: "habits",
          initialHabits: [
            { id: 'h1', name: 'Take Meds/Vitamins', days: {} },
            { id: 'h2', name: '10 mins Sunlight', days: {} }
          ]
        }
      }
    ]
  },
  'it-girl-wellness': {
    bundleName: 'Wellness Aesthetic',
    tabs: [
      {
        id: 'routine',
        label: 'Routine',
        component: TaskView,
        props: {
          title: "Daily Routine",
          subtitle: "Romanticize your life.",
          storagePrefix: "routine",
          initialTasks: [
            { id: 'w1', text: 'Morning Skincare', completed: false },
            { id: 'w2', text: '10 min Meditation', completed: false },
            { id: 'w3', text: 'Evening Gua Sha', completed: false }
          ]
        }
      },
      {
        id: 'journal',
        label: 'Journal',
        component: TextAreaView,
        props: {
          title: "Reflection Journal",
          subtitle: "What are you grateful for today?",
          storagePrefix: "journal",
          placeholder: "Today I am grateful for..."
        }
      },
      {
        id: 'habits',
        label: 'Self-Care',
        component: HabitsView,
        props: {
          title: "Self-Care Tracker",
          subtitle: "Nourish your body and mind.",
          storagePrefix: "selfcare",
          initialHabits: [
            { id: 'h1', name: 'Drink 2L Water', days: {} },
            { id: 'h2', name: 'Read 10 pages', days: {} },
            { id: 'h3', name: '8h Sleep', days: {} }
          ]
        }
      }
    ]
  },
  'small-business-os': {
    bundleName: 'Creator Business OS',
    tabs: [
      {
        id: 'projects',
        label: 'Projects',
        component: TableDataView,
        props: {
          title: "Active Projects",
          subtitle: "What moves the needle forward?",
          storagePrefix: "projects",
          columnHeaders: ["Project Name", "Status"],
          initialData: [
            { id: 'p1', col1: 'Q3 Launch Campaign', col2: 'In Progress' },
            { id: 'p2', col1: 'Client Onboarding Updates', col2: 'Pending' }
          ]
        }
      },
      {
        id: 'finances',
        label: 'Finances',
        component: TableDataView,
        props: {
          title: "Income & Expenses",
          subtitle: "Track your business cashflow.",
          storagePrefix: "finance",
          columnHeaders: ["Description", "Amount ($)"],
          initialData: [
            { id: 'f1', col1: 'Stripe Payout', col2: '+ 1,200.00' },
            { id: 'f2', col1: 'Software Subscriptions', col2: '- 45.00' }
          ]
        }
      },
      {
        id: 'notes',
        label: 'Ideas',
        component: TextAreaView,
        props: {
          title: "Content & Ideas",
          subtitle: "Capture brilliant concepts.",
          storagePrefix: "notes",
          placeholder: "Brainstorming new products, content pillars..."
        }
      }
    ]
  },
  'undated-digital-planner': {
    bundleName: 'Undated Classic',
    tabs: [
      {
        id: 'monthly',
        label: 'Monthly',
        component: MonthlyCalendarView,
        props: {
          title: "Monthly Spread",
          subtitle: "Bird's eye view of your commitments.",
          storagePrefix: "monthly_view"
        }
      },
      {
        id: 'daily',
        label: 'Daily',
        component: DailyScheduleView,
        props: {
          title: "Daily Agenda",
          subtitle: "Master your time.",
          storagePrefix: "daily_agenda"
        }
      },
      {
        id: 'tasks',
        label: 'Tasks',
        component: TaskView,
        props: {
          title: "Running Task List",
          subtitle: "Things that need to get done.",
          storagePrefix: "running_tasks",
          initialTasks: [
            { id: 't1', text: 'Call doctor', completed: false },
            { id: 't2', text: 'Pay bills', completed: true },
            { id: 't3', text: 'Read 20 pages', completed: false }
          ]
        }
      }
    ]
  },
  'meal-prep-weekly': {
    bundleName: 'Nutrition Pack',
    tabs: [
      {
        id: 'meal-plan',
        label: 'Weekly',
        component: WeeklyMealView,
        props: {
          title: "Weekly Menu",
          subtitle: "Nourish your body intentionally.",
          storagePrefix: "mealplan_weekly"
        }
      },
      {
        id: 'groceries',
        label: 'Groceries',
        component: TaskView,
        props: {
          title: "Shopping List",
          subtitle: "Everything you need for the week.",
          storagePrefix: "groceries",
          initialTasks: [
            { id: 'g1', text: 'Oat milk', completed: false },
            { id: 'g2', text: 'Sweet potatoes', completed: false },
            { id: 'g3', text: 'Organic free-range eggs', completed: false }
          ]
        }
      },
      {
        id: 'recipes',
        label: 'Recipes',
        component: TableDataView,
        props: {
          title: "Recipe Vault",
          subtitle: "Your favorite go-to meals and calories.",
          storagePrefix: "recipes",
          columnHeaders: ["Recipe Name", "Prep / Notes"],
          initialData: [
            { id: 'r1', col1: 'Avocado Toast with Egg', col2: '350 kcal | 10 mins' },
            { id: 'r2', col1: 'Quinoa & Salmon Bowl', col2: '500 kcal | 25 mins' }
          ]
        }
      }
    ]
  },
  'weight-loss-tracker': {
    bundleName: 'Body & Fitness Pack',
    tabs: [
      {
        id: 'progress',
        label: 'Progress',
        component: WeightTrackerView,
        props: {
          title: "Weight Journey",
          subtitle: "Track your progress visually.",
          storagePrefix: "weight_progress"
        }
      },
      {
        id: 'measurements',
        label: 'Measures',
        component: TableDataView,
        props: {
          title: "Body Measurements",
          subtitle: "Track inches lost over time.",
          storagePrefix: "measurements_tracker",
          columnHeaders: ["Body Part & Date", "Size"],
          initialData: [
            { id: 'm1', col1: 'Waist - April 1st', col2: '85 cm' },
            { id: 'm2', col1: 'Hips - April 1st', col2: '102 cm' }
          ]
        }
      },
      {
        id: 'milestones',
        label: 'Milestones',
        component: TaskView,
        props: {
          title: "Rewards & Goals",
          subtitle: "Celebrate your victories.",
          storagePrefix: "milestones",
          initialTasks: [
            { id: 'ms1', text: 'Reach 75kg: Buy new running shoes', completed: false },
            { id: 'ms2', text: 'Fit into old jeans', completed: false },
            { id: 'ms3', text: '1 month of consistent workouts', completed: false }
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
  
  const [activeTabId, setActiveTabId] = useState<string>('');

  useEffect(() => {
    setActiveTabId(''); // Reset tab selection when planner ID changes
  }, [id]);
  
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
            <p className="text-xs font-serif italic mb-2">Exclusive Access</p>
            <h4 className="text-sm font-bold leading-tight mb-3">{config.bundleName}</h4>
            <Link to="/" className="w-full py-2 bg-white text-accent rounded text-[10px] font-bold uppercase tracking-wider block text-center transition-opacity hover:opacity-90">Store</Link>
          </div>
        </div>
      </aside>

      {/* Main Planner Canvas */}
      <main className="flex-1 p-0 sm:p-6 md:p-10 flex flex-col items-center bg-canvas h-[calc(100vh-3.5rem)] md:h-full overflow-hidden">
        <div className="w-full max-w-5xl bg-white sm:rounded-xl md:rounded-[2rem] shadow-xl md:shadow-2xl h-full flex flex-col md:flex-row overflow-hidden border border-white/20">
          
          {/* Tabs Side */}
          <div className="w-full md:w-16 bg-tab flex flex-row md:flex-col pt-0 md:pt-12 space-y-0 md:space-y-2 shrink-0 overflow-x-auto overflow-y-hidden border-b md:border-b-0 border-line/20">
            {config.tabs.map((tab: any) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={cn(
                  "flex-1 md:flex-none py-4 md:py-0 md:h-32 w-auto md:w-16 md:rounded-l-lg md:-mr-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest transition-all px-6 md:px-0 md:[writing-mode:vertical-lr]",
                  currentTabId === tab.id ? "bg-white text-ink border-b-2 md:border-b-0 border-accent md:border-transparent z-10 shadow-[-4px_0_15px_-5px_rgba(0,0,0,0.05)]" : "opacity-60 text-ink/80 hover:bg-white/50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 sm:p-8 md:p-12 overflow-auto relative flex flex-col h-full">
            <ActiveComponent 
              plannerId={id} 
              userId={user.id} 
              {...activeTabConfig.props} 
            />
          </div>
        </div>
      </main>
    </div>
  );
}
