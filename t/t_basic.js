setTimeout(()=>{try{
 const out={};
 out.first=document.getElementById('menucard').innerText.slice(0,80);
 chooseDifficulty(true);document.querySelector('[data-nd="normal"]').click();
 out.cre=document.getElementById('menucard').innerText.slice(0,60);
 document.querySelector('[data-k="g"][data-v="m"]').click();
 document.querySelector('[data-k="style"][data-v="rizos"]').click();
 document.getElementById('crename').value='Pablo';document.getElementById('crename').oninput();
 document.getElementById('creok').click();
 out.name=S.char.name;out.g=S.char.g;
 for(let k=0;k<14400*3;k++)update(3);
 out.day=S.day;out.money=Math.round(S.money);out.weather=S.weather;out.log=S.story.log.slice(-12).map(e=>e.ic+' '+e.txt.replace(/<[^>]+>/g,'').slice(0,260));
 out.people=S.people.map(p=>p.n+':'+Math.round(p.rel));out.pantry=S.pantry;out.weeds=(S.weeds||[]).length;
 openMenu('perfil');out.perfil=card.innerText.slice(0,300);openMenu('historia');openMenu('trabajo');openMenu('casa');out.casa=card.innerText.slice(0,500);openMenu('ajustes');
 menu.classList.remove('open');
 out.toasts=[...document.getElementById('toasts').children].map(e=>e.textContent);
 document.title='OK '+JSON.stringify({errs:__errs,...out});
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)+' '+JSON.stringify(__errs)}},500);
