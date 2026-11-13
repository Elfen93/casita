"""Conduce la exportación web de Godot (play3d/) por CDP: casita_cmd, consola, capturas. Uso: from g2a_cdp import Pag"""
import json,subprocess,time,urllib.request,websocket,socket,tempfile,shutil,base64,re
class Pag:
    def __init__(s,url,w=420,h=860,espera=18):
        so=socket.socket();so.bind(('127.0.0.1',0));s.port=so.getsockname()[1];so.close();s.prof=tempfile.mkdtemp(prefix='casita_g2a_')
        s.p=subprocess.Popen(['google-chrome','--headless=new','--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--window-size=%d,%d'%(w,h),'--remote-debugging-port=%d'%s.port,'--user-data-dir='+s.prof,'--remote-allow-origins=*','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        time.sleep(3)
        tabs=json.load(urllib.request.urlopen('http://127.0.0.1:%d/json'%s.port))
        s.ws=websocket.create_connection([t for t in tabs if t['type']=='page'][0]['webSocketDebuggerUrl'],timeout=120)
        s.n=0;s.log=[];s.err=[]
        s.send('Runtime.enable');s.send('Log.enable')
        s.send('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False})
        s.send('Page.navigate',{'url':url})
        s.dormir(espera)
    def send(s,m,params={}):
        s.n+=1;i=s.n;s.ws.send(json.dumps({'id':i,'method':m,'params':params}))
        while True:
            r=json.loads(s.ws.recv())
            if r.get('id')==i:return r
            s._ev(r)
    def _ev(s,r):
        m=r.get('method')
        if m=='Runtime.consoleAPICalled':
            t=' '.join(str(a.get('value',a.get('description',''))) for a in r['params']['args']);s.log.append(t)
            if r['params']['type']=='error':s.err.append(t)
        elif m=='Runtime.exceptionThrown':s.err.append(json.dumps(r['params'])[:300])
    def dormir(s,seg):
        t=time.time();s.ws.settimeout(0.5)
        while time.time()-t<seg:
            try:s._ev(json.loads(s.ws.recv()))
            except websocket.WebSocketTimeoutException:pass
        s.ws.settimeout(120)
    def cmd(s,*a,espera=0.4):
        s.send('Runtime.evaluate',{'expression':'window.casita_cmd(%s)'%','.join(json.dumps(x) for x in a)})
        s.dormir(espera)
    def estado(s):
        s.log=[l for l in s.log if not l.startswith('estado')] if False else s.log
        n=len(s.log);s.cmd('estado',espera=0.6)
        for l in s.log[n:]:
            if l.startswith('estado:'):return l
        return ''
    def num(s,clave):
        m=re.search(clave+r'=([-\d.]+)',s.estado());return float(m.group(1)) if m else None
    def pos(s):
        m=re.search(r'jug=\(([-\d.]+), ([-\d.]+), ([-\d.]+)\)',s.estado());return (float(m.group(1)),float(m.group(3))) if m else None
    def shot(s,ruta):
        r=s.send('Page.captureScreenshot',{'format':'png'});open(ruta,'wb').write(base64.b64decode(r['result']['data']))
    def cerrar(s):
        s.p.kill();subprocess.run(['pkill','-f','--','--user-data-dir='+s.prof],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);shutil.rmtree(s.prof,ignore_errors=True)
