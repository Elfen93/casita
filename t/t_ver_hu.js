// Visor de la casa de noche con una invitada dormida. Hash: casa=viejo|chalet|infra… · ana=1 (la jugadora también duerme) · rom=1 (la invitada es pareja) · z=zoom
setTimeout(()=>{try{const q=new URLSearchParams(location.hash.slice(1));window.__errs=window.__errs||[];
 let seed=11;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 S=newState('normal');S.char={...randomChar(),g:'m',name:'Oury'};S.ideo='marxista';initPeople();applyHome(q.get('casa')||'viejo');startTrack('oficina',true);rollWeather();S.weather={k:'sol',t:20};newToday();storyStart();S.autoHome=false;ex().dmode='ana';S.sim.work=0;
 const f=P_('amiga');if(q.get('rom')){f.stage='pareja';f.love=80;}
 S.t=21*60;S.res=(S.res||[]).filter(r=>r.kind!=='guest');inviteHome(f,true);if(!q.get('rom'))S.lodger=f.k;const r=S.res.find(x=>x.pid===f.k);
 if(q.get('ana')){const b=bestObjFor('energia');S.sim.x=b.obj%N+.5;S.sim.y=(b.obj/N|0)+.5;S.sim.target=b.obj;S.sim.goal='energia';S.sim.path=[];startUse();S.needs.energia=20;}
 for(let k=0;k<60*4+20;k++){S.t+=1;if(S.t>=1440){S.t-=1440;S.day++;}updateResidents(1);}
 if(q.get('h')){const h=+q.get('h');while(Math.abs(S.t-h*60)>1){S.t+=1;if(S.t>=1440){S.t-=1440;S.day++;}updateResidents(1);}}
 mode='live';menu.classList.remove('open');speed=0;hud();
 const i=r&&r.doing?r.doing.i:-1;const cx=i>=0?i%N+.5:S.sim.x,cy=i>=0?(i/N|0)+.5:S.sim.y;cam.z=+(q.get('z')||1.25);centerOnWorld((cx+S.sim.x)/2,(cy+S.sim.y)/2);
 const st=document.createElement('style');st.textContent='#toasts{display:none!important}';document.head.appendChild(st);
 setTimeout(()=>{document.title='OK '+JSON.stringify({doing:r&&r.doing&&[r.doing.act,r.doing.t],ana:S.sim.use&&S.sim.use.type,t:S.t,errs:window.__errs.slice(0,2)});},900);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
