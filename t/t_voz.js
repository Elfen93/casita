setTimeout(()=>{try{S=newState('normal');S.char={...randomChar(),g:'m'};initPeople();applyHome('viejo');startTrack('oficina',true);rollWeather();newToday();storyStart();
 const out=[];S.t=1439;update(1);out.push('ideos='+S.people.map(p=>p.n+':'+p.ideo).join(','));
 const w=W_();w.era='consejos';w.gov='consejos';S.gv={since:S.day-20,ph:3,pre:null,lack:[],prop:-99,comedor:0,elec:0,ev:0};
 const m=S.people.find(p=>p.k==='madre');const T=phTemplates(m).map(x=>x[0]);out.push('luz='+T.some(t=>/luz/.test(t))+' voz='+T.filter(t=>VOZ.consejos[m.ideo]&&VOZ.consejos[m.ideo].includes(t)).length);
 const n0=(S.story&&S.story.log||[]).length;tell('¿Has visto lo que ha subido la luz?');out.push('news='+phNews().map(x=>x[1]).slice(0,3).join(' | '));
 openMenu('gente');out.push('gente='+/apolítica|conservadora|marxista|liberal|socialdem|ecolog|anarq|libertaria/i.test(card.innerText));
 document.title='OK '+out.join(' ;; ')+' errs='+window.__errs.length+' '+(window.__errs[0]||'');
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,200)}},300);
