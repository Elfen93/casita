// ---------- deshacer / rehacer ----------
let undoStack=[],redoStack=[],stroke=null;
const snap=()=>JSON.stringify([S.floor,S.wall,S.wcol,S.obj]);
function restore(str){const [f,w,c,o]=JSON.parse(str);S.floor=f;S.wall=w;S.wcol=c;S.obj=o;dirty();const s=S.sim;s.path=[];s.target=null;if(s.use&&s.use.i!=null&&!S.obj[s.use.i])s.use=null;ensureSimFree();}
function beginStroke(){if(!stroke)stroke={before:snap(),m0:S.money};}
function endStroke(){
  if(!stroke)return;const after=snap();
  if(after!==stroke.before){stroke.after=after;stroke.spent=stroke.m0-S.money;undoStack.push(stroke);if(undoStack.length>60)undoStack.shift();redoStack=[];dirty();}
  stroke=null;updateUR();
}
function undo(){returnHeld();const st=undoStack.pop();if(!st)return;restore(st.before);S.money+=st.spent;redoStack.push(st);sfx('undo');bumpMoney();updateUR();}
function redo(){const st=redoStack[redoStack.length-1];if(!st)return;if(S.money<st.spent){toast(TXN.deshacer.no_llega_rehacer);sfx('bad');return;}redoStack.pop();restore(st.after);S.money-=st.spent;undoStack.push(st);sfx('undo');bumpMoney();updateUR();}
function updateUR(){const u=document.getElementById('undob'),r=document.getElementById('redob');if(u)u.disabled=!undoStack.length;if(r)r.disabled=!redoStack.length;}

