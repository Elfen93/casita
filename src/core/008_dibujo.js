// ---------- dibujo ----------
function poly(pts,fill,stroke){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
function prism(x0,y0,x1,y1,z0,z1,col){
  poly([P(x0,y1,z0),P(x1,y1,z0),P(x1,y1,z1),P(x0,y1,z1)],shade(col,.8));
  poly([P(x1,y0,z0),P(x1,y1,z0),P(x1,y1,z1),P(x1,y0,z1)],shade(col,.64));
  poly([P(x0,y0,z1),P(x1,y0,z1),P(x1,y1,z1),P(x0,y1,z1)],col);
}
const faceY=(xa,xb,y,za,zb,col)=>poly([P(xa,y,za),P(xb,y,za),P(xb,y,zb),P(xa,y,zb)],col);
const faceX=(x,ya,yb,za,zb,col)=>poly([P(x,ya,za),P(x,yb,za),P(x,yb,zb),P(x,ya,zb)],col);
function topQuad(x0,y0,x1,y1,z,col){poly([P(x0,y0,z),P(x1,y0,z),P(x1,y1,z),P(x0,y1,z)],col);}
function isoEll(cx,cy,z,r,col){const [x,y]=P(cx,cy,z);ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,r*TW*.7071,r*TH*.7071,0,0,Math.PI*2);ctx.fill();}
function cyl(cx,cy,r,z0,z1,col,topCol){
  const [x,y0]=P(cx,cy,z0),[,y1]=P(cx,cy,z1),rx=r*TW*.7071,ry=r*TH*.7071;
  ctx.fillStyle=shade(col,.75);ctx.beginPath();ctx.ellipse(x,y0,rx,ry,0,0,Math.PI);ctx.lineTo(x-rx,y1);ctx.ellipse(x,y1,rx,ry,0,Math.PI,0,true);ctx.closePath();ctx.fill();
  ctx.fillStyle=topCol||col;ctx.beginPath();ctx.ellipse(x,y1,rx,ry,0,0,Math.PI*2);ctx.fill();
}
function circ(x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function capsule(x1,y1,x2,y2,w,col){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}
function emoji(e,x,y,size){ctx.font=`${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(e,x,y);}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function label(text,x,y,bg,fg,size=12){ctx.font=`900 ${size}px Nunito, sans-serif`;const w=ctx.measureText(text).width+14;ctx.fillStyle=bg;roundRect(x-w/2,y-size*0.9,w,size*1.8,8);ctx.fill();ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x,y+0.5);}
const O_COL=(o,c)=>(o&&o.q!=null&&o.q<=1)?mixHex(c,'#8c8c80',0.35):c;
const hash=i=>{let h=(i*2654435761)>>>0;h=(h^(h>>>15))>>>0;return (h%1000)/1000;};
const toHexC=c=>{if(typeof c!=='string')return '#000000';if(c[0]==='#')return c.length===4?'#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3]:c;const m=c.match(/\d+(\.\d+)?/g);return m?'#'+m.slice(0,3).map(v=>Math.max(0,Math.min(255,+v|0)).toString(16).padStart(2,'0')).join(''):'#000000';};
function mix(a,b,t){a=toHexC(a);b=toHexC(b);const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const r=(A>>16)+((B>>16)-(A>>16))*t,g=((A>>8)&255)+(((B>>8)&255)-((A>>8)&255))*t,bl=(A&255)+((B&255)-(A&255))*t;return `rgb(${r|0},${g|0},${bl|0})`;}
function mixHex(a,b,t){const m=mix(a,b,t).match(/\d+/g).map(Number);return '#'+m.map(v=>v.toString(16).padStart(2,'0')).join('');}
function nightFactor(){const h=S.t/60;if(h>=7&&h<=19)return 0;if(h>19&&h<21)return (h-19)/2;if(h>=5&&h<7)return 1-(h-5)/2;return 1;}

let wallMode=1; // 0 altas, 1 corte, 2 bajas
const WALLICON=['🧱','✂️','▁'];
let preview=null,planWalls=null,planFloors=null,boxAt=-1;
function wallTypeAt(x,y){if(!inb(x,y))return 0;const i=idx(x,y);return S.wall[i]||(preview&&preview.walls.get(i))||(planWalls&&planWalls.get(i))||0;}
function wallTypeAtV(vx,vy){const [x,y]=vc2wc(vx,vy);return wallTypeAt(x,y);}
function prismG(x0,y0,x1,y1,z0,z1,col){
  const fL=(a,b,c,d)=>{const [ax,ay]=P(a,b,z1),[,by]=P(a,b,z0);const g=ctx.createLinearGradient(ax,ay,ax,by);g.addColorStop(0,shade(col,c));g.addColorStop(1,shade(col,d));return g;};
  poly([P(x0,y1,z0),P(x1,y1,z0),P(x1,y1,z1),P(x0,y1,z1)],fL(x0,y1,.86,.7));
  poly([P(x1,y0,z0),P(x1,y1,z0),P(x1,y1,z1),P(x1,y0,z1)],fL(x1,y0,.7,.56));
  poly([P(x0,y0,z1),P(x1,y0,z1),P(x1,y1,z1),P(x0,y1,z1)],col);
}
function wallShape(vx,vy,z0,z1,col,arms,t=0.12){
  const cx=vx+.5,cy=vy+.5;
  if(z1-z0>18&&!wallShape.inCap&&!wallShape.flat){const pr=(a,b,c,d)=>prismG(a,b,c,d,z0,z1-1.5,col);
    if(arms.U)pr(cx-t,vy,cx+t,cy-t);if(arms.L)pr(vx,cy-t,cx-t,cy+t);pr(cx-t,cy-t,cx+t,cy+t);if(arms.R)pr(cx+t,cy-t,vx+1,cy+t);if(arms.D)pr(cx-t,cy+t,cx+t,vy+1);
    wallShape.inCap=true;wallShape(vx,vy,z1-1.5,z1,shade(col,1.07),arms,t+0.005);wallShape.inCap=false;return;}
  if(z1-z0>8&&!wallShape.inCap){wallShape.inCap=true;wallShape(vx,vy,z0,z1-1.5,col,arms,t);wallShape(vx,vy,z1-1.5,z1,shade(col,1.07),arms,t+0.005);wallShape.inCap=false;return;}
  if(arms.U) prism(cx-t,vy,cx+t,cy-t,z0,z1,col);
  if(arms.L) prism(vx,cy-t,cx-t,cy+t,z0,z1,col);
  prism(cx-t,cy-t,cx+t,cy+t,z0,z1,col);
  if(arms.R) prism(cx+t,cy-t,vx+1,cy+t,z0,z1,col);
  if(arms.D) prism(cx-t,cy+t,cx+t,vy+1,z0,z1,col);
}
function isCut(vx,vy){
  if(wallMode===2)return true;if(wallMode===0)return false;
  for(const [a,b] of [[vx-1,vy],[vx,vy-1]]){const [x,y]=vc2wc(a,b);if(inb(x,y)&&roomId[idx(x,y)]>=0)return true;}
  return false;
}
function armsAt(vx,vy){const a={L:!!wallTypeAtV(vx-1,vy),R:!!wallTypeAtV(vx+1,vy),U:!!wallTypeAtV(vx,vy-1),D:!!wallTypeAtV(vx,vy+1)};if(!a.L&&!a.R&&!a.U&&!a.D)a.L=a.R=true;return a;}

