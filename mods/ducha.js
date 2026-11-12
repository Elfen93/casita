// =================== DUCHARSE DESNUDA (COMO TODO EL MUNDO), CON CENSURA QUE SE PUEDE QUITAR EN AJUSTES ===================
const {ducha:TX_ducha}=DATA.textos_mods_ag;
const enDucha=()=>{const u=S&&S.sim&&S.sim.use;return !!u&&(u.type==='ducha'||u.type==='banera')&&!(S.sim.work>0);};
function mosaico(cx,cy,w,h,skin){const c=2.6;for(let y=0;y<h;y+=c)for(let x=0;x<w;x+=c){const k=((x*7+y*13+((performance.now()/400)|0)*3)%5)/5;ctx.fillStyle=k<.4?shade(skin,.82):k<.8?skin:shade(skin,1.12);ctx.fillRect(cx-w/2+x,cy-h/2+y,c+.2,c+.2);}}
{const _da=drawAna;drawAna=function(bx,by,o){if(!o||(o.ch&&o.ch!==CH()&&o.ch!==S.char)||!enDucha()||o._nu)return _da.apply(this,arguments);
  const C=CH();const skin=o.skin||C.skin||'#c98f63';
  const nu={...C,shirt:skin,pants:skin,shoes:skin,outfit:'basico',acc:[],acc2:skin,glasses:false,capc:null,helmet:null,vest:null};
  const top=_da.call(this,bx,by,{...o,_nu:1,ch:nu,shirt:skin,pants:skin,helmet:null,vest:null});
  try{if(S.censura!==false&&o.pose!=='lie'){const sit=o.pose==='sit';const fem=(C.g||'f')!=='m';ctx.save();mosaico(bx,by-(sit?16:24),11,9,skin);if(fem)mosaico(bx,by-(sit?28:37),11,6,skin);ctx.restore();}}catch(e){}
  return top;};}
{const _om=openMenu;openMenu=function(...a){const r=_om.apply(this,a);try{const sb=card.querySelector('#soundbtn');if(sb&&!card.querySelector('#censbtn')){const b=document.createElement('button');b.className=sb.className;b.id='censbtn';b.textContent=S.censura===false?TX_ducha.censura_no:TX_ducha.censura_si;b.onclick=()=>{S.censura=S.censura===false?true:false;save();openMenu('ajustes');};(card.querySelector('#r3dbtn')||sb).after(b);}}catch(e){}return r;};}
