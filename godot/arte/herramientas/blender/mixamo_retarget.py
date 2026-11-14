# Pasa animaciones de Mixamo (FBX sin piel) a cualquier esqueleto: el mismo de Mixamo (Remy) o el de juego de la chica (DEF-*).
# Método: para cada hueso emparejado, la rotación en mundo del destino = (pose fuente · reposo fuente⁻¹) · alineado · reposo destino,
# donde «alineado» gira el hueso destino en reposo para que apunte como el de la fuente en reposo (T-pose de Mixamo vs A-pose propia).
# La traslación de la cadera se escala por la altura de la cadera. Uso desde otro guion: exec(open(...).read()) y luego hornear(...).
import bpy, os, math
from mathutils import Matrix, Vector, Quaternion

MIXAMO_A_RIGIFY = {'Hips':'DEF-spine','Spine':'DEF-spine.001','Spine1':'DEF-spine.002','Spine2':'DEF-spine.003','Neck':'DEF-spine.004','Head':'DEF-spine.006'}
for _l,_s in (('Left','L'),('Right','R')):
    MIXAMO_A_RIGIFY.update({_l+'Shoulder':'DEF-shoulder.'+_s,_l+'Arm':'DEF-upper_arm.'+_s,_l+'ForeArm':'DEF-forearm.'+_s,_l+'Hand':'DEF-hand.'+_s,
        _l+'UpLeg':'DEF-thigh.'+_s,_l+'Leg':'DEF-shin.'+_s,_l+'Foot':'DEF-foot.'+_s,_l+'ToeBase':'DEF-toe.'+_s})
    for _d,_r in (('Index','f_index'),('Middle','f_middle'),('Ring','f_ring'),('Pinky','f_pinky')):
        for _i in (1,2,3): MIXAMO_A_RIGIFY[_l+'Hand%s%d'%(_d,_i)]='DEF-%s.%02d.%s'%(_r,_i,_s)
    for _i in (1,2,3): MIXAMO_A_RIGIFY[_l+'HandThumb%d'%_i]='DEF-thumb.%02d.%s'%(_i,_s)
# huesos que en «usar» salen de la animación de manos (escribir) y no de la de estar de pie
BRAZOS_MIXAMO = {'Neck','Head'} | {k for k in MIXAMO_A_RIGIFY if any(k.startswith(p) for p in ('LeftShoulder','LeftArm','LeftForeArm','LeftHand','RightShoulder','RightArm','RightForeArm','RightHand'))}

def _cargar(fbx):
    antes=set(bpy.data.objects); antes_a=set(bpy.data.actions)
    bpy.ops.import_scene.fbx(filepath=fbx)
    nuevos=[o for o in bpy.data.objects if o not in antes]
    S=[o for o in nuevos if o.type=='ARMATURE'][0]
    A=[a for a in bpy.data.actions if a not in antes_a][0]
    return S,A,nuevos

def _orden(T):
    out=[]; vis=set()
    def ir(b):
        if b.name in vis: return
        if b.parent: ir(b.parent)
        vis.add(b.name); out.append(b)
    for b in T.data.bones: ir(b)
    return out

def muestrear(T, fbx, mapa, paso=1, max_frames=None, rango=None):
    """devuelve (lista de frames {hueso: (loc, quat)}, datos) con la animación de fbx pasada al esqueleto T"""
    sc=bpy.context.scene
    S,A,nuevos=_cargar(fbx)
    S.animation_data.action=A
    f0,f1=int(A.frame_range[0]),int(A.frame_range[1])
    if rango: f0,f1=max(f0,rango[0]),min(f1,rango[1])
    if max_frames: f1=min(f1,f0+max_frames)
    pref='mixamorig:' if any(b.name.startswith('mixamorig:') for b in S.data.bones) else ''
    pares={pref+k:v for k,v in mapa.items() if (pref+k) in S.data.bones and v in T.data.bones}
    inv={v:k for k,v in pares.items()}
    Tw=T.matrix_world.copy(); Tw_q=Tw.to_quaternion(); Tw_qi=Tw_q.inverted()
    # reposo de la fuente (sin animar)
    S.animation_data.action=None
    for pb in S.pose.bones: pb.matrix_basis=Matrix.Identity(4)
    bpy.context.view_layer.update()
    Sw=S.matrix_world.copy()
    s_rest={n:(Sw@S.pose.bones[n].matrix) for n in pares}
    REST={b.name:b.matrix_local.copy() for b in T.data.bones}
    alin={}
    Y=Vector((0,1,0))
    for s,t in pares.items():
        ds=(s_rest[s].to_quaternion()@Y).normalized()
        dt=(Tw_q@REST[t].to_quaternion()@Y).normalized()
        alin[t]=dt.rotation_difference(ds)
    raiz_s=pref+'Hips'; raiz_t=pares.get(raiz_s)
    h_s=s_rest[raiz_s].translation.z if raiz_s in s_rest else 1.0
    h_t=(Tw@REST[raiz_t]).translation.z if raiz_t else 1.0
    k=h_t/max(h_s,1e-6)
    p_s0=s_rest[raiz_s].translation.copy() if raiz_s in s_rest else Vector()
    S.animation_data.action=A
    orden=_orden(T); frames=[]
    for f in range(f0,f1+1,paso):
        sc.frame_set(f)
        M={}; fr={}
        for b in orden:
            n=b.name; par=b.parent.name if b.parent else None
            rel=(REST[par].inverted()@REST[n]) if par else REST[n]
            base=(M[par]@rel) if par else rel.copy()
            if n in inv:
                s=inv[n]; qf=(Sw@S.pose.bones[s].matrix).to_quaternion(); qs0=s_rest[s].to_quaternion()
                qw=(qf@qs0.inverted())@alin[n]@(Tw_q@REST[n].to_quaternion())
                loc=base.translation.copy()
                if n==raiz_t:
                    ps=(Sw@S.pose.bones[s].matrix).translation
                    loc=REST[n].translation+(Tw.inverted().to_3x3()@((ps-p_s0)*k))
                M[n]=Matrix.Translation(loc)@(Tw_qi@qw).to_matrix().to_4x4()
                basis=(rel.inverted()@(M[par].inverted() if par else Matrix.Identity(4))@M[n])
                l,q,_=basis.decompose(); fr[n]=(l,q)
            else:
                M[n]=base
        frames.append(fr)
    datos={'f0':f0,'fps':sc.render.fps/max(paso,1)*paso,'paso':paso,'k':k,'raiz':raiz_t}
    for o in nuevos:
        if o.name in bpy.data.objects: bpy.data.objects.remove(o,do_unlink=True)
    bpy.data.actions.remove(A)
    return frames,datos

def mezclar(frames_cuerpo, frames_brazos, huesos_brazos):
    n=len(frames_brazos); out=[]
    for i in range(n):
        fc=frames_cuerpo[i%len(frames_cuerpo)]; fb=frames_brazos[i]
        out.append({h:(fb[h] if h in huesos_brazos and h in fb else v) for h,v in fc.items()})
    return out

def recolocar(T, frames, raiz, modo='xy', pies=None):
    """mueve la raíz en todos los frames (en mundo). modo 'xy': la cadera del primer frame vuelve a su sitio en planta
    (quita lo que la animación se desplaza al sentarse, etc.); 'tumbado': el cuerpo queda centrado en el origen y apoyado a ras"""
    if not frames or raiz not in frames[0]: return
    REST={b.name:b.matrix_local for b in T.data.bones}; M={}; Tw=T.matrix_world
    for b in _orden(T):
        n=b.name; par=b.parent.name if b.parent else None
        rel=(REST[par].inverted()@REST[n]) if par else REST[n]
        l,q=frames[0].get(n,(Vector(),Quaternion()))
        M[n]=((M[par]@rel) if par else rel)@(Matrix.Translation(l)@q.to_matrix().to_4x4())
    pts=[(Tw@M[n]).translation for n in M]
    rest_pts=[(Tw@REST[n]).translation for n in REST]
    H=max(p.z for p in rest_pts)-min(p.z for p in rest_pts)
    rr=(Tw@REST[raiz]).translation
    if modo=='tumbado':
        xs=[p.x for p in pts]; ys=[p.y for p in pts]
        dw=Vector((-(min(xs)+max(xs))/2,-(min(ys)+max(ys))/2,0.035*H-min(p.z for p in pts)))
    else:
        r0=(Tw@M[raiz]).translation; rr=(Tw@REST[raiz]).translation
        dw=Vector((rr.x-r0.x,rr.y-r0.y,0.0))
    giro=Matrix.Identity(4)
    if pies:
        # sentado: los pies delante (-Y en mundo, el frente del personaje); si la animación se giró al sentarse, se endereza
        r0=(Tw@M[raiz]).translation; pm=sum(((Tw@M[p_]).translation for p_ in pies),Vector())/len(pies)
        v=Vector((pm.x-r0.x,pm.y-r0.y)); 
        if v.length>1e-6:
            ang=math.atan2(v.x,-v.y)          # 0 si los pies van hacia -Y
            c=Vector((rr.x,rr.y,0)) if modo!='tumbado' else Vector()
            gw=Matrix.Translation(c)@Matrix.Rotation(ang,4,'Z')@Matrix.Translation(-c)
            giro=Tw.inverted()@gw@Tw
    da=Tw.inverted().to_3x3()@dw
    R=REST[raiz]; par=T.data.bones[raiz].parent
    for fr in frames:
        l,q=fr[raiz]
        Mr=giro@Matrix.Translation(da)@(R@Matrix.Translation(l)@q.to_matrix().to_4x4())
        l2,q2,_=(R.inverted()@Mr).decompose(); fr[raiz]=(l2,q2)

def escribir(T, nombre, frames, datos):
    """crea la acción y la deja en una pista NLA con su nombre (el exportador glTF saca una animación por pista)"""
    if T.animation_data is None: T.animation_data_create()
    A=bpy.data.actions.new(nombre); T.animation_data.action=A
    paso=datos['paso']
    for i,fr in enumerate(frames):
        f=1+i*paso
        for n,(l,q) in fr.items():
            pb=T.pose.bones[n]; pb.rotation_mode='QUATERNION'
            pb.location=l; pb.rotation_quaternion=q
            pb.keyframe_insert('location',frame=f,group=n); pb.keyframe_insert('rotation_quaternion',frame=f,group=n)
    T.animation_data.action=None
    tr=T.animation_data.nla_tracks.new(); tr.name=nombre
    st=tr.strips.new(nombre,1,A); st.name=nombre
    A.use_fake_user=True
    for pb in T.pose.bones: pb.matrix_basis=Matrix.Identity(4)
    return A

RANGOS={'sentado_beber':(125,450)}   # «sentado_beber» empieza sentándose: solo el tramo ya sentado
ANIMS=[('parado','parado'),('andar','andar'),('correr','correr'),('sentado','sentado'),('beber','beber'),('hablar','hablar'),('dormir','dormir'),
       ('sentado_hablar','sentado_hablar'),('sentado_beber','sentado_beber')]
def hornear(T, carpeta, mapa, andar='andar', meta=None):
    """hornea todas las animaciones del juego en T. Devuelve las alturas de asiento (m, en el espacio de T) de las animaciones sentadas"""
    meta=meta if meta is not None else {}
    cache={}
    def m(nom, **kw):
        if nom not in cache:
            fb=os.path.join(carpeta,nom+'.fbx'); paso=1
            cache[nom]=muestrear(T,fb,mapa,paso=kw.get('paso',1),max_frames=kw.get('max_frames'),rango=RANGOS.get(nom))
        return cache[nom]
    raiz=None
    for nombre,src in ANIMS:
        fuente=andar if nombre=='andar' else src
        largo=fuente in ('sentado_hablar','usar')
        frames,d=m(fuente, paso=2 if largo else 1, max_frames=600 if largo else None)
        raiz=d['raiz']
        frames=[{h:(l.copy(),q.copy()) for h,(l,q) in fr.items()} for fr in frames]
        if nombre=='dormir': recolocar(T,frames,raiz,'tumbado')
        elif nombre not in ('andar','correr'): recolocar(T,frames,raiz,'xy',pies=[mapa['LeftFoot'],mapa['RightFoot']] if nombre.startswith('sentado') else None)
        escribir(T,nombre,frames,d)
        if nombre.startswith('sentado'):
            # altura de la cadera sobre el suelo en esta animación (para colocar el asiento en el juego)
            l,q=frames[0][raiz]; R=T.data.bones[raiz].matrix_local
            meta['cadera_'+nombre]=round(((T.matrix_world@(R@Matrix.Translation(l))).translation.z),4)
    # usar = piernas y tronco de «parado» con brazos y cabeza de «usar» (escribir en un teclado: manos delante, a la altura de una encimera)
    fp,dp=m('parado'); fu,du=m('usar',paso=2,max_frames=600)
    huesos={mapa[k] for k in BRAZOS_MIXAMO if k in mapa}
    frames=mezclar(fp,fu,huesos)
    recolocar(T,frames,raiz,'xy')
    escribir(T,'usar',frames,du)
    meta['cadera_pie']=round(((T.matrix_world@T.data.bones[raiz].matrix_local).translation.z),4)
    return meta
