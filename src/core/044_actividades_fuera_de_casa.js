// ---------- actividades fuera de casa ----------
const OUT=DATA.lugares.salidas;
// cuándo se puede ir a cada una (req) es lógica y se queda aquí
conLogica(OUT,{
  sindicato:{req:()=>S.union&&S.union.member&&!S.jobless&&!TR().self},
  militancia:{req:()=>S.ideo&&S.ideo!=='apolitica'},
  manifestacion:{req:()=>W_().manif&&W_().manif.day===S.day},
  comedor:{req:()=>false},
  piquete:{req:()=>(S.strike&&S.strike.on&&S.strike.join)||(W_().gs===S.day&&ID().strike>=.5)}});
function outName(k){if(k==='militancia'){const n=ID().org_n;return n?capF(n.replace(/^(el|la) /,'')):'Reunión política';}if(k==='voluntariado')return isI('conservadora')?'Voluntariado en la parroquia':isI('anarquista')?'Despensa solidaria':'Banco de alimentos';return OUT[k].n;}
function outAvail(k){const o=OUT[k],h=S.t/60,d=dateOf(S.day);
  if(S.sim.work>0||S.jail>0)return 'ahora no está en casa';if(o.req&&!o.req())return 'no toca';
  if(o.days==='libre'&&dayType(S.day)==='work'&&!(S.jobless||S.strike&&S.strike.on))return 'solo en días libres';
  if(o.wd&&!o.wd.includes(d.wd))return 'los '+o.wd.map(w=>WDL[w].toLowerCase()).join(' y ');
  const hh=o.flex&&!S.jobless&&SHIFT.start>=12&&dayType(S.day)==='work'?[10,12]:o.h;if(h<hh[0]||h>hh[1])return `de ${hh[0]}:00 a ${hh[1]}:00`;
  if(shouldWork()||(dayType(S.day)==='work'&&!S.jobless&&S.lastWorkDay!==S.day&&h<SHIFT.start&&h+o.dur/60>leaveTime()))return 'tiene que ir a trabajar';
  if(S.needs.energia<12)return 'está agotada';
  return null;}
function outCost(k){return k==='amigos'?Math.round(mealOutCost()*1.6):k==='networking'?Math.round(mealOutCost()*1.2):k==='misa'?Math.round(mealOutCost()*0.5):0;}
function doOut(k){S.outDay=S.day;goOut(k);}
// al volver de cada actividad
function outBack(k){
  const nd=S.needs,p=S.pol,c=CH().name,inf=ID().inf||1;const cost=outCost(k);if(cost){S.money-=cost;}
  const add=(n,v)=>nd[n]=Math.max(0,Math.min(100,nd[n]+v));
  tally('used','_out_'+k);
  switch(k){
    case 'sindicato':{add('social',30);add('energia',-8);const g=(3+lvl('carisma')*0.7)*ID().org*TR().org*comp()*0.6;office().org=Math.min(100,office().org+g);p.xp+=1.5;p.inf+=0.6*inf;gainSkill('carisma',4);const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+6);
      if(Math.random()<.4)tell(pickR([`Asamblea en el sindicato: ya son ${Math.round(office().org/4)+3} en la plantilla.`,'Hablaron de turnos, de horas extra y de cómo plantarse.','Salió de la asamblea con más ganas que cansancio.']),'✊');break;}
    case 'militancia':{add('social',25);add('diversion',10);add('energia',-6);p.xp+=2*comp();p.inf+=1*inf*comp();W_().mov=Math.min(100,W_().mov+0.5*inf*comp());gainSkill('carisma',3);
      if(Math.random()<.35)tell(`Fue a ${ID().org_n||'una reunión'}. `.replace('a el ','al ')+`${pickR(['Debate largo, café frío.','Salió con tareas para toda la semana.','Hay gente nueva: eso es buena señal.','Alguien trajo tortilla.'])}`,ID().e);break;}
    case 'manifestacion':{add('social',30);add('diversion',15);add('energia',-15);p.xp+=3;p.inf+=2*inf;W_().mov=Math.min(100,W_().mov+2.5*inf);const m=W_().manif;
      const arrest=(W_().era==='represion'?0.12:0.01)*(W_().gov==='conservador'?1.6:1)*(Dm().soul?1.5:1);
      if(Math.random()<arrest){arrestAna(1+(Math.random()*2|0),'en la manifestación');}else tell(`Manifestación ${m?m.cause:''}. ${pickR(['Había más gente de la esperada.','Gritó hasta quedarse sin voz.','La lluvia no echó a nadie.','Cortaron la avenida principal durante dos horas.'])}`,'📣');break;}
    case 'voluntariado':{add('social',30);add('diversion',15);add('energia',-10);p.red=Math.min(100,(p.red||0)+3);p.xp+=1;const v=P_('vecina');if(v)v.rel=Math.min(100,v.rel+4);
      if(Math.random()<.35)tell(`${outName('voluntariado')}: ${pickR(['repartieron comida a cuarenta familias.','cada semana viene más gente. Mala señal.','una señora le dio las gracias llorando.'])}`,'🥫');break;}
    case 'deporte':{add('diversion',20);add('energia',-12);add('higiene',-35);S.fit=Math.min(100,(S.fit||0)+4);break;}
    case 'networking':{add('social',25);add('energia',-8);S.netBoost=S.day+14;gainSkill('carisma',3);p.xp+=isI('liberal','libertaria')?2:0.5;if(Math.random()<.18&&!S.offer&&!S.jobless)makeOffer();break;}
    case 'misa':{add('social',25);add('diversion',10);p.xp+=isI('conservadora')?2:0.3;const m=P_('madre');if(m)m.rel=Math.min(100,m.rel+5);break;}
    case 'biblioteca':{gainSkill('logica',20);add('diversion',-5);if(S.opos&&S.opos.on)S.opos.h+=3;break;}
    case 'comedor':{nd.hambre=90;add('social',8);if(!S.story.chap.comedor)chapter('comedor','La cola',isI('marxista','anarquista')?`Hoy ha comido en el comedor social. En la cola había dos compañeras del trabajo. Nadie dijo nada; no hacía falta.`:isI('libertaria','liberal')?`Hoy ha comido en el comedor social. Se le caía la cara de vergüenza. Se ha prometido que será la última vez.`:isI('conservadora')?`Hoy ha comido en el comedor de la parroquia. Las voluntarias le pusieron doble ración y no le preguntaron nada.`:`Hoy ha comido en el comedor social. Nunca pensó que llegaría a esto.`);break;}
    case '_meet':break;
    case 'piquete':{add('social',25);add('energia',-12);p.inf+=1.5*inf;if(S.strike)S.strike.picket=(S.strike.picket||0)+1;break;}
  }
  p.inf=Math.min(100,p.inf);
  maybeMeet(k);
}
// Ana decide salir por su cuenta
function maybeOuting(){
  if(S.pendingDate&&S.outDay!==S.day&&!S.sim.work){const h=S.t/60,q=(S.people||[]).find(p=>p.k===S.pendingDate);if(!q||!['cita','rollo','pareja'].includes(q.stage)){S.pendingDate=null;}else if(h>=19&&h<=21.5&&!shouldWork()&&S.needs.energia>=20&&S.needs.hambre>=20&&spare()>mealOutCost()){S.outWith=q.k;S.dateOut=true;S.pendingDate=null;S.outDay=S.day;goOut('amigos');return true;}}
  if(S.outDay===S.day||S.jail>0)return false;const h=S.t/60;const key=S.day*24+Math.floor(h);if(S.outKey===key)return false;S.outKey=key;
  const nd=S.needs;if(nd.energia<(comp()>=2&&S.ideo!=='apolitica'?16:30)||nd.hambre<25||nd.vejiga<25)return false;
  const W=(S.weather||{}).k;const I=ID(),c=comp();const cand=[];
  for(const k in OUT){if(outAvail(k))continue;let w=(I.act[k]||0.4)*(k==='amigos'?(nd.social<60?2:0.5):1);
    if(['militancia','sindicato','manifestacion'].includes(k))w*=c;if(k==='piquete')w=8;if(k==='manifestacion'&&W_().manif&&!manifFits(W_().manif))w*=0.1;
    if(k==='deporte'&&(W==='lluvia'||W==='tormenta'||W==='nieve'))w=0;if(k==='biblioteca'&&!(S.opos&&S.opos.on))w*=0.3;
    if(outCost(k)>0&&outCost(k)>spare())w=0;if(w>0)cand.push([k,w]);}
  if(!cand.length)return false;
  if(Math.random()>(cand.some(x=>x[0]==='piquete'||x[0]==='manifestacion')?0.9:0.32))return false;
  let tot=cand.reduce((a,b)=>a+b[1],0),r=Math.random()*tot;for(const [k,w] of cand){r-=w;if(r<=0){doOut(k);return true;}}
  return false;
}
const manifFits=m=>!m||!m.side||m.side.includes(S.ideo);

