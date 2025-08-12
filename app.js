// CMJ Web v6.6.1 — Data/Hora no detalhe da maquininha; Resumo simples
const BR = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' });
const DT = new Intl.DateTimeFormat('pt-BR', { dateStyle:'short', timeStyle:'short' });
const STORAGE_KEY = 'cmj_data_v661';
const NAMES_KEY   = 'cmj_names_v1';

function toCents(txt){ let clean=(txt||'').toString().trim().replace(/\s+/g,'').replace('R$','').replace(/\./g,''); if(!clean) return 0; if(clean.includes(',')){ const [r,c='0']=clean.split(','); return (parseInt(r||'0',10)*100)+parseInt((c+'0').slice(0,2),10);} return parseInt(clean,10)*100; }
function fmt(c){ const s=c<0?'-':''; const a=Math.abs(c); return s+BR.format(a/100); }
function fmtAbs(c){ return BR.format(Math.abs(c)/100); }
function fmtDT(ms){ try{ return DT.format(new Date(ms)); }catch{ return '' } }

function loadAll(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function saveAll(o){ localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); }
function todayISO(){ const d=new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); }
function getDayData(all, iso){ if(!all[iso]) all[iso]={}; return all[iso]; }
function sumNet(list){ return list.reduce((acc,it)=>acc + (it.t==='in'?it.a:-it.a), 0); }
function sumIn(list){ return list.reduce((acc,it)=>acc + (it.t==='in'?it.a:0), 0); }
function sumOut(list){ return list.reduce((acc,it)=>acc + (it.t==='out'?it.a:0), 0); }

function defaultNames(){ const a=[]; for(let i=1;i<=12;i++) a[i]=`Maquininha ${i}`; return a; }
function loadNames(){ try{ const v=JSON.parse(localStorage.getItem(NAMES_KEY)); if(v&&Array.isArray(v)&&v.length>=13) return v; }catch{} return defaultNames(); }
function saveNames(arr){ localStorage.setItem(NAMES_KEY, JSON.stringify(arr)); }

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

const toggleNames=document.getElementById('toggleNames');
const namesPanel=document.getElementById('namesPanel');
const nameGrid=document.getElementById('nameGrid');
const saveNamesBtn=document.getElementById('saveNames');

const toggleSummary=document.getElementById('toggleSummary');
const summaryPanel=document.getElementById('summaryPanel');
const fromEl=document.getElementById('fromDate');
const toEl=document.getElementById('toDate');
const viewSummaryBtn=document.getElementById('viewSummary');
const clearRangeBtn=document.getElementById('clearRange');
const rangeCard=document.getElementById('rangeCard');
const rangeList=document.getElementById('rangeList');
const summaryTotals=document.getElementById('summaryTotals');

const today=todayISO();
fromEl.value=today; toEl.value=today;

let names = loadNames();

function routeToHome(){ homeView.hidden=false; machineView.hidden=true; }
function routeToMachine(id){
  homeView.hidden=true;
  machineView.hidden=false;
  showMachine(id);
  setTimeout(()=>{ try{ valueInput.focus({preventScroll:true}); valueInput.select(); }catch(e){} }, 50);
}

function renderHome(){
  const frag=document.createDocumentFragment();
  for(let i=1;i<=12;i++){
    const card=document.createElement('div'); card.className='machine-card';
    const icon=document.createElement('div'); icon.className='icon'; icon.textContent=i;
    const title=document.createElement('h3'); title.textContent=names[i] || `Maquininha ${i}`;
    card.appendChild(icon); card.appendChild(title);
    card.addEventListener('click',()=>routeToMachine(i));
    frag.appendChild(card);
  }
  machinesGrid.replaceChildren(frag);
}

let currentMachine=1;
function showMachine(id){
  currentMachine=id;
  machineTitle.textContent=names[id] || `Maquininha ${id}`;
  valueInput.value='';
  const iso=todayISO();
  const all=loadAll();
  const list=(getDayData(all,iso)[String(id)]||[]);
  machineTotal.textContent=`Total de hoje: ${fmt(sumNet(list))}`;
  machineList.innerHTML='';
  list.forEach(it=>{
    const line=document.createElement('div'); line.className='line';
    const left=document.createElement('div'); left.innerHTML=`<b class="${it.t==='in'?'in':'out'}">${it.t==='in'?'Retirada':'Pagamento'}</b> <span class="muted-sm">${fmtDT(it.id)}</span>`;
    const right=document.createElement('div'); right.textContent=fmt(it.t==='in'?it.a:-it.a);
    const wrap=document.createElement('div'); wrap.className='item'; wrap.appendChild(line);
    wrap.firstChild.appendChild(left); wrap.firstChild.appendChild(right);
    machineList.appendChild(wrap);
  });
}

function addTxn(id,cents,type){
  const iso=todayISO();
  const all=loadAll();
  const day=getDayData(all,iso);
  const key=String(id);
  if(!day[key]) day[key]=[];
  day[key].unshift({a:cents,t:type,id:Date.now()}); // timestamp
  saveAll(all);
  routeToHome(); renderHome();
}

backHome?.addEventListener('click',routeToHome);
btnIn?.addEventListener('click',()=>{ const c=toCents(valueInput.value); if(c>0) addTxn(currentMachine,c,'in'); });
btnOut?.addEventListener('click',()=>{ const c=toCents(valueInput.value); if(c>0) addTxn(currentMachine,c,'out'); });

toggleNames?.addEventListener('click', ()=>{
  namesPanel.classList.toggle('show');
  if(namesPanel.classList.contains('show')){
    nameGrid.innerHTML='';
    for(let i=1;i<=12;i++){
      const box=document.createElement('div');
      const lab=document.createElement('label'); lab.textContent=`Maquininha ${i}`;
      const inp=document.createElement('input'); inp.value = names[i] || `Maquininha ${i}`; inp.dataset.id=String(i);
      box.appendChild(lab); box.appendChild(inp);
      nameGrid.appendChild(box);
    }
  }
});
saveNamesBtn?.addEventListener('click', ()=>{
  const inputs = nameGrid.querySelectorAll('input');
  const arr = defaultNames();
  inputs.forEach(inp=>{ const id=parseInt(inp.dataset.id,10); arr[id]=inp.value.trim() || `Maquininha ${id}`; });
  names = arr; saveNames(arr);
  namesPanel.classList.remove('show');
  renderHome();
});

toggleSummary?.addEventListener('click', ()=>{
  summaryPanel.classList.toggle('show');
  if(!summaryPanel.classList.contains('show')) rangeCard.hidden=true;
});

function* dateRange(fromIso,toIso){
  const d=s=>{ const [y,m,da]=s.split('-').map(n=>parseInt(n,10)); return new Date(y,m-1,da)};
  let a=d(fromIso), b=d(toIso);
  for(let dt=new Date(a); dt<=b; dt.setDate(dt.getDate()+1)){
    yield dt.toISOString().slice(0,10);
  }
}

function sumIn(list){ return list.reduce((acc,it)=>acc + (it.t==='in'?it.a:0), 0); }
function sumOut(list){ return list.reduce((acc,it)=>acc + (it.t==='out'?it.a:0), 0); }

viewSummaryBtn?.addEventListener('click', ()=>{
  const from=fromEl.value, to=toEl.value;
  if(!from||!to){ alert('Selecione as duas datas.'); return; }
  if(from>to){ alert('A data "De" não pode ser maior que "Até".'); return; }

  const all=loadAll();
  const perMachineIn   = Array.from({length:13},()=>0);
  const perMachineOut  = Array.from({length:13},()=>0);
  const perMachineNet  = Array.from({length:13},()=>0);
  let totalInAll = 0, totalOutAll = 0;

  for(const iso of dateRange(from,to)){
    const day = all[iso] || {};
    for(let i=1;i<=12;i++){
      const list = day[String(i)] || [];
      const tIn = sumIn(list), tOut = sumOut(list);
      perMachineIn[i]  += tIn;
      perMachineOut[i] += tOut;
      perMachineNet[i] += (tIn - tOut);
      totalInAll  += tIn;
      totalOutAll += tOut;
    }
  }

  rangeCard.hidden=false;
  rangeList.innerHTML='';
  for(let i=1;i<=12;i++){
    const entradas = perMachineIn[i];
    const saidas   = perMachineOut[i];
    const saldo    = perMachineNet[i];
    const row=document.createElement('div'); row.className='item';
    const left=document.createElement('div'); left.innerHTML = `<div><b>${names[i] || ('Maquininha '+i)}</b></div>
      <div class="pill"><span class="label">Entradas:</span><span class="in"><b>${fmtAbs(entradas)}</b></span></div>
      <div class="pill"><span class="label">Saídas:</span><span class="out"><b>${fmtAbs(saidas)}</b></span></div>`;
    const right=document.createElement('div'); right.innerHTML = `<div><b>Saldo</b></div><div style="text-align:right">${fmt(saldo)}</div>`;
    row.appendChild(left); row.appendChild(right); rangeList.appendChild(row);
  }

  const saldoGeral = totalInAll - totalOutAll;
  summaryTotals.innerHTML = `
    <div class="item"><div><b>Total de Entradas</b></div><div class="in"><b>${fmtAbs(totalInAll)}</b></div></div>
    <div class="item"><div><b>Total de Saídas</b></div><div class="out"><b>${fmtAbs(totalOutAll)}</b></div></div>
    <div class="item"><div><b>Saldo</b></div><div><b>${fmt(saldoGeral)}</b></div></div>
  `;
});

clearRangeBtn?.addEventListener('click', ()=>{
  const from=fromEl.value, to=toEl.value;
  if(!from||!to){ alert('Selecione as duas datas.'); return; }
  if(from>to){ alert('A data "De" não pode ser maior que "Até".'); return; }
  if(!confirm(`Apagar todos os registros de ${from} até ${to}?`)) return;
  const all=loadAll();
  for(const iso of dateRange(from,to)){ delete all[iso]; }
  saveAll(all);
  rangeCard.hidden=true;
  renderHome();
});

renderHome(); routeToHome();
