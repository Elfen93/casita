setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'f'};S.traits=['artista'];S.ideo='marxista';initPeople();applyHome('viejo');startTrack('super',true);rollWeather();newToday();storyStart();S.autoHome=false;S.money=3000;S.r3d='simple';
 const free=[];for(let i=0;i<N*N;i++){const x=i%N,y=i/N|0;if(!S.obj[i]&&inArea(x,y)&&S.floor[i]&&S.wall[i]===0)free.push(i);}
 S.obj[free[6]]={t:'caballete',q:3,c:100,r:0};dirty();uidSweep();computeRooms();LB().cur_art={t:'Patio',h:10,need:20};
 S.t=12*60;centerOnWorld(free[6]%N,free[6]/N|0);setTimeout(()=>{openShop('libreria');document.title='OK';},800);
}catch(err){document.title='ERR '+err.message}},300);
