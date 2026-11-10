setTimeout(()=>{try{S=newState('normal');S.char={...DEFCHAR,g:'m',name:'Oury'};openCreator('normal',false);cre.g='m';renderCreator('normal',false);
 const bad=[];for(const k of Object.keys(TRAITS).filter(k=>!TRAITS[k].hid)){cre.traits=[];renderCreator('normal',false);const b=card.querySelector(`[data-trait="${k}"]`);if(!b){bad.push(k+':nobtn');continue;}b.click();if(!cre.traits.includes(k))bad.push(k+':noclick');}
 const keys=[...card.querySelectorAll('[data-trait]')].map(b=>b.dataset.trait).filter(k=>!TRAITS[k]);
 document.title='OK '+JSON.stringify({bad,keys,labels:[...card.querySelectorAll('[data-trait]')].slice(0,12).map(b=>b.textContent),errs:__errs.slice(0,3)});}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,300)}},300);
