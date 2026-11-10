setTimeout(()=>{try{
 openCreator('normal',false);cre={...cre,g:'m',name:'Hugo',style:'rizos',beard:'corta',glasses:true,skin:'#9a623c',hair:'#1d1714',shirt:'#3a86ff',traits:['artista']};renderCreator('normal',false);
 document.title='OK';
}catch(err){document.title='ERR '+err.message+' '+err.stack.slice(0,500)}},300);
