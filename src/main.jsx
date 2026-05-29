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
 const [ready,setReady]=useState(false),[err,setErr]=useState(''),[me,setMe]=useState(null),[tab,setTab]=useState('operacje');
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
 if(!ready) return <Shell><div className="login"><h2>Ładowanie systemu...</h2></div></Shell>;
 if(err) return <SetupSupabase/>;
 if(!me) return <Login users={users} setMe={setMe}/>;
 const ctx={me,load,kontrahenci,opakowania,magazyny,users,operacje,usuniete,setTab};
 return <Shell>
   <header className="top"><div><b>Agromarbanka</b><span>Online Supabase</span><span className="userBadge">Zalogowano: {me.imie} · {me.rola}</span></div><button onClick={logout}><LogOut size={16}/> Wyloguj</button></header>
   <nav>{['operacje','kontrahenci','opakowania','magazyny','raporty','uzytkownicy','usuniete'].filter(x=>me.rola==='admin'||!['uzytkownicy','usuniete'].includes(x)).map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{label(x)}</button>)}</nav>
   {tab==='operacje'&&<Operacje {...ctx}/>} {tab==='kontrahenci'&&<Kontrahenci {...ctx}/>} {tab==='opakowania'&&<Opakowania {...ctx}/>} {tab==='magazyny'&&<Magazyny {...ctx}/>} {tab==='raporty'&&<Raporty {...ctx}/>} {tab==='uzytkownicy'&&<Uzytkownicy {...ctx}/>} {tab==='usuniete'&&<Usuniete {...ctx}/>} 
 </Shell>
}

function SetupSupabase(){
 const [u,setU]=useState(localStorage.getItem('VITE_SUPABASE_URL')||DEFAULT_SUPABASE_URL);
 const [k,setK]=useState(localStorage.getItem('VITE_SUPABASE_ANON_KEY')||'');
 const save=()=>{ if(!u||!k) return alert('Wklej URL i klucz Supabase'); localStorage.setItem('VITE_SUPABASE_URL',u.trim()); localStorage.setItem('VITE_SUPABASE_ANON_KEY',k.trim()); location.reload(); };
 return <Shell><div className="login"><h2>Konfiguracja Supabase</h2><p className="info">Nie trzeba już ustawiać zmiennych w Vercel. Wklej klucz raz tutaj.</p><label>Supabase URL</label><input value={u} onChange={e=>setU(e.target.value)}/><label>Anon / publishable key</label><textarea rows="4" value={k} onChange={e=>setK(e.target.value)} placeholder="eyJ... albo sb_publishable_..."/><button className="primary" onClick={save}>Zapisz i uruchom</button><small>Ten klucz jest publiczny dla aplikacji. Nie wklejaj service_role ani secret key.</small></div></Shell>
}

function Shell({children}){return <main><section className="hero"><div><h1>Agromarbanka</h1><p>Nowoczesna obsługa opakowań zwrotnych, magazynu głównego i zapasowego.</p></div></section>{children}</main>}
function label(x){return {operacje:'Operacja',kontrahenci:'Kontrahenci',opakowania:'Opakowania',magazyny:'Magazyny',raporty:'Raporty',uzytkownicy:'Użytkownicy',usuniete:'Usunięte'}[x]}
function Login({users,setMe}){const [tel,setTel]=useState(''),[pin,setPin]=useState(''),[msg,setMsg]=useState(''); const login=()=>{const u=users.find(x=>x.telefon===tel.trim()&&x.pin===pin.trim()&&x.aktywny!==false); if(u){localStorage.setItem('agro_logged_user_id',String(u.id)); setMe(u);} else setMsg('Nieprawidłowy telefon lub PIN')}; return <Shell><div className="login"><h2>Panel logowania</h2><input placeholder="Telefon" value={tel} onChange={e=>setTel(e.target.value)}/><input placeholder="PIN" value={pin} onChange={e=>setPin(e.target.value)} type="password"/><button className="primary" onClick={login}>Zaloguj</button><small>Po zalogowaniu aplikacja zapamięta użytkownika do czasu kliknięcia „Wyloguj”.</small>{msg&&<p className="error">{msg}</p>}</div></Shell>}
function SearchSelect({label,items,value,setValue,field='nazwa',resetKey=0}){
 const [q,setQ]=useState(value||'');
 useEffect(()=>{ if(value && value!==q) setQ(value); },[value]);
 useEffect(()=>{ if(!value) setQ(''); },[resetKey,value]);
 const list=items.filter(x=>!x.ukryty && norm(x[field]).includes(norm(q))).slice(0,12);
 const choose=(name)=>{ setValue(name); setQ(name); };
 return <div className="group searchbox"><label>{label}</label>
  <input placeholder={'Wpisz pierwsze litery '+label.toLowerCase()} value={q} onChange={e=>{setQ(e.target.value); if(value) setValue('');}} />
  {q && list.length>0 && value!==q && <div className="suggestions">{list.map(x=><button type="button" key={x.id} onClick={()=>choose(x[field])}>{x[field]}</button>)}</div>}
  <select value={value} onChange={e=>choose(e.target.value)}><option value="">Wybierz z listy...</option>{list.map(x=><option key={x.id} value={x[field]}>{x[field]}</option>)}</select>
 </div>
}
function Operacje(p){const mags=p.me.rola==='kierowca'&&p.me.magazyn?p.magazyny.filter(m=>m.nazwa===p.me.magazyn):p.magazyny; const [kon,setKon]=useState(''),[opa,setOpa]=useState(''),[mag,setMag]=useState(mags[0]?.nazwa||''),[ilosc,setIlosc]=useState(1),[data,setData]=useState(today()),[podpis,setPodpis]=useState(''),[resetSearch,setResetSearch]=useState(0); useEffect(()=>{if(!mag&&mags[0])setMag(mags[0].nazwa)},[mags]);
 const save=async(typ)=>{if(!kon||!opa||!mag||!ilosc)return alert('Uzupełnij kontrahenta, opakowanie, magazyn i ilość'); const payload={kontrahent:kon,opakowanie:opa,magazyn:mag,typ,ilosc:Number(ilosc),data_operacji:data,godzina_operacji:nowTime(),podpis,uzytkownik:p.me.imie}; let r=await supabase.from('operacje').insert(payload); if(r.error && (r.error.message||'').includes('godzina_operacji')){ const {godzina_operacji,...fallback}=payload; r=await supabase.from('operacje').insert(fallback); }
  if(r.error) return alert(r.error.message); setKon(''); setOpa(''); setIlosc(1); setData(today()); setPodpis(''); setResetSearch(x=>x+1); p.load();};
 return <div className="grid"><section className="card"><h2><Package/> Operacja</h2><SearchSelect label="Kontrahent" items={p.kontrahenci.filter(x=>x.aktywny!==false)} value={kon} setValue={setKon} resetKey={resetSearch}/><SearchSelect label="Opakowanie" items={p.opakowania.filter(x=>x.aktywne!==false)} value={opa} setValue={setOpa} resetKey={resetSearch}/><div className="group"><label>Magazyn</label><select value={mag} onChange={e=>setMag(e.target.value)}>{mags.filter(x=>x.aktywny!==false&&!x.ukryty).map(m=><option key={m.id}>{m.nazwa}</option>)}</select></div><div className="row"><div><label>Ilość</label><input type="number" value={ilosc} onChange={e=>setIlosc(e.target.value)}/></div><div><label>Data operacji</label><input type="date" value={data} onChange={e=>setData(e.target.value)}/></div></div><label>Podpis odbiorcy</label><input value={podpis} onChange={e=>setPodpis(e.target.value)} placeholder="Imię i nazwisko"/><div className="row"><button className="big blue" onClick={()=>save('Wydanie')}>Wydanie</button><button className="big green" onClick={()=>save('Zwrot (PZ)')}>Zwrot (PZ)</button></div></section><section className="card"><h2>Ostatnie operacje</h2><OperacjeLista rows={p.operacje.slice(-10).reverse()} me={p.me} load={p.load}/></section></div>}
function dokumentHtml(o){
 const docText=`${o.typ||'Operacja'} - ${o.kontrahent||''}, ${o.opakowanie||''}, ilość: ${o.ilosc||''}, magazyn: ${o.magazyn||''}, data: ${o.data_operacji||''} ${o.godzina_operacji||''}`;
 return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dokument ${o.typ||''}</title><style>
*{box-sizing:border-box}
body{font-family:Arial;padding:18px;color:#111;margin:0;max-width:760px;margin-left:auto;margin-right:auto;background:#fff}
.docbar{position:sticky;top:0;background:#fff;padding:10px 0 14px;margin-bottom:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px;z-index:10;border-bottom:1px solid #eee}
.docbar button,.docbar a{border:0;border-radius:12px;padding:12px 10px;font-size:14px;font-weight:700;background:#17304a;color:#fff;text-decoration:none;text-align:center}
.docbar .secondary{background:#eef2f5;color:#17304a}
.docbar .green{background:#2f7d32;color:#fff}
.docbar .orange{background:#f57c00;color:#fff}
h1{margin:12px 0 4px;font-size:34px}.box{border:1px solid #ddd;border-radius:14px;padding:18px;margin:18px 0}table{width:100%;border-collapse:collapse;table-layout:fixed}td{padding:9px;border-bottom:1px solid #eee;vertical-align:top;word-break:break-word}td:first-child{width:42%;font-weight:700}.sign{height:80px;border-bottom:1px solid #111;margin-top:40px;width:100%;max-width:420px}.muted{color:#667;font-size:18px}
.signaturePad{border:1px solid #ddd;border-radius:14px;padding:12px;margin-top:18px}.signaturePad canvas{width:100%;height:180px;border:1px solid #ccc;border-radius:10px;touch-action:none;background:#fff}.sigActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.sigActions button{border:0;border-radius:12px;padding:12px;background:#eef2f5;color:#17304a;font-weight:700}
@media(max-width:600px){body{padding:14px}h1{font-size:30px}.box{padding:14px}.docbar{grid-template-columns:1fr 1fr}.docbar button,.docbar a{width:100%;font-size:13px;padding:11px 8px}}
@media print{.docbar,.signaturePad,.noPrint{display:none!important}body{padding:34px;max-width:none}.printedSig img{max-width:420px;border-bottom:1px solid #111}}
</style></head><body>
<div class="docbar">
<button onclick="doPrint()">Drukuj</button>
<button class="green" onclick="doPdf()">Zapisz / PDF</button>
<button class="orange" onclick="shareDoc()">Udostępnij</button>
<button class="secondary" onclick="goBack()">Powrót</button>
</div>
<h1>${o.typ||'Operacja'}</h1><div class="muted">Agromarbanka · Dokument magazynowy</div><div class="box"><table><tr><td>Data</td><td>${o.data_operacji||''} ${o.godzina_operacji||''}</td></tr><tr><td>Kontrahent</td><td>${o.kontrahent||''}</td></tr><tr><td>Opakowanie</td><td>${o.opakowanie||''}</td></tr><tr><td>Ilość</td><td>${o.ilosc||''}</td></tr><tr><td>Magazyn</td><td>${o.magazyn||''}</td></tr><tr><td>Użytkownik</td><td>${o.uzytkownik||''}</td></tr><tr><td>Podpis odbiorcy</td><td>${o.podpis||''}</td></tr></table></div>
<p>Podpis:</p><div class="sign"></div>
<div class="signaturePad noPrint">
<b>Podpis palcem na telefonie:</b>
<canvas id="sig"></canvas>
<div class="sigActions"><button onclick="clearSig()">Wyczyść podpis</button><button onclick="saveSig()">Dodaj podpis do wydruku</button></div>
</div>
<div class="printedSig" id="printedSig"></div>
<script>
const docText=${JSON.stringify(docText)};
function doPrint(){ window.print(); }
function doPdf(){ alert('W następnym oknie wybierz: Zapisz jako PDF albo Drukuj do PDF.'); setTimeout(function(){window.print()},200); }
function goBack(){
  try{ if(window.opener && !window.opener.closed){ window.close(); return; } }catch(e){}
  try{ history.back(); }catch(e){}
  setTimeout(function(){ location.href='/'; },250);
}
function shareDoc(){
  const text=docText;
  if(navigator.share){ navigator.share({title:'Dokument Agromarbanka',text}).catch(function(){}); return; }
  const msg=encodeURIComponent(text);
  const choice=confirm('OK = WhatsApp, Anuluj = e-mail');
  if(choice){ location.href='https://wa.me/?text='+msg; }
  else{ location.href='mailto:?subject=Dokument Agromarbanka&body='+msg; }
}
const canvas=document.getElementById('sig'); const ctx=canvas.getContext('2d'); let drawing=false;
function resize(){ const r=canvas.getBoundingClientRect(); canvas.width=Math.max(300,Math.floor(r.width*2)); canvas.height=360; ctx.lineWidth=4; ctx.lineCap='round'; ctx.strokeStyle='#111'; }
resize(); window.addEventListener('resize',resize);
function pos(e){ const r=canvas.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:(t.clientX-r.left)*(canvas.width/r.width),y:(t.clientY-r.top)*(canvas.height/r.height)}; }
function start(e){drawing=true; const p=pos(e); ctx.beginPath(); ctx.moveTo(p.x,p.y); e.preventDefault();}
function move(e){if(!drawing)return; const p=pos(e); ctx.lineTo(p.x,p.y); ctx.stroke(); e.preventDefault();}
function end(){drawing=false;}
canvas.addEventListener('mousedown',start); canvas.addEventListener('mousemove',move); window.addEventListener('mouseup',end);
canvas.addEventListener('touchstart',start,{passive:false}); canvas.addEventListener('touchmove',move,{passive:false}); canvas.addEventListener('touchend',end);
function clearSig(){ctx.clearRect(0,0,canvas.width,canvas.height); document.getElementById('printedSig').innerHTML='';}
function saveSig(){const img=canvas.toDataURL('image/png'); document.getElementById('printedSig').innerHTML='<p>Podpis elektroniczny:</p><img src="'+img+'">'; alert('Podpis dodany do dokumentu. Teraz możesz drukować lub zapisać jako PDF.');}
</script>
</body></html>`}
function openDoc(o,print=false){const w=window.open('','_blank','width=800,height=900'); if(!w) return alert('Przeglądarka zablokowała okno podglądu'); w.document.write(dokumentHtml(o)); w.document.close(); if(print){setTimeout(()=>w.print(),500)}}
function OperacjeLista({rows,me,load}){const del=async(o)=>{if(me.rola!=='admin') return alert('Usuwanie operacji jest dostępne tylko dla administratora'); const powod=prompt('Powód usunięcia operacji:', 'Błąd przy wprowadzaniu'); if(powod===null) return;
 const archive={operacja_id:o.id,kontrahent:o.kontrahent,opakowanie:o.opakowanie,magazyn:o.magazyn,typ:o.typ,ilosc:o.ilosc,data_operacji:o.data_operacji,godzina_operacji:o.godzina_operacji||null,powod,usuniete_przez:me.imie};
 let a=await supabase.from('usuniete_operacje').insert(archive);
 if(a.error && (a.error.message||'').includes('godzina_operacji')){ const {godzina_operacji,...fallback}=archive; a=await supabase.from('usuniete_operacje').insert(fallback); }
 if(a.error) return alert('Nie zapisano do rejestru usuniętych: '+a.error.message);
 const r=await supabase.from('operacje').delete().eq('id',o.id); if(r.error) return alert(r.error.message); await load();};
 return <div className="table"><table><thead><tr>{['data','godz.','typ','kontrahent','opakowanie','ilość','magazyn','akcje'].map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map(o=><tr key={o.id}><td>{o.data_operacji}</td><td>{o.godzina_operacji||''}</td><td>{o.typ}</td><td>{o.kontrahent}</td><td>{o.opakowanie}</td><td>{o.ilosc}</td><td>{o.magazyn}</td><td><div className="miniActions"><button onClick={()=>openDoc(o,false)}>Podgląd</button><button onClick={()=>openDoc(o,true)}>Drukuj</button>{me.rola==='admin'&&<button className="danger" onClick={()=>del(o)}>Usuń</button>}</div></td></tr>)}</tbody></table></div>}

function exportKontrahenciCsv(rows, filename='kontrahenci.csv'){
 const cols=['id','nazwa','grupa','telefon','miasto','nip','limit_opakowan','saldo_startowe','aktywny','ukryty','created_at'];
 const esc=(v)=>'"'+String(v??'').replaceAll('"','""')+'"';
 const csv=[cols.join(';'),...rows.map(r=>cols.map(c=>esc(r[c])).join(';'))].join('\n');
 const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
 const a=document.createElement('a');
 a.href=URL.createObjectURL(blob);
 a.download=filename;
 document.body.appendChild(a);
 a.click();
 a.remove();
 setTimeout(()=>URL.revokeObjectURL(a.href),500);
}

function Kontrahenci({kontrahenci,load}){const [n,setN]=useState(''),[g,setG]=useState(''),[lim,setLim]=useState(0),[sal,setSal]=useState(0),[q,setQ]=useState(''),[importInfo,setImportInfo]=useState(''),[preview,setPreview]=useState([]);
 const add=async()=>{if(!n)return; const r=await supabase.from('kontrahenci').insert({nazwa:n,grupa:g,limit_opakowan:Number(lim)||0,saldo_startowe:Number(sal)||0}); if(r.error) alert(r.error.message); setN('');load()};
 const upd=async(id,o)=>{await supabase.from('kontrahenci').update(o).eq('id',id);load()};
 const normalizeRow=(row)=>{const get=(...keys)=>{for(const k of keys){const found=Object.keys(row).find(x=>norm(x)===norm(k)); if(found && row[found]!=null) return String(row[found]).trim()} return ''}; return {nazwa:get('Nazwa','Kontrahent','Firma','Klient','name'),grupa:get('Grupa','Group'),telefon:get('Telefon','Tel','Phone'),miasto:get('Miasto','Miejscowość','City'),nip:get('NIP','Nip','Vat'),limit_opakowan:Number(get('Limit','Limit opakowań','Limit opakowan')||0)||0,saldo_startowe:Number(get('Saldo startowe','Saldo','Start')||0)||0,aktywny:true,ukryty:false}};
 const parseImport=async(file)=>{setImportInfo('Wczytywanie pliku...'); try{const buf=await file.arrayBuffer(); const wb=XLSX.read(buf,{type:'array'}); const ws=wb.Sheets[wb.SheetNames[0]]; const rows=XLSX.utils.sheet_to_json(ws,{defval:''}).map(normalizeRow).filter(x=>x.nazwa); setPreview(rows.slice(0,20)); setImportInfo(`Wczytano ${rows.length} kontrahentów. Kliknij „Importuj do Supabase”.`); window.__agroImportRows=rows;}catch(e){setImportInfo('Nie udało się wczytać pliku: '+(e.message||e));}};
 const doImport=async()=>{const rows=window.__agroImportRows||[]; if(!rows.length) return alert('Najpierw wybierz plik Excel lub CSV'); setImportInfo('Import trwa...'); let added=0,updated=0,skipped=0; for(const r of rows){try{const existing=kontrahenci.find(k=>norm(k.nazwa)===norm(r.nazwa)); if(existing){const res=await supabase.from('kontrahenci').update(r).eq('id',existing.id); if(res.error) throw res.error; updated++;}else{const res=await supabase.from('kontrahenci').insert(r); if(res.error) throw res.error; added++;}}catch(e){console.error(e); skipped++;}} setImportInfo(`Import zakończony. Dodano: ${added}, zaktualizowano: ${updated}, pominięto/błędy: ${skipped}. Dane są zapisane w Supabase.`); setPreview([]); window.__agroImportRows=[]; load();};
 const visible=kontrahenci.filter(x=>!x.ukryty&&norm(x.nazwa).includes(norm(q))); const hidden=kontrahenci.filter(x=>x.ukryty&&norm(x.nazwa).includes(norm(q)));
 return <section className="card"><h2><Users/> Kontrahenci</h2><div className="formline"><input placeholder="Nazwa" value={n} onChange={e=>setN(e.target.value)}/><input placeholder="Grupa" value={g} onChange={e=>setG(e.target.value)}/><input placeholder="Limit" type="number" value={lim} onChange={e=>setLim(e.target.value)}/><input placeholder="Saldo startowe" type="number" value={sal} onChange={e=>setSal(e.target.value)}/><button onClick={add}>Dodaj</button></div>
  <div className="importBox"><h3>Import kontrahentów z Excel/CSV</h3><p className="muted">Obsługiwane kolumny: Nazwa, Grupa, Telefon, Miasto, NIP, Limit, Saldo startowe. Istniejące nazwy zostaną zaktualizowane.</p><input type="file" accept=".xlsx,.xls,.csv" onChange={e=>e.target.files?.[0]&&parseImport(e.target.files[0])}/><button onClick={doImport}>Importuj do Supabase</button>{importInfo&&<p className="infoLine">{importInfo}</p>}{preview.length>0&&<Table rows={preview} cols={['nazwa','grupa','telefon','miasto','nip','limit_opakowan','saldo_startowe']}/>}</div>
  <div className="importBox"><h3>Eksport kontrahentów</h3><p className="muted">Pobierz listę kontrahentów do CSV. Plik otworzysz w Excelu.</p><div className="row"><button onClick={()=>exportKontrahenciCsv(kontrahenci.filter(x=>x.aktywny!==false&&!x.ukryty),'kontrahenci_aktywni.csv')}>Eksport aktywnych</button><button onClick={()=>exportKontrahenciCsv(kontrahenci,'kontrahenci_wszyscy.csv')}>Eksport wszystkich</button></div></div>
  <input placeholder="Szukaj kontrahenta" value={q} onChange={e=>setQ(e.target.value)}/><List data={visible} render={x=><><b>{x.nazwa}</b><span>{[x.grupa,x.telefon,x.miasto,x.nip].filter(Boolean).join(' · ')}</span><Actions x={x} upd={upd}/></>}/><HiddenSection title="Schowani kontrahenci" count={hidden.length}><List data={hidden} render={x=><><b>{x.nazwa}</b><span>{[x.grupa,x.telefon,x.miasto,x.nip].filter(Boolean).join(' · ')}</span><Actions x={x} upd={upd}/></>}/></HiddenSection></section>}
function Opakowania({opakowania,load}){return <Simple title="Opakowania" icon={<Package/>} table="opakowania" rows={opakowania} name="nazwa" load={load} active="aktywne" hidden="ukryte"/>}
function Magazyny({magazyny,load}){return <Simple title="Magazyny" icon={<Warehouse/>} table="magazyny" rows={magazyny} name="nazwa" load={load} active="aktywny" hidden="ukryty"/>}
function Simple({title,icon,table,rows,name,load,active,hidden}){const [n,setN]=useState(''); const add=async()=>{if(!n)return; await supabase.from(table).insert({[name]:n}); setN('');load()}; const upd=async(id,o)=>{await supabase.from(table).update(o).eq('id',id);load()}; const visible=rows.filter(x=>!x[hidden]); const schowane=rows.filter(x=>x[hidden]); const render=x=><><b>{x[name]}</b><span>{x[active]===false?'Nieaktywny':'Aktywny'} {x[hidden]?'· Ukryty':''}</span><button onClick={()=>upd(x.id,{[active]:!x[active]})}>{x[active]===false?'Aktywuj':'Dezaktywuj'}</button><button onClick={()=>upd(x.id,{[hidden]:!x[hidden]})}>{x[hidden]?'Pokaż':'Ukryj'}</button></>; return <section className="card"><h2>{icon} {title}</h2><div className="formline"><input placeholder="Nowa nazwa" value={n} onChange={e=>setN(e.target.value)}/><button onClick={add}>Dodaj</button></div><List data={visible} render={render}/><HiddenSection title="Schowane" count={schowane.length}><List data={schowane} render={render}/></HiddenSection></section>}
function Uzytkownicy({users,magazyny,load}){const [u,setU]=useState({imie:'',telefon:'',pin:'',rola:'kierowca',magazyn:''}); const add=async()=>{if(!u.imie||!u.telefon||!u.pin)return; const r=await supabase.from('uzytkownicy').insert(u); if(r.error) alert(r.error.message); setU({imie:'',telefon:'',pin:'',rola:'kierowca',magazyn:''}); load()}; const upd=async(id,o)=>{await supabase.from('uzytkownicy').update(o).eq('id',id);load()}; const visible=users.filter(x=>!x.ukryty); const hidden=users.filter(x=>x.ukryty); const render=x=><><b>{x.imie}</b><span>{x.telefon} · {x.rola} · {x.magazyn||'wszystkie'}</span><button onClick={()=>upd(x.id,{aktywny:!x.aktywny})}>{x.aktywny?'Dezaktywuj':'Aktywuj'}</button><button onClick={()=>upd(x.id,{ukryty:!x.ukryty})}>{x.ukryty?'Pokaż':'Ukryj'}</button></>; return <section className="card"><h2>Użytkownicy</h2><div className="formline"><input placeholder="Imię" value={u.imie} onChange={e=>setU({...u,imie:e.target.value})}/><input placeholder="Telefon" value={u.telefon} onChange={e=>setU({...u,telefon:e.target.value})}/><input placeholder="PIN" value={u.pin} onChange={e=>setU({...u,pin:e.target.value})}/><select value={u.rola} onChange={e=>setU({...u,rola:e.target.value})}><option>admin</option><option>magazynier</option><option>kierowca</option></select><select value={u.magazyn||''} onChange={e=>setU({...u,magazyn:e.target.value})}><option value="">Bez przypisania</option>{magazyny.map(m=><option key={m.id}>{m.nazwa}</option>)}</select><button onClick={add}>Dodaj</button></div><List data={visible} render={render}/><HiddenSection title="Schowani użytkownicy" count={hidden.length}><List data={hidden} render={render}/></HiddenSection></section>}
function HiddenSection({title,count,children}){return <details className="hiddenBox"><summary>{title} ({count})</summary>{count?children:<p className="muted">Brak schowanych pozycji.</p>}</details>}
function Actions({x,upd}){return <><button onClick={()=>upd(x.id,{aktywny:!x.aktywny})}>{x.aktywny===false?'Aktywuj':'Dezaktywuj'}</button><button onClick={()=>upd(x.id,{ukryty:!x.ukryty})}>{x.ukryty?'Pokaż':'Ukryj'}</button></>}
function Raporty({operacje,kontrahenci}){const [od,setOd]=useState(''),[doo,setDoo]=useState(today()),[kon,setKon]=useState(''); const rows=operacje.filter(o=>(!od||o.data_operacji>=od)&&(!doo||o.data_operacji<=doo)&&(!kon||o.kontrahent===kon)); const sum=rows.reduce((a,o)=>{const k=o.opakowanie; a[k]=(a[k]||0)+(o.typ.includes('Zwrot')?-Number(o.ilosc):Number(o.ilosc)); return a},{}); const exportX=()=>{const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Operacje'); XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(Object.entries(sum).map(([opakowanie,saldo])=>({opakowanie,saldo}))),'Podsumowanie'); XLSX.writeFile(wb,'raport_agromarbanka.xlsx')}; return <section className="card"><h2><FileDown/> Raporty</h2><div className="formline"><input type="date" value={od} onChange={e=>setOd(e.target.value)}/><input type="date" value={doo} onChange={e=>setDoo(e.target.value)}/><select value={kon} onChange={e=>setKon(e.target.value)}><option value="">Wszyscy kontrahenci</option>{kontrahenci.map(k=><option key={k.id}>{k.nazwa}</option>)}</select><button onClick={exportX}>Pobierz Excel</button><button onClick={()=>window.print()}><Printer size={14}/> Drukuj</button></div><h3>Podsumowanie</h3><Table rows={Object.entries(sum).map(([opakowanie,saldo])=>({opakowanie,saldo}))} cols={['opakowanie','saldo']}/><h3>Historia</h3><Table rows={rows} cols={['data_operacji','godzina_operacji','typ','kontrahent','opakowanie','ilosc','magazyn','uzytkownik']}/></section>}
function Usuniete({usuniete}){return <section className="card"><h2><Trash2/> Rejestr usuniętych operacji</h2><Table rows={usuniete} cols={['usunieto_o','data_operacji','kontrahent','opakowanie','magazyn','typ','ilosc','usuniete_przez','powod']}/></section>}
function Table({rows,cols}){return <div className="table"><table><thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{cols.map(c=><td key={c}>{r[c]}</td>)}</tr>)}</tbody></table></div>}
function List({data,render}){return <div>{data.map(x=><div className="item" key={x.id}>{render(x)}</div>)}</div>}

createRoot(document.getElementById('root')).render(<App/>);
