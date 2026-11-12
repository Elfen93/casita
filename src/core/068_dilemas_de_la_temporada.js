// ---------- dilemas de la temporada ----------
Object.assign(DLG,{
  incidente:{t:d=>DT.incidente.t,x:d=>INC_TXT(d.v),
    o:d=>{const c=ex();const O=DT.incidente.o;if(TR().self)return [{t:O.self[0].t,f:()=>{S.payMul=(S.payMul||1)*.9;chose(O.self[0].chose);}},{t:O.self[1].t,f:()=>{if(Math.random()<.5){tell(O.self[1].tell_a,'🏪');S.payMul=(S.payMul||1)*.95;}else tell(O.self[1].tell_b,'🏪');chose(O.self[1].chose);}},{t:O.self[2].t,f:()=>{schedule(10,'proveedor',{});chose(O.self[2].chose);}}];
      if(TR().coop)return [{t:O.coop[0].t,f:()=>{S.needs.energia=Math.max(0,S.needs.energia-15);chose(O.coop[0].chose);tell(O.coop[0].tell,'🤝');}},{t:O.coop[1].t,f:()=>{office().org=Math.max(0,office().org-5);chose(O.coop[1].chose);tell(O.coop[1].tell,'🤝');}}];
      return [
      {t:O.base[0].t,s:O.base[0].s,f:()=>{c.exp.stress++;grieve(10);S.rep=Math.min(100,(S.rep??70)+3);pushI('apolitica',5,'cansancio');chose(O.base[0].chose);tell(pickR(O.base[0].tell),'😶');}},
      {t:O.base[1].t,s:O.base[1].s,f:()=>{const ok=Math.random()<.25+lvl('carisma')*.09-TOX()*.25+(T('genio')?.1:0);chose(O.base[1].chose);
        if(ok){c.exp.win++;S.pol.inf+=2;office().griev=Math.max(0,(office().griev||0)-5);tell(huecos(O.base[1].tell_ok,{jefe:bossS(),compi:compiN(),miro:ga(...O.base[1].miro)}),'💪');}
        else{S.rep=Math.max(0,(S.rep??70)-10);grieve(15);schedule(7,'marcada',{});tell(huecos(O.base[1].tell_ko,{jefe:bossS()}),'👁️');}}},
      {t:huecos(O.base[2].t,{compi:compiN()}),s:O.base[2].s,f:()=>{const o=office();o.org=Math.min(100,o.org+12);o.griev=Math.min(100,(o.griev||0)+8);const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+12);c.exp.solid++;pushI(LEANL(),8,'explotacion');chose(O.base[2].chose);schedule(9,'respuesta',{});tell(huecos(O.base[2].tell,{compi:compiN()}),'🗣️');}}];},
    auto:()=>isLeft()&&comp()>=2?2:T('genio')||T('combativa')||(lvl('carisma')>=3&&Math.random()<.5)?1:isLeft()||Math.random()<.3?2:0},
  golpe:{t:d=>DT.golpe.t,x:d=>{const g=GOLPES.find(x=>x.id===d.v);return g?g.x(d.m):'';},
    o:d=>{const g=GOLPES.find(x=>x.id===d.v);if(g)g.fx(d.m);const m=d.m;const mo=P_('madre');const O=DT.golpe.o;return [
      {t:O[0].t,ok:()=>!S.jobless&&!TR().self,s:O[0].s,f:()=>{S.money+=m;bumpMoney&&bumpMoney();S.owe=S.day+40;schedule(14,'adelanto',{m:Math.round(m/2)});schedule(28,'adelanto',{m:Math.round(m/2)});chose(O[0].chose);tell(huecos(O[0].tell,{jefe:bossS(),m:fmt(m)}),'🪝');}},
      {t:huecos(O[1].t,{mo:mo?mo.n:DT.golpe.madre}),ok:()=>!!mo,s:O[1].s,f:()=>{S.money+=m;bumpMoney&&bumpMoney();mo.rel=Math.min(100,mo.rel+4);pushI('conservadora',5,'familia');chose(O[1].chose);tell(huecos(O[1].tell,{mo:mo.n,m:fmt(m)}),'👩‍🦳');}},
      {t:O[2].t,s:O[2].s,f:()=>{S.money+=Math.round(m*.8);bumpMoney&&bumpMoney();S.needs.energia=Math.max(0,S.needs.energia-40);ex().exp.stress++;chose(O[2].chose);tell(huecos(O[2].tell,{m:fmt(Math.round(m*.8))}),'📦');}},
      {t:O[3].t,s:O[3].s,f:()=>{S.needs.diversion=Math.max(0,S.needs.diversion-25);S.cutBelt=S.day+14;ex().exp.stress++;chose(O[3].chose);tell(O[3].tell,'🍚');}}];},
    auto:()=>S.money<0?(P_('madre')&&Math.random()<.6?1:S.jobless||TR().self?2:0):T('trabajadora')&&Math.random()<.5?2:Math.random()<.5?3:2},
  asamblea:{t:()=>DT.asamblea.t,x:()=>huecos(DT.asamblea.x,{compi:compiN(),estado:office().org>=50?DT.asamblea.alta:DT.asamblea.baja}),
    o:()=>{const O=DT.asamblea.o;return [{t:O[0].t,s:office().org<50?O[0].s_baja:O[0].s_alta,f:()=>{if(!S.union||!S.union.member)joinUnion();const o=office();o.org=Math.max(o.org,35);o.griev=Math.max(o.griev||0,35);callStrike(false);if(S.strike)S.strike.join=true;chose(O[0].chose);}},
      {t:O[1].t,s:O[1].s,f:()=>{const o=office();o.org=Math.min(100,o.org+18);if(!S.union||!S.union.member)joinUnion();S.pol.inf+=3;chose(O[1].chose);schedule(18,'masgente',{});tell(O[1].tell,'🗣️');}},
      {t:O[2].t,s:O[2].s,f:()=>{const cp=P_('compi');if(cp)cp.rel=Math.max(0,cp.rel-12);pushI('apolitica',10,'cansancio');chose(O[2].chose);tell(huecos(O[2].tell,{compi:compiN()}),'😶');}}];},
    auto:()=>isLeft()&&comp()>=2?(office().org>=45?0:1):2},
  envenenado:{t:()=>DT.envenenado.t,x:()=>huecos(DT.envenenado.x,{jefe:cap(bossT()),llama:ga(...DT.envenenado.llama),puesto:L(CAREER[S.career+1].t).toLowerCase()}),
    o:()=>{const O=DT.envenenado.o;return [{t:O[0].t,f:()=>{S.career++;S.rep=Math.min(100,(S.rep??70)+5);ex().contra+=isLeft()?30:5;pushI('liberal',15,'ascenso');chose(O[0].chose);tell(huecos(O[0].tell,{puesto:L(CAREER[S.career].t).toLowerCase(),compi:compiN(),mirar:ga(...DT.envenenado.mirar)}),'📈');storyPromo();}},
      {t:O[1].t,s:O[1].s,f:()=>{S.career++;S.ally=true;chose(O[1].chose);schedule(20+Math.random()*20,'topo',{});tell(O[1].tell,'🕵️');storyPromo();}},
      {t:O[2].t,s:O[2].s,f:()=>{S.rep=Math.max(0,(S.rep??70)-5);office().org=Math.min(100,office().org+10);const cp=P_('compi');if(cp)cp.rel=Math.min(100,cp.rel+15);S.pol.inf+=4;ex().exp.solid++;chose(O[2].chose);tell(huecos(O[2].tell,{jefe:bossS(),compi:compiN()}),'☕');}}];},
    auto:()=>isLeft()&&comp()>=2?2:isLeft()?1:0},
  oferta:{t:()=>DT.oferta.t,x:()=>{if(!S.offer)makeOffer();const o=S.offer;return huecos(DT.oferta.x,{e:o.n,puesto:L(CAREER[o.career].t).toLowerCase(),pago:fmt(offerPay(o)),sueldo:fmt(salary()),amb:o.seen>.6?DT.oferta.amb_mal:o.seen<.3?DT.oferta.amb_bien:DT.oferta.amb_nada});},
    o:()=>{const O=DT.oferta.o;return [{t:O[0].t,f:()=>{chose(O[0].chose);acceptOffer();}},{t:O[1].t,s:O[1].s,f:()=>{chose(O[1].chose);counterOffer();if(S.offer)rejectOffer(true);}},{t:O[2].t,f:()=>{chose(O[2].chose);rejectOffer(true);tell(O[2].tell,'🏢');}}];},
    auto:()=>S.offer&&offerPay(S.offer)>salary()*1.15?0:1},
  entrevista:{t:()=>DT.entrevista.t,x:()=>huecos(DT.entrevista.x,{puesto:L(CAREER[0].t).toLowerCase(),q:entrevQ()}),
    o:()=>{const O=DT.entrevista.o;return [{t:O[0].t,f:()=>{S.jobless=false;S.paroWeeks=0;S.career=0;S.rep=55;S.office=null;office();chose(O[0].chose);tell(entrevYes(),'📝');pushI('apolitica',8,'despido');}},
      {t:O[1].t,s:O[1].s,f:()=>{if(Math.random()<.35){S.jobless=false;S.paroWeeks=0;S.career=0;S.rep=55;S.office=null;office();tell(O[1].tell_ok,'📝');ex().exp.win++;}else{tell(O[1].tell_ko,'📭');ex().exp.stress++;}chose(O[1].chose);}},
      {t:O[2].t,f:()=>{pushI(LEANL(),10,'despido');chose(O[2].chose);tell(O[2].tell,'🚪');ex().exp.stress++;}}];},
    auto:()=>S.money<0?0:1},
  cliente:{t:()=>DT.cliente.t,x:()=>TR().coop?DT.cliente.x.coop:DT.cliente.x.negocio,
    o:()=>{const O=DT.cliente.o;return [{t:O[0].t,f:()=>{S.money+=Math.round(WP()*1.5);bumpMoney&&bumpMoney();S.payMul=(S.payMul||1)*.85;chose(O[0].chose);tell(O[0].tell,'📦');}},{t:O[1].t,f:()=>{chose(O[1].chose);tell(O[1].tell,'🏪');}}];},
    auto:()=>S.money<200?0:1},
  personal:{t:d=>{const v=PERSONAL.find(x=>x.id===d.v);return v?v.t():'';},x:d=>{const v=PERSONAL.find(x=>x.id===d.v);return v?v.x():'';},o:d=>{const v=PERSONAL.find(x=>x.id===d.v);return v?v.o():[{t:DT.personal.o_sin[0].t,f:()=>{}}];},auto:d=>{const v=PERSONAL.find(x=>x.id===d.v);return v?v.auto():0;}}});
