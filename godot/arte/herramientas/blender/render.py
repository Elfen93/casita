import bpy, sys, math, time
from mathutils import Vector
ARGS=dict(a.split('=',1) for a in sys.argv[sys.argv.index('--')+1:])
bpy.ops.wm.open_mainfile(filepath=ARGS['blend'])
sc=bpy.context.scene
sc.render.engine='CYCLES'
sc.cycles.device='CPU'; sc.cycles.samples=int(ARGS.get('muestras','48')); sc.cycles.use_denoising=True
sc.render.film_transparent=False
w=bpy.data.worlds.new('w'); sc.world=w; w.use_nodes=True
bg=w.node_tree.nodes['Background']; bg.inputs[0].default_value=(0.78,0.82,0.88,1); bg.inputs[1].default_value=0.9
def luz(nombre,pos,energia,tam,color=(1,1,1)):
    d=bpy.data.lights.new(nombre,'AREA'); d.energy=energia; d.size=tam; d.color=color
    o=bpy.data.objects.new(nombre,d); sc.collection.objects.link(o); o.location=pos
    o.rotation_euler=(Vector((0,0,1.3))-Vector(pos)).to_track_quat('-Z','Y').to_euler()
luz('principal',(1.6,-2.6,2.4),420,2.0,(1,0.96,0.9)); luz('relleno',(-2.2,-2.0,1.4),120,2.5,(0.85,0.9,1)); luz('contra',(-1.2,2.4,2.4),260,1.5)
# suelo
bpy.ops.mesh.primitive_plane_add(size=30); suelo=bpy.context.object
m=bpy.data.materials.new('suelo'); m.use_nodes=True; m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(0.72,0.76,0.82,1); suelo.data.materials.append(m)
cam=bpy.data.objects.new('cam',bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera=cam
def foto(nombre,pos,mira,lente,res):
    cam.location=pos; cam.data.lens=lente
    cam.rotation_euler=(Vector(mira)-Vector(pos)).to_track_quat('-Z','Y').to_euler()
    sc.render.resolution_x,sc.render.resolution_y=res
    sc.render.filepath=ARGS['salida']+'_'+nombre+'.png'
    t=time.time(); bpy.ops.render.render(write_still=True); print('render',nombre,round(time.time()-t,1),'s')
foto('cuerpo',(0.9,-4.6,1.25),(0,0,0.86),70,(520,860))
foto('cara',(0.28,-1.25,1.52),(0,0,1.5),80,(600,640))
if ARGS.get('glb'):
    bpy.ops.object.select_all(action='SELECT'); suelo.select_set(False)
    bpy.ops.export_scene.gltf(filepath=ARGS['glb'],use_selection=True,export_format='GLB',export_apply=False)
    print('glb ok')
