setTimeout(()=>{try{document.title='OK '+Object.entries(OBJ).map(([k,o])=>k+'='+o.p+(o.cat?'/'+o.cat:'')).join(' ');}catch(err){document.title='ERR '+err.message}},300);
