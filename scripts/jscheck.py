import sys,subprocess
h=open(sys.argv[1]).read();i=h.index('<script>\n(() => {');j=h.index('</script>',i)
open('/tmp/_jc.js','w').write(h[i+8:j]);r=subprocess.run(['node','--check','/tmp/_jc.js']);print('SYNTAX_OK' if r.returncode==0 else 'SYNTAX_FAIL');sys.exit(r.returncode)
