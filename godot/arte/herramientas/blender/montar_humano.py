import bpy, os, sys, importlib, math, time
t0=time.time()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.preferences.addon_enable(module="bl_ext.user_default.mpfb")
def dyn(pkg, key):
    for amod in list(sys.modules):
        if amod.endswith(pkg):
            return getattr(importlib.import_module(amod), key)
    raise ValueError(pkg)
HumanService = dyn("mpfb.services.humanservice", "HumanService")
AssetService = dyn("mpfb.services.assetservice", "AssetService")
ExportService = dyn("mpfb.services.exportservice", "ExportService")
ObjectService = dyn("mpfb.services.objectservice", "ObjectService")
ARGS=dict(a.split('=',1) for a in sys.argv[sys.argv.index('--')+1:]) if '--' in sys.argv else {}
sexo=ARGS.get('sexo','f')
basemesh = HumanService.create_human()
print('creado', round(time.time()-t0,1))
skin = AssetService.find_asset_absolute_path("young_caucasian_%s.mhmat" % ("female" if sexo=='f' else "male"), asset_subdir="skins")
print('skin', skin)
HumanService.set_character_skin(skin, basemesh, skin_type="GAMEENGINE")
HumanService.add_builtin_rig(basemesh, "game_engine")
assets = [("eyes","low-poly.mhclo","Eyes"),("eyebrows","eyebrow001.mhclo","Eyebrows"),("eyelashes","eyelashes01.mhclo","Eyelashes"),
          ("teeth","teeth_base.mhclo","Teeth"),("hair", "long01.mhclo" if sexo=='f' else "short02.mhclo","Hair"),
          ("clothes", "female_casualsuit01.mhclo" if sexo=='f' else "male_casualsuit01.mhclo","Clothes"),("clothes","shoes05.mhclo","Clothes")]
for sub, fn, at in assets:
    p = AssetService.find_asset_absolute_path(fn, asset_subdir=sub)
    print(at, fn, bool(p))
    if p: HumanService.add_mhclo_asset(p, basemesh, asset_type=at, material_type="GAMEENGINE")
print('montado', round(time.time()-t0,1))
print([ (o.name,o.type,len(o.data.vertices) if o.type=='MESH' else '') for o in bpy.data.objects])
bpy.ops.wm.save_as_mainfile(filepath=ARGS.get('blend','/tmp/bl/h_%s.blend'%sexo))
