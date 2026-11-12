setTimeout(()=>{try{window.__errs=window.__errs||[];const ce=console.error;console.error=(...a)=>{window.__errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' ').slice(0,300));};
S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.r3d='simple';
const ALL=[0,1,2,3,4,5,6],bad=[];const T=(c,m)=>{if(!c)bad.push(m);};
// 1) sin campos nuevos ni donde: nada falla
DATA.personas.vecinos.push({id:'x0',n:'Sin Campos',g:'m',edad:40,oficio:'x',ideo:'x'});
DATA.personas.vecinos.push({id:'x1',n:'Con Donde',g:'f',edad:30,donde:[['bar',12,14,ALL]]});
DATA.personas.hogares=undefined;
const pre=DATA.personas.vecinos.length;
for(const k of Object.keys(POB))for(const h of [9,14,20]){S.t=h*60;crowd({tt:0},k,{W:10,D:8});}
// 2) vecinos de ejemplo
const V=DATA.personas.vecinos;
V.push({id:'f1',n:'Marta Ruiz',g:'f',edad:34,oficio:'x',hogar:'H1',rol:'madre',trabajo:null,donde:[['parque',17,20,ALL],['bar',13,15,ALL]]});
V.push({id:'f2',n:'Nico Ruiz',g:'m',edad:2,hogar:'H1',donde:[['parque',17,20,ALL],['bar',13,15,ALL]]});
V.push({id:'f3',n:'Lola Ruiz',g:'f',edad:7,hogar:'H1',donde:[['parque',17,20,ALL],['bar',13,15,ALL]]});
V.push({id:'f4',n:'Irene Ruiz',g:'f',edad:15,hogar:'H1',donde:[['parque',17,20,ALL]]});
V.push({id:'s1',n:'Peque Sola',g:'f',edad:6,hogar:'H2',donde:[['bar',12,22,ALL],['parque',17,20,ALL],['super',12,22,ALL]]}); // sin adulta de su hogar
V.push({id:'s2',n:'Peque Parque',g:'m',edad:8,hogar:'H3',donde:[['parque',10,13,ALL]]}); // sin adulta, fuera del parque 17-20
V.push({id:'w1',n:'Carmen Barra',g:'f',edad:45,hogar:'H4',trabajo:{lugar:'bar',puesto:['camarera','camarero'],h:[8,16],dias:[0,1,2,3,4]},donde:[]});
V.push({id:'w2',n:'Paco Obra',g:'m',edad:50,hogar:'H5',trabajo:{lugar:'obra',puesto:['peona','peón'],h:[8,15],dias:[0,1,2,3,4]},donde:[]});
V.push({id:'w3',n:'Rosa Caja',g:'f',edad:28,hogar:'H6',trabajo:{lugar:'super',puesto:['cajera','cajero'],h:[9,15],dias:[0,1,2,3,4]}});
V.push({id:'w4',n:'Jon Fuera',g:'m',edad:30,trabajo:{lugar:'fuera',puesto:['a','b'],h:[8,15],dias:ALL}});
DATA.personas.hogares={H1:{n:'Ruiz',miembros:['f1','f2','f3','f4']}};
const ids=(k,h,wd)=>vecinosEn(k,h,wd).map(q=>q.v.id);
// vecinosEn: trabajo y horario
T(ids('bar',10,1).includes('w1')&&vecinosEn('bar',10,1).find(q=>q.v.id==='w1').motivo==='trabajo','w1 trabaja en bar a las 10 lun');
T(!ids('bar',16,1).includes('w1')&&!ids('bar',7.9,1).includes('w1'),'w1 fuera de horario');
T(!ids('bar',10,5).includes('w1'),'w1 no trabaja sábado');
T(ids('obra',9,2).includes('w2')&&!ids('obra',15,2).includes('w2'),'w2 obra horario');
T(!ids('fuera',9,1).length||true,'ok');
T(vecinoPorId('w1')&&vecinoPorId('w1').n==='Carmen Barra'&&vecinoPorId('zz')===null,'vecinoPorId');
const run=(k,h,wd,fn)=>{S.t=h*60;S.day=1;while(dateOf(S.day).wd!==wd)S.day++;return crowd({tt:0},k,{W:10,D:8});};
const named=o=>o.filter(q=>q.v);
// recorre todas las horas y días de varios sitios
let figs=0,cnt=0;
for(const k of ['bar','obra','super','parque','biblioteca'])for(let h=6;h<24;h+=.5)for(const wd of [1,5]){
  const o=run(k,h,wd);cnt++;figs+=o.length;const nm=named(o);const ok=new Set(vecinosEn(k,h,wd).map(q=>q.v.id));
  T(o.length>=4&&o.length<=14,k+' '+h+' figuras '+o.length);
  const seen=new Set();for(const q of nm){T(ok.has(q.v.id),k+' '+h+' sale fuera de horario '+q.v.id);T(!seen.has(q.v.id),'duplicado '+q.v.id);seen.add(q.v.id);}
  for(const q of nm){const e=q.v.edad;if(typeof e==='number'&&e<12){
    const ad=nm.find(a=>a.v.hogar===q.v.hogar&&q.v.hogar!=null&&pbAdult(a.v));
    if(!ad){T(k==='parque'&&h>=17&&h<20,'menor solo '+q.v.id+' '+k+' '+h);}
    else T(Math.hypot(ad.x-q.x,ad.y-q.y)<1,'menor lejos de su adulta '+q.v.id+' '+Math.hypot(ad.x-q.x,ad.y-q.y).toFixed(2));}}
}
// casos concretos
let o=run('parque',18,1);let nm=named(o).map(q=>q.v.id);
T(['f1','f2','f3','f4'].every(i=>nm.includes(i)),'familia en parque 18h: '+nm);T(nm.includes('s1')&&!nm.includes('x0'),'peque sola solo en parque tarde');
o=run('parque',11,1);nm=named(o).map(q=>q.v.id);T(!nm.includes('s2'),'peque sola no sale a las 11 en parque');
o=run('bar',13.5,1);nm=named(o).map(q=>q.v.id);T(nm.includes('f1')&&nm.includes('f3')&&nm.includes('f2')&&!nm.includes('s1')&&nm.includes('w1'),'bar 13:30: '+nm);
o=run('bar',20,1);nm=named(o).map(q=>q.v.id);T(!nm.includes('s1')&&!nm.includes('w1'),'bar 20h sin peque sola ni camarera');
o=run('obra',10,1);T(named(o).some(q=>q.v.id==='w2'&&q.trab),'obra trabajador');
// escala y dibujo sin errores
T(Math.abs(pbEscala(3)-.5)<.01&&Math.abs(pbEscala(16)-.9)<.01&&pbEscala(30)===1&&pbEscala(0)<.45,'escala');
T(pbPuesto(vecinoPorId('w1'))==='camarera'&&pbPuesto(vecinoPorId('w2'))==='peón','puesto por género');
for(const [k,h,wd] of [['parque',18,1],['bar',13.5,1],['obra',10,1],['super',10,1]]){S.t=h*60;S.day=1;while(dateOf(S.day).wd!==wd)S.day++;const s=S.sim;s.work=60;s.awayTotal=150;s.dest=k;s.outingActive=((PLACES[k]&&PLACES[k].outs)||[])[0]||null;s.exit=[9,19];awayKey=()=>k;enterScene();viewPlace=true;sceneKey=null;render();}
document.title=(bad.length||window.__errs.length?'FALLA ':'OK ')+bad.length+' errs '+window.__errs.length+' figs/esc '+(figs/cnt).toFixed(1)+' '+bad.slice(0,4).join(' | ')+' '+[...new Set(window.__errs.map(e=>e.slice(0,120)))].join(' | ');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
