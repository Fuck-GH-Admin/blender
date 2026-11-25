#!/usr/bin/env python3
"""Build a first real-model EEVEE toon preview from the recovered AriaIdol contract."""
import argparse, json, os, sys
import bpy
import aria_blender_ablation as base

def parse_args():
    tail=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
    p=argparse.ArgumentParser()
    p.add_argument("--glb",required=True)
    p.add_argument("--contract",required=True)
    p.add_argument("--textures",required=True)
    p.add_argument("--outdir",required=True)
    p.add_argument("--width",type=int,default=1024)
    p.add_argument("--height",type=int,default=1536)
    return p.parse_args(tail)

def image_node(nt,uv,path,colorspace,label,x,y):
    if not path or not os.path.isfile(path): return None
    im=bpy.data.images.load(path,check_existing=True)
    try: im.colorspace_settings.name=colorspace
    except Exception: pass
    n=nt.nodes.new("ShaderNodeTexImage")
    n.image=im; n.label=label; n.location=(x,y)
    nt.links.new(uv.outputs["UV"],n.inputs["Vector"])
    return n

def ramp5(nt,source,colors,label,x,y):
    colors=list(colors or [])
    if not colors: colors=[(1,1,1)]*5
    while len(colors)<5: colors.append(colors[-1])
    n=nt.nodes.new("ShaderNodeValToRGB"); n.location=(x,y); n.label=label
    cr=n.color_ramp; cr.interpolation="CONSTANT"
    while len(cr.elements)<5: cr.elements.new(0.5)
    elems=list(cr.elements)
    positions=[0.0,0.2,0.4,0.6,0.8]
    order=[4,3,2,1,0]
    for e,pos,idx in zip(elems,positions,order):
        c=colors[idx]
        e.position=pos; e.color=(float(c[0]),float(c[1]),float(c[2]),1.0)
    nt.links.new(source,n.inputs["Fac"])
    return n.outputs["Color"]

def mix_rgb(nt,fac,c1,c2,blend,label,x,y):
    n=nt.nodes.new("ShaderNodeMixRGB")
    n.blend_type=blend; n.label=label; n.location=(x,y)
    if isinstance(fac,(int,float)): n.inputs["Fac"].default_value=float(fac)
    else: nt.links.new(fac,n.inputs["Fac"])
    if isinstance(c1,(tuple,list)): n.inputs["Color1"].default_value=tuple(c1[:3])+(1.0,)
    else: nt.links.new(c1,n.inputs["Color1"])
    if isinstance(c2,(tuple,list)): n.inputs["Color2"].default_value=tuple(c2[:3])+(1.0,)
    else: nt.links.new(c2,n.inputs["Color2"])
    return n.outputs["Color"]

def math_out(nt,op,a,b,label,x,y):
    n=nt.nodes.new("ShaderNodeMath"); n.operation=op; n.label=label; n.location=(x,y)
    if isinstance(a,(int,float)): n.inputs[0].default_value=float(a)
    else: nt.links.new(a,n.inputs[0])
    if isinstance(b,(int,float)): n.inputs[1].default_value=float(b)
    else: nt.links.new(b,n.inputs[1])
    return n.outputs[0]

def set_contract_state(mat,surf):
    state=surf.get("capabilities",{}).get("sourceState",{})
    cull=state.get("Cull")
    if cull==0: mat.use_backface_culling=False
    elif cull==2: mat.use_backface_culling=True
    queue=state.get("queue")
    try:
        if queue=="opaque": mat.surface_render_method="DITHERED"
        elif queue=="blended": mat.surface_render_method="BLENDED"
    except Exception: pass
    return state

def texture_path(textures,surf,key):
    h=surf.get("maps",{}).get(key)
    p=os.path.join(textures,h+".png") if h else None
    return p if p and os.path.isfile(p) else None

def make_toon_eevee(surf,textures):
    maps=surf.get("maps",{})
    d=texture_path(textures,surf,"_MainTex")
    m=texture_path(textures,surf,"_OtherDataTex")
    a=texture_path(textures,surf,"_OtherDataTex2")
    n=texture_path(textures,surf,"_LightTex")
    if not d or not m or not surf.get("lighting"):
        return None
    mat=bpy.data.materials.new("Aria_Toon_"+surf.get("runtimeMesh","surface"))
    mat.use_nodes=True; mat.use_backface_culling=False
    nt=mat.node_tree; nt.nodes.clear()
    out=nt.nodes.new("ShaderNodeOutputMaterial"); out.location=(1600,0)
    emit=nt.nodes.new("ShaderNodeEmission"); emit.location=(1380,0)
    nt.links.new(emit.outputs["Emission"],out.inputs["Surface"])
    uv=nt.nodes.new("ShaderNodeTexCoord"); uv.location=(-1500,0)
    t_d=image_node(nt,uv,d,"sRGB","D · Albedo",-1280,420)
    t_m=image_node(nt,uv,m,"Non-Color","M · Region / Metal / Spec",-1280,120)
    t_a=image_node(nt,uv,a,"Non-Color","A · Emission Mask",-1280,-180) if a else None
    sep_m=nt.nodes.new("ShaderNodeSeparateColor"); sep_m.location=(-1040,120)
    nt.links.new(t_m.outputs["Color"],sep_m.inputs["Color"])
    region=sep_m.outputs["Red"]
    lighting=surf["lighting"]
    shadow=ramp5(nt,region,lighting["shadow"],"5-region shadow",-780,300)
    shallow=ramp5(nt,region,lighting["shallow"],"5-region shallow",-780,40)

    diffuse=nt.nodes.new("ShaderNodeBsdfDiffuse"); diffuse.location=(-1040,-500)
    diffuse.inputs["Color"].default_value=(1,1,1,1)
    if n and surf.get("family") in ("body","hair"):
        t_n=image_node(nt,uv,n,"Non-Color","N · RG normal",-1280,-500)
        sep_n=nt.nodes.new("ShaderNodeSeparateColor"); sep_n.location=(-1040,-760)
        nt.links.new(t_n.outputs["Color"],sep_n.inputs["Color"])
        rx=math_out(nt,"SUBTRACT",math_out(nt,"MULTIPLY",sep_n.outputs["Red"],2,"R*2",-800,-700),1,"R-1",-620,-700)
        gy=math_out(nt,"SUBTRACT",math_out(nt,"MULTIPLY",sep_n.outputs["Green"],2,"G*2",-800,-860),1,"G-1",-620,-860)
        xx=math_out(nt,"MULTIPLY",rx,rx,"X²",-440,-700)
        yy=math_out(nt,"MULTIPLY",gy,gy,"Y²",-440,-860)
        xy=math_out(nt,"ADD",xx,yy,"X²+Y²",-260,-780)
        z2=math_out(nt,"MAXIMUM",math_out(nt,"SUBTRACT",1,xy,"1-XY",-80,-780),0,"Clamp Z²",100,-780)
        nz=math_out(nt,"SQRT",z2,0,"Rebuild Z",280,-780)
        hx=math_out(nt,"ADD",math_out(nt,"MULTIPLY",rx,0.5,"X*.5",100,-620),0.5,"X encode",280,-620)
        hy=math_out(nt,"ADD",math_out(nt,"MULTIPLY",gy,0.5,"Y*.5",100,-940),0.5,"Y encode",280,-940)
        hz=math_out(nt,"ADD",math_out(nt,"MULTIPLY",nz,0.5,"Z*.5",460,-780),0.5,"Z encode",640,-780)
        combine=nt.nodes.new("ShaderNodeCombineColor"); combine.mode="RGB"; combine.location=(840,-780)
        nt.links.new(hx,combine.inputs["Red"]); nt.links.new(hy,combine.inputs["Green"]); nt.links.new(hz,combine.inputs["Blue"])
        normal=nt.nodes.new("ShaderNodeNormalMap"); normal.location=(1060,-760)
        normal.inputs["Strength"].default_value=float(surf.get("baseBinding",{}).get("bumpScale",1.0))
        nt.links.new(combine.outputs["Color"],normal.inputs["Color"])
        nt.links.new(normal.outputs["Normal"],diffuse.inputs["Normal"])
    s2rgb=nt.nodes.new("ShaderNodeShaderToRGB"); s2rgb.location=(-800,-500)
    nt.links.new(diffuse.outputs["BSDF"],s2rgb.inputs["Shader"])
    sep_light=nt.nodes.new("ShaderNodeSeparateColor"); sep_light.location=(-580,-500)
    nt.links.new(s2rgb.outputs["Color"],sep_light.inputs["Color"])
    light=sep_light.outputs["Red"]
    step1=math_out(nt,"GREATER_THAN",light,0.45,"Shadow threshold",-360,-420)
    step2=math_out(nt,"GREATER_THAN",light,0.62,"Lit threshold",-360,-600)
    shade1=mix_rgb(nt,step1,shadow,shallow,"MIX","Shadow → shallow",-100,160)
    shade2=mix_rgb(nt,step2,shade1,(1,1,1),"MIX","Shallow → lit",140,160)
    albedo=mix_rgb(nt,1.0,shade2,t_d.outputs["Color"],"MULTIPLY","× D albedo",380,260)

    final=albedo
    emission=surf.get("emission",{}).get("primary",{})
    if emission.get("enabled") and t_a:
        sep_a=nt.nodes.new("ShaderNodeSeparateColor"); sep_a.location=(120,-180)
        nt.links.new(t_a.outputs["Color"],sep_a.inputs["Color"])
        ecols=emission.get("colors",[])
        if ecols:
            eramp=ramp5(nt,region,ecols,"5-region emission",380,-120)
            final=mix_rgb(nt,sep_a.outputs["Blue"],final,eramp,"ADD","A.B emission",760,220)
    rim=lighting.get("rim",{})
    if rim.get("enabled"):
        lw=nt.nodes.new("ShaderNodeLayerWeight"); lw.location=(380,-420)
        lw.inputs["Blend"].default_value=0.5
        rim_pow=math_out(nt,"POWER",lw.outputs["Facing"],4.0,"Rim facing^4",600,-420)
        rim_fac=math_out(nt,"MULTIPLY",rim_pow,0.35,"Rim strength",800,-420)
        rcolors=rim.get("colors",[])
        if rcolors:
            rramp=ramp5(nt,region,rcolors,"5-region rim",600,-180)
            final=mix_rgb(nt,rim_fac,final,rramp,"ADD","+ rim",1080,180)
    nt.links.new(final,emit.inputs["Color"])
    emit.inputs["Strength"].default_value=1.0
    set_contract_state(mat,surf)
    mat["shader_mode"]="EEVEE ShaderToRGB · 5-region"
    mat["source_runtime_mesh"]=surf.get("runtimeMesh","")
    mat["known_omissions"]="MatCap / wideSpecular / face SDF / stencil shadow"
    return mat

def make_outline(surf,textures):
    outline=surf.get("outline",{})
    if not outline.get("enabled"): 
        m=bpy.data.materials.new("Aria_Outline_Transparent")
        m.use_nodes=True; nt=m.node_tree; nt.nodes.clear()
        out=nt.nodes.new("ShaderNodeOutputMaterial"); tr=nt.nodes.new("ShaderNodeBsdfTransparent")
        nt.links.new(tr.outputs["BSDF"],out.inputs["Surface"])
        try: m.surface_render_method="BLENDED"
        except Exception: pass
        return m
    m=bpy.data.materials.new("Aria_Outline_"+surf.get("runtimeMesh",""))
    m.use_nodes=True; m.use_backface_culling=True
    nt=m.node_tree; nt.nodes.clear()
    out=nt.nodes.new("ShaderNodeOutputMaterial"); emit=nt.nodes.new("ShaderNodeEmission")
    nt.links.new(emit.outputs["Emission"],out.inputs["Surface"])
    mp=texture_path(textures,surf,"_OtherDataTex")
    if mp:
        uv=nt.nodes.new("ShaderNodeTexCoord")
        tex=image_node(nt,uv,mp,"Non-Color","M region",-600,0)
        sep=nt.nodes.new("ShaderNodeSeparateColor"); nt.links.new(tex.outputs["Color"],sep.inputs["Color"])
        color=ramp5(nt,sep.outputs["Red"],outline.get("colours",[]),"Outline region",-300,0)
        nt.links.new(color,emit.inputs["Color"])
    else:
        c=(outline.get("colours") or [[1,0.2167,0.2167,1]])[0]
        emit.inputs["Color"].default_value=(c[0],c[1],c[2],1)
    return m

def find_surface(surfaces,obj_name,mat_name):
    candidates=[s for s in surfaces if s.get("materialName")==mat_name and
                (s.get("runtimeMesh","").startswith(obj_name) or obj_name.startswith(s.get("runtimeMesh","")))]
    if not candidates:
        candidates=[s for s in surfaces if s.get("materialName")==mat_name]
    if not candidates: return None
    return max(candidates,key=lambda s:len(s.get("runtimeMesh","")))

def make_fallback_pbr(surf,textures):
    d=texture_path(textures,surf,"_MainTex")
    n=texture_path(textures,surf,"_LightTex") if surf.get("family") in ("body","hair") else None
    fam=surf.get("family","body")
    rough=.48
    if fam=="face-sdf": rough=.58; fam="skin"
    elif fam=="eyes": rough=.20
    elif fam=="hair": rough=.29
    return base.make_pbr("Aria_PBR_Fallback_"+surf.get("runtimeMesh",""),d,n,rough,0.0,fam)

def main():
    a=parse_args()
    os.makedirs(a.outdir,exist_ok=True)
    contract=json.load(open(a.contract,encoding="utf-8"))
    scene=base.build_glb(a.glb,a.contract,a.textures,"raw",a.width,a.height)
    surfaces=contract.get("surfaces",[])
    report=[]
    for obj in [o for o in scene.objects if o.type=="MESH"]:
        original=list(obj.data.materials)
        outline_mats=[]
        outline_enabled=False
        for idx,old in enumerate(original):
            surf=find_surface(surfaces,obj.name,old.name)
            if not surf:
                report.append({"object":obj.name,"material":old.name,"mode":"unmapped"})
                outline_mats.append(None)
                continue
            if surf.get("lighting") and surf.get("family") in ("body","hair"):
                new=make_toon_eevee(surf,a.textures)
                mode="toon_eevee_5region"
            else:
                new=make_fallback_pbr(surf,a.textures)
                mode="pbr_fallback_face_or_eyes"
            obj.data.materials[idx]=new
            set_contract_state(new,surf)
            ol=make_outline(surf,a.textures) if surf.get("outline") is not None else make_outline({"outline":{"enabled":False}},a.textures)
            outline_mats.append(ol)
            if surf.get("outline",{}).get("enabled"): outline_enabled=True
            report.append({"object":obj.name,"material":old.name,"runtimeMesh":surf.get("runtimeMesh"),
                           "family":surf.get("family"),"mode":mode,
                           "outline":bool(surf.get("outline",{}).get("enabled")),
                           "maps":surf.get("maps",{})})
        if outline_mats and outline_enabled:
            base_count=len(original)
            for ol in outline_mats:
                if ol is None:
                    ol=make_outline({"outline":{"enabled":False}},a.textures)
                obj.data.materials.append(ol)
            mod=obj.modifiers.new("ZZZ_Outline","SOLIDIFY")
            mod.thickness=-0.04; mod.use_flip_normals=True
            mod.material_offset=base_count; mod.material_offset_rim=base_count
            mod.use_rim=False
    scene.render.engine="BLENDER_EEVEE_NEXT"
    if hasattr(scene,"eevee") and hasattr(scene.eevee,"taa_render_samples"):
        scene.eevee.taa_render_samples=16
    scene.render.resolution_x=a.width; scene.render.resolution_y=a.height
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format="PNG"
    scene.view_settings.view_transform="Standard"
    scene.view_settings.look="None"
    scene.view_settings.exposure=0.9
    png=os.path.join(a.outdir,"aria_toon_eevee_5region.png")
    scene.render.filepath=png
    bpy.ops.render.render(write_still=True)
    if not os.path.isfile(png) or os.path.getsize(png)<10000:
        raise RuntimeError("toon preview render missing or too small")
    blend=os.path.join(a.outdir,"aria_toon_eevee_5region.blend")
    bpy.ops.wm.save_as_mainfile(filepath=blend)
    with open(os.path.join(a.outdir,"materials_report.json"),"w",encoding="utf-8") as f:
        json.dump(report,f,ensure_ascii=False,indent=2)
    print("TOON_PREVIEW_OK",png,os.path.getsize(png),flush=True)
    print("TOON_MATERIALS",json.dumps(report,ensure_ascii=False),flush=True)

if __name__=="__main__":
    main()
