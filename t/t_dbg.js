setTimeout(()=>{try{S.day=300;document.title='OK '+seasonOf()+' '+JSON.stringify(dateOf(300))+' snow'+S.snow;}catch(err){document.title='ERR '+err.message}},300);
