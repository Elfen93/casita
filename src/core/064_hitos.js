// ---------- hitos ----------
const BH=DATA.sucesos.nucleo_hitos;
const BEATS={
  primer(){if(TM().n>1||S.jobless)return;const tx=TOX(),b=bossT(),c=compiN();let x;
    if(TR().self)x=huecos(BH.primer.self,{e:office().n,m:fmt(Math.round(WP()*.03))});
    else if(TR().coop)x=huecos(BH.primer.coop,{e:office().n});
    else if(S.track==='reparto')x=huecos(BH.primer.reparto,{m:fmt(Math.round(salary()*.8))});
    else if(tx>.6)x=huecos(BH.primer.duro,{e:office().n,fin:SHIFT.end,b:b,mirarla:ga('mirarla','mirarlo','mirarle'),c:c});
    else if(tx>.35)x=huecos(BH.primer.medio,{e:office().n,c:c,B:cap(b)});
    else x=huecos(BH.primer.suave,{e:office().n,B:cap(b),c:c});
    chapter('primer_dia',BH.primer.titulo,x);},
  semana(){const r=weeklyRent(),p=S.jobless?0:weekPay();const left=Math.round(S.money);
    let x=huecos(BH.semana.x,{t:S.jobless?BH.semana.sin_trabajo:huecos(BH.semana.cobro,{p:fmt(p)}),r:fmt(r),q:fmt(left)});
    x+=' '+(left<r*1.5?BH.semana.colchon[0]:left<r*4?BH.semana.colchon[1]:BH.semana.colchon[2]);
    if(!S.jobless&&r>p*.45)x+=' '+BH.semana.alquiler;
    tell(x,'🧾');},
  incidente(){if(S.jobless){tell(BH.incidente.paro,'📭');return;}
    const V=INCID[TR().self?'negocio':TR().coop?'coop':S.track]||INCID.oficina;const v=useVar('inc',V);askDilemma('incidente',{v:v.id});},
  golpe(){const V=GOLPES.filter(g=>!g.c||g.c());const v=useVar('golpe',V);const m=Math.round(v.m()*PM());askDilemma('golpe',{v:v.id,m});},
  encrucijada(){let id;const o=S.jobless?null:office();
    if(S.jobless)id='entrevista';else if(TR().self||TR().coop)id='cliente';else if((o.org>=25||(S.union&&S.union.member)||(isLeft()&&comp()>=2))&&!(S.strike&&S.strike.on))id='asamblea';else if((S.rep??70)>=62&&S.career+1<CAREER.length&&!TR().gig)id='envenenado';else id='oferta';
    askDilemma(id,{});},
  personal(){const V=PERSONAL.filter(p=>!p.c||p.c());const v=useVar('pers',V);askDilemma('personal',{v:v.id});},
  eco(){const t=TM();const c=t.choices;if(!c.length)return;tell(huecos(BH.eco.x,{c:c.slice(-3).map(x=>x.toLowerCase()).join('; '),f:pickR(BH.eco.cierre)}),'🪞');},
  epilogo(){const t=TM();const dm=Math.round(S.money)-t.money0;const same=S.track===t.track0&&S.career===t.career0&&!S.jobless&&!t.jobless0;
    const near=[...(S.people||[])].filter(p=>p.stage!=='ex').sort((a,b)=>closeTo(b)-closeTo(a)).slice(0,2).map(p=>p.n);
    let x=huecos(BH.epilogo.x,{pat:typeof patrimonioTxt==='function'?patrimonioTxt(t,dm):(dm>=0?huecos(BH.epilogo.mas,{m:fmt(dm)}):huecos(BH.epilogo.menos,{m:fmt(-dm)}))});
    x+=S.jobless?BH.epilogo.paro:same?huecos(BH.epilogo.igual,{p:L(CAREER[S.career].t).toLowerCase(),e:office().n}):huecos(BH.epilogo.ahora,{p:L(CAREER[S.career].t).toLowerCase(),en:S.office?huecos(BH.epilogo.en,{e:office().n}):''});
    if(S.ideo!==t.ideo0)x+=huecos(BH.epilogo.ideo,{i:IDEOS[S.ideo].n.toLowerCase()});
    if(near.length)x+=huecos(BH.epilogo.cerca,{l:near.join(BH.epilogo.cerca_union)});
    if(t.choices.length)x+=huecos(BH.epilogo.decidio,{d:t.choices.slice(-4).map(c=>c.toLowerCase()).join('; ')});
    x+=same&&dm<=0?BH.epilogo.cierre_igual:ex().exp.win>0?BH.epilogo.cierre_gana:dm>weeklyRent()*3?BH.epilogo.cierre_ahorro:BH.epilogo.cierre_sigue;
    chapter('temporada_'+t.n,huecos(BH.epilogo.titulo,{t:t.n}),x);
    const w=W_();w.crisis=Math.min(100,w.crisis+(Dm().soul?8:4));S.tmp=newSeason(t.n+1,S.day+1);toast(huecos(BH.epilogo.toast,{t:t.n+1}),true);}};
