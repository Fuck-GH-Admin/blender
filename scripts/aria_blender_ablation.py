#!/usr/bin/env python3
# AriaIdol 4-condition x 2-engine Blender ablation.
# Run with: blender -b --python aria_blender_ablation.py -- --pmx ... --glb ... --contract ... --textures ... --out ...
import bpy, os, sys, math, json, argparse, struct, traceback
from mathutils import Vector

def args_after_dashes():
    argv = sys.argv
    tail = argv[argv.index("--") + 1:] if "--" in argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--pmx", required=True)
    p.add_argument("--glb", required=True)
    p.add_argument("--contract", required=True)
    p.add_argument("--textures", required=True)
    p.add_argument("--out", required=True)
    return p.parse_args(tail)

class Reader:
    def __init__(self, data): self.d, self.o = data, 0
    def take(self, n):
        v = self.d[self.o:self.o+n]
        if len(v) != n: raise EOFError("PMX truncated at byte %d, need %d" % (self.o,n))
        self.o += n
        return v
    def u8(self): return struct.unpack("<B", self.take(1))[0]
    def i32(self): return struct.unpack("<i", self.take(4))[0]
    def f32(self): return struct.unpack("<f", self.take(4))[0]
    def f32s(self,n): return struct.unpack("<"+"f"*n, self.take(4*n))
    def text(self,enc):
        n=self.i32()
        return self.take(n).decode("utf-16-le" if enc==0 else "utf-8",errors="replace")
    def idx(self,size):
        if size==1: return struct.unpack("<b",self.take(1))[0]
        if size==2: return struct.unpack("<h",self.take(2))[0]
        return struct.unpack("<i",self.take(4))[0]

def parse_pmx(path):
    r=Reader(open(path,"rb").read())
    if r.take(4)!=b"PMX ": raise ValueError("Not a PMX file")
    version=r.f32(); hsize=r.u8(); enc=r.u8(); add_uv=r.u8()
    vidx,tidx,midx,bidx,moidx,ridx=(r.u8() for _ in range(6))
    r.take(max(0,hsize-8))
    name=r.text(enc); name_en=r.text(enc); comment=r.text(enc); r.text(enc)
    nv=r.i32(); verts=[]; normals=[]; uvs=[]
    for _ in range(nv):
        verts.append(r.f32s(3)); normals.append(r.f32s(3)); uvs.append(r.f32s(2))
        if add_uv: r.f32s(4*add_uv)
        wt=r.u8()
        if wt==0: r.idx(bidx)
        elif wt==1: r.idx(bidx); r.idx(bidx); r.f32()
        elif wt==2:
            for _ in range(4): r.idx(bidx)
            r.f32s(4)
        elif wt in (3,4):
            r.idx(bidx); r.idx(bidx); r.f32(); r.f32s(6)
            if wt==4:
                for _ in range(2): r.idx(bidx)
                r.f32s(2)
        else: raise ValueError("Unknown PMX deform type %d"%wt)
        r.f32()
    nf=r.i32(); faces=[r.idx(vidx) for _ in range(nf)]
    nt=r.i32(); textures=[r.text(enc) for _ in range(nt)]
    nm=r.i32(); mats=[]
    for _ in range(nm):
        m={"name":r.text(enc),"name_en":r.text(enc),"diffuse":r.f32s(4),
           "specular":r.f32s(3),"spec_power":r.f32(),"ambient":r.f32s(3),
           "flags":r.u8(),"edge_color":r.f32s(4),"edge_size":r.f32(),
           "tex":r.idx(tidx),"sphere":r.idx(tidx),"sphere_mode":r.u8(),
           "toon_shared":r.u8()}
        if m["toon_shared"]==0: m["toon"]=r.idx(tidx)
        else: r.take(1)
        r.text(enc); m["surface_count"]=r.i32(); mats.append(m)
    return {"version":version,"name":name,"verts":verts,"normals":normals,"uvs":uvs,
            "faces":faces,"textures":textures,"materials":mats,"add_uv":add_uv}

def set_input(node,name,value):
    if name in node.inputs: node.inputs[name].default_value=value

def make_pbr(name, dpath=None, npath=None, rough=.5, metal=0.0, family="body", alpha=1.0):
    mat=bpy.data.materials.new(name); mat.use_nodes=True
    nt=mat.node_tree; nt.nodes.clear()
    out=nt.nodes.new("ShaderNodeOutputMaterial"); out.location=(520,0)
    bs=nt.nodes.new("ShaderNodeBsdfPrincipled"); bs.location=(250,0)
    nt.links.new(bs.outputs["BSDF"],out.inputs["Surface"])
    set_input(bs,"Base Color",(1.0,1.0,1.0,1.0))
    set_input(bs,"Roughness",rough); set_input(bs,"Metallic",metal)
    set_input(bs,"Specular IOR Level",0.48); set_input(bs,"Alpha",alpha)
    if family=="skin":
        set_input(bs,"Subsurface Weight",0.035)
        set_input(bs,"Subsurface Radius",(1.0,0.42,0.25))
    if family=="hair":
        set_input(bs,"Anisotropic IOR Level",0.28)
        set_input(bs,"Coat Weight",0.08); set_input(bs,"Coat Roughness",0.32)
    if family=="metal": set_input(bs,"Coat Weight",0.12)
    uv=nt.nodes.new("ShaderNodeTexCoord"); uv.location=(-700,0)
    if dpath and os.path.isfile(dpath):
        im=bpy.data.images.load(dpath,check_existing=True)
        try: im.colorspace_settings.name="sRGB"
        except: pass
        tex=nt.nodes.new("ShaderNodeTexImage"); tex.image=im; tex.location=(-470,140)
        nt.links.new(uv.outputs["UV"],tex.inputs["Vector"])
        nt.links.new(tex.outputs["Color"],bs.inputs["Base Color"])
    if npath and os.path.isfile(npath):
        im=bpy.data.images.load(npath,check_existing=True)
        try: im.colorspace_settings.name="Non-Color"
        except: pass
        tex=nt.nodes.new("ShaderNodeTexImage"); tex.image=im; tex.location=(-470,-160)
        nm=nt.nodes.new("ShaderNodeNormalMap"); nm.location=(-180,-150)
        nm.inputs["Strength"].default_value=0.45
        nt.links.new(uv.outputs["UV"],tex.inputs["Vector"])
        nt.links.new(tex.outputs["Color"],nm.inputs["Color"])
        nt.links.new(nm.outputs["Normal"],bs.inputs["Normal"])
    try:
        if alpha<0.999: mat.surface_render_method="DITHERED"
    except: pass
    return mat

def normalize_object(obj, target_height=1.70):
    bpy.context.view_layer.update()
    pts=[obj.matrix_world @ Vector(c) for c in obj.bound_box]
    mn=[min(p[i] for p in pts) for i in range(3)]
    mx=[max(p[i] for p in pts) for i in range(3)]
    h=mx[2]-mn[2]
    if h<=0: raise ValueError("Model has invalid height")
    factor=target_height/h
    obj.scale=tuple(v*factor for v in obj.scale)
    bpy.context.view_layer.update()
    pts=[obj.matrix_world @ Vector(c) for c in obj.bound_box]
    mn=[min(p[i] for p in pts) for i in range(3)]
    mx=[max(p[i] for p in pts) for i in range(3)]
    obj.location.x-=(mn[0]+mx[0])/2
    obj.location.y-=(mn[1]+mx[1])/2
    obj.location.z-=mn[2]
    bpy.context.view_layer.update()
    return factor

def normalize_glb(root, meshes, target_height=1.70):
    bpy.context.view_layer.update()
    pts=[o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    mn=[min(p[i] for p in pts) for i in range(3)]
    mx=[max(p[i] for p in pts) for i in range(3)]
    h=mx[2]-mn[2]
    if h<=0: raise ValueError("GLB has invalid height")
    factor=target_height/h
    root.scale=tuple(v*factor for v in root.scale)
    bpy.context.view_layer.update()
    pts=[o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    mn=[min(p[i] for p in pts) for i in range(3)]
    mx=[max(p[i] for p in pts) for i in range(3)]
    root.location.x-=(mn[0]+mx[0])/2
    root.location.y-=(mn[1]+mx[1])/2
    root.location.z-=mn[2]
    bpy.context.view_layer.update()
    return factor

def setup_scene():
    sc=bpy.context.scene
    world=bpy.data.worlds.new("Ablation_World"); sc.world=world; world.use_nodes=True
    bg=world.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value=(0.34,0.37,0.43,1)
    bg.inputs["Strength"].default_value=0.32
    def area(name,loc,power,size,color):
        d=bpy.data.lights.new(name,"AREA"); d.energy=power; d.shape="DISK"; d.size=size; d.color=color
        o=bpy.data.objects.new(name,d); sc.collection.objects.link(o); o.location=loc
        o.rotation_euler=(Vector((0,0,0.88))-o.location).to_track_quat("-Z","Y").to_euler()
    area("Key_Softbox",(-2.7,-3.2,3.2),470,3.2,(1.0,0.90,0.84))
    area("Fill_Softbox",(2.6,-2.3,2.0),190,3.6,(0.76,0.84,1.0))
    area("Rim_Softbox",(0.7,2.2,3.1),300,2.5,(0.76,0.86,1.0))
    bpy.ops.mesh.primitive_plane_add(size=12,location=(0,0,-0.015))
    floor=bpy.context.object; floor.name="Neutral_Ground"
    fm=bpy.data.materials.new("Neutral_Ground_Mat"); fm.use_nodes=True
    fp=fm.node_tree.nodes.get("Principled BSDF")
    set_input(fp,"Base Color",(0.045,0.052,0.066,1)); set_input(fp,"Roughness",0.88)
    floor.data.materials.append(fm)
    cd=bpy.data.cameras.new("Ablation_Camera"); cd.lens=55
    cam=bpy.data.objects.new("Ablation_Camera",cd); sc.collection.objects.link(cam)
    cam.location=(0.03,-4.6,0.91)
    cam.rotation_euler=(Vector((0,0,0.88))-cam.location).to_track_quat("-Z","Y").to_euler()
    sc.camera=cam
    sc.render.resolution_x=384; sc.render.resolution_y=576; sc.render.resolution_percentage=100
    sc.render.image_settings.file_format="PNG"; sc.render.image_settings.color_mode="RGBA"
    sc.render.image_settings.compression=15; sc.render.film_transparent=False
    sc.view_settings.view_transform="Standard"; sc.view_settings.look="None"
    sc.view_settings.exposure=0.0; sc.view_settings.gamma=1.0
    sc.render.threads_mode="FIXED"; sc.render.threads=4
    return sc

def setup_engine(sc,engine):
    if engine=="EEVEE":
        ids={x.identifier for x in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items}
        sc.render.engine="BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in ids else "BLENDER_EEVEE"
        if hasattr(sc,"eevee") and hasattr(sc.eevee,"taa_render_samples"):
            sc.eevee.taa_render_samples=8
    else:
        sc.render.engine="CYCLES"; sc.cycles.device="CPU"
        sc.cycles.samples=8; sc.cycles.use_denoising=True

def render_one(sc,variant,engine,outdir):
    setup_engine(sc,engine)
    path=os.path.join(outdir,variant+"_"+engine.lower()+".png")
    sc.render.filepath=path
    bpy.ops.render.render(write_still=True)
    if not os.path.isfile(path) or os.path.getsize(path)<1000:
        raise RuntimeError("Render output missing or too small: "+path)
    print("RENDER_OK",variant,engine,os.path.getsize(path),flush=True)
    return path

def build_pmx(pmx_path,tuned):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    M=parse_pmx(pmx_path); pmx_dir=os.path.dirname(pmx_path)
    tris=[]; poly_mats=[]; off=0; skipped_add=0
    for mi,ma in enumerate(M["materials"]):
        end=off+ma["surface_count"]
        for i in range(off,end,3):
            if ma["sphere_mode"]==2:
                skipped_add+=1; continue
            f=tuple(M["faces"][i:i+3])
            if len(f)==3 and len(set(f))==3 and min(f)>=0 and max(f)<len(M["verts"]):
                tris.append(f); poly_mats.append(mi)
        off=end
    if off!=len(M["faces"]): raise RuntimeError("PMX material index count mismatch")
    me=bpy.data.meshes.new("AriaIdol_PMX_Mesh")
    me.from_pydata(M["verts"],[],tris); me.update()
    uv=me.uv_layers.new(name="UVMap")
    for poly in me.polygons:
        poly.use_smooth=True
        for li in poly.loop_indices:
            vi=me.loops[li].vertex_index
            uv.data[li].uv=(M["uvs"][vi][0],1.0-M["uvs"][vi][1])
    for mi,ma in enumerate(M["materials"]):
        ti=ma["tex"]; dpath=None
        if 0<=ti<len(M["textures"]):
            rel=M["textures"][ti].replace("\\","/")
            dpath=os.path.normpath(os.path.join(pmx_dir,rel))
        nm=ma["name"]; rough=.52; metal=0.0; family="body"
        if tuned:
            if "髮" in nm or "发" in nm: rough=.28; family="hair"
            elif nm in ("颜","颜2","肌","肌2"): rough=.60; family="skin"
            elif nm in ("目","白目","目光","目影"): rough=.20; family="eyes"
            elif "裙" in nm or "带" in nm: rough=.42; family="cloth"
            else: rough=.48
        alpha=ma["diffuse"][3]
        me.materials.append(make_pbr("PMX_"+(nm or str(mi)),dpath,rough=rough,metal=metal,family=family,alpha=alpha))
    for pi,poly in enumerate(me.polygons): poly.material_index=poly_mats[pi]
    try:
        if hasattr(me,"normals_split_custom_set_from_vertices"):
            me.normals_split_custom_set_from_vertices(M["normals"])
            print("PMX_NORMALS preserved",len(M["normals"]),flush=True)
        else: print("PMX_NORMALS API unavailable; Blender recalculates",flush=True)
    except Exception as e: print("PMX_NORMALS fallback",repr(e),flush=True)
    ob=bpy.data.objects.new("AriaIdol_PMX",me); bpy.context.scene.collection.objects.link(ob)
    ob.rotation_euler=(math.radians(90),0,math.radians(180))
    scale=normalize_object(ob)
    print("PMX_GEOMETRY",len(me.vertices),len(me.polygons),"additive overlay index count skipped",skipped_add,"scale",scale,flush=True)
    return setup_scene()

def build_glb(glb_path,contract_path,textures_dir,tuned):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)
    for name in ("Cube","Icosphere","Camera","Light"):
        o=bpy.data.objects.get(name)
        if o: bpy.data.objects.remove(o,do_unlink=True)
    sc=bpy.context.scene
    meshes=[o for o in sc.objects if o.type=="MESH"]
    root=bpy.data.objects.get("Avatar_Female_Size01_AriaIdol_Model")
    if root: scale=normalize_glb(root,meshes)
    else: scale=None
    print("GLB_GEOMETRY",len(meshes),sum(len(o.data.vertices) for o in meshes),
          sum(len(o.data.polygons) for o in meshes),"scale",scale,flush=True)
    if tuned:
        contract=json.load(open(contract_path,encoding="utf-8"))
        bymat={}
        for s in contract["surfaces"]: bymat.setdefault(s["materialName"],s)
        replacements={}
        for old in list(bpy.data.materials):
            surf=bymat.get(old.name)
            if not surf: continue
            maps=surf.get("maps",{}); did=maps.get("_MainTex"); nid=maps.get("_LightTex")
            dpath=os.path.join(textures_dir,did+".png") if did else None
            family=surf.get("family","body")
            # _LightTex is an RG normal map on body/hair, but an SDF face-lighting map on face/eyes.
            npath=os.path.join(textures_dir,nid+".png") if nid and family in ("body","hair") else None
            low=old.name.lower(); rough=.48; metal=0.0; mat_family="body"
            if "weapon" in low: rough=.30; metal=.22; mat_family="metal"
            elif "skirt" in low: rough=.46; mat_family="cloth"
            elif family=="eyes": rough=.20; mat_family="eyes"
            elif family=="face-sdf": rough=.58; mat_family="skin"
            elif family=="hair": rough=.29; mat_family="hair"
            if (dpath and os.path.isfile(dpath)) or (npath and os.path.isfile(npath)):
                new=make_pbr("Native_"+old.name,dpath,npath,rough,metal,mat_family)
                replacements[old]=new
                print("GLB_MATERIAL",old.name,"family",mat_family,"D",bool(dpath and os.path.isfile(dpath)),
                      "N",bool(npath and os.path.isfile(npath)),"rough",rough,"metal",metal,flush=True)
        for o in meshes:
            for i,m in enumerate(o.data.materials):
                if m in replacements: o.data.materials[i]=replacements[m]
    return setup_scene()

def main():
    a=args_after_dashes(); os.makedirs(a.out,exist_ok=True)
    variants=[
        ("pmx_base",lambda:build_pmx(a.pmx,False)),
        ("pmx_tuned",lambda:build_pmx(a.pmx,True)),
        ("glb_imported",lambda:build_glb(a.glb,a.contract,a.textures,False)),
        ("glb_native_dn",lambda:build_glb(a.glb,a.contract,a.textures,True)),
    ]
    results=[]
    for name,builder in variants:
        for engine in ("EEVEE","CYCLES"):
            print("BEGIN",name,engine,flush=True)
            sc=builder()
            path=render_one(sc,name,engine,a.out)
            results.append({"variant":name,"engine":engine,"path":path,"bytes":os.path.getsize(path)})
            if engine=="EEVEE" and name in ("pmx_tuned","glb_native_dn"):
                blend=os.path.join(os.path.dirname(a.out),name+".blend")
                bpy.ops.file.pack_all()
                bpy.ops.wm.save_as_mainfile(filepath=blend)
                print("BLEND_SAVED",blend,flush=True)
    with open(os.path.join(os.path.dirname(a.out),"results.json"),"w") as f:
        json.dump(results,f,indent=2)
    print("ALL_RESULTS",json.dumps(results),flush=True)

if __name__=="__main__":
    main()
