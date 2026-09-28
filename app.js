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
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const defaultTasks = [
  { id: uid(), title: '۳۰ دقیقه دیدن ویدیوی آموزشی', points: 10 },
  { id: uid(), title: '۲۰ دقیقه تمرین چیزی که یاد گرفتم', points: 15 },
  { id: uid(), title: 'نوشتن ۳ نکته‌ای که امروز یاد گرفتم', points: 10 },
  { id: uid(), title: 'یک قدم برای مسیر شغلی (رزومه/درخواست/پروفایل)', points: 20 }
];

const defaultRewards = [
  { id: uid(), title: 'انتخاب فیلم امشب 🍿', cost: 30 },
  { id: uid(), title: 'کافه یا خوراکی موردعلاقه ☕', cost: 70 },
  { id: uid(), title: 'یک هدیه کوچیک 🎁', cost: 140 },
  { id: uid(), title: 'قرار ویژه دونفره 💜', cost: 220 }
];

const encouragements = [
  'فاطمه، لازم نیست سریع باشی؛ فقط ادامه بده.',
  'هر چیزی که امروز یاد می‌گیری، یه قدم به انتخاب‌های بیشتر نزدیکت می‌کنه.',
  'یک اتفاق شغلی نمی‌تونه توانایی‌هات رو تعریف کنه.',
  'پیشرفت کوچیک، وقتی تکرار بشه، دیگه کوچیک نیست.',
  'امروز فقط یک قدم. فردا یک قدم دیگه.',
  'قرار نیست کامل باشی؛ قرارِ ادامه بدی.',
  'این فاصله می‌تونه فرصت ساختن مسیر بعدی باشه.'
];

const stored = JSON.parse(localStorage.getItem('motivatePwaState') || 'null');
const state = stored || {
  name: 'فاطمه',
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
  state.name = state.name || 'فاطمه';
  state.tasks ||= defaultTasks;
  state.rewards ||= defaultRewards;
  state.completedByDate ||= {};
  state.pointsByDate ||= {};
  state.xp = Number(state.xp) || 0;
  state.streak = Number(state.streak) || 0;
  if (state.lastActiveDate && state.lastActiveDate !== todayKey() && state.lastActiveDate !== yesterdayKey()) {
    state.streak = 0;
  }
}
normalizeState();

const els = {
  greetingTitle: document.querySelector('#greetingTitle'),
  todayLabel: document.querySelector('#todayLabel'),
  heroMessage: document.querySelector('#heroMessage'),
  progressRing: document.querySelector('#progressRing'),
  progressPercent: document.querySelector('#progressPercent'),
  todayXpValue: document.querySelector('#todayXpValue'),
  streakValue: document.querySelector('#streakValue'),
  xpValue: document.querySelector('#xpValue'),
  levelValue: document.querySelector('#levelValue'),
  doneTodayValue: document.querySelector('#doneTodayValue'),
  taskList: document.querySelector('#taskList'),
  rewardList: document.querySelector('#rewardList'),
  weekChart: document.querySelector('#weekChart'),
  weekTotal: document.querySelector('#weekTotal'),
  encouragementText: document.querySelector('#encouragementText'),
  nextRewardTitle: document.querySelector('#nextRewardTitle'),
  nextRewardMeta: document.querySelector('#nextRewardMeta'),
  nextRewardProgress: document.querySelector('#nextRewardProgress'),
  toast: document.querySelector('#toast'),
  installBtn: document.querySelector('#installBtn'),
  taskDialog: document.querySelector('#taskDialog'),
  rewardDialog: document.querySelector('#rewardDialog'),
  settingsDialog: document.querySelector('#settingsDialog'),
  focusDialog: document.querySelector('#focusDialog')
};

function saveState() { localStorage.setItem('motivatePwaState', JSON.stringify(state)); }
function completedToday() { return state.completedByDate[todayKey()] || []; }
function todayPoints() { return state.pointsByDate[todayKey()] || 0; }
function weekPoints() {
  let total = 0;
  for (let i=0; i<7; i++) {
    const d = new Date(); d.setDate(d.getDate()-i);
    total += state.pointsByDate[localDateKey(d)] || 0;
  }
  return total;
}

function formatDate() {
  return new Intl.DateTimeFormat('fa-IR', { weekday:'long', day:'numeric', month:'long' }).format(new Date());
}

function render() {
  els.greetingTitle.textContent = `سلام ${state.name} ✨`;
  els.todayLabel.textContent = formatDate();
  els.heroMessage.textContent = state.customMessage || 'قرار نیست همه‌چیز رو یک‌روزه حل کنی؛ فقط امروز رو بساز.';
  els.streakValue.textContent = faNum(state.streak);
  els.xpValue.textContent = faNum(state.xp);
  els.todayXpValue.textContent = faNum(todayPoints());
  els.levelValue.textContent = faNum(Math.floor(state.xp / 100) + 1);
  els.doneTodayValue.textContent = `${faNum(completedToday().length)}/${faNum(state.tasks.length)}`;
  els.weekTotal.textContent = `${faNum(weekPoints())} XP`;
  renderTasks();
  renderRewards();
  renderProgress();
  renderWeekChart();
  renderNextReward();
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
    showToast(`آفرین ${state.name}! +${faNum(task.points)} امتیاز ✨`);
    celebrate();
  } else {
    state.completedByDate[key].splice(idx, 1);
    state.pointsByDate[key] = Math.max(0, state.pointsByDate[key] - task.points);
    state.xp = Math.max(0, state.xp - task.points);
  }
  saveState();
  render();
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

function renderNextReward() {
  const sorted = [...state.rewards].sort((a,b)=>a.cost-b.cost);
  const next = sorted.find(r => r.cost > state.xp);
  if (!next) {
    els.nextRewardTitle.textContent = 'همه جایزه‌ها باز شدن! 🎉';
    els.nextRewardMeta.textContent = 'وقتشه یک جایزه جدید و هیجان‌انگیز اضافه کنید.';
    els.nextRewardProgress.style.width = '100%';
    return;
  }
  const previousCost = [...sorted].reverse().find(r => r.cost <= state.xp)?.cost || 0;
  const range = Math.max(1, next.cost - previousCost);
  const progress = Math.min(100, Math.max(0, ((state.xp - previousCost) / range) * 100));
  els.nextRewardTitle.textContent = next.title;
  els.nextRewardMeta.textContent = `${faNum(next.cost - state.xp)} امتیاز دیگه تا باز شدن`;
  els.nextRewardProgress.style.width = `${progress}%`;
}

function renderWeekChart() {
  const days = [];
  const labels = ['ش','ی','د','س','چ','پ','ج'];
  for (let i=6;i>=0;i--) { const d=new Date(); d.setDate(d.getDate()-i); days.push(d); }
  const values = days.map(d => state.pointsByDate[localDateKey(d)] || 0);
  const max = Math.max(30, ...values);
  els.weekChart.innerHTML = '';
  days.forEach((d,index) => {
    const pts = values[index];
    const h = pts === 0 ? 4 : Math.max(10, Math.round((pts/max)*100));
    const col = document.createElement('div');
    col.className = 'day-bar';
    col.title = `${pts} امتیاز`;
    col.innerHTML = `<div class="bar-track"><div class="bar-fill" style="height:${h}%"></div></div><span class="day-label">${labels[(d.getDay()+1)%7]}</span>`;
    els.weekChart.appendChild(col);
  });
}

function buildReport() {
  const totalTasks = state.tasks.length;
  const done = completedToday().length;
  const next = [...state.rewards].sort((a,b)=>a.cost-b.cost).find(r => r.cost > state.xp);
  const nextLine = next ? `🎁 تا جایزه بعدی: ${next.cost - state.xp} امتیاز` : '🎁 همه جایزه‌ها باز شده!';
  return `گزارش امروز ${state.name} 🌱\n\n⭐ امتیاز امروز: ${todayPoints()}\n🏆 امتیاز کل: ${state.xp}\n🔥 استمرار: ${state.streak} روز\n✅ ماموریت‌ها: ${done} از ${totalTasks}\n📈 امتیاز ۷ روز اخیر: ${weekPoints()}\n${nextLine}\n\nقدم‌های کوچیک، نتیجه‌های بزرگ 💜`;
}

async function shareReport() {
  const text = buildReport();
  try {
    if (navigator.share) {
      await navigator.share({ title: `گزارش پیشرفت ${state.name}`, text });
      return;
    }
    await navigator.clipboard.writeText(text);
    showToast('گزارش کپی شد؛ حالا می‌تونی هرجا خواستی بفرستیش 💌');
  } catch (err) {
    if (err?.name === 'AbortError') return;
    try {
      const area = document.createElement('textarea');
      area.value = text; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
      showToast('گزارش کپی شد 💌');
    } catch { showToast('امکان اشتراک‌گذاری روی این مرورگر وجود نداشت.'); }
  }
}

function showToast(text) {
  els.toast.textContent = text;
  els.toast.classList.add('show');
  clearTimeout(showToast.t);
  showToast.t = setTimeout(()=>els.toast.classList.remove('show'), 2500);
}

document.querySelector('#newMessageBtn').addEventListener('click', () => {
  const msg = encouragements[Math.floor(Math.random()*encouragements.length)];
  els.encouragementText.textContent = msg.replace('فاطمه', state.name);
});

document.querySelector('#shareReportBtn').addEventListener('click', shareReport);
document.querySelector('#shareTopBtn').addEventListener('click', shareReport);
document.querySelector('#addTaskBtn').addEventListener('click', ()=>els.taskDialog.showModal());
document.querySelector('#addRewardBtn').addEventListener('click', ()=>els.rewardDialog.showModal());
document.querySelector('#settingsBtn').addEventListener('click', ()=>{
  document.querySelector('#nameInput').value = state.name || 'فاطمه';
  document.querySelector('#customMessageInput').value = state.customMessage || '';
  els.settingsDialog.showModal();
});

document.querySelector('#saveTaskBtn').addEventListener('click', (e)=>{
  const title = document.querySelector('#taskTitleInput').value.trim();
  const points = Number(document.querySelector('#taskPointsInput').value);
  if(!title || !points) { e.preventDefault(); return; }
  state.tasks.push({id:uid(), title, points});
  saveState(); render();
  document.querySelector('#taskForm').reset();
  showToast('ماموریت جدید اضافه شد 🌱');
});

document.querySelector('#saveRewardBtn').addEventListener('click', (e)=>{
  const title = document.querySelector('#rewardTitleInput').value.trim();
  const cost = Number(document.querySelector('#rewardCostInput').value);
  if(!title || !cost) { e.preventDefault(); return; }
  state.rewards.push({id:uid(), title, cost});
  saveState(); render();
  document.querySelector('#rewardForm').reset();
  showToast('جایزه جدید اضافه شد 🎁');
});

document.querySelector('#saveSettingsBtn').addEventListener('click', ()=>{
  state.name = document.querySelector('#nameInput').value.trim() || 'فاطمه';
  state.customMessage = document.querySelector('#customMessageInput').value.trim();
  saveState(); render(); showToast('تنظیمات ذخیره شد 💜');
});

// Focus timer
let timerSeconds = 30*60, timerHandle = null;
const timerDisplay = document.querySelector('#timerDisplay');
const timerToggleBtn = document.querySelector('#timerToggleBtn');
function renderTimer(){
  const m=String(Math.floor(timerSeconds/60)).padStart(2,'0');
  const s=String(timerSeconds%60).padStart(2,'0');
  timerDisplay.textContent=`${m}:${s}`;
}
function stopTimer(){ clearInterval(timerHandle); timerHandle=null; timerToggleBtn.textContent='شروع'; }
document.querySelector('#focusBtn').addEventListener('click', ()=>els.focusDialog.showModal());
timerToggleBtn.addEventListener('click', ()=>{
  if(timerHandle){ stopTimer(); return; }
  timerToggleBtn.textContent='توقف';
  timerHandle=setInterval(()=>{
    timerSeconds--; renderTimer();
    if(timerSeconds<=0){
      stopTimer(); timerSeconds=30*60; renderTimer();
      state.xp += 15;
      state.pointsByDate[todayKey()] = (state.pointsByDate[todayKey()]||0)+15;
      updateStreakOnActivity();
      saveState(); render(); celebrate();
      showToast('۳۰ دقیقه تمرکز کامل شد! +۱۵ امتیاز 🎉');
    }
  },1000);
});
document.querySelector('#timerResetBtn').addEventListener('click', ()=>{ stopTimer(); timerSeconds=30*60; renderTimer(); });
document.querySelector('#closeFocusBtn').addEventListener('click', stopTimer);

function celebrate(){
  const canvas=document.querySelector('#confettiCanvas'), ctx=canvas.getContext('2d');
  canvas.width=innerWidth*devicePixelRatio; canvas.height=innerHeight*devicePixelRatio; ctx.scale(devicePixelRatio,devicePixelRatio);
  const pieces=Array.from({length:42},()=>({x:innerWidth/2,y:innerHeight*.25,vx:(Math.random()-.5)*7,vy:Math.random()*-7-2,g:.22,r:Math.random()*5+3,life:55+Math.random()*20,h:Math.random()*360}));
  let frame=0;
  function tick(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    pieces.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life--;ctx.fillStyle=`hsl(${p.h} 80% 62%)`;ctx.fillRect(p.x,p.y,p.r,p.r*1.6)});
    frame++;
    if(frame<80) requestAnimationFrame(tick); else ctx.clearRect(0,0,innerWidth,innerHeight);
  }
  tick();
}

let deferredPrompt=null;
window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); deferredPrompt=e; els.installBtn.hidden=false; });
els.installBtn.addEventListener('click', async()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; els.installBtn.hidden=true; });

if('serviceWorker' in navigator){ window.addEventListener('load', ()=>navigator.serviceWorker.register('./sw.js').catch(()=>{})); }
renderTimer();
render();
