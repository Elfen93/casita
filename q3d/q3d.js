// ---------- muñecos Quaternius: modelos reales con animaciones (CC0) ----------
const Q3D=(()=>{
const T=window.THREE;const BASE=(typeof Q3D_BASE!=='undefined')?Q3D_BASE:((location.protocol==='file:'||/github\.io$/.test(location.hostname)||location.hostname==='localhost')?'q3d/':'https://elfen93.github.io/casita/q3d/');
let anims=null,animsP=null,fail=false;const models={},modelP={};const inst=new Map();const FC=new Map();
function loadAnims(){if(animsP)return animsP;animsP=fetch(BASE+'anims_lite.json').then(r=>r.json()).then(d=>{const dec=s=>{const b=atob(s);const a=new Int16Array(b.length/2);for(let i=0;i<a.length;i++)a[i]=(b.charCodeAt(i*2)|(b.charCodeAt(i*2+1)<<8))<<16>>16;return a;};
  const out={};for(const k in d.clips){const c=d.clips[k];const tr={};for(const nm in c.tr)tr[nm]=dec(c.tr[nm]);out[k]={d:c.d,n:c.n,fps:d.fps,tr};}anims=out;return out;}).catch(e=>{console.error('Q3D anims',e);fail=true;});return animsP;}
const TCH={UpperArmL:'LowerArmL',LowerArmL:'WristL',UpperLegL:'LowerLegL',LowerLegL:'FootL',UpperArmR:'LowerArmR',LowerArmR:'WristR',UpperLegR:'LowerLegR',LowerLegR:'FootR',ShoulderL:'UpperArmL',ShoulderR:'UpperArmR'};
// adapta un clip (deltas en el mundo) al esqueleto de esta instancia
function adapt(I,name){const c=anims[name];if(!c||!I.bind)return null;const n=c.n,times=new Float32Array(n);for(let i=0;i<n;i++)times[i]=Math.min(c.d,i/c.fps);
  const R=I.bind,order=I.order;const data={};const hipsP=new Float32Array(n*3);const hipH=R.Hips?R.Hips.p.y:.9;const q=new T.Quaternion(),pw=new T.Quaternion(),tw=new T.Quaternion();
  const world={};// orientación mundial calculada por hueso en este fotograma
  for(let i=0;i<n;i++){for(const o of order){const nm=o.name;const par=o.parent;const parQ=par&&par.isBone&&world[par.name]?world[par.name]:(I.rootQ[nm]||null);
      const tr=c.tr[nm];let wq;
      if(tr&&R[nm]){const w4=tr[i*4+3];
        if(w4===20000){const child=TCH[nm];const dir=new T.Vector3(tr[i*4]/10000,tr[i*4+1]/10000,tr[i*4+2]/10000).normalize();const bd=child&&R[child]?R[child].p.clone().sub(R[nm].p).normalize():null;q.identity();if(bd)q.setFromUnitVectors(bd,dir);wq=q.clone().multiply(R[nm].q);}
        else{q.set(tr[i*4]/10000,tr[i*4+1]/10000,tr[i*4+2]/10000,w4/10000).normalize();wq=q.clone().multiply(R[nm].q);}}
      else if((nm==='FootL'||nm==='FootR')&&R[nm])wq=R[nm].q.clone();
      else wq=parQ?parQ.clone().multiply(o.userData.restQ||o.quaternion):(o.userData.restQ||o.quaternion).clone();
      world[nm]=wq;const lq=parQ?parQ.clone().invert().multiply(wq):wq;if(!data[nm])data[nm]=new Float32Array(n*4);data[nm].set([lq.x,lq.y,lq.z,lq.w],i*4);}
    const hp=c.tr.HIPS;if(hp&&I.body){const d=new T.Vector3(hp[i*3]/10000,hp[i*3+1]/10000,hp[i*3+2]/10000).multiplyScalar(hipH);const lp=I.body0.clone().add(d);hipsP.set([lp.x,lp.y,lp.z],i*3);}}
  const tracks=[];for(const k in data)tracks.push(new T.QuaternionKeyframeTrack(k+'.quaternion',times,data[k]));if(c.tr.HIPS&&I.body)tracks.push(new T.VectorKeyframeTrack('Body.position',times,hipsP));
  return new T.AnimationClip(name,c.d,tracks);}
function loadModel(key){if(models[key])return Promise.resolve(models[key]);if(modelP[key])return modelP[key];const L=new T.GLTFLoader();
  modelP[key]=L.loadAsync(BASE+'chars/'+key+'.glb').then(g=>{g.scene.traverse(o=>{if(o.isMesh){o.frustumCulled=false;const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){m.metalness=0;m.roughness=.85;}}});models[key]=g;return g;}).catch(e=>{console.error('Q3D model',key,e);models[key]=false;});return modelP[key];}
// qué modelo según género y conjunto
const OUT_M={basico:'m_Casual_2',hiphop:'m_Casual_Hoodie',mono:'m_Casual_2',chandal:'m_Beach',traje:'m_Suit',obrero:'m_Worker',vestido:'m_Casual_2',falda:'m_Casual_2',vaquera:'m_Casual_2',punk:'m_Punk',punto:'m_Farmer',deporte:'m_Beach'};
const OUT_W={basico:'w_Casual',hiphop:'w_Casual',mono:'w_Casual',chandal:'w_Casual',traje:'w_Suit',obrero:'w_Worker',vestido:'w_Formal',falda:'w_Formal',vaquera:'w_Casual',punk:'w_Punk',punto:'w_Casual',deporte:'w_Adventurer'};
function modelKey(ch){const g=ch.g==='x'?((ch.name||'').length%2?'m':'f'):(ch.g||'f');const o=ch.outfit||'basico';if(ch.helmet||ch.vest)return g==='m'?'m_Worker':'w_Worker';return (g==='m'?OUT_M:OUT_W)[o]||(g==='m'?'m_Casual_2':'w_Casual');}
function sig(ch){return [modelKey(ch),ch.skin,ch.hair,ch.eyes,ch.shirt,ch.pants,ch.shoes,ch.acc2,ch.age>=62?1:0].join('|');}
// construir una instancia coloreada
function bindify(root){let sm=null;root.traverse(o=>{if(o.isSkinnedMesh&&!sm)sm=o;});if(!sm)return null;root.updateMatrixWorld(true);const sk=sm.skeleton;const R={};for(let i=0;i<sk.bones.length;i++){const w=new T.Matrix4().copy(sk.boneInverses[i]).invert();R[sk.bones[i].name]={q:new T.Quaternion().setFromRotationMatrix(w),p:new T.Vector3().setFromMatrixPosition(w)};}
  root.traverse(o=>{if(!o.isBone||!R[o.name]||o.name==='Root')return;const isB=o.parent&&o.parent.isBone&&o.parent.name!=='Root'&&R[o.parent.name];const pw=isB?R[o.parent.name].q:new T.Quaternion().setFromRotationMatrix(o.parent.matrixWorld);const pp=isB?R[o.parent.name].p:new T.Vector3().setFromMatrixPosition(o.parent.matrixWorld);o.quaternion.copy(pw.clone().invert().multiply(R[o.name].q));o.position.copy(R[o.name].p.clone().sub(pp).applyQuaternion(pw.clone().invert()));});root.updateMatrixWorld(true);root.traverse(o=>{if(o.isBone)o.userData.restQ=o.quaternion.clone();});return R;}
function build(ch){const key=modelKey(ch);const g=models[key];if(!g)return null;const root=T.SkeletonUtils.clone(g.scene);const R=bindify(root);root.updateMatrixWorld(true);const order=[];let hips=null,body=null;const rootQ={};root.traverse(o=>{if(o.isBone){order.push(o);if(o.name==='Hips')hips=o;if(o.name==='Body')body=o;if(!(o.parent&&o.parent.isBone))rootQ[o.name]=new T.Quaternion().setFromRotationMatrix(o.parent.matrixWorld);}});const skin=ch.skin||'#efc39b',hair=ch.age>=62&&ch.hair!=='#bdbdbd'?'#b8b8b8':(ch.hair||'#3e2a1e');
  const cols={shirt:ch.shirt||'#ff8a5b',pants:ch.pants||'#3d405b',shoes:ch.shoes||'#2c2833',acc2:ch.acc2||ch.shirt||'#888'};const uni=ch.helmet||ch.vest;
  const pieceOf=o=>{let p=o;while(p){const n=p.name||'';if(/Head/i.test(n))return 'head';if(/Body/i.test(n))return 'body';if(/Leg/i.test(n))return 'legs';if(/Feet|Shoe|Boot/i.test(n))return 'feet';p=p.parent;}return 'other';};
  const cnt={};root.traverse(o=>{if(!o.isMesh)return;const piece=pieceOf(o);const ms=Array.isArray(o.material)?o.material:[o.material];const out=ms.map(m=>{const n=m.name||'';const mm=m.clone();mm.metalness=0;mm.roughness=.85;
      if(n==='Skin'||/^Skin/.test(n))mm.color.set(skin);
      else if(/Hair/i.test(n))mm.color.set(hair);
      else if(piece==='head')mm.color.set(hair).multiplyScalar(.55);// cejas y ojos
      else if(uni){if(piece==='body'){const k=cnt.body=(cnt.body||0)+1;mm.color.set(ch.vest?(k===1?'#ff7a1a':'#e9e4dc'):'#2f5d8a');}else if(piece==='legs')mm.color.set('#2c3a5c');else if(piece==='feet')mm.color.set('#4a2c1c');}
      else if(piece==='body'){const k=cnt.body=(cnt.body||0)+1;mm.color.set(k===1?cols.shirt:cols.acc2);}
      else if(piece==='legs'){const k=cnt.legs=(cnt.legs||0)+1;mm.color.set(k===1?cols.pants:cols.shoes);}
      else if(piece==='feet')mm.color.set(cols.shoes);
      return mm;});o.material=Array.isArray(o.material)?out:out[0];});
  const mixer=new T.AnimationMixer(root);const clips={};for(const c of g.animations)clips[c.name]=c;
  const I={root,mixer,clips,cur:null,act:null,bind:R,order,hips,body,body0:body?body.position.clone():new T.Vector3(),rootQ,hasAnims:false};return I;}
function getInst(ch){const k=sig(ch);let I=inst.get(k);if(!I){I=build(ch);if(!I)return null;inst.set(k,I);if(inst.size>36){const f=inst.keys().next().value;inst.delete(f);}}
  if(anims&&!I.hasAnims){I.hasAnims=true;for(const k2 in I.clips)if(k2.startsWith('SIT:'))delete I.clips[k2];for(const k2 in anims){try{const cl=adapt(I,k2);if(cl)I.clips[k2]=cl;}catch(e){console.error('adapt',k2,e);}}I.cur=null;}return I;}
// qué animación toca
const ACT_CLIP={type:'Sitting_Talking_Loop',work:'PickUp_Table',eat:'Consume',stir:'PickUp_Table',comedor:'Consume',book:'Idle_FoldArms_Loop',phone:'Idle_TalkingPhone_Loop',strum:'Dance_Loop',paint:'Farm_PlantSeed',hammer:'Fixing_Kneeling',dig:'Farm_Harvest',water:'Farm_Watering',cheer:'Dance_Loop',manifestacion:'Wave',militancia:'Idle_Talking_Loop',talk:'Idle_Talking_Loop',amigos:'Idle_Talking_Loop',networking:'Idle_Talking_Loop',voluntariado:'PickUp_Table',shower:'Idle_Neutral',watch:'Idle_FoldArms_Loop',wave:'Wave',dance:'Dance_Loop',sad:'Idle_No_Loop'};
const SIT_UP={type:'PickUp_Table',eat:'Consume',comedor:'Consume',book:'Idle_FoldArms_Loop',phone:'Idle_TalkingPhone_Loop',talk:'Idle_Talking_Loop',amigos:'Idle_Talking_Loop',watch:'Idle_FoldArms_Loop',strum:'Dance_Loop',work:'PickUp_Table'};
function pick(I,o){const sit=o.pose==='sit',walk=o.pose==='walk';let nm;
  if(walk)nm=o.run?'Run':'Walk';else if(sit){const up=(o.act&&SIT_UP[o.act])||(o.act&&I.clips[o.act]?o.act:'Idle_Loop');nm='SIT:'+up;if(!I.clips[nm]){const c=makeSit(I,up);if(c)I.clips[nm]=c;}}else if(o.act&&ACT_CLIP[o.act])nm=ACT_CLIP[o.act];else if(o.act&&I.clips[o.act])nm=o.act;else nm=o.sad?'Idle_No_Loop':(I.clips.Idle_Neutral?'Idle_Neutral':'Idle_Loop');
  if(!I.clips[nm])nm=I.clips.Idle_Loop?'Idle_Loop':'Idle';return I.clips[nm]?nm:Object.keys(I.clips)[0];}
// sentado propio: piernas en ángulo recto y tronco erguido; los brazos vienen de otro clip (o reposo)
const UPPER=new Set(['Abdomen','Torso','Chest','Neck','Head','ShoulderL','UpperArmL','LowerArmL','WristL','ShoulderR','UpperArmR','LowerArmR','WristR']);
function makeSit(I,upperName){const R=I.bind;if(!R||!R.Hips)return null;const up=upperName==='__none'?null:(I.clips[upperName]||I.clips.Idle_Loop);const upT={};if(up)for(const t of up.tracks){const bn=t.name.split('.')[0];if(UPPER.has(bn)&&t.name.endsWith('quaternion'))upT[bn]=t;}
  const n=up?up.tracks[0].times.length:2,times=up?up.tracks[0].times:new Float32Array([0,1]),dur=up?up.duration:1;
  const hipH=R.Hips.p.y;const thigh=R.LowerLegL&&R.UpperLegL?R.LowerLegL.p.clone().sub(R.UpperLegL.p).length():.45;
  const dirs={UpperLegL:new T.Vector3(.1,-.08,1).normalize(),UpperLegR:new T.Vector3(-.1,-.08,1).normalize(),LowerLegL:new T.Vector3(-.02,-1,-.05).normalize(),LowerLegR:new T.Vector3(.02,-1,-.05).normalize()};
  const data={};const hp=new Float32Array(n*3);const world={};const q=new T.Quaternion();
  for(let i=0;i<n;i++){for(const o of I.order){const nm=o.name,par=o.parent;const parQ=par&&par.isBone&&world[par.name]?world[par.name]:(I.rootQ[nm]||null);let wq,lq;
      if(dirs[nm]&&R[nm]){const child=TCH[nm];const bd=child&&R[child]?R[child].p.clone().sub(R[nm].p).normalize():new T.Vector3(0,-1,0);wq=q.clone().setFromUnitVectors(bd,dirs[nm]).multiply(R[nm].q);lq=parQ?parQ.clone().invert().multiply(wq):wq;}
      else if(upT[nm]){const v=upT[nm].values;lq=new T.Quaternion(v[i*4],v[i*4+1],v[i*4+2],v[i*4+3]);wq=parQ?parQ.clone().multiply(lq):lq.clone();}
      else if((nm==='FootL'||nm==='FootR')&&R[nm]){wq=R[nm].q.clone();lq=parQ?parQ.clone().invert().multiply(wq):wq;}
      else{lq=(o.userData.restQ||o.quaternion).clone();wq=parQ?parQ.clone().multiply(lq):lq.clone();}
      world[nm]=wq;if(!data[nm])data[nm]=new Float32Array(n*4);data[nm].set([lq.x,lq.y,lq.z,lq.w],i*4);}
    const lp=I.body0.clone();lp.y-=thigh*.96-Math.sin(i/n*Math.PI*2)*.004;lp.z+=.02;hp.set([lp.x,lp.y,lp.z],i*3);}
  const tracks=[];for(const k in data)tracks.push(new T.QuaternionKeyframeTrack(k+'.quaternion',times,data[k]));tracks.push(new T.VectorKeyframeTrack('Body.position',times,hp));return new T.AnimationClip('SIT:'+upperName,dur,tracks);}
let rd=null,scn=null,cam=null;
function ensure(){if(rd)return;rd=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});rd.setPixelRatio(1);rd.outputColorSpace=T.SRGBColorSpace;scn=new T.Scene();scn.add(new T.HemisphereLight('#fff6ea','#6a6078',1.6));const key=new T.DirectionalLight('#fff1dc',2.4);key.position.set(-2,3,3.2);scn.add(key);const rim=new T.DirectionalLight('#bcd2ff',1);rim.position.set(3,2,-3);scn.add(rim);const fill=new T.DirectionalLight('#ffffff',.5);fill.position.set(2,1,3);scn.add(fill);cam=new T.OrthographicCamera(-1,1,1,-1,.1,30);const el=Math.atan(.5);cam.position.set(0,Math.sin(el)*10,Math.cos(el)*10);cam.lookAt(0,0,0);}
// ¿puede dibujar ya a este personaje? (si no, dispara la carga y devuelve false)
function ready(ch){if(fail)return false;if(!anims){loadAnims();return false;}const k=modelKey(ch);if(models[k])return true;if(models[k]===false)return false;loadModel(k);return false;}
function draw(ctx2,ch,x,y,px,o={},sc=1){ensure();const I=getInst(ch);if(!I)return false;const nm=pick(I,o);const clip=I.clips[nm];
  const walk=o.pose==='walk';const TW2=Math.PI*2;let t;if(walk){const ph=((o.ph||0)%TW2+TW2)%TW2;t=ph/TW2*clip.duration;}else t=((o.t||0)+(ch.name||'').length*.37)%clip.duration;
  const fps=walk?16:8;const tq=Math.round(t*fps)/fps;
  const W=Math.ceil(px*1.7),H=Math.ceil(px*2.4);const fk=sig(ch)+'|'+nm+'|'+tq.toFixed(3)+'|'+(o.yaw||0).toFixed(2)+'|'+W;
  let F=FC.get(fk);if(F){FC.delete(fk);FC.set(fk,F);ctx2.drawImage(F,x-F.width/2/sc,y-F.height*.85/sc,F.width/sc,F.height/sc);return true;}
  if(I.cur!==nm){if(I.action)I.action.stop();I.action=I.mixer.clipAction(clip);I.action.play();I.cur=nm;}
  I.mixer.setTime(tq%clip.duration);I.root.rotation.y=o.yaw||0;I.root.position.set(0,o.pose==='sit'?.02:0,0);
  const sz=rd.getSize(new T.Vector2());if(sz.x!==W||sz.y!==H)rd.setSize(W,H,false);const hw=W/2/px,hh=H/px;cam.left=-hw;cam.right=hw;cam.top=hh*.85;cam.bottom=-hh*.15;cam.updateProjectionMatrix();
  scn.add(I.root);rd.setClearColor(0,0);rd.clear();rd.render(scn,cam);scn.remove(I.root);
  const src=rd.domElement;F=document.createElement('canvas');F.width=src.width;F.height=src.height;F.getContext('2d').drawImage(src,0,0);FC.set(fk,F);if(FC.size>260){const k=FC.keys().next().value;FC.delete(k);}
  ctx2.drawImage(F,x-F.width/2/sc,y-F.height*.85/sc,F.width/sc,F.height/sc);return true;}
function preload(list){loadAnims();for(const ch of list)loadModel(modelKey(ch));}
function drawBind(ctx2,ch,x,y,px,yaw){ensure();const I=getInst(ch);if(!I)return false;if(I.action)I.action.stop();I.cur=null;I.root.traverse(o=>{if(o.isBone&&o.userData.restQ)o.quaternion.copy(o.userData.restQ);});I.root.rotation.y=yaw||0;
  const W=Math.ceil(px*1.7),H=Math.ceil(px*2.4);rd.setSize(W,H,false);const hw=W/2/px,hh=H/px;cam.left=-hw;cam.right=hw;cam.top=hh*.85;cam.bottom=-hh*.15;cam.updateProjectionMatrix();scn.add(I.root);rd.setClearColor(0,0);rd.clear();rd.render(scn,cam);scn.remove(I.root);ctx2.drawImage(rd.domElement,x-W/2,y-H*.85);return true;}
return {draw,drawBind,ready,preload,modelKey,sig,models:()=>models,anims:()=>anims,inst:()=>inst};
})();
