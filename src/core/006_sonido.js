// ---------- sonido ----------
let AC=null;
function sfx(name){
  if(!S.sound)return;
  const SFX={place:[[520,.07]],sell:[[330,.1],[260,.1,.06]],cash:[[660,.08],[990,.14,.08]],level:[[523,.1],[659,.1,.1],[784,.1,.2],[1046,.22,.3]],bad:[[220,.18]],tap:[[700,.04]],pick:[[440,.06],[620,.06,.05]],build:[[392,.06],[523,.06,.05],[659,.1,.1]],undo:[[600,.05],[450,.07,.05]]};
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==='suspended')AC.resume();
    const t0=AC.currentTime;
    for(const [f,d,st=0] of SFX[name]){const o=AC.createOscillator(),g=AC.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0.0001,t0+st);g.gain.exponentialRampToValueAtTime(0.12,t0+st+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t0+st+d);o.connect(g);g.connect(AC.destination);o.start(t0+st);o.stop(t0+st+d+0.03);}
  }catch(e){}
}

