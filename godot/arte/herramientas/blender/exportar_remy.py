# Remy (Mixamo) con las animaciones del juego -> GLB para Godot. Los archivos de Mixamo NO van al repositorio (licencia):
# El JSON guarda además «avance_andar» y «avance_correr» (m/s del pie apoyado a velocidad 1): ver avance() más abajo.
# Uso: python3 exportar_remy.py <carpeta con Remy.fbx y las animaciones .fbx> <salida.glb> <salida_meta.json>
import bpy, sys, os, json
CARPETA,OUT,META=sys.argv[-3],sys.argv[-2],sys.argv[-1]
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'mixamo_retarget.py')).read())
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene; sc.render.fps=30
bpy.ops.import_scene.fbx(filepath=os.path.join(CARPETA,'Remy.fbx'))
T=[o for o in bpy.data.objects if o.type=='ARMATURE'][0]; T.name='Armature'; T.data.name='Armature'   # mismo nombre que los demás personajes: sus animaciones sirven para todos
T.animation_data_clear()
for a in list(bpy.data.actions): bpy.data.actions.remove(a)
mapa={b.name.replace('mixamorig:',''):b.name for b in T.data.bones}
for pb in T.pose.bones: pb.matrix_basis=Matrix.Identity(4)
meta=hornear(T,CARPETA,mapa,andar='andar')

def avance(T, nombre, pies, fps):
    """m/s (unidades del mundo de Blender, las mismas que «altura» y «cadera_pie») que recorre el pie apoyado en la
    animación horneada `nombre` a velocidad 1,0. El juego pone la animación a v_actor / avance y el pie no resbala.
    Se mira cada pie mientras está cerca de su punto más bajo (pisando): mediana de su velocidad en planta."""
    A=bpy.data.actions[nombre]; ad=T.animation_data
    mudas=[(tr,tr.mute) for tr in ad.nla_tracks]
    for tr,_ in mudas: tr.mute=True          # solo esta acción, sin las pistas NLA del resto
    ad.action=A
    f0,f1=int(A.frame_range[0]),int(A.frame_range[1])
    raiz=[b for b in T.pose.bones if b.name.endswith('Hips')][0].name
    tray={p:[] for p in pies+[raiz]}
    for f in range(f0,f1+1):
        sc.frame_set(f)
        for p in tray: tray[p].append(T.matrix_world@T.pose.bones[p].head)
    cadera=tray.pop(raiz)
    ad.action=None
    for tr,m in mudas: tr.mute=m
    for pb in T.pose.bones: pb.matrix_basis=Matrix.Identity(4)
    # velocidad del pie mientras PISA: mediana de su velocidad en planta en los fotogramas a ras de su punto más bajo
    # (banda del 3 % de lo que sube y baja, más ancha si salen pocas muestras). Igual que Escala._vel_pie_apoyado:
    # con una banda ancha entran fotogramas en que el pie aún baja hacia delante y al correr el avance sale corto.
    vel=0.0
    for banda in (0.03,0.06,0.1,0.2):
        vs=[]
        for p,tr in tray.items():
            zs=[q.z for q in tr]; umbral=min(zs)+banda*(max(zs)-min(zs))
            for j in range(1,len(tr)-1):
                if tr[j].z<=umbral:
                    v=(tr[j+1]-tr[j-1])*(fps/2.0); vs.append(math.hypot(v.x,v.y))
        if len(vs)>=4:
            vs.sort(); vel=vs[len(vs)//2]; break
    # aviso: si la cadera avanza de verdad (animación sin «In Place»), el juego la movería dos veces y daría saltos
    d=cadera[-1]-cadera[0]
    if math.hypot(d.x,d.y)>0.25*meta.get('cadera_pie',1.0): print('AVISO: «%s» no es «In Place»: la cadera avanza'%nombre)
    return round(vel,4)
for _n in ('andar','correr'):
    meta['avance_'+_n]=avance(T,_n,[mapa['LeftFoot'],mapa['RightFoot']],sc.render.fps)
# texturas a 1024 (las de 2048 pesan demasiado para la web)
for im in bpy.data.images:
    if im.size[0]>1024: im.scale(1024,1024)
mallas=[o for o in bpy.data.objects if o.type=='MESH']
zs=[(o.matrix_world@v.co).z for o in mallas for v in o.data.vertices]
meta['altura']=round(max(zs)-min(zs),4)
bpy.ops.object.select_all(action='DESELECT')
for o in [T]+mallas: o.select_set(True)
bpy.context.view_layer.objects.active=T
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',
    export_skins=True,export_morph=False,export_image_format='WEBP',export_yup=True,export_force_sampling=True,export_optimize_animation_size=True)
json.dump(meta,open(META,'w'),indent=1)
print('GLB',OUT,round(os.path.getsize(OUT)/1e6,2),'MB',meta)
