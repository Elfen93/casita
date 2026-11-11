// =================== PINTAR (Y PUERTAS Y VENTANAS): tocar la cara de la pared sirve, no hace falta acertar en su base ===================
{const _stc=screenToCell;screenToCell=function(sx,sy){const c=_stc(sx,sy);try{if(mode!=='live'&&tool&&['paint','door','win','window'].includes(tool.kind)){const [x,y]=c;if(inb(x,y)&&S.wall[idx(x,y)]>0)return c;
  let best=null,bd=1e9;for(let dx=-4;dx<=4;dx++)for(let dy=-4;dy<=4;dy++){const X=x+dx,Y=y+dy;if(!inb(X,Y))continue;const i=idx(X,Y);if(!(S.wall[i]>0))continue;const [px,py]=obCC(X,Y);const h=(S.wall[i]===4?18:WALL_H)*cam.z,w=TW*cam.z*.5;
    if(Math.abs(sx-px)<=w&&sy<=py+TH*cam.z*.5&&sy>=py-h-TH*cam.z*.4){const d=-py+Math.abs(sx-px)*.05;if(d<bd){bd=d;best=[X,Y];}}}
  if(best)return best;}}catch(e){}return c;};}
