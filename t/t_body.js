setTimeout(()=>{try{
 menu.classList.remove('open');
 const c=document.createElement('canvas');c.width=1200;c.height=760;c.style.cssText='position:fixed;left:0;top:0;width:600px;height:380px;z-index:99;background:#f6efe4';document.body.appendChild(c);
 const old=ctx;ctx=c.getContext('2d');
 const chars=[{...DEFCHAR,style:'melena'},{...DEFCHAR,g:'m',style:'corto',beard:'corta',hair:'#1d1714',skin:'#c68a5c',shirt:'#3a86ff'},{...DEFCHAR,style:'coleta',hair:'#d1ab68',shirt:'#00bb7f'},{...DEFCHAR,g:'m',style:'rizos',skin:'#6a3f25',hair:'#1d1714',shirt:'#e9c46a'},{...DEFCHAR,style:'afro',skin:'#9a623c',hair:'#1d1714',shirt:'#9b5de5'},{...DEFCHAR,style:'mono',hair:'#bdbdbd',glasses:true,shirt:'#c0392b'}];
 // fila 1: de pie de frente; fila 2: andando (fases); fila 3: espaldas y sentado/acciones
 for(let i=0;i<6;i++){const ch=chars[i];
   ctx.setTransform(3,0,0,3,90+i*190,230);anaRT.phase=0;drawAna(0,0,{ch,shirt:ch.shirt,mood:70,front:true,right:true,pose:'stand'});
   ctx.setTransform(3,0,0,3,90+i*190,470);anaRT.phase=i*1.05;drawAna(0,0,{ch,shirt:ch.shirt,mood:70,front:true,right:i%2===0,pose:'walk'});
   ctx.setTransform(3,0,0,3,90+i*190,720);anaRT.phase=0;drawAna(0,0,{ch,shirt:ch.shirt,mood:50,front:i%2===1,right:true,pose:i===4?'sit':'stand',act:['type','hammer',null,'talk','eat','book'][i]});}
 ctx=old;document.title='OK';
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},400);
