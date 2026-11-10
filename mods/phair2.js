  // pelo de delante
  if(st!=='calvo'){x.fillStyle=HG(14,48);if(st==='rapado')x.globalAlpha=.45;
    x.beginPath();x.moveTo(30.5,47);x.bezierCurveTo(26,13,74,13,69.5,47);
    if(st==='corto'||st==='rapado'){x.quadraticCurveTo(67,33,61,29.5);x.lineTo(57,32.5);x.lineTo(52,28.5);x.lineTo(47,32);x.lineTo(42,29.5);x.quadraticCurveTo(34,33,30.5,47);}
    else if(st==='rizos'||st==='afro'){for(let i=0;i<7;i++){const xx=68-i*6;x.quadraticCurveTo(xx-1,34,xx-4,29.5);}x.lineTo(30.5,47);}
    else if(st==='coleta'||st==='mono'){x.quadraticCurveTo(66,28,50,26.8);x.quadraticCurveTo(34,28,30.5,47);}
    else{x.quadraticCurveTo(69,31,58,27.5);x.bezierCurveTo(50,30,40,32,33,42);x.quadraticCurveTo(31,44,30.5,47);}
    x.closePath();x.fill();x.globalAlpha=1;
    if(st!=='rapado'){x.strokeStyle=shade(hair,.66);x.globalAlpha=.4;x.lineWidth=.8;x.beginPath();
      if(st==='coleta'||st==='mono'){for(const dx of [-12,-5,3,10]){x.moveTo(50+dx,27);x.quadraticCurveTo(50+dx*1.25,20,50+dx*.6,15);}}
      else if(st==='melena'||st==='media'){x.moveTo(60,22);x.quadraticCurveTo(48,25,37,38);x.moveTo(64,26);x.quadraticCurveTo(52,29,41,36);x.moveTo(56,19);x.quadraticCurveTo(44,22,33,34);}
      else{x.moveTo(40,22);x.quadraticCurveTo(48,18,60,22);x.moveTo(36,28);x.quadraticCurveTo(50,22,64,28);}
      x.stroke();x.globalAlpha=1;}
    if(st==='melena'||st==='media'){const yb=st==='melena'?88:72;x.fillStyle=HG(30,yb);
      x.beginPath();x.moveTo(31.5,38);x.bezierCurveTo(26,52,26,70,28,yb);x.quadraticCurveTo(32,yb-6,35,yb-18);x.bezierCurveTo(34,62,33,50,36,40);x.closePath();x.fill();
      x.beginPath();x.moveTo(68.5,36);x.bezierCurveTo(74,52,74,70,72,yb);x.quadraticCurveTo(68,yb-6,65,yb-18);x.bezierCurveTo(66,62,67,50,64.5,40);x.closePath();x.fill();}
    if(st==='afro'||st==='rizos')for(let i=0;i<7;i++)E(32+i*6,26-Math.sin(i/6*Math.PI)*6,5.5,5,i%2?shade(hair,1.12):hair);
    x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.ellipse(45,21,9,2.4,-0.25,0,Math.PI*2);x.fill();}
