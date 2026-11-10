// ---------- cámara y rotación ----------
const cv=document.getElementById('c');let ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,rot=0;
const cam={x:0,y:0,z:1};
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;}
addEventListener('resize',resize);resize();
// mundo (continuo) → vista
function w2v(x,y){switch(rot){case 1:return [N-y,x];case 2:return [N-x,N-y];case 3:return [y,N-x];default:return [x,y];}}
function v2w(u,v){switch(rot){case 1:return [v,N-u];case 2:return [N-u,N-v];case 3:return [N-v,u];default:return [u,v];}}
function vc2wc(vx,vy){switch(rot){case 1:return [vy,N-1-vx];case 2:return [N-1-vx,N-1-vy];case 3:return [N-1-vy,vx];default:return [vx,vy];}}
function wc2vc(x,y){const [u,v]=w2v(x+.5,y+.5);return [Math.floor(u),Math.floor(v)];}
const P=(x,y,z=0)=>[(x-y)*TW/2,(x+y)*TH/2-z];
function centerOnWorld(x,y){const [u,v]=w2v(x,y);const [wx,wy]=P(u,v);cam.x=W/2-wx*cam.z;cam.y=H*0.46-wy*cam.z;}
cam.z=Math.max(0.55,Math.min(1.5,W/(8.5*TW)));
centerOnWorld(S.sim.work?N/2:S.sim.x,S.sim.work?N/2:S.sim.y);
function screenToView(sx,sy){const wx=(sx-cam.x)/cam.z, wy=(sy-cam.y)/cam.z;const a=wx/(TW/2), b=wy/(TH/2);return [(a+b)/2,(b-a)/2];}
function screenToCell(sx,sy){const [u,v]=screenToView(sx,sy);return vc2wc(Math.floor(u),Math.floor(v));}
function zoomAt(f,sx,sy){const nz=Math.max(0.3,Math.min(2.5,cam.z*f));const k=nz/cam.z;cam.x=sx-(sx-cam.x)*k;cam.y=sy-(sy-cam.y)*k;cam.z=nz;}
function rotate(){if(viewPlace)return;const [u,v]=screenToView(W/2,H*0.46);const [x,y]=v2w(u,v);rot=(rot+1)%4;centerOnWorld(x,y);sfx('tap');rotFlash=performance.now();}

