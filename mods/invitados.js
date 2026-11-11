// =================== QUE LAS VISITAS ENTREN: si se quedan clavadas fuera, pasan adentro ===================
{const _ur=updateResidents;updateResidents=function(gm){const r0=_ur.apply(this,arguments);try{for(const r of S.res||[]){if(r.kind!=='guest'||r.doing)continue;const cx=Math.floor(r.x),cy=Math.floor(r.y);const k=cx+','+cy;
    if(r.lastC!==k){r.lastC=k;r.still=0;continue;}if(r.path&&r.path.length){r.still=0;continue;}r.still=(r.still||0)+gm;
    const inside=inb(cx,cy)&&roomId[idx(cx,cy)]>=0;if(r.still<12||inside)continue;
    // buscar sitio dentro, cerca de la jugadora si está en casa
    const [ax,ay]=simCell();let best=null,bd=1e9;for(let i=0;i<N*N;i++){const x=i%N,y=i/N|0;if(!walkable(x,y)||roomId[i]<0)continue;if((S.res||[]).some(o=>o!==r&&Math.floor(o.x)===x&&Math.floor(o.y)===y))continue;const d=Math.hypot(x-ax,y-ay)+(x===ax&&y===ay?50:0);if(d<bd){bd=d;best=[x,y];}}
    if(best){const p=bfs([cx,cy],(x,y)=>x===best[0]&&y===best[1]);if(p&&p.length){r.path=p;}else{r.x=best[0]+.5;r.y=best[1]+.5;r.path=[];}r.still=0;}}}catch(e){}return r0;};}
// una visita no hace recados ni friega tu cocina: se sienta, charla, mira el móvil; sin sillas, en el borde de la cama
{const _rc=rvChoose;rvChoose=function(r){if(r.kind!=='guest')return _rc.apply(this,arguments);const _p=rvPlan;rvPlan=function(h){if(h>=23||h<7)return _p(h);return [[['sofa','sillon','butaca','sofacama'],'watch','sit',45,3],[['silla','mesacoc','banco','bancoj'],'phone','sit',30,2],[['cama','camamat','colchon','litera'],'book','sit',35,1.4],[['tele','consola'],'watch','stand',15,.4],[['libros','estant'],'book','stand',12,.6]];};try{return _rc.apply(this,arguments);}finally{rvPlan=_p;}};}
RV_SIT.add('cama');RV_SIT.add('camamat');RV_SIT.add('colchon');
