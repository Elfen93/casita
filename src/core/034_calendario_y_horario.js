// ---------- calendario y horario ----------
const WDL=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'],WDS=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const START_UTC=Date.UTC(2027,2,1); // la partida empieza el lunes 1 de marzo de 2027
const FESTIVOS=[[0,1,'Año Nuevo'],[0,6,'Reyes'],[2,8,'Día de la Mujer'],[3,18,'Semana Santa'],[4,1,'Día del Trabajo'],[7,15,'Fiesta de verano'],[9,12,'Fiesta nacional'],[11,25,'Navidad']];
const SHIFT={get start(){return TR().sh[0];},get end(){return TR().sh[1];},get leave(){return TR().sh[0]-1.25;}};
const _dc=new Map();
function dateOf(day){let r=_dc.get(day);if(r)return r;const D=new Date(START_UTC+(day-1)*86400000);r={wd:(D.getUTCDay()+6)%7,m:D.getUTCMonth(),dm:D.getUTCDate(),year:D.getUTCFullYear()};if(_dc.size>800)_dc.clear();_dc.set(day,r);return r;}
function dayOfDate(y,m,dm){return Math.round((Date.UTC(y,m,dm)-START_UTC)/86400000)+1;}
const monthLen=(y,m)=>new Date(Date.UTC(y,m+1,0)).getUTCDate();
function festivo(day){const d=dateOf(day);const f=FESTIVOS.find(([m,dd])=>m===d.m&&dd===d.dm);return f?f[2]:null;}
function dayType(day){if((S.vacDays||[]).includes(day))return 'vac';if(festivo(day))return 'fest';return TR().days.includes(dateOf(day).wd)?'work':'weekend';}
const DAYICON={work:'💼',weekend:'🌴',fest:'🎉',vac:'🏖️'};
const DAYNAME={work:'Día de trabajo',weekend:'Día libre',fest:'Festivo',vac:'Vacaciones'};
function weeklyRent(){let objs=0;for(const o of S.obj)if(o)objs++;return Math.round((350+objs*14)*Dm().rent*(S.rentMul||1)*(Dm().soul?MK().price:1));}
function housingWeekly(){return S.owned?(S.mort?S.mort.pay:0):weeklyRent();}
