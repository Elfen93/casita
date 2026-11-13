# Blender + MPFB sin pantalla (prueba del 14 nov 2026)

Blender funciona en el servidor como módulo de Python, y dentro el complemento oficial de MakeHuman (MPFB 2).

Montaje (una vez por servidor):

    pip install --break-system-packages bpy            # Blender 5.3 como módulo
    git clone --depth 1 https://github.com/makehumancommunity/mpfb2.git
    # copiar mpfb2/src/mpfb a ~/.config/blender/5.3/extensions/user_default/mpfb
    # enlazar los paquetes de recursos (clothes, hair, skins, eyes…) en
    # ~/.config/blender/5.3/extensions/.user/user_default/mpfb/data/

Los paquetes de recursos (CC0) no están en el repositorio: los bajó el autor de la web de MakeHuman.

Guiones:

- `montar_humano.py -- sexo=f|m blend=salida.blend`: persona completa con MPFB (piel, esqueleto de juego, ojos, cejas, pestañas, dientes, pelo, conjunto de ropa y zapatos). Tarda unos 5 s.
- `render.py -- blend=… salida=/ruta/prefijo`: dos fotos con Cycles en CPU (cuerpo y cara), unos 40 s.
- `exportar.py -- blend=… glb=salida.glb`: copia de exportación sin geometría auxiliar y `.glb` para Godot.
- `godot/arte/humano/ver_glb.gd`: enseña un `.glb` en Godot con las luces de retrato y saca dos fotos.

Pendiente al traerlo a Godot: el pelo, las cejas, las pestañas y los ojos llegan con transparencia mal puesta (hay que darles recorte de alfa y dos caras); la pose es la de reposo (brazos abiertos); el `.glb` pesa 17 MB por las texturas a tamaño completo. Para leer un sim hecho en MakeHuman: `HumanService.deserialize_from_mhm`.
