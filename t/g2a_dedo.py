import sys,re,time,subprocess,socket
sys.path.insert(0,'/home/claude/casita/t')
from g2a_cdp import Pag
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/g2a/dedo'
so=socket.socket();so.bind(('127.0.0.1',0));port=so.getsockname()[1];so.close()
srv=subprocess.Popen(['python3','-m','http.server',str(port),'--bind','127.0.0.1'],cwd='/home/claude/casita',stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(1)
p=Pag('http://127.0.0.1:%d/play3d/index.html'%port,espera=30)
res=[]
def chk(n,ok,x=''):
    res.append(ok);print(('OK  ' if ok else 'FALLA ')+n,x)
def toque(x,y,ms=0):
    p.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':1}]})
    p.dormir(ms/1000.0)
    p.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
def doble(x,y):
    import json
    for k,(t,pts) in enumerate([('touchStart',[{'x':x,'y':y,'id':1}]),('touchEnd',[]),('touchStart',[{'x':x+3,'y':y+2,'id':1}]),('touchEnd',[])]):
        p.n+=1;p.ws.send(json.dumps({'id':p.n,'method':'Input.dispatchTouchEvent','params':{'type':t,'touchPoints':pts}}))
    p.dormir(0.3)
def pant(i):
    n=len(p.log);p.cmd('pant',i,espera=0.5)
    for l in p.log[n:]:
        m=re.match(r'pant: (-?\d+),(-?\d+) ficha=(\w+)',l)
        if m:return int(m.group(1)),int(m.group(2)),m.group(3)=='true'
    return None
try:
    p.send('Emulation.setTouchEmulationEnabled',{'enabled':True,'maxTouchPoints':5})
    p.cmd('vel',1)
    p.cmd('dia',4);p.cmd('hora',11);p.dormir(1)
    p.cmd('poner',231,152);p.cmd('ir_xy',231,132)
    for i in range(20):
        p.dormir(1.0)
        if 'dentro=true' in p.estado():break
    p.dormir(4)
    chk('dentro del bar','dentro=true' in p.estado())
    p.dormir(2)
    a=p.pos();bx=pant('barra');print('jug',a,'barra en pantalla',bx)
    p.shot(OUT+'/0_antes.png')
    # 1) un toque sobre la barra: abre su menú tras el margen, y no anda
    toque(bx[0],bx[1])
    f0=False
    p.dormir(4.0);f1=pant('barra')[2];b=p.pos()
    p.shot(OUT+'/1_un_toque.png')
    chk('un toque sobre la barra abre su menú (tras el margen) y no anda',(not f0) and f1 and abs(a[0]-b[0])<0.3 and abs(a[1]-b[1])<0.3,'%s %s %s %s'%(f0,f1,a,b))
    # 2) dos toques seguidos sobre la barra (con el menú abierto): cierra y anda ahí
    doble(bx[0],bx[1]);p.dormir(0.6)
    f2=pant('barra')[2]
    p.shot(OUT+'/2_doble.png')
    p.dormir(5);c=p.pos();bx2=pant('barra')
    p.shot(OUT+'/2_doble_fin.png')
    chk('dos toques sobre la barra: sin menú y anda hasta ahí',(not f2) and (abs(c[0]-b[0])+abs(c[1]-b[1]))>1.0,'%s -> %s'%(b,c))
    # 3) volver y dedo quieto sobre la barra
    p.cmd('ir_xy',a[0],a[1]);p.dormir(6);d=p.pos()
    bx=pant('barra')
    p.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':bx[0],'y':bx[1],'id':1}]})
    p.dormir(3.0)
    p.shot(OUT+'/3_largo.png')
    p.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    p.dormir(5);e=p.pos();f3=pant('barra')[2]
    p.shot(OUT+'/3_largo_fin.png')
    chk('dedo quieto sobre la barra: anda hasta ahí sin menú',(not f3) and (abs(e[0]-d[0])+abs(e[1]-d[1]))>1.0,'%s -> %s'%(d,e))
    # 4) un toque en suelo libre sigue andando al momento
    p.cmd('ir_xy',a[0],a[1]);p.dormir(6);g=p.pos()
    toque(210,640);p.dormir(3);h=p.pos()
    chk('un toque en el suelo anda sin espera',(abs(h[0]-g[0])+abs(h[1]-g[1]))>0.5,'%s -> %s'%(g,h))
    p.shot(OUT+'/4_suelo.png')
    print('errores',p.err[:5])
    chk('sin errores de consola',not p.err)
finally:
    p.cerrar();srv.kill()
print('RESULTADO','OK' if all(res) else 'FALLA',sum(res),'/',len(res))
