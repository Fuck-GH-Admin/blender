#!/usr/bin/env python3
import bpy, argparse, json, os
from array import array

def args_after_dashes():
    argv=sys.argv
    tail=argv[argv.index("--")+1:] if "--" in argv else []
    p=argparse.ArgumentParser()
    p.add_argument("--glb",required=True)
    p.add_argument("--contract",required=True)
    p.add_argument("--textures",required=True)
    p.add_argument("--out",required=True)
    return p.parse_args(tail)

def jv(v):
    try:
        if hasattr(v,"__len__") and not isinstance(v,(str,bytes)):
            return [float(x) for x in v]
        return float(v)
    except Exception:
        return str(v)

def image_stats(im, cache):
    if im.name in cache: return cache[im.name]
    item={"name":im.name,"filepath":im.filepath,"size":list(im.size),
          "channels":im.channels,"colorspace":im.colorspace_settings.name,
          "alpha_mode":str(im.alpha_mode),"has_data":im.has_data}
    if im.has_data and im.size[0]>0 and im.size[1]>0 and im.channels>0:
        npx=im.size[0]*im.size[1]; ch=im.channels
        buf=array("f",[0.0])*(npx*ch)
        im.pixels.foreach_get(buf)
        step=max(1,npx//2048); sums=[0.0]*min(4,ch)
        mins=[1e9]*len(sums); maxs=[-1e9]*len(sums); seen=0
        for pix in range(0,npx,step):
            base=pix*ch
            for ci in range(len(sums)):
                v=buf[base+ci]; sums[ci]+=v
                mins[ci]=min(mins[ci],v); maxs[ci]=max(maxs[ci],v)
            seen+=1
        item["pixel_sample"]={"samples":seen,"mean":[v/seen for v in sums],
                              "min":mins,"max":maxs}
    cache[im.name]=item
    return item

def main():
    import sys
    a=args_after_dashes()
    os.makedirs(os.path.dirname(a.out) or ".",exist_ok=True)
    contract=json.load(open(a.contract,encoding="utf-8"))
    surfaces={}
    for s in contract.get("surfaces",[]):
        surfaces.setdefault(s.get("materialName"),s)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=a.glb)
    images={}
    external_d={}
    for surf in contract.get("surfaces",[]):
        did=surf.get("maps",{}).get("_MainTex")
        path=os.path.join(a.textures,did+".png") if did else None
        if did and path and os.path.isfile(path) and did not in external_d:
            im=bpy.data.images.load(path,check_existing=True)
            external_d[did]=image_stats(im,images)
    objects=[]
    for obj in bpy.context.scene.objects:
        if obj.type!="MESH": continue
        uvs=[]
        for uv in obj.data.uv_layers:
            vals=[tuple(float(v) for v in item.uv) for item in uv.data]
            uvs.append({"name":uv.name,"loops":len(vals),
                        "min":[min(v[i] for v in vals) for i in range(2)] if vals else None,
                        "max":[max(v[i] for v in vals) for i in range(2)] if vals else None})
        attrs=[]
        for attr in getattr(obj.data,"color_attributes",[]):
            count=len(attr.data); vals=[]
            if count:
                step=max(1,count//256)
                for ix in range(0,count,step):
                    try: vals.append([float(x) for x in attr.data[ix].color])
                    except Exception: pass
            attrs.append({"name":attr.name,"domain":attr.domain,"data_type":attr.data_type,
                          "count":count,
                          "sample_mean":[sum(v[i] for v in vals)/len(vals) for i in range(4)] if vals else None,
                          "sample_min":[min(v[i] for v in vals) for i in range(4)] if vals else None,
                          "sample_max":[max(v[i] for v in vals) for i in range(4)] if vals else None})
        objects.append({"name":obj.name,"vertices":len(obj.data.vertices),
                        "polygons":len(obj.data.polygons),
                        "material_slots":[m.name if m else None for m in obj.data.materials],
                        "uv_layers":uvs,"active_uv":obj.data.uv_layers.active.name if obj.data.uv_layers.active else None,
                        "active_render_uv":obj.data.uv_layers.active_render.name if obj.data.uv_layers.active_render else None,
                        "color_attributes":attrs})
    materials=[]
    for mat in bpy.data.materials:
        if not mat.use_nodes: continue
        surf=surfaces.get(mat.name,{})
        state=surf.get("capabilities",{}).get("sourceState",{})
        entry={"name":mat.name,"diffuse_color":jv(mat.diffuse_color),
               "contract_family":surf.get("family"),"contract_maps":surf.get("maps"),
               "contract_source_state":state,
               "use_backface_culling":getattr(mat,"use_backface_culling",None),
               "surface_render_method":str(getattr(mat,"surface_render_method",None)),
               "nodes":[],"links":[]}
        for node in mat.node_tree.nodes:
            n={"name":node.name,"type":node.type,"bl_idname":node.bl_idname}
            if node.type=="TEX_IMAGE":
                n["image"]=image_stats(node.image,images) if node.image else None
                vec=node.inputs.get("Vector")
                n["vector"]={"linked":vec.is_linked,"from":[x.from_node.name+":"+x.from_socket.name for x in vec.links]} if vec else None
                n["projection"]=str(getattr(node,"projection",None))
                n["extension"]=str(getattr(node,"extension",None))
                n["interpolation"]=str(getattr(node,"interpolation",None))
            if node.type=="BSDF_PRINCIPLED":
                n["inputs"]={}
                for name in ("Base Color","Alpha","Roughness","Metallic","Normal"):
                    sock=node.inputs.get(name)
                    if sock:
                        n["inputs"][name]={"default":jv(sock.default_value),"linked":sock.is_linked,
                            "from":[x.from_node.name+":"+x.from_socket.name for x in sock.links]}
            if node.type in ("MIX","MATH","ATTRIBUTE"):
                n["properties"]={"data_type":str(getattr(node,"data_type",None)),
                    "blend_type":str(getattr(node,"blend_type",None)),
                    "operation":str(getattr(node,"operation",None)),
                    "attribute_name":str(getattr(node,"attribute_name",None))}
                n["inputs"]=[]
                for sock in node.inputs:
                    try: default=jv(sock.default_value)
                    except Exception: default=None
                    n["inputs"].append({"name":sock.name,"identifier":sock.identifier,
                        "default":default,"linked":sock.is_linked,
                        "from":[x.from_node.name+":"+x.from_socket.name for x in sock.links]})
            entry["nodes"].append(n)
        for link in mat.node_tree.links:
            entry["links"].append({"from":link.from_node.name+":"+link.from_socket.name,
                                   "to":link.to_node.name+":"+link.to_socket.name})
        materials.append(entry)
    result={"glb":os.path.basename(a.glb),"contract_schema":contract.get("schema"),
            "object_count":len(objects),"material_count":len(materials),
            "external_d_images":external_d,"objects":objects,"materials":materials}
    with open(a.out,"w",encoding="utf-8") as f: json.dump(result,f,ensure_ascii=False,indent=2)
    print("GLB_DIAGNOSTIC_SUMMARY",json.dumps({
        "objects":len(objects),"materials":len(materials),"uv_status":[{"name":o["name"],"uv":o["uv_layers"],"active_uv":o["active_uv"],"active_render_uv":o["active_render_uv"]} for o in objects],
        "image_stats":[x for x in images.values()],"external_d_images":external_d,
        "material_states":[{"name":m["name"],"family":m["contract_family"],
            "source_state":m["contract_source_state"],
            "surface_render_method":m["surface_render_method"],
            "mix":[n for n in m["nodes"] if n["type"]=="MIX"],
            "bsdf":[n.get("inputs") for n in m["nodes"] if n["type"]=="BSDF_PRINCIPLED"]}
            for m in materials]
    },ensure_ascii=False),flush=True)
    print("DIAGNOSTICS_WRITTEN",a.out,flush=True)

if __name__=="__main__":
    import sys
    main()
