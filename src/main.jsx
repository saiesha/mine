import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Dog, Droplets, Flame, Plus, RotateCcw, Sparkles, Target, Trash2 } from 'lucide-react';
import './styles.css';

const DEFAULT_HABITS = [
  ['Freshen up', 'Morning', 'daily'],
  ['Puja', 'Morning', 'daily'],
  ['Breakfast', 'Body', 'daily'],
  ['Lunch', 'Body', 'daily'],
  ['Dinner', 'Body', 'daily'],
  ['Exercise', 'Body', 'daily'],
  ['Coding', 'Career', 'daily'],
  ['System design', 'Career', 'daily'],
  ['Study / DSA', 'Growth', 'daily'],
  ['Read / write', 'Growth', 'daily'],
  ['Morning skincare', 'Care', 'daily'],
  ['Gratitude', 'Mind', 'daily'],
  ['Less phone time', 'Mind', 'daily'],
  ['Sleep on time', 'Night', 'daily'],
  ['Cook', 'Home', 'weekend'],
  ['Clean', 'Home', 'weekend'],
  ['Laundry', 'Home', 'weekend'],
  ['Plan the week', 'Home', 'weekly'],
  ['Build personal project', 'Career', 'weekly'],
].map(([name, category, cadence], i) => ({ id: `h${i + 1}`, name, category, cadence }));

const CATEGORIES = ['All', 'Morning', 'Body', 'Mind', 'Growth', 'Career', 'Care', 'Home', 'Night'];
const WATER_STEPS = [250, 500, 750, 1000, 1250, 1500, 1750, 2000];

const dateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const today = new Date();
today.setHours(0, 0, 0, 0);
const isWeekend = (date) => [0, 6].includes(date.getDay());
const formatDate = (date) => date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [date, setDate] = useState(today);
  const [habits, setHabits] = useState(() => readStorage('habits', DEFAULT_HABITS));
  const [done, setDone] = useState(() => readStorage('habit-done', {}));
  const [water, setWater] = useState(() => readStorage('habit-water', {}));
  const [category, setCategory] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [newCategory, setNewCategory] = useState('Body');
  const [newCadence, setNewCadence] = useState('daily');

  const currentKey = dateKey(date);
  const weekend = isWeekend(date);

  useEffect(() => localStorage.setItem('habits', JSON.stringify(habits)), [habits]);
  useEffect(() => localStorage.setItem('habit-done', JSON.stringify(done)), [done]);
  useEffect(() => localStorage.setItem('habit-water', JSON.stringify(water)), [water]);

  const visible = useMemo(() => habits
    .filter((habit) => category === 'All' || habit.category === category)
    .filter((habit) => habit.cadence === 'daily' || (habit.cadence === 'weekend' && weekend) || habit.cadence === 'weekly'), [habits, category, weekend]);

  const completed = visible.filter((habit) => done[currentKey]?.includes(habit.id)).length;
  const progress = visible.length ? Math.round((completed / visible.length) * 100) : 0;
  const waterAmount = water[currentKey] || 0;
  const waterProgress = Math.min(100, Math.round((waterAmount / 2000) * 100));

  const toggleHabit = (id) => setDone((current) => ({
    ...current,
    [currentKey]: current[currentKey]?.includes(id)
      ? current[currentKey].filter((value) => value !== id)
      : [...(current[currentKey] || []), id],
  }));

  const changeWater = (amount) => setWater((current) => ({ ...current, [currentKey]: Math.max(0, Math.min(3000, amount)) }));
  const resetDay = () => {
    setDone((current) => ({ ...current, [currentKey]: [] }));
    setWater((current) => ({ ...current, [currentKey]: 0 }));
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits((current) => [...current, {
      id: `h${Date.now()}`,
      name: newHabit.trim(),
      category: newCategory,
      cadence: newCadence,
    }]);
    setNewHabit('');
    setShowAdd(false);
  };

  const removeHabit = (id) => setHabits((current) => current.filter((habit) => habit.id !== id));

  const streak = useMemo(() => {
    let count = 0;
    const cursor = new Date(today);
    while (count < 365) {
      const key = dateKey(cursor);
      const dayDone = done[key] || [];
      const dayHabits = habits.filter((habit) => habit.cadence === 'daily' || (habit.cadence === 'weekend' && isWeekend(cursor)) || habit.cadence === 'weekly');
      const dayProgress = dayHabits.length ? dayDone.filter((id) => dayHabits.some((habit) => habit.id === id)).length / dayHabits.length : 0;
      if (dayProgress < 0.8) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [done, habits]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot">✦</span>
          <div><strong>little by little</strong><small>your daily rhythm</small></div>
        </div>
        <button className="icon-btn" onClick={() => setShowAdd(true)} aria-label="Add habit"><Plus size={19} /></button>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">{currentKey === dateKey(today) ? 'TODAY' : 'LOOKING BACK'}</p>
            <h1>{formatDate(date)}</h1>
            <p className="sub">Small things, done consistently, become a life.</p>
          </div>
          <div className="score">
            <div className="score-ring" style={{ '--p': `${progress * 3.6}deg` }}><span>{progress}<small>%</small></span></div>
            <span>{completed} of {visible.length} habits</span>
          </div>
        </section>

        <div className="date-nav">
          <button onClick={() => setDate((d) => new Date(d.getTime() - 86400000))} aria-label="Previous day"><ChevronLeft /></button>
          <div><CalendarDays size={16} /><b>{currentKey === dateKey(today) ? 'Today' : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</b></div>
          <button onClick={() => setDate((d) => new Date(d.getTime() + 86400000))} aria-label="Next day"><ChevronRight /></button>
          {currentKey !== dateKey(today) && <button className="today-btn" onClick={() => setDate(today)}>Back to today</button>}
        </div>

        <div className="category-row">
          {CATEGORIES.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
        </div>

        <section className="list-card">
          <div className="list-head">
            <div><h2>{weekend ? 'Weekend list' : 'Today’s list'}</h2><p>{weekend ? 'Reset a little. Prepare a little. Rest too.' : 'You do not need to do everything. Just keep showing up.'}</p></div>
            <button className="reset" onClick={resetDay}><RotateCcw size={14} /> Reset</button>
          </div>
          <div className="habits">
            {visible.map((habit) => {
              const checked = done[currentKey]?.includes(habit.id);
              return <div className={`habit ${checked ? 'checked' : ''}`} key={habit.id}>
                <button className="check" onClick={() => toggleHabit(habit.id)} aria-label={`Mark ${habit.name} complete`}>{checked && <Check size={17} />}</button>
                <div className="habit-copy"><span>{habit.name}</span><small>{habit.category}{habit.cadence !== 'daily' ? ` · ${habit.cadence}` : ''}</small></div>
                <button className="delete" onClick={() => removeHabit(habit.id)} aria-label={`Delete ${habit.name}`}><Trash2 size={14} /></button>
              </div>;
            })}
            {!visible.length && <div className="empty">Nothing here yet. Add a habit with <b>+</b>.</div>}
          </div>
        </section>

        <section className="water-card">
          <div className="water-top"><div><div className="water-title"><Droplets size={18} /><h2>Water</h2></div><p>Goal: 2L · 250ml at a time is enough.</p></div><strong>{(waterAmount / 1000).toFixed(2)}L</strong></div>
          <div className="water-track"><span style={{ width: `${waterProgress}%` }} /></div>
          <div className="water-actions">
            {WATER_STEPS.map((step) => <button key={step} className={waterAmount >= step ? 'filled' : ''} onClick={() => changeWater(step)}>{step === 1000 ? '1L ✓' : step === 2000 ? '2L ✓' : `${step}ml`}</button>)}
            <button className="water-reset" onClick={() => changeWater(0)}>Clear</button>
          </div>
        </section>

        <section className="insights">
          <div className="insight"><Flame size={19} /><div><b>{streak ? `${streak} day streak` : 'Start your streak'}</b><span>80%+ counts as a good day.</span></div></div>
          <div className="insight"><Target size={19} /><div><b>{progress >= 80 ? 'Lovely work.' : 'Aim for 80%+'}</b><span>Important beats perfect.</span></div></div>
          <div className="insight"><Sparkles size={19} /><div><b>One day at a time</b><span>Tomorrow gets its own fresh start.</span></div></div>
        </section>
      </main>

      <div className="buddy" title="Your little buddy is cheering for you" aria-hidden="true">
        <div className="buddy-dog">🐶</div>
        <small>{progress >= 80 ? 'good job!' : 'you got this'}</small>
      </div>

      <footer>✦ Built for real life · your check-ins stay in this browser</footer>

      {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
        <div className="modal" onClick={(event) => event.stopPropagation()}>
          <div className="modal-title"><h2>Add a habit</h2><button onClick={() => setShowAdd(false)}>×</button></div>
          <input autoFocus value={newHabit} onChange={(event) => setNewHabit(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addHabit()} placeholder="e.g. Read 10 pages" />
          <select value={newCategory} onChange={(event) => setNewCategory(event.target.value)}>{CATEGORIES.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}</select>
          <div className="cadence-row">{[['daily', 'Every day'], ['weekend', 'Weekends'], ['weekly', 'Weekly']].map(([value, label]) => <button key={value} className={newCadence === value ? 'selected' : ''} onClick={() => setNewCadence(value)}>{label}</button>)}</div>
          <button className="add-btn" onClick={addHabit}>Add habit</button>
        </div>
      </div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
