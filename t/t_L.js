setTimeout(()=>{try{S=newState('normal');S.char={...DEFCHAR,name:'Pablo',g:'m'};
const t=['Empieza de becaria en X.','Ana ahora es técnica.','La han elegido delegada sindical.','Hazte a ti misma','Su jefe la felicitó.','La casa suena distinta.','Ana está cansada y sola.','La administrativa Ana, afiliada, la mira.','no la ascienden','Está embarazada'];
document.title='OK '+JSON.stringify({l:t.map(L)});}catch(err){document.title='ERR '+err.message}},300);
