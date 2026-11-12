// ---------- dibujo ----------
function drawEntorno(night,tt,phase){ // phase 0: detrás de la parcela · 1: delante
  if(!ENT_ON())return;
  if(phase===0)drawEntGround(night);
  const items=[];const add=(u0,v0,u1,v1,f)=>{const g=entGroup(u0,v0,u1,v1);if(g!==phase)return;items.push({d:u1+v1,f});};
  for(const b of ENT_BG){const [u0,v0,u1,v1]=vrect(b.r);if(entGroup(u0,v0,u1,v1)!==0)continue;add(u0,v0,u1,v1,()=>entBg(b,night));}
  for(const hs of ENT_HOUSES){const rr=hs.garden?[Math.min(hs.r[0],hs.garden[0]),Math.min(hs.r[1],hs.garden[1]),Math.max(hs.r[2],hs.garden[2]),Math.max(hs.r[3],hs.garden[3])]:hs.r;const [u0,v0,u1,v1]=vrect(rr);add(u0,v0,u1,v1,()=>entHouse(hs,night,tt));}
  // árboles de la acera y farolas
  for(let k=0;k<8;k++){const x=ENT_STREET.far+2+k*6.2;if(x>N-.5&&x<N+.5)continue;const [u,v]=w2v(x,N+5.1);add(u,v,u,v,()=>entTree(x,N+5.1,.8,k+10,tt));}
  for(let k=0;k<7;k++){const y=ENT_STREET.far+2+k*6.2;const [u,v]=w2v(N+5.1,y);add(u,v,u,v,()=>entTree(N+5.1,y,.8,k+20,tt));}
  for(let k=0;k<8;k++){const x=ENT_STREET.far+5+k*6;if(x>N)break;const [u,v]=w2v(x,N+1.2);add(u,v,u,v,()=>entLamp(x,N+1.2,night,k));}
  for(let k=0;k<8;k++){const y=ENT_STREET.far+5+k*6;if(y>N)break;const [u,v]=w2v(N+1.2,y);add(u,v,u,v,()=>entLamp(N+1.2,y,night,k+6));}
  // parada de bus, contenedores, buzón
  {const [u,v]=w2v(N/2+4.6,N+1.1);add(u,v,u,v,()=>{wbox(N/2+3.8,N+1,N/2+5.4,N+1.2,0,20,'#4a4e57');poly([P(...w2v(N/2+3.6,N+.95),18),P(...w2v(N/2+5.6,N+.95),18),P(...w2v(N/2+5.6,N+1.25),20),P(...w2v(N/2+3.6,N+1.25),20)].map(p=>p),'#3b3f46');const [lx,ly]=wp(N/2+4.6,N+1.1,22);label('🚌',lx,ly,'#e9c46a','#3b3247',8);});}
  {const [u,v]=w2v(-3.2,N+1);add(u,v,u,v,()=>{wbox(-3.6,N+.6,-2.6,N+1.3,0,9,'#5b8c5a');wbox(-2.4,N+.6,-1.4,N+1.3,0,9,'#e9c46a');wbox(-1.2,N+.6,-.2,N+1.3,0,9,'#3a86ff');});}
  {const [u,v]=w2v(N+1.1,-4);add(u,v,u,v,()=>{wbox(N+.95,-4.2,N+1.25,-3.8,0,8,'#e9c46a');});}
  // pancarta de huelga en la valla de la parcela
  if(S.strike&&S.strike.on&&S.strike.join){const [u,v]=w2v(N/2,N);add(u,v,u,v,()=>{const a=wp(N/2-2.5,N+.05,14),b=wp(N/2+2.5,N+.05,14);poly([a,b,[b[0],b[1]+10],[a[0],a[1]+10]],'#fff8e0');const [lx,ly]=wp(N/2,N+.05,9);label('✊ HUELGA',lx,ly,'rgba(0,0,0,0)','#c0392b',8);});}
  for(const m of entMoving(tt,night)){const g=(m.u<0||m.v<0)&&!(m.u>N||m.v>N)?0:1;if(g===phase)items.push({d:m.u+m.v,f:m.f});}
  for(const p of entParked(night)){const g=(p.u<0||p.v<0)&&!(p.u>N||p.v>N)?0:1;if(g===phase)items.push({d:p.u+p.v,f:p.f});}
  items.sort((a,b)=>a.d-b.d);for(const it of items)it.f();
}

// =================== RASGOS AMPLIADOS ===================
const TRAIT_CATS=DATA.personas.rasgos_categorias;
const TRAIT_MAX=5;
