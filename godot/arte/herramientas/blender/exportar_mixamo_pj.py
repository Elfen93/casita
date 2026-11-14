# Personajes de Mixamo (FBX en T-pose con piel) -> GLB ligeros para Godot, SIN animaciones: las comparten todos desde
# remy.glb (mismo esqueleto de Mixamo). Texturas a 512, malla aligerada a ~VERT vértices, armadura llamada «Armature».
# Uso: python3 exportar_mixamo_pj.py <carpeta con <nombre>.fbx> <carpeta salida>   (deja <nombre>.glb y personajes.json)
import bpy, sys, os, json, glob
ENT,SAL=sys.argv[-2],sys.argv[-1]; VERT=14000; TEX=512
meta={}
for fbx in sorted(glob.glob(os.path.join(ENT,'*.fbx'))):
    nom=os.path.splitext(os.path.basename(fbx))[0]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=fbx)
    arm=[o for o in bpy.data.objects if o.type=='ARMATURE'][0]; arm.name='Armature'; arm.data.name='Armature'
    arm.animation_data_clear()
    # todos con el mismo prefijo (algunos vienen como «mixamorig1:», «mixamorig5:»...) para compartir animaciones
    for b_ in arm.data.bones:
        if ':' in b_.name and not b_.name.startswith('mixamorig:'): b_.name='mixamorig:'+b_.name.split(':',1)[1]
    for a in list(bpy.data.actions): bpy.data.actions.remove(a)
    for pb in arm.pose.bones: pb.matrix_basis.identity()
    mallas=[o for o in bpy.data.objects if o.type=='MESH']
    total=sum(len(o.data.vertices) for o in mallas)
    for o in mallas:
        if total>VERT and len(o.data.vertices)>400:
            d=o.modifiers.new('Aligerar','DECIMATE'); d.ratio=max(0.15,VERT/total)
            bpy.context.view_layer.objects.active=o
            # el diezmado va antes que la armadura
            while o.modifiers.find('Aligerar')>0: bpy.ops.object.modifier_move_up(modifier='Aligerar')
            bpy.ops.object.modifier_apply(modifier='Aligerar')
    for im in bpy.data.images:
        if im.size[0]>TEX: im.scale(TEX,TEX)
    # materiales: quitar especular/brillo raros de Mixamo; el pelo y las pestañas con recorte de alfa
    for m in bpy.data.materials:
        if not m.use_nodes: continue
        b=m.node_tree.nodes.get('Principled BSDF')
        if b:
            b.inputs['Roughness'].default_value=0.75
            for l in list(b.inputs['Roughness'].links)+list(b.inputs['Specular IOR Level'].links if 'Specular IOR Level' in b.inputs else []): m.node_tree.links.remove(l)
            b.inputs['Metallic'].default_value=0.0
            for l in list(b.inputs['Metallic'].links): m.node_tree.links.remove(l)
    bpy.context.view_layer.update()
    zs=[(o.matrix_world@v.co).z for o in mallas for v in o.data.vertices]
    h=arm.pose.bones['mixamorig:Hips']
    meta[nom]={'altura':round(max(zs)-min(zs),4),'cadera':round((arm.matrix_world@h.head).z,4),'vertices':sum(len(o.data.vertices) for o in mallas)}
    bpy.ops.object.select_all(action='DESELECT')
    for o in [arm]+mallas: o.select_set(True)
    bpy.context.view_layer.objects.active=arm
    out=os.path.join(SAL,nom+'.glb')
    bpy.ops.export_scene.gltf(filepath=out,export_format='GLB',use_selection=True,export_animations=False,export_skins=True,
        export_morph=False,export_image_format='WEBP',export_yup=True)
    meta[nom]['mb']=round(os.path.getsize(out)/1e6,2); print('PJ',nom,meta[nom])
json.dump(meta,open(os.path.join(SAL,'personajes.json'),'w'),indent=1)
