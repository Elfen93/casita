// =================== VOCES: cada persona piensa a su manera, y lo que se comenta depende del sistema en el que vivís ===================
const IDEO_DIST=DATA.ideologias.reparto;
function ideoRand(old){let t=0;const L=IDEO_DIST.map(([k,w])=>[k,w*(old&&k==='conservadora'?1.6:old&&(k==='anarquista'||k==='libertaria')?.4:1)]);for(const x of L)t+=x[1];let r=Math.random()*t;for(const [k,w] of L){r-=w;if(r<=0)return k;}return 'apolitica';}
// la familia se parece: la madre tira hacia el bloque de quien la crió (o al revés)
const LEFTB=['marxista','anarquista','socialdemocrata','ecologista'];
function ideoFor(p){if(p.k==='madre'&&S.ideo&&S.ideo!=='apolitica'&&Math.random()<.55){return LEFTB.includes(S.ideo)?pickR(TXHZ.voces.socialdemocrata_lista):pickR(TXHZ.voces.conservadora_lista);}return ideoRand(p.k==='madre');}
{const _dl=dailyEvents;dailyEvents=function(){const r=_dl.apply(this,arguments);try{for(const p of S.people||[]){if(!p.ideo||!IDEOS[p.ideo])p.ideo=ideoFor(p);}}catch(e){}return r;};}
// en Gente se ve de qué pie cojea cada cual
{const _gt=genteTab;genteTab=function(){let h=_gt.apply(this,arguments);try{for(const p of S.people||[]){if(!p.ideo||!IDEOS[p.ideo])p.ideo=ideoFor(p);h=h.replace(`<b>${p.n}</b> <small></small>`,`<b>${p.n}</b> <small>${IDEOS[p.ideo].e} ${IDEOS[p.ideo].n.toLowerCase()}</small>`);}}catch(e){}return h;};}
// ---- lo que ya no pega con los consejos: se cambia o se calla ----
const revNow=()=>typeof REV==='function'&&REV();
const merNow=()=>{const w=W_();return w.gov==='mercado'&&!w.era;};
const CAPI_RX=/subid[oa] la luz|sube la luz|factura de la luz|el casero|la casera|desahuci|eur[ií]bor|hipoteca variable|comisi[oó]n|ERE\b|despid|horas extra|dividend|bolsa|IBEX|fondo de inversi|fondos buitre|patronal|cesta de la compra|pisos tur[ií]sticos|subida del alquiler|te ha subido/i;
const SAFE_RX=/asamblea|consejo|Banca Pública|caja común|comuna|delegad/i;
const REV_QUEJAS=DATA.gobiernos.quejas_consejos;
const MER_QUEJAS=DATA.gobiernos.quejas_mercado;
function revFix(t){if(typeof t!=='string'||SAFE_RX.test(t))return t;let x=t.replace(/El casero cobró el alquiler de la semana/g,TXHZ.voces.cuota_vivienda_semana).replace(/Alquiler semanal/g,TXHZ.voces.cuota_vivienda).replace(/\bsu jefe\b/g,TXHZ.voces.delegado).replace(/\bel jefe\b/g,TXHZ.voces.delegado);
  if(CAPI_RX.test(x))return null;return x;}
{const _t=tell;tell=function(txt,ic,kind){try{if(revNow()){const x=revFix(txt);if(x===null){if(Math.random()<.5)return;return _t.call(this,pickR(REV_QUEJAS),'🗣️',kind);}txt=x;}}catch(e){}return _t.call(this,txt,ic,kind);};}
{const _to=toast;toast=function(msg,gold){try{if(revNow()){const x=revFix(msg);if(x===null)return;msg=x;}}catch(e){}return _to.call(this,msg,gold);};}
// ---- el móvil: lo que te escriben depende de quién es y del sistema ----
const VOZ=DATA.ideologias.voces;
VOZ.comunas=VOZ.consejos;
{const _pt=phTemplates;phTemplates=function(p){const L=_pt.apply(this,arguments);try{let out=L;if(revNow())out=L.filter(x=>!(typeof x[0]==='string'&&CAPI_RX.test(x[0])&&!SAFE_RX.test(x[0])));
  const w=W_();const g=w.era||w.gov;const V=VOZ[g];if(V&&p.ideo){const lines=V[p.ideo]||[];for(const t of lines)out.push([t,'gen',1.5]);}if(out!==L){L.length=0;L.push(...out);}}catch(e){}return L;};}
// ---- las noticias del móvil ----
{const _pn=phNews;phNews=function(){const L=_pn.apply(this,arguments);try{if(revNow()){const keep=L.filter(x=>!CAPI_RX.test((x[1]||'')+' '+(x[2]||'')));const extra=[['🏛️',pickR(TXHZ.voces.consejo_distrito_aprueba_abrir_tres_lista),''],['🚢',pickR(TXHZ.voces.bloqueo_retiene_barco_medicamentos_lista),''],['🗣️',pickR(REV_QUEJAS),'']];return extra.concat(keep).slice(0,6);}
  if(merNow()){return [['⭐',pickR(MER_QUEJAS),''],...L].slice(0,6);}}catch(e){}return L;};}
