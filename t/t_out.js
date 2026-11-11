setTimeout(()=>{try{document.title='OK '+JSON.stringify(OUT.amigos)+' || '+JSON.stringify(OUT.deporte)+' || '+outBack.toString().slice(0,600);}catch(err){document.title='ERR '+err.message}},300);
