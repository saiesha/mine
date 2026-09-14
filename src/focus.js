const STORAGE_KEY = 'focus-sessions';
const SETTINGS_KEY = 'focus-settings';

const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const sessions = read(STORAGE_KEY, []);
const settings = read(SETTINGS_KEY, { focus: 25, break: 5 });
let remaining = settings.focus * 60;
let running = false;
let mode = 'focus';
let timer = null;
let task = '';

const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const totalMinutes = () => sessions.reduce((sum, item) => sum + item.minutes, 0);
const todayKey = () => new Date().toLocaleDateString('en-CA');
const persistSettings = () => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

function render() {
  const total = sessions.length;
  const minutes = totalMinutes();
  const todaySessions = sessions.filter((item) => item.date === todayKey()).length;
  const taskMap = sessions.reduce((map, item) => {
    map[item.task] = (map[item.task] || 0) + item.minutes;
    return map;
  }, {});
  const topTasks = Object.entries(taskMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  document.querySelector('.focus-card').innerHTML = `
    <div class="focus-head">
      <div><p class="focus-eyebrow">FOCUS</p><h2>Pomodoro</h2><p>Give one thing your full attention.</p></div>
      <div class="focus-stats"><b>${total}</b><span>sessions</span></div>
    </div>
    <div class="focus-settings-row">
      <label>Focus <select class="focus-duration" ${running ? 'disabled' : ''}>${[5,10,15,20,25,30,45,50,60].map((m) => `<option value="${m}" ${settings.focus === m ? 'selected' : ''}>${m} min</option>`).join('')}</select></label>
      <label>Break <select class="break-duration" ${running ? 'disabled' : ''}>${[1,5,10,15,20,30].map((m) => `<option value="${m}" ${settings.break === m ? 'selected' : ''}>${m} min</option>`).join('')}</select></label>
    </div>
    <div class="focus-timer ${mode === 'break' ? 'is-break' : ''}">
      <span>${mode === 'break' ? 'BREAK' : 'FOCUS'}</span>
      <strong>${formatTime(remaining)}</strong>
      <small>${running ? 'in progress' : mode === 'break' ? 'rest a little' : 'ready when you are'}</small>
    </div>
    ${mode === 'focus' ? `<input class="focus-task" value="${task.replace(/"/g, '&quot;')}" placeholder="What are you working on? e.g. C++ DSA" ${running ? 'disabled' : ''} />` : ''}
    <div class="focus-actions">
      <button class="focus-start">${running ? 'Pause' : mode === 'break' ? 'Start break' : 'Start focus'}</button>
      <button class="focus-reset">Reset</button>
    </div>
    <div class="focus-summary">
      <div><b>${minutes}</b><span>total minutes</span></div>
      <div><b>${todaySessions}</b><span>today</span></div>
      <div><b>${topTasks.length ? topTasks[0][1] : 0}</b><span>best task min</span></div>
    </div>
    ${topTasks.length ? `<div class="focus-tasks"><div class="focus-section-title">Your focus, cumulatively</div>${topTasks.map(([name, mins]) => `<div class="focus-task-row"><span>${name}</span><b>${mins} min</b></div>`).join('')}</div>` : '<div class="focus-empty">Complete a focus session and your progress will build here.</div>'}
  `;

  const input = document.querySelector('.focus-task');
  if (input) input.addEventListener('input', (e) => { task = e.target.value; });
  document.querySelector('.focus-start').addEventListener('click', toggleTimer);
  document.querySelector('.focus-reset').addEventListener('click', resetTimer);
  document.querySelector('.focus-duration').addEventListener('change', (e) => {
    settings.focus = Number(e.target.value);
    persistSettings();
    if (!running && mode === 'focus') remaining = settings.focus * 60;
    render();
  });
  document.querySelector('.break-duration').addEventListener('change', (e) => {
    settings.break = Number(e.target.value);
    persistSettings();
    if (!running && mode === 'break') remaining = settings.break * 60;
    render();
  });
}

function saveSession() {
  const name = task.trim() || 'Untitled focus';
  sessions.push({ id: Date.now(), task: name, minutes: settings.focus, date: todayKey(), completedAt: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function finishFocus() {
  running = false;
  clearInterval(timer);
  saveSession();
  mode = 'break';
  remaining = settings.break * 60;
  render();
}

function tick() {
  if (remaining <= 1) {
    if (mode === 'focus') finishFocus();
    else {
      running = false;
      clearInterval(timer);
      mode = 'focus';
      remaining = settings.focus * 60;
      render();
    }
    return;
  }
  remaining -= 1;
  const timerText = document.querySelector('.focus-timer strong');
  if (timerText) timerText.textContent = formatTime(remaining);
}

function toggleTimer() {
  if (running) {
    running = false;
    clearInterval(timer);
    render();
    return;
  }
  if (mode === 'focus' && !task.trim()) {
    document.querySelector('.focus-task')?.focus();
    return;
  }
  running = true;
  timer = setInterval(tick, 1000);
  render();
}

function resetTimer() {
  running = false;
  clearInterval(timer);
  mode = 'focus';
  remaining = settings.focus * 60;
  render();
}

function mount() {
  const main = document.querySelector('main');
  if (!main) {
    requestAnimationFrame(mount);
    return;
  }
  const card = document.createElement('section');
  card.className = 'focus-card';
  main.appendChild(card);
  render();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
else mount();