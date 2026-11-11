setTimeout(()=>{try{document.title='OK '+Object.keys(PLACES).join(' ');}catch(err){document.title='ERR '+err.message}},300);
