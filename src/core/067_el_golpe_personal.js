// ---------- el golpe personal ----------
const PT=DATA.sucesos.nucleo_personal;
const PERSONAL=[
  {id:'madre',c:()=>!!P_('madre'),t:()=>PT.madre.t,x:()=>huecos(PT.madre.x,{m:P_('madre').n}),
    o:()=>{const m=P_('madre');const cost=Math.round(WP()*.55);const O=PT.madre.o;return [
      {t:O[0].t,s:O[0].s,f:()=>{S.rep=Math.max(0,(S.rep??70)-12);S.money-=Math.round(salary()*4);S.absences=(S.absences||0)+4;m.rel=Math.min(100,m.rel+18);ex().exp.solid++;tell(huecos(O[0].tell,{b:String(bossS())}),'🫶');}},
      {t:huecos(O[1].t,{c:fmt(cost)}),ok:()=>S.money>=cost,f:()=>{S.money-=cost;m.rel=Math.min(100,m.rel+5);tell(huecos(O[1].tell,{c:fmt(cost)}),'🧺');pushI('socialdemocrata',6,'cuidados');}},
      {t:O[2].t,s:O[2].s,f:()=>{if(TOX()<.45||TR().coop||S.track==='funcion'){m.rel=Math.min(100,m.rel+12);tell(O[2].tell_ok,'📄');}else{S.rep=Math.max(0,(S.rep??70)-6);tell(huecos(O[2].tell_ko,{b:String(bossS())}),'😮‍💨');ex().exp.stress++;grieve(10);}}},
      {t:O[3].t,s:O[3].s,f:()=>{m.rel=Math.max(0,m.rel-14);tell(O[3].tell,'😤');ex().exp.stress++;}}];},
    auto:()=>S.money>WP()*.9?1:T('trabajadora')?2:0},
  {id:'vecina',c:()=>!!P_('vecina'),t:()=>PT.vecina.t,x:()=>huecos(PT.vecina.x,{v:P_('vecina').n}),
    o:()=>{const v=P_('vecina');const O=PT.vecina.o;return [
      {t:O[0].t,s:O[0].s,f:()=>{v.rel=Math.min(100,v.rel+30);ex().exp.solid++;pushI('anarquista',14,'vivienda');pushI('marxista',8,'vivienda');const ok=Math.random()<.45+W_().mov/200;if(ok){chapter('desahucio',O[0].cap,huecos(O[0].capx,{v:v.n}));ex().exp.win++;W_().mov=Math.min(100,W_().mov+6);}else{if(Math.random()<.25)arrestAna(1,O[0].arresto);else tell(huecos(O[0].tell_ko,{v:v.n}),'🥀');ex().exp.loss++;}}},
      {t:huecos(O[1].t,{c:fmt(Math.round(WP()*.35))}),ok:()=>S.money>=WP()*.35,f:()=>{S.money-=Math.round(WP()*.35);v.rel=Math.min(100,v.rel+12);tell(huecos(O[1].tell,{v:v.n}),'🏚️');}},
      {t:O[2].t,s:O[2].s,f:()=>{v.rel=Math.max(0,v.rel-25);pushI('apolitica',8,'vivienda');tell(O[2].tell,'🚪');ex().exp.stress++;}}];},
    auto:()=>isLeft()&&comp()>=2?0:S.money>WP()*1.2?1:2},
  {id:'amiga',c:()=>!!P_('amiga'),t:()=>huecos(PT.amiga.t,{g:P_('amiga').g==='a'?'a':'o'}),x:()=>{const f=P_('amiga');return huecos(PT.amiga.x,{p:f.n,l:f.g==='a'?'La':'Lo'});},
    o:()=>{const f=P_('amiga');const O=PT.amiga.o;return [
      {t:O[0].t,f:()=>{f.rel=Math.min(100,f.rel+20);ex().exp.solid++;S.res=S.res||[];inviteHome(f,true);S.lodger=f.k;schedule(21,'lodger',{p:f.k});tell(huecos(O[0].tell,{p:f.n,d:huDonde(f)[0]}),'🛋️');}},
      {t:O[1].t,f:()=>{f.rel=Math.max(0,f.rel-5);inviteHome(f,true);S.lodger=f.k;S.lodgerEnd=S.day+6;tell(huecos(O[1].tell,{p:f.n,d:huDonde(f)[0]}),'🧳');}},
      {t:huecos(O[2].t,{c:fmt(Math.round(WP()*.5))}),ok:()=>S.money>=WP()*.5,f:()=>{S.money-=Math.round(WP()*.5);f.rel=Math.min(100,f.rel+10);schedule(35,'devolver',{p:f.k,m:Math.round(WP()*.5)});tell(huecos(O[2].tell,{p:f.n}),'🤝');}}];},
    auto:()=>T('solidaria')||T('sociable')?0:1}];
