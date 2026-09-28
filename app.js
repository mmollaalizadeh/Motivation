const PERSIAN_DIGITS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
const faNum = (value) => String(value).replace(/\d/g, d => PERSIAN_DIGITS[d]);
const localDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
const todayKey = () => localDateKey();
const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate()-1); return localDateKey(d); };

const defaultTasks = [
  { id: crypto.randomUUID(), title: '۳۰ دقیقه دیدن ویدیوی آموزشی', points: 10 },
  { id: crypto.randomUUID(), title: '۲۰ دقیقه تمرین چیزی که یاد گرفتم', points: 15 },
  { id: crypto.randomUUID(), title: 'نوشتن ۳ نکته‌ای که امروز یاد گرفتم', points: 10 },
  { id: crypto.randomUUID(), title: 'یک قدم برای مسیر شغلی (رزومه/درخواست/پروفایل)', points: 20 }
];

const defaultRewards = [
  { id: crypto.randomUUID(), title: 'انتخاب فیلم امشب 🍿', cost: 30 },
  { id: crypto.randomUUID(), title: 'کافه یا خوراکی موردعلاقه ☕', cost: 70 },
  { id: crypto.randomUUID(), title: 'یک هدیه کوچیک 🎁', cost: 140 },
  { id: crypto.randomUUID(), title: 'قرار ویژه دونفره 💜', cost: 220 }
];

const encouragements = [
  'تو لازم نیست سریع باشی؛ فقط ادامه بده.',
  'هر ویدیویی که امروز می‌بینی، بخشی از نسخه قوی‌تر فرداته.',
  'شغل از دست رفته؛ توانایی‌هات نه.',
  'پیشرفت کوچیک، وقتی تکرار بشه، دیگه کوچیک نیست.',
  'امروز فقط یک قدم. فردا یک قدم دیگه.',
  'قرار نیست کامل باشی؛ قرارِ ادامه بدی.',
  'این دوره توقف نیست؛ می‌تونه سکوی پرتاب باشه.'
];

const state = JSON.parse(localStorage.getItem('motivatePwaState')) || {
  name: '',
  customMessage: '',
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  tasks: defaultTasks,
  rewards: defaultRewards,
  completedByDate: {},
  pointsByDate: {}
};

function normalizeState() {
  state.tasks ||= defaultTasks;
  state.rewards ||= defaultRewards;
  state.completedByDate ||= {};
  state.pointsByDate ||= {};
  state.xp ||= 0;
  state.streak ||= 0;
  if (state.lastActiveDate && state.lastActiveDate !== todayKey() && state.lastActiveDate !== yesterdayKey()) {
    state.streak = 0;
  }
}
normalizeState();

const els = {
  greetingTitle: document.querySelector('#greetingTitle'), todayLabel: document.querySelector('#todayLabel'),
  heroMessage: document.querySelector('#heroMessage'), progressRing: document.querySelector('#progressRing'),
  progressPercent: document.querySelector('#progressPercent'), streakValue: document.querySelector('#streakValue'),
  xpValue: document.querySelector('#xpValue'), levelValue: document.querySelector('#levelValue'),
  taskList: document.querySelector('#taskList'), rewardList: document.querySelector('#rewardList'),
  weekChart: document.querySelector('#weekChart'), encouragementText: document.querySelector('#encouragementText'),
  toast: document.querySelector('#toast'), installBtn: document.querySelector('#installBtn'),
  taskDialog: document.querySelector('#taskDialog'), rewardDialog: document.querySelector('#rewardDialog'),
  settingsDialog: document.querySelector('#settingsDialog'), focusDialog: document.querySelector('#focusDialog')
};

function saveState() { localStorage.setItem('motivatePwaState', JSON.stringify(state)); }
function completedToday() { return state.completedByDate[todayKey()] || []; }
function todayPoints() { return state.pointsByDate[todayKey()] || 0; }

function formatDate() {
  return new Intl.DateTimeFormat('fa-IR', { weekday:'long', day:'numeric', month:'long' }).format(new Date());
}

function render() {
  els.greetingTitle.textContent = state.name ? `سلام ${state.name} ✨` : 'سلام قهرمان ✨';
  els.todayLabel.textContent = formatDate();
  els.heroMessage.textContent = state.customMessage || 'قرار نیست همه‌چیز رو یک‌روزه حل کنی؛ فقط امروز رو بساز.';
  els.streakValue.textContent = faNum(state.streak);
  els.xpValue.textContent = faNum(state.xp);
  els.levelValue.textContent = faNum(Math.floor(state.xp / 100) + 1);
  renderTasks(); renderRewards(); renderProgress(); renderWeekChart();
}

function renderTasks() {
  const done = completedToday();
  els.taskList.innerHTML = '';
  state.tasks.forEach(task => {
    const isDone = done.includes(task.id);
    const row = document.createElement('div');
    row.className = `task-item${isDone ? ' done' : ''}`;
    row.innerHTML = `
      <button class="task-check" aria-label="${isDone ? 'انجام شده' : 'علامت زدن به عنوان انجام شده'}">${isDone ? '✓' : ''}</button>
      <div><span class="task-title"></span><span class="task-meta">ماموریت روزانه</span></div>
      <span class="points-chip">+${faNum(task.points)} امتیاز</span>`;
    row.querySelector('.task-title').textContent = task.title;
    row.querySelector('.task-check').addEventListener('click', () => toggleTask(task));
    els.taskList.appendChild(row);
  });
}

function toggleTask(task) {
  const key = todayKey();
  state.completedByDate[key] ||= [];
  state.pointsByDate[key] ||= 0;
  const idx = state.completedByDate[key].indexOf(task.id);
  if (idx === -1) {
    state.completedByDate[key].push(task.id);
    state.pointsByDate[key] += task.points;
    state.xp += task.points;
    updateStreakOnActivity();
    showToast(`آفرین! +${faNum(task.points)} امتیاز گرفتی ✨`);
    celebrate();
  } else {
    state.completedByDate[key].splice(idx, 1);
    state.pointsByDate[key] = Math.max(0, state.pointsByDate[key] - task.points);
    state.xp = Math.max(0, state.xp - task.points);
  }
  saveState(); render();
}

function updateStreakOnActivity() {
  const today = todayKey();
  if (state.lastActiveDate === today) return;
  state.streak = state.lastActiveDate === yesterdayKey() ? state.streak + 1 : 1;
  state.lastActiveDate = today;
}

function renderProgress() {
  const total = state.tasks.reduce((sum,t) => sum + t.points, 0) || 1;
  const pct = Math.min(100, Math.round((todayPoints()/total)*100));
  els.progressRing.style.setProperty('--progress', pct);
  els.progressPercent.textContent = `${faNum(pct)}٪`;
}

function renderRewards() {
  els.rewardList.innerHTML = '';
  [...state.rewards].sort((a,b)=>a.cost-b.cost).forEach(reward => {
    const unlocked = state.xp >= reward.cost;
    const card = document.createElement('article');
    card.className = `reward-card${unlocked ? ' unlocked' : ''}`;
    card.innerHTML = `<h4></h4><p>${unlocked ? 'باز شده! وقتشه ازش لذت ببرید.' : `${faNum(Math.max(0, reward.cost-state.xp))} امتیاز دیگه تا باز شدن`}</p>
      <div class="reward-status"><span class="points-chip">${faNum(reward.cost)} XP</span><span class="lock-badge">${unlocked ? 'باز شد 🔓' : 'قفل 🔒'}</span></div>`;
    card.querySelector('h4').textContent = reward.title;
    els.rewardList.appendChild(card);
  });
}

function renderWeekChart() {
  const days = [];
  const labels = ['ش','ی','د','س','چ','پ','ج'];
  for (let i=6;i>=0;i--) { const d=new Date(); d.setDate(d.getDate()-i); days.push(d); }
  const max = Math.max(40, ...days.map(d => state.pointsByDate[d.toISOString().slice(0,10)] || 0));
  els.weekChart.innerHTML = '';
  days.forEach(d => {
    const key=localDateKey(d); const pts=state.pointsByDate[key]||0; const h=Math.max(5, Math.round((pts/max)*100));
    const col=document.createElement('div'); col.className='day-bar'; col.title=`${pts} امتیاز`;
    col.innerHTML=`<div class="bar-track"><div class="bar-fill" style="height:${h}%"></div></div><span class="day-label">${labels[(d.getDay()+1)%7]}</span>`;
    els.weekChart.appendChild(col);
  });
}

function showToast(text) {
  els.toast.textContent = text; els.toast.classList.add('show');
  clearTimeout(showToast.t); showToast.t=setTimeout(()=>els.toast.classList.remove('show'), 2400);
}

document.querySelector('#newMessageBtn').addEventListener('click', () => {
  const msg = encouragements[Math.floor(Math.random()*encouragements.length)];
  els.encouragementText.textContent = msg;
});

document.querySelector('#addTaskBtn').addEventListener('click', ()=>els.taskDialog.showModal());
document.querySelector('#addRewardBtn').addEventListener('click', ()=>els.rewardDialog.showModal());
document.querySelector('#settingsBtn').addEventListener('click', ()=>{
  document.querySelector('#nameInput').value=state.name||'';
  document.querySelector('#customMessageInput').value=state.customMessage||'';
  els.settingsDialog.showModal();
});

document.querySelector('#saveTaskBtn').addEventListener('click', (e)=>{
  const title=document.querySelector('#taskTitleInput').value.trim();
  const points=Number(document.querySelector('#taskPointsInput').value);
  if(!title || !points) { e.preventDefault(); return; }
  state.tasks.push({id:crypto.randomUUID(), title, points}); saveState(); render();
  document.querySelector('#taskForm').reset(); showToast('ماموریت جدید اضافه شد 🌱');
});

document.querySelector('#saveRewardBtn').addEventListener('click', (e)=>{
  const title=document.querySelector('#rewardTitleInput').value.trim();
  const cost=Number(document.querySelector('#rewardCostInput').value);
  if(!title || !cost) { e.preventDefault(); return; }
  state.rewards.push({id:crypto.randomUUID(), title, cost}); saveState(); render();
  document.querySelector('#rewardForm').reset(); showToast('جایزه جدید اضافه شد 🎁');
});

document.querySelector('#saveSettingsBtn').addEventListener('click', ()=>{
  state.name=document.querySelector('#nameInput').value.trim();
  state.customMessage=document.querySelector('#customMessageInput').value.trim();
  saveState(); render(); showToast('تنظیمات ذخیره شد 💜');
});

// Focus timer
let timerSeconds=30*60, timerHandle=null;
const timerDisplay=document.querySelector('#timerDisplay'), timerToggleBtn=document.querySelector('#timerToggleBtn');
function renderTimer(){ const m=String(Math.floor(timerSeconds/60)).padStart(2,'0'), s=String(timerSeconds%60).padStart(2,'0'); timerDisplay.textContent=`${m}:${s}`; }
function stopTimer(){ clearInterval(timerHandle); timerHandle=null; timerToggleBtn.textContent='شروع'; }
document.querySelector('#focusBtn').addEventListener('click', ()=>els.focusDialog.showModal());
timerToggleBtn.addEventListener('click', ()=>{
  if(timerHandle){ stopTimer(); return; }
  timerToggleBtn.textContent='توقف';
  timerHandle=setInterval(()=>{
    timerSeconds--; renderTimer();
    if(timerSeconds<=0){ stopTimer(); timerSeconds=30*60; renderTimer(); state.xp+=15; state.pointsByDate[todayKey()] = (state.pointsByDate[todayKey()]||0)+15; updateStreakOnActivity(); saveState(); render(); celebrate(); showToast('۳۰ دقیقه تمرکز کامل شد! +۱۵ امتیاز 🎉'); }
  },1000);
});
document.querySelector('#timerResetBtn').addEventListener('click', ()=>{ stopTimer(); timerSeconds=30*60; renderTimer(); });
document.querySelector('#closeFocusBtn').addEventListener('click', stopTimer);

// Small confetti effect
function celebrate(){
  const canvas=document.querySelector('#confettiCanvas'), ctx=canvas.getContext('2d');
  canvas.width=innerWidth*devicePixelRatio; canvas.height=innerHeight*devicePixelRatio; ctx.scale(devicePixelRatio,devicePixelRatio);
  const pieces=Array.from({length:42},()=>({x:innerWidth/2,y:innerHeight*.25,vx:(Math.random()-.5)*7,vy:Math.random()*-7-2,g:.22,r:Math.random()*5+3,life:55+Math.random()*20,h:Math.random()*360}));
  let frame=0; function tick(){ ctx.clearRect(0,0,innerWidth,innerHeight); pieces.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life--;ctx.fillStyle=`hsl(${p.h} 80% 62%)`;ctx.fillRect(p.x,p.y,p.r,p.r*1.6)}); frame++; if(frame<80) requestAnimationFrame(tick); else ctx.clearRect(0,0,innerWidth,innerHeight); } tick();
}

// Install PWA
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); deferredPrompt=e; els.installBtn.hidden=false; });
els.installBtn.addEventListener('click', async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; els.installBtn.hidden=true; });

if('serviceWorker' in navigator){ window.addEventListener('load', ()=>navigator.serviceWorker.register('./sw.js').catch(()=>{})); }
renderTimer(); render();
