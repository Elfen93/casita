import json,subprocess,time,urllib.request,websocket,sys
p=subprocess.Popen(['google-chrome','--headless=new','--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files','--window-size=900,900','--remote-debugging-port=9334','--remote-allow-origins=*','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(3)
tabs=json.load(urllib.request.urlopen('http://127.0.0.1:9334/json'))
ws=websocket.create_connection([t for t in tabs if t['type']=='page'][0]['webSocketDebuggerUrl'],timeout=60)
mid=[0]
def send(m,params={}):
    mid[0]+=1;ws.send(json.dumps({'id':mid[0],'method':m,'params':params}));return mid[0]
def wait(i):
    while True:
        r=json.loads(ws.recv())
        if r.get('id')==i:return r
send('Runtime.enable');wait(send('Page.navigate',{'url':sys.argv[1]}))
time.sleep(float(sys.argv[2]))
r=wait(send('Runtime.evaluate',{'expression':'document.title','returnByValue':True}))
print(r['result']['result'].get('value'))
p.kill()
