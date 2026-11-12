import json,subprocess,time,urllib.request,websocket,sys,socket,tempfile,shutil
_s=socket.socket();_s.bind(('127.0.0.1',0));PORT=_s.getsockname()[1];_s.close();PROF=tempfile.mkdtemp(prefix='casita_chrome_')  # puerto y perfil propios: se pueden lanzar varias pruebas a la vez
p=subprocess.Popen(['google-chrome','--headless=new','--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files','--window-size='+(sys.argv[4] if len(sys.argv)>4 else '900,700').replace('x',','),'--remote-debugging-port=%d'%PORT,'--user-data-dir='+PROF,'--remote-allow-origins=*','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(3)
tabs=json.load(urllib.request.urlopen('http://127.0.0.1:%d/json'%PORT))
ws=websocket.create_connection([t for t in tabs if t['type']=='page'][0]['webSocketDebuggerUrl'],timeout=60)
mid=[0]
def send(m,params={}):
    mid[0]+=1;ws.send(json.dumps({'id':mid[0],'method':m,'params':params}));return mid[0]
def wait(i):
    while True:
        r=json.loads(ws.recv())
        if r.get('id')==i:return r
import re
_w,_h=[int(x) for x in re.split('[,x]',sys.argv[4] if len(sys.argv)>4 else '900,700')]
# la ventana de Chrome sin pantalla no baja de ~500 px de ancho: el tamaño real se fija aquí (420,860 = móvil)
send('Runtime.enable');wait(send('Emulation.setDeviceMetricsOverride',{'width':_w,'height':_h,'deviceScaleFactor':1,'mobile':False}));wait(send('Page.navigate',{'url':sys.argv[1]}))
time.sleep(float(sys.argv[2]))
r=wait(send('Runtime.evaluate',{'expression':'document.title','returnByValue':True}))
print(r['result']['result'].get('value'))
import base64
r=wait(send('Page.captureScreenshot',{'format':'png'}))
open(sys.argv[3],'wb').write(base64.b64decode(r['result']['data']))
p.kill();subprocess.run(['pkill','-f','--','--user-data-dir='+PROF],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);shutil.rmtree(PROF,ignore_errors=True)
