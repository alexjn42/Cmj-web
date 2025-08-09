const BR = new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' });

function toCents(txt) {
  let clean = (txt || '').toString().trim()
    .replace(/\s+/g,'')
    .replace('R$','')
    .replace(/\./g,'');
  if (!clean) return 0;
  if (clean.includes(',')) {
    const [r,c='0'] = clean.split(',');
    return (parseInt(r || '0',10)*100) + parseInt((c+'0').slice(0,2),10);
  }
  return parseInt(clean,10)*100;
}
function fmt(cents) {
  const sign = cents<0?'-':'';
  const abs = Math.abs(cents);
  return sign + BR.format(abs/100);
}

const STORAGE_KEY = 'cmj_data_v1';
function loadAll() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function saveAll(obj) { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }
function todayISO(){ const d=new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); }

const dateEl = document.getElementById('date');
const machinesEl = document.getElementById('machines');
const resumeCard = document.getElementById('resumeCard');
const resumeList = document.getElementById('resumeList');
const clearBtn = document.getElementById('clearByDate');
const viewResumeBtn = document.getElementById('viewResume');
dateEl.value = todayISO();

function getDayData(all, iso) { if (!all[iso]) all[iso] = {}; return all[iso]; }
function addTxn(machineId, cents, type, iso) {
  const all = loadAll();
  const day = getDayData(all, iso);
  if (!day[machineId]) day[machineId] = [];
  day[machineId].unshift({ a: cents, t: type, id: Date.now() });
  saveAll(all); render();
}
function clearByDate(iso) { const all = loadAll(); delete all[iso]; saveAll(all); render(); }
function sum(list){ return list.reduce((acc,it)=>acc + (it.t==='in'?it.a:-it.a), 0); }

function render(){
  const iso = dateEl.value || todayISO();
  const all = loadAll();
  const day = getDayData(all, iso);

  const frag = document.createDocumentFragment();
  for (let i=1;i<=12;i++) {
    const box = document.createElement('div'); box.className = 'machine';
    const h = document.createElement('h3'); h.textContent = `Maquininha ${i}`; box.appendChild(h);
    const input = document.createElement('input'); input.placeholder='Valor (ex: 10,00)'; input.inputMode='decimal'; box.appendChild(input);

    const row = document.createElement('div'); row.className='row';
    const btnIn = document.createElement('button'); btnIn.className='btn'; btnIn.textContent='Entrada';
    btnIn.addEventListener('click', ()=>{ const cents=toCents(input.value); if (cents>0) addTxn(String(i), cents, 'in', iso); input.value=''; });
    const btnOut = document.createElement('button'); btnOut.className='btn outline'; btnOut.textContent='Saída';
    btnOut.addEventListener('click', ()=>{ const cents=toCents(input.value); if (cents>0) addTxn(String(i), cents, 'out', iso); input.value=''; });
    row.appendChild(btnIn); row.appendChild(btnOut); box.appendChild(row);

    const list = day[String(i)] || []; const total = sum(list);
    const tot = document.createElement('div'); tot.className='total';
    tot.innerHTML = `Total do dia: <span class="${total>=0?'in':'out'}">${fmt(total)}</span>`; box.appendChild(tot);

    const divList = document.createElement('div'); divList.className='list';
    list.forEach(it => {
      const line = document.createElement('div'); line.className='item';
      const left = document.createElement('div'); left.innerHTML = `<b class="${it.t==='in'?'in':'out'}">${it.t==='in'?'Entrada':'Saída'}</b>`;
      const right = document.createElement('div'); right.textContent = fmt(it.t==='in'?it.a:-it.a);
      line.appendChild(left); line.appendChild(right); divList.appendChild(line);
    });
    box.appendChild(divList);
    frag.appendChild(box);
  }
  machinesEl.replaceChildren(frag);

  // Resume
  resumeList.innerHTML='';
  const ul = document.createElement('div');
  for (let i=1;i<=12;i++) {
    const list = day[String(i)] || [];
    const total = sum(list);
    const row = document.createElement('div'); row.className='item';
    const left = document.createElement('div'); left.textContent = `Maquininha ${i}`;
    const right = document.createElement('div'); right.innerHTML = `<b>${fmt(total)}</b>`;
    row.appendChild(left); row.appendChild(right); ul.appendChild(row);
  }
  resumeList.appendChild(ul);
}

dateEl.addEventListener('change', render);
clearBtn.addEventListener('click', ()=>{
  const iso = dateEl.value || todayISO();
  if (confirm(`Apagar todos os registros de ${iso}?`)) clearByDate(iso);
});
viewResumeBtn.addEventListener('click', ()=>{ resumeCard.hidden = !resumeCard.hidden; });

render();
