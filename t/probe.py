# uso: probe.py html probe.js salida.json  -> inyecta probe.js (debe poner window.__probe y document.title='OK') y guarda window.__probe
import json,subprocess,time,urllib.request,websocket,sys,socket,tempfile,shutil,os
html,js,out=sys.argv[1:4]
_s=socket.socket();_s.bind(('127.0.0.1',0));PORT=_s.getsockname()[1];_s.close();PROF=tempfile.mkdtemp(prefix='casita_probe_')
src=open(html,encoding='utf-8').read();test=open(js,encoding='utf-8').read()
src=src.replace("<script>\n(() => {","<script>window.__errs=[];window.onerror=(m,u,l,c,e)=>{window.__errs.push(String(m));};</script>\n<script>\n(() => {",1)
anc="requestAnimationFrame(loop);\naddEventListener('visibilitychange'";assert src.count(anc)==1
pag=os.path.join(PROF,'p.html');open(pag,'w',encoding='utf-8').write(src.replace(anc,test+"\n"+anc))
p=subprocess.Popen(['google-chrome','--headless=new','--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files','--window-size=900,900','--remote-debugging-port=%d'%PORT,'--user-data-dir='+PROF+'/perfil','--remote-allow-origins=*','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(3)
tabs=json.load(urllib.request.urlopen('http://127.0.0.1:%d/json'%PORT))
ws=websocket.create_connection([t for t in tabs if t['type']=='page'][0]['webSocketDebuggerUrl'],timeout=600)
mid=[0]
def send(m,params={}):
    mid[0]+=1;ws.send(json.dumps({'id':mid[0],'method':m,'params':params}));return mid[0]
def wait(i):
    while True:
        r=json.loads(ws.recv())
        if r.get('id')==i:return r
def ev(e):return wait(send('Runtime.evaluate',{'expression':e,'returnByValue':True}))['result']['result'].get('value','')
send('Runtime.enable');wait(send('Page.navigate',{'url':'file://'+pag}))
t0=time.time();tit=''
while time.time()-t0<600:
    time.sleep(1.5);tit=ev('document.title')
    if tit.startswith(('OK','ERR')):break
v=ev('window.__probe||""');open(out,'w',encoding='utf-8').write(v)
print(tit[:300],len(v)//1024,'KB')
p.kill();subprocess.run(['pkill','-f','--','--user-data-dir='+PROF+'/perfil'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);shutil.rmtree(PROF,ignore_errors=True)
