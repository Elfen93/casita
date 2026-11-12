// ---------- ideologías ----------
const IDEOS=DATA.ideologias.ideologias;
const IDEO_ORDER=DATA.ideologias.orden;
const COMP=DATA.ideologias.compromiso;
const ID=()=>IDEOS[(S&&S.ideo)||'apolitica'];
const isI=(...k)=>k.includes((S&&S.ideo)||'apolitica');
const comp=()=>S.pol?S.pol.comp||2:2;

