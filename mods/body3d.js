// ---------- muñecos 3D en lugar del dibujo plano ----------
let B3D=null;
function use3D(o){if(B3D===false)return false;if(S&&S.r3d===false)return false;if(typeof C3D==='undefined')return false;if(B3D==null){B3D=C3D.ok();}return B3D&&!o.flat2d;}
{const _da=drawAna;drawAna=function(bx,by,o){if(!use3D(o))return _da(bx,by,o);
  try{const C=o.ch||{};
    const uni=(o.shirt!=null&&o.shirt!==C.shirt)||(o.pants!=null&&o.pants!==C.pants);
    const ch={...C,g:o.g||C.g||'f',skin:o.skin||C.skin,hair:o.hair||C.hair,style:o.style||C.style||'coleta',beard:o.beard||C.beard||'no',glasses:o.glasses??C.glasses,build:o.build||C.build,
      shirt:o.shirt??C.shirt,pants:o.pants??C.pants,outfit:uni||o.noOutfit?'basico':(C.outfit||'basico'),helmet:o.helmet||null,vest:o.vest||null};
    if(uni){ch.acc=[];}
    const m=ctx.getTransform(),sc=Math.hypot(m.a,m.b)||1;
    if(!o.noShadow){ctx.save();ctx.translate(bx,by);ctx.scale(1,.42);const g=ctx.createRadialGradient(0,0,1,0,0,11);g.addColorStop(0,'rgba(20,10,40,.32)');g.addColorStop(1,'rgba(20,10,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,11,0,Math.PI*2);ctx.fill();ctx.restore();}
    const yaw=o.yaw!=null?o.yaw:o.front?(o.right?.785:-.785):(o.right?2.356:-2.356);
    const opts={yaw,pose:o.pose,ph:anaRT.phase,t:performance.now()/1000+(ch.name?ch.name.length:0),act:o.act,sad:o.sad};
    let okQ=false;if(S.r3d!=='simple'&&typeof Q3D!=='undefined'&&Q3D.ready(ch)){okQ=Q3D.draw(ctx,ch,bx,by+(o.pose==='sit'?9:0),30*sc,opts,sc);}
    if(!okQ)C3D.draw(ctx,ch,bx,by+(o.pose==='sit'?3:0),31*sc,opts,sc);return [bx,by-(o.pose==='sit'?42:56)];
  }catch(e){console.error(e);B3D=false;return _da(bx,by,o);}};}
{const _om=openMenu;openMenu=function(...a){const r=_om.apply(this,a);try{const sb=card.querySelector('#soundbtn');if(sb&&!card.querySelector('#r3dbtn')){const b=document.createElement('button');b.className=sb.className;b.id='r3dbtn';b.textContent=S.r3d===false?'🧍 Muñecos: clásicos (2D)':S.r3d==='simple'?'🧍 Muñecos: 3D simples':'🧍 Muñecos: 3D Quaternius';b.onclick=()=>{S.r3d=S.r3d===false?true:S.r3d==='simple'?false:'simple';if(S.r3d)B3D=null;save();openMenu('ajustes');};sb.after(b);}}catch(e){}return r;};}
// precarga de los modelos de la casa al arrancar y al abrir Gente
{const pre=()=>{try{if(typeof Q3D==='undefined'||!S)return;const L=[CH()];for(const p of (S.people||[]))if(p.ch)L.push(p.ch);Q3D.preload(L);}catch(e){}};setTimeout(pre,800);const _gt2=genteTab;genteTab=function(...a){pre();return _gt2.apply(this,a);};}
