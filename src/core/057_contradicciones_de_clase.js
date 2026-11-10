// ---------- contradicciones de clase ----------
function contraWeekly(){const c=ex(),cl=classOf();let d=-4;
  if(isLeft()){if(cl==='mando')d+=6+comp()*3;if(cl==='patrona')d+=7+comp()*3;if(cl==='rentista')d+=6+comp()*3;}
  if(isI('libertaria','liberal')){if(cl==='parada'&&S.paroWeeks>0)d+=4;if(S.track==='funcion')d+=3;}
  if(isI('conservadora')&&S.rentStrike)d+=4;
  c.contra=clamp(c.contra+d,0,100);
  if(c.contra>=55&&!c.dlg&&!c.dq.some(x=>x.id==='contra'))askDilemma('contra',{cl});}

