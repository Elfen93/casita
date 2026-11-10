setTimeout(()=>{try{S=newState('facil');for(let k=0;k<480*40;k++)update(3);document.title='OK '+S.day+' objs='+S.obj.filter(Boolean).length;}catch(err){document.title='ERR '+err.message}},300);
