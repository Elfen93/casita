setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]&&a[0].stack||a[0]).slice(0,300));};
 S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;ex().dmode='ana';S.money=5000;S.r3d='simple';
 for(let k=0;k<480;k++)update(3);
 const m0=S.money;bpMove('ahorro',hrs(20));bpMove('fondos',hrs(20));bpMove('cripto',hrs(5));bpDeposit(hrs(20),6);bpLoan(hrs(60),12);const m1=S.money;
 for(let k=0;k<480*100;k++){update(3);if(S.money<300)S.money=800;}
 const b=BP();phOpen&&phOpen();phApp='bank';bkTab='prod';phRender();const t=document.getElementById('phone').innerText.replace(/\s+/g,' ').slice(0,400);bkTab='resumen';phRender();const tabs=[...document.querySelectorAll('#phone .phtabs button')].map(x=>x.textContent).join(',');
 document.title='OK '+JSON.stringify({errs:errs.slice(0,3),m:[m0,m1],b:{ah:Math.round(b.ahorro.v),dep:b.dep&&b.dep.v,fo:b.fondos.v,cr:b.cripto.v,loan:b.loan&&Math.round(b.loan.left)},tabs,t});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
