function paintPortrait(c,ch,md=65,nobg){
  const x=c.getContext('2d'),k=c.width/100;x.setTransform(k,0,0,k,0,0);x.clearRect(0,0,100,100);
  const skin=ch.skin,hair=ch.hair,bw=(BUILDS[ch.build]||BUILDS.media)[1],fem=ch.g==='f',st=ch.style,old=(ch.age||27)>=45;
  const E=(cx,cy,rx,ry,col,r=0)=>{x.fillStyle=col;x.beginPath();x.ellipse(cx,cy,rx,ry,r,0,Math.PI*2);x.fill();};
  const HG=(y0,y1)=>{const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(hair,1.3));g.addColorStop(1,shade(hair,.82));return g;};
  if(!nobg){x.save();x.beginPath();x.arc(50,50,50,0,Math.PI*2);x.clip();const bg=x.createLinearGradient(0,0,0,100);bg.addColorStop(0,'#fde9d8');bg.addColorStop(1,'#e6dcf3');x.fillStyle=bg;x.fillRect(0,0,100,100);}
  // pelo de atrás: masa con volumen que cae por detrás de los hombros
  const strands=(pts,a=.35)=>{x.strokeStyle=shade(hair,.62);x.globalAlpha=a;x.lineWidth=.7;x.lineCap='round';for(const p of pts){x.beginPath();x.moveTo(p[0],p[1]);x.bezierCurveTo(p[2],p[3],p[4],p[5],p[6],p[7]);x.stroke();}x.globalAlpha=1;};
  if(st==='melena'||st==='media'){const lo=st==='melena'?92:70;x.fillStyle=HG(15,lo);x.beginPath();x.moveTo(50,13);x.bezierCurveTo(22,13,20,40,23,58);x.bezierCurveTo(25,72,20,lo-6,26,lo);x.quadraticCurveTo(38,lo+4,44,lo-4);x.lineTo(56,lo-4);x.quadraticCurveTo(62,lo+4,74,lo);x.bezierCurveTo(80,lo-6,75,72,77,58);x.bezierCurveTo(80,40,78,13,50,13);x.fill();
    strands([[28,40,24,58,27,72,29,lo-4],[72,40,76,58,73,72,71,lo-4],[33,46,30,62,33,74,35,lo-6],[67,46,70,62,67,74,65,lo-6]]);}
  else if(st==='afro'){x.fillStyle=HG(6,70);x.beginPath();x.ellipse(50,38,33,30,0,0,Math.PI*2);x.fill();for(let i=0;i<22;i++){const a=i/22*Math.PI*2;E(50+Math.cos(a)*31,38+Math.sin(a)*28,6,6,i%2?shade(hair,1.12):shade(hair,.92));}}
  else if(st==='rizos'){for(let i=0;i<18;i++){const a=Math.PI*(1.02+i/17*0.96);E(50+Math.cos(a)*25,40+Math.sin(a)*24,7.5,7.5,i%2?shade(hair,1.1):hair);}for(let i=0;i<7;i++){E(26+(i%2)*3,48+i*4,6.5,6.5,i%2?hair:shade(hair,1.08));E(74-(i%2)*3,48+i*4,6.5,6.5,i%2?shade(hair,1.08):hair);}}
  else if(st==='coleta'){x.fillStyle=HG(30,80);x.beginPath();x.moveTo(70,40);x.bezierCurveTo(84,48,82,68,76,82);x.bezierCurveTo(72,70,70,56,64,46);x.closePath();x.fill();strands([[71,44,79,56,79,68,76,78]]);}
  else if(st==='mono'){x.fillStyle=HG(4,26);x.beginPath();x.ellipse(50,15,11,9.5,0,0,Math.PI*2);x.fill();strands([[41,14,45,8,55,8,59,14],[42,18,47,12,54,12,58,18]],.4);}
  // hombros y camiseta
  const sw=(fem?29:34)*bw;const sg=x.createLinearGradient(50-sw,0,50+sw,0);sg.addColorStop(0,shade(ch.shirt,1.12));sg.addColorStop(1,shade(ch.shirt,.78));
  x.fillStyle=shade(skin,.85);x.fillRect(42,58,16,20);
  x.fillStyle=sg;x.beginPath();x.moveTo(50-sw-8,104);x.quadraticCurveTo(50-sw-2,79,40,75);x.quadraticCurveTo(50,86,60,75);x.quadraticCurveTo(50+sw+2,79,50+sw+8,104);x.closePath();x.fill();
  x.fillStyle='rgba(0,0,0,.12)';x.beginPath();x.moveTo(41,75.5);x.quadraticCurveTo(50,86,59,75.5);x.quadraticCurveTo(50,82,41,75.5);x.fill();
  // orejas y cara
  E(31.5,50,3.6,5.6,shade(skin,.88));E(68.5,50,3.6,5.6,shade(skin,.88));
  const fg=x.createRadialGradient(46,42,3,50,50,26);fg.addColorStop(0,shade(skin,1.08));fg.addColorStop(1,shade(skin,.86));x.fillStyle=fg;
  const jw=fem?0:2;x.beginPath();x.moveTo(32,44);x.bezierCurveTo(31,20,69,20,68,44);x.bezierCurveTo(68,58+jw,60,70,50,71);x.bezierCurveTo(40,70,32,58+jw,32,44);x.fill();
  if(old){x.strokeStyle='rgba(120,70,60,.25)';x.lineWidth=.7;x.beginPath();x.moveTo(38,58);x.quadraticCurveTo(40,62,43,63);x.moveTo(62,58);x.quadraticCurveTo(60,62,57,63);x.moveTo(41,36);x.lineTo(46,35.5);x.moveTo(54,35.5);x.lineTo(59,36);x.stroke();}
  // barba
  if(ch.beard&&ch.beard!=='no'){x.fillStyle=ch.beard==='sombra'?'rgba(40,30,30,.18)':shade(hair,.9);
    if(ch.beard==='bigote'){x.beginPath();x.moveTo(42,60);x.quadraticCurveTo(50,56,58,60);x.quadraticCurveTo(50,59,42,60);x.fill();}
    else{const by=ch.beard==='larga'?84:73;x.beginPath();x.moveTo(32,48);x.quadraticCurveTo(33,by,50,by);x.quadraticCurveTo(67,by,68,48);x.lineTo(65,52);x.quadraticCurveTo(62,62,57,60);x.quadraticCurveTo(50,57,43,60);x.quadraticCurveTo(38,62,35,52);x.closePath();x.fill();}}
  // ojos
  const eyeY=48;for(const ex of [41.5,58.5]){E(ex,eyeY,4.2,2.7,'#fbfaf7');E(ex+.3,eyeY,2.3,2.3,ch.eyes||'#3b2a20');E(ex+.3,eyeY,1.1,1.1,'#111');E(ex+1,eyeY-.9,.7,.7,'rgba(255,255,255,.95)');
    x.strokeStyle='rgba(40,25,25,.85)';x.lineWidth=fem?1.2:.9;x.beginPath();x.ellipse(ex,eyeY,4.2,2.7,0,Math.PI*1.02,Math.PI*1.98);x.stroke();
    if(fem){x.beginPath();x.moveTo(ex+3.8,eyeY-1.4);x.lineTo(ex+5,eyeY-2.4);x.stroke();}}
  // cejas
  const sad=md<35?2:0,happy=md>70?-.6:0;x.strokeStyle=shade(hair,.65);x.lineCap='round';x.lineWidth=fem?1.5:2.3;
  x.beginPath();x.moveTo(36.5,43+happy);x.quadraticCurveTo(41,40.5+happy,45.5,42-sad);x.moveTo(54.5,42-sad);x.quadraticCurveTo(59,40.5+happy,63.5,43+happy);x.stroke();
  // nariz
  x.strokeStyle=shade(skin,.68);x.lineWidth=1;x.beginPath();x.moveTo(50,49);x.quadraticCurveTo(48,55,47.5,56.5);x.quadraticCurveTo(50,58.5,53,56.5);x.stroke();
  // mejillas
  x.fillStyle=`rgba(230,110,100,${fem?.16:.08})`;E(39,57,4,2.4,x.fillStyle);E(61,57,4,2.4,x.fillStyle);
  // boca
  const lip=fem?'#c2574f':shade(skin,.6);x.strokeStyle=lip;x.lineWidth=1.6;x.beginPath();
  if(md>68){x.moveTo(43.5,62);x.quadraticCurveTo(50,67.5,56.5,62);x.stroke();if(fem){x.fillStyle=shade(lip,1.1);x.beginPath();x.moveTo(44.5,62.6);x.quadraticCurveTo(50,66.8,55.5,62.6);x.quadraticCurveTo(50,64.3,44.5,62.6);x.fill();}}
  else if(md>38){x.moveTo(45,63);x.quadraticCurveTo(50,64.3,55,63);x.stroke();}
  else{x.moveTo(45,64.5);x.quadraticCurveTo(50,61.5,55,64.5);x.stroke();}
  // pelo de delante: casco con raya, flequillo y mechones que enmarcan la cara
  if(st!=='calvo'){x.fillStyle=HG(14,48);if(st==='rapado')x.globalAlpha=.45;
    x.beginPath();x.moveTo(30,50);x.bezierCurveTo(26,30,32,14,50,13);x.bezierCurveTo(68,14,74,30,70,50);
    if(st==='corto'||st==='rapado'){x.bezierCurveTo(69,40,67,33,62,31);x.bezierCurveTo(55,33,46,28,40,30);x.bezierCurveTo(35,32,32,38,30,50);}
    else if(st==='rizos'||st==='afro'){x.bezierCurveTo(68,38,64,32,60,30);for(let i=0;i<5;i++){const xx=58-i*4.5;x.quadraticCurveTo(xx-1,34,xx-4,29);}x.bezierCurveTo(34,32,31,40,30,50);}
    else if(st==='coleta'||st==='mono'){x.bezierCurveTo(69,36,63,27,52,26);x.bezierCurveTo(42,26,33,33,30,50);}
    else{x.bezierCurveTo(70,38,64,26,54,27);x.bezierCurveTo(46,33,38,33,33,37);x.quadraticCurveTo(31,42,30,50);}
    x.closePath();x.fill();x.globalAlpha=1;
    if(st==='melena'||st==='media'){const lo=st==='melena'?86:68;x.fillStyle=HG(28,lo);
      x.beginPath();x.moveTo(31,34);x.bezierCurveTo(27,48,30,62,27,lo);x.quadraticCurveTo(31,lo-2,34,lo-8);x.bezierCurveTo(35,60,33,48,36,38);x.closePath();x.fill();
      x.beginPath();x.moveTo(69,34);x.bezierCurveTo(73,48,70,62,73,lo);x.quadraticCurveTo(69,lo-2,66,lo-8);x.bezierCurveTo(65,60,67,48,64,38);x.closePath();x.fill();
      strands([[33,38,30,50,32,62,30,lo-4],[67,38,70,50,68,62,70,lo-4]],.4);}
    if(st!=='rapado'){strands([[54,15,48,18,40,24,34,34],[56,16,62,19,67,26,68,36],[50,14,46,20,44,26,46,30]],.32);
      x.fillStyle='rgba(255,255,255,.22)';x.beginPath();x.ellipse(45,20,9,2.6,-0.35,0,Math.PI*2);x.fill();}}
  else{x.fillStyle=shade(hair,.9);x.globalAlpha=.4;E(31,46,2.6,6,x.fillStyle);E(69,46,2.6,6,x.fillStyle);x.globalAlpha=1;}
  if(ch.glasses){x.strokeStyle='#2b2b33';x.lineWidth=1.4;x.beginPath();x.ellipse(41.5,48,6.2,4.8,0,0,Math.PI*2);x.moveTo(64.7,48);x.ellipse(58.5,48,6.2,4.8,0,0,Math.PI*2);x.moveTo(47.7,47);x.quadraticCurveTo(50,45.8,52.3,47);x.moveTo(35.3,47);x.lineTo(31,46);x.moveTo(64.7,47);x.lineTo(69,46);x.stroke();x.fillStyle='rgba(200,230,255,.12)';E(41.5,48,6,4.6,x.fillStyle);E(58.5,48,6,4.6,x.fillStyle);}
  if(!nobg)x.restore();
}

