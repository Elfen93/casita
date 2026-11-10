// ---------- suelo, calles y aceras ----------
function drawEntGround(night){
  const L=LAWN;const g=shade(L,.92);
  wflat(-40,-40,N+34,N+20,-.02,shade(L,.86));
  // manzanas de alrededor en césped más apagado
  wflat(-24,-24,N+6,N+6,0,g);
  // aceras
  const pav='#d8d2c4',pavN=mixHex(pav,'#222',night*.35);const asf=mixHex('#5d6168','#222',night*.3);
  wflat(ENT_STREET.far,N,N+5.5,N+1.5,.03,pavN);wflat(ENT_STREET.far,N+4.5,N+5.5,N+5.5,.03,pavN);
  wflat(N,ENT_STREET.far,N+1.5,N+5.5,.03,pavN);wflat(N+4.5,ENT_STREET.far,N+5.5,N+5.5,.03,pavN);
  // calzadas
  wflat(ENT_STREET.far,N+1.5,N+4.5,N+4.5,.04,asf);wflat(N+1.5,ENT_STREET.far,N+4.5,N+4.5,.04,asf);
  // líneas discontinuas
  ctx.save();ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.3;ctx.setLineDash([7,9]);
  ctx.beginPath();let p=wp(ENT_STREET.far,N+3,.06);ctx.moveTo(p[0],p[1]);p=wp(N+3,N+3,.06);ctx.lineTo(p[0],p[1]);p=wp(N+3,ENT_STREET.far,.06);ctx.lineTo(p[0],p[1]);ctx.stroke();ctx.restore();
  // paso de cebra frente a la casa y en la otra calle
  for(let k=0;k<5;k++){wflat(N/2-1.6+k*.7,N+1.6,N/2-1.2+k*.7,N+4.4,.07,'rgba(255,255,255,.75)');wflat(N+1.6,N/2-1.6+k*.7,N+4.4,N/2-1.2+k*.7,.07,'rgba(255,255,255,.75)');}
  // bordillo de la parcela
  const [u0,v0,u1,v1]=vrect([0,0,N,N]);prism(u0,v0,u1,v1,-3,0,shade(L,.75));
  // parque de la esquina
  const pk=ENT_HOUSES.find(h=>h.park);wflat(pk.r[0],pk.r[1],pk.r[2],pk.r[3],.05,shade(L,1.02));
  // caminito del parque
  wflat(pk.r[0]+2.6,pk.r[1],pk.r[0]+3.4,pk.r[3],.06,'#cfc3ac');
}
