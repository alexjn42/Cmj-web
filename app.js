const BR = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' });
const STORAGE_KEY = 'cmj_data_v3';
function toCents(txt){ let clean=(txt||'').toString().trim().replace(/\s+/g,'').replace('R$','').replace(/\./g,''); if(!clean) return 0; if(clean.includes(',')){ const [r,c='0']=clean.split(','); return (parseInt(r||'0',10)*100)+parseInt((c+'0').slice(0,2),10);} return parseInt(clean,10)*100;}
function fmt(c){ const s=c<0?'-':''; const a=Math.abs(c); return s+BR.format(a/100);}
function loadAll(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function saveAll(o){ localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); }
function todayISO(){ const d=new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); }
function getDayData(all, iso){ if(!all[iso]) all[iso]={}; return all[iso]; }
function sum(list){ return list.reduce((acc,it)=>acc + (it.t==='in'?it.a:-it.a), 0); }
function* dateRange(fromIso,toIso){ const d=s=>{ const [y,m,da]=s.split('-').map(n=>parseInt(n,10)); return new Date(y,m-1,da)}; let a=d(fromIso), b=d(toIso); for(let dt=new Date(a); dt<=b; dt.setDate(dt.getDate()+1)){ yield dt.toISOString().slice(0,10);} }

const dateEl=document.getElementById('date');
const fromEl=document.getElementById('fromDate');
const toEl=document.getElementById('toDate');
const homeView=document.getElementById('homeView');
const machineView=document.getElementById('machineView');
const machinesGrid=document.getElementById('machinesGrid');
const machineTitle=document.getElementById('machineTitle');
const backHome=document.getElementById('backHome');
const valueInput=document.getElementById('valueInput');
const btnIn=document.getElementById('btnIn');
const btnOut=document.getElementById('btnOut');
const machineTotal=document.getElementById('machineTotal');
const machineList=document.getElementById('machineList');
const resumeCard=document.getElementById('resumeCard');
const resumeList=document.getElementById('resumeList');
const rangeCard=document.getElementById('rangeCard');
const rangeList=document.getElementById('rangeList');
const clearBtn=document.getElementById('clearByDate');
const viewResumeBtn=document.getElementById('viewResume');
const viewRangeBtn=document.getElementById('viewRange');
const clearRangeBtn=document.getElementById('clearRange');

const today=todayISO();
dateEl.value=today; fromEl.value=today; toEl.value=today;

function routeToHome(){ homeView.hidden=false; machineView.hidden=true; }
function routeToMachine(id){ homeView.hidden=true; machineView.hidden=false; showMachine(id); }

function renderHome(){ const iso=dateEl.value||todayISO(); const all=loadAll(); const day=getDayData(all,iso); const frag=document.createDocumentFragment(); for(let i=1;i<=12;i++){ const card=document.createElement('div'); card.className='machine-card'; const icon=document.createElement('div'); icon.className='icon'; icon.textContent=i; const title=document.createElement('h3'); title.textContent=`Maquininha ${i}`; const total=sum(day[String(i)]||[]); const tot=document.createElement('div'); tot.className='total'; tot.innerHTML=`Total: <span class="${total>=0?'in':'out'}">${fmt(total)}</span>`; card.appendChild(icon); card.appendChild(title); card.appendChild(tot); card.addEventListener('click',()=>routeToMachine(i)); frag.appendChild(card);} machinesGrid.replaceChildren(frag); }

let currentMachine=1;
function showMachine(id){ currentMachine=id; machineTitle.textContent=`Maquininha ${id}`; valueInput.value=''; const iso=dateEl.value||todayISO(); const all=loadAll(); const day=getDayData(all,iso); const list=day[String(id)]||[]; machineTotal.innerHTML=`Total do dia: <span class="${sum(list)>=0?'in':'out'}">${fmt(sum(list))}</span>`; machineList.innerHTML=''; list.forEach(it=>{ const line=document.createElement('div'); line.className='item'; const left=document.createElement('div'); left.innerHTML=`<b class="${it.t==='in'?'in':'out'}">${it.t==='in'?'Correção/Retirada':'Pagamento'}</b>`; const right=document.createElement('div'); right.textContent=fmt(it.t==='in'?it.a:-it.a); line.appendChild(left); line.appendChild(right); machineList.appendChild(line); }); }

function addTxn(id,cents,type){ const iso=dateEl.value||todayISO(); const all=loadAll(); const day=getDayData(all,iso); const key=String(id); if(!day[key]) day[key]=[]; day[key].unshift({a:cents,t:type,id:Date.now()}); saveAll(all); routeToHome(); renderHome(); }

backHome.addEventListener('click',routeToHome);
btnIn.addEventListener('click',()=>{ const cents=toCents(valueInput.value); if(cents>0) addTxn(currentMachine,cents,'in'); });
btnOut.addEventListener('click',()=>{ const cents=toCents(valueInput.value); if(cents>0) addTxn(currentMachine,cents,'out'); });

dateEl.addEventListener('change',()=>{ renderHome(); if(!homeView.hidden) routeToHome(); });

clearBtn.addEventListener('click',()=>{ const iso=dateEl.value||todayISO(); if(confirm(`Apagar todos os registros de ${iso}?`)){ const all=loadAll(); delete all[iso]; saveAll(all); renderHome(); routeToHome(); }});

viewResumeBtn.addEventListener('click',()=>{ resumeCard.hidden=!resumeCard.hidden; const iso=dateEl.value||todayISO(); const all=loadAll(); const day=getDayData(all,iso); resumeList.innerHTML=''; for(let i=1;i<=12;i++){ const total=sum(day[String(i)]||[]); const row=document.createElement('div'); row.className='item'; const left=document.createElement('div'); left.textContent=`Maquininha ${i}`; const right=document.createElement('div'); right.innerHTML=`<b>${fmt(total)}</b>`; row.appendChild(left); row.appendChild(right); resumeList.appendChild(row);} });

viewRangeBtn.addEventListener('click',()=>{ const from=fromEl.value, to=toEl.value; if(!from||!to){ alert('Selecione as duas datas.'); return;} if(from>to){ alert('A data "De" não pode ser maior que "Até".'); return;} const all=loadAll(); const totals=Array.from({length:13},()=>0); for(const iso of dateRange(from,to)){ const day=all[iso]||{}; for(let i=1;i<=12;i++){ const list=day[String(i)]||[]; totals[i]+=sum(list);} } rangeCard.hidden=false; rangeList.innerHTML=''; for(let i=1;i<=12;i++){ const row=document.createElement('div'); row.className='item'; const left=document.createElement('div'); left.textContent=`Maquininha ${i}`; const right=document.createElement('div'); right.innerHTML=`<b>${fmt(totals[i])}</b>`; row.appendChild(left); row.appendChild(right); rangeList.appendChild(row);} });

clearRangeBtn.addEventListener('click',()=>{ const from=fromEl.value, to=toEl.value; if(!from||!to){ alert('Selecione as duas datas.'); return;} if(from>to){ alert('A data "De" não pode ser maior que "Até".'); return;} if(!confirm(`Apagar todos os registros de ${from} até ${to}?`)) return; const all=loadAll(); for(const iso of dateRange(from,to)){ delete all[iso]; } saveAll(all); renderHome(); rangeCard.hidden=true; resumeCard.hidden=true; routeToHome(); });

renderHome(); routeToHome();
