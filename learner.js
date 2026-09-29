(() => {
  'use strict';
  const C = window.FatemehCore;
  const $ = id => document.getElementById(id);
  const moods = [
    { v:'low', e:'😔', t:'کم‌انرژی' }, { v:'neutral', e:'😐', t:'معمولی' }, { v:'good', e:'🙂', t:'خوب' }, { v:'great', e:'😍', t:'عالی' }
  ];
  let previousAchievements = 0;
  let pendingReward = null;
  let timerMinutes = 25, timerSeconds = 25 * 60, timerHandle = null, timerRunning = false;

  function toast(text) { const el=$('toast'); el.textContent=text; el.classList.add('show'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),2200); }
  function confetti() { const root=$('confetti'); root.innerHTML=''; const items=['✨','💜','🌸','⭐','🎉']; for(let i=0;i<28;i++){const s=document.createElement('span');s.textContent=items[i%items.length];s.style.left=(Math.random()*100)+'%';s.style.animationDelay=(Math.random()*.5)+'s';s.style.animationDuration=(1.3+Math.random()*1.1)+'s';root.appendChild(s);} setTimeout(()=>root.innerHTML='',2600); }
  function status({text,mode}) { const el=$('liveStatus'); el.textContent=text; el.className='live-pill '+mode; }

  const store = C.createStore({ role:'learner', onChange:render, onStatus:status });

  function render(s) {
    const lvl=C.levelInfo(s.wallet.lifetimeXp); const done=s.daily.tasks.filter(t=>t.done).length; const total=s.daily.tasks.length; const pct=total?Math.round(done/total*100):0;
    $('balance').textContent=C.formatNumber(s.wallet.balance); $('lifetime').textContent=C.formatNumber(s.wallet.lifetimeXp); $('streak').textContent=C.formatNumber(s.streak.count);
    $('todayXp').textContent=C.formatNumber(s.daily.todayXp)+' XP'; $('taskStat').textContent=`${C.formatNumber(done)} / ${C.formatNumber(total)}`; $('questCount').textContent=`${C.formatNumber(done)} / ${C.formatNumber(total)}`;
    $('progressPct').textContent=C.formatNumber(pct)+'٪'; $('progressRing').style.setProperty('--p',pct); $('levelTitle').textContent=`${lvl.name} ${lvl.emoji}`; $('levelText').textContent=`Level ${C.formatNumber(lvl.number)}`; $('levelBar').style.width=lvl.progress+'%'; $('nextLevelText').textContent=lvl.nextAt?`تا سطح بعد ${C.formatNumber(lvl.nextAt-s.wallet.lifetimeXp)} XP`:'بالاترین سطح 🏆';
    $('dailyMessage').textContent=C.dailyMessage(s);
    const sorted=s.rewards.slice().sort((a,b)=>a.cost-b.cost); const next=sorted.find(r=>r.cost>s.wallet.balance) || sorted[sorted.length-1]; $('nextReward').textContent=next?`${next.emoji} ${C.formatNumber(next.cost)} XP`:'—';
    $('moodGrid').innerHTML=moods.map(m=>`<button type="button" class="mood-btn ${s.daily.mood===m.v?'active':''}" data-mood="${m.v}"><b>${m.e}</b><span>${m.t}</span></button>`).join('');
    $('restBtn').classList.toggle('active',!!s.daily.restDay); $('restBtn').textContent=s.daily.restDay?'🌙 Rest Day ثبت شد؛ امروز با خیال راحت استراحت کن':'🌙 امروز رو Rest Day می‌گیرم؛ استریکم حفظ بشه';
    $('taskList').innerHTML=s.daily.tasks.length?s.daily.tasks.map(t=>`<div class="task ${t.done?'done':''}"><button type="button" class="task-check" data-task="${C.escapeHtml(t.id)}" aria-label="تغییر وضعیت">✓</button><div class="task-main"><div class="task-title">${C.escapeHtml(t.title)}</div></div><span class="xp-badge">+${C.formatNumber(t.xp)} XP</span></div>`).join(''):'<div class="empty">امروز مأموریتی نداری 🌿</div>';
    $('rewardGrid').innerHTML=s.rewards.map(r=>`<article class="reward"><div class="reward-icon">${C.escapeHtml(r.emoji||'🎁')}</div><h3>${C.escapeHtml(r.title)}</h3><p>${C.escapeHtml(r.description||'')}</p><div class="reward-bottom"><span class="cost">${C.formatNumber(r.cost)} XP</span><button type="button" class="btn btn-small ${s.wallet.balance>=r.cost?'btn-primary':'btn-ghost'}" data-reward="${C.escapeHtml(r.id)}" ${s.wallet.balance<r.cost?'disabled':''}>${s.wallet.balance>=r.cost?'خرجش کن':'قفل'}</button></div></article>`).join('');
    const unlocked=new Set(s.achievements.map(a=>a.id)); $('achievementGrid').innerHTML=C.ACHIEVEMENTS.map(a=>`<div class="achievement ${unlocked.has(a.id)?'unlocked':''}" title="${C.escapeHtml(a.description)}"><b>${a.emoji}</b><span>${C.escapeHtml(a.title)}</span></div>`).join('');
    $('history').innerHTML=s.history.length?s.history.slice(0,8).map(h=>`<div class="history-row"><div><div class="history-title">${C.escapeHtml(h.label)}</div><div class="history-time">${C.formatTime(h.at)}</div></div><div class="delta ${h.delta>=0?'plus':'minus'}">${h.delta>=0?'+':'−'}${C.formatNumber(Math.abs(h.delta))} XP</div></div>`).join(''):'<div class="empty">اولین قدمت که ثبت بشه اینجا میاد ✨</div>';
    $('notConnected').classList.toggle('hidden',!!store.getCreds());
    if(s.achievements.length>previousAchievements && previousAchievements!==0){confetti();toast('یه Achievement جدید باز شد! 🏆');} previousAchievements=s.achievements.length;
  }

  $('moodGrid').addEventListener('click',e=>{const b=e.target.closest('[data-mood]');if(!b)return;store.mutate(s=>{s.daily.mood=b.dataset.mood;});});
  $('restBtn').addEventListener('click',()=>store.mutate(s=>{const today=C.todayKey();s.daily.restDay=!s.daily.restDay;if(s.daily.restDay&&!s.streak.restDays.includes(today))s.streak.restDays.push(today);if(!s.daily.restDay)s.streak.restDays=s.streak.restDays.filter(d=>d!==today);}));
  $('taskList').addEventListener('click',e=>{const b=e.target.closest('[data-task]');if(!b)return;store.mutate(s=>{const t=s.daily.tasks.find(x=>x.id===b.dataset.task);if(!t)return;if(!t.done){t.done=true;C.earnXp(s,t.xp,`ماموریت: ${t.title}`,'task');s.stats.completedTasks+=1;}else{t.done=false;const deduct=Math.min(s.wallet.balance,t.xp);s.wallet.balance-=deduct;s.wallet.lifetimeXp=Math.max(0,s.wallet.lifetimeXp-t.xp);s.daily.todayXp=Math.max(0,s.daily.todayXp-t.xp);s.stats.completedTasks=Math.max(0,s.stats.completedTasks-1);s.history.unshift({id:C.uid('h'),delta:-deduct,label:`لغو ماموریت: ${t.title}`,type:'undo',at:new Date().toISOString()});}}).then(()=>toast('ثبت شد ✨'));});
  $('rewardGrid').addEventListener('click',e=>{const b=e.target.closest('[data-reward]');if(!b)return;const s=store.getState();pendingReward=s.rewards.find(r=>r.id===b.dataset.reward);if(!pendingReward)return;$('confirmTitle').textContent=`${pendingReward.emoji} ${pendingReward.title}`;$('confirmText').textContent=`با ثبت این جایزه، ${C.formatNumber(pendingReward.cost)} XP از موجودی قابل خرج کم میشه؛ XP کل و Level کم نمیشه.`;$('confirmDialog').showModal();});
  $('confirmClose').onclick=$('confirmNo').onclick=()=>{pendingReward=null;$('confirmDialog').close();};
  $('confirmYes').addEventListener('click',async()=>{if(!pendingReward)return;const reward=pendingReward;pendingReward=null;$('confirmDialog').close();await store.mutate(s=>{if(C.spendXp(s,reward.cost,`جایزه: ${reward.title}`,'reward'))s.redemptions.unshift({id:C.uid('redeem'),rewardId:reward.id,title:reward.title,cost:reward.cost,at:new Date().toISOString()});});confetti();toast('جایزه ثبت شد؛ نوش جونتون 😄');});

  document.querySelectorAll('.time-chip').forEach(b=>b.addEventListener('click',()=>{if(timerRunning)return;document.querySelectorAll('.time-chip').forEach(x=>x.classList.remove('active'));b.classList.add('active');timerMinutes=Number(b.dataset.min);timerSeconds=timerMinutes*60;drawTimer();}));
  function drawTimer(){const m=String(Math.floor(timerSeconds/60)).padStart(2,'0'),s=String(timerSeconds%60).padStart(2,'0');$('timerDisplay').textContent=`${m}:${s}`;}
  function stopTimer(reset=true){clearInterval(timerHandle);timerHandle=null;timerRunning=false;$('timerStart').textContent='شروع تمرکز';if(reset){timerSeconds=timerMinutes*60;drawTimer();}}
  $('timerStart').addEventListener('click',()=>{if(timerRunning){stopTimer(false);$('timerStart').textContent='ادامه';return;}timerRunning=true;$('timerStart').textContent='توقف';timerHandle=setInterval(async()=>{timerSeconds-=1;drawTimer();if(timerSeconds<=0){clearInterval(timerHandle);timerHandle=null;timerRunning=false;await store.mutate(s=>{C.earnXp(s,15,`جلسه تمرکز ${timerMinutes} دقیقه‌ای`,'focus');s.stats.focusSessions+=1;s.stats.focusMinutes+=timerMinutes;});confetti();toast('جلسه کامل شد؛ +15 XP 🧠');timerSeconds=timerMinutes*60;drawTimer();$('timerStart').textContent='شروع تمرکز';}},1000);});
  $('timerReset').addEventListener('click',()=>stopTimer(true));

  window.addEventListener('beforeunload',()=>store.dispose());
  if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
  store.init();
})();
