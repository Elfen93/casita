# Animaciones del juego en PAQUETES (grupos que se cargan por separado): un .glb por grupo con el esqueleto de Remy
# («Armature», el mismo que remy.glb y los personajes de arte/mixamo/pj) y SOLO las animaciones (más un triángulo
# de malla pegado a la cadera, para que Godot monte el Skeleton3D). Fuentes: Mixamo (FBX sin piel, 30 fps, sobre Remy)
# y Quaternius «Universal Animation Library» 1 y 2 (CC0, otro esqueleto: se pasa con QUATERNIUS_A_MIXAMO de mixamo_retarget.py).
# Todo sale FUERA del repo (arte/mixamo/anims/, en .gitignore por la licencia de Mixamo; las de Quaternius podrían ir al repo,
# pero van en los mismos paquetes por sencillez). Además escribe el catálogo técnico (sección «animaciones» de data/animaciones.json).
#
# Uso: python3 exportar_anims.py <carpeta con Remy.fbx y las 11 FBX del juego> <carpeta con las FBX nuevas de Mixamo>
#                                <carpeta de la UAL de Quaternius> <carpeta de salida> <data/animaciones.json> [grupo ...]
# Sin grupos, hace todos. El grupo «base» lleva las 10 de remy.glb (horneadas igual, con hornear()) y lo imprescindible.
#
# Qué se hace a cada animación (ver preparar()):
#  · enderezar: si al empezar la cadera y el pecho no miran al frente (-Y), se gira entera. Solo en las de Quaternius
#    (giros de hasta 20°: su maniquí empieza casi siempre girado ~13°) y en las marcadas «endereza» (andares). Las de
#    Mixamo que empiezan de lado lo hacen a propósito (guardia de boxeo, bajo, batería, charla con alguien al lado).
#  · agua: la superficie del agua es el suelo (y=0): la cabeza queda 12 cm por encima (buceo: 50 cm por debajo).
#  · bucles largos recortados: si el último fotograma no casa con el primero, se busca en el último 40 % el que más se parece.
#  · recolocar: la cadera del primer fotograma vuelve a su sitio en planta; en bucle además se quita la deriva
#    horizontal (lo que avanza de principio a fin) y se centra: «in place». Tumbado: centrado y a ras de suelo.
#  · pies: de pie, si el pie más bajo queda de media por encima o por debajo del suelo, se sube o baja la cadera.
#  · costura del bucle: si el último fotograma repite el primero, se quita; si no, los últimos se funden hacia el primero.
#  · claves: se guardan solo las necesarias (error < TOL_ROT grados / TOL_LOC) y el glb se exporta sin remuestrear.
import bpy, sys, os, json, math, time
import numpy as np
from mathutils import Matrix, Vector, Quaternion
args=[a for a in sys.argv[1:] if not a.endswith('.py')]
if '--' in sys.argv: args=sys.argv[sys.argv.index('--')+1:]
BASE,MIX,UAL,SAL,CAT=args[:5]; SOLO=set(args[5:])
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'mixamo_retarget.py')).read())
UAL1=os.path.join(UAL,'Universal Animation Library[Standard]','Universal Animation Library[Standard]','Unreal-Godot','UAL1_Standard.glb')
UAL2=os.path.join(UAL,'Universal Animation Library 2[Standard]','Universal Animation Library 2[Standard]','Unreal-Godot','UAL2_Standard.glb')
TOL_ROT=0.35   # grados
TOL_LOC=0.25   # unidades locales de la cadera de Remy (~1 mm a escala de juego)

GRUPOS=['base','dia','social','baile','musica','trabajo','gimnasio','boxeo','policia','agua','mayores_ninos']
# nombre | grupo | fuente (m: FBX de Mixamo · q1/q2: acción de la UAL 1/2) | bucle | postura | extras (rango=a-b, paso=n, nivel=n,
# tumbado: recolocar a ras de suelo, recto: no enderezar, fijo: no tocar la altura de la cadera)
# Las 10 de remy.glb (parado, andar, correr, sentado, beber, hablar, dormir, sentado_hablar, sentado_beber, usar) salen de hornear().
TABLA='''
sentarse_silla|base|m:Stand To Sit|0|sentado|
levantarse_sentado|base|m:Stand Up (1)|0|sentado|
coger_suelo|base|m:Picking Up|0|de_pie|
abrir_puerta|base|m:Opening Door Inwards|0|de_pie|
bostezar|base|m:Yawn|0|de_pie|
mirar_movil|base|m:Texting While Standing|1|de_pie|paso=2
hablar_telefono|base|m:Talking On A Cell Phone|1|de_pie|rango=1-600 paso=2
teclear|base|m:Typing|1|sentado|paso=2
comer|base|q2:Consume|1|de_pie|
dormir_de_lado|dia|m:Sleeping Idle|1|tumbado|tumbado recto
dormir_inquieto|dia|m:Sleeping Idle (1)|1|tumbado|tumbado recto paso=2
tumbado_cama|dia|m:Laying Idle|1|tumbado|tumbado recto
levantarse_suelo_espalda|dia|m:Stand Up|0|tumbado|recto fijo
levantarse_tumbado|dia|q2:LayToIdle|0|tumbado|recto fijo
levantarse_rodillas|dia|m:Standing|0|suelo|fijo
estirar_brazos|dia|m:Arm Stretching|0|de_pie|
estirar_cuello|dia|m:Neck Stretching|0|de_pie|
beber_fuente|dia|m:Drinking Fountain|0|de_pie|
sentado_suelo|dia|m:Sitting Idle (1)|1|suelo|paso=2 fijo
sentado_esperando|dia|m:Sitting|1|sentado|
sentado_relajado|dia|q1:Sitting_Idle_Loop|1|sentado|
sentado_hablar_2|dia|q1:Sitting_Talking_Loop|1|sentado|
sentarse_rapido|dia|q1:Sitting_Enter|0|sentado|
levantarse_rapido|dia|q1:Sitting_Exit|0|sentado|
despertar_sentado|dia|m:Waking|0|sentado|
sentado_a_teclear|dia|m:Sit To Type|0|sentado|
teclear_a_sentado|dia|m:Type To Sit|0|sentado|
escribir|dia|m:Writing|1|sentado|
jugar_consola|dia|m:Gaming|1|sentado|
conducir|dia|q1:Driving_Loop|1|sentado|
abrir_armario|dia|m:Opening|0|de_pie|
abrir_cajon|dia|m:Opening A Filing Cabinet|0|de_pie|paso=2
abrir_baul|dia|q2:Chest_Open|0|de_pie|
dejar_objeto|dia|m:Putting Down|0|de_pie|
coger_mesa|dia|q1:PickUp_Table|0|de_pie|
interactuar|dia|q1:Interact|0|de_pie|
puerta_cerrada|dia|m:Opening (2)|0|de_pie|
pulsar_boton|dia|m:Button Pushing|0|de_pie|
hablar_telefono_2|dia|q2:Idle_TalkingPhone_Loop|1|de_pie|
hablar_telefono_paseando|dia|m:Talking Phone Pacing|1|de_pie|rango=1-600 paso=2
andar_mirando_movil|dia|m:Walking While Texting|1|de_pie|
brazos_cruzados|dia|q2:Idle_FoldArms_Loop|1|de_pie|
agachado|dia|q1:Crouch_Idle_Loop|1|suelo|fijo
andar_agachado|dia|q1:Crouch_Fwd_Loop|1|suelo|fijo
llorar|dia|m:Crying|1|de_pie|
pensar|dia|m:Thinking|1|de_pie|
aburrido|dia|m:Bored|1|de_pie|paso=2
triste|dia|m:Sad Idle|1|de_pie|
rechazado|dia|m:Rejected|0|de_pie|
andar_triste|dia|m:Sad Walk|1|de_pie|
contento|dia|m:Happy Idle|1|de_pie|
emocionado|dia|m:Excited|0|de_pie|
andar_contento|dia|m:Happy Walk|1|de_pie|endereza
saltar|dia|m:Jump|0|de_pie|
saludar|social|m:Waving|0|de_pie|
saludo_formal|social|m:Standing Greeting|0|de_pie|
reverencia|social|m:Quick Informal Bow|0|de_pie|
dar_la_mano|social|m:Shaking Hands 2|0|de_pie|
besar|social|m:Kiss|0|de_pie|
besar_alto|social|m:Kiss (1)|0|de_pie|
lanzar_beso|social|m:Blow A Kiss|0|de_pie|
consolar_palmada|social|m:Patting|0|de_pie|
contar_secreto|social|m:Telling A Secret|0|de_pie|
asentir|social|m:Lengthy Head Nod|0|de_pie|
asentir_corto|social|q2:Yes|0|de_pie|
negar_no|social|m:No|0|de_pie|
negar_cabeza|social|m:Thoughtful Head Shake|0|de_pie|
negar_idle|social|q2:Idle_No_Loop|1|de_pie|
pulgar_arriba|social|m:Standing Thumbs Up|0|de_pie|
aplaudir|social|m:Clapping|1|de_pie|
celebrar|social|m:Victory|0|de_pie|
reir|social|m:Laughing|1|de_pie|
reir_sentado|social|m:Sitting Laughing|1|sentado|
hablar_contento|social|m:Happy Hand Gesture|0|de_pie|
charlar_de_pie|social|m:Talking At Watercooler|1|de_pie|rango=1-600 paso=2
reunion_mesa|social|m:Having A Meeting, Male|1|sentado|rango=1-600 paso=2
discutir|social|m:Standing Arguing|1|de_pie|paso=2
enfadado|social|m:Angry|1|de_pie|paso=2
discutir_enfadado|social|m:Angry Gesture|0|de_pie|
senalar_enfadado|social|m:Angry Point|0|de_pie|
gritar|social|m:Standing Yell|0|de_pie|
borracho_idle|social|m:Drunk Idle|1|de_pie|
borracho_tropezar|social|m:Drunk Idle Variation|0|de_pie|
borracho_andar|social|m:Drunk Walk|1|de_pie|endereza
bailar_sencillo|baile|q1:Dance_Loop|1|de_pie|
bailar_ymca|baile|m:Ymca Dance|1|de_pie|
bailar_pollito|baile|m:Chicken Dance|1|de_pie|
bailar_twist|baile|m:Twist Dance|1|de_pie|
bailar_shuffle|baile|m:Shuffling|1|de_pie|
bailar_running_man|baile|m:Dancing Running Man|1|de_pie|
bailar_hiphop|baile|m:Hip Hop Dancing|1|de_pie|
bailar_salsa|baile|m:Salsa Dancing|1|de_pie|
bailar_rumba|baile|m:Rumba Dancing|1|de_pie|
bailar_swing|baile|m:Swing Dancing|1|de_pie|
tocar_piano|musica|m:Piano Playing|1|sentado|
tocar_piano_largo|musica|m:Piano Playing (1)|1|sentado|paso=2
tocar_guitarra|musica|m:Guitar Playing|1|de_pie|
tocar_bajo|musica|m:Guitar Playing (1)|1|de_pie|
tocar_violin|musica|m:Playing The Violin|1|de_pie|rango=1-600 paso=2
tocar_bateria|musica|m:Playing Drums|1|sentado|
cantar_micro|musica|m:Rapping|1|de_pie|
reparar_aparato|trabajo|m:Working On Device|1|suelo|fijo
reparar_arrodillado|trabajo|q1:Fixing_Kneeling|1|suelo|fijo rango=24-126
martillear|trabajo|q2:TreeChopping_Loop|1|de_pie|recto
cargar_caja_idle|trabajo|m:Box Idle|1|de_pie|
cargar_caja_trotar|trabajo|m:Jogging With Box|1|de_pie|
andar_cargando|trabajo|q2:Walk_Carry_Loop|1|de_pie|
empujar|trabajo|q1:Push_Loop|1|de_pie|
empujar_pesado|trabajo|m:Pushing|1|de_pie|
tirar_pesado|trabajo|m:Pull Heavy Object|1|de_pie|
camarero_servir|trabajo|m:Bartending|1|de_pie|paso=2
regar|trabajo|m:Watering|1|de_pie|
regar_regadera|trabajo|q2:Farm_Watering|1|de_pie|
sembrar|trabajo|q2:Farm_PlantSeed|0|de_pie|
cosechar|trabajo|q2:Farm_Harvest|0|de_pie|
plantar|trabajo|m:Plant A Plant|1|suelo|fijo
cavar_sembrar|trabajo|m:Dig And Plant Seeds|1|suelo|fijo
cavar_pala|trabajo|m:Digging|1|de_pie|
gimnasio_idle|gimnasio|m:Idle|1|de_pie|
calentar_estirar|gimnasio|m:Arm Stretching|1|de_pie|
sentadillas|gimnasio|m:Air Squat|1|de_pie|
jumping_jacks|gimnasio|m:Jumping Jacks|1|de_pie|
burpee|gimnasio|m:Burpee|1|de_pie|fijo
flexiones|gimnasio|m:Push Up|1|suelo|recto fijo
abdominales|gimnasio|m:Situps|1|suelo|recto fijo
agotado_tumbado|gimnasio|m:Laying Breathless|1|tumbado|tumbado recto
pesas_biceps|gimnasio|m:Bicep Curl|1|de_pie|
pesas_elevaciones|gimnasio|m:Front Raises|1|de_pie|
kettlebell|gimnasio|m:Kettlebell Swing|1|de_pie|
levantar_pesa_olimpica|gimnasio|m:Clean And Jerk|0|de_pie|paso=2
cinta_correr|gimnasio|m:Treadmill Running|1|de_pie|rango=150-237
correr_rapido|gimnasio|m:Medium Run|1|de_pie|
sprint|gimnasio|m:Sprint|1|de_pie|
correr_cansado|gimnasio|m:Running Tired|0|de_pie|
trotar_tropezar|gimnasio|m:Jogging Stumble|0|de_pie|
calentamiento_boxeo|boxeo|m:Warming Up|1|de_pie|nivel=1
boxeo_guardia|boxeo|m:Boxing|1|de_pie|nivel=2
boxeo_guardia_saltando|boxeo|m:Idle (1)|1|de_pie|nivel=3
boxeo_jab_corto|boxeo|m:Lead Jab|0|de_pie|nivel=1
boxeo_jab|boxeo|m:Boxing (1)|0|de_pie|nivel=2
boxeo_cruzado|boxeo|m:Boxing (2)|0|de_pie|nivel=2
boxeo_gancho|boxeo|m:Boxing (3)|0|de_pie|nivel=2
boxeo_bloqueo|boxeo|m:Center Block|0|de_pie|nivel=2
boxeo_uppercut|boxeo|m:Boxing (4)|0|de_pie|nivel=3
boxeo_combo4|boxeo|m:Punch Combo|0|de_pie|nivel=3
boxeo_esquivar|boxeo|m:Dodging|0|de_pie|nivel=3
boxeo_combo8|boxeo|m:Combo Punch|0|de_pie|nivel=4
saco_boxeo|boxeo|m:Punching Bag|1|de_pie|nivel=3
pera_boxeo|boxeo|m:Speedbag|1|de_pie|nivel=4
recibir_golpe_cara|boxeo|m:Head Hit|0|de_pie|
ko_higado|boxeo|m:Livershot Knockdown|0|de_pie|fijo
boxeo_derrota|boxeo|m:Defeat|0|de_pie|
artes_marciales_guardia|boxeo|m:Mma Idle|1|de_pie|nivel=2
patada_baja|boxeo|m:Mma Kick|0|de_pie|nivel=1
patada_frontal|boxeo|m:Kicking|0|de_pie|nivel=1
patada_media|boxeo|m:Mma Kick (1)|0|de_pie|nivel=2
patada_circular|boxeo|m:Kicking (1)|0|de_pie|nivel=3
patada_alta|boxeo|m:Mma Kick (2)|0|de_pie|nivel=3
patada_giratoria|boxeo|m:Mma Kick (3)|0|de_pie|nivel=4
patada_huracan|boxeo|m:Hurricane Kick|0|de_pie|nivel=4 fijo
capoeira_combo|boxeo|m:Capoeira|1|de_pie|nivel=4 fijo
saludo_militar|policia|m:Salute|0|de_pie|
vigilar_mirar_lejos|policia|m:Looking|0|de_pie|
linterna|policia|q1:Idle_Torch_Loop|1|de_pie|
policia_reducir|policia|m:Restrain|0|de_pie|
inmovilizar|policia|m:Holding Down|0|suelo|fijo
piscina_flotar|agua|m:Treading Water|1|agua|recto fijo
nadar_parado|agua|q1:Swim_Idle_Loop|1|agua|recto fijo
nadar_crol|agua|q1:Swim_Fwd_Loop|1|agua|recto fijo
piscina_nadar|agua|m:Swimming|1|agua|recto fijo buceo
piscina_braza_al_borde|agua|m:Swimming To Edge|0|agua|recto fijo
piscina_caer_agua|agua|m:Falling Into Pool|0|de_pie|fijo
anciano_idle|mayores_ninos|m:Old Man Idle|1|de_pie|paso=2
anciano_andar|mayores_ninos|m:Old Man Walk|1|de_pie|
anciano_dolor_espalda|mayores_ninos|m:Pain Gesture|0|de_pie|
anciano_derrotado|mayores_ninos|m:Defeat Idle|1|de_pie|
nino_apoyado_pared_musica|mayores_ninos|m:Leaning On A Wall|1|de_pie|
nino_sentado_balanceando_piernas|mayores_ninos|m:Sitting (1)|1|sentado|
'''
# rápidas: se quedan a 30 fps aunque sean largas
RAPIDOS={'baile','boxeo','gimnasio'}
BASE_REMY={'parado':1,'andar':1,'correr':1,'sentado':1,'beber':1,'hablar':1,'dormir':1,'sentado_hablar':1,'sentado_beber':1,'usar':1}
POST_REMY={'sentado':'sentado','sentado_hablar':'sentado','sentado_beber':'sentado','dormir':'tumbado','usar':'de_pie'}
ORIG_REMY={'parado':'Standing Idle','andar':'Standard Walk','correr':'Jogging','sentado':'Sitting Idle','beber':'Male Drinking','hablar':'Talking (General Conversation)',
    'dormir':'Laying Asleep On A Bed','sentado_hablar':'Sitting Talking','sentado_beber':'Sitting Drinking (tramo sentado)','usar':'Standing Idle + brazos de Typing'}

def leer_tabla():
    out=[]
    for ln in TABLA.strip().splitlines():
        n,g,f,b,p,x=ln.split('|')
        e={'n':n,'g':g,'src':f.split(':',1)[0],'f':f.split(':',1)[1],'bucle':b=='1','post':p,'paso':1,'rango':None,'nivel':None,
           'tumbado':False,'recto':False,'fijo':False,'endereza':False,'buceo':False}
        for t in x.split():
            if '=' in t:
                k,v=t.split('=')
                if k=='rango': a,b_=v.split('-'); e['rango']=(int(a),int(b_))
                else: e[k]=int(v)
            else: e[t]=True
        out.append(e)
    return out

# ---------- geometría ----------
def mundo(T, fr):
    """matrices en espacio de armadura de todos los huesos en un fotograma {hueso:(loc,quat)}"""
    REST=_REST; M={}
    for b in _ORDEN:
        n=b.name; par=b.parent.name if b.parent else None
        rel=(REST[par].inverted()@REST[n]) if par else REST[n]
        l,q=fr.get(n,(Vector(),Quaternion()))
        M[n]=((M[par]@rel) if par else rel)@(Matrix.Translation(l)@q.to_matrix().to_4x4())
    return M
def aplicar_raiz(frames, raiz, G):
    """G: matriz en espacio de armadura que se aplica a la cadera de todos los fotogramas"""
    R=_REST[raiz]
    for fr in frames:
        l,q=fr[raiz]
        Mr=G@(R@Matrix.Translation(l)@q.to_matrix().to_4x4())
        l2,q2,_=(R.inverted()@Mr).decompose(); fr[raiz]=(l2,q2)
def frente(T, M, n):
    """dirección horizontal (mundo) a la que mira el hueso n, o None si está tumbado"""
    Tw=T.matrix_world
    q=(Tw@M[n]).to_quaternion()@(Tw@_REST[n]).to_quaternion().inverted()
    f=q@Vector((0,-1,0)); h=Vector((f.x,f.y))
    return h if h.length>0.5 else None

def preparar(T, frames, e, raiz, mapa):
    """endereza, recoloca, ajusta pies y cierra el bucle. Devuelve notas para el informe"""
    Tw=T.matrix_world; Twi=Tw.inverted(); notas={}
    rr=(Tw@_REST[raiz]).translation
    if e['tumbado']:
        recolocar(T,frames,raiz,'tumbado'); notas['recoloca']='tumbado'
    else:
        M0=mundo(T,frames[0])
        if not e['recto'] and (e['endereza'] or e['src']!='m'):
            fs=[frente(T,M0,raiz),frente(T,M0,mapa['Spine2'])]
            if all(f is not None for f in fs):
                v=(fs[0].normalized()+fs[1].normalized())
                ang=math.atan2(v.x,-v.y)            # 0 = mira a -Y
                if abs(math.degrees(ang))>8 and (e['endereza'] or abs(math.degrees(ang))<=20):
                    r0=(Tw@M0[raiz]).translation
                    gw=Matrix.Translation((r0.x,r0.y,0))@Matrix.Rotation(-ang,4,'Z')@Matrix.Translation((-r0.x,-r0.y,0))
                    aplicar_raiz(frames,raiz,Twi@gw@Tw); notas['giro']=round(math.degrees(ang))
        # posición de la cadera en planta (mundo)
        P=[(Tw@(_REST[raiz]@Matrix.Translation(fr[raiz][0]))).translation for fr in frames]
        n=len(P)
        if e['bucle'] and n>2:
            d=P[-1]-P[0]
            if math.hypot(d.x,d.y)>0.02*_ALT: notas['deriva']=round(math.hypot(d.x,d.y)/_ALT*1.8,2)
            for i,fr in enumerate(frames):
                t=i/(n-1); off=Vector((d.x*t,d.y*t,0))
                aplicar_raiz([fr],raiz,Matrix.Translation(Twi.to_3x3()@(-off)))
            P=[(Tw@(_REST[raiz]@Matrix.Translation(fr[raiz][0]))).translation for fr in frames]
            c=sum(P,Vector())/n
            dw=Vector((rr.x-c.x,rr.y-c.y,0))
        else:
            dw=Vector((rr.x-P[0].x,rr.y-P[0].y,0))
        aplicar_raiz(frames,raiz,Matrix.Translation(Twi.to_3x3()@dw))
    # pies a ras de suelo (solo de pie): el pie más bajo de cada fotograma; su valor típico debe ser el del reposo
    if e['post']=='de_pie' and not e['fijo']:
        pies=[mapa[k] for k in ('LeftToeBase','RightToeBase','LeftFoot','RightFoot')]
        z0=min((Tw@_REST[p]).translation.z for p in pies)
        zs=sorted(min((Tw@mundo(T,fr)[p]).translation.z for p in pies) for fr in frames[::max(1,len(frames)//60)])
        z=zs[len(zs)//5]   # percentil 20: los apoyos
        if abs(z-z0)>0.006*_ALT:
            aplicar_raiz(frames,raiz,Matrix.Translation(Twi.to_3x3()@Vector((0,0,z0-z)))); notas['pies']=round((z0-z)/_ALT*180,1)  # cm
    # agua: cabeza a ras de la superficie (y=0)
    if e['post']=='agua':
        zc=sum((Tw@mundo(T,fr)[mapa['Head']]).translation.z for fr in frames)/len(frames)
        meta=(-0.50 if e['buceo'] else 0.12)*_ALT/1.8
        aplicar_raiz(frames,raiz,Matrix.Translation(Twi.to_3x3()@Vector((0,0,meta-zc)))); notas['agua']=round((meta-zc)/_ALT*1.8,2)
    # costura del bucle
    if e['bucle'] and len(frames)>4:
        err=costura(frames)
        if err>10 and len(frames)>20:
            n=len(frames); mejor=min(range(int(n*0.6),n),key=lambda j:costura([frames[0],frames[j]]))
            e2=costura([frames[0],frames[mejor]])
            if e2<err*0.5:
                del frames[mejor+1:]; notas['recorte']=n-len(frames); err=e2
        notas['costura']=round(err,1)
        # Godot hace la animación tan larga como su última clave y salta de ella a la primera: el último fotograma
        # tiene que ser el primero repetido
        if err<0.4: frames[-1]={h:(l.copy(),q.copy()) for h,(l,q) in frames[0].items()}
        else:
            n=len(frames); K=max(3,min(15,n//5))
            f0=frames[0]
            for j in range(K):
                i=n-K+j; w=(j+1)/(K+1); w=w*w*(3-2*w)
                fr=frames[i]
                for h,(l,q) in fr.items():
                    l0,q0=f0[h]
                    fr[h]=(l.lerp(l0,w),q.slerp(q0,w))
            notas['costura_tras']=round(costura(frames),1)
            frames.append({h:(l.copy(),q.copy()) for h,(l,q) in frames[0].items()})
    return notas

def costura(frames):
    a,b=frames[0],frames[-1]
    return max(math.degrees(a[h][1].rotation_difference(b[h][1]).angle) for h in a)

def stats(T, frames, raiz, mapa, fps):
    """duración, desplazamiento de la cadera, altura de la cadera al empezar, si solo mueve brazos, pies bajo el suelo"""
    Tw=T.matrix_world
    P=[(Tw@(_REST[raiz]@Matrix.Translation(fr[raiz][0]))).translation for fr in frames]
    rr=(Tw@_REST[raiz]).translation
    desp=max(math.hypot(p.x-rr.x,p.y-rr.y) for p in P)
    piernas=[mapa[k] for k in ('LeftUpLeg','RightUpLeg','LeftLeg','RightLeg','LeftFoot','RightFoot','Hips','Spine')]
    mov=0.0
    for h in piernas:
        q0=frames[0][h][1]
        mov=max(mov,max(math.degrees(fr[h][1].rotation_difference(q0).angle) for fr in frames))
    dz=max(abs(p.z-P[0].z) for p in P)
    pies=[mapa[k] for k in ('LeftToeBase','RightToeBase','LeftFoot','RightFoot')]
    z0=min((Tw@_REST[p]).translation.z for p in pies)
    zmin=min(min((Tw@mundo(T,fr)[p]).translation.z for p in pies) for fr in frames[::max(1,len(frames)//80)])
    return {'desp':desp,'cadera':P[0].z,'mov_piernas':mov,'dz':dz,'pie_bajo':(z0-zmin)}

# ---------- claves ----------
def _claves(V, err, tol):
    """índices de clave para que la interpolación lineal entre claves no se aparte más de tol (greedy con búsqueda exponencial)"""
    n=len(V); ks=[0]; i=0
    def ok(i,j):
        if j<=i+1: return True
        t=(np.arange(i+1,j)-i)/(j-i)
        return err(V[i],V[j],t,V[i+1:j])<=tol
    while i<n-1:
        s=1
        while i+s*2<=n-1 and ok(i,i+s*2): s*=2
        lo,hi=i+s,min(i+s*2,n-1)
        if hi>lo and ok(i,hi): lo=hi
        else:
            while hi-lo>1:
                m=(lo+hi)//2
                if ok(i,m): lo=m
                else: hi=m
        ks.append(lo); i=lo
    return ks
def _err_q(a,b,t,mid):
    q=a[None,:]*(1-t[:,None])+b[None,:]*t[:,None]
    q/=np.linalg.norm(q,axis=1)[:,None]
    d=np.clip(np.abs((q*mid).sum(1)),0,1)
    return np.degrees(2*np.arccos(d)).max()
def _err_l(a,b,t,mid):
    p=a[None,:]*(1-t[:,None])+b[None,:]*t[:,None]
    return np.linalg.norm(p-mid,axis=1).max()

def escribir_reducido(T, nombre, frames, paso, raiz):
    """como escribir() de mixamo_retarget.py, pero solo con las claves que hacen falta (interpolación lineal)"""
    if T.animation_data is None: T.animation_data_create()
    A=bpy.data.actions.new(nombre); A.use_fake_user=True
    T.animation_data.action=A
    n=len(frames); fr_idx=np.arange(n)*paso+1.0
    nclaves=0
    for h in frames[0]:
        Q=np.array([[*fr[h][1]] for fr in frames])
        for i in range(1,n):
            if np.dot(Q[i],Q[i-1])<0: Q[i]=-Q[i]
        ks=list(range(n))      # todas: el exportador glTF remuestrea igualmente; se reducen después en el .glb (reducir_glb)
        canales=[('rotation_quaternion',Q,ks)]
        if h==raiz:
            L=np.array([[*fr[h][0]] for fr in frames]); canales.append(('location',L,ks))
        pb=T.pose.bones[h]; pb.rotation_mode='QUATERNION'
        for prop,V,ks in canales:
            path='pose.bones["%s"].%s'%(h,prop)
            for c in range(V.shape[1]):
                fc=A.fcurve_ensure_for_datablock(T,path,index=c,group_name=h)
                fc.keyframe_points.add(len(ks))
                co=np.empty(2*len(ks)); co[0::2]=fr_idx[ks]; co[1::2]=V[ks,c]
                fc.keyframe_points.foreach_set('co',co)
                fc.keyframe_points.foreach_set('interpolation',[1]*len(ks))   # LINEAR
                fc.update()
            nclaves+=len(ks)
    T.animation_data.action=None
    tr=T.animation_data.nla_tracks.new(); tr.name=nombre
    st=tr.strips.new(nombre,1,A); st.name=nombre
    for pb in T.pose.bones: pb.matrix_basis=Matrix.Identity(4)
    return A,nclaves

def reducir_glb(ruta, raiz):
    """reescribe las animaciones del .glb: fuera las pistas de escala y las de posición salvo la de la cadera (el juego
    las quita igualmente: PersonaAnimada._libreria), y en cada pista solo las claves necesarias para que la interpolación
    lineal (slerp en rotación) no se aparte más de TOL_ROT grados / TOL_LOC unidades. Devuelve (claves antes, después)"""
    import struct
    b=open(ruta,'rb').read()
    lj=struct.unpack('<I',b[12:16])[0]; j=json.loads(b[20:20+lj]); off=20+lj
    lb=struct.unpack('<I',b[off:off+4])[0]; BIN=b[off+8:off+8+lb]
    NC={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
    def leer(i):
        a=j['accessors'][i]; bv=j['bufferViews'][a['bufferView']]
        nc=NC[a['type']]; dt={5126:np.float32,5123:np.uint16,5121:np.uint8,5125:np.uint32}[a['componentType']]
        st=bv.get('byteStride',0); o=bv.get('byteOffset',0)+a.get('byteOffset',0)
        if st and st!=nc*np.dtype(dt).itemsize: raise RuntimeError('stride')
        return np.frombuffer(BIN,dtype=dt,count=a['count']*nc,offset=o).reshape(a['count'],nc).copy()
    usados_anim={i for an in j.get('animations',[]) for s_ in an['samplers'] for i in (s_['input'],s_['output'])}
    datos=[]; nuevos_acc=[]; mapa_acc={}
    def nuevo(arr,tipo,comp,minmax=False,target=None):
        arr=np.ascontiguousarray(arr)
        while sum(len(d) for d in datos)%4: datos.append(b'\0')
        o=sum(len(d) for d in datos); raw=arr.tobytes(); datos.append(raw)
        bv={'buffer':0,'byteOffset':o,'byteLength':len(raw)}
        if target: bv['target']=target
        j2bv.append(bv)
        acc={'bufferView':len(j2bv)-1,'componentType':comp,'count':int(arr.shape[0]),'type':tipo}
        if minmax: acc['min']=[float(x) for x in arr.min(0)]; acc['max']=[float(x) for x in arr.max(0)]
        nuevos_acc.append(acc); return len(nuevos_acc)-1
    j2bv=[]
    # lo que no es animación (malla, piel) se copia tal cual
    for i,a in enumerate(j['accessors']):
        if i in usados_anim: continue
        arr=leer(i); bv=j['bufferViews'][a['bufferView']]
        k=nuevo(arr,a['type'],a['componentType'],'min' in a,bv.get('target'))
        for c in ('normalized',): 
            if c in a: nuevos_acc[k][c]=a[c]
        if 'min' in a: nuevos_acc[k]['min']=a['min']; nuevos_acc[k]['max']=a['max']
        mapa_acc[i]=k
    for m in j.get('meshes',[]):
        for p in m['primitives']:
            p['attributes']={k:mapa_acc[v] for k,v in p['attributes'].items()}
            if 'indices' in p: p['indices']=mapa_acc[p['indices']]
    for s_ in j.get('skins',[]):
        if 'inverseBindMatrices' in s_: s_['inverseBindMatrices']=mapa_acc[s_['inverseBindMatrices']]
    antes=despues=0
    # todas las claves en un solo bufferView (las pistas son accesores con su desplazamiento): JSON mucho más corto
    tiempos={}; trozos=[]; pend=[]
    def anim_acc(arr,tipo,minmax=False):
        o=sum(len(x) for x in trozos); raw=np.ascontiguousarray(arr).tobytes(); trozos.append(raw)
        acc={'bufferView':None,'byteOffset':o,'componentType':5126,'count':int(arr.shape[0]),'type':tipo}
        if minmax: acc['min']=[float(x) for x in arr.min(0)]; acc['max']=[float(x) for x in arr.max(0)]
        nuevos_acc.append(acc); pend.append(acc); return len(nuevos_acc)-1
    for an in j.get('animations',[]):
        ch2=[]; sm2=[]
        for c in an['channels']:
            nodo=j['nodes'][c['target']['node']]['name']; path=c['target']['path']
            s_=an['samplers'][c['sampler']]
            t=leer(s_['input'])[:,0]; v=leer(s_['output'])
            antes+=len(t)
            if path=='scale' or (path=='translation' and nodo!=raiz): continue
            if len(t)>1 and s_['interpolation']=='STEP' and np.allclose(v,v[0]): t,v=t[:1],v[:1]
            elif len(t)>2:
                if path=='rotation':
                    for i in range(1,len(v)):
                        if np.dot(v[i],v[i-1])<0: v[i]=-v[i]
                    ks=_claves(v.astype(np.float64),_err_q,TOL_ROT)
                else: ks=_claves(v.astype(np.float64),_err_l,TOL_LOC)
                if len(ks)==2 and np.allclose(v[ks[0]],v[ks[1]],atol=1e-6) and (np.abs(v-v[0]).max()<1e-5): ks=[0]
                t,v=t[ks],v[ks]
            despues+=len(t)
            kt=t.astype(np.float32).tobytes()
            if kt not in tiempos: tiempos[kt]=anim_acc(t.astype(np.float32).reshape(-1,1),'SCALAR',True)
            ia=tiempos[kt]
            io=anim_acc(v.astype(np.float32),'VEC4' if path=='rotation' else 'VEC3')
            sm2.append({'input':ia,'output':io,'interpolation':'LINEAR' if len(t)>1 else 'STEP'})
            ch2.append({'sampler':len(sm2)-1,'target':c['target']})
        an['channels']=ch2; an['samplers']=sm2
    if trozos:
        while sum(len(d) for d in datos)%4: datos.append(b'\0')
        o=sum(len(d) for d in datos); raw=b''.join(trozos); datos.append(raw)
        j2bv.append({'buffer':0,'byteOffset':o,'byteLength':len(raw)})
        for acc in pend: acc['bufferView']=len(j2bv)-1
    j['accessors']=nuevos_acc; j['bufferViews']=j2bv
    binario=b''.join(datos)
    while len(binario)%4: binario+=b'\0'
    j['buffers']=[{'byteLength':len(binario)}]
    js=json.dumps(j,separators=(',',':')).encode()
    while len(js)%4: js+=b' '
    out=struct.pack('<III',0x46546C67,2,12+8+len(js)+8+len(binario))+struct.pack('<I',len(js))+b'JSON'+js+struct.pack('<I',len(binario))+b'BIN\0'+binario
    open(ruta,'wb').write(out)
    return antes,despues

# ---------- montaje ----------
def nuevo_remy():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc=bpy.context.scene; sc.render.fps=30
    bpy.ops.import_scene.fbx(filepath=os.path.join(BASE,'Remy.fbx'))
    T=[o for o in bpy.data.objects if o.type=='ARMATURE'][0]; T.name='Armature'; T.data.name='Armature'
    T.animation_data_clear()
    for a in list(bpy.data.actions): bpy.data.actions.remove(a)
    for o in [o for o in bpy.data.objects if o.type=='MESH']: bpy.data.objects.remove(o,do_unlink=True)
    for pb in T.pose.bones: pb.matrix_basis=Matrix.Identity(4)
    mapa={b.name.replace('mixamorig:',''):b.name for b in T.data.bones}
    # triángulo mínimo pegado a la cadera: sin malla con piel, Godot no crea el Skeleton3D y las pistas no casarían
    h=T.data.bones[mapa['Hips']].head_local
    me=bpy.data.meshes.new('ancla'); me.from_pydata([tuple(h),tuple(h+Vector((0.5,0,0))),tuple(h+Vector((0,0.5,0)))],[],[(0,1,2)])
    ob=bpy.data.objects.new('ancla',me); bpy.context.scene.collection.objects.link(ob)
    ob.parent=T; ob.matrix_parent_inverse=Matrix.Identity(4)
    vg=ob.vertex_groups.new(name=mapa['Hips']); vg.add([0,1,2],1.0,'REPLACE')
    md=ob.modifiers.new('Armature','ARMATURE'); md.object=T
    return T,ob,mapa

def exportar(T, ob, ruta):
    bpy.ops.object.select_all(action='DESELECT')
    T.select_set(True); ob.select_set(True); bpy.context.view_layer.objects.active=T
    bpy.ops.export_scene.gltf(filepath=ruta,export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',
        export_skins=True,export_morph=False,export_materials='NONE',export_yup=True,export_force_sampling=False,
        export_optimize_animation_size=True,export_def_bones=False,export_reset_pose_bones=True)

def main():
    global _REST,_ORDEN,_ALT
    t0=time.time()
    tabla=leer_tabla()
    os.makedirs(SAL,exist_ok=True)
    try: cat=json.load(open(CAT))
    except Exception: cat={}
    anims=cat.get('animaciones',{})
    informe=[]
    grupos=[g for g in GRUPOS if not SOLO or g in SOLO]
    for g in grupos:
        T,ob,mapa=nuevo_remy()
        _REST={b.name:b.matrix_local.copy() for b in T.data.bones}; _ORDEN=_orden(T)
        rest_z=[(T.matrix_world@m).translation.z for m in _REST.values()]
        _ALT=3.7848    # altura de la malla de Remy (remy.json «altura»): 1,80 m en el juego
        raiz=mapa['Hips']; fps=bpy.context.scene.render.fps
        for k in [k for k,v in anims.items() if v.get('g')==g]: del anims[k]
        if g=='base':
            # escribir() de mixamo_retarget.py, con claves reducidas (el glb se exporta sin remuestrear)
            global escribir
            def escribir(T_,nombre,frames,datos): return escribir_reducido(T_,nombre,frames,datos['paso'],raiz)[0]
            # las 10 de remy.glb, idénticas (mismo hornear()); escribir() queda tal cual
            meta=hornear(T,BASE,mapa)
            for nom in BASE_REMY:
                A=bpy.data.actions[nom]
                d=(A.frame_range[1]-A.frame_range[0])/fps
                anims[nom]={'g':g,'bucle':True,'dur':round(d,2),'post':POST_REMY.get(nom,'de_pie'),'brazos':nom=='usar','nivel':None,
                    'fuente':'mixamo','orig':ORIG_REMY[nom]}
                if 'cadera_'+nom in meta: anims[nom]['cadera']=meta['cadera_'+nom]
            meta_g=meta
        quat={}
        for e in [e for e in tabla if e['g']==g]:
            paso=e['paso'] if g not in RAPIDOS else 1
            if e['src']=='m':
                frames,d=muestrear(T,os.path.join(MIX,e['f']+'.fbx'),mapa,paso=paso,rango=e['rango'])
            else:
                if e['src'] not in quat:
                    S,acc,nuevos=cargar_quaternius(UAL1 if e['src']=='q1' else UAL2)
                    quat[e['src']]=(S,acc)
                S,acc=quat[e['src']]
                frames,d=muestrear_accion(T,S,acc[e['f']],pares_quaternius(S,mapa),'pelvis',paso=paso,rango=e['rango'])
            notas=preparar(T,frames,e,raiz,mapa)
            st=stats(T,frames,raiz,mapa,fps)
            A,nk=escribir_reducido(T,e['n'],frames,paso,raiz)
            dur=(len(frames)-1)*paso/fps
            brazos=e['post'] in ('de_pie','sentado') and st['mov_piernas']<16 and st['desp']<0.028*_ALT and st['dz']<0.02*_ALT
            anims[e['n']]={'g':g,'bucle':e['bucle'],'dur':round(dur,2),'post':e['post'],'brazos':brazos,'nivel':e['nivel'],
                'fuente':'mixamo' if e['src']=='m' else 'quaternius','orig':e['f']}
            if e['post'] in ('sentado','suelo','agua','tumbado'): anims[e['n']]['cadera']=round(st['cadera'],4)
            if st['desp']>0.06*_ALT: anims[e['n']]['desp']=round(st['desp']/_ALT*1.8,2)   # metros a escala de juego
            r={'n':e['n'],'g':g,'frames':len(frames),'claves':nk,'desp_m':round(st['desp']/_ALT*1.8,2),'pie_bajo_cm':round(st['pie_bajo']/_ALT*180,1),
               'mov_piernas':round(st['mov_piernas']),**notas}
            informe.append(r); print('ANIM',json.dumps(r,ensure_ascii=False),flush=True)
        for S,acc in quat.values():
            for a in acc.values(): bpy.data.actions.remove(a)
        ruta=os.path.join(SAL,g+'.glb')
        exportar(T,ob,ruta)
        kb0=os.path.getsize(ruta)/1e6
        an,de=reducir_glb(ruta,raiz)
        print('REDUCIDO',g,round(kb0,2),'->',round(os.path.getsize(ruta)/1e6,2),'MB; claves',an,'->',de,flush=True)
        print('GLB',g,round(os.path.getsize(ruta)/1e6,2),'MB',round(time.time()-t0),'s',flush=True)
    # catálogo: «animaciones» en el orden de los grupos; el resto del archivo (actividades, gestos, huecos) se respeta
    orden=[n for g in GRUPOS for n,v in anims.items() if v.get('g')==g]
    cat['animaciones']={n:anims[n] for n in orden}
    tam={}
    for g in GRUPOS:
        p=os.path.join(SAL,g+'.glb')
        if os.path.exists(p): tam[g]={'kb':round(os.path.getsize(p)/1024),'n':sum(1 for v in anims.values() if v['g']==g)}
    cat['grupos']=tam
    if 'meta_g' in locals(): cat['remy']={'altura':3.7848,'cadera_pie':meta_g.get('cadera_pie')}
    json.dump(cat,open(CAT,'w'),ensure_ascii=False,indent=1)
    json.dump(informe,open(os.path.join(SAL,'informe_%s.json'%('_'.join(sorted(SOLO)) or 'todo')),'w'),ensure_ascii=False,indent=0)
    print('FIN',round(time.time()-t0),'s')
main()
