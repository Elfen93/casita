# Exporta la chica (Autumn) a GLB para Godot: malla de cara+cuerpo con las shape keys de ARKit, pelo y ropa,
# solo huesos de deformacion, materiales sencillos con texturas reducidas.
# Uso: python3 exportar_autumn.py [--todas] <mujer_arkit.blend> <salida.glb>   (--todas: las 52 formas; si no, solo las del juego)
import bpy, bmesh, sys, os, math
import numpy as np
from mathutils import Vector
SRC,OUT=sys.argv[-2],sys.argv[-1]
TMP='/tmp/exp_autumn'; os.makedirs(TMP,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=SRC)
sc=bpy.context.scene; RIG=bpy.data.objects['rig']; B=bpy.data.objects['Body-01 lhigh rez']
bpy.context.view_layer.objects.active=RIG
if RIG.mode!='OBJECT': bpy.ops.object.mode_set(mode='OBJECT')
for pbn in RIG.pose.bones: pbn.location=(0,0,0); pbn.rotation_quaternion=(1,0,0,0); pbn.rotation_euler=(0,0,0); pbn.scale=(1,1,1)
ARKIT=['eyeBlinkLeft','eyeLookDownLeft','eyeLookInLeft','eyeLookOutLeft','eyeLookUpLeft','eyeSquintLeft','eyeWideLeft','eyeBlinkRight','eyeLookDownRight','eyeLookInRight','eyeLookOutRight','eyeLookUpRight','eyeSquintRight','eyeWideRight','jawForward','jawLeft','jawRight','jawOpen','mouthClose','mouthFunnel','mouthPucker','mouthLeft','mouthRight','mouthSmileLeft','mouthSmileRight','mouthFrownLeft','mouthFrownRight','mouthDimpleLeft','mouthDimpleRight','mouthStretchLeft','mouthStretchRight','mouthRollLower','mouthRollUpper','mouthShrugLower','mouthShrugUpper','mouthPressLeft','mouthPressRight','mouthLowerDownLeft','mouthLowerDownRight','mouthUpperUpLeft','mouthUpperUpRight','browDownLeft','browDownRight','browInnerUp','browOuterUpLeft','browOuterUpRight','cheekPuff','cheekSquintLeft','cheekSquintRight','noseSneerLeft','noseSneerRight','tongueOut']
# ---------- 1) texturas horneadas de pestanas y cejas (materiales procedurales -> RGBA) ----------
def hornear_plano(mat,nombre,res=512):
    s2=bpy.data.scenes.new('h_'+nombre); win=bpy.context.window; win.scene=s2
    bpy.ops.mesh.primitive_plane_add(size=1.0,location=(0.5,0.5,0)); pl=bpy.context.object; pl.data.materials.append(mat)
    cd=bpy.data.cameras.new('c'); cd.type='ORTHO'; cd.ortho_scale=1.0; cam=bpy.data.objects.new('c',cd); s2.collection.objects.link(cam); cam.location=(0.5,0.5,2); s2.camera=cam
    w=bpy.data.worlds.new('w'); w.use_nodes=True; w.node_tree.nodes['Background'].inputs['Color'].default_value=(1,1,1,1); w.node_tree.nodes['Background'].inputs['Strength'].default_value=1.0; s2.world=w
    s2.render.engine='CYCLES'; s2.cycles.device='CPU'; s2.cycles.samples=24; s2.cycles.use_denoising=False; s2.render.film_transparent=True; s2.cycles.transparent_max_bounces=32
    s2.render.resolution_x=s2.render.resolution_y=res; s2.render.resolution_percentage=100; s2.render.image_settings.file_format='PNG'; s2.render.image_settings.color_mode='RGBA'
    s2.view_settings.view_transform='Standard'
    s2.render.filepath=os.path.join(TMP,nombre+'.png'); bpy.ops.render.render(write_still=True,scene=s2.name)
    win.scene=sc; bpy.data.objects.remove(pl,do_unlink=True)
    return s2.render.filepath
me=B.data
slot={m.name:i for i,m in enumerate(me.materials) if m}
t_pest=hornear_plano(bpy.data.materials['Lashes1'],'pestanas')
t_ceja=hornear_plano(bpy.data.materials['Brows 1.001'],'cejas')
# ---------- 2) cuerpo: mezcla actual como forma base, solo las 52 de ARKit, sin piel oculta ni cornea ----------
# Las 52 formas pesan ~6 MB en el paquete del juego (Godot guarda posición+normal de cada vértice por forma): por defecto
# solo van las que el juego usa o usará pronto (parpadeo, habla, sonrisa, enfado, pena, sorpresa). Con --todas van las 52.
JUEGO=['eyeBlinkLeft','eyeBlinkRight','eyeSquintLeft','eyeSquintRight','eyeWideLeft','eyeWideRight','jawOpen','mouthFunnel','mouthPucker',
       'mouthSmileLeft','mouthSmileRight','mouthFrownLeft','mouthFrownRight','browDownLeft','browDownRight','browInnerUp','cheekSquintLeft','cheekSquintRight']
kb=me.shape_keys.key_blocks
for d in me.shape_keys.animation_data.drivers: d.mute=True
for k in kb:
    if k.name in ARKIT or k.name.startswith('fix ') or k.name in ('Key 1','Key 5'): k.value=0.0
n=len(me.vertices)
def co(k): a=np.empty(n*3,dtype=np.float32); k.data.foreach_get('co',a); return a.reshape(-1,3)
BAS=co(kb['Basis']); MIX=BAS.copy()
for k in kb:
    if k.name!='Basis' and abs(k.value)>1e-6: MIX+=(co(k)-BAS)*k.value
DELTA={a:co(kb[a])-BAS for a in ARKIT}
B.shape_key_clear()
me.vertices.foreach_set('co',MIX.ravel()); me.update()
gmask=B.vertex_groups['mask_ropa'].index
bm=bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table(); lay=bm.verts.layers.int.new('orig'); dl=bm.verts.layers.deform.verify()
for v in bm.verts: v[lay]=v.index
ocultos=[v for v in bm.verts if v[dl].get(gmask,0.0)<0.5]
bmesh.ops.delete(bm,geom=ocultos,context='VERTS')
bmesh.ops.delete(bm,geom=[f for f in bm.faces if f.material_index==slot.get('Material.002',-99)],context='FACES')
for v in [v for v in bm.verts if not v.link_faces]: bm.verts.remove(v)
bm.verts.ensure_lookup_table(); orig=[v[lay] for v in bm.verts]
bm.to_mesh(me); bm.free(); me.update()
B.shape_key_add(name='Basis',from_mix=False)
for a in (ARKIT if '--todas' in sys.argv else JUEGO):
    k=B.shape_key_add(name=a,from_mix=False); k.data.foreach_set('co',(MIX[orig]+DELTA[a][orig]).ravel()); k.value=0.0
for m in list(B.modifiers):
    if m.type!='ARMATURE': B.modifiers.remove(m)
print('cuerpo: vertices',n,'->',len(me.vertices),'shape keys',len(me.shape_keys.key_blocks)-1)
# ---------- 3) materiales de exportacion ----------
def img_red(img,res,nombre):
    im=img.copy(); im.name=nombre
    if im.size[0]>res: im.scale(res,res)
    im.filepath_raw=os.path.join(TMP,nombre+'.png'); im.file_format='PNG'; im.save(); return im
def mat_simple(nombre,img=None,normal=None,rough=0.6,alpha=False,color=None,metal=0.0):
    m=bpy.data.materials.new(nombre); m.use_nodes=True; nt=m.node_tree; p=nt.nodes['Principled BSDF']; p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    if color: p.inputs['Base Color'].default_value=color
    if img:
        t=nt.nodes.new('ShaderNodeTexImage'); t.image=img; nt.links.new(t.outputs['Color'],p.inputs['Base Color'])
        if alpha:
            nt.links.new(t.outputs['Alpha'],p.inputs['Alpha'])
            try: m.surface_render_method='DITHERED'
            except Exception: pass
            m.use_backface_culling=False
    if normal:
        t2=nt.nodes.new('ShaderNodeTexImage'); t2.image=normal; normal.colorspace_settings.name='Non-Color'; nm=nt.nodes.new('ShaderNodeNormalMap'); nm.inputs['Strength'].default_value=0.7
        nt.links.new(t2.outputs['Color'],nm.inputs['Color']); nt.links.new(nm.outputs['Normal'],p.inputs['Normal'])
    return m
def tex_de(matname,key):
    m=bpy.data.materials[matname]
    return next(nd.image for nd in m.node_tree.nodes if nd.type=='TEX_IMAGE' and nd.image and key in nd.image.name.lower())
piel=mat_simple('piel',img_red(tex_de('skin-rough','alb'),2048,'piel_alb'),img_red(tex_de('skin-rough','normal'),1024,'piel_normal'),rough=0.62)
ojo=mat_simple('ojo',img_red(tex_de('eye-white-rough','eye'),1024,'ojo_alb'),rough=0.12)
boca=mat_simple('boca',img_red(tex_de('skin-tongue-rough','tongue'),512,'boca_alb'),rough=0.4)
pest=mat_simple('pestanas',bpy.data.images.load(t_pest),rough=0.8,alpha=True)
ceja=mat_simple('cejas',bpy.data.images.load(t_ceja),rough=0.8,alpha=True)
# pelo: albedo + alfa en una sola textura RGBA
hb=bpy.data.materials['Hair_baked']; ia=tex_de('Hair_baked','alb'); ial=tex_de('Hair_baked','alpha')
A=np.array(ia.pixels[:],dtype=np.float32).reshape(ia.size[1],ia.size[0],4); AL=np.array(ial.pixels[:],dtype=np.float32).reshape(ial.size[1],ial.size[0],4)
A[:,:,3]=AL[:,:,0]; ip=bpy.data.images.new('pelo_rgba',ia.size[0],ia.size[1],alpha=True); ip.pixels.foreach_set(A.ravel()); ip.scale(1024,1024)
ip.filepath_raw=os.path.join(TMP,'pelo_rgba.png'); ip.file_format='PNG'; ip.save()
pelo=mat_simple('pelo',ip,rough=0.45,alpha=True)
mapa={'skin-rough':piel,'eye-white-rough':ojo,'skin-tongue-rough':boca,'Lashes1':pest,'Brows 1.001':ceja,'Brows 1':ceja}
usados=set(p.material_index for p in me.polygons)
for i,m in enumerate(me.materials):
    if m and m.name in mapa: me.materials[i]=mapa[m.name]
print('materiales del cuerpo en uso',[me.materials[i].name for i in sorted(usados)])
P=bpy.data.objects['Pelo']
for m in list(P.modifiers):
    if m.type!='ARMATURE': P.modifiers.remove(m)
P.data.materials[0]=pelo
# ---------- 4) ropa: aplicar modificadores (menos Armature), aligerar zapatillas, unir en un objeto ----------
ropa=[o for o in bpy.data.objects if o.type=='MESH' and o.name.startswith(('Top','Pantalon','Cinturilla','Cremallera','Zapatilla','Suela','Cordon','Casquete'))]
for o in ropa:
    for m in o.modifiers:
        if m.type=='SUBSURF': m.levels=1; m.render_levels=1
    if o.name.startswith('Zapatilla'):
        d=o.modifiers.new('Aligerar','DECIMATE'); d.ratio=0.16
    arm=[m for m in o.modifiers if m.type=='ARMATURE']
    for m in arm: m.show_viewport=False
    bpy.context.view_layer.update(); dg=bpy.context.evaluated_depsgraph_get()
    nm=bpy.data.meshes.new_from_object(o.evaluated_get(dg),preserve_all_data_layers=True,depsgraph=dg)
    o.data=nm
    for m in list(o.modifiers): o.modifiers.remove(m)
    a=o.modifiers.new('Armature','ARMATURE'); a.object=RIG
bpy.ops.object.select_all(action='DESELECT')
for o in ropa: o.hide_set(False); o.select_set(True)
bpy.context.view_layer.objects.active=bpy.data.objects['Top']; bpy.ops.object.join(); R=bpy.context.object; R.name='Ropa'
B.name='Cuerpo'; P.name='Pelo'
print('ropa: vertices',len(R.data.vertices),'materiales',[m.name for m in R.data.materials if m],'| pelo vertices',len(P.data.vertices))
# ---------- 4b) esqueleto de juego: solo huesos DEF con una jerarquia limpia (Rigify los deja colgando de huesos de control) ----------
bpy.ops.object.select_all(action='DESELECT')
ESQ=RIG.copy(); ESQ.data=RIG.data.copy(); ESQ.name='Esqueleto'; ESQ.data.name='Esqueleto'; sc.collection.objects.link(ESQ)
ESQ.animation_data_clear(); ESQ.data.animation_data_clear()
bpy.context.view_layer.objects.active=ESQ; ESQ.select_set(True); bpy.ops.object.mode_set(mode='EDIT')
EB=ESQ.data.edit_bones
for b_ in [b_ for b_ in EB if not b_.name.startswith('DEF-')]: EB.remove(b_)
def padre_de(n):
    if n=='DEF-spine': return None
    for sd in ('L','R'):
        if n in ('DEF-pelvis.'+sd,'DEF-thigh.'+sd): return 'DEF-spine'
        if n in ('DEF-shoulder.'+sd,'DEF-breast.'+sd): return 'DEF-spine.003'
        if n=='DEF-upper_arm.'+sd: return 'DEF-shoulder.'+sd
    return 'DEF-spine.006'
nrep=0
for b_ in EB:
    if b_.parent is None and b_.name!='DEF-spine':
        b_.use_connect=False; b_.parent=EB[padre_de(b_.name)]; nrep+=1
bpy.ops.object.mode_set(mode='POSE')
for pb_ in ESQ.pose.bones:
    for c in list(pb_.constraints): pb_.constraints.remove(c)
    pb_.custom_shape=None
bpy.ops.object.mode_set(mode='OBJECT')
for b_ in ESQ.data.bones: b_.use_deform=True; b_.bbone_segments=1
for coll in ESQ.data.collections_all: coll.is_visible=True
for o in (B,P,R):
    for m in o.modifiers:
        if m.type=='ARMATURE': m.object=ESQ
    mw=o.matrix_world.copy(); o.parent=ESQ; o.matrix_world=mw
print('esqueleto de juego: huesos',len(ESQ.data.bones),'reemparentados',nrep,'raices',[b_.name for b_ in ESQ.data.bones if b_.parent is None])
RIG=ESQ
# ---------- 5) exportar ----------
bpy.ops.object.select_all(action='DESELECT')
for o in (RIG,B,P,R): o.hide_set(False); o.hide_viewport=False; o.select_set(True)
bpy.context.view_layer.objects.active=RIG
kw=dict(filepath=OUT,export_format='GLB',use_selection=True,export_apply=False,export_def_bones=False,export_animations=False,export_morph=True,export_morph_normal=False,export_skins=True,export_yup=True,export_image_format='WEBP',export_image_quality=82)
try: bpy.ops.export_scene.gltf(export_try_sparse_sk=True,**kw)
except TypeError: bpy.ops.export_scene.gltf(**kw)
print('GLB',OUT,round(os.path.getsize(OUT)/1e6,2),'MB')
