setTimeout(()=>{try{
 const errs=[];const oe=console.error;console.error=(...a)=>{errs.push(a.map(x=>x&&x.stack?x.stack.slice(0,300):String(x)).join(' '));};
 const out=[];
 // 1) impago → desahucio → calle (madre con rel baja), 60 días en la calle
 S=newState('dificil');S.char={...randomChar(),g:'m'};S.traits=['pesimista'];S.ideo='apolitica';initPeople();applyHome('viejo');startTrack('super',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
 const md=P_('madre');if(md)md.rel=5;S.money=-2000;S.jobless=true;S.paroWeeks=0;
 const chaps=()=>Object.keys(S.story.chap).join(',');
 const acts={},outs={};
 for(let k=0;k<480*120;k++){update(3);dlgTick();const u=S.sim.use;if(u&&u.act)acts[u.act]=(acts[u.act]||0)+1;if(S.sim.outingActive)outs[S.sim.outingActive]=(outs[S.sim.outingActive]||0)+1;if(S.money>-1500&&!homeless())S.money=-2000;if(md)md.rel=Math.min(md.rel,5);}
 out.push('A home='+S.home.type+' mg='+JSON.stringify({wk:S.mg.wk,debt:S.mg.debt,ev:S.mg.evicted,alb:S.mg.alb,ss:S.mg.ss,imv:S.mg.imv,fines:S.mg.fines})+' an='+Math.round(MT().an)+' dep='+MT().dep+' chaps='+chaps()+' outs='+JSON.stringify(outs)+' $'+Math.round(S.money));
 // 2) depresión y adicción: ánimo bajo forzado
 S=newState('normal');S.char={...randomChar(),g:'f'};S.traits=['pesimista'];S.ideo='liberal';initPeople();applyHome('habitacion');startTrack('hosteleria',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';S.money=3000;
 MT().an=20;const outs2={};
 for(let k=0;k<480*90;k++){update(3);dlgTick();if(S.sim.outingActive)outs2[S.sim.outingActive]=(outs2[S.sim.outingActive]||0)+1;if(k%(480*10)===0)MT().an=Math.min(MT().an,30);}
 out.push('B mt='+JSON.stringify({an:Math.round(MT().an),dep:MT().dep,alc:+MT().alc.toFixed(1),dro:+MT().dro.toFixed(1),deal:MT().deal&&MT().deal.n,ther:MT().ther,wait:MT().wait,bust:MT().bust,debt:MT().debt})+' rec='+S.record+' jail='+S.jail+' chaps='+chaps()+' outs='+JSON.stringify(outs2)+' $'+Math.round(S.money));
 // 3) control: partida normal 60 días, nada de esto debería disparar
 S=newState('normal');S.char={...randomChar(),g:'f'};S.traits=['optimista'];S.ideo='socialdemocrata';initPeople();applyHome('padres');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';
 for(let k=0;k<480*60;k++){update(3);dlgTick();}
 out.push('C an='+Math.round(MT().an)+' dep='+MT().dep+' alc='+MT().alc.toFixed(1)+' mg='+JSON.stringify({wk:S.mg&&S.mg.wk,ev:S.mg&&S.mg.evicted})+' home='+S.home.type+' $'+Math.round(S.money));
 // UI
 openMenu('vida');out.push('vida='+(document.querySelector('#card')||card).innerText.replace(/\s+/g,' ').slice(0,300));
 document.title='OK '+JSON.stringify({errs:errs.slice(0,6),werrs:window.__errs.slice(0,4),out});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,600)}},300);
