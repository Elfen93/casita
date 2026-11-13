import bpy, sys, importlib
ARGS=dict(a.split('=',1) for a in sys.argv[sys.argv.index('--')+1:])
bpy.ops.wm.open_mainfile(filepath=ARGS['blend'])
bpy.ops.preferences.addon_enable(module="bl_ext.user_default.mpfb")
def dyn(pkg, key):
    for amod in list(sys.modules):
        if amod.endswith(pkg):
            return getattr(importlib.import_module(amod), key)
ExportService = dyn("mpfb.services.exportservice", "ExportService")
ObjectService = dyn("mpfb.services.objectservice", "ObjectService")
basemesh=[o for o in bpy.data.objects if o.type=='MESH' and o.name=='Human'][0]
raiz = ExportService.create_character_copy(basemesh, name_suffix="_export")
bm = ObjectService.find_object_of_type_amongst_nearest_relatives(raiz, "Basemesh")
ExportService.bake_modifiers_remove_helpers(bm, bake_masks=True, bake_subdiv=False, remove_helpers=True, also_proxy=True)
bpy.ops.object.select_all(action="DESELECT")
raiz.select_set(True)
for c in ObjectService.get_list_of_children(raiz):
    c.select_set(True)
bpy.context.view_layer.objects.active = raiz
bpy.ops.export_scene.gltf(filepath=ARGS['glb'], use_selection=True, export_format='GLB', export_image_format='JPEG', export_jpeg_quality=80)
print('glb ok', [ (o.name, len(o.data.vertices)) for o in bpy.context.selected_objects if o.type=='MESH'])
