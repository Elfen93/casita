// ---------- desgaste de las relaciones ----------
function wearWeekly(){const c=ex(),cl=classOf();let fought=0;
  for(const p of S.people||[]){if(p.stage==='ex'||!p.k)continue;if(/^p/.test(p.k)&&!intimate(p)&&S.day-(p.last||p.metDay||0)>14)p.rel=Math.max(5,p.rel-3);}
  for(const p of S.people||[]){if(p.stage==='ex'||!p.k)continue;ensureHid(p);const close=intimate(p)||closeTo(p)>=55||['madre','amiga'].includes(p.k);if(!close)continue;
    const R={};const add=(k,v)=>{if(v)R[k]=(R[k]||0)+v;};
    for(const h of p.hid){const H=HID[h];if(!H)continue;add(H.why||h,H.w(p));if(H.fx&&intimate(p))H.fx(p);}
    // ideas: más militancia, más choque
    if(p.ideo&&S.ideo&&p.ideo!=='apolitica'&&S.ideo!=='apolitica'&&((isLeft()&&RIGHT.includes(p.ideo))||(isRight()&&LEFT.includes(p.ideo))))add('la política',.8*comp());
    // clase: cuando la vida los pone a cada uno en un lado
    if(intimate(p)){if(RICHJOB.has(p.job)&&['precaria','parada'].includes(cl))add('el dinero',1);if(['mando','patrona'].includes(cl)&&isLeft(p.ideo))add('su trabajo',1.5);}
    // tiempo: militar, trabajar de más o estar fuera tiene un precio en casa
    const militancy=(c.wk.outK.militancia||0)+(c.wk.outK.sindicato||0)+(c.wk.outK.piquete||0)+(c.wk.outK.manifestacion||0);
    if(intimate(p)&&militancy>=2&&!(p.ideo===S.ideo))add('la militancia',militancy*.8);
    if(intimate(p)&&S.money<0)add('el dinero',1.4);
    if(intimate(p)&&mood()<35)add('el mal humor',1);
    if(intimate(p)&&(S.kids||[]).some(k=>kidAge(k)<3)&&!(p.rev||[]).includes('cuidadora')&&!p.hid.includes('cuidadora'))add('los cuidados',1.2);
    // lo que sí funciona: tiempo juntos, mismas ideas
    if(S.day-(p.last||0)<5)add('_bien',-1.2);if(p.ideo===S.ideo&&S.ideo!=='apolitica')add('_bien',-.8*comp());
    const tot=Object.values(R).reduce((a,b)=>a+b,0);const keep=T('rencorosa')?.97:.9;
    p.wear=clamp((p.wear||0)*keep+tot,0,100);
    const worst=Object.entries(R).filter(e=>e[0][0]!=='_'&&e[1]>0).sort((a,b)=>b[1]-a[1])[0];p.wearWhy=worst?worst[0]:null;
    if(intimate(p))p.love=clamp(Math.min(p.love-p.wear/12+(tot<0?.6:0),100-p.wear*.8),0,100);else p.rel=clamp(p.rel-p.wear/32,0,100);
    if(!fought&&p.wear>(intimate(p)?28:45)&&worst&&Math.random()<.3+(T('genio')?.2:0)){fought=1;tell(fight(p,worst[0]),'😤');}
    if(isPartner(p)&&p.wear>=68&&!c.dlg&&!c.dq.some(d=>d.id==='crisis'))askDilemma('crisis',{p:p.k});
    // revelar
    if(S.day-(p.metDay||0)>=6)for(const h of p.hid){if((p.rev||[]).includes(h))continue;const H=HID[h];if(!H)continue;if(H.need&&!(H.rev&&H.rev(p)))continue;const ch=.03+closeTo(p)/100*.1+(H.rev&&H.rev(p)?.22:0);
      if(Math.random()<ch){p.rev=p.rev||[];p.rev.push(h);tell(H.txt(p),H.e,'big');if(H.onRev)H.onRev(p);remember(huecos(TXN.desgaste.descubrio,{p:p.n,h:H.n.toLowerCase()}));break;}}}}
function fight(p,why){const n=p.n;const T_=TXN.desgaste.pelea;
  return huecos(pickR(T_[why]||[TXN.desgaste.pelea_resto]),{n,why,solo:p.g==='f'?'sola':'solo'});}

