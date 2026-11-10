setTimeout(()=>{try{
 S=newState('normal');S.char={...DEFCHAR};menu.classList.remove('open');
 const styles=['melena','coleta','media','corto','rizos','afro','mono','rapado','calvo'];
 styles.forEach((st,k)=>{const c=document.createElement('canvas');c.width=200;c.height=200;c.style.cssText=`position:fixed;left:${(k%5)*120}px;top:${Math.floor(k/5)*120}px;width:110px;height:110px;z-index:99`;document.body.appendChild(c);
   paintPortrait(c,{...DEFCHAR,style:st,g:k%3===1?'m':'f',beard:k===3||k===8?'corta':'no',skin:SKINS[k%6],hair:HAIRCOLS[k%7],shirt:SHIRTC[k],glasses:k===2},72);});
 openCreator(null,true);
 document.title='OK';
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
