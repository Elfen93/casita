setTimeout(()=>{try{
 menu.classList.remove('open');
 const box=document.createElement('div');box.style.cssText='position:fixed;inset:0;background:#f6efe4;z-index:99;display:flex;flex-wrap:wrap;gap:6px;padding:6px;align-content:flex-start';document.body.appendChild(box);
 const moods=[80,60,75,40,90,55,70,30,65,85,50,72,60,45,88,66];
 for(let i=0;i<16;i++){const ch=randomChar();if(i===0){Object.assign(ch,{...DEFCHAR,faceSeed:'ana1'});}const c=document.createElement('canvas');c.width=200;c.height=200;c.style.cssText='position:static;width:96px;height:96px';box.appendChild(c);paintPortrait(c,ch,moods[i]);}
 document.title='OK';
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},400);
