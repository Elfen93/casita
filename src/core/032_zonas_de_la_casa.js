// ---------- zonas de la casa ----------
const ZONES=DATA.objetos.zonas;
const ZONE_ORDER=DATA.objetos.zonas_orden;
// dónde tiene sentido cada mueble (en orden de preferencia)
const OBJ_ZONES=DATA.objetos.zonas_por_objeto;
const SMALL_ITEMS=new Set(['silla','planta','lampara','alfombra','flores','arbol','seto','farola','mesa','huerto','bancoj','barbacoa','fuente']);
const ZONE_OF=DATA.objetos.zona_de;
const GROUP=DATA.objetos.grupo;
function roomPurpose(r){
  const z={};for(const c of r.cells){const v=S.zone&&S.zone[c];if(v)z[v]=(z[v]||0)+1;}
  let best=null,bn=0;for(const k in z)if(z[k]>bn){bn=z[k];best=k;}
  if(best&&bn>=r.cells.length*0.5)return best;
  const kinds=new Set();for(const c of r.cells){const o=S.obj[c];if(o&&ZONE_OF[o.t])kinds.add(ZONE_OF[o.t]);}
  if(kinds.size>=2)return 'loft';
  if(kinds.size===1){const k=[...kinds][0];
    // un cuarto que reparte el paso a otros (2+ puertas) no se trata como privado si nadie lo ha decidido así
    if(PRIVATE.has(k)){let doors=0;const seen=new Set();for(const c of r.cells){const x=c%N,y=c/N|0;for(const [a,b] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){if(!inb(a,b))continue;const j=idx(a,b);if(S.wall[j]===2&&!seen.has(j)){seen.add(j);doors++;}}}if(doors>=2)return 'loft';}
    return k;}
  if(r.cells.length<=3)return 'pasillo';
  return 'libre';
}
function roomLoad(r){let n=0;for(const c of r.cells){const o=S.obj[c];if(!o)continue;const d=OBJ[o.t];if(d.flat)continue;n+=(o.t==='planta'||o.t==='lampara'||o.t==='silla')?0.5:1;}return n;}
const roomCap=r=>Math.max(1,Math.floor(r.cells.length*0.42));
const roomFull=(r,t)=>roomLoad(r)+((t==='planta'||t==='lampara'||t==='silla')?0.5:1)>roomCap(r);
function allowedIn(t,p){const z=OBJ_ZONES[t]||['salon'];if(p==='loft')return !z.includes('jardin')||z.length>1;if(p==='libre')return !(z.length===1&&z[0]==='jardin');return z.includes(p);}
// en un loft agrupa cada cosa con las de su tipo y separa el baño del resto
function clusterScore(t,x,y){
  const g=GROUP[t];if(!g)return 0;let sc=0;
  for(let yy=y-3;yy<=y+3;yy++)for(let xx=x-3;xx<=x+3;xx++){if(!inb(xx,yy))continue;const o=S.obj[idx(xx,yy)];if(!o||!GROUP[o.t])continue;const d=Math.hypot(xx-x,yy-y),g2=GROUP[o.t];
    if(g2===g&&d<=2.3)sc+=3;
    else if((g==='bano')!==(g2==='bano')&&d<3)sc-=9;
    else if(((g==='cocina'&&g2==='dorm')||(g==='dorm'&&g2==='cocina'))&&d<2.5)sc-=4;}
  return sc;
}

