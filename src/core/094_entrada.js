// ---------- entrada ----------
const ptrs=new Map();let gesture=null,lastPaint=null;
const freeTool=()=>mode!=='live'&&tool&&['del','paint'].includes(tool.kind);
const dragTool=()=>mode!=='live'&&tool&&DRAG_KINDS.includes(tool.kind);
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{
  camVel.x=camVel.y=0;zoomAnim=null;
  cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===1){
    const alt=e.button===1||e.button===2;
    const c=screenToCell(e.clientX,e.clientY);
    if(!alt&&dragTool()&&inb(c[0],c[1])){gesture={type:'shape',start:c,cur:c,sx:e.clientX,sy:e.clientY};preview=buildPreview(c,c);pointerScreen=[e.clientX,e.clientY];}
    else if(!alt&&freeTool()){gesture={type:'paint',sx:e.clientX,sy:e.clientY};beginStroke();lastPaint=c[0]+','+c[1];hover=c;apply(c[0],c[1]);}
    else gesture={type:'pan',sx:e.clientX,sy:e.clientY,cx:cam.x,cy:cam.y,moved:false,btn:e.button};
  } else if(ptrs.size===2){
    if(gesture&&gesture.type==='paint')endStroke();
    preview=null;
    const [a,b]=[...ptrs.values()];
    gesture={type:'pinch',d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2,moved:true};
  }
});
cv.addEventListener('pointermove',e=>{
  if(e.pointerType==='mouse'&&!ptrs.size){hover=screenToCell(e.clientX,e.clientY);pointerScreen=[e.clientX,e.clientY];return;}
  if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(!gesture)return;
  if(gesture.type==='pinch'&&ptrs.size>=2){
    const [a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
    cam.x+=mx-gesture.mx;cam.y+=my-gesture.my;zoomAt(d/gesture.d,mx,my);gesture.d=d;gesture.mx=mx;gesture.my=my;return;
  }
  if(gesture.type==='pan'){if(Math.hypot(e.clientX-gesture.sx,e.clientY-gesture.sy)>8)gesture.moved=true;const nx=gesture.cx+(e.clientX-gesture.sx),ny=gesture.cy+(e.clientY-gesture.sy);const now=performance.now(),dtm=Math.max(1,now-(gesture.lt||now-16));camVel.x=camVel.x*0.6+((nx-cam.x)/dtm*1000)*0.4;camVel.y=camVel.y*0.6+((ny-cam.y)/dtm*1000)*0.4;gesture.lt=now;cam.x=nx;cam.y=ny;}
  else if(gesture.type==='paint'){const c=screenToCell(e.clientX,e.clientY);hover=c;const k=c[0]+','+c[1];if(k!==lastPaint){lastPaint=k;apply(c[0],c[1]);}}
  else if(gesture.type==='shape'){pointerScreen=[e.clientX,e.clientY];let c=screenToCell(e.clientX,e.clientY);c=[Math.max(0,Math.min(N-1,c[0])),Math.max(0,Math.min(N-1,c[1]))];if(c[0]!==gesture.cur[0]||c[1]!==gesture.cur[1]){gesture.cur=c;preview=buildPreview(gesture.start,c);}}
});
function endPtr(e){
  if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);
  if(gesture&&gesture.type==='shape'&&ptrs.size===0){commitPreview();}
  if(gesture&&gesture.type==='paint'&&ptrs.size===0){endStroke();}
  if(gesture&&gesture.type==='pan'&&!gesture.moved&&gesture.btn===0&&ptrs.size===0){
    const c=screenToCell(e.clientX,e.clientY);
    if(mode==='live')liveTap(c[0],c[1]);
    else if(tool){beginStroke();if(!apply(c[0],c[1])&&tool.kind!=='move')sfx('bad');endStroke();flash=c;setTimeout(()=>{if(flash===c)flash=null;},500);}
    else toast(TXN.entrada.elige_barra);
  }
  if(ptrs.size===0){if(!(gesture&&gesture.type==='pan'&&gesture.moved&&performance.now()-(gesture.lt||0)<80)){camVel.x=0;camVel.y=0;}gesture=null;preview=null;if(e.pointerType!=='mouse'){hover=null;pointerScreen=null;}}
  else if(ptrs.size===1){const [p]=[...ptrs.values()];gesture={type:'pan',sx:p.x,sy:p.y,cx:cam.x,cy:cam.y,moved:true};}
}
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',endPtr);
cv.addEventListener('pointerleave',()=>{if(!ptrs.size){hover=null;pointerScreen=null;}});
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.deltaY<0?1.1:1/1.1,e.clientX,e.clientY);},{passive:false});
addEventListener('keydown',e=>{
  if(menu.classList.contains('open'))return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}
  else if(e.key==='r'||e.key==='R')rotate();
  else if(e.key==='Escape'){returnHeld();tool=null;buildPalette();}
});

