// =================== UNA CLASE DE VERDAD: al ir a clase se entra en un aula del centro de adultos, con pizarra, profe y compañeras ===================
SCENES['aula']=function(E){const {tt,night}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});const W=10,D=8,WH=62;
  const C=typeof ED==='function'?ED().cur:null;const Pg=C&&EDU_PROGS[C.k];const subj=Pg?Pg.n:'Clase';const h=S.t/60;
  const ns=NPCS();const who=k=>ns[(k*7+2)%Math.max(1,ns.length)];
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#cfc8b8');topQuad(0,0,W,D,0,'#d9d2c2');
    ctx.strokeStyle='rgba(0,0,0,.05)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W;k++){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=1;k<D;k++){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}ctx.stroke();
    sBox(0,-.15,W,0,0,WH,'#e8e1cf');sBox(-.15,-.15,0,D,0,WH,'#e1d9c5');
    // zócalo
    poly([P(0,0,0),P(W,0,0),P(W,0,10),P(0,0,10)],'#9fb7c9');poly([P(0,0,0),P(0,D,0),P(0,D,10),P(0,0,10)],'#93abbd');
    // pizarra en la pared del fondo
    poly([P(2,0,22),P(8,0,22),P(8,0,48),P(2,0,48)],'#6b4a2e');poly([P(2.15,0,23.5),P(7.85,0,23.5),P(7.85,0,46.5),P(2.15,0,46.5)],'#2f4a3a');
    gText(5,0,42,subj.length>28?subj.slice(0,27)+'…':subj,'#f1efe6',5.5,false);
    const L=[['Tema '+(1+(S.day%9)),'#e9e6da'],['Para el jueves: ejercicios 3-7','#e9e6da'],['Examen: '+(10+S.day%18)+' de '+MONTHS[(dateOf(S.day).m+1)%12].toLowerCase(),'#f5d76e']];L.forEach(([t,c],k)=>gText(5,0,35.5-k*5,t,c,4,false));
    poly([P(2.3,0,22),P(7.7,0,22),P(7.7,.25,22),P(2.3,.25,22)],'#8a6a48');
    // reloj y corcho en la pared izquierda
    const [cx,cy]=P(0,1.6,52);ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(cx,cy,4,4.6,0,0,7);ctx.fill();ctx.strokeStyle='#333';ctx.lineWidth=.8;ctx.stroke();ctx.beginPath();ctx.moveTo(cx,cy);const a=(h%12)/12*6.283-1.57;ctx.lineTo(cx+Math.cos(a)*2.2,cy+Math.sin(a)*2.6);ctx.moveTo(cx,cy);const b=(S.t%60)/60*6.283-1.57;ctx.lineTo(cx+Math.cos(b)*3.4,cy+Math.sin(b)*3.8);ctx.stroke();
    poly([P(0,3,24),P(0,6.5,24),P(0,6.5,44),P(0,3,44)],'#b88c5a');for(let k=0;k<6;k++){const y0=3.3+(k%3)*1.05,z0=27+(k>2?8:0);poly([P(0,y0,z0),P(0,y0+.8,z0),P(0,y0+.8,z0+6),P(0,y0,z0+6)],['#fff','#f7e08a','#bfe3f5','#f6c1c1','#fff','#d5f5c8'][k]);}
    gText(0,4.75,46.5,'Centro de Educación de Adultos','#5a4e3a',2.6,true);
    // ventanas a la derecha (fondo)
    for(let k=0;k<2;k++){const x0=8.4+k*0,y0=0;}
  };
  const decor=()=>{};
  // mesa de la profe
  add(8.6,1.6,()=>{sBox(7.6,1.1,9.4,2.0,0,18,'#8a6a48');sTop(7.6,1.1,9.4,2.0,18.5,'#a78560');sBox(8.0,1.3,8.5,1.7,18.5,21,'#e6e1d3');});
  // la profe, delante de la pizarra: explica y a ratos escribe
  const tph=(tt*.25)%2;add(6.4,1.2,()=>sPerson(tph<1?6.4:4.2,1.0,{...who(1),style:'media',hair:'#5a3c2a'},{pose:'stand',act:tph<1?'cheer':null,front:tph<1,right:true,shirt:'#7a5fa0'}));
  // pupitres en 3 filas
  const seats=[];for(let r=0;r<3;r++)for(let c=0;c<3;c++)seats.push([1.6+c*2.6,3.4+r*1.5]);
  const ANA_SEAT=4;
  seats.forEach(([x,y],k)=>{add(x+.5,y+.6,()=>{sBox(x,y,x+1.2,y+.6,0,16,'#7f8c8d');sTop(x-.05,y-.05,x+1.25,y+.65,16.5,'#c9a67a');sBox(x+.25,y+.75,x+.85,y+1.15,0,10,'#5d6d7e');
      if(k!==ANA_SEAT&&gH(k+S.day)%6!==0){sTop(x+.2,y+.1,x+.7,y+.45,17,'#fff');sPerson(x+.55,y+.95,who(k+3),{pose:'sit',act:gH(k*3+Math.floor(tt/5))%3===0?'phone':null,front:false,right:k%2===0,shirt:['#e85d3f','#5bc0be','#f0ad4e','#9b5de5','#eee','#4a7','#c96','#88a','#d55'][k]});}
      else if(k===ANA_SEAT){sTop(x+.2,y+.1,x+.75,y+.45,17,'#fff');sTop(x+.75,y+.15,x+1.05,y+.5,17,'#3a6fd8');}});});
  const [ax,ay]=seats[ANA_SEAT];const ana={x:ax+.55,y:ay+.95,pose:'sit',act:((tt*.7)%3<1)?'phone':null,front:false,right:true};
  const after=()=>{if(night>.3){ctx.fillStyle='rgba(255,250,230,.06)';const [a,b]=P(5,4,0);ctx.fillRect(a-260,b-200,520,400);}};
  return {W,D,floor:'#d9d2c2',wall:'#e8e1cf',out:false,tile:false,drawBase,decor,items:it,ana,after};};
// ir a clase entra en el aula (el centro de adultos está en el edificio de la biblioteca)
{const _bib=SCENES['biblioteca'];SCENES['biblioteca']=function(E){if(S.sim&&S.sim.outingActive==='clase')return SCENES['aula'](E);return _bib.apply(this,arguments);};}
