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
    p.add_argument("--width", type=int, default=1024)
    p.add_argument("--height", type=int, default=1536)
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
        tex=nt.nodes.new("ShaderNodeTexImage"); tex.image=im; tex.location=(-900,-260)
        nt.links.new(uv.outputs["UV"],tex.inputs["Vector"])
        # Contract says _LightTex stores only RG. Reconstruct Z before the tangent-space Normal Map node.
        sep=nt.nodes.new("ShaderNodeSeparateColor"); sep.location=(-680,-260)
        nt.links.new(tex.outputs["Color"],sep.inputs["Color"])
        def mathn(op,a,b=None,x=-460,y=-260):
            n=nt.nodes.new("ShaderNodeMath"); n.operation=op; n.location=(x,y)
            if hasattr(a,"node"): nt.links.new(a,n.inputs[0])
            else: n.inputs[0].default_value=float(a)
            if b is not None:
                if hasattr(b,"node"): nt.links.new(b,n.inputs[1])
                else: n.inputs[1].default_value=float(b)
            return n.outputs[0]
        rx=mathn("MULTIPLY",sep.outputs["Red"],2.0,-460,-180)
        gx=mathn("MULTIPLY",sep.outputs["Green"],2.0,-460,-340)
        nx=mathn("SUBTRACT",rx,1.0,-260,-180)
        ny=mathn("SUBTRACT",gx,1.0,-260,-340)
        nx2=mathn("MULTIPLY",nx,nx,-60,-180)
        ny2=mathn("MULTIPLY",ny,ny,-60,-340)
        xy2=mathn("ADD",nx2,ny2,140,-240)
        z2=mathn("SUBTRACT",1.0,xy2,320,-240)
        z2c=mathn("MAXIMUM",z2,0.0,500,-240)
        nz=mathn("SQRT",z2c, None,680,-240)
        def enc01(v,x,y):
            half=mathn("MULTIPLY",v,0.5,x,y)
            return mathn("ADD",half,0.5,x+180,y)
        comb=nt.nodes.new("ShaderNodeCombineColor"); comb.location=(1120,-240); comb.mode="RGB"
        nt.links.new(enc01(nx,700,-80),comb.inputs["Red"])
        nt.links.new(enc01(ny,700,-240),comb.inputs["Green"])
        nt.links.new(enc01(nz,700,-400),comb.inputs["Blue"])
        nm=nt.nodes.new("ShaderNodeNormalMap"); nm.location=(1340,-220)
        nm.inputs["Strength"].default_value=1.0
        if hasattr(nm,"uv_map"): nm.uv_map="UVMap"
        nt.links.new(comb.outputs["Color"],nm.inputs["Color"])
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

def setup_scene(width=1024,height=1536):
    sc=bpy.context.scene
    # Website evidence: two DirectionalLights + AmbientLight + HemisphereLight,
    # no environment map. Exact primary direction is from the measured UI defaults.
    # Secondary direction/intensity are not exposed by the source report, so this
    # low-energy fill is explicitly a Blender approximation, not a recovered value.
    world=bpy.data.worlds.new("Aria_Web_Hemisphere_Approx"); sc.world=world; world.use_nodes=True
    nt=world.node_tree; nt.nodes.clear()
    out=nt.nodes.new("ShaderNodeOutputWorld")
    bg=nt.nodes.new("ShaderNodeBackground")
    geo=nt.nodes.new("ShaderNodeNewGeometry")
    sep=nt.nodes.new("ShaderNodeSeparateXYZ")
    scale=nt.nodes.new("ShaderNodeMath"); scale.operation="MULTIPLY_ADD"
    scale.inputs[1].default_value=0.5; scale.inputs[2].default_value=0.5
    ramp=nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements.remove(ramp.color_ramp.elements[1])
    ground=ramp.color_ramp.elements[0]; ground.position=0.0
    ground.color=(0.18,0.16,0.19,1)
    sky=ramp.color_ramp.elements.new(1.0); sky.color=(0.48,0.56,0.70,1)
    mid=ramp.color_ramp.elements.new(0.5); mid.color=(0.31,0.34,0.41,1)
    nt.links.new(geo.outputs["Incoming"],sep.inputs["Vector"])
    nt.links.new(sep.outputs["Z"],scale.inputs[0])
    nt.links.new(scale.outputs[0],ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"],bg.inputs["Color"])
    bg.inputs["Strength"].default_value=0.38
    nt.links.new(bg.outputs["Background"],out.inputs["Surface"])

    target=Vector((0,0,0.88))
    def sun(name,azimuth_deg,elevation_deg,energy,color,angular_diameter_deg):
        az=math.radians(azimuth_deg); el=math.radians(elevation_deg)
        direction=Vector((math.sin(az)*math.cos(el),
                          -math.cos(az)*math.cos(el),
                          math.sin(el)))
        data=bpy.data.lights.new(name,"SUN")
        data.energy=energy; data.color=color
        data.angle=math.radians(angular_diameter_deg)
        obj=bpy.data.objects.new(name,data); sc.collection.objects.link(obj)
        obj.location=target+direction*4.0
        obj.rotation_euler=(target-obj.location).to_track_quat("-Z","Y").to_euler()
        return obj
    sun("Key_Directional_Measured_38.7_47.6",38.7,47.6,2.0,(1.0,0.96,0.92),0.8)
    sun("Fill_Directional_Approx_Secondary",218.7,22.0,0.32,(0.78,0.84,1.0),1.8)

    bpy.ops.mesh.primitive_plane_add(size=12,location=(0,0,-0.015))
    floor=bpy.context.object; floor.name="Neutral_Ground"
    fm=bpy.data.materials.new("Neutral_Ground_Mat"); fm.use_nodes=True
    fp=fm.node_tree.nodes.get("Principled BSDF")
    set_input(fp,"Base Color",(0.045,0.052,0.066,1)); set_input(fp,"Roughness",0.88)
    floor.data.materials.append(fm)
    cd=bpy.data.cameras.new("Ablation_Camera"); cd.lens=80
    cam=bpy.data.objects.new("Ablation_Camera",cd); sc.collection.objects.link(cam)
    cam.location=(0.03,-4.6,0.91)
    cam.rotation_euler=(Vector((0,0,0.88))-cam.location).to_track_quat("-Z","Y").to_euler()
    sc.camera=cam
    sc.render.resolution_x=width; sc.render.resolution_y=height; sc.render.resolution_percentage=100
    sc.render.image_settings.file_format="PNG"; sc.render.image_settings.color_mode="RGBA"
    sc.render.image_settings.compression=10; sc.render.film_transparent=False
    sc.view_settings.view_transform="Standard"; sc.view_settings.look="None"
    # Website's measured default exposure is 0.9. Blender exposure is an approximation
    # of that display control; it is not claimed to be a numerically identical engine value.
    sc.view_settings.exposure=0.9; sc.view_settings.gamma=1.0
    sc.render.threads_mode="FIXED"; sc.render.threads=4
    sc["lighting_reference"]="ZZZ Studio measured: 2 directional + ambient + hemisphere; no envMap"
    sc["primary_light_azimuth_deg"]=38.7
    sc["primary_light_elevation_deg"]=47.6
    sc["secondary_light"]="provisional low-energy fill; exact source vector/intensity unavailable"
    sc["website_exposure_default"]=0.9
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

def build_pmx(pmx_path,tuned,width,height):
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
    return setup_scene(width,height)

GLB_DIAGNOSTICS=[]

def _json_value(v):
    try:
        if hasattr(v,"__len__") and not isinstance(v,(str,bytes)):
            return [float(x) for x in v]
        return float(v)
    except Exception:
        return str(v)

def snapshot_glb(label, meshes):
    mats={}
    objects=[]
    for obj in meshes:
        slot_names=[m.name if m else None for m in obj.data.materials]
        poly_counts={}
        for poly in obj.data.polygons:
            idx=poly.material_index
            key=slot_names[idx] if idx<len(slot_names) else "INVALID_SLOT_"+str(idx)
            poly_counts[key]=poly_counts.get(key,0)+1
        uv_info=[]
        for layer in obj.data.uv_layers:
            vals=[tuple(float(v) for v in item.uv) for item in layer.data]
            uv_info.append({
                "name":layer.name,"loops":len(vals),
                "min":[min(v[i] for v in vals) for i in range(2)] if vals else None,
                "max":[max(v[i] for v in vals) for i in range(2)] if vals else None
            })
        color_attrs=[{"name":a.name,"domain":a.domain,"data_type":a.data_type,"count":len(a.data)}
                     for a in getattr(obj.data,"color_attributes",[])]
        objects.append({
            "name":obj.name,"vertices":len(obj.data.vertices),"polygons":len(obj.data.polygons),
            "materials":slot_names,"polygon_material_counts":poly_counts,
            "uv_layers":uv_info,"color_attributes":color_attrs,
            "world_location":_json_value(obj.matrix_world.translation)
        })
        for mat in obj.data.materials:
            if not mat or mat.name in mats: continue
            item={
                "name":mat.name,"diffuse_color":_json_value(mat.diffuse_color),
                "use_nodes":mat.use_nodes,
                "use_backface_culling":getattr(mat,"use_backface_culling",None),
                "surface_render_method":str(getattr(mat,"surface_render_method",None)),
                "blend_method":str(getattr(mat,"blend_method",None)),
                "nodes":[],"links":[]
            }
            if mat.use_nodes:
                nt=mat.node_tree
                for node in nt.nodes:
                    nd={"name":node.name,"type":node.type,"bl_idname":node.bl_idname}
                    if node.type=="TEX_IMAGE":
                        im=node.image
                        nd["image"]=None if im is None else {
                            "name":im.name,"filepath":im.filepath,"size":list(im.size),
                            "channels":im.channels,"colorspace":im.colorspace_settings.name,
                            "alpha_mode":str(im.alpha_mode),"has_data":im.has_data
                        }
                        vec=node.inputs.get("Vector")
                        if vec is not None:
                            nd["vector"]={"linked":vec.is_linked,
                                "from":[l.from_node.name+":"+l.from_socket.name for l in vec.links]}
                    if node.type=="BSDF_PRINCIPLED":
                        nd["inputs"]={}
                        for socket_name in ("Base Color","Alpha","Roughness","Metallic","Normal"):
                            sock=node.inputs.get(socket_name)
                            if sock is not None:
                                nd["inputs"][socket_name]={
                                    "default":_json_value(sock.default_value),
                                    "linked":bool(sock.is_linked),
                                    "from":[l.from_node.name+":"+l.from_socket.name for l in sock.links]
                                }
                    elif node.type in ("MIX","MATH","ATTRIBUTE"):
                        nd["properties"]={
                            "data_type":str(getattr(node,"data_type",None)),
                            "blend_type":str(getattr(node,"blend_type",None)),
                            "operation":str(getattr(node,"operation",None)),
                            "attribute_name":str(getattr(node,"attribute_name",None))
                        }
                        nd["inputs"]=[]
                        for sock in node.inputs:
                            try: default=_json_value(sock.default_value)
                            except Exception: default=None
                            nd["inputs"].append({
                                "name":sock.name,"identifier":sock.identifier,"default":default,
                                "linked":bool(sock.is_linked),
                                "from":[l.from_node.name+":"+l.from_socket.name for l in sock.links]
                            })
                    item["nodes"].append(nd)
                for link in nt.links:
                    item["links"].append({
                        "from":link.from_node.name+":"+link.from_socket.name,
                        "to":link.to_node.name+":"+link.to_socket.name
                    })
            mats[mat.name]=item
    snap={"label":label,"object_count":len(objects),"material_count":len(mats),
          "objects":objects,"materials":list(mats.values())}
    GLB_DIAGNOSTICS.append(snap)
    print("GLB_IMPORT_DIAGNOSTICS_"+label.upper(),json.dumps(snap,ensure_ascii=False),flush=True)
    return snap

def build_glb(glb_path,contract_path,textures_dir,mode,width,height):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb_path)
    for name in ("Cube","Icosphere","Camera","Light"):
        o=bpy.data.objects.get(name)
        if o: bpy.data.objects.remove(o,do_unlink=True)
    sc=bpy.context.scene
    meshes=[o for o in sc.objects if o.type=="MESH"]
    if mode=="raw":
        snapshot_glb("raw_glb_import",meshes)
    # Character-only comparison: the PMX input is 爱芮.pmx (not 武器.pmx),
    # so remove GLB weapon / FX / stencil-shadow meshes before measuring bounds.
    excluded=[]
    for o in list(meshes):
        if "Weapon" in o.name or o.name.startswith("AriaIdol_FX_") or "HairShadow" in o.name:
            excluded.append(o.name)
            bpy.data.objects.remove(o,do_unlink=True)
    meshes=[o for o in sc.objects if o.type=="MESH"]
    print("GLB_EXCLUDED_NONCHARACTER_MESHES",json.dumps(excluded,ensure_ascii=False),flush=True)
    root=bpy.data.objects.get("Avatar_Female_Size01_AriaIdol_Model")
    if root: scale=normalize_glb(root,meshes)
    else: scale=None
    print("GLB_GEOMETRY",len(meshes),sum(len(o.data.vertices) for o in meshes),
          sum(len(o.data.polygons) for o in meshes),"scale",scale,flush=True)

    contract=json.load(open(contract_path,encoding="utf-8"))
    bymat={}
    for surf in contract["surfaces"]:
        bymat.setdefault(surf["materialName"],surf)

    if mode=="uvfix":
        # The imported GLB has valid UVMap layers, but its Image Texture Vector
        # sockets are unlinked. Blender therefore falls back to Generated coords.
        # Reconnect the exported D textures to UV0, then apply the contract's
        # per-material render state instead of blanket BLENDED / Cull-Off.
        for mat in bpy.data.materials:
            surf=bymat.get(mat.name)
            if not surf or not mat.use_nodes: continue
            texcoord=None
            for node in mat.node_tree.nodes:
                if node.type=="TEX_IMAGE":
                    vector=node.inputs.get("Vector")
                    if vector is not None and not vector.is_linked:
                        if texcoord is None:
                            texcoord=mat.node_tree.nodes.new("ShaderNodeTexCoord")
                            texcoord.name="Contract_UV0"
                            texcoord.label="Contract UV0"
                        mat.node_tree.links.new(texcoord.outputs["UV"],vector)
            state=surf.get("capabilities",{}).get("sourceState",{})
            cull=state.get("Cull")
            if cull==0: mat.use_backface_culling=False
            elif cull==2: mat.use_backface_culling=True
            queue=state.get("queue")
            try:
                if queue=="opaque": mat.surface_render_method="DITHERED"
                elif queue=="blended": mat.surface_render_method="BLENDED"
            except Exception: pass
            family=surf.get("family","body")
            low=mat.name.lower()
            rough=.48
            if "skirt" in low: rough=.46
            elif family=="hair": rough=.29
            elif family=="face-sdf": rough=.58
            elif family=="eyes": rough=.20
            for node in mat.node_tree.nodes:
                if node.type!="BSDF_PRINCIPLED": continue
                metal=node.inputs.get("Metallic")
                rough_socket=node.inputs.get("Roughness")
                alpha=node.inputs.get("Alpha")
                # GLB metallicFactor=1 and roughnessFactor=0.5527864 are exporter
                # fallback values; source M map carries the actual metal/spec masks.
                if metal is not None: metal.default_value=0.0
                if rough_socket is not None: rough_socket.default_value=rough
                if queue=="opaque" and alpha is not None:
                    for link in list(alpha.links): mat.node_tree.links.remove(link)
                    alpha.default_value=1.0
            print("GLB_UV_STATE_FIX",mat.name,"queue",queue,"Cull",cull,
                  "UV0_relinked",bool(texcoord),"metallic_fallback=0",flush=True)
        snapshot_glb("uv0_and_contract_state_repaired",meshes)

    if mode=="native":
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
        snapshot_glb("native_dn_after_replacement",meshes)
    return setup_scene(width,height)


def main():
    a=args_after_dashes(); os.makedirs(a.out,exist_ok=True)
    variants=[
        ("pmx_base",lambda:build_pmx(a.pmx,False,a.width,a.height)),
        ("pmx_tuned",lambda:build_pmx(a.pmx,True,a.width,a.height)),
        ("glb_imported",lambda:build_glb(a.glb,a.contract,a.textures,"raw",a.width,a.height)),
        ("glb_uvfix",lambda:build_glb(a.glb,a.contract,a.textures,"uvfix",a.width,a.height)),
        ("glb_native_dn",lambda:build_glb(a.glb,a.contract,a.textures,"native",a.width,a.height)),
    ]
    results=[]
    for name,builder in variants:
        for engine in ("EEVEE","CYCLES"):
            print("BEGIN",name,engine,flush=True)
            sc=builder()
            path=render_one(sc,name,engine,a.out)
            results.append({"variant":name,"engine":engine,"path":path,"bytes":os.path.getsize(path)})
            if engine=="EEVEE" and name in ("pmx_tuned","glb_uvfix","glb_native_dn"):
                blend=os.path.join(os.path.dirname(a.out),name+".blend")
                bpy.ops.file.pack_all()
                bpy.ops.wm.save_as_mainfile(filepath=blend)
                print("BLEND_SAVED",blend,flush=True)
    with open(os.path.join(a.out,"glb_import_diagnostics.json"),"w",encoding="utf-8") as f:
        json.dump(GLB_DIAGNOSTICS,f,ensure_ascii=False,indent=2)
    with open(os.path.join(os.path.dirname(a.out),"results.json"),"w") as f:
        json.dump(results,f,indent=2)
    print("RENDER_RESOLUTION",a.width,a.height,flush=True)
    print("ALL_RESULTS",json.dumps(results),flush=True)

if __name__=="__main__":
    main()
