  // pelo de atrás
  {const g=HG(15,98);x.fillStyle=g;
  if(st==='melena'){x.beginPath();x.moveTo(30,30);x.bezierCurveTo(17,46,19,78,25,95);x.quadraticCurveTo(50,103,75,95);x.bezierCurveTo(81,78,83,46,70,30);x.closePath();x.fill();}
  else if(st==='media'){x.beginPath();x.moveTo(30,30);x.bezierCurveTo(19,44,20,64,26,75);x.quadraticCurveTo(50,81,74,75);x.bezierCurveTo(80,64,81,44,70,30);x.closePath();x.fill();}
  else if(st==='afro'){E(50,40,32,29,shade(hair,.95));for(let i=0;i<18;i++){const a=i/18*Math.PI*2;E(50+Math.cos(a)*30,40+Math.sin(a)*27,6,6,i%2?shade(hair,1.08):shade(hair,.92));}}
  else if(st==='rizos'){for(let i=0;i<22;i++){const a=Math.PI*(0.95+i/21*1.1);const r=23+(i%3)*2;E(50+Math.cos(a)*r,46+Math.sin(a)*r*0.95,7,7,i%2?shade(hair,1.12):hair);}for(let i=0;i<8;i++)E(i<4?27-i%2*2:73+i%2*2,52+(i%4)*6,6.5,6.5,i%2?hair:shade(hair,1.1));}
  else if(st==='coleta'){x.beginPath();x.moveTo(66,38);x.bezierCurveTo(80,44,82,64,76,78);x.bezierCurveTo(72,66,70,52,62,44);x.closePath();x.fill();}
  else if(st==='mono'){E(50,14,10,8.5,HG(5,23));x.strokeStyle=shade(hair,.7);x.lineWidth=.9;x.beginPath();x.arc(50,14,5,0.3,4.5);x.stroke();}
  if(st==='melena'||st==='media'){x.strokeStyle=shade(hair,.7);x.globalAlpha=.35;x.lineWidth=.8;x.beginPath();for(const dx of [-22,-17,17,22]){x.moveTo(50+dx*.7,34);x.quadraticCurveTo(50+dx*1.3,60,50+dx*1.05,st==='melena'?92:72);}x.stroke();x.globalAlpha=1;}}
