// ---------- la gente con la que vive ----------
{const _res=residents;residents=function(){const list=_res();const h=S.t/60,wk=dayType(S.day)==='work';
  for(const k of (S.home&&S.home.mates)||[]){const p=(S.people||[]).find(q=>q.k===k);if(!p)continue;if(!p.ch){p.ch={...randomChar(),name:p.n,g:k==='madre'?'f':(p.g||'f'),age:k==='madre'?58:27,hair:k==='madre'?'#bdbdbd':undefined,style:k==='madre'?'mono':undefined,beard:'no'};if(!p.ch.hair)p.ch.hair=HAIRCOLS[2];if(!p.ch.style)p.ch.style='corto';}
    const away=k!=='madre'&&wk&&h>8.5&&h<(15+hash(k.length*7+S.day)*5);const has=(S.res||[]).some(r=>r.pid===k);
    if(!away&&!has){let c=null;for(let t=0;t<30;t++){const x=4+(hash(S.day*17+t*5+k.length)*12|0),y=5+(hash(S.day*13+t*7+k.length*3)*9|0);if(walkable(x,y)&&!inArea(x,y)&&roomId[idx(x,y)]>=0){c=[x,y];break;}}
      if(c){S.res=S.res||[];S.res.push({kind:'mate',pid:k,x:c[0]+.5,y:c[1]+.5,path:[],phase:0});}}
    if(away&&has)S.res=S.res.filter(r=>r.pid!==k);}
  return S.res||list;};}
{const _pay=payRent;payRent=function(){const t=(S.home&&S.home.type)||'casita';if(t!=='padres'||S.owned)return _pay.apply(this,arguments);const r=weeklyRent();S.money-=r;bumpMoney();toast(huecos(TXN.convivientes.compra_madre,{r:fmt(r)}));};}
