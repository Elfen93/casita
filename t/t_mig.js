setTimeout(()=>{try{
 const st=newState('normal');delete st.char;delete st.people;delete st.story;delete st.today;delete st.weather;st.sim.shirt='#3a86ff';
 localStorage.setItem(KEY,JSON.stringify(st));
 document.title='SAVED';
}catch(err){document.title='ERR '+err.message}},300);
