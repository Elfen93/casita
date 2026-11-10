setTimeout(()=>{try{const errs=[];console.error=(...a)=>{errs.push(String(a[0]).slice(0,300));};
 S=newState('normal');S.char={...randomChar(),g:'f'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();S.autoHome=true;S.r3d='simple';
 for(let k=0;k<480*15;k++){update(3);dlgTick();}
 openMenu('vida');const v=card.innerText.replace(/\s+/g,' ').slice(0,260);const h3=[...card.querySelectorAll('h3')].map(h=>h.textContent.trim().slice(0,18)+(h.dataset.open==='1'?'▾':'▸'));
 h3open=card.querySelectorAll('h3')[5];if(h3open)h3open.click();const after=card.querySelectorAll('h3')[5].dataset.open;
 openMenu('historia');S.histF='imp';openMenu('historia');const n=[...card.querySelectorAll('.entry')].filter(e=>e.style.display!=='none').length;const tot=card.querySelectorAll('.entry').length;
 toast('💭 Ana quiere algo');toast('💭 otra cosa');const tc=document.getElementById('toasts').children.length;
 setTimeout(()=>{document.title='OK '+JSON.stringify({errs:errs.slice(0,3),v,h3,after,hist:[n,tot],tc});},400);
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,400)}},300);
