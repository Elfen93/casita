let _sd=11;Math.random=()=>{_sd=(Math.imul(_sd,1664525)+1013904223)>>>0;return _sd/4294967296;}; // azar sembrado: sin él, un suceso al azar durante la visita cambiaba la relación y la prueba fallaba a veces
setTimeout(()=>{try{
 const errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,200):String(x)).join(' '));};
 const fails=[];const chk=(c,m)=>{if(!c)fails.push(m);};
 S=newState('normal');S.char={...randomChar(),g:'f'};S.ideo='marxista';initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=false;S.weather={k:'sol',t:20};
 let d=55;while(dateOf(d).wd!==2||dayType(d)!=='work')d++;S.day=d;
 // 1. sin censo
 const D0=DATA.personas;delete D0.hogares;delete D0.edificios;
 let dw=d;while(dateOf(dw).wd!==5||dayType(dw)==='vac')dw++;S.day=dw;const am=S.people.find(q=>q.k==='amiga');am.n='Marta';const r0=am.rel=40;S.t=11*60;
 chk(destOf('visita')==='hogar','destOf');
 const s=S.sim;peGo(am,'visita');let seen=false,dest=null,sk=null,rot=null;
 for(let k=0;k<3000;k++){update(3);if(s.outingActive==='visita'&&s.work>0){seen=true;dest=s.dest;rot=placeName(s.dest);if(s.work<s.awayTotal-30&&!sk)sk=awayKey();}if(seen&&!(s.work>0)&&!s.outing)break;}
 chk(seen,'no sale');chk(dest==='hogar','dest '+dest);chk(rot==='Casa de Marta','rotulo '+rot);
 chk(sk==='hogar','escena durante la visita '+sk);chk(!(s.work>0),'no vuelve');chk(am.rel>=r0+5.9,'rel '+am.rel);chk(S.outWith==null,'outWith');
 const he=hogarDe(am);chk(he&&he.hogar&&he.miembros&&he.edificio&&!he.censo,'hogarDe sin censo');
 const m=hogarDe({k:'madre',n:'Rosa'});chk(m.hogar.cls===1&&m.edificio.tipo==='bloque','madre piso viejo');
 chk(JSON.stringify(hogarDe(am).hogar)===JSON.stringify(hogarDe(am).hogar),'estable');
 S.day=d;
 // 2. con censo
 D0.edificios={e1:{n:'Bloque de la calle Olivo, 12',tipo:'bloque',plantas:5,d:''},e2:{n:'Casa de la calle Jara, 3',tipo:'casa',plantas:1,d:''}};
 D0.hogares={h1:{n:'Familia Ruiz',edificio:'e1',puerta:'3.º B',cls:1,tipo:'tres_generaciones',d:'',miembros:['v1','v2','v3','v4','v5']},h2:{n:'Irene y Sergio',edificio:'e2',cls:3,tipo:'pareja',d:'',miembros:['v6','v7']}};
 const L5=[0,1,2,3,4];D0.vecinos=(D0.vecinos||[]).concat([{id:'v1',n:'Marta',g:'f',edad:38,hogar:'h1',rol:'madre',trabajo:{lugar:'super',puesto:'cajera',h:[8,15],dias:L5},donde:[]},{id:'v2',n:'Rafa',g:'m',edad:41,hogar:'h1',rol:'padre',trabajo:{lugar:'obra',puesto:'peón',h:[7,16],dias:L5},donde:[]},{id:'v3',n:'Lola',g:'f',edad:7,hogar:'h1',rol:'hija',trabajo:null,donde:[['colegio',9,14,L5]]},{id:'v4',n:'Hugo',g:'m',edad:4,hogar:'h1',rol:'hijo',trabajo:null,donde:[['colegio',9,13,L5]]},{id:'v5',n:'Concha',g:'f',edad:74,hogar:'h1',rol:'abuela',trabajo:null,donde:[]},{id:'v6',n:'Irene',g:'f',edad:36,hogar:'h2',rol:'pareja',trabajo:{lugar:'torre',puesto:'analista',h:[9,18],dias:L5},donde:[]},{id:'v7',n:'Sergio',g:'m',edad:39,hogar:'h2',rol:'pareja',trabajo:{lugar:'torre',puesto:'abogado',h:[8,17],dias:L5},donde:[]}]);
 const hr=hogarDe({hogar:'h1',n:'Marta'});chk(hr.censo&&hr.miembros.length===5&&hr.edificio.tipo==='bloque','hogarDe censo');
 am.n='Marta';am.hogar='h1';S.outWith='amiga';s.work=100;s.awayTotal=160;s.dest='hogar';s.outingActive='visita';
 chk(placeName('hogar')==='Casa de Marta','rotulo censo '+placeName('hogar'));
 const names=[];const _l=label;label=function(t){names.push(t);return _l.apply(this,arguments);};
 const noms=(who,h)=>{const p=S.people.find(q=>q.k==='amiga');p.n=who[0];p.hogar=who[1];S.t=h*60;names.length=0;const nt=(h>=21||h<7)?1:0;drawScene('hogar',3,nt);const todos=names.concat(typeof RT!=='undefined'?RT.names.map(q=>q.name):[]); // los nombres van ahora por los rótulos
  return [...new Set(todos)].filter(n=>n!==CH().name).sort().join(',');};
 const exp={10:{h1:'Concha,Marta',h2:'Irene'},14:{h1:'Concha,Hugo,Lola,Marta',h2:'Irene'},19:{h1:'Concha,Hugo,Lola,Marta,Rafa',h2:'Irene,Sergio'},2:{h1:'',h2:''}};
 const out=[];
 for(const h of [10,14,19,2])for(const [hid,who] of [['h1','Marta'],['h2','Irene']]){const got=noms([who,hid],h);out.push(hid+'@'+h+'='+got);chk(got===exp[h][hid],`${hid}@${h}: '${got}' esperado '${exp[h][hid]}'`);}
 label=_l;
 // hogar inexistente: tolera
 am.hogar='zzz';try{drawScene('hogar',3,0);}catch(e){fails.push('hogar zzz '+e.message);}
 console.error=oe;
 document.title=(fails.length||errs.length||window.__errs.length)?'FALLA '+JSON.stringify({fails,errs:errs.slice(0,3),w:window.__errs.slice(0,2)}):'OK '+JSON.stringify({errs,werrs:window.__errs,out:out.join(' ')});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
