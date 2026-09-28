(() => {
  const $ = s => document.querySelector(s);
  const KEY='fatemehRewardStateV3', ROOM_KEY='fatemehRewardRoomV3';
  const todayKey=()=>new Date().toISOString().slice(0,10);
  const yesterdayKey=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10)};
  const defaultTasks=[
    {id:'learn30',title:'۳۰ دقیقه آموزش',xp:10,sub:'فقط یک ویدیو یا یک بخش کوتاه'},
    {id:'practice',title:'تمرین چیزی که یاد گرفتم',xp:15,sub:'حتی ۱۵ دقیقه تمرین هم حسابه'},
    {id:'career',title:'یک قدم برای کار بعدی',xp:20,sub:'رزومه، درخواست کار یا تمرین مهارت'},
    {id:'selfcare',title:'یک کار خوب برای خودم',xp:5,sub:'پیاده‌روی، استراحت یا مرتب‌کردن ذهن'}
  ];
  const rewards=[
    {xp:50,title:'قهوه یا خوراکی موردعلاقه ☕',desc:'یک قرار کوچیک و خوشحال‌کننده'},
    {xp:100,title:'انتخاب فیلم و شب دونفره 🎬',desc:'فیلم با انتخاب کامل فاطمه'},
    {xp:180,title:'یک هدیه کوچیک 🎁',desc:'چیزی که مدتی دوستش داشته'},
    {xp:300,title:'قرار ویژه دونفره 💜',desc:'یک برنامه خاص بیرون از روتین'}
  ];
  const levels=[{min:0,max:50,name:'شروع قشنگ'},{min:50,max:120,name:'روی موج'},{min:120,max:220,name:'مصمم'},{min:220,max:360,name:'درخشان'},{min:360,max:999999,name:'فوق‌العاده'}];
  let timerSec=1800,timerId=null,deferredPrompt=null,cloud=null,suppressCloud=false;

  function fresh(){return {totalXP:0,streak:0,lastActiveDate:null,history:{},customTasks:[],updatedAt:null};}
  function load(){try{return {...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return fresh()}}
  let state=load();
  function save(push=true){state.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));render();if(push&&cloud&&!suppressCloud)cloud.set(state).catch(()=>{});}
  function day(){const k=todayKey(); if(!state.history[k]) state.history[k]={done:{},xp:0}; return state.history[k];}
  function allTasks(){return [...defaultTasks,...state.customTasks];}
  function updateStreakOnFirstAction(){const k=todayKey(),d=day();if(Object.values(d.done).filter(Boolean).length!==1)return; if(state.lastActiveDate===k)return; state.streak=state.lastActiveDate===yesterdayKey()?state.streak+1:1;state.lastActiveDate=k;}
  function toggleTask(id){const task=allTasks().find(t=>t.id===id);if(!task)return;const d=day();const was=!!d.done[id];d.done[id]=!was;d.xp=Math.max(0,d.xp+(was?-task.xp:task.xp));state.totalXP=Math.max(0,state.totalXP+(was?-task.xp:task.xp));if(!was)updateStreakOnFirstAction();save();}
  function level(){return levels.find(l=>state.totalXP>=l.min&&state.totalXP<l.max)||levels.at(-1)}
  function nextReward(){return rewards.find(r=>state.totalXP<r.xp)||rewards.at(-1)}
  function render(){const d=day(),tasks=allTasks(),done=Object.values(d.done).filter(Boolean).length,lv=level(),nr=nextReward();$('#totalXP').textContent=state.totalXP;$('#todayXP').textContent=`${d.xp||0} XP`;$('#doneCount').textContent=`${done} / ${tasks.length}`;$('#streak').textContent=state.streak||0;$('#levelName').textContent=lv.name;const span=Math.max(1,lv.max-lv.min),prog=Math.min(100,((state.totalXP-lv.min)/span)*100);$('#levelProgress').style.width=`${prog}%`;$('#nextLevelText').textContent=lv.max>100000?'بالاترین سطح ✨':`تا سطح بعد ${lv.max-state.totalXP} XP`;$('#nextRewardShort').textContent=state.totalXP>=rewards.at(-1).xp?'باز شد ✨':`${Math.max(0,nr.xp-state.totalXP)} XP`;$('#nextRewardTitle').textContent=state.totalXP>=rewards.at(-1).xp?'همه جایزه‌ها باز شده 🎉':nr.title;$('#nextRewardDesc').textContent=nr.desc;$('#rewardBadge').textContent=`${Math.min(state.totalXP,nr.xp)} / ${nr.xp}`;$('#rewardProgress').style.width=`${Math.min(100,(state.totalXP/nr.xp)*100)}%`;
    $('#taskList').innerHTML=tasks.map(t=>{const is=!!d.done[t.id];return `<div class="task ${is?'done':''}"><button class="task-check" data-id="${t.id}" aria-label="انجام ماموریت">${is?'✓':''}</button><div class="task-main"><div class="task-title">${escapeHtml(t.title)}</div><div class="task-sub">${escapeHtml(t.sub||'')}</div></div><span class="xp-badge">+${t.xp} XP</span></div>`}).join('');
    document.querySelectorAll('.task-check').forEach(b=>b.onclick=()=>toggleTask(b.dataset.id));
    $('#rewardList').innerHTML=rewards.map(r=>`<div class="reward-item ${state.totalXP>=r.xp?'unlocked':''}"><div><strong>${r.title}</strong><small>${r.desc}</small></div><span class="xp-badge">${state.totalXP>=r.xp?'باز شد ✓':r.xp+' XP'}</span></div>`).join('');
  }
  function escapeHtml(s=''){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}
  function report(){const d=day(),tasks=allTasks(),done=Object.values(d.done).filter(Boolean).length,nr=nextReward();return `گزارش امروز فاطمه 🌱\n⭐ امتیاز امروز: ${d.xp||0}\n🏆 امتیاز کل: ${state.totalXP}\n🔥 استمرار: ${state.streak||0} روز\n✅ ماموریت‌ها: ${done} از ${tasks.length}\n🎁 تا جایزه بعدی: ${Math.max(0,nr.xp-state.totalXP)} امتیاز`;}
  async function share(){const text=report();try{if(navigator.share)await navigator.share({title:'گزارش پیشرفت فاطمه',text});else{await navigator.clipboard.writeText(text);alert('گزارش کپی شد 💜')}}catch(e){if(e.name!=='AbortError')alert(text)}}
  function timerRender(){const m=String(Math.floor(timerSec/60)).padStart(2,'0'),s=String(timerSec%60).padStart(2,'0');$('#timerDisplay').textContent=`${m}:${s}`}
  function timerStart(){if(timerId){clearInterval(timerId);timerId=null;$('#timerStart').textContent='ادامه تمرکز';return}$('#timerStart').textContent='توقف';timerId=setInterval(()=>{timerSec--;timerRender();if(timerSec<=0){clearInterval(timerId);timerId=null;timerSec=1800;timerRender();$('#timerStart').textContent='شروع دوباره';alert('۳۰ دقیقه تموم شد؛ دمت گرم فاطمه 💜')}},1000)}
  function firebaseReady(){const c=window.FIREBASE_CONFIG||{};return c.apiKey&&c.databaseURL&&c.projectId}
  function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
  async function initCloud(){const room=(localStorage.getItem(ROOM_KEY)||'').trim();$('#roomCode').value=room;if(!room||!firebaseReady()){$('#cloudStatus').textContent='محلی';$('#cloudStatus').classList.add('offline');return}try{await loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');await loadScript('https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js');if(!firebase.apps.length)firebase.initializeApp(window.FIREBASE_CONFIG);const ref=firebase.database().ref('rooms/'+room+'/state');cloud=ref;$('#cloudStatus').textContent='زنده';$('#cloudStatus').classList.remove('offline');ref.on('value',snap=>{const remote=snap.val();if(remote&&remote.updatedAt&&(!state.updatedAt||remote.updatedAt>state.updatedAt)){suppressCloud=true;state={...fresh(),...remote};localStorage.setItem(KEY,JSON.stringify(state));render();suppressCloud=false;}});await ref.set(state);}catch(e){console.error(e);$('#cloudStatus').textContent='خطای اتصال';$('#cloudStatus').classList.add('offline')}}
  $('#shareBtn').onclick=share;$('#timerStart').onclick=timerStart;$('#timerReset').onclick=()=>{if(timerId)clearInterval(timerId);timerId=null;timerSec=1800;timerRender();$('#timerStart').textContent='شروع تمرکز'};$('#addTaskBtn').onclick=()=>$('#taskDialog').showModal();$('#taskForm').addEventListener('submit',e=>{e.preventDefault();const title=$('#newTaskTitle').value.trim(),xp=Number($('#newTaskXP').value);if(!title||!xp)return;state.customTasks.push({id:'c'+Date.now(),title,xp,sub:'ماموریت شخصی'});save();$('#newTaskTitle').value='';$('#taskDialog').close()});$('#showRewardsBtn').onclick=()=>$('#rewardsDialog').showModal();$('#closeRewards').onclick=()=>$('#rewardsDialog').close();$('#saveRoomBtn').onclick=()=>{localStorage.setItem(ROOM_KEY,$('#roomCode').value.trim().toUpperCase());location.reload()};window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').classList.remove('hidden')});$('#installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').classList.add('hidden')}};
  if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  render();timerRender();initCloud();
})();
