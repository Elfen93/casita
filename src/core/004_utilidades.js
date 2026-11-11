// ---------- utilidades ----------
const idx=(x,y)=>y*N+x;
const inb=(x,y)=>x>=0&&y>=0&&x<N&&y<N;
const isBlockWall=w=>w===1||w===3||w===4;
const isRoomWall=w=>w===1||w===2||w===3;
const walkable=(x,y)=>inb(x,y)&&!isBlockWall(S.wall[idx(x,y)])&&!S.obj[idx(x,y)]&&!FLOORS[S.floor[idx(x,y)]].water;
const fmt=n=>Math.round(n).toLocaleString('es-ES')+' €';
function shade(hex,f){let r,g,b;if(hex[0]==='#'){const n=parseInt(hex.slice(1),16);r=n>>16;g=(n>>8)&255;b=n&255;}else{const m=hex.match(/[\d.]+/g);if(!m)return hex;[r,g,b]=m.map(Number);if(m.length>3)return `rgba(${Math.min(255,r*f|0)},${Math.min(255,g*f|0)},${Math.min(255,b*f|0)},${m[3]})`;}r=Math.min(255,r*f|0);g=Math.min(255,g*f|0);b=Math.min(255,b*f|0);return `rgb(${r},${g},${b})`;}
const toastSeen=new Map();
function toast(msg,gold){
  msg=L(msg);if(gold&&S&&S.today&&!/^(📕|📅|💭|🎂|⭐|✅|🏡|🍻)/.test(msg)&&S.today.ev.length<6&&!S.today.ev.includes(msg))S.today.ev.push(msg);
  const now=performance.now();if(toastSeen.has(msg)&&now-toastSeen.get(msg)<12000)return;toastSeen.set(msg,now);
  const box=document.getElementById('toasts');const t=document.createElement('div');t.className='toast'+(gold?' gold':'');t.textContent=msg;box.appendChild(t);
  while(box.children.length>2)box.firstChild.remove();
  const life=gold?4200:Math.min(4200,1800+msg.length*25);setTimeout(()=>t.classList.add('fade'),life);setTimeout(()=>t.remove(),life+450);
}
function skillInfo(xp){let l=0,need=60;while(xp>=need&&l<10){xp-=need;l++;need=60+40*l;}return {lv:l,prog:l>=10?1:xp/need};}
const lvl=k=>skillInfo(S.skills[k]).lv;
function count(fn){let c=0;for(let i=0;i<N*N;i++)if(fn(i))c++;return c;}
const has=t=>S.obj.some(o=>o&&o.t===t);
function wallPrice(w){return Math.round((w===1?20:w===2?60:w===3?80:w===4?12:0)*PM());}
function houseValue(){let v=0;for(let i=0;i<N*N;i++){const o=S.obj[i];if(o)v+=OBJ[o.t].p;v+=FLOORS[S.floor[i]].p;v+=wallPrice(S.wall[i]);}return v;}

