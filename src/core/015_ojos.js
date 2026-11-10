// ---------- ojos ----------
const OJOS={almendra:{h:3.1,tilt:.5,lid:.55},redondos:{h:4,tilt:0,lid:.35},caidos:{h:3.2,tilt:-1.1,lid:.75},rasgados:{h:2.4,tilt:1.4,lid:.85},encapotados:{h:2.8,tilt:.2,lid:1}};
function eyes(x,c,g){const f=g.f,T=OJOS[f.ojos]||OJOS.almendra;const w=4.4+(f.tamOjos-.5)*1.4,h=T.h*(.85+f.tamOjos*.3);
  const exp=f.expresion;const s=c.skin;
  for(const sd of [-1,1]){const ex=g.cx+sd*g.eyeDX,ey=g.eyeY+(exp==='cansada'?.4:0);
    const inX=ex-sd*w,outX=ex+sd*w,inY=ey+.2,outY=ey-T.tilt*.6;
    const hh=h*(exp==='sonrisa'?.8:exp==='cansada'?.75:1);
    const top=()=>{x.moveTo(inX,inY);x.bezierCurveTo(ex-sd*w*.55,ey-hh*1.05,ex+sd*w*.35,ey-hh*1.1,outX,outY);};
    const bot=()=>{x.bezierCurveTo(ex+sd*w*.45,ey+hh*.55,ex-sd*w*.4,ey+hh*.6,inX,inY);};
    // párpado superior (sombra/maquillaje)
    if(c.makeup){const mg=x.createRadialGradient(ex+sd*1,ey-2.5,.5,ex+sd*1,ey-2.5,6);mg.addColorStop(0,c.makeupCol||'rgba(140,90,120,.45)');mg.addColorStop(1,'rgba(140,90,120,0)');x.fillStyle=mg;x.fillRect(ex-8,ey-9,16,12);}
    // blanco del ojo
    x.save();x.beginPath();top();bot();x.closePath();
    const wg=x.createRadialGradient(ex,ey,.5,ex,ey,w*1.1);wg.addColorStop(0,'#fbf8f3');wg.addColorStop(.7,'#ece4dc');wg.addColorStop(1,'#cdb9ad');x.fillStyle=wg;x.fill();x.clip();
    // iris
    const ix=ex+sd*.15,iy=ey+.15,ir=2.25+(f.tamOjos-.5)*.4;
    const ig=x.createRadialGradient(ix,iy,.3,ix,iy,ir);ig.addColorStop(0,mul(c.eyes,1.6));ig.addColorStop(.55,c.eyes);ig.addColorStop(.9,mul(c.eyes,.55));ig.addColorStop(1,mul(c.eyes,.3));
    E(x,ix,iy,ir,ir,ig);
    x.strokeStyle=mul(c.eyes,1.9,.35);x.lineWidth=.18;x.beginPath();for(let a=0;a<6.28;a+=.45){x.moveTo(ix+Math.cos(a)*.9,iy+Math.sin(a)*.9);x.lineTo(ix+Math.cos(a)*ir*.85,iy+Math.sin(a)*ir*.85);}x.stroke();
    E(x,ix,iy,ir*.42,ir*.42,'#0d0909');
    // sombra del párpado sobre el ojo
    const sg=x.createLinearGradient(0,ey-hh,0,ey+.5);sg.addColorStop(0,'rgba(60,30,25,.5)');sg.addColorStop(1,'rgba(60,30,25,0)');x.fillStyle=sg;x.fillRect(ex-w-1,ey-hh-1,w*2+2,hh+1.5);
    E(x,ix-ir*.35,iy-ir*.38,.62,.55,'rgba(255,255,255,.95)');E(x,ix+ir*.4,iy+ir*.35,.28,.28,'rgba(255,255,255,.6)');
    x.restore();
    // línea superior (pestañas)
    x.strokeStyle='#1b1212';x.lineCap='round';x.lineWidth=g.fem||c.makeup?.95:.7;x.beginPath();top();x.stroke();
    if(c.makeup){x.lineWidth=.8;x.beginPath();x.moveTo(outX,outY);x.lineTo(outX+sd*1.6,outY-1.1);x.stroke();}
    if(g.fem){x.lineWidth=.22;x.strokeStyle='rgba(27,18,18,.75)';x.beginPath();for(let i=0;i<5;i++){const t=.55+i*.1;const px=inX+(outX-inX)*t,py=inY+(outY-inY)*t-hh*Math.sin(Math.PI*t)*1.0;x.moveTo(px,py);x.lineTo(px+sd*(.3+t*.6),py-.6-t*.3);}x.stroke();}
    // línea inferior
    x.strokeStyle=mul(s,.55,.55);x.lineWidth=.35;x.beginPath();x.moveTo(outX,outY);bot();x.stroke();
    // lagrimal
    E(x,inX+sd*.5,inY+.1,.55,.4,'rgba(210,130,125,.8)');
    // pliegue del párpado
    const lid=T.lid;x.strokeStyle=mul(s,.55,.5);x.lineWidth=.42;x.beginPath();x.moveTo(inX+sd*.6,inY-1.2-lid*.3);x.bezierCurveTo(ex-sd*w*.4,ey-hh-1.6+lid*.8,ex+sd*w*.4,ey-hh-1.7+lid*.8,outX-sd*.4,outY-1.4+lid*.4);x.stroke();
    if(f.ojos==='encapotados'){x.fillStyle=mul(s,.95);x.beginPath();x.moveTo(ex-sd*w*.2,ey-hh-.6);x.quadraticCurveTo(ex+sd*w*.6,ey-hh-.4,outX+sd*.6,outY+.1);x.quadraticCurveTo(ex+sd*w*.5,ey-hh+.6,ex-sd*w*.2,ey-hh-.6);x.fill();}
    if(exp==='sonrisa'){x.strokeStyle=mul(s,.6,.5);x.lineWidth=.4;x.beginPath();x.moveTo(ex-sd*w*.6,ey+hh*.9);x.quadraticCurveTo(ex,ey+hh*1.4,ex+sd*w*.8,ey+hh*.7);x.stroke();}
  }}

