# Remy (Mixamo) con las animaciones del juego -> GLB para Godot. Los archivos de Mixamo NO van al repositorio (licencia):
# Uso: python3 exportar_remy.py <carpeta con Remy.fbx y las animaciones .fbx> <salida.glb> <salida_meta.json>
import bpy, sys, os, json
CARPETA,OUT,META=sys.argv[-3],sys.argv[-2],sys.argv[-1]
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'mixamo_retarget.py')).read())
bpy.ops.wm.read_factory_settings(use_empty=True)
sc=bpy.context.scene; sc.render.fps=30
bpy.ops.import_scene.fbx(filepath=os.path.join(CARPETA,'Remy.fbx'))
T=[o for o in bpy.data.objects if o.type=='ARMATURE'][0]; T.name='Remy'
T.animation_data_clear()
for a in list(bpy.data.actions): bpy.data.actions.remove(a)
mapa={b.name.replace('mixamorig:',''):b.name for b in T.data.bones}
for pb in T.pose.bones: pb.matrix_basis=Matrix.Identity(4)
meta=hornear(T,CARPETA,mapa,andar='andar')
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
