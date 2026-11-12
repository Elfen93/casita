// =================== SERVICIOS: el centro de salud (la cita ya no es instantánea) y la oficina de empleo ===================
conLogica(OUT,{
  medico:{req:()=>{const H=HP();return !!H.citaDue&&H.citaDue===S.day;}},
  sepe:{req:()=>!!S.jobless}});
{const _d=destOf;destOf=function(k){if(k==='medico')return 'ambulatorio';if(k==='sepe'||k==='ssociales')return 'sepe';return _d.apply(this,arguments);};}
{const _oc=outCost;outCost=function(k){if(k==='medico'||k==='sepe')return 0;return _oc.apply(this,arguments);};}
// ---- la cita: el día señalado sale; si no puede, se resuelve como siempre antes de acabar el día ----
let svBack=false;
{const _hv=hpVisit;hpVisit=function(){const H=HP();if(svBack){return _hv.apply(this,arguments);}H.citaDue=S.day;};}
function svVisitNow(){const H=HP();H.citaDue=0;svBack=true;try{hpVisit();}finally{svBack=false;}}
{const _dl=dailyEvents;dailyEvents=function(){try{const H=HP();if(H.citaDue&&H.citaDue<S.day&&!(S.sim.outingActive==='medico'&&S.sim.work>0))svVisitNow();}catch(e){}return _dl.apply(this,arguments);};}
{const _go=goOut;goOut=function(k){if(k==='medico'){const H=HP();OUT.medico.dur=(H.citaPriv||H.mutua)?45:90;}return _go.apply(this,arguments);};}
{const _up=update;update=function(gm){const r=_up.apply(this,arguments);try{const H=S.hp;if(H&&H.citaDue===S.day){const s=S.sim;if(!s.work&&!s.leaving&&!s.outing&&!s.cmd&&S.t>=8.5*60&&!(s.use&&typeof bedUse==='function'&&bedUse(s.use))&&!outAvail('medico')&&S.needs.energia>=20)doOut('medico');}}catch(e){}return r;};}
{const _ob=outBack;outBack=function(k){const r=_ob.apply(this,arguments);
  if(k==='medico'){svVisitNow();return r;}
  if(k==='sepe'){const n=CH().name;S.netBoost=Math.max(S.netBoost||0,S.day+3);if(!S.seek){try{autoSeek();}catch(e){}}
    tell(huecos(pickR(TXHZ.servicios.oficina_empleo_dos_horas_cola_lista),{nom:n}),'📋');return r;}
  return r;};}
// ---- helpers de escena (sin Math.random: todo sale de un hash) ----
const svH=i=>{let h=Math.imul((i|0)^0x9e3779b9,2654435761)>>>0;h=(h^(h>>>15))>>>0;h=Math.imul(h,2246822519)>>>0;h=(h^(h>>>13))>>>0;return (h%10000)/10000;};
const SV_SKIN=['#f1c9a5','#e0ac82','#c68a5c','#9a623c','#6a3f25'],SV_HAIR=['#1d1714','#3a2a20','#6b4a2e','#d1ab68','#8a3b22'],SV_SHIRT=['#3a86ff','#e9c46a','#c0392b','#00bb7f','#9b5de5','#e85d3f','#5bc0be','#8d99ae','#f4a261'];
function svChar(i,kind){const f=svH(i*7+1)<.5;const o={...DEFCHAR,g:f?'f':'m',skin:SV_SKIN[Math.floor(svH(i*3+2)*5)],hair:SV_HAIR[Math.floor(svH(i*5+3)*5)],shirt:SV_SHIRT[Math.floor(svH(i*11+4)*SV_SHIRT.length)],style:f?['melena','coleta','rizos','afro'][Math.floor(svH(i+5)*4)]:['corto','rizos','corto','rapado'][Math.floor(svH(i+5)*4)],beard:!f&&svH(i*13+6)<.3?'corta':undefined,glasses:svH(i*17+7)<.2};
  if(kind==='old'){o.hair=['#bdbdbd','#e0e0e0','#9a9a9a'][i%3];o.glasses=svH(i)<.6;o.style=f?'mono':'corto';o.shirt=['#8d99ae','#a5533e','#6b7f4a','#7a6a8a'][i%4];}
  if(kind==='kid'){o.style=f?'coleta':'corto';o.beard=undefined;o.glasses=false;}
  return o;}
function svP(x,y,i,kind,o={}){const ch=svChar(i,kind);if(kind==='kid'){const [a,b]=P(x,y);ctx.save();ctx.translate(a,b);ctx.scale(.66,.66);ctx.translate(-a,-b);sPerson(x,y,ch,{front:true,right:true,...o});ctx.restore();return;}
  sPerson(x,y,ch,{front:true,right:true,...o});if(kind==='old'&&o.cane!==false){const [a,b]=P(x,y);const r=o.right??true;capsule(a+(r?9:-9),b-14,a+(r?10:-10),b,1.4,'#6b4a2e');}}
function svText(x,y,z,txt,col,sz,onX){const [a,b]=onX?P(0,y,z):P(x,0,z);ctx.save();ctx.translate(a,b);ctx.transform(1,onX?-.5:.5,0,1,0,0);ctx.fillStyle=col;ctx.font=`900 ${sz}px Nunito, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,0,0);ctx.restore();}
function svQuadX(x0,x1,z0,z1,col){poly([P(x0,0,z0),P(x1,0,z0),P(x1,0,z1),P(x0,0,z1)],col);}
function svQuadY(y0,y1,z0,z1,col){poly([P(0,y0,z0),P(0,y1,z0),P(0,y1,z1),P(0,y0,z1)],col);}
function svSky(night){const w=(S.weather||{}).k;return night>.5?'#1f2742':(w==='lluvia'||w==='tormenta'||w==='nieve')?'#9aa8b5':w==='nublado'?'#c3ccd3':'#bfe3f7';}
function svRain(y0,y1,z0,z1,tt){const w=(S.weather||{}).k;if(w!=='lluvia'&&w!=='tormenta')return;ctx.strokeStyle='rgba(60,80,110,.5)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<9;k++){const y=y0+(y1-y0)*svH(k+40),z=z1-((tt*30+svH(k+60)*(z1-z0))%(z1-z0));ctx.moveTo(...P(0,y,z));ctx.lineTo(...P(0,y-.04,z-4));}ctx.stroke();}
function svChair(x,y,col){sBox(x-.26,y-.26,x+.26,y+.26,8,10,col);for(const [a,b] of [[-.22,-.22],[.16,-.22],[-.22,.16],[.16,.16]])sBox(x+a,y+b,x+a+.06,y+b+.06,0,8,'#6b6f78');}
// silla de sala de espera: patas finas, asiento y respaldo alto. El respaldo va aparte (se pinta DESPUÉS de quien se sienta, para que tape sus lomos)
function svSillaBase(x,y,col){for(const [a,b] of [[-.22,-.22],[.16,-.22],[-.22,.16],[.16,.16]])sBox(x+a,y+b,x+a+.06,y+b+.06,0,9,'#5d626b');sBox(x-.27,y-.27,x+.27,y+.27,9,12,col);}
function svSillaResp(x,y,col){const c=shade(col,.82);sBox(x-.25,y+.2,x-.18,y+.27,11,24,'#5d626b');sBox(x+.18,y+.2,x+.25,y+.27,11,24,'#5d626b');sBox(x-.27,y+.19,x+.27,y+.29,12,26,c);}
function svSillaRespN(x,y,col){const c=shade(col,.82);sBox(x-.25,y-.27,x-.18,y-.2,11,24,'#5d626b');sBox(x+.18,y-.27,x+.25,y-.2,11,24,'#5d626b');sBox(x-.27,y-.29,x+.27,y-.19,12,26,c);}
function svFrac(){const s=S.sim,tot=s.awayTotal||1;return Math.max(0,Math.min(1,(tot-(s.work||0))/tot));}
// ---- escena: sala de espera del centro de salud ----
SCENES['ambulatorio']=function(E){const {tt,night}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});const W=11,D=8,WH=66;const h=S.t/60;const fr=svFrac();
  const turno=40+(S.day*3)%50+Math.floor(tt/18);const cyc=(tt%18)/18;const docOn=cyc>.03&&cyc<.95;
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#8fa6a8');topQuad(0,0,W,D,0,'#d5e4e1');ctx.strokeStyle='rgba(60,110,100,.12)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W;k++){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=1;k<D;k++){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}ctx.stroke();
    sBox(0,-.15,W,0,0,WH,'#eef4f2');sBox(-.15,-.15,0,D,0,WH,'#e2ece9');svQuadX(0,W,0,9,'#3f9a8f');svQuadY(0,D,0,9,'#3f9a8f');
    svQuadX(2.9,7.0,18,46,'#16191d');svQuadX(3.05,6.85,20,44,'#0c0f12');svText(3.9,0,40,TXHZ.servicios.turno,"#8fe0c8",6.5,false);svText(5.95,0,40,TXHZ.servicios.consulta,"#8fe0c8",5.5,false);svText(3.9,0,28,String(turno),"#ff5a3c",15,false);svText(5.95,0,28,String(1+turno%3),"#ffc84a",15,false);
    svQuadX(.5,2.6,26,50,'#fffdf8');svText(1.55,0,45,TXHZ.servicios.vacunas,"#3f9a8f",3.2,false);svText(1.55,0,39,TXHZ.servicios.gripe_covid,"#555",2.2,false);svText(1.55,0,34,TXHZ.servicios.pida_cita,"#555",2.2,false);
    svQuadX(8.5,10.5,26,50,'#fffdf8');svText(9.5,0,45,TXHZ.servicios.normas,"#3f9a8f",3.2,false);svText(9.5,0,39,TXHZ.servicios.mascarilla_si_tos,"#555",2,false);svText(9.5,0,35,TXHZ.servicios.acompanante,"#555",2,false);svText(9.5,0,31,TXHZ.servicios.apague_movil,"#555",2,false);
    svQuadY(4.9,7.4,18,52,'#8fa6a8');svQuadY(5.0,7.3,20,50,svSky(night));svRain(5.0,7.3,20,50,tt);
    for(const [y,n] of [[1.0,'1'],[3.1,'2']]){svQuadY(y,y+1.1,0,50,docOn&&y===1.0?'#3a3f46':'#b6875a');svText(0,y+.55,56,'Consulta '+n,"#3f9a8f",3,true);}};
  const decor=()=>{svText(5.5,0,60,TXHZ.servicios.centro_salud,"#1f6f63",7,false);};
  add(9.4,1.2,()=>{if(h>=7.5)svP(9.6,.25,91,'adult',{pose:'stand',act:'type',front:true,right:false,shirt:'#3f9a8f'});sBox(7.8,.5,10.8,1.4,0,22,'#fffdf8');sBox(7.8,.5,10.8,1.4,22,24,'#3f9a8f');sBox(8.3,.7,8.9,1.1,24,30,'#cfd4d8');});
  const seats=[];for(let r=0;r<3;r++)for(let i=0;i<5;i++)seats.push({x:2.0+i*1.4,y:3.2+r*1.4,k:r*5+i});
  const anaSeat=seats[7];
  for(const st of seats){const forced=st.k%5!==4;const on=forced||svH(st.k+S.day*3)<.55;const old=st.k%4===1||st.k%7===2;const col=['#3f9a8f','#e9c46a','#3f9a8f'][Math.floor(st.k/5)];
    const d0=st.x+st.y;add(d0-.1,0,()=>svSillaBase(st.x,st.y,col));
    if(on&&st!==anaSeat)add(d0,0,()=>svP(st.x,st.y-.02,100+st.k,old?'old':'adult',{pose:'sit',front:false,right:st.k%2===0,cane:false,act:st.k%6===3?'phone':null}));
    add(d0+.1,0,()=>svSillaResp(st.x,st.y,col));}
  add(1.0,7.0,()=>svP(1.0,7.0,120,'adult',{pose:'stand',act:'phone',front:true,right:true}));
  add(9.6,5.4,()=>{svP(9.5,5.4,121,'adult',{pose:'stand',front:true,right:false});svP(10.05,5.7,122,'kid',{pose:'stand',front:true,right:false});});
  add(9.8,7.0,()=>svP(9.8,7.0,123,'old',{pose:'stand',front:true,right:false}));
  add(6.0,2.2,()=>svP(6.0,2.2,124,'adult',{pose:'stand',front:false,right:true,act:'phone'}));
  add(.5,7.5,()=>{cyl(.6,7.3,.2,0,10,'#b5543c','#c27458');const [a,b]=P(.6,7.3,10);for(let k=0;k<6;k++){ctx.fillStyle=['#3f8a3a','#58ac4e'][k%2];ctx.beginPath();ctx.ellipse(a+Math.cos(k*1.3)*6,b-10-Math.abs(Math.sin(k))*6,5,2.8,k,0,7);ctx.fill();}});
  add(7.3,.7,()=>{sBox(7.1,.15,7.4,.4,0,22,'#cfd4d8');sBox(7.08,.12,7.42,.43,22,30,'#3f9a8f');});
  // la médica: sale a la puerta de la consulta 1 y llama el número que marca la pantalla durante casi todo el ciclo
  if(docOn){const mx=cyc<.09?.4+(cyc-.03)/.06*.5:cyc>.88?.9-(cyc-.88)/.07*.5:.9;const walk=cyc<.09||cyc>.88;const call=!walk;
    add(mx+1.55,0,()=>{const [a,b]=P(mx,1.55);svP(mx,1.55,130,'adult',{pose:'stand',front:true,right:true,shirt:'#ffffff',act:call?'talk':null,ph:walk?tt*9:tt*5});
      if(call){ctx.save();const t='Número '+turno,bx=a+30,by=b-88;ctx.fillStyle='rgba(255,253,248,.97)';ctx.beginPath();ctx.moveTo(bx-16,by+10);ctx.lineTo(a+5,b-66);ctx.lineTo(bx-2,by+10);ctx.fill();label(t,bx,by,'rgba(255,253,248,.97)','#3b3247',13);ctx.restore();}});}
  const ana=fr<.82?{x:anaSeat.x,y:anaSeat.y-.02,pose:'sit',front:false,right:true,act:null}:{x:1.5,y:1.7,pose:'stand',front:false,right:false,act:null};
  const after=()=>{if(night>.4){ctx.fillStyle='rgba(20,30,60,.12)';ctx.fillRect(-2000,-2000,4000,4000);}};
  return {W,D,floor:'#d5e4e1',wall:'#eef4f2',out:false,tile:false,drawBase,decor,items:it,ana,after};};
// ---- escena: oficina de empleo ----
SCENES['sepe']=function(E){const {tt,night}=E;const it=[],add=(x,y,f)=>it.push({d:x+y,f});const W=11,D=8,WH=66;const fr=svFrac();
  const ven=[[.8,3.0,1],[4.2,6.4,0],[7.6,9.8,1]];
  const drawBase=()=>{prism(0,0,W,D,-22,0,'#8c8576');topQuad(0,0,W,D,0,'#cfcabc');ctx.strokeStyle='rgba(80,70,50,.14)';ctx.lineWidth=1;ctx.beginPath();for(let k=1;k<W;k++){ctx.moveTo(...P(k,0));ctx.lineTo(...P(k,D));}for(let k=1;k<D;k++){ctx.moveTo(...P(0,k));ctx.lineTo(...P(W,k));}ctx.stroke();
    sBox(0,-.15,W,0,0,WH,'#e6e0cf');sBox(-.15,-.15,0,D,0,WH,'#dcd5c3');svQuadX(0,W,0,8,'#8a6a3a');svQuadY(0,D,0,8,'#8a6a3a');
    ven.forEach(([x0,x1,open],i)=>{svQuadX(x0-.1,x1+.1,22,50,'#6b6252');if(open){svQuadX(x0,x1,24,48,'#c5d6dc');svQuadX(x0+.15,x0+.6,26,46,'rgba(255,255,255,.35)');}else{for(let z=24;z<48;z+=3)svQuadX(x0,x1,z,z+2.2,'#9a9486');svQuadX(x0+.3,x1-.3,30,43,'#f4efe1');svText((x0+x1)/2,0,39.5,TXHZ.servicios.cerrado,"#b3261e",3.6,false);svText((x0+x1)/2,0,34,TXHZ.servicios.vuelva_usted_manana,"#3a3a3a",2.1,false);}
      svQuadX((x0+x1)/2-.45,(x0+x1)/2+.45,51,58,'#16191d');svText((x0+x1)/2,0,54.5,open?String(212+i*3+Math.floor(tt/11)):'--',open?'#ff5a3c':'#555',4.4,false);});
    svText(5.5,0,63,TXHZ.servicios.oficina_empleo,"#8a6a3a",6.5,false);
    svQuadY(4.9,7.4,18,52,'#6b6252');svQuadY(5.0,7.3,20,50,svSky(night));svRain(5.0,7.3,20,50,tt);
    svQuadY(.5,2.4,22,50,'#fffdf8');svText(0,1.45,45,TXHZ.servicios.sin_cita_previa,"#b3261e",2.8,true);svText(0,1.45,40,TXHZ.servicios.atiende,"#b3261e",2.8,true);svText(0,1.45,33,TXHZ.servicios.sellado_cada_90_dias,"#555",2,true);svText(0,1.45,29,TXHZ.servicios.traiga_fotocopia,"#555",2,true);
    svQuadY(2.9,4.6,24,48,'#fffdf8');svText(0,3.75,43,TXHZ.servicios.horario,"#555",2.8,true);svText(0,3.75,38,TXHZ.servicios.n9_00_13_00,"#555",2.4,true);svText(0,3.75,33,TXHZ.servicios.lunes_viernes,"#555",2,true);svText(0,3.75,28,TXHZ.servicios.salvo_averia,"#888",2,true);};
  const decor=()=>{};
  const posts=[];for(const y of [3.4,5.0])for(let i=0;i<7;i++)posts.push([1.2+i*1.4,y]);
  for(const [x,y] of posts)add(x,y+.1,()=>{cyl(x,y,.2,0,2,'#2a2a30','#3a3a44');cyl(x,y,.05,2,22,'#b8bec6','#d5dae0');cyl(x,y,.1,22,24,'#b8bec6','#d5dae0');});
  const tape=y=>{for(let i=0;i<6;i++){const a=P(1.2+i*1.4,y,19),b=P(1.2+(i+1)*1.4,y,19);capsule(a[0],a[1],b[0],b[1],2,i%2?'#e8e2d4':'#b3261e');}};
  add(6,3.45,()=>tape(3.4));add(6,5.05,()=>tape(5.0));
  ven.forEach(([x0,x1,open],i)=>add((x0+x1)/2,1.0,()=>{if(open)svP((x0+x1)/2,.2,140+i,'adult',{pose:'stand',act:i===0?'type':'talk',front:true,right:i===2,shirt:['#3a5a8a','#7a3a4a'][i%2]});sBox(x0-.1,.3,x1+.1,1.1,0,22,'#8a7a66');sBox(x0-.1,.3,x1+.1,1.1,22,24,'#b5a58c');if(open)sBox(x0+.2,.5,x0+.8,.9,24,29,'#cfd4d8');}));
  add(2.2,1.9,()=>svP(2.2,1.9,150,'adult',{pose:'stand',front:false,right:true}));
  add(9.2,1.9,()=>svP(9.2,1.9,151,'old',{pose:'stand',front:false,right:true}));
  for(let j=0;j<6;j++)add(1.9+j*1.4,4.2,()=>svP(1.9+j*1.4,4.2,160+j,j%4===1?'old':'adult',{pose:'stand',front:false,right:true,act:j%3===0?'phone':null}));
  const slots=[];for(let j=0;j<7;j++)slots.push([9.9-j*1.2,5.9]);const aj=Math.min(6,Math.floor(fr*7));
  slots.forEach(([x,y],j)=>{if(j===aj)return;add(x,y+.1,()=>svP(x,y,170+j,j===3?'old':'adult',{pose:'stand',front:true,right:false,act:j%2?'phone':null}));});
  add(.7,6.0,()=>{sBox(.35,5.7,1.0,6.3,0,30,'#3a5a8a');sBox(.4,5.75,.95,6.25,30,34,'#cfd4d8');});
  add(5.0,7.3,()=>{sBox(3.0,7.0,7.6,7.6,8,10,'#6b6252');for(const x of [3.1,5.2,7.4])sBox(x,7.1,x+.12,7.5,0,8,'#4a4a50');svP(4.0,7.3,180,'adult',{pose:'sit',front:true,right:true});svP(6.6,7.3,181,'old',{pose:'sit',front:true,right:false});});
  const ana={x:slots[aj][0],y:slots[aj][1],pose:'stand',front:true,right:false,act:null};
  const after=()=>{if(night>.4){ctx.fillStyle='rgba(20,30,60,.12)';ctx.fillRect(-2000,-2000,4000,4000);}};
  return {W,D,floor:'#cfcabc',wall:'#e6e0cf',out:false,tile:false,drawBase,decor,items:it,ana,after};};
