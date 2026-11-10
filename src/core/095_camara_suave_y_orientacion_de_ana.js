// ---------- cámara suave y orientación de Ana ----------
const camVel={x:0,y:0};let zoomAnim=null;
function smoothZoom(f){zoomAnim={from:cam.z,to:Math.max(0.3,Math.min(2.5,cam.z*f)),t0:performance.now()};}
function updateCamera(dt){
  if(!ptrs.size&&(Math.abs(camVel.x)>2||Math.abs(camVel.y)>2)){cam.x+=camVel.x*dt;cam.y+=camVel.y*dt;const k=Math.exp(-dt*5);camVel.x*=k;camVel.y*=k;}
  if(zoomAnim){const t=Math.min(1,(performance.now()-zoomAnim.t0)/220),e=1-Math.pow(1-t,3);const z=zoomAnim.from+(zoomAnim.to-zoomAnim.from)*e;zoomAt(z/cam.z,W/2,H/2);if(t>=1)zoomAnim=null;}
}
function updateFacing(){
  const s=S.sim;let dx=0,dy=0;
  if(anaRT.moving&&anaRT.dir)[dx,dy]=anaRT.dir;
  else if(s.use&&s.use.i!=null&&!ONOBJ.has(s.use.type)){dx=s.use.i%N+.5-s.x;dy=(s.use.i/N|0)+.5-s.y;}
  if(Math.abs(dx)+Math.abs(dy)>0.01){const [a,b]=w2v(s.x,s.y),[c,d]=w2v(s.x+dx,s.y+dy);const du=c-a,dv=d-b,sx=du-dv,sy=du+dv;if(Math.abs(sx)>0.02)anaRT.right=sx>0;anaRT.front=sy>-0.02;}
  else{const now=performance.now();if(now>anaRT.lookT){anaRT.lookT=now+2500+Math.random()*4500;anaRT.right=Math.random()<.5;anaRT.front=Math.random()<.8;}}
}

