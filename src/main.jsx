import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays, Check, ChevronLeft, ChevronRight, CircleHelp, Droplets, Flame, Plus, RotateCcw, Sparkles, Target, Trash2 } from 'lucide-react';
import './styles.css';

const DEFAULT_HABITS = [
  ['Wake up early','Morning','daily'], ['Breakfast before 9:30','Body','daily'], ['Drink 1L water','Body','daily'], ['Bath in the morning','Morning','daily'], ['Puja in the morning','Mind','daily'],
  ['Exercise','Body','daily'], ['Go for a walk','Body','daily'], ['Gratitude journal','Mind','daily'], ['Manifestation','Mind','daily'], ['Study','Growth','daily'], ['Coding','Career','daily'], ['System design','Career','daily'],
  ['Eat healthy / calorie deficit','Body','daily'], ['Cut down processed sugar','Body','daily'], ['Less phone time','Mind','daily'], ['Personal discipline','Mind','daily'], ['Morning skincare','Care','daily'], ['Oil hair','Care','daily'], ['Sleep early','Night','daily'],
  ['Lunch','Body','daily'], ['Dinner','Body','daily'], ['Breakfast','Body','daily'],
  ['Cook','Home','weekend'], ['Clean','Home','weekend'], ['Clean dishes','Home','weekend'], ['Wash clothes','Home','weekend'], ['Plan food for the week','Home','weekend'], ['Make grocery list','Home','weekend'],
  ['Build personal project','Career','weekly'], ['Update website','Career','weekly'], ['GitHub update','Career','weekly'], ['LinkedIn update','Career','weekly'], ['Update resume','Career','weekly']
].map(([name, category, cadence], i) => ({ id: `h${i+1}`, name, category, cadence }));

const CATEGORIES = ['All','Morning','Body','Mind','Growth','Career','Care','Home','Night'];
const keyFor = (date) => date.toISOString().slice(0,10);
const today = new Date(); today.setHours(0,0,0,0);
const isWeekend = (d) => [0,6].includes(d.getDay());
const formatDate = (d) => d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});

function App(){
  const [date,setDate] = useState(today);
  const [habits,setHabits] = useState(()=>JSON.parse(localStorage.getItem('habits')||'null') || DEFAULT_HABITS);
  const [done,setDone] = useState(()=>JSON.parse(localStorage.getItem('habit-done')||'{}'));
  const [category,setCategory] = useState('All');
  const [showAdd,setShowAdd] = useState(false);
  const [newHabit,setNewHabit] = useState('');
  const [newCategory,setNewCategory] = useState('Body');
  const dateKey = keyFor(date);
  const weekend = isWeekend(date);

  useEffect(()=>localStorage.setItem('habits',JSON.stringify(habits)),[habits]);
  useEffect(()=>localStorage.setItem('habit-done',JSON.stringify(done)),[done]);

  const visible = useMemo(()=>habits.filter(h=>category==='All'||h.category===category).filter(h=>h.cadence==='daily'||(h.cadence==='weekend'&&weekend)||h.cadence==='weekly'),[habits,category,weekend]);
  const completed = visible.filter(h=>done[dateKey]?.includes(h.id)).length;
  const progress = visible.length ? Math.round(completed/visible.length*100) : 0;
  const toggle = (id) => setDone(x=>({...x,[dateKey]: x[dateKey]?.includes(id) ? x[dateKey].filter(v=>v!==id) : [...(x[dateKey]||[]),id]}));
  const resetDay = () => setDone(x=>({...x,[dateKey]:[]}));
  const addHabit = () => { if(!newHabit.trim()) return; setHabits(x=>[...x,{id:`h${Date.now()}`,name:newHabit.trim(),category:newCategory,cadence:'daily'}]); setNewHabit(''); setShowAdd(false); };
  const removeHabit = (id) => setHabits(x=>x.filter(h=>h.id!==id));

  return <div className="app">
    <header className="topbar"><div className="brand"><span className="brand-dot">✦</span><div><strong>little by little</strong><small>your daily rhythm</small></div></div><button className="icon-btn" onClick={()=>setShowAdd(true)} aria-label="Add habit"><Plus size={19}/></button></header>
    <main>
      <section className="hero"><div><p className="eyebrow">{dateKey===keyFor(today)?'TODAY':'LOOKING BACK'}</p><h1>{formatDate(date)}</h1><p className="sub">No pending tasks roll over. Each day starts fresh.</p></div><div className="score"><div className="score-ring" style={{'--p':`${progress*3.6}deg`}}><span>{progress}<small>%</small></span></div><span>{completed} of {visible.length} done</span></div></section>
      <div className="date-nav"><button onClick={()=>setDate(d=>new Date(d.getTime()-86400000))}><ChevronLeft/></button><div><CalendarDays size={16}/><b>{dateKey===keyFor(today)?'Today':date.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</b></div><button onClick={()=>setDate(d=>new Date(d.getTime()+86400000))}><ChevronRight/></button>{dateKey!==keyFor(today)&&<button className="today-btn" onClick={()=>setDate(today)}>Back to today</button>}</div>
      <div className="category-row">{CATEGORIES.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
      <section className="list-card">
        <div className="list-head"><div><h2>{weekend?'Weekend list':'Today’s list'}</h2><p>{weekend?'A little reset, a little progress.':'Tiny actions count. Keep moving.'}</p></div><button className="reset" onClick={resetDay}><RotateCcw size={14}/> Reset day</button></div>
        <div className="habits">{visible.map(h=>{const checked=done[dateKey]?.includes(h.id); return <div className={`habit ${checked?'checked':''}`} key={h.id}>
          <button className="check" onClick={()=>toggle(h.id)}>{checked&&<Check size={17}/>}</button><div className="habit-copy"><span>{h.name}</span><small>{h.category}{h.cadence==='weekly'?' · weekly':''}{h.cadence==='weekend'?' · weekend':''}</small></div><button className="delete" onClick={()=>removeHabit(h.id)} aria-label={`Delete ${h.name}`}><Trash2 size={14}/></button>
        </div>})}</div>
      </section>
      <section className="insights"><div className="insight"><Flame size={19}/><div><b>Build the streak</b><span>Consistency beats a perfect day.</span></div></div><div className="insight"><Target size={19}/><div><b>{progress>=80?'Lovely work.':'Aim for 80%+'}</b><span>Do the important things first.</span></div></div><div className="insight"><Droplets size={19}/><div><b>Water check</b><span>1L → 2L, one glass at a time.</span></div></div></section>
    </main>
    <footer><Sparkles size={14}/> Built for your real life · stored privately in this browser <span>•</span> <CircleHelp size={14}/></footer>
    {showAdd&&<div className="modal-backdrop" onClick={()=>setShowAdd(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-title"><h2>Add a habit</h2><button onClick={()=>setShowAdd(false)}>×</button></div><input autoFocus value={newHabit} onChange={e=>setNewHabit(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addHabit()} placeholder="e.g. Read 10 pages"/><select value={newCategory} onChange={e=>setNewCategory(e.target.value)}>{CATEGORIES.filter(c=>c!=='All').map(c=><option key={c}>{c}</option>)}</select><button className="add-btn" onClick={addHabit}>Add habit</button></div></div>}
  </div>
}
createRoot(document.getElementById('root')).render(<App/>);
