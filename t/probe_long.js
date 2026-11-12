setTimeout(()=>{try{
 let seed=1;const rs=n=>{seed=n;};Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 let reloj=1e6;performance.now=()=>reloj;
 const O={games:[],err:[]};let cur=null;
 const rec=(k)=>(...a)=>{if(cur)cur.push(k+'|'+a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join('|').slice(0,400));};
 const ws={};
 for(const k of ['tell','toast','chapter','remember','popBubble','bubbleFor','floatText','askDilemma']){
  try{const f=eval(k);eval(k+'=function(){rec(k)(...arguments);return f.apply(this,arguments);}');ws[k]=1;}catch(e){O.err.push(k+' '+e.message);}
 }
 console.error=(...a)=>{if(cur)cur.push('ERR|'+a.map(String).join(' ').slice(0,200));};
 const ideos=['marxista','liberal','anarquista','conservadora','libertaria','socialdemocrata','apolitica'];
 const tracks=['super','tech','coop','negocio','arte','funcion'];
 const homes=['padres','habitacion','bueno','viejo','infra',null];
 const diffs=['soul','normal','realista','dificil'];
 const N=+(window.__N||40),DAYS=+(window.__D||100);
 for(let g=0;g<N;g++){
  cur=[];const gl={g,log:cur};
  try{
   seed=500+g;reloj=1e6;const sx=['f','m','x'][g%3];
   S=newState(diffs[g%4]);S.char={...randomChar(),g:sx};if(sx==='f')S.char.beard='no';S.traits=[['sociable','ansiosa','solitaria','genio'][g%4]];S.ideo=ideos[g%7];S.pol.comp=2;initPeople();if(homes[g%6])applyHome(homes[g%6]);startTrack(tracks[(g*5)%6],true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
   if(g%5===1){S.kids=[{n:'Nora',g:'f',born:S.day-60*4-3,ch:{...randomChar(),g:'f',name:'Nora',beard:'no'}}];}
   for(let d=0;d<DAYS;d++){
    // perturbaciones deterministas para pisar ramas raras
    if(d%17===5){const r=(d*7+g)%6;if(r===0)S.money=-900;else if(r===1)S.jobless=true;else if(r===2){try{MT().an=18;}catch(e){}}else if(r===3){try{HP().peso+=22;}catch(e){}}else if(r===4)S.money=3000;else{S.sick=2;}}
    if(d%23===9&&g%2===0){try{S.owned=false;}catch(e){}}
    for(let k=0;k<480;k++){update(3);dlgTick();reloj+=40;}
    if(d%35===34){for(const [k] of MTABS){try{openMenu(k);cur.push('MENU|'+k+'|'+card.innerHTML.length+'|'+card.textContent.slice(0,600));}catch(e){cur.push('MENUERR|'+k+'|'+e.message);}}menu.classList.remove('open');try{for(const a of APPS){phOpen(a[0]);cur.push('PH|'+a[0]+'|'+phEl.textContent.slice(0,500));}phClose();}catch(e){}}
   }
   gl.dia=S.day;gl.dinero=Math.round(S.money);
  }catch(e){gl.err=e.message+' '+(e.stack||'').slice(0,200);}
  O.games.push(gl);
 }
 O.ws=Object.keys(ws);
 window.__probe=JSON.stringify(O);document.title='OK '+O.games.length;
}catch(e){window.__probe=JSON.stringify({err:e.message+e.stack});document.title='ERR '+e.message;}},500);
