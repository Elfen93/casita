setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));};
 S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';S.money=600;S.r3d='simple';
 for(let k=0;k<480*20;k++){update(3);dlgTick();}
 const B=BKS();const M=bkMonth();bkHucha(hrs(5));
 // guardar y cargar
 save();const m0=S.money;load();bkInstall();const m1=S.money;S.money+=10;
 phOpen&&phOpen();phApp='bank';bkTab='resumen';phRender();const t1=document.getElementById('phone').innerText.replace(/\s+/g,' ').slice(0,300);bkTab='mov';phRender();const t2=document.getElementById('phone').innerText.replace(/\s+/g,' ').slice(0,200);bkTab='deudas';phRender();const t3=document.getElementById('phone').innerText.replace(/\s+/g,' ').slice(0,200);
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),n:B.log.length,cats:M.cat,hucha:B.hucha,saveload:[m0,m1,S.money],t1,t2,t3});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
