// ---------- fondo, cuerpo ----------
function back(x,c){const g=x.createRadialGradient(42,30,5,50,50,75);g.addColorStop(0,c.bg1||'#f7ecdf');g.addColorStop(1,c.bg2||'#d9cfe6');x.fillStyle=g;x.fillRect(0,0,100,100);}
function body(x,c,g){const s=c.skin,sh=c.shirt||'#5b7fa6';const {cx}=g;const w=g.fem?27:31;const nw=g.fem?6:7.6;if(c.of)ofPorBack(x,c,g,w,nw);
  // cuello
  const ng=x.createLinearGradient(0,g.chinY-6,0,g.chinY+16);ng.addColorStop(0,mul(s,.62));ng.addColorStop(.45,mul(s,.86));ng.addColorStop(1,mul(s,.95));
  x.fillStyle=ng;x.beginPath();x.moveTo(cx-nw,g.chinY-10);x.bezierCurveTo(cx-nw,g.chinY+6,cx-nw-1,g.chinY+10,cx-nw-4,g.chinY+16);x.lineTo(cx+nw+4,g.chinY+16);x.bezierCurveTo(cx+nw+1,g.chinY+10,cx+nw,g.chinY+6,cx+nw,g.chinY-10);x.fill();
  if(!g.fem){x.strokeStyle=mul(s,.75,.5);x.lineWidth=.5;x.beginPath();x.moveTo(cx-1,g.chinY+5);x.quadraticCurveTo(cx,g.chinY+7,cx+1,g.chinY+5);x.stroke();}
  // hombros y camiseta
  const y0=g.chinY+13;const bg=x.createLinearGradient(cx-w,0,cx+w,0);bg.addColorStop(0,mul(sh,1.08));bg.addColorStop(.55,sh);bg.addColorStop(1,mul(sh,.68));
  x.fillStyle=bg;x.beginPath();x.moveTo(cx-w-8,101);x.bezierCurveTo(cx-w-6,y0+8,cx-w+2,y0+2,cx-nw-6,y0-1);x.quadraticCurveTo(cx,y0+(c.cuello==='pico'?10:5),cx+nw+6,y0-1);x.bezierCurveTo(cx+w-2,y0+2,cx+w+6,y0+8,cx+w+8,101);x.fill();
  // escote / cuello de la camiseta
  x.fillStyle=mul(s,.9);x.beginPath();x.moveTo(cx-nw-5.4,y0-.6);x.quadraticCurveTo(cx,y0+(c.cuello==='pico'?9:4.4),cx+nw+5.4,y0-.6);x.quadraticCurveTo(cx,y0-2,cx-nw-5.4,y0-.6);x.fill();
  x.strokeStyle=mul(sh,.7);x.lineWidth=1.1;x.beginPath();x.moveTo(cx-nw-6,y0-1);x.quadraticCurveTo(cx,y0+(c.cuello==='pico'?10:5),cx+nw+6,y0-1);x.stroke();
  // clavículas
  x.strokeStyle=mul(s,.72,.35);x.lineWidth=.6;x.beginPath();x.moveTo(cx-3,y0+1.5);x.quadraticCurveTo(cx-8,y0,cx-12,y0+.4);x.moveTo(cx+3,y0+1.5);x.quadraticCurveTo(cx+8,y0,cx+12,y0+.4);x.stroke();
  // pliegues
  x.strokeStyle=mul(sh,.8,.5);x.lineWidth=.6;x.beginPath();x.moveTo(cx-w+2,y0+10);x.quadraticCurveTo(cx-w+6,y0+16,cx-w+5,101);x.moveTo(cx+w-4,y0+9);x.quadraticCurveTo(cx+w-7,y0+16,cx+w-5,101);x.stroke();
  if(c.of)ofPorFront(x,c,g,w,nw,y0);
}

