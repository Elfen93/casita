// ---------- papeles pintados: dibujo encima de las caras de la pared ----------
let _WP=null;
{const _dw=drawWall;drawWall=function(vx,vy,i,type,ghost){const W=!ghost&&i!=null&&WALLCOLS[S.wcol[i]||0];_WP=W&&W[2]&&(type===1||type===3)?W:null;try{_dw(vx,vy,i,type,ghost);}finally{_WP=null;}};}
function wpFace(pts,u0,u1,z0,z1,face,W){ // pts: 4 esquinas; u: coordenada a lo largo de la cara (vista)
  ctx.save();ctx.beginPath();ctx.moveTo(...pts[0]);for(const p of pts.slice(1))ctx.lineTo(...p);ctx.closePath();ctx.clip();
  const pt=(u,z)=>face(u,z),col=W[3],kind=W[2];ctx.fillStyle=col;ctx.strokeStyle=col;
  if(kind==='rayas'){for(let u=Math.floor(u0*8)/8;u<u1;u+=.125){poly([pt(u,z0),pt(u+.05,z0),pt(u+.05,z1),pt(u,z1)],col);}}
  else if(kind==='azulejo'){ctx.lineWidth=.8;ctx.beginPath();for(let u=Math.floor(u0*5)/5;u<=u1;u+=.2){const [a,b]=pt(u,z0),[c,d]=pt(u,Math.min(z1,34));ctx.moveTo(a,b);ctx.lineTo(c,d);}for(let z=z0;z<=Math.min(z1,34);z+=6){const [a,b]=pt(u0,z),[c,d]=pt(u1,z);ctx.moveTo(a,b);ctx.lineTo(c,d);}ctx.stroke();if(z1>34){poly([pt(u0,34),pt(u1,34),pt(u1,36),pt(u0,36)],col);}}
  else if(kind==='rombos'){ctx.lineWidth=.8;ctx.beginPath();for(let u=Math.floor(u0*4)/4-.5;u<u1+.5;u+=.25){const [a,b]=pt(u,z0),[c,d]=pt(u+.5,z1),[e,f]=pt(u+.5,z0),[g,h]=pt(u,z1);ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.moveTo(e,f);ctx.lineTo(g,h);}ctx.stroke();}
  else if(kind==='cuadros'){for(let u=Math.floor(u0*5)/5;u<u1;u+=.2)poly([pt(u,z0),pt(u+.07,z0),pt(u+.07,z1),pt(u,z1)],'rgba(150,110,190,.35)');for(let z=z0+3;z<z1;z+=9)poly([pt(u0,z),pt(u1,z),pt(u1,z+3),pt(u0,z+3)],'rgba(150,110,190,.35)');}
  else{for(let u=Math.floor(u0*6)/6;u<u1+.1;u+=1/6)for(let z=z0+4,r=0;z<z1;z+=9,r++){const uu=u+(r%2)/12;const [x,y]=pt(uu,z);
    if(kind==='lunares')circ(x,y,1.6,col);
    else if(kind==='flores'){for(let k=0;k<5;k++){const t=k/5*Math.PI*2;circ(x+Math.cos(t)*1.6,y+Math.sin(t)*1.6,1.1,col);}circ(x,y,.9,'#f6c453');}
    else if(kind==='hojas'){ctx.save();ctx.translate(x,y);ctx.rotate((r%2?.6:-.6));ctx.beginPath();ctx.ellipse(0,0,1.6,3.6,0,0,Math.PI*2);ctx.fill();ctx.restore();}}}
  ctx.restore();}
{const _pg=prismG;prismG=function(x0,y0,x1,y1,z0,z1,col){_pg(x0,y0,x1,y1,z0,z1,col);const W=_WP;if(!W||col!==W[0])return;
  ctx.save();ctx.globalAlpha*=0.85;
  wpFace([P(x0,y1,z0),P(x1,y1,z0),P(x1,y1,z1),P(x0,y1,z1)],x0,x1,z0,z1,(u,z)=>P(u,y1,z),W);
  wpFace([P(x1,y0,z0),P(x1,y1,z0),P(x1,y1,z1),P(x1,y0,z1)],y0,y1,z0,z1,(u,z)=>P(x1,u,z),W);
  ctx.restore();};}


