setTimeout(()=>{try{
 S=newState('normal');S.char={...DEFCHAR};menu.classList.remove('open');
 const c=document.createElement('canvas');c.width=1200;c.height=760;c.style.cssText='position:fixed;left:0;top:0;width:600px;height:380px;z-index:99;background:#f3efe6';document.body.appendChild(c);
 const old=ctx;ctx=c.getContext('2d');
 const styles=['melena','coleta','media','corto','rizos','afro','mono','rapado'];
 const chs=styles.map((st,k)=>({...DEFCHAR,style:st,g:k%3===1?'m':'f',beard:k===3?'corta':'no',skin:SKINS[k%6],hair:HAIRCOLS[k%7],shirt:SHIRTC[k],glasses:k===2}));
 const t=performance.now()/1000;
 chs.forEach((ch,k)=>{ctx.setTransform(2.6,0,0,2.6,0,0);anaRT.phase=k*0.8;drawAna(30+k*28,62,{ch,shirt:ch.shirt,mood:70,front:true,right:true,pose:'stand'});});
 chs.forEach((ch,k)=>{ctx.setTransform(2.6,0,0,2.6,0,0);anaRT.phase=k*0.9;drawAna(30+k*28,130,{ch,shirt:ch.shirt,mood:70,front:k%2===0,right:k%4<2,pose:'walk'});});
 ctx.setTransform(2.6,0,0,2.6,0,0);drawAna(60,190,{ch:chs[0],shirt:chs[0].shirt,mood:70,front:true,right:true,pose:'sit',act:'type'});drawAna(110,190,{ch:chs[1],shirt:chs[1].shirt,mood:70,front:true,right:true,pose:'stand',act:'hammer'});drawAna(160,190,{ch:chs[2],shirt:chs[2].shirt,mood:70,front:false,right:true,pose:'stand'});
 ctx=old;document.title='OK';
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
