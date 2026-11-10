// ---------- orejas ----------
function ears(x,c,g){const s=c.skin,f=g.f;const sz=4.6+(f.orejas-.5)*1.6;const y=g.eyeY+3.5;
  for(const sd of [-1,1]){const ex=g.cx+sd*(g.fw*.97);
    const eg=x.createRadialGradient(ex+sd*1,y,1,ex+sd*1.5,y,sz*1.4);eg.addColorStop(0,mul(s,.8));eg.addColorStop(1,mul(s,.97));
    x.fillStyle=eg;x.beginPath();x.moveTo(ex,y-sz);x.bezierCurveTo(ex+sd*sz*.9,y-sz*1.25,ex+sd*sz*1.05,y-sz*.2,ex+sd*sz*.75,y+sz*.5);x.bezierCurveTo(ex+sd*sz*.5,y+sz*1.15,ex+sd*sz*.1,y+sz*1.3,ex-sd*.3,y+sz*.9);x.closePath();x.fill();
    x.strokeStyle=mul(s,.65,.7);x.lineWidth=.55;x.beginPath();x.moveTo(ex+sd*.6,y-sz*.6);x.bezierCurveTo(ex+sd*sz*.75,y-sz*.85,ex+sd*sz*.75,y,ex+sd*sz*.4,y+sz*.4);x.stroke();
    E(x,ex+sd*sz*.3,y+sz*.05,sz*.18,sz*.3,mul(s,.6,.6));
    if(c.earrings){E(x,ex+sd*sz*.25,y+sz*1.25,.9,.9,'#e6c35c');if(c.earrings==='aro'){x.strokeStyle='#d9b24a';x.lineWidth=.6;x.beginPath();x.arc(ex+sd*sz*.25,y+sz*1.25+2.2,2.2,0,7);x.stroke();}}
  }}

