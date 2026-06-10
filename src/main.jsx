
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

import React, {useEffect,useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient} from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import {Users,Package,Warehouse,FileDown,Trash2,Eye,EyeOff,Printer,LogOut} from 'lucide-react';
import './style.css';

const DEFAULT_SUPABASE_URL='https://wvdihlztlgwpmqoaobxc.supabase.co';
const url=import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('VITE_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('VITE_SUPABASE_ANON_KEY') || '';
const supabase = url&&key ? createClient(url,key) : null;
const today=()=>new Date().toISOString().slice(0,10);
const nowTime=()=>new Date().toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'});
const norm=(s='')=>s.toString().toLowerCase().trim();

function App(){
 const [ready,setReady]=useState(false),[err,setErr]=useState(''),[me,setMe]=useState(null),[tab,setTab]=useState('operacje'),[toast,setToast]=useState('');
 const [kontrahenci,setKontrahenci]=useState([]),[opakowania,setOpakowania]=useState([]),[magazyny,setMagazyny]=useState([]),[users,setUsers]=useState([]),[operacje,setOperacje]=useState([]),[usuniete,setUsuniete]=useState([]);
 const logout=()=>{localStorage.removeItem('agro_logged_user_id'); setMe(null);};
 const load=async()=>{ if(!supabase){setErr('Brak zmiennych VITE_SUPABASE_URL lub VITE_SUPABASE_ANON_KEY w Vercel.'); setReady(true); return}
  try{
   const tables=['kontrahenci','opakowania','magazyny','uzytkownicy','operacje','usuniete_operacje'];
   const [k,o,m,u,op,del]=await Promise.all(tables.map(t=>supabase.from(t).select('*').order('id',{ascending:true})));
   for(const r of [k,o,m,u,op,del]) if(r.error) throw r.error;
   setKontrahenci(k.data||[]); setOpakowania(o.data||[]); setMagazyny(m.data||[]); setUsers(u.data||[]); setOperacje(op.data||[]); setUsuniete(del.data||[]);
   const savedId=localStorage.getItem('agro_logged_user_id');
   if(savedId && !me){const savedUser=(u.data||[]).find(x=>String(x.id)===String(savedId)&&x.aktywny!==false); if(savedUser) setMe(savedUser);}
   setReady(true);
  }catch(e){setErr('Błąd połączenia z Supabase: '+(e.message||e)); setReady(true)}
 };
 useEffect(()=>{load()},[]);
 useEffect(()=>{const t=setInterval(()=>load(),15000);return()=>clearInterval(t)},[]);
 if(!ready) return <Shell><div className="login"><h2>Ładowanie systemu...</h2></div></Shell>;
 if(err) return <SetupSupabase/>;
 if(!me) return <Login users={users} setMe={setMe}/>;
 const notify=(msg)=>{setToast(msg); setTimeout(()=>setToast(''),3200)};
 const ctx={me,load,kontrahenci,opakowania,magazyny,users,operacje,usuniete,setTab,notify};
 return <Shell>
   <header className="top"><div><b>Agromarbanka</b><span>Online Supabase</span><span className="userBadge">Zalogowano: {me.imie} · {me.rola}</span></div><button onClick={logout}><LogOut size={16}/> Wyloguj</button></header>
   <nav>{['operacje','kontrahenci','opakowania','magazyny','raporty','historia','uzytkownicy','usuniete'].filter(x=>me.rola==='admin'||!['uzytkownicy','usuniete'].includes(x)).map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{label(x)}</button>)}</nav>
   {toast&&<div className="toastMsg">{toast}</div>}
   {tab==='operacje'&&<Operacje {...ctx}/>} {tab==='kontrahenci'&&<Kontrahenci {...ctx}/>} {tab==='opakowania'&&<Opakowania {...ctx}/>} {tab==='magazyny'&&<Magazyny {...ctx}/>} {tab==='raporty'&&<Raporty {...ctx}/>} {tab==='historia'&&<Historia {...ctx}/>} {tab==='uzytkownicy'&&<Uzytkownicy {...ctx}/>} {tab==='usuniete'&&<Usuniete {...ctx}/>} 
 </Shell>
}

function SetupSupabase(){
 const [u,setU]=useState(localStorage.getItem('VITE_SUPABASE_URL')||DEFAULT_SUPABASE_URL);
 const [k,setK]=useState(localStorage.getItem('VITE_SUPABASE_ANON_KEY')||'');
 const save=()=>{ if(!u||!k) return alert('Wklej URL i klucz Supabase'); localStorage.setItem('VITE_SUPABASE_URL',u.trim()); localStorage.setItem('VITE_SUPABASE_ANON_KEY',k.trim()); location.reload(); };
 return <Shell><div className="login"><h2>Konfiguracja Supabase</h2><p className="info">Nie trzeba już ustawiać zmiennych w Vercel. Wklej klucz raz tutaj.</p><label>Supabase URL</label><input value={u} onChange={e=>setU(e.target.value)}/><label>Anon / publishable key</label><textarea rows="4" value={k} onChange={e=>setK(e.target.value)} placeholder="eyJ... albo sb_publishable_..."/><button className="primary" onClick={save}>Zapisz i uruchom</button><small>Ten klucz jest publiczny dla aplikacji. Nie wklejaj service_role ani secret key.</small></div></Shell>
}

function Shell({children}){return <main><section className="hero"><div><h1>Agromarbanka</h1><p>Nowoczesna obsługa opakowań zwrotnych, magazynu głównego i zapasowego.</p></div></section>{children}</main>}
function label(x){return {operacje:'Operacja',kontrahenci:'Kontrahenci',opakowania:'Opakowania',magazyny:'Magazyny',raporty:'Raporty',historia:'Historia',uzytkownicy:'Użytkownicy',usuniete:'Usunięte'}[x]})
function Login({users,setMe}){const [tel,setTel]=useState(''),[pin,setPin]=useState(''),[msg,setMsg]=useState(''); const login=()=>{const u=users.find(x=>x.telefon===tel.trim()&&x.pin===pin.trim()&&x.aktywny!==false); if(u){localStorage.setItem('agro_logged_user_id',String(u.id)); setMe(u);} else setMsg('Nieprawidłowy telefon lub PIN')}; return <Shell><div className="login"><h2>Panel logowania</h2><input placeholder="Telefon" value={tel} onChange={e=>setTel(e.target.value)}/><input placeholder="PIN" value={pin} onChange={e=>setPin(e.target.value)} type="password"/><button className="primary" onClick={login}>Zaloguj</button><small>Po zalogowaniu aplikacja zapamięta użytkownika do czasu kliknięcia „Wyloguj”.</small>{msg&&<p className="error">{msg}</p>}</div></Shell>}
function SearchSelect({label,items,value,setValue,field='nazwa',resetKey=0}){
 const [q,setQ]=useState(value||''),[open,setOpen]=useState(false);
 useEffect(()=>{ if(value && value!==q) setQ(value); },[value]);
 useEffect(()=>{ if(!value){ setQ(''); setOpen(false); } },[resetKey,value]);
 const list=items.filter(x=>!x.ukryty && norm(x[field]).includes(norm(q))).slice(0,12);
 const choose=(name)=>{ setValue(name); setQ(name); setOpen(false); };
 return <div className="group searchbox"><label>{label}</label>
  <input placeholder={'Wpisz pierwsze litery '+label.toLowerCase()} value={q} onFocus={()=>setOpen(true)} onChange={e=>{setQ(e.target.value); setOpen(true); if(value) setValue('');}} />
  {open && q && list.length>0 && value!==q && <div className="suggestions">{list.map(x=><button type="button" key={x.id} onClick={()=>choose(x[field])}>{x[field]}</button>)}</div>}
  <select value={value} onChange={e=>choose(e.target.value)}><option value="">Wybierz z listy...</option>{list.map(x=><option key={x.id} value={x[field]}>{x[field]}</option>)}</select>
 </div>
}
function Operacje(p){
 const mags=p.me.rola==='kierowca'&&p.me.magazyn?p.magazyny.filter(m=>m.nazwa===p.me.magazyn):p.magazyny;
 const emptyPos=()=>({uid:Date.now()+Math.random(),opakowanie:'',ilosc:1});
 const [kon,setKon]=useState(''),[mag,setMag]=useState(mags[0]?.nazwa||''),[data,setData]=useState(today()),[podpis,setPodpis]=useState(''),[resetSearch,setResetSearch]=useState(0),[pozycje,setPozycje]=useState([emptyPos()]);
 useEffect(()=>{if(!mag&&mags[0])setMag(mags[0].nazwa)},[mags]);
 const updPos=(uid,patch)=>setPozycje(xs=>xs.map(x=>x.uid===uid?{...x,...patch}:x));
 const addPos=()=>setPozycje(xs=>[...xs,emptyPos()]);
 const delPos=(uid)=>setPozycje(xs=>xs.length>1?xs.filter(x=>x.uid!==uid):xs);
 const clearForm=()=>{setKon('');setPozycje([emptyPos()]);setData(today());setPodpis('');setResetSearch(x=>x+1);};
 const save=async(typ)=>{
  const valid=pozycje.filter(x=>x.opakowanie&&Number(x.ilosc)>0);
  if(!kon||!mag||valid.length===0)return alert('Uzupełnij kontrahenta, magazyn oraz co najmniej jedną pozycję opakowania z ilością');
  const dokument_id=(crypto?.randomUUID?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(16).slice(2));
  const base={kontrahent:kon,magazyn:mag,typ,data_operacji:data,godzina_operacji:nowTime(),podpis,uzytkownik:p.me.imie,dokument_id};
  const payloads=valid.map(pos=>({...base,opakowanie:pos.opakowanie,ilosc:Number(pos.ilosc)}));
  let r=await supabase.from('operacje').insert(payloads);
  if(r.error && (r.error.message||'').includes('dokument_id')){
    const fallback=payloads.map(({dokument_id,...x})=>x);
    r=await supabase.from('operacje').insert(fallback);
  }
  if(r.error && (r.error.message||'').includes('godzina_operacji')){
    const fallback=payloads.map(({godzina_operacji,...x})=>x);
    r=await supabase.from('operacje').insert(fallback);
  }
  if(r.error) return alert(r.error.message);
  clearForm(); p.notify&&p.notify('Operacja została zapisana'); p.load();
 };
 return <div className="grid"><section className="card"><h2><Package/> Operacja</h2>
  <SearchSelect label="Kontrahent" items={p.kontrahenci.filter(x=>x.aktywny!==false)} value={kon} setValue={setKon} resetKey={resetSearch}/>
  <div className="group"><label>Magazyn</label><select value={mag} onChange={e=>setMag(e.target.value)}>{mags.filter(x=>x.aktywny!==false&&!x.ukryty).map(m=><option key={m.id}>{m.nazwa}</option>)}</select></div>
  <div className="positionsBox"><h3>Pozycje dokumentu</h3>{pozycje.map((pos,idx)=><div className="positionRow" key={pos.uid}>
    <b>Pozycja {idx+1}</b>
    <SearchSelect label="Opakowanie" items={p.opakowania.filter(x=>x.aktywne!==false)} value={pos.opakowanie} setValue={(v)=>updPos(pos.uid,{opakowanie:v})} resetKey={resetSearch}/>
    <label>Ilość<input type="number" value={pos.ilosc} min="1" onChange={e=>updPos(pos.uid,{ilosc:e.target.value})}/></label>
    <button type="button" className="danger lightDanger" onClick={()=>delPos(pos.uid)} disabled={pozycje.length===1}>Usuń pozycję</button>
  </div>)}
  <button type="button" className="secondary addLineBtn" onClick={addPos}>+ Dodaj kolejne opakowanie</button></div>
  <div className="row"><div><label>Data operacji</label><input type="date" value={data} onChange={e=>setData(e.target.value)}/></div></div>
  <label>Podpis odbiorcy</label><input value={podpis} onChange={e=>setPodpis(e.target.value)} placeholder="Imię i nazwisko"/>
  <div className="row"><button className="big blue" onClick={()=>save('Wydanie')}>Wydanie</button><button className="big green" onClick={()=>save('Przyjęcie (PZ)')}>Przyjęcie (PZ)</button></div>
 </section><section className="card"><h2>Ostatnie operacje</h2><OperacjeLista rows={p.operacje.slice(-20).reverse()} allRows={p.operacje} me={p.me} load={p.load} kontrahenci={p.kontrahenci} opakowania={p.opakowania} magazyny={p.magazyny} notify={p.notify}/></section></div>}
function dokumentHtml(o){
 const pozycje=o.pozycje&&o.pozycje.length?o.pozycje:[{opakowanie:o.opakowanie,ilosc:o.ilosc}];
 const pozycjeRows=pozycje.map((p,i)=>`<tr><td>${i+1}</td><td>${p.opakowanie||''}</td><td>${p.ilosc||''}</td></tr>`).join('');
 const total=pozycje.reduce((a,p)=>a+(Number(p.ilosc)||0),0);
 const docText=`${o.typ||'Operacja'} - ${o.kontrahent||''}, pozycji: ${pozycje.length}, suma ilości: ${total}, magazyn: ${o.magazyn||''}, data: ${o.data_operacji||''} ${o.godzina_operacji||''}`;
 return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dokument ${o.typ||''}</title><style>
*{box-sizing:border-box}
body{font-family:Arial;padding:18px;color:#111;margin:0;max-width:760px;margin-left:auto;margin-right:auto;background:#fff}
.docbar{position:sticky;top:0;background:#fff;padding:10px 0 14px;margin-bottom:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px;z-index:10;border-bottom:1px solid #eee}
.docbar button,.docbar a{border:0;border-radius:12px;padding:12px 10px;font-size:14px;font-weight:700;background:#17304a;color:#fff;text-decoration:none;text-align:center}
.docbar .secondary{background:#eef2f5;color:#17304a}.docbar .green{background:#2f7d32;color:#fff}.docbar .orange{background:#f57c00;color:#fff}
h1{margin:12px 0 4px;font-size:34px}.box{border:1px solid #ddd;border-radius:14px;padding:18px;margin:18px 0}table{width:100%;border-collapse:collapse;table-layout:fixed}td,th{padding:9px;border-bottom:1px solid #eee;vertical-align:top;word-break:break-word;text-align:left}.meta td:first-child{width:42%;font-weight:700}.sign{height:80px;border-bottom:1px solid #111;margin-top:40px;width:100%;max-width:420px}.muted{color:#667;font-size:18px}
.signaturePad{border:1px solid #ddd;border-radius:14px;padding:12px;margin-top:18px}.signaturePad canvas{width:100%;height:180px;border:1px solid #ccc;border-radius:10px;touch-action:none;background:#fff}.sigActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.sigActions button{border:0;border-radius:12px;padding:12px;background:#eef2f5;color:#17304a;font-weight:700}
@media(max-width:600px){body{padding:14px}h1{font-size:30px}.box{padding:14px}.docbar{grid-template-columns:1fr 1fr}.docbar button,.docbar a{width:100%;font-size:13px;padding:11px 8px}}
@media print{.docbar,.signaturePad,.noPrint{display:none!important}body{padding:34px;max-width:none}.printedSig img{max-width:420px;border-bottom:1px solid #111}}
</style></head><body>
<div class="docbar"><button onclick="doPrint()">Drukuj</button><button class="green" onclick="doPdf()">Zapisz / PDF</button><button class="orange" onclick="shareDoc()">Udostępnij</button><button class="secondary" onclick="goBack()">Powrót</button></div>
<h1>${o.typ||'Operacja'}</h1><div class="muted">Agromarbanka · Dokument magazynowy</div>
<div class="box"><table class="meta"><tr><td>Data</td><td>${o.data_operacji||''} ${o.godzina_operacji||''}</td></tr><tr><td>Kontrahent</td><td>${o.kontrahent||''}</td></tr><tr><td>Magazyn</td><td>${o.magazyn||''}</td></tr><tr><td>Użytkownik</td><td>${o.uzytkownik||''}</td></tr><tr><td>Podpis odbiorcy</td><td>${o.podpis||''}</td></tr><tr><td>Liczba pozycji</td><td>${pozycje.length}</td></tr><tr><td>Suma ilości</td><td>${total}</td></tr></table></div>
<div class="box"><h2>Pozycje dokumentu</h2><table><thead><tr><th>Lp.</th><th>Opakowanie</th><th>Ilość</th></tr></thead><tbody>${pozycjeRows}</tbody></table></div>
${(o.historia_edycji&&o.historia_edycji.length)?`<div class="box"><h2>Historia edycji</h2><table><thead><tr><th>Kiedy</th><th>Kto</th><th>Co zmieniono</th></tr></thead><tbody>${o.historia_edycji.map(h=>`<tr><td>${h.zmieniono_o||''}</td><td>${h.zmienione_przez||''}</td><td>${h.opis_zmiany||''}</td></tr>`).join('')}</tbody></table></div>`:''}
<p>Podpis:</p><div class="sign"></div>
<div class="signaturePad noPrint"><b>Podpis palcem na telefonie:</b><canvas id="sig"></canvas><div class="sigActions"><button onclick="clearSig()">Wyczyść podpis</button><button onclick="saveSig()">Dodaj podpis do wydruku</button></div></div><div class="printedSig" id="printedSig"></div>
<script>
const docText=${JSON.stringify(docText)};
function doPrint(){ window.print(); }
function doPdf(){ alert('W następnym oknie wybierz: Zapisz jako PDF albo Drukuj do PDF.'); setTimeout(function(){window.print()},200); }
function goBack(){try{ if(window.opener && !window.opener.closed){ window.close(); return; } }catch(e){} try{ history.back(); }catch(e){} setTimeout(function(){ location.href='/'; },250);}
function shareDoc(){const text=docText;if(navigator.share){ navigator.share({title:'Dokument Agromarbanka',text}).catch(function(){}); return; } const msg=encodeURIComponent(text); const choice=confirm('OK = WhatsApp, Anuluj = e-mail'); if(choice){ location.href='https://wa.me/?text='+msg; } else{ location.href='mailto:?subject=Dokument Agromarbanka&body='+msg; }}
const canvas=document.getElementById('sig'); const ctx=canvas.getContext('2d'); let drawing=false;
function resize(){ const r=canvas.getBoundingClientRect(); canvas.width=Math.max(300,Math.floor(r.width*2)); canvas.height=360; ctx.lineWidth=4; ctx.lineCap='round'; ctx.strokeStyle='#111';}
resize(); window.addEventListener('resize',resize);
function pos(e){ const r=canvas.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:(t.clientX-r.left)*(canvas.width/r.width),y:(t.clientY-r.top)*(canvas.height/r.height)};}
function start(e){drawing=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); e.preventDefault();}
function move(e){if(!drawing)return; const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); e.preventDefault();}
function end(){drawing=false;}
canvas.addEventListener('mousedown',start); canvas.addEventListener('mousemove',move); window.addEventListener('mouseup',end);
canvas.addEventListener('touchstart',start,{passive:false}); canvas.addEventListener('touchmove',move,{passive:false}); canvas.addEventListener('touchend',end);
function clearSig(){ctx.clearRect(0,0,canvas.width,canvas.height); document.getElementById('printedSig').innerHTML='';}
function saveSig(){const img=canvas.toDataURL('image/png'); document.getElementById('printedSig').innerHTML='<p>Podpis elektroniczny:</p><img src="'+img+'">'; alert('Podpis dodany do dokumentu. Teraz możesz drukować lub zapisać jako PDF.');}
</script></body></html>`}
function makeDocFromRows(o,rows=[]){
 const groupKey=o.dokument_id;
 const group=groupKey?rows.filter(x=>x.dokument_id===groupKey):[o];
 return {...o,pozycje:group.map(x=>({id:x.id,opakowanie:x.opakowanie,ilosc:x.ilosc})),ilosc:group.reduce((a,x)=>a+(Number(x.ilosc)||0),0)}
}
async function getHistoriaDokumentu(doc){
 const key=doc.dokument_id||String(doc.id);
 try{
  const r=await supabase.from('historia_edycji_operacji').select('*').eq('dokument_id',key).order('zmieniono_o',{ascending:false});
  if(!r.error) return r.data||[];
 }catch(e){}
 return [];
}
async function openDoc(o,print=false,rows=[]){
 const doc=makeDocFromRows(o,rows);
 doc.historia_edycji=await getHistoriaDokumentu(doc);
 const w=window.open('','_blank','width=800,height=900');
 if(!w) return alert('Przeglądarka zablokowała okno podglądu');
 w.document.write(dokumentHtml(doc)); w.document.close(); if(print){setTimeout(()=>w.print(),500)}
}
function opisZmian(before,after){
 const b=(before.pozycje||[]).map(x=>`${x.opakowanie}: ${x.ilosc}`).join(', ');
 const a=(after.pozycje||[]).map(x=>`${x.opakowanie}: ${x.ilosc}`).join(', ');
 const zm=[];
 if(before.kontrahent!==after.kontrahent) zm.push(`kontrahent: ${before.kontrahent||''} → ${after.kontrahent||''}`);
 if(before.magazyn!==after.magazyn) zm.push(`magazyn: ${before.magazyn||''} → ${after.magazyn||''}`);
 if(before.typ!==after.typ) zm.push(`typ: ${before.typ||''} → ${after.typ||''}`);
 if(before.data_operacji!==after.data_operacji) zm.push(`data: ${before.data_operacji||''} → ${after.data_operacji||''}`);
 if(b!==a) zm.push(`pozycje: ${b} → ${a}`);
 return zm.join('; ')||'Edycja bez widocznych zmian';
}
function OperacjeLista({rows,allRows,me,load,kontrahenci=[],opakowania=[],magazyny=[],notify,selectable=false,selected={},toggleSelect=()=>{}}){
 const [edit,setEdit]=useState(null);
 const del=async(o)=>{
 if(me.rola!=='admin') return alert('Usuwanie operacji jest dostępne tylko dla administratora');
 const powod=prompt('Powód usunięcia operacji/dokumentu:', 'Błąd przy wprowadzaniu');
 if(powod===null || !powod.trim()) return;
 const group=o.dokument_id?(allRows||rows).filter(x=>x.dokument_id===o.dokument_id):[o];
 for(const item of group){
   const archive={operacja_id:item.id,dokument_id:item.dokument_id||null,kontrahent:item.kontrahent,opakowanie:item.opakowanie,magazyn:item.magazyn,typ:item.typ,ilosc:item.ilosc,data_operacji:item.data_operacji,godzina_operacji:item.godzina_operacji||null,powod:powod.trim(),usuniete_przez:me.imie};
   let a=await supabase.from('usuniete_operacje').insert(archive);
   if(a.error && (a.error.message||'').includes('godzina_operacji')){ const {godzina_operacji,...fallback}=archive; a=await supabase.from('usuniete_operacje').insert(fallback); }
   if(a.error && (a.error.message||'').includes('dokument_id')){ const {dokument_id,...fallback2}=archive; a=await supabase.from('usuniete_operacje').insert(fallback2); }
   if(a.error) return alert('Nie zapisano do rejestru usuniętych: '+a.error.message);
 }
 const r=o.dokument_id?await supabase.from('operacje').delete().eq('dokument_id',o.dokument_id):await supabase.from('operacje').delete().eq('id',o.id);
 if(r.error) return alert(r.error.message);
 notify&&notify('Operacja została usunięta');
 await load();
};

 const startEdit=(o)=>{
  const doc=makeDocFromRows(o,allRows||rows);
  setEdit({
   original:doc,
   kontrahent:doc.kontrahent||'',
   magazyn:doc.magazyn||'',
   typ:doc.typ||'Wydanie',
   data_operacji:doc.data_operacji||today(),
   pozycje:(doc.pozycje||[]).map(x=>({uid:Date.now()+Math.random(),id:x.id,opakowanie:x.opakowanie,ilosc:x.ilosc})),usunietePozycje:[],usunietePozycje:[]
  });
 };
 const updPos=(uid,patch)=>setEdit(e=>({...e,pozycje:e.pozycje.map(p=>p.uid===uid?{...p,...patch}:p)}));
 const addPos=()=>setEdit(e=>({...e,pozycje:[...e.pozycje,{uid:Date.now()+Math.random(),opakowanie:'',ilosc:1}]}));
 const delPos=(uid)=>setEdit(e=>{
  if(e.pozycje.length<=1) return e;
  const pos=e.pozycje.find(p=>p.uid===uid);
  const powod=prompt('Podaj powód usunięcia pozycji z dokumentu:', 'Błąd przy wprowadzaniu');
  if(powod===null || !powod.trim()) return e;
  return {...e,pozycje:e.pozycje.filter(p=>p.uid!==uid),usunietePozycje:[...(e.usunietePozycje||[]),{...pos,powod:powod.trim()}]};
});

 const saveEdit=async()=>{
  if(!edit)return;
  const valid=edit.pozycje.filter(p=>p.opakowanie&&Number(p.ilosc)>0);
  if(!edit.kontrahent||!edit.magazyn||valid.length===0)return alert('Uzupełnij kontrahenta, magazyn i pozycje');
  const docId=edit.original.dokument_id||String(edit.original.id);
  const before=edit.original;
  const after={...before,kontrahent:edit.kontrahent,magazyn:edit.magazyn,typ:edit.typ,data_operacji:edit.data_operacji,pozycje:valid.map(p=>({opakowanie:p.opakowanie,ilosc:Number(p.ilosc)}))};
  const opis=opisZmian(before,after);

  if(edit.original.dokument_id){
    const ids=(edit.original.pozycje||[]).map(p=>p.id).filter(Boolean);
    if(ids.length){
      const d=await supabase.from('operacje').delete().in('id',ids);
      if(d.error)return alert(d.error.message);
    }
    const base={dokument_id:edit.original.dokument_id,kontrahent:edit.kontrahent,magazyn:edit.magazyn,typ:edit.typ,data_operacji:edit.data_operacji,godzina_operacji:nowTime(),podpis:before.podpis||'',uzytkownik:me.imie};
    const payload=valid.map(p=>({...base,opakowanie:p.opakowanie,ilosc:Number(p.ilosc)}));
    const ins=await supabase.from('operacje').insert(payload);
    if(ins.error)return alert(ins.error.message);
  }else{
    const first=valid[0];
    const up=await supabase.from('operacje').update({kontrahent:edit.kontrahent,magazyn:edit.magazyn,typ:edit.typ,data_operacji:edit.data_operacji,opakowanie:first.opakowanie,ilosc:Number(first.ilosc),godzina_operacji:nowTime(),uzytkownik:me.imie}).eq('id',edit.original.id);
    if(up.error)return alert(up.error.message);
    if(valid.length>1){
      const newDocId=String(edit.original.id)+'-'+Date.now();
      await supabase.from('operacje').update({dokument_id:newDocId}).eq('id',edit.original.id);
      const payload=valid.slice(1).map(p=>({dokument_id:newDocId,kontrahent:edit.kontrahent,magazyn:edit.magazyn,typ:edit.typ,data_operacji:edit.data_operacji,godzina_operacji:nowTime(),podpis:before.podpis||'',uzytkownik:me.imie,opakowanie:p.opakowanie,ilosc:Number(p.ilosc)}));
      if(payload.length){
        const ins=await supabase.from('operacje').insert(payload);
        if(ins.error)return alert(ins.error.message);
      }
    }
  }
  try{
    for(const dp of (edit.usunietePozycje||[])){
      await supabase.from('usuniete_operacje').insert({
        operacja_id: dp.id || null,
        dokument_id: docId,
        kontrahent: before.kontrahent,
        opakowanie: dp.opakowanie,
        magazyn: before.magazyn,
        typ: before.typ,
        ilosc: Number(dp.ilosc)||0,
        data_operacji: before.data_operacji,
        godzina_operacji: before.godzina_operacji || null,
        powod: 'Usunięto pozycję z dokumentu: ' + (dp.powod || ''),
        usuniete_przez: me.imie
      });
    }
  }catch(e){}
  try{
    await supabase.from('historia_edycji_operacji').insert({dokument_id:docId,zmienione_przez:me.imie,opis_zmiany:opis+((edit.usunietePozycje||[]).length?'; usunięte pozycje: '+(edit.usunietePozycje||[]).map(p=>`${p.opakowanie} ${p.ilosc} szt. — ${p.powod}`).join(', '):''),przed_zmiana:before,po_zmianie:after});
  }catch(e){}
  setEdit(null); notify&&notify('Dokument został edytowany'); await load();
 };

 return <div>{edit&&<div className="editDocBox"><h3>Edytuj dokument</h3><div className="formline"><label>Kontrahent<select value={edit.kontrahent} onChange={e=>setEdit({...edit,kontrahent:e.target.value})}>{kontrahenci.filter(k=>k.aktywny!==false).map(k=><option key={k.id}>{k.nazwa}</option>)}</select></label><label>Typ<select value={edit.typ} onChange={e=>setEdit({...edit,typ:e.target.value})}><option>Wydanie</option><option>Przyjęcie (PZ)</option></select></label><label>Magazyn<select value={edit.magazyn} onChange={e=>setEdit({...edit,magazyn:e.target.value})}>{magazyny.filter(m=>m.aktywny!==false&&!m.ukryty).map(m=><option key={m.id}>{m.nazwa}</option>)}</select></label><label>Data<input type="date" value={edit.data_operacji} onChange={e=>setEdit({...edit,data_operacji:e.target.value})}/></label></div><h4>Pozycje</h4>{edit.pozycje.map((p,i)=><div className="editPosRow" key={p.uid}><b>{i+1}.</b><select value={p.opakowanie} onChange={e=>updPos(p.uid,{opakowanie:e.target.value})}><option value="">Wybierz opakowanie</option>{opakowania.filter(o=>o.aktywne!==false).map(o=><option key={o.id}>{o.nazwa}</option>)}</select><input type="number" min="1" value={p.ilosc} onChange={e=>updPos(p.uid,{ilosc:e.target.value})}/><button className="danger" onClick={()=>delPos(p.uid)} disabled={edit.pozycje.length===1}>Usuń</button></div>)}<button className="secondary" onClick={addPos}>+ Dodaj pozycję</button><div className="row"><button className="big green" onClick={saveEdit}>Zapisz edycję</button><button className="big" onClick={()=>setEdit(null)}>Anuluj</button></div></div>}
 <div className="table"><table><thead><tr>{selectable&&<th>✓</th>}{['data','godz.','typ','kontrahent','opakowanie','ilość','magazyn','akcje'].map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map(o=><tr key={o.id}>{selectable&&<td><input type="checkbox" checked={!!selected[o.id]} onChange={()=>toggleSelect(String(o.id))}/></td>}<td>{o.data_operacji}</td><td>{o.godzina_operacji||''}</td><td>{o.typ}</td><td>{o.kontrahent}</td><td>{o.opakowanie}{o.dokument_id&&<small className="docBadge">dok.</small>}</td><td>{o.ilosc}</td><td>{o.magazyn}</td><td><div className="miniActions"><button onClick={()=>openDoc(o,false,allRows||rows)}>Podgląd</button><button onClick={()=>openDoc(o,true,allRows||rows)}>Drukuj</button><button onClick={()=>startEdit(o)}>Edytuj</button>{me.rola==='admin'&&<button className="danger" onClick={()=>del(o)}>Usuń</button>}</div></td></tr>)}</tbody></table></div></div>}
function Kontrahenci({kontrahenci,load,notify}){
 const [n,setN]=useState(''),[g,setG]=useState(''),[lim,setLim]=useState(0),[sal,setSal]=useState(0),[q,setQ]=useState(''),[importInfo,setImportInfo]=useState(''),[preview,setPreview]=useState([]),[importErrors,setImportErrors]=useState([]);
 const add=async()=>{
 const nazwa=n.trim();
 if(!nazwa)return;
 if(kontrahenci.some(k=>norm(k.nazwa)===norm(nazwa))) return alert('Taki kontrahent już istnieje: '+nazwa);
 const r=await supabase.from('kontrahenci').insert({nazwa,grupa:g,limit_opakowan:Number(lim)||0,saldo_startowe:Number(sal)||0});
 if(r.error) return alert(r.error.message);
 setN(''); setG(''); setLim(0); setSal(0); notify&&notify('Kontrahent został dodany'); load()
};
 const upd=async(id,o)=>{await supabase.from('kontrahenci').update(o).eq('id',id);load()};
 const cleanNumber=(v)=>{const s=String(v??'').replace(',','.').replace(/[^0-9.-]/g,'').trim(); return Number(s)||0};
 const findVal=(row,keys)=>{for(const k of keys){const found=Object.keys(row).find(x=>norm(x).replaceAll('_',' ').replaceAll('-',' ')===norm(k).replaceAll('_',' ').replaceAll('-',' ')); if(found!=null && row[found]!=null) return String(row[found]).trim()} return ''};
 const normalizeRow=(row)=>{
  const nazwa=findVal(row,['Nazwa','nazwa','Kontrahent','Firma','Klient','name','client','Nazwa kontrahenta']);
  return {nazwa,grupa:findVal(row,['Grupa','grupa','Group']),telefon:findVal(row,['Telefon','telefon','Tel','Phone']),miasto:findVal(row,['Miasto','miasto','Miejscowość','miejscowosc','City']),nip:findVal(row,['NIP','nip','Nip','Vat']),limit_opakowan:cleanNumber(findVal(row,['Limit','limit','Limit opakowań','limit_opakowan','Limit opakowan'])),saldo_startowe:cleanNumber(findVal(row,['Saldo startowe','saldo_startowe','Saldo','Start'])),aktywny:true,ukryty:false};
 };
 const parseTextCsv=(text)=>{
  const lines=String(text).replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());
  if(lines.length<2) return [];
  const sep=(lines[0].split(';').length>=lines[0].split(',').length)?';':',';
  const parseLine=(line)=>{const out=[]; let cur='',q=false; for(let i=0;i<line.length;i++){const ch=line[i]; if(ch==='"'){ if(q&&line[i+1]==='"'){cur+='"'; i++;} else q=!q; } else if(ch===sep&&!q){out.push(cur); cur='';} else cur+=ch;} out.push(cur); return out.map(x=>x.trim().replace(/^"|"$/g,''));};
  const headers=parseLine(lines[0]);
  return lines.slice(1).map(line=>{const vals=parseLine(line); const obj={}; headers.forEach((h,i)=>obj[h]=vals[i]??''); return obj;});
 };
 const parseImport=async(file)=>{setImportInfo('Wczytywanie pliku...'); setImportErrors([]); try{
   let rawRows=[];
   if(file.name.toLowerCase().endsWith('.csv')){ rawRows=parseTextCsv(await file.text()); }
   else {const buf=await file.arrayBuffer(); const wb=XLSX.read(buf,{type:'array'}); const ws=wb.Sheets[wb.SheetNames[0]]; rawRows=XLSX.utils.sheet_to_json(ws,{defval:''});}
   const rows=rawRows.map(normalizeRow).filter(x=>x.nazwa);
   setPreview(rows.slice(0,20)); setImportInfo(`Wczytano ${rows.length} kontrahentów. Kliknij „Importuj do Supabase”.`); window.__agroImportRows=rows;
  }catch(e){setImportInfo('Nie udało się wczytać pliku: '+(e.message||e));}
 };
 const insertOrUpdate=async(row,existing)=>{
   const full={nazwa:row.nazwa,grupa:row.grupa||'',telefon:row.telefon||'',miasto:row.miasto||'',nip:row.nip||'',limit_opakowan:Number(row.limit_opakowan)||0,saldo_startowe:Number(row.saldo_startowe)||0,aktywny:true,ukryty:false};
   const basic={nazwa:full.nazwa,grupa:full.grupa,limit_opakowan:full.limit_opakowan,saldo_startowe:full.saldo_startowe,aktywny:true,ukryty:false};
   let res= existing ? await supabase.from('kontrahenci').update(full).eq('id',existing.id) : await supabase.from('kontrahenci').insert(full);
   if(res.error && /telefon|miasto|nip|column|schema/i.test(res.error.message||'')){
     res= existing ? await supabase.from('kontrahenci').update(basic).eq('id',existing.id) : await supabase.from('kontrahenci').insert(basic);
   }
   return res;
 };
 const doImport=async()=>{const rows=window.__agroImportRows||[]; if(!rows.length) return alert('Najpierw wybierz plik Excel lub CSV'); setImportInfo('Import trwa...'); setImportErrors([]); let added=0,updated=0,skipped=0; const errs=[];
  for(const r of rows){try{if(!r.nazwa){skipped++; continue;} const existing=kontrahenci.find(k=>norm(k.nazwa)===norm(r.nazwa)); const res=await insertOrUpdate(r,existing); if(res.error) throw res.error; existing?updated++:added++;}catch(e){console.error(e); skipped++; errs.push(`${r.nazwa||'(bez nazwy)'}: ${e.message||e}`);}}
  setImportErrors(errs.slice(0,20)); setImportInfo(`Import zakończony. Dodano: ${added}, zaktualizowano: ${updated}, pominięto/błędy: ${skipped}. Dane są zapisane w Supabase.`); setPreview([]); window.__agroImportRows=[]; load();
 };
 const visible=kontrahenci.filter(x=>!x.ukryty&&norm(x.nazwa).includes(norm(q))); const hidden=kontrahenci.filter(x=>x.ukryty&&norm(x.nazwa).includes(norm(q)));
 return <section className="card"><h2><Users/> Kontrahenci</h2><div className="formline"><input placeholder="Nazwa" value={n} onChange={e=>setN(e.target.value)}/><input placeholder="Grupa" value={g} onChange={e=>setG(e.target.value)}/><input placeholder="Limit" type="number" value={lim} onChange={e=>setLim(e.target.value)}/><input placeholder="Saldo startowe" type="number" value={sal} onChange={e=>setSal(e.target.value)}/><button onClick={add}>Dodaj</button></div>
  <div className="importBox"><h3>Import kontrahentów z Excel/CSV</h3><p className="muted">Obsługiwane kolumny: Nazwa, Grupa, Telefon, Miasto, NIP, Limit, Saldo startowe. Import obsługuje CSV ze średnikiem lub przecinkiem oraz XLS/XLSX.</p><input type="file" accept=".xlsx,.xls,.csv" onChange={e=>e.target.files?.[0]&&parseImport(e.target.files[0])}/><button onClick={doImport}>Importuj do Supabase</button>{importInfo&&<p className="infoLine">{importInfo}</p>}{importErrors.length>0&&<details className="errorDetails"><summary>Pokaż pierwsze błędy ({importErrors.length})</summary>{importErrors.map((e,i)=><p key={i}>{e}</p>)}</details>}{preview.length>0&&<Table rows={preview} cols={['nazwa','grupa','telefon','miasto','nip','limit_opakowan','saldo_startowe']}/>}</div>
  <div className="importBox"><h3>Eksport kontrahentów</h3><p className="muted">Pobierz listę kontrahentów do CSV. Plik otworzysz w Excelu.</p><div className="row"><button onClick={()=>exportKontrahenciCsv(kontrahenci.filter(x=>x.aktywny!==false&&!x.ukryty),'kontrahenci_aktywni.csv')}>Eksport aktywnych</button><button onClick={()=>exportKontrahenciCsv(kontrahenci,'kontrahenci_wszyscy.csv')}>Eksport wszystkich</button></div></div>
  <input placeholder="Szukaj kontrahenta" value={q} onChange={e=>setQ(e.target.value)}/><List data={visible} render={x=><><b>{x.nazwa}</b><span>{[x.grupa,x.telefon,x.miasto,x.nip].filter(Boolean).join(' · ')}</span><Actions x={x} upd={upd}/></>}/><HiddenSection title="Schowani kontrahenci" count={hidden.length}><List data={hidden} render={x=><><b>{x.nazwa}</b><span>{[x.grupa,x.telefon,x.miasto,x.nip].filter(Boolean).join(' · ')}</span><Actions x={x} upd={upd}/></>}/></HiddenSection></section>}
function Opakowania({opakowania,load}){return <Simple title="Opakowania" icon={<Package/>} table="opakowania" rows={opakowania} name="nazwa" load={load} active="aktywne" hidden="ukryte"/>}
function Magazyny({magazyny,load}){return <Simple title="Magazyny" icon={<Warehouse/>} table="magazyny" rows={magazyny} name="nazwa" load={load} active="aktywny" hidden="ukryty"/>}
function Simple({title,icon,table,rows,name,load,active,hidden}){const [n,setN]=useState(''); const add=async()=>{if(!n)return; await supabase.from(table).insert({[name]:n}); setN('');load()}; const upd=async(id,o)=>{await supabase.from(table).update(o).eq('id',id);load()}; const visible=rows.filter(x=>!x[hidden]); const schowane=rows.filter(x=>x[hidden]); const render=x=><><b>{x[name]}</b><span>{x[active]===false?'Nieaktywny':'Aktywny'} {x[hidden]?'· Ukryty':''}</span><button onClick={()=>upd(x.id,{[active]:!x[active]})}>{x[active]===false?'Aktywuj':'Dezaktywuj'}</button><button onClick={()=>upd(x.id,{[hidden]:!x[hidden]})}>{x[hidden]?'Pokaż':'Ukryj'}</button></>; return <section className="card"><h2>{icon} {title}</h2><div className="formline"><input placeholder="Nowa nazwa" value={n} onChange={e=>setN(e.target.value)}/><button onClick={add}>Dodaj</button></div><List data={visible} render={render}/><HiddenSection title="Schowane" count={schowane.length}><List data={schowane} render={render}/></HiddenSection></section>}
function Uzytkownicy({users,magazyny,load}){const [u,setU]=useState({imie:'',telefon:'',pin:'',rola:'kierowca',magazyn:''}); const add=async()=>{
 if(!u.imie||!u.telefon||!u.pin)return;
 if(users.some(x=>norm(x.telefon)===norm(u.telefon))) return alert('Użytkownik z takim telefonem już istnieje: '+u.telefon);
 const r=await supabase.from('uzytkownicy').insert(u);
 if(r.error) return alert(r.error.message);
 setU({imie:'',telefon:'',pin:'',rola:'kierowca',magazyn:''}); notify&&notify('Użytkownik został dodany'); load()
}; const upd=async(id,o)=>{await supabase.from('uzytkownicy').update(o).eq('id',id);load()}; const visible=users.filter(x=>!x.ukryty); const hidden=users.filter(x=>x.ukryty); const render=x=><><b>{x.imie}</b><span>{x.telefon} · {x.rola} · {x.magazyn||'wszystkie'}</span><button onClick={()=>upd(x.id,{aktywny:!x.aktywny})}>{x.aktywny?'Dezaktywuj':'Aktywuj'}</button><button onClick={()=>upd(x.id,{ukryty:!x.ukryty})}>{x.ukryty?'Pokaż':'Ukryj'}</button></>; return <section className="card"><h2>Użytkownicy</h2><div className="formline"><input placeholder="Imię" value={u.imie} onChange={e=>setU({...u,imie:e.target.value})}/><input placeholder="Telefon" value={u.telefon} onChange={e=>setU({...u,telefon:e.target.value})}/><input placeholder="PIN" value={u.pin} onChange={e=>setU({...u,pin:e.target.value})}/><select value={u.rola} onChange={e=>setU({...u,rola:e.target.value})}><option>admin</option><option>magazynier</option><option>kierowca</option></select><select value={u.magazyn||''} onChange={e=>setU({...u,magazyn:e.target.value})}><option value="">Bez przypisania</option>{magazyny.map(m=><option key={m.id}>{m.nazwa}</option>)}</select><button onClick={add}>Dodaj</button></div><List data={visible} render={render}/><HiddenSection title="Schowani użytkownicy" count={hidden.length}><List data={hidden} render={render}/></HiddenSection></section>}
function HiddenSection({title,count,children}){return <details className="hiddenBox"><summary>{title} ({count})</summary>{count?children:<p className="muted">Brak schowanych pozycji.</p>}</details>}
function Actions({x,upd}){return <><button onClick={()=>upd(x.id,{aktywny:!x.aktywny})}>{x.aktywny===false?'Aktywuj':'Dezaktywuj'}</button><button onClick={()=>upd(x.id,{ukryty:!x.ukryty})}>{x.ukryty?'Pokaż':'Ukryj'}</button></>}
function Raporty({operacje,kontrahenci,opakowania}){
 const [od,setOd]=useState(''),[doo,setDoo]=useState(today()),[kon,setKon]=useState(''),[opak,setOpak]=useState(''),[show,setShow]=useState(false),[szukajKon,setSzukajKon]=useState('');
 const filteredKontrahenci=useMemo(()=>{
  const q=norm(szukajKon);
  const sorted=[...kontrahenci].sort((a,b)=>(a.nazwa||'').localeCompare(b.nazwa||'','pl'));
  if(!q) return sorted.slice(0,80);
  return sorted.filter(k=>norm(k.nazwa).startsWith(q)||norm(k.nazwa).includes(q)).slice(0,80);
 },[kontrahenci,szukajKon]);
 const chooseKon=(name)=>{setKon(name);setSzukajKon(name);};
 const rows=operacje.filter(o=>(!od||o.data_operacji>=od)&&(!doo||o.data_operacji<=doo)&&(!kon||o.kontrahent===kon)&&(!opak||o.opakowanie===opak));
 const sum=rows.reduce((a,o)=>{const k=o.opakowanie||'Bez nazwy'; const qty=Number(o.ilosc)||0; if(!a[k]) a[k]={opakowanie:k,wydanie:0,zwrot:0,saldo:0}; if(((o.typ||'').includes('Zwrot')||(o.typ||'').includes('Przyjęcie'))){a[k].zwrot+=qty; a[k].saldo-=qty;} else {a[k].wydanie+=qty; a[k].saldo+=qty;} return a},{});
 const summaryRows=Object.values(sum);
 const total={wydanie:summaryRows.reduce((a,r)=>a+r.wydanie,0),zwrot:summaryRows.reduce((a,r)=>a+r.zwrot,0),saldo:summaryRows.reduce((a,r)=>a+r.saldo,0)};
 const reportTitle=`Raport opakowań${kon?' — '+kon:' — wszyscy kontrahenci'}`;
 const exportX=()=>{const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet([{raport:reportTitle,od,do:doo,kontrahent:kon||'Wszyscy',opakowanie:opak||'Wszystkie',wydania:total.wydanie,zwroty:total.zwrot,saldo:total.saldo}]),'Opis'); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(summaryRows),'Podsumowanie'); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Historia'); XLSX.writeFile(wb,'raport_agromarbanka.xlsx')};
 const printReport=()=>window.print();
 return <section className="card reportCard"><h2><FileDown/> Raporty</h2><div className="formline noPrint"><label>Od<input type="date" value={od} onChange={e=>setOd(e.target.value)}/></label><label>Do<input type="date" value={doo} onChange={e=>setDoo(e.target.value)}/></label><label>Kontrahent
    <input className="reportSearchInput" placeholder="Wpisz pierwsze litery kontrahenta..." value={szukajKon} onChange={e=>{setSzukajKon(e.target.value);setKon('')}}/>
    {szukajKon && filteredKontrahenci.length>0 && <div className="reportSuggestions">{filteredKontrahenci.slice(0,10).map(k=><button type="button" key={k.id} onClick={()=>chooseKon(k.nazwa)}>{k.nazwa}</button>)}</div>}
    {szukajKon && filteredKontrahenci.length===0 && <small className="muted">Brak wyników</small>}
    <select value={kon} onChange={e=>chooseKon(e.target.value)}><option value="">Wszyscy kontrahenci</option>{filteredKontrahenci.map(k=><option key={k.id}>{k.nazwa}</option>)}</select>
    <button type="button" className="secondary smallBtn" onClick={()=>{setKon('');setSzukajKon('')}}>Wyczyść</button>
    <small className="muted">Pokazano {filteredKontrahenci.length} z {kontrahenci.length}</small>
   </label><label>Rodzaj skrzynki<select value={opak} onChange={e=>setOpak(e.target.value)}><option value="">Wszystkie opakowania</option>{opakowania.map(o=><option key={o.id}>{o.nazwa}</option>)}</select></label><button className="primary" onClick={()=>setShow(true)}>Pokaż raport</button></div>
  {show&&<div className="reportPreview" id="reportPreview"><div className="reportActions noPrint"><button onClick={printReport}><Printer size={14}/> Drukuj</button><button onClick={exportX}><FileDown size={14}/> Pobierz Excel</button></div><div className="reportHeader"><h1>{reportTitle}</h1><p><b>Zakres dat:</b> {od||'od początku'} – {doo||'do dziś'}</p><p><b>Kontrahent:</b> {kon||'Wszyscy'} · <b>Rodzaj skrzynki:</b> {opak||'Wszystkie'}</p></div><div className="summaryBoxes"><div><b>Wydano</b><span>{total.wydanie}</span></div><div><b>Zwrócono</b><span>{total.zwrot}</span></div><div><b>Saldo</b><span>{total.saldo}</span></div><div><b>Liczba operacji</b><span>{rows.length}</span></div></div><h3>Podsumowanie według rodzaju skrzynki</h3><Table rows={summaryRows} cols={['opakowanie','wydanie','zwrot','saldo']}/><h3>Historia operacji</h3><Table rows={rows} cols={['data_operacji','godzina_operacji','typ','kontrahent','opakowanie','ilosc','magazyn','uzytkownik']}/></div>}
 </section>}

function Historia({operacje,me,load,kontrahenci,opakowania,magazyny,notify}){
 const [q,setQ]=useState(''),[od,setOd]=useState(''),[doo,setDoo]=useState(today()),[sel,setSel]=useState({});
 const rows=[...(operacje||[])].filter(o=>(!od||o.data_operacji>=od)&&(!doo||o.data_operacji<=doo)&&(!q||norm(o.kontrahent).includes(norm(q))||norm(o.opakowanie).includes(norm(q))||norm(o.typ).includes(norm(q))||norm(o.magazyn).includes(norm(q)))).sort((a,b)=>String((b.data_operacji||'')+(b.godzina_operacji||'')).localeCompare(String((a.data_operacji||'')+(a.godzina_operacji||''))));
 const selectedIds=Object.keys(sel).filter(k=>sel[k]);
 const toggle=(id)=>setSel(s=>({...s,[id]:!s[id]}));
 const massDelete=async()=>{
  if(me.rola!=='admin') return alert('Masowe usuwanie jest dostępne tylko dla administratora');
  if(!selectedIds.length) return alert('Zaznacz operacje do usunięcia');
  const powod=prompt('Podaj powód masowego usunięcia zaznaczonych operacji:', 'Błąd przy wprowadzaniu');
  if(powod===null||!powod.trim()) return;
  const selectedRows=rows.filter(r=>selectedIds.includes(String(r.id)));
  for(const item of selectedRows){
    const archive={operacja_id:item.id,dokument_id:item.dokument_id||null,kontrahent:item.kontrahent,opakowanie:item.opakowanie,magazyn:item.magazyn,typ:item.typ,ilosc:item.ilosc,data_operacji:item.data_operacji,godzina_operacji:item.godzina_operacji||null,powod:powod.trim(),usuniete_przez:me.imie};
    let a=await supabase.from('usuniete_operacje').insert(archive);
    if(a.error && (a.error.message||'').includes('dokument_id')){const {dokument_id,...f}=archive; a=await supabase.from('usuniete_operacje').insert(f);}
    if(a.error && (a.error.message||'').includes('godzina_operacji')){const {godzina_operacji,...f2}=archive; a=await supabase.from('usuniete_operacje').insert(f2);}
    if(a.error) return alert('Nie zapisano do rejestru usuniętych: '+a.error.message);
  }
  const d=await supabase.from('operacje').delete().in('id',selectedRows.map(x=>x.id));
  if(d.error) return alert(d.error.message);
  notify&&notify('Usunięto zaznaczone operacje');
  setSel({}); await load();
 };
 return <section className="card"><h2><FileDown/> Historia operacji</h2>
  <div className="formline noPrint"><label>Szukaj<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Kontrahent, opakowanie, typ, magazyn"/></label><label>Od<input type="date" value={od} onChange={e=>setOd(e.target.value)}/></label><label>Do<input type="date" value={doo} onChange={e=>setDoo(e.target.value)}/></label>{me.rola==='admin'&&<button className="danger" onClick={massDelete}>Usuń zaznaczone ({selectedIds.length})</button>}</div>
  <p className="muted">Pokazano {rows.length} operacji. Edycja jest dostępna dla admina, magazyniera i kierowcy. Usuwanie tylko dla admina.</p>
  <OperacjeLista rows={rows} allRows={operacje} me={me} load={load} kontrahenci={kontrahenci} opakowania={opakowania} magazyny={magazyny} notify={notify} selectable={me.rola==='admin'} selected={sel} toggleSelect={toggle}/>
 </section>
}

function Usuniete({usuniete}){
 const rows=[...(usuniete||[])].sort((a,b)=>(b.id||0)-(a.id||0));
 return <section className="card"><h2><Trash2/> Usunięte operacje i pozycje</h2>
  <p className="muted">Tutaj widać usunięte całe operacje oraz pozycje usunięte podczas edycji dokumentu.</p>
  <div className="table deletedTable"><table><thead><tr><th>data</th><th>godz.</th><th>typ</th><th>kontrahent</th><th>opakowanie</th><th>ilość</th><th>magazyn</th><th>powód</th><th>usunął</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.data_operacji||''}</td><td>{r.godzina_operacji||''}</td><td>{r.typ||''}</td><td>{r.kontrahent||''}</td><td>{r.opakowanie||''}{r.dokument_id&&<small className="docBadge">dok.</small>}</td><td>{r.ilosc||''}</td><td>{r.magazyn||''}</td><td>{r.powod||''}</td><td>{r.usuniete_przez||''}</td></tr>)}</tbody></table></div>
 </section>
}


function Table({rows,cols}){return <div className="table"><table><thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{cols.map(c=><td key={c}>{r[c]}</td>)}</tr>)}</tbody></table></div>}
function List({data,render}){return <div>{data.map(x=><div className="item" key={x.id}>{render(x)}</div>)}</div>}

createRoot(document.getElementById('root')).render(<App/>);
