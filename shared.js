(() => {
  'use strict';

  const STORAGE_STATE = 'fatemeh_v4_state';
  const STORAGE_CREDS_PREFIX = 'fatemeh_v4_creds_';
  const DEFAULT_TASKS = [
    { title: '۳۰ دقیقه ویدیوی آموزشی ببین', xp: 20 },
    { title: '۱۵ دقیقه تمرین یا یادداشت‌برداری', xp: 15 },
    { title: 'یک قدم برای مسیر شغلی بردار', xp: 25 }
  ];
  const DEFAULT_REWARDS = [
    { id: 'coffee', title: 'قهوه مهمون من', emoji: '☕', cost: 100, description: 'یه قرار کوتاه و خوشحال‌کننده' },
    { id: 'movie', title: 'انتخاب فیلم با فاطمه', emoji: '🎬', cost: 180, description: 'فیلم و خوراکی با انتخاب فاطمه' },
    { id: 'dinner', title: 'شام انتخاب فاطمه', emoji: '🍕', cost: 300, description: 'این دفعه انتخاب کامل با فاطمه' },
    { id: 'surprise', title: 'هدیه سورپرایزی', emoji: '🎁', cost: 500, description: 'یه سورپرایز کوچیک و واقعی' },
    { id: 'special-date', title: 'قرار مخصوص', emoji: '❤️', cost: 900, description: 'یه برنامه دونفره متفاوت' }
  ];
  const DAILY_MESSAGES = [
    'قرار نیست امروز همه‌چیز رو حل کنی؛ فقط یک قدم کوچیک کافیه. 🌱',
    'استمرار از انگیزه مهم‌تره؛ حتی ۲۰ دقیقه هم حساب میشه. ✨',
    'تو داری برای نسخه بعدی خودت سرمایه‌گذاری می‌کنی. 💜',
    'امروز فقط شروع کن؛ لازم نیست کامل باشه. 🎯',
    'قدم‌های کوچیک وقتی تکرار میشن، نتیجه‌های بزرگ می‌سازن. 🌿',
    'هر چیزی که امروز یاد می‌گیری، فردا یک انتخاب بیشتر بهت میده. 🚀',
    'پیشرفتت مسابقه با هیچ‌کس نیست؛ فقط مسیر خودته. 🤍',
    'یک جلسه تمرکز خوب، بهتر از چند ساعت عذاب وجدان گرفتنه. ☀️',
    'تو بیشتر از یک عنوان شغلی هستی؛ مهارت‌هات باهات می‌مونن. 🌸',
    'امروز برای خودت یک برد کوچیک بساز. 🏆',
    'حتی اگر انرژیت کمه، کوچک‌ترین قدم هم ارزش داره. 🌙',
    'تو لازم نیست سریع باشی؛ فقط ادامه بده. 🌱',
    'یادگیری امروز، آزادی انتخاب فرداست. ✨',
    'یه کار رو انتخاب کن و فقط همون رو تموم کن. 🎯',
    'من به قدم‌هایی که برمی‌داری افتخار می‌کنم، نه فقط به نتیجه. 💌',
    'امروز می‌تونه روز آروم ولی مفیدی باشه. 🌿',
    'شروع دوباره خودش یک مهارته؛ و تو داری تمرینش می‌کنی. 🚀',
    'به خودت فرصت بده؛ رشد همیشه پر سر و صدا نیست. 🤍',
    'یه تمرکز کوتاه، یه تیک سبز، یه حس خوب. همین. ✅',
    'هر روزی که برمی‌گردی به مسیر، یک برده. 🔥',
    'تو داری چیزی می‌سازی که بعداً بابتش از خودت ممنون میشی. 🌸',
    'هدف امروز: کمی بهتر، نه بی‌نقص. ✨',
    'یک ویدیو، یک تمرین، یک قدم. همین فرمول کافیه. 🎓',
    'اگر امروز سخت بود، حجم کار رو کم کن؛ مسیر رو نه. 🌱',
    'تو حق داری استراحت کنی و بعد دوباره ادامه بدی. 🤍',
    'پیشرفت واقعی گاهی فقط یعنی امروز تسلیم نشدی. 🔥',
    'امروز برای آینده‌ات یک هدیه کوچیک بذار. 🎁',
    'ذهن آروم + قدم کوچک = روز خوب. ☀️',
    'کاری که امروز می‌کنی لازم نیست بزرگ باشه؛ باید واقعی باشه. 🌿',
    'فقط شروع کن فاطمه؛ بقیه‌ش کم‌کم میاد. 💜'
  ];

  const ACHIEVEMENTS = [
    { id: 'first', emoji: '🌱', title: 'اولین قدم', description: 'اولین XP رو گرفتی', test: s => s.wallet.lifetimeXp >= 10 },
    { id: 'hundred', emoji: '💯', title: 'صدتایی', description: 'به 100 XP کل رسیدی', test: s => s.wallet.lifetimeXp >= 100 },
    { id: 'streak3', emoji: '🔥', title: 'سه روز پشت سر هم', description: '3 روز استمرار', test: s => s.streak.count >= 3 },
    { id: 'streak7', emoji: '🏆', title: 'هفته طلایی', description: '7 روز استمرار', test: s => s.streak.count >= 7 },
    { id: 'focus5', emoji: '🧠', title: 'حالت تمرکز', description: '5 جلسه تمرکز کامل', test: s => s.stats.focusSessions >= 5 },
    { id: 'tasks20', emoji: '✅', title: 'بیست قدم', description: '20 مأموریت کامل', test: s => s.stats.completedTasks >= 20 },
    { id: 'spender', emoji: '🎁', title: 'جایزه‌ات مبارک', description: 'اولین جایزه رو خرج کردی', test: s => s.redemptions.length >= 1 },
    { id: 'fiveHundred', emoji: '⭐', title: 'ستاره 500', description: '500 XP کل جمع کردی', test: s => s.wallet.lifetimeXp >= 500 }
  ];

  function uid(prefix = 'id') {
    if (crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function todayKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function yesterdayKey() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return todayKey(d);
  }

  function createDailyTasks() {
    return DEFAULT_TASKS.map((t, i) => ({ id: `default-${i}-${todayKey()}`, ...t, done: false }));
  }

  function baseState(adminHash = '') {
    return {
      version: 4,
      profile: { name: 'فاطمه' },
      wallet: { balance: 0, lifetimeXp: 0 },
      streak: { count: 0, lastActiveDate: null, restDays: [] },
      daily: {
        date: todayKey(),
        mood: null,
        todayXp: 0,
        partnerMessage: '',
        restDay: false,
        tasks: createDailyTasks()
      },
      rewards: typeof structuredClone === 'function' ? structuredClone(DEFAULT_REWARDS) : JSON.parse(JSON.stringify(DEFAULT_REWARDS)),
      redemptions: [],
      achievements: [],
      stats: { focusSessions: 0, focusMinutes: 0, completedTasks: 0 },
      history: [],
      adminHash,
      updatedAt: new Date().toISOString()
    };
  }

  function normalizeState(raw) {
    const fallback = baseState(raw?.adminHash || '');
    const s = raw && typeof raw === 'object' ? raw : fallback;
    s.version = 4;
    s.profile = { ...fallback.profile, ...(s.profile || {}) };
    s.wallet = { ...fallback.wallet, ...(s.wallet || {}) };
    s.streak = { ...fallback.streak, ...(s.streak || {}) };
    s.streak.restDays = Array.isArray(s.streak.restDays) ? s.streak.restDays : [];
    s.daily = { ...fallback.daily, ...(s.daily || {}) };
    s.daily.tasks = Array.isArray(s.daily.tasks) ? s.daily.tasks : createDailyTasks();
    s.rewards = Array.isArray(s.rewards) && s.rewards.length ? s.rewards : fallback.rewards;
    s.redemptions = Array.isArray(s.redemptions) ? s.redemptions : [];
    s.achievements = Array.isArray(s.achievements) ? s.achievements : [];
    s.stats = { ...fallback.stats, ...(s.stats || {}) };
    s.history = Array.isArray(s.history) ? s.history.slice(0, 100) : [];
    ensureToday(s);
    checkAchievements(s);
    return s;
  }

  function ensureToday(s) {
    const today = todayKey();
    if (s.daily?.date === today) return s;
    s.daily = {
      date: today,
      mood: null,
      todayXp: 0,
      partnerMessage: '',
      restDay: false,
      tasks: createDailyTasks()
    };
    return s;
  }

  function markActive(s) {
    const today = todayKey();
    const last = s.streak.lastActiveDate;
    if (last === today) return;
    if (!last) s.streak.count = 1;
    else if (last === yesterdayKey() || s.streak.restDays.includes(yesterdayKey())) s.streak.count += 1;
    else s.streak.count = 1;
    s.streak.lastActiveDate = today;
  }

  function addHistory(s, delta, label, type = 'xp') {
    s.history.unshift({ id: uid('h'), delta, label, type, at: new Date().toISOString() });
    s.history = s.history.slice(0, 100);
  }

  function earnXp(s, amount, label, type = 'earn') {
    amount = Math.max(0, Math.round(Number(amount) || 0));
    if (!amount) return;
    s.wallet.balance += amount;
    s.wallet.lifetimeXp += amount;
    s.daily.todayXp += amount;
    markActive(s);
    addHistory(s, amount, label, type);
    checkAchievements(s);
  }

  function spendXp(s, amount, label, type = 'spend') {
    amount = Math.max(0, Math.round(Number(amount) || 0));
    if (!amount || s.wallet.balance < amount) return false;
    s.wallet.balance -= amount;
    addHistory(s, -amount, label, type);
    checkAchievements(s);
    return true;
  }

  function adminAdjust(s, delta, reason = 'تغییر توسط همراه') {
    delta = Math.round(Number(delta) || 0);
    if (!delta) return;
    if (delta > 0) {
      s.wallet.balance += delta;
      s.wallet.lifetimeXp += delta;
      addHistory(s, delta, reason, 'admin');
    } else {
      const actual = Math.max(-s.wallet.balance, delta);
      s.wallet.balance += actual;
      addHistory(s, actual, reason, 'admin');
    }
    checkAchievements(s);
  }

  function checkAchievements(s) {
    const have = new Set(s.achievements.map(a => a.id));
    const unlocked = [];
    ACHIEVEMENTS.forEach(a => {
      if (!have.has(a.id) && a.test(s)) {
        const entry = { id: a.id, unlockedAt: new Date().toISOString() };
        s.achievements.push(entry);
        unlocked.push(a);
      }
    });
    return unlocked;
  }

  function levelInfo(lifetimeXp) {
    const levels = [
      { min: 0, max: 100, name: 'شروع قشنگ', emoji: '🌱' },
      { min: 100, max: 250, name: 'در حال رشد', emoji: '🌿' },
      { min: 250, max: 500, name: 'Rising Star', emoji: '⭐' },
      { min: 500, max: 900, name: 'Focused', emoji: '🎯' },
      { min: 900, max: 1500, name: 'Unstoppable', emoji: '🔥' },
      { min: 1500, max: 2500, name: 'Glow Up', emoji: '✨' },
      { min: 2500, max: Infinity, name: 'Legend', emoji: '🏆' }
    ];
    const index = levels.findIndex(l => lifetimeXp < l.max);
    const level = levels[index < 0 ? levels.length - 1 : index];
    const span = Number.isFinite(level.max) ? level.max - level.min : 1;
    const progress = Number.isFinite(level.max) ? Math.min(100, Math.max(0, ((lifetimeXp - level.min) / span) * 100)) : 100;
    return { number: (index < 0 ? levels.length : index + 1), ...level, progress, nextAt: Number.isFinite(level.max) ? level.max : null };
  }

  function dailyMessage(s) {
    if (s.daily.partnerMessage?.trim()) return s.daily.partnerMessage.trim();
    const d = new Date();
    const index = Math.abs(Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000)) % DAILY_MESSAGES.length;
    return DAILY_MESSAGES[index];
  }

  async function sha256(text) {
    const data = new TextEncoder().encode(String(text));
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function safeJson(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch { return value; }
  }

  function saveLocal(s) {
    s.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_STATE, JSON.stringify(s));
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_STATE);
      return normalizeState(raw ? JSON.parse(raw) : baseState());
    } catch {
      return baseState();
    }
  }

  function configReady() {
    const c = window.APP_CONFIG || {};
    return /^https:\/\/.+\.supabase\.co$/i.test(String(c.SUPABASE_URL || '').trim()) && String(c.SUPABASE_KEY || '').trim().length > 20;
  }

  function getCredentials(role) {
    const params = new URLSearchParams(location.search);
    const key = params.get('key');
    const room = params.get('room');
    const admin = params.get('admin');
    const storageKey = STORAGE_CREDS_PREFIX + role;
    let creds = null;
    try { creds = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch {}
    if (room && key) {
      creds = { room, key, admin: admin || creds?.admin || '' };
      localStorage.setItem(storageKey, JSON.stringify(creds));
      if (history.replaceState) history.replaceState({}, '', location.pathname);
    }
    return creds;
  }

  function clearCredentials(role) {
    localStorage.removeItem(STORAGE_CREDS_PREFIX + role);
  }

  function buildUrl(page, creds, includeAdmin = false) {
    const u = new URL(page, location.href);
    u.searchParams.set('room', creds.room);
    u.searchParams.set('key', creds.key);
    if (includeAdmin && creds.admin) u.searchParams.set('admin', creds.admin);
    return u.toString();
  }

  function makeClient(roomKey) {
    if (!configReady() || !window.supabase?.createClient) return null;
    const c = window.APP_CONFIG;
    return window.supabase.createClient(c.SUPABASE_URL.trim(), c.SUPABASE_KEY.trim(), {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { headers: { 'x-room-key': roomKey } }
    });
  }

  function createStore({ role, onChange, onStatus }) {
    let state = loadLocal();
    let creds = getCredentials(role);
    let client = creds ? makeClient(creds.key) : null;
    let channel = null;
    let saving = false;
    let connected = false;

    const notify = () => onChange?.(safeJson(state));
    const status = (text, mode = 'offline') => onStatus?.({ text, mode, connected });

    async function fetchRemote() {
      if (!client || !creds?.room) return null;
      const { data, error } = await client.from('couple_progress').select('state,updated_at').eq('room_id', creds.room).maybeSingle();
      if (error) throw error;
      if (!data?.state) return null;
      state = normalizeState(data.state);
      saveLocal(state);
      notify();
      return state;
    }

    async function saveRemote() {
      if (!client || !creds?.room) return false;
      const payload = safeJson(state);
      payload.updatedAt = new Date().toISOString();
      const { error } = await client.from('couple_progress').update({ state: payload, updated_at: new Date().toISOString() }).eq('room_id', creds.room);
      if (error) throw error;
      if (channel) {
        try { await channel.send({ type: 'broadcast', event: 'state_changed', payload: { at: Date.now() } }); } catch {}
      }
      return true;
    }

    async function init() {
      notify();
      if (!creds || !client) {
        status(creds ? 'تنظیم Supabase ناقص است' : 'حالت آفلاین', 'offline');
        return;
      }
      status('در حال اتصال…', 'syncing');
      try {
        await fetchRemote();
        channel = client.channel(`fatemeh-${creds.room}-${creds.key}`)
          .on('broadcast', { event: 'state_changed' }, async () => {
            if (saving) return;
            try { await fetchRemote(); status('زنده', 'online'); } catch {}
          })
          .subscribe((s) => {
            if (s === 'SUBSCRIBED') { connected = true; status('زنده', 'online'); }
            else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') { connected = false; status('اتصال ضعیف', 'offline'); }
          });
      } catch (e) {
        console.error('Sync init:', e);
        status('آفلاین؛ داده روی گوشی ذخیره شد', 'offline');
      }
    }

    async function mutate(mutator) {
      if (saving) return state;
      saving = true;
      status(client ? 'در حال ذخیره…' : 'ذخیره روی گوشی', client ? 'syncing' : 'offline');
      try {
        if (client) {
          try { await fetchRemote(); } catch {}
        }
        ensureToday(state);
        mutator(state);
        checkAchievements(state);
        saveLocal(state);
        notify();
        if (client) {
          await saveRemote();
          status('زنده', 'online');
        }
      } catch (e) {
        console.error('Mutate:', e);
        saveLocal(state);
        status('ذخیره محلی؛ اینترنت را چک کن', 'offline');
      } finally {
        saving = false;
      }
      return state;
    }

    function setState(next) {
      state = normalizeState(next);
      saveLocal(state);
      notify();
    }

    return {
      init, mutate, getState: () => safeJson(state), setState,
      getCreds: () => creds, isLive: () => !!client,
      refresh: fetchRemote,
      dispose: () => { if (client && channel) client.removeChannel(channel); }
    };
  }

  function formatNumber(n) {
    return new Intl.NumberFormat('fa-IR').format(Math.max(0, Math.round(Number(n) || 0)));
  }

  function formatTime(iso) {
    if (!iso) return '—';
    try { return new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }).format(new Date(iso)); }
    catch { return '—'; }
  }

  function escapeHtml(text) {
    return String(text ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
  }

  window.FatemehCore = {
    DEFAULT_REWARDS, ACHIEVEMENTS, baseState, normalizeState, ensureToday, earnXp, spendXp, adminAdjust,
    checkAchievements, levelInfo, dailyMessage, sha256, todayKey, uid, createStore, formatNumber, formatTime,
    escapeHtml, configReady, makeClient, getCredentials, clearCredentials, buildUrl, saveLocal, loadLocal
  };
})();
