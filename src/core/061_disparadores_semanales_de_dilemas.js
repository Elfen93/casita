// ---------- disparadores semanales de dilemas ----------
function triggersWeekly(){const c=ex();
  // se acaba de convertir en mando
  const boss=isBoss();if(boss&&S.career>c.lastCareer&&isLeft()&&!c.dq.some(d=>d.id==='ascenso'))askDilemma('ascenso',{});c.lastCareer=S.career;
  if(boss&&Math.random()<(Dm().soul?.06:.03)*(1+TOX()))askDilemma('despedir',{});
  // números rojos
  if(S.money<-30&&!c.dq.some(d=>d.id==='prestamo')&&!(S.cutBelt>S.day)){const f=(S.people||[]).filter(p=>p.stage!=='ex'&&closeTo(p)>=50).sort((a,b)=>closeTo(b)-closeTo(a))[0];askDilemma('prestamo',{p:f?f.k:null,m:Math.round(Math.max(150,-S.money+100)/10)*10});}
  // la pareja harta de la militancia
  const pt=partner();if(pt&&comp()>=2&&S.ideo!=='apolitica'&&pt.ideo!==S.ideo&&(pt.wear||0)>=40&&pt.wearWhy==='la militancia'&&Math.random()<.35)askDilemma('militancia',{p:pt.k});
  // despido: memoria de clase
  if(S.jobless&&!c.lastJobless){c.exp.loss++;pushI(isRight()?'socialdemocrata':LEANL(),18,'despido');}c.lastJobless=!!S.jobless;
  // capítulos recientes empujan ideas
  const st=storyState();for(const [id,ch] of Object.entries(st.chap)){if(c.chapSeen[id])continue;c.chapSeen[id]=1;
    if(id==='huelgaW'){c.exp.win++;pushI(isI('anarquista')?'anarquista':'marxista',25,'huelga');}
    else if(id==='juicio'){pushI('socialdemocrata',15,'huelga');}
    else if(id==='inquilinas'){pushI('anarquista',15,'vivienda');c.exp.solid++;}
    else if(/^promo|^top$/.test(id)){pushI('liberal',8,'ascenso');}
    else if(id==='boda'||/^nace_/.test(id)){pushI('conservadora',5,'familia');pushI('socialdemocrata',3,'cuidados');}
    else if(id==='ruptura'){c.exp.loss++;}
    else if(id==='comedor'){pushI(LEANL(),12,'pobreza');}}
  c.wk={out:0,outK:{}};}
function conexWeekly(){try{latentOf();wearWeekly();driftWeekly();contraWeekly();selfWeekly();traitEffectsWeekly();triggersWeekly();}catch(e){console.error('conex',e);}}
function conexDaily(){try{cqDaily();}catch(e){console.error(e);}}
// contar salidas (para celos, militancia y desgaste)
{const _go=goOut;goOut=function(k){const c=ex();c.wk.out++;c.wk.outK[k]=(c.wk.outK[k]||0)+1;if(['voluntariado','piquete'].includes(k)&&Math.random()<.3)c.exp.solid++;return _go.apply(this,arguments);};}
// la huelga de la plantilla: decide el jugador
{const _cs=callStrike;callStrike=function(byOthers){_cs.apply(this,arguments);if(byOthers&&S.strike&&!TR().self){if(ex().dmode!=='ana'){S.strike.join=false;askDilemma('piquete',{});}else if(!S.strike.join){S.scab=S.day;schedule(12,'esquirol',{});}}};}
// la detención deja huella
{const _ar=arrestAna;arrestAna=function(){_ar.apply(this,arguments);schedule(30,'antecedentes',{});if(T('resiliente')||T('combativa'))pushI('anarquista',15,'represion');else pushI('apolitica',15,'represion');};}

