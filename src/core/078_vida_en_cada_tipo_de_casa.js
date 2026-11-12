// ---------- vida en cada tipo de casa ----------
function homeWeekly(){if(!S.home)S.home={type:'casita',area:[0,0,N-1,N-1],since:S.day,mates:[]};const t=S.home.type||'casita',H=HOMES[t],c=CH();
  if(H.damp){for(const o of S.obj)if(o&&!o.priv)o.c=Math.max(0,(o.c??100)-5);S.needs.energia=Math.max(0,S.needs.energia-6);
    if(Math.random()<.12&&!S.sick){S.sick=1+(Math.random()*3|0);tell(huecos(TXN.tipos_de_casa.catarro,{c:c.name}),'🦠');}
    else if(Math.random()<.25)tell(pickR(TXN.tipos_de_casa.humedad),'🏚️');}
  if(t==='habitacion'){const ms=S.home.mates.map(k=>(S.people||[]).find(p=>p.k===k)).filter(Boolean);const m=pickR(ms);
    if(m&&Math.random()<.55)tell(huecos(pickR(TXN.tipos_de_casa.piso),{m:m.n,c:c.name,juntas:m.g==='m'?'juntos':'juntas'}),'🛋️');
    if(m&&Math.random()<.4){m.rel=Math.max(0,Math.min(100,m.rel+(Math.random()<.5?6:-5)));}
    if(Math.random()<.04&&ms.length){const out=pickR(ms);S.home.mates=S.home.mates.filter(k=>k!==out.k);S.res=(S.res||[]).filter(r=>r.pid!==out.k);out.stage='conocida';out.mate=false;const nw=newMate();S.home.mates.push(nw.k);tell(huecos(TXN.tipos_de_casa.relevo,{out:out.n,nw:nw.n,job:nw.mjob,imp:pickR(TXN.tipos_de_casa.relevo_imp)}),'📦');}
    if(Math.random()<.5)S.needs.energia=Math.max(0,S.needs.energia-5);}
  if(t==='padres'){const m=P_('madre');if(m){m.rel=Math.min(100,m.rel+1);if(Math.random()<.45)tell(huecos(pickR(TXN.tipos_de_casa.padres),{m:m.n,c:c.name,dos:c.g==='m'?'Los dos':'Las dos'}),'👩‍🦳');}
    S.needs.social=Math.min(100,S.needs.social+8);}
  if(t==='bueno'&&Math.random()<.2)tell(huecos(pickR(TXN.tipos_de_casa.bueno),{senora:ga('señora','señor','señore')}),'🏙️');
  if(t==='chalet'&&Math.random()<.2)tell(pickR(TXN.tipos_de_casa.chalet),'🏊');
  // decidir mudarse sola
  if(S.autoHome&&!S.owned&&S.day-(S.home.since||0)>=28){const rent=weeklyRent(),inc=S.jobless?0:salary()*TR().days.length;
    const down=HOME_ORDER.slice(0,HOME_ORDER.indexOf(t)).reverse().find(k=>HOMES[k].rent*Dm().rent<rent*.7&&canMove(k).ok);
    if(S.money<-rent*1.5&&down&&Math.random()<.35){moveHome(down,true);return;}
    const up=HOME_ORDER.slice(HOME_ORDER.indexOf(t)+1).reverse().find(k=>canMove(k).ok&&HOMES[k].rent*Dm().rent<inc*.38&&S.money>moveCost(k)*3+reserveMoney());
    if(up&&Math.random()<(T('derrochadora')||isI('liberal','libertaria')?.3:T('ahorradora')?.06:.15)&&(t!=='casita'||HOMES[up].cls>2&&S.money>moveCost(up)*6))moveHome(up,true);}}
