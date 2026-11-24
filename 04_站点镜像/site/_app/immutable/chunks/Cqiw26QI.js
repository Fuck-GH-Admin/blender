import{A as e,Dr as t,E as n,Gi as r,On as i,Qa as a,Qi as o,Sn as s,U as c,Wi as l,Wr as u,_r as d,ar as f,b as p,bt as m,do as h,fn as g,ft as _,ha as v,io as y,ir as b,j as ee,ja as x,mr as S,no as C,or as w,pn as T,ro as E,rr as D,sr as te,tr as O,ua as k,wr as ne}from"./Dp-eO7LC.js";import{n as A,t as j}from"./DrZFrn5I.js";import{t as M}from"./CUcmBNyt.js";import{t as re}from"./CWsakxuN.js";function N(e){let t=e=>{throw Error(`E0 contract: ${e}`)};(![1,2,3].includes(e?.version)||e.threeRevision!==`186`)&&t(`unsupported version/revision`);let n=e.version===3;/^[a-f0-9]{64}$/.test(e.model?.sha256)||t(`missing approved GLB SHA-256`),(e.normalConvention?.status!==`unverified`||e.normalConvention?.tbn!==`uv0-derivatives`)&&t(`unsupported normal convention`),(!Array.isArray(e.bindings)||(e.version===1?e.bindings.length!==3:!Number.isInteger(e.expectedBindings)||e.expectedBindings<+!n||e.bindings.length!==e.expectedBindings))&&t(`expected explicit binding count`);let r=new Set,i=new Set;for(let a of e.bindings){(!a.id||r.has(a.id)||!a.runtimeMesh||i.has(a.runtimeMesh))&&t(`ambiguous binding`),r.add(a.id),i.add(a.runtimeMesh),(!Number.isInteger(a.meshIndex)||!Number.isInteger(a.primitiveIndex)||a.meshIndex<0||a.primitiveIndex<0)&&t(`invalid primitive binding`),(![`miHoYo/Character/NapAvatarStandard`,`miHoYo/Character/NapAvatarStandardTransparent`].includes(a.source?.shader)||!/^[a-f0-9]{64}$/.test(a.source?.sha256))&&t(`missing source evidence`),(!Number.isFinite(a.bumpScale)||a.bumpScale<0)&&t(`invalid source normal scale`);for(let r of n?Object.keys(a.maps).filter(e=>a.maps[e]):[`N`,`M`,`A`]){let n=e.resources?.[a.maps?.[r]];(!n||n.kind!==r)&&t(`missing ${r} map: ${a.id}`)}}for(let r of Object.values(e.resources))(!/^[a-f0-9]{64}$/.test(r.sha256)||!(n?[`N`,`M`,`A`,`D`,`F`,`C`,`E`,`X`,`T`]:[`N`,`M`,`A`]).includes(r.kind))&&t(`invalid resource identity`),/^\/__material_renderer\/[A-Za-z0-9_-]+\.png$/.test(r.url)||t(`invalid local resource URL`),(r.flipY!==!1||!(n?[`none`,`srgb`]:[`none`]).includes(r.colorSpace)||r.uv!==0||r.wrap!==`repeat`)&&t(`unsupported texture state`),(!Number.isInteger(r.width)||!Number.isInteger(r.height)||r.width<1||r.height<1)&&t(`invalid dimensions`),[r.scale,r.offset].every(e=>Array.isArray(e)&&e.length===2&&e.every(Number.isFinite))||t(`invalid UV transform`);return e}async function P(e,t){let n=e instanceof Uint8Array?e:new Uint8Array(e),r=await re(n);if(r!==t)throw Error(`E0 SHA-256 mismatch: expected ${t}, received ${r}`);return r}var ie=Object.freeze({"rg++":[1,0,0,1],"rg+-":[1,0,0,-1],"rg-+":[-1,0,0,1],"rg--":[-1,0,0,-1],"gr++":[0,1,1,0],"gr+-":[0,1,-1,0],"gr-+":[0,-1,1,0],"gr--":[0,-1,-1,0]}),ae=/\/__material_renderer\/generated_[a-f0-9]{24}\.(png|bin)$/,F=`zzz-studio-renderer-v1`;async function oe(e,t){if(!t)return null;try{let n=await(await t.open(F)).match(e);return n?await n.arrayBuffer():null}catch{return null}}async function se(e,t,n,r=`application/octet-stream`){if(n)try{let i=await n.open(F),a=(await i.keys()).filter(t=>t.url!==e),o=a.length-199;for(let e=0;e<o;e++)await i.delete(a[e]);await i.put(e,new Response(t,{status:200,headers:{"Content-Type":r,"Content-Length":String(t.byteLength)}}))}catch{}}function I(e,t){if(typeof e!=`string`||!e.startsWith(`/__material_renderer/`)||!ae.test(e))return e;let n=``;if(typeof t==`string`)n=t.trim().replace(/\/+$/,``);else{let e={BASE_URL:`./`,DEV:!1,MODE:`production`,PROD:!0,PUBLIC_ASSETS_BASE_URL:`https://assets.zzz-studio.app`,PUBLIC_SITE_URL:`	https://zzz-studio.app`,SSR:!1},t=e?.PUBLIC_ASSETS_BASE_URL??e?.VITE_PUBLIC_ASSETS_BASE_URL;if(typeof t==`string`&&t.trim())n=t.trim().replace(/\/+$/,``);else{let e={},t=e?.PUBLIC_ASSETS_BASE_URL??e?.VITE_PUBLIC_ASSETS_BASE_URL;typeof t==`string`&&t.trim()&&(n=t.trim().replace(/\/+$/,``))}}return n?`${n}${e}`:e}var L=new class{constructor({fetcher:e=(...e)=>fetch(...e),budget:t=100663296,concurrency:n=4,baseUrl:r,cacheStorage:i}={}){Object.assign(this,{fetcher:e,budget:t,concurrency:n,baseUrl:r,cacheStorage:i}),this.entries=new Map,this.bytes=0,this.active=0,this.waiters=[]}async limited(e){this.active>=this.concurrency?await new Promise(e=>this.waiters.push(e)):this.active++;try{return await e()}finally{let e=this.waiters.shift();e?e():this.active--}}get(e){let t=I(e.url,this.baseUrl),n=JSON.stringify([t,e.sha256]),r=this.entries.get(n);if(r)return this.entries.delete(n),this.entries.set(n,r),r.promise;let i={size:0,promise:null};return this.entries.set(n,i),i.promise=this.limited(async()=>{let r=ae.test(e.url),a=this.cacheStorage===void 0?typeof caches<`u`?caches:null:this.cacheStorage,o=r?await oe(t,a):null;if(o)try{await P(o,e.sha256)}catch{o=null}if(!o){let n=await this.fetcher(t,{cache:r?`default`:`no-store`});if(!n.ok)throw Error(`E0 texture HTTP `+n.status+`: `+e.url);o=await n.arrayBuffer(),await P(o,e.sha256),r&&se(t,o,a,t.endsWith(`.png`)?`image/png`:`application/octet-stream`)}if(this.entries.get(n)===i){i.size=o.byteLength,this.bytes+=i.size;for(let[e,t]of this.entries){if(this.bytes<=this.budget)break;t.size&&(this.bytes-=t.size,this.entries.delete(e))}}return o}).catch(e=>{throw this.entries.get(n)===i&&this.entries.delete(n),e}),i.promise}async preload(e,t=()=>!0){let n=[...e],r=0;await Promise.all(Array.from({length:Math.min(this.concurrency,n.length)},async()=>{for(;t()&&r<n.length;){let e=n[r++];try{await this.get(e)}catch{}}}))}clear(){this.entries.clear(),this.bytes=0}};function R(e,t){return e.flipY=!1,e.colorSpace=t.colorSpace===`srgb`?o:``,e.channel=0,e.wrapS=l,e.wrapT=l,e.repeat.fromArray(t.scale),e.offset.fromArray(t.offset),e.needsUpdate=!0,e}async function z(e){let t=await L.get(e),n=await L.limited(()=>createImageBitmap(new Blob([t],{type:`image/png`}),{imageOrientation:`none`,premultiplyAlpha:`none`,colorSpaceConversion:`none`}));if(n.width!==e.width||n.height!==e.height)throw n.close(),Error(`E0 decoded dimensions mismatch`);let r=R(new x(n),e);return r.name=`E01:${e.sha256}`,{texture:r,close:()=>n.close()}}var B=class{constructor(e=z){this.loader=e,this.entries=new Map,this.closed=!1,this.created=0,this.disposed=0}preload(e,t=()=>!0){return this.loader===z?L.preload(e,()=>!this.closed&&t()):Promise.resolve()}async acquire(e){if(this.closed)throw Error(`E0 texture pool disposed`);let t=JSON.stringify([e.sha256,e.flipY,e.colorSpace,e.uv,e.scale,e.offset,e.wrap]),n=this.entries.get(t);n||(n={refs:0,resource:e,owned:null,disposed:!1},n.promise=Promise.resolve().then(()=>this.loader(e)).then(e=>(n.owned=e,this.created++,(this.closed||n.refs===0)&&this.destroy(n),e)),this.entries.set(t,n)),n.refs++;let r=!1,i=()=>{r||(r=!0,n.refs--,n.refs||(this.entries.get(t)===n&&this.entries.delete(t),this.destroy(n)))};try{let t=await n.promise;if(this.closed||n.disposed)throw Error(`E0 texture acquisition cancelled`);let r=t.texture;if(r.flipY!==!1||r.colorSpace!==(e.colorSpace===`srgb`?`srgb`:``)||r.channel!==0||r.image.width!==e.width||r.image.height!==e.height||r.wrapS!==1e3||r.wrapT!==1e3||!r.repeat.equals(new C(...e.scale))||!r.offset.equals(new C(...e.offset)))throw Error(`E0 invalid texture UV/color-space state`);return{texture:r,release:i}}catch(e){throw i(),e}}destroy(e){e.owned&&!e.disposed&&(e.disposed=!0,e.owned.texture.dispose(),e.owned.close?.(),this.disposed++)}stats(){return{textures:this.entries.size,references:[...this.entries.values()].reduce((e,t)=>e+t.refs,0),created:this.created,disposed:this.disposed}}dispose(){this.closed=!0;for(let e of this.entries.values())this.destroy(e);this.entries.clear()}},ce=Object.freeze([`flat`,`lit-albedo`,`flat-normal`,`vertex0`,`vertex1`]),le=e=>ce.includes(e)||e===`diffuse-e2`||e===`e021`||e===`e021b`||e===`e3`||e===`e035`||e===`e036`||e===`e037`||e===`e038`||e===`e039`||e===`e0310`;function V(e,t){e.color.setRGB(1,1,1),e.metalness=0,e.roughness=1,e.metalnessMap=e.roughnessMap=e.normalMap=e.bumpMap=null,e.aoMap=e.lightMap=e.emissiveMap=null,e.envMap=null,e.envMapIntensity=0,e.emissive.setRGB(0,0,0),e.clearcoat=e.sheen=e.iridescence=e.transmission=0,e.specularIntensity=0,e.fog=!1,(t===`flat`||t.startsWith(`vertex`))&&(e.toneMapped=!1,e.dithering=!1)}function ue(e,t){let n=t===`vertex0`?`color`:`color_1`,r=e.geometry.attributes[n];if(!r||![3,4].includes(r.itemSize)||r.count!==e.geometry.attributes.position.count||!Array.from(r.array).every(Number.isFinite))throw Error(`Color diagnostic missing/invalid ${n}: ${e.name}`);return{name:n,size:r.itemSize}}function H(e,t,n){for(let t of[`#include <common>`,`#include <color_fragment>`,`#include <opaque_fragment>`,`#include <colorspace_fragment>`])if(!e.fragmentShader.includes(t))throw Error(`Color diagnostic incompatible Three shader`);if(e.fragmentShader=e.fragmentShader.replace(`#include <color_fragment>`,`vec3 labDiffuseRGB = diffuseColor.rgb;
#include <color_fragment>
diffuseColor.rgb = labDiffuseRGB;`),t.startsWith(`vertex`)){if(!e.vertexShader.includes(`#include <begin_vertex>`))throw Error(`Color diagnostic incompatible vertex shader`);let t=n.name===`color_1`?`attribute vec${n.size} color_1;`:``;e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>\n${t}\nvarying vec3 labVertexRGB;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>\nlabVertexRGB = ${n.name}.rgb;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
varying vec3 labVertexRGB;`),e.fragmentShader=e.fragmentShader.replace(`#include <colorspace_fragment>`,`#include <colorspace_fragment>
gl_FragColor.rgb = labVertexRGB;`)}let r=t===`lit-albedo`||t===`flat-normal`||t===`diffuse-e2`||t===`e021`||t===`e021b`||t===`e3`||t===`e035`||t===`e036`||t===`e037`||t===`e038`||t===`e039`||t===`e0310`;if(r){if(!e.fragmentShader.includes(`#include <lights_physical_pars_fragment>`))throw Error(`Color diagnostic incompatible lighting shader`);e.fragmentShader=e.fragmentShader.replace(`#include <lights_physical_pars_fragment>`,`#include <lights_physical_pars_fragment>
      void labDirect(const in IncidentLight l, const in vec3 p, const in vec3 n, const in vec3 v,
        const in vec3 cn, const in PhysicalMaterial m, inout ReflectedLight r) {
        r.directDiffuse += max(dot(n,l.direction),0.0) * l.color * BRDF_Lambert(m.diffuseColor);
      }
      void labIndirect(const in vec3 irradiance, const in vec3 p, const in vec3 n, const in vec3 v,
        const in vec3 cn, const in PhysicalMaterial m, inout ReflectedLight r) {
        r.indirectDiffuse += irradiance * BRDF_Lambert(m.diffuseColor);
      }
      #undef RE_Direct
      #define RE_Direct labDirect
      #undef RE_IndirectDiffuse
      #define RE_IndirectDiffuse labIndirect
      #undef RE_IndirectSpecular
      #undef RE_Direct_RectArea
    `)}e.fragmentShader=e.fragmentShader.replace(`#include <opaque_fragment>`,`outgoingLight = ${r?`reflectedLight.directDiffuse + reflectedLight.indirectDiffuse`:`diffuseColor.rgb`};\n#include <opaque_fragment>`)}var U=class{constructor(e,t,{runtimeMeshes:n}={}){this.controller=t,this.records=[],this.created=0,this.released=0,this.disposed=!1,e.traverse(e=>{if(n&&!n.includes(e.name)||!e.isMesh||Array.isArray(e.material)||!e.material.isMeshStandardMaterial||!e.material.map||e.material.userData.zzzRenderRole===`shadow-proxy`)return;let t=e.material,r=t.clone(),i=t.onBeforeCompile,a=t.customProgramCacheKey.call(t);V(r,`lit-albedo`),r.onBeforeCompile=(e,n)=>{i.call(t,e,n),H(e,`lit-albedo`)},r.customProgramCacheKey=()=>a+`|zzz-global-diffuse-fallback-v1`,this.created++,r.addEventListener(`dispose`,()=>this.released++),this.records.push({mesh:e,baseline:t,material:r})}),this.upstream=t.applySettings,this.wrapper=e=>{this.upstream.call(t,e),this.reapply()},t.applySettings=this.wrapper,this.reapply()}reapply(){for(let e of this.records)e.mesh.material=e.material}dispose(){if(!this.disposed){this.disposed=!0;for(let e of this.records)e.mesh.material===e.material&&(e.mesh.material=e.baseline),e.material.dispose();this.controller.applySettings===this.wrapper&&(this.controller.applySettings=this.upstream)}}},W=Object.freeze({shadow:!1,bias:!0,ambient:!1,normal:!0,strength:1,aoStrength:1,aoNeutral:.5,diagnostic:`none`});function G(e={}){let t={...W,...e};for(let e of[`shadow`,`bias`,`ambient`,`normal`])if(typeof t[e]!=`boolean`)throw Error(`E2 invalid ${e}`);for(let[e,n,r]of[[`strength`,0,1],[`aoStrength`,0,1],[`aoNeutral`,.05,1]])if(!Number.isFinite(t[e])||t[e]<n||t[e]>r)throw Error(`E2 invalid ${e}`);if(![`none`,`regions`,`drive`].includes(t.diagnostic))throw Error(`E2 invalid diagnostic`);return t}function de(e,t){if(!e)throw Error(`E2 source lighting contract unavailable`);return t.updateMatrix(),{e02RegionMap:{value:t},e02UVTransform:{value:t.matrix.clone()},e02Flags:{value:new y(0,1,0,1)},e02Controls:{value:new y(1,1,.5,0)},e02Light:{value:new E(4,7,5).normalize()},e02ShadowColors:{value:e.shadowColors.map(e=>new E(...e))},e02Smoothness:{value:Float32Array.from(e.smoothness.map(e=>Math.max(1e-5,e)))}}}function fe(e,t,n){let r=G(t);e.e02Flags.value.set(+r.shadow,+r.bias,+r.ambient,+r.normal),e.e02Controls.value.set(r.strength,r.aoStrength,r.aoNeutral,[`none`,`regions`,`drive`].indexOf(r.diagnostic)),n&&e.e02Light.value.copy(n).normalize()}function pe(e,t){let n=()=>{throw Error(`E2 incompatible Three lighting anchor`)};(!e.vertexShader.includes(`#include <uv_vertex>`)||!e.fragmentShader.includes(`#include <aomap_fragment>`)||!e.fragmentShader.includes(`normal = normalize( tbn * mapN );`))&&n(),Object.assign(e.uniforms,t),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec2 e02UV0;`).replace(`#include <uv_vertex>`,`#include <uv_vertex>
e02UV0 = uv;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
    varying vec2 e02UV0;
    uniform sampler2D e02RegionMap;
    uniform mat3 e02UVTransform;
    uniform vec4 e02Flags;
    uniform vec4 e02Controls;
    uniform vec3 e02Light;
    uniform vec3 e02ShadowColors[5];
    uniform float e02Smoothness[5];
  `).replace(`normal = normalize( tbn * mapN );`,`mapN = mix(vec3(0.0,0.0,1.0), mapN, e02Flags.w);
normal = normalize( tbn * mapN );`),e.fragmentShader=e.fragmentShader.replace(`#include <aomap_fragment>`,`#include <aomap_fragment>
    float e02R = texture2D(e02RegionMap, (e02UVTransform * vec3(e02UV0,1.0)).xy).r;
    int e02Id = e02R >= 0.8 ? 0 : (e02R >= 0.6 ? 1 : (e02R >= 0.4 ? 2 : (e02R >= 0.2 ? 3 : 4)));
    float e02NB = texture2D(normalMap, vNormalMapUv).b;
    vec3 e02ViewLight = normalize((viewMatrix * vec4(e02Light,0.0)).xyz);
    float e02NdL = dot(normal, e02ViewLight);
    float e02Drive = e02NdL + e02Flags.y * (4.0 * e02NB - 2.0);
    // Hypothesis: one transition, not five lighting bands. Source M/R selects a palette.
    float e02Lit = smoothstep(-e02Smoothness[e02Id], e02Smoothness[e02Id], e02Drive);
    vec3 e02Tint = mix(e02ShadowColors[e02Id], vec3(1.0), e02Lit);
    vec3 e02DirectMultiplier = mix(vec3(1.0), e02Tint, e02Flags.x * e02Controls.x);
    reflectedLight.directDiffuse *= e02DirectMultiplier;
    reflectedLight.directSpecular *= e02DirectMultiplier;
    // Separate hypothesis. No aoMap binding, no inferred AOParameters equation.
    float e02AO = mix(1.0, clamp(e02NB / e02Controls.z,0.0,1.0), e02Flags.z * e02Controls.y);
    reflectedLight.indirectDiffuse *= e02AO;
    reflectedLight.indirectSpecular *= e02AO;
  `),e.fragmentShader.includes(`#include <opaque_fragment>`)||n(),e.fragmentShader=e.fragmentShader.replace(`#include <opaque_fragment>`,`
    if (e02Controls.w > 0.5 && e02Controls.w < 1.5) outgoingLight = e02ShadowColors[e02Id];
    if (e02Controls.w > 1.5) outgoingLight = vec3(clamp(e02Drive * 0.25 + 0.5,0.0,1.0));
    #include <opaque_fragment>
  `)}var me=`
float e021Sat(float x){return clamp(x,0.0,1.0);}
vec2 e021Sat(vec2 x){return clamp(x,0.0,1.0);}
vec3 e021Sat(vec3 x){return clamp(x,0.0,1.0);}
vec3 e021NormalizeColor(vec3 color,vec4 tmp){
    if(e021A.w<0.5)return color;
    color=vec3(0.00006)+color;
    float mean=0.333330005*(tmp.x+tmp.y+tmp.z);
    // Positive numerator at zero denominator has saturated limit 1.
    // Avoid implementation-dependent division by zero without an arbitrary epsilon.
    vec3 color_div=mean>0.0?clamp(color/mean,0.0,1.0):vec3(1.0);
    return color_div*0.562750012+color*0.437249988;
}
// Transcribed ramp inputs (docs/ramp-shadow-transcribed-20261112.md). Defaults keep the former result exactly:
// e021CastShadow is the main-light shadow the original pass feeds into the ramp weights (HoyoToon fixed it at 1.0);
// _AlbedoSmoothness is selected by the same M.r regions as the palette (original pass, blob 2700).
float e021CastShadow = 1.0;
// _ShadowColorFadeByZ (on in every library material): the palette is normalised by its own mean near the camera and
// returns to the raw colour from ~2.3 Unity metres (weight min(d · 0.43725, 1)). Only the shadow colour gets the offset.
vec3 e021FadeColor(vec3 c, float offset){
    c += vec3(offset);
    float mean = 0.33333 * (c.r + c.g + c.b);
    vec3 n = mean > 0.0 ? clamp(c / mean, 0.0, 1.0) : vec3(1.0);
    float w = min(length(vViewPosition) / max(e021UnitScale, 0.000001) * 0.43725, 1.0);
    return n * (1.0 - w) + c * w;
}
float e021RegionSmoothness(float id){
    return id < 0.2 ? e021SmoothnessRegions.w : (id < 0.4 ? e021SmoothnessRegions.z : (id < 0.6 ? e021SmoothnessRegions.y : (id < 0.8 ? e021SmoothnessRegions.x : e021Smoothness)));
}
vec4 e021ShadowBody(vec3 normal, vec3 light, vec4 tex_data, float id, float selfshadow)
{
    vec3 light_direction = light;
    // Skin/non-skin tint set: region 4 − floor(5·M.r) against _SkinMatId (original pass); _RenderType=1 CRYSTAL always takes the skin path.
    e021IsSkin = int(max(4.0 - floor(id * 5.0), 0.0)) == int(e021SkinMatId);
    if (e021Crystal > 0.5) e021IsSkin = true;

    vec4 shadow_thresholds=vec4(0.0),temp0=vec4(0.0),temp1=vec4(0.0),temp2=vec4(0.0),temp3=vec4(0.0),temp4=vec4(0.0);
    
    float ao_tex = tex_data.z;
    ao_tex = ao_tex * (selfshadow);
    ao_tex = ao_tex * 2.0 + -1.0;

    float albedo_smoothness = max(0.00000999999975, e021RegionSmoothness(id)); 
    float inverse_smoothness = (1.0 / albedo_smoothness);
    float ndotl = dot(normal, light_direction);
    ndotl = ndotl * e021Sat(selfshadow);

    float shad = ao_tex * 2.0 + ndotl;
    float albedo_step = -albedo_smoothness * 3.0 + 2.0;
    albedo_step = 3.0 / albedo_step;
    shadow_thresholds.yz = albedo_smoothness * vec2(0.5,1.5) + vec2(-0.333299994,0.333299994);
    shadow_thresholds.x = -1.0;
    shadow_thresholds.xyz = -shadow_thresholds.xyz + shad; 
    temp0.xyw = shadow_thresholds.xyz * albedo_step; 
    shadow_thresholds.xyz = -shadow_thresholds.xyz * albedo_step + vec3(1.0,1.0,1.0);
    temp1.xyz = vec3(0.333299994,-0.333299994,-0.333299994) + shad;
    temp1.xyz = temp1.xyz * inverse_smoothness + vec3(0.5,0.5,-0.5);
    temp2.xyz = vec3(1.0,1.0,1.0) + -temp1.xyz;
    temp3.xy = min(temp2.yx, temp0.yx);
    temp0.xz = min(temp1.xz, shadow_thresholds.yz);
    temp3.z = shadow_thresholds.x;
    temp3.w = temp0.x;
    shadow_thresholds.xyz = e021Sat(temp3.zyw);

    temp3.y = e021Sat(min(temp2.z, temp1.y));
    temp3.x = e021Sat(temp3.x);
    temp0.zw = e021Sat(temp0.zw);
    temp1.xyzw = e021CastShadow * vec4(-2.0,2.0,2.0,-2.0) + vec4(1.0,0.0,-1.0,2.0);
    temp1.y = e021Sat(min(temp1.y, temp1.w));
    temp1.xz = e021Sat(temp1.xz);
    // Per-entity scale of the shadow and half-shadow weights (engine data; 1 keeps the former result).
    temp1.xy *= e021EntityShadow;
    
        
    temp0.xy = temp1.xy;
    inverse_smoothness = 1.0 + -shadow_thresholds.x;
    inverse_smoothness = inverse_smoothness + -shadow_thresholds.y;
    inverse_smoothness = inverse_smoothness + -shadow_thresholds.z;
    inverse_smoothness = temp0.x * inverse_smoothness + shadow_thresholds.z;
    albedo_smoothness = temp1.y + temp1.z;
    shadow_thresholds.zw = temp3.xy * albedo_smoothness;
    albedo_smoothness = temp0.z + temp0.w;
    albedo_smoothness = albedo_smoothness * temp0.y + shadow_thresholds.w;
    albedo_step = temp1.z * temp0.z;
    shadow_thresholds.x =  shadow_thresholds.x;
    shadow_thresholds.x = shadow_thresholds.y + shadow_thresholds.x;
    
    vec3 shallow_color = e021Shallow(0).xyz;
    shallow_color = id < 0.8 ? e021Shallow(1).xyz : shallow_color;
    shallow_color = id < 0.6 ? e021Shallow(2).xyz : shallow_color;
    shallow_color = id < 0.4 ? e021Shallow(3).xyz : shallow_color;
    shallow_color = id < 0.2 ? e021Shallow(4).xyz : shallow_color;

    vec3 shadow_color = e021Shadow(0).xyz;
    shadow_color = id < 0.8 ? e021Shadow(1).xyz : shadow_color;
    shadow_color = id < 0.6 ? e021Shadow(2).xyz : shadow_color;
    shadow_color = id < 0.4 ? e021Shadow(3).xyz : shadow_color;
    shadow_color = id < 0.2 ? e021Shadow(4).xyz : shadow_color;
    

    shallow_color = e021FadeByZ > 0.5 ? e021FadeColor(shallow_color, 0.0) : e021NormalizeColor(shallow_color, temp0);
    shadow_color = e021FadeByZ > 0.5 ? e021FadeColor(shadow_color, 0.000061) : e021NormalizeColor(shadow_color, temp1);


    vec3 post_shallow;
    post_shallow = e021Post(0).xyz * shallow_color;
    shallow_color = e021Post(1).xyz * shallow_color;

    vec3 post_shadow;
    post_shadow = e021Post(2).xyz * shadow_color;
    shadow_color = e021Post(3).xyz * shadow_color;
    temp4.xyz = vec3(1.17549435e-38 + 1.0);
    shadow_thresholds.y = max(temp4.x, temp4.y);
    shadow_thresholds.y = max(shadow_thresholds.y, temp4.z);
    shadow_thresholds.y = (1.0 / shadow_thresholds.y);
    
    vec3 post_fss_tint;
    post_fss_tint = e021Post(4).xyz * albedo_step;
    post_fss_tint = e021Post(5).xyz * albedo_smoothness + post_fss_tint;
    post_fss_tint = temp0.www * temp1.zzz + post_fss_tint;
    post_shadow = post_shadow * shadow_thresholds.xxx;

    vec3 final_color;
    final_color = shallow_color * inverse_smoothness + post_shadow;
    final_color = post_shallow * shadow_thresholds.zzz + final_color;
    final_color = final_color;
    final_color = post_fss_tint + final_color;
    

    return vec4(e021Sat(final_color), shad);
}

`,he=`e021`,K=`
    // Transcribed rim (docs/rim-transcribed-20261112.md): CharacterToonDeferred blob 2700, lines 617–732. The game writes
    // it to a second render target composed by a pass that is not exported; here it is added before tone mapping.
    uniform float e021RimOn,e021RimEnabled,e021RimIntensity,e021HairBit,e021Metallic;
    uniform vec4 e021RimStyle;
    uniform vec3 e021RimTint,e021RimColors[5],e021LightColor;
    vec3 e021TranscribedRim(vec3 N,vec3 V,vec3 L,float mr,float mg,vec3 base,vec3 rampLight,float shadow,float dist){
      float vl=clamp(0.5-0.5*dot(V,L),0.0,1.0);
      float y=N.y*0.5+0.5;y=e021IsSkin?y:y*y;
      float t=clamp((y-0.2)*1.25,0.0,1.0);float s=t*t*(3.0-2.0*t);float s5=s*s*s*s*s;
      float vertical=e021RimStyle.x*(s*(e021IsSkin?1.0-0.7*s5:0.5+0.5*s5)-0.1)+0.1;
      float m=vertical*(vl*0.8+0.2)*((dot(N,L)*0.5+0.5)*shadow*1.4+0.1)*clamp(shadow+0.6,0.0,1.0);
      float metal=mg*e021Metallic;
      m*=e021RimStyle.y*(clamp(-V.y,0.0,1.0)*(e021HairBit>0.5?4.5:metal+2.5)-0.5)+1.0;
      float dn=min(dist*0.083333,1.0),ndv=1.0-dot(V,N);
      float e=e021IsSkin?clamp((ndv-(0.5-0.3*dn))*3.333333,0.0,1.0):clamp((ndv-(0.6-0.3*dn))*5.0,0.0,1.0);e=e*e*(3.0-2.0*e);
      vec3 lc=e021LightColor,p8=pow(max(lc,vec3(0.0)),vec3(8.0));
      vec3 nl=p8*(dot(lc,vec3(0.33))/max(dot(p8,vec3(0.7)),0.01));
      vec3 lt=mix(rampLight,nl,shadow);lt=mix(lt,rampLight,pow(vl*vl,20.0));lt=rampLight+e021RimStyle.z*(lt-rampLight);
      vec3 diffuse=base*(0.96-0.96*metal);
      float mean=(diffuse.r+diffuse.g+diffuse.b)*0.33;
      vec3 chroma=pow(clamp(diffuse,0.0,1.0),vec3(0.2));chroma*=inversesqrt(max(dot(chroma,chroma),0.000061));
      vec3 col=mix(chroma*(1.0-0.2*mean*mean*e021RimStyle.w)*0.1,mix(vec3(0.04),base,metal),metal)*e021RimIntensity;
      col*=lt*(m*e);
      int id=mr<0.2?4:(mr<0.4?3:(mr<0.6?2:(mr<0.8?1:0)));
      col*=e021Decode(e021RimColors[id]);
      col*=1.0-0.7*clamp(dist*0.2-1.0,0.0,1.0);
      float sum=col.r+col.g+col.b;col*=sum*sum*0.05+1.0;
      col*=e021HairBit>0.5?0.5:1.0;
      return col*e021Decode(e021RimTint)*e021RimEnabled;
    }`,q=Object.freeze({shadows:!0,normal:!0,bias:!0,normalize:!0,face:!0,shadowPalette:!0,shallowPalette:!0,postTints:!0,linearColors:!0,composition:`lambert`,diagnostic:`none`});Object.freeze([`_PostShallowTint`,`_PostShallowFadeTint`,`_PostShadowTint`,`_PostShadowFadeTint`,`_PostFrontTint`,`_PostSssTint`]),Object.freeze([[.956862748,.960784256,.9019608],[.8745098,.8,.7921569],[.8509804,.78039217,.772549033],[.929411769,.8509804,.8431372],[1,.996078432,.929411769],[1,.9481711,.929411769]]);function ge(e={}){let t={...q,...e};for(let e of Object.keys(q).filter(e=>typeof q[e]==`boolean`))if(typeof t[e]!=`boolean`)throw Error(`E2.1 invalid `+e);if(![`lambert`,`albedo`].includes(t.composition)||![`none`,`regions`,`drive`].includes(t.diagnostic))throw Error(`E2.1 invalid selection`);return t}var _e=`
vec3 e021FaceFade(vec3 c){
  // Match the body shadow/shallow distance fade (original FaceToonDeferred lines 561–580, docs/face-ramp-transcribed-20261112.md):
  // when "Paleta según distancia" is on, fade from normalised close-up to raw palette by distance via e021FadeColor;
  // when off, keep the same 0.56275 / 0.43725 blend as e021NormalizeColor so face and body skin never diverge in shadow.
  if(e021FadeByZ>0.5)return e021FadeColor(c,0.000061);
  c+=vec3(0.000061);
  float mean=0.33333*(c.r+c.g+c.b);
  vec3 n=clamp(c/max(mean,0.000001),0.0,1.0);
  return n*0.562750012+c*0.437249988;
}
vec4 e021FaceRamp(float x,float y,float w,float a,float g,float s,float region){
  float xp=(x*1.2-0.6)/(4.0*w+1.0)+0.6;
  float A=clamp((xp-y)/w,0.0,1.0),B=clamp((y-xp+w)/w,0.0,1.0),C=clamp((xp-w-y)/w,0.0,1.0),D=clamp((y-xp+2.0*w)/w,0.0,1.0);
  float E=clamp(8.0*(xp-2.0*w-y),0.0,1.0),F=clamp(8.0*(y-xp+2.0*w+0.125),0.0,1.0);
  s=max(s,0.00001);float q=2.0-3.0*s;
  float v0=3.0*g/q,v1=(3.0*(g-1.0)-1.5*s+1.0)/q,v2=(3.0*(g-1.0)-4.5*s-1.0)/q;
  float p0=(g-0.6667)/s+0.5,p1=(g-1.3333)/s+0.5,p2=(g-1.3333)/s-0.5;
  float shadow=mix(clamp(1.0-v0,0.0,1.0)+clamp(min(v0,1.0-p0),0.0,1.0),B,a);
  float shallowFade=mix(clamp(min(p0,1.0-v1),0.0,1.0),0.0,a);
  float shallow=clamp(min(v1,1.0-p1),0.0,1.0)*(1.0-a);
  float front=mix(clamp(min(p2,1.0-v2),0.0,1.0),min(C,F),a);
  float sss=mix(clamp(min(p1,1.0-p2),0.0,1.0),min(D,A),a);
  float white=mix(clamp(v2,0.0,1.0),E,a);
  int id=region<0.6?2:(region<0.8?1:0);
  vec3 sl=e021FaceFade(e021Shallow(id)),sh=e021FaceFade(e021Shadow(id));
  vec3 c=sh*e021Post(2)*shadow+sl*(e021Post(1)*shallowFade+e021Post(0)*shallow)+e021Post(4)*front+e021Post(5)*sss+vec3(white);
  return vec4(c,g-1.0);
}
`,J=null;function ve(){return J||(J=new _(new Uint8Array([0,0,0,255]),1,1),J.needsUpdate=!0),J}function ye(e,t,n=null){if(!e)throw Error(`E2.1 source parameters unavailable`);return t.updateMatrix(),{e021TransmissionMap:{value:n??ve()},e021Transmission:{value:+!!n},e021RegionMap:{value:t},e021UVTransform:{value:new D().copy(t.matrix)},e02Light:{value:new E(4,7,5).normalize()},e021A:{value:new y},e021B:{value:new y},e021Composition:{value:0},e021Diagnostic:{value:0},e021FaceEnabled:{value:1},e021HeadForward:{value:new E(0,0,1)},e021HeadRight:{value:new E(-1,0,0)},e021Smoothness:{value:e.smoothness},e021SmoothnessRegions:{value:new y(...e.smoothnessRegions??[,,,,].fill(e.smoothness))},e021AlbedoShade:{value:0},e021CharCurve:{value:new E(.8,1.2,0)},e021CharAmbient:{value:new E(0,0,0)},e021FaceEye:{value:+!!e.eye},e021FaceSmooth:{value:new E(...e.faceSmoothness??[,,,].fill(e.smoothness))},e021SkinTints:{value:Array.from({length:6},()=>new E(1,1,1))},e021GlobalTints:{value:Array.from({length:6},()=>new E(1,1,1))},e021SkinMatId:{value:e.skinMatId??-1},e021Crystal:{value:+!!e.crystal},e021RimShadowColor:{value:new E(...e.rimShadowColor?.slice(0,3)??[0,0,0])},e021RimShadowAlpha:{value:e.rimShadowColor?.[3]??1},e021EntityShadow:{value:1},e021FadeByZ:{value:0},e021UnitScale:{value:1},e021ColorTint:{value:new E(1,1,1)},e021SourceColor:{value:new E(...e.color??[1,1,1])},e021RimOn:{value:0},e021RimEnabled:{value:+!!e.rim?.enabled},e021RimIntensity:{value:10},e021HairBit:{value:+!!e.hairBit},e021Metallic:{value:e.rim?.metallic??0},e021RimStyle:{value:new y(1,1,1,1)},e021RimTint:{value:new E(1,1,1)},e021RimColors:{value:(e.rim?.colors??[,,,,,].fill([0,0,0])).map(e=>new E(...e))},e021LightColor:{value:new E(1,1,1)},e021ShadowColors:{value:e.shadow.map(e=>new E(...e))},e021ShallowColors:{value:e.shallow.map(e=>new E(...e))}}}function be(e,t,n){let r=ge(t);e.e021A.value.set(+r.shadows,+r.normal,+r.bias,+r.normalize),e.e021B.value.set(+r.shadowPalette,+r.shallowPalette,+r.postTints,+r.linearColors),e.e021Composition.value=+(r.composition===`albedo`),e.e021Diagnostic.value=[`none`,`regions`,`drive`].indexOf(r.diagnostic),e.e021FaceEnabled.value=+r.face,n&&e.e02Light.value.copy(n).normalize()}function xe(e,t,n=!1){let r=`normal = normalize( tbn * mapN );`;if(!e.vertexShader.includes(`#include <uv_vertex>`)||!n&&!e.fragmentShader.includes(r)||!e.fragmentShader.includes(`#include <aomap_fragment>`)||!e.fragmentShader.includes(`#include <opaque_fragment>`))throw Error(`E2.1 incompatible Three shader`);if(Object.assign(e.uniforms,t),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
varying vec2 e021UV0;`+(n?`
attribute vec4 color_1;
attribute vec3 e021Uv3;
varying float e021FaceRegion;
varying float e021FaceMask;
varying float e021FaceColorA;
varying vec3 e021FaceUv3;`:``)).replace(`#include <uv_vertex>`,`#include <uv_vertex>
e021UV0 = uv;`),n&&(e.vertexShader=e.vertexShader.replace(`e021UV0 = uv;`,`e021UV0 = uv;
    // Recover the original byte flags from the documented sRGB->linear export.
    float e021Blue=color_1.b<=0.0031308?12.92*color_1.b:1.055*pow(color_1.b,1.0/2.4)-0.055;
    int e021Byte=int(floor(e021Blue*255.0+0.5));
    e021FaceRegion=0.899999976-float(e021Byte & 3)*0.200000003;
    e021FaceMask=(e021Byte & 16)!=0?1.0:0.0;
    e021FaceColorA=color_1.a;
    e021FaceUv3=e021Uv3;
  `)),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
    varying vec2 e021UV0;
    uniform sampler2D e021RegionMap;
    uniform sampler2D e021TransmissionMap;
    uniform float e021Transmission;
    uniform mat3 e021UVTransform;
    uniform vec3 e02Light;
    uniform vec4 e021A;
    uniform vec4 e021B;
    uniform float e021Composition;
    uniform float e021Diagnostic;
    uniform float e021Smoothness;
    uniform vec4 e021SmoothnessRegions;
    ${n?`varying float e021FaceRegion;varying float e021FaceMask;varying float e021FaceColorA;varying vec3 e021FaceUv3;uniform vec3 e021HeadForward;uniform vec3 e021HeadRight;uniform float e021FaceEnabled;uniform vec3 e021FaceSmooth;uniform float e021FaceEye;`:``}
    uniform vec3 e021ShadowColors[5];
    uniform vec3 e021ShallowColors[5];
    // Engine globals of the original pass (docs/ramp-globals-transcribed-20261112.md), viewer controls; neutral by default.
    uniform vec3 e021SkinTints[6],e021GlobalTints[6];
    uniform vec3 e021ColorTint,e021RimShadowColor;
    uniform float e021SkinMatId,e021Crystal,e021RimShadowAlpha,e021EntityShadow,e021FadeByZ,e021UnitScale;
    // Output stage of the original passes (docs/output-stage-transcribed-20261112.md).
    uniform float e021AlbedoShade;uniform vec3 e021CharCurve,e021CharAmbient;
    // Albedo in the unlit part (Standard lines 508-545, Face 638-666, Eye 520-540): skin keeps it; hair takes a fixed power;
    // the rest is darkened and saturated by pow(albedo, mix(1.4375 + 0.2875 lum, 1, s)) where the light does not reach.
    vec3 e021ShadeAlbedo(vec3 a,float nl,float nlv,bool hair){
      float lum=dot(a,vec3(0.29,0.6,0.11));
      if(hair)return pow(max(a,vec3(0.0)),vec3(1.0+0.4*lum))*(1.05-0.05*lum);
      float d=clamp(1.0-3.0*(nlv-nl),0.0,1.0),g=min(2.0*d*sqrt(d),1.0),s=((nl*0.5+0.5)*g+clamp(nl,0.0,1.0))*0.5;
      float mx=max(a.r,max(a.g,a.b));
      vec3 p=pow(max(mx>1.0?a/mx:a,vec3(0.0)),vec3(mix(1.4375+0.2875*lum,1.0,s)));
      return mix((p+a)*0.5,p,clamp(nlv,0.0,1.0));
    }
    // Character light curve (_CharacterLightTonemapParams x = threshold, y = maximum) on the luminance of the ramp plus
    // _CharacterAmbient; the ambient only enters the luminance, it is not added to the colour (lines 555-568 / 668-684).
    vec3 e021CharLight(vec3 ramp){
      if(e021CharCurve.z<0.5)return ramp;
      float lum=dot(ramp+e021CharAmbient,vec3(0.212673,0.715152,0.072175)),t=e021CharCurve.x,m=max(e021CharCurve.y,t+0.00001);
      float c=lum<t?lum:m-(m-t)/((lum-t)/(m-t)+1.0);
      return ramp*(c/(lum+0.0001));
    }
    bool e021IsSkin=false;
    vec3 e021Decode(vec3 c) {
      if(e021B.w < 0.5)return c;
      return vec3(c.r<=0.04045?c.r/12.92:pow((c.r+0.055)/1.055,2.4),
        c.g<=0.04045?c.g/12.92:pow((c.g+0.055)/1.055,2.4),
        c.b<=0.04045?c.b/12.92:pow((c.b+0.055)/1.055,2.4));
    }
    vec3 e021HdrColor(vec3 c){return max(c.r,max(c.g,c.b))>1.0?c:e021Decode(c);}
    vec3 e021Shadow(int id){return e021B.x>0.5?e021Decode(e021ShadowColors[id]):vec3(1.0);}
    vec3 e021Shallow(int id){return e021B.y>0.5?e021Decode(e021ShallowColors[id]):vec3(1.0);}
    vec3 e021Post(int id){return e021Decode(e021IsSkin?e021SkinTints[id]:e021GlobalTints[id]);}
    ${me}
    ${n?_e:K}
  `),n||(e.fragmentShader=e.fragmentShader.replace(r,`mapN = mix(vec3(0.0,0.0,1.0),mapN,e021A.y);
`+r)),!n){if(e.fragmentShader.split(`#include <tonemapping_fragment>`).length!==2)throw Error(`E2.1 rim composition anchor changed`);e.fragmentShader=e.fragmentShader.replace(`#include <tonemapping_fragment>`,`if(e021RimOn>0.5){
      vec3 e021RimN=inverseTransformDirection(normal,viewMatrix),e021RimV=inverseTransformDirection(normalize(vViewPosition),viewMatrix);// surface → camera, as the original r7
      vec2 e021RimM=texture2D(e021RegionMap,(e021UVTransform*vec3(e021UV0,1.0)).xy).rg;
      gl_FragColor.rgb+=e021TranscribedRim(e021RimN,e021RimV,normalize(e02Light),e021RimM.r,e021RimM.g,diffuseColor.rgb,e021Result.rgb*e021LightColor,e021CastShadow,length(vViewPosition)/max(e021UnitScale,0.000001));
    }
    #include <tonemapping_fragment>`)}e.fragmentShader=e.fragmentShader.replace(`#include <aomap_fragment>`,(n?`#include <aomap_fragment>
    vec3 e021L=normalize(e02Light);
    float e021Threshold=1.0-(dot(normalize(e021HeadForward).xz,e021L.xz)*0.5+0.5);
    vec2 e021FaceUV=e021UV0;
    if(dot(normalize(e021HeadRight).xz,e021L.xz)<=0.0)e021FaceUV.x=1.0-e021FaceUV.x;
    vec4 e021FaceTex=texture2D(e021RegionMap,(e021UVTransform*vec3(e021FaceUV,1.0)).xy);
    float e021FaceArea=smoothstep(e021Threshold-0.5,e021Threshold+0.5,e021FaceTex.r*0.9+0.1)*(e021FaceMask<0.5?1.0:e021FaceTex.a)*2.0-1.0;
    // Transcribed face input (docs/face-ramp-transcribed-20261112.md): x = SDF, y = |light angle|/pi, alpha mixes SDF and Lambert.
    float e021OrigX=0.0,e021OrigY=0.0,e021OrigA=0.0,e021OrigW=0.00001,e021OrigS=e021FaceSmooth.x;
    {
      vec3 e021HF=normalize(e021HeadForward),e021HR=normalize(e021HeadRight),e021HU=cross(e021HF,e021HR);
      // Vertex program: the light is pulled toward the face front by half its vertical part, then made horizontal.
      vec3 e021LH=vec3(e021L.x,0.0,e021L.z)+vec3(e021HF.x,0.0,e021HF.z)*(abs(dot(e021HU,e021L))*0.5);
      e021LH=length(e021LH)>0.000001?normalize(e021LH):e021HF;
      e021OrigY=abs(atan(dot(e021LH,e021HR),dot(e021LH,e021HF)))/PI;
      e021OrigX=e021FaceTex.r;e021OrigA=e021FaceMask>0.5?clamp(e021FaceTex.a,0.0,1.0):0.0;
      // Vertices without the SDF flag: x = original TEXCOORD3 (.y on the flipped side, as the vertex program), alpha 1
      // (step 2.5b-2). Without it in the contract (z = 0) they keep the Lambert ramp only.
      if(e021FaceMask<0.5&&e021FaceUv3.z>0.5){e021OrigX=dot(normalize(e021HeadRight).xz,e021L.xz)<=0.0?e021FaceUv3.y:e021FaceUv3.x;e021OrigA=1.0;}
      float e021G=e021FaceTex.g;
      if(!(e021G>0.4&&e021G<0.95))e021G=texture2D(e021RegionMap,(e021UVTransform*vec3(e021UV0,1.0)).xy).g;
      // Eye program (CharacterOpaqueEye): one _AlbedoSmoothness and one palette, no face regions.
      e021OrigS=e021FaceEye>0.5?e021FaceSmooth.x:(e021FaceRegion<0.6?e021FaceSmooth.z:(e021FaceRegion<0.8?e021FaceSmooth.y:e021FaceSmooth.x));
      e021OrigW=max((e021G>=0.4&&e021G<=0.95)?mix(e021OrigS,0.025,clamp((e021G-0.5)*2.5,0.0,1.0)):0.0,0.00001);
    }
    float e021R=e021FaceRegion>=0.8?0.9:(e021FaceRegion>=0.6?0.7:0.5);
    // shadow_face has the same transition/normalization/post algebra as shadow_body,
    // with its SDF area as drive, neutral N/B and only three palette regions.
    vec4 e021Result=e021ShadowBody(vec3(0.0,0.0,e021FaceArea),vec3(0.0,0.0,1.0),vec4(0.0,0.0,0.5,1.0),e021R,1.0);
    {
      vec3 e021FN=inverseTransformDirection(normal,viewMatrix);
      float e021K=clamp(e021FN.y-0.5*min(3.0*e021L.y,1.0)+1.5,0.0,1.0);
      e021IsSkin=e021FaceEye<0.5&&e021FaceRegion>0.85&&e021FaceColorA<0.5;
      e021Result=e021FaceRamp(e021OrigX,e021OrigY,e021OrigW,e021OrigA,(dot(e021FN,e021L)+1.0)*e021K,e021OrigS,e021FaceEye>0.5?0.9:e021FaceRegion);
      if(e021AlbedoShade>0.5&&!e021IsSkin){float e021NLf=dot(e021FN,e021L);diffuseColor.rgb=e021ShadeAlbedo(diffuseColor.rgb,e021NLf,e021NLf,false);}
      e021Result.rgb=e021CharLight(e021Result.rgb);
    }
  `:`#include <aomap_fragment>
    float e021R=texture2D(e021RegionMap,(e021UVTransform*vec3(e021UV0,1.0)).xy).r;
    float e021NB=mix(0.5,texture2D(normalMap,vNormalMapUv).b,e021A.z);
    vec3 e021L=normalize((viewMatrix*vec4(e02Light,0.0)).xyz);
    // Self shadow attenuation is 1: no shadow maps are introduced in this phase.
    vec4 e021Result=e021ShadowBody(normal,e021L,vec4(0.0,0.0,e021NB,1.0),e021R,1.0);
    if(e021AlbedoShade>0.5&&!e021IsSkin)diffuseColor.rgb=e021ShadeAlbedo(diffuseColor.rgb,dot(normal,e021L),dot(e021HairBit>0.5?normal:nonPerturbedNormal,e021L),e021HairBit>0.5);
    e021Result.rgb=e021CharLight(e021Result.rgb);
    if(e021Crystal>0.5){
      float e021BLV=dot(-e021L,normalize(vViewPosition));
      float e021BLP=19.0*e021RimShadowAlpha+1.0;
      float e021BLPow=e021BLV>0.0?pow(e021BLV,e021BLP*e021BLP):0.0;
      e021Result.rgb+=50.0*e021HdrColor(e021RimShadowColor)*e021Result.rgb*clamp(dot(-e021L,normal),0.0,1.0)*e021BLPow;
    }
    if(e021Transmission>0.0){
      // Adapted TRANSMISSION back-light: light behind the thin surface (seen from the camera) passes through it, tinted by
      // the sRGB _TransmissionTexture. Same shape as Crystal's term with a wider lobe; intensity is a renderer choice.
      vec3 e021TT=texture2D(e021TransmissionMap,(e021UVTransform*vec3(e021UV0,1.0)).xy).rgb;
      e021TT=mix(e021TT/12.92,pow((e021TT+0.055)/1.055,vec3(2.4)),step(0.04045,e021TT));
      float e021TV=max(dot(-e021L,normalize(vViewPosition)),0.0);
      e021Result.rgb+=e021Transmission*e021TT*clamp(dot(-e021L,normal),0.0,1.0)*(0.25+0.75*e021TV*e021TV);
    }
  `).replace(`#include <aomap_fragment>`,`#include <aomap_fragment>
    diffuseColor.rgb*=e021Decode(e021ColorTint);`)),e.fragmentShader=e.fragmentShader.replace(`#include <opaque_fragment>`,`
    // Lambert integration is an explicit adaptation. Albedo mode isolates the
    // saturate(diffuse * shadow) composition in zzz-program.hlsl:181, before GI/specular.
    if(e021A.x>0.5${n?`&&e021FaceEnabled>0.5`:``})outgoingLight=e021Composition>0.5?clamp(diffuseColor.rgb*e021Result.rgb,0.0,1.0):outgoingLight*e021Result.rgb;
    int e021Id=e021R>=0.8?0:(e021R>=0.6?1:(e021R>=0.4?2:(e021R>=0.2?3:4)));
    if(e021Diagnostic>0.5&&e021Diagnostic<1.5)outgoingLight=e021Shadow(e021Id);
    if(e021Diagnostic>1.5)outgoingLight=vec3(clamp(e021Result.w*0.25+0.5,0.0,1.0));
    #include <opaque_fragment>
  `)}function Se(e){let t=(e<=.0031308?12.92*e:1.055*e**(1/2.4)-.055)*255;return{byte:Math.round(t),error:Math.abs(t-Math.round(t))}}function Ce(e,t,n){if(n.colorEncoding!==`srgb-to-linear-byte`)throw Error(`E2.1 unsupported facial color encoding`);let r=t.geometry.attributes[n.colorAttribute],i=e.getObjectByName(n.headBone);if(!t.isSkinnedMesh||!i?.isBone||!t.skeleton.bones.includes(i)||!r||r.itemSize!==4||r.count!==t.geometry.attributes.position.count)throw Error(`E2.1 facial rig/attribute mismatch`);let a=0,o={};for(let e=0;e<r.count;e++){let{byte:t,error:i}=Se(r.getZ(e));if(a=Math.max(a,i),!Number.isFinite(i)||t<0||t>255||i>n.maxByteError)throw Error(`E2.1 facial byte contract mismatch`);o[t]=(o[t]??0)+1}e.updateMatrixWorld(!0);let s=e.getWorldQuaternion(new u),c=i.getWorldQuaternion(new u).invert();if(n.restFrame===`skin-bind`){let e=i.quaternion.clone();t.skeleton.boneInverses[t.skeleton.bones.indexOf(i)].clone().invert().decompose(new E,e,new E),c.copy(s).multiply(e).invert()}let l=new E(...n.forward).applyQuaternion(s).normalize(),d=new E(...n.right).applyQuaternion(s).normalize(),f=new u;return{diagnostic:{mesh:t.name,head:i.name,blueBytes:o,maxByteError:a,frameProvenance:n.frameProvenance},update(e){i.getWorldQuaternion(f),f.multiply(c),e.e021HeadForward.value.copy(l).applyQuaternion(f).normalize(),e.e021HeadRight.value.copy(d).applyQuaternion(f).normalize()}}}var we=Object.freeze({body:{shaders:[`miHoYo/Character/NapAvatarStandard`,`miHoYo/Character/NapAvatarStandardTransparent`],shader:`miHoYo/Character/NapAvatarStandard`,operation:`RG + shadow_body`},hair:{shader:`miHoYo/Character/NapAvatarStandard`,operation:`RG + shadow_body; highlights not implemented`},"face-sdf":{shader:`miHoYo/Character/NapAvatarStandardFace`,operation:`SDF + shadow_face`},eyes:{shader:`miHoYo/Character/NapAvatarStandardEye`,operation:`HoyoToon type 2 diffuse; GI not reconstructed`},special:{operation:`reserved; keep existing diffuse diagnostic`}});function Te(e){let t=we[e.family],n=t?.shaders??(t?.shader?[t.shader]:[]);if(!t||n.length&&!n.includes(e.source?.shader))throw Error(`Material family/source shader mismatch`);return t}var Ee=Object.freeze({faceRevision:!0,facePalette:!0,eyes:!0,outputTransform:!0,nose:!0,faceHighlight:!0});function De(e={}){let t={...Ee,...e};for(let e of Object.keys(Ee))if(typeof t[e]!=`boolean`)throw Error(`E2.1b invalid `+e);return t}function Oe(e={}){let t={labFaceRevision:{value:1},labFacePalette:{value:1},labEyes:{value:1},labOutputTransform:{value:1},labNose:{value:1},labFaceHighlight:{value:1}};return ke(t,e),t}function ke(e,t={}){let n=De(t);e.labNose.value=+n.nose,e.labFaceHighlight.value=+n.faceHighlight,e.labFaceRevision.value=+n.faceRevision,e.labFacePalette.value=+n.facePalette,e.labEyes.value=+n.eyes,e.labOutputTransform.value=+n.outputTransform}function Y(e,t,n){if(!e.fragmentShader.includes(t))throw Error(`E2.1b incompatible family shader anchor`);e.fragmentShader=e.fragmentShader.replace(t,n)}function Ae(e,t,n){if(![`face-sdf`,`eyes`].includes(n))throw Error(`E2.1b unsupported facial family`);Object.assign(e.uniforms,t),Y(e,`#include <common>`,`#include <common>
    uniform float labNose;
    uniform float labFaceHighlight;
    uniform float labFaceRevision;
    uniform float labFacePalette;
    uniform float labEyes;
    uniform float labOutputTransform;`),n===`face-sdf`?(Y(e,`float e021R=e021FaceRegion>=0.8?0.9:(e021FaceRegion>=0.6?0.7:0.5);`,`float e021R=labFacePalette>0.5?1.0:(e021FaceRegion>=0.8?0.9:(e021FaceRegion>=0.6?0.7:0.5));`),Y(e,`int e021Id=e021R`,`if(labFaceRevision>0.5){
      // SDF off isolates Diffuse, never reintroduces geometric Lambert lighting.
      outgoingLight=diffuseColor.rgb;
      if(e021A.x>0.5&&e021FaceEnabled>0.5)outgoingLight=clamp(diffuseColor.rgb*e021Result.rgb,0.0,1.0);
    }
    int e021Id=e021R`)):Y(e,`#include <opaque_fragment>`,`if(labEyes>0.5){`+(e.fragmentShader.includes(`vec4 e021FaceRamp(`)?`if(e021A.x>0.5)outgoingLight=clamp(diffuseColor.rgb*e021Result.rgb,0.0,1.0);else `:``)+`outgoingLight=diffuseColor.rgb;}
#include <opaque_fragment>`),Y(e,`#include <tonemapping_fragment>`,`if(labOutputTransform>0.5){
#include <tonemapping_fragment>
}`)}var je=Object.freeze({matcap:!0,highlights:!0,hair:!0,clothing:!0,matcapSRGB:!0,flipV:!1,discreteIds:!1,uvMatcaps:!1,diagnostic:`none`});function Me(e={}){let t={...je,...e};for(let e of[`matcap`,`highlights`,`hair`,`clothing`,`matcapSRGB`,`flipV`,`discreteIds`,`uvMatcaps`])if(typeof t[e]!=`boolean`)throw Error(`E3 invalid `+e);if(![`none`,`region`,`mask`,`map`,`matcap`,`highlight`,`specmask`,`uv`].includes(t.diagnostic))throw Error(`E3 invalid diagnostic`);return t}var Ne=Object.assign(new _(new Uint8Array([0,0,0,255]),1,1),{needsUpdate:!0});function Pe(e,t={}){return!!(e.capEnabled||t.uvMatcaps&&e.uvCapEnabled)}function Fe(e,t,n,r,i,a){let o=n.find(Boolean)??Ne;if(!a||!Number.isInteger(a.width)||!Number.isInteger(a.height)||a.width<1||a.height<1)throw Error(`E3 invalid region map size`);t.updateMatrix();let s={e03Amap:{value:t},e03AUVTransform:{value:new D().copy(t.matrix)},e03RegionMapSize:{value:new C(a.width,a.height)},e03DiscreteIds:{value:0},e03Flags:{value:new y},e03Enabled:{value:1},e03Scopes:{value:new E(1,1,0)},e03RegionFamily:{value:(e.regionFamilies??[,,,,,].fill(r)).map(e=>+(e===`hair`))},e03Diagnostic:{value:0},e03Metallic:{value:e.metallic},e03SpecIntensity:{value:e.specIntensity},e03SkinId:{value:e.skinId},e03Crystal:{value:+!!e.crystal},e03UseMatCapMask:{value:e.useMatCapMask===!1?0:1},e03TintAlpha:{value:e.regions.map(e=>Number.isFinite(e.tintAlpha)?e.tintAlpha:1)},e03Tint:{value:e.regions.map(e=>new E(...e.tint))},e03SpecColor:{value:e.regions.map(e=>new E(...e.specColor))},e03Blend:{value:e.regions.map(t=>new y(t.blend,t.colorBurst,t.alphaBurst,+!!(t.capEnabled&&e.enabled)))},e03Shape:{value:e.regions.map(e=>new y(e.shape,e.softness,e.range,0))}};return s.e03Speed={value:e.regions.map(t=>new C(...e.transcribed?t.speed??[0,0]:[0,0]))},s.e03Refract={value:e.regions.map(e=>new y(+!!e.refractEnabled,e.refractMapping?.depth??0,0,0))},s.e03RefractParam={value:e.regions.map(e=>new y(...e.refractMapping?[...e.refractMapping.scale,...e.refractMapping.offset]:[0,0,0,0]))},s.e03UV0Flip={value:+!!e.uv0FlipV},s.e03Time={get value(){return(globalThis.performance?.now?.()??0)/1e3},set value(e){}},s.e03UVMatcaps={value:0},s.e03UVTransforms={value:e.regions.map(t=>new y(t.refractMapping?.depth??1,...t.refractMapping?.offset??[0,0],+!!(t.uvCapEnabled&&e.enabled)))},n.forEach((e,t)=>s[`e03Map`+t]={value:e??o}),Ie(s,i,r),s}function Ie(e,t,n){let r=Me(t);e.e03Flags.value.set(+r.matcap,+r.highlights,+r.matcapSRGB,+r.flipV),e.e03Enabled.value=+(r.hair||r.clothing),e.e03Scopes.value.set(+r.hair,+r.clothing,0),e.e03DiscreteIds.value=+r.discreteIds,e.e03Diagnostic.value=[`none`,`region`,`mask`,`map`,`matcap`,`highlight`,`specmask`,`uv`].indexOf(r.diagnostic),e.e03UVMatcaps.value=+r.uvMatcaps}var Le=`
uniform sampler2D e03Amap,e03Map0,e03Map1,e03Map2,e03Map3,e03Map4;
uniform mat3 e03AUVTransform;
uniform vec2 e03RegionMapSize;
uniform vec4 e03Flags,e03Blend[5],e03Shape[5];
uniform vec4 e03UVTransforms[5];
uniform float e03UVMatcaps;
uniform vec2 e03Speed[5];
uniform float e03Time,e03UV0Flip;
uniform vec4 e03Refract[5],e03RefractParam[5];
uniform vec3 e03Tint[5],e03SpecColor[5];
uniform vec3 e03Scopes;
uniform float e03RegionFamily[5];
uniform float e03Enabled,e03Diagnostic,e03Metallic,e03SpecIntensity,e03SkinId,e03DiscreteIds;
uniform float e03Crystal,e03UseMatCapMask,e03TintAlpha[5];
// Specular scaled as the original pass (docs/layers-transcribed-20261112.md):
// spec · (mask · _SpecIntensity) · _SpecularColor · F0 (lines 534–587).
// Opt-in texel-centre snapping for region/ID reads only. Continuous masks,
// gradients, normals and colours keep the original linear filter.
vec2 e03SnapRegionUV(vec2 uv){return (floor(uv*e03RegionMapSize)+vec2(0.5))/e03RegionMapSize;}
vec3 e03Decode(vec3 c){return vec3(c.r<=0.04045?c.r/12.92:pow((c.r+0.055)/1.055,2.4),c.g<=0.04045?c.g/12.92:pow((c.g+0.055)/1.055,2.4),c.b<=0.04045?c.b/12.92:pow((c.b+0.055)/1.055,2.4));}
vec3 e03ParameterColor(vec3 c){return e021B.w>0.5?e03Decode(c):c;}
vec3 e03HdrColor(vec3 c){return max(c.r,max(c.g,c.b))>1.0?c:e03ParameterColor(c);}
// The region id varies per pixel, so these fetches run in non-uniform control flow where implicit-LOD derivatives
// are undefined: quads on region borders picked arbitrary mips that changed with every camera/pose move (sparkle on
// high-contrast MatCaps such as Eff_Matcap_Evelyn_WhiskeyGlass_1). Gradients come from uniform flow (docs/matcap-region-gradients-20261121.md).
vec4 e03Sample(int id,vec2 uv,vec2 gx,vec2 gy){
  if(id==1)return textureGrad(e03Map1,uv,gx,gy);
  if(id==2)return textureGrad(e03Map2,uv,gx,gy);
  if(id==3)return textureGrad(e03Map3,uv,gx,gy);
  if(id==4)return textureGrad(e03Map4,uv,gx,gy);
  return textureGrad(e03Map0,uv,gx,gy);
}
vec3 e03MatcapScaled(vec3 base,vec4 texel,float mask,int id,float texBoost){
  vec3 rgb=(e03Flags.z>0.5?e03Decode(texel.rgb):texel.rgb)*texBoost;
  vec3 tinted=rgb*e03HdrColor(e03Tint[id]);
  float alpha=clamp(texel.a*mask,0.0,1.0),burst=e03Blend[id].y,a=clamp(e03Blend[id].z*alpha,0.0,1.0);
  if(e03Blend[id].x<0.5)return a*(tinted*burst-base)+base;
  if(e03Blend[id].x<1.5)return tinted*a*burst+base;
  // Upstream overlay uses raw MatCap alpha*mask, NOT alphaBurst, and a doubled tint term.
  vec3 blend=mix(vec3(0.5),clamp(tinted*burst+tinted,0.0,1.0),alpha);
  return mix(2.0*base*blend,1.0-2.0*(1.0-base)*(1.0-blend),step(vec3(0.5),base));
}
vec3 e03Matcap(vec3 base,vec4 texel,float mask,int id){return e03MatcapScaled(base,texel,mask,id,1.0);}
vec3 e03SpecularFresnel(vec3 N,vec3 L,vec3 base,vec3 M){
  if(e03Crystal>0.5)return mix(vec3(0.0399999991),base,clamp(e03Metallic*M.g,0.0,1.0));
  float nl=dot(N,L),ns=clamp(nl,0.0,1.0);
  float luminance=dot(base,vec3(0.289999992,0.600000024,0.109999999))*0.287499994+1.4375;
  float lightWeight=((nl*0.5+0.5)-ns)*0.5+ns;
  float power=lightWeight*(1.0-luminance)+luminance;
  float peak=max(base.r,max(base.g,base.b));vec3 contrast=pow(peak>1.0?base/peak:base,vec3(power));
  vec3 halfway=(contrast-base)*0.5+base;
  vec3 someColor=ns*(contrast-halfway)+halfway;
  vec3 fresnel=(e03Metallic*M.g)*(someColor-vec3(0.0399999991))+vec3(0.0399999991);
  return fresnel;
}
vec3 e03ShapedHighlight(vec3 N,vec3 V,vec3 L,vec3 base,vec3 M,float shad,int id){
  if(e03Shape[id].x<0.5)return vec3(0.0);
  vec3 sum=V+L;float len=length(sum);if(len==0.0)return vec3(0.0);vec3 H=sum/len;
  float nl=dot(N,L);vec3 fresnel=e03SpecularFresnel(N,L,base,M);
  float shade=clamp(shad*1.5+0.5,0.0,1.0);
  float threshold=1.0-clamp(dot(N,H)*0.5+0.5,0.0,1.0)*shade;
  float softness=e03Shape[id].y;
  float mask=softness>0.0?clamp((M.b-threshold)/softness,0.0,1.0):step(threshold,M.b);
  float range=e03Shape[id].z;
  float lh=clamp(dot(L,H)*range*0.75+0.25,0.0,1.0);float denom=max(0.100000001,lh*lh);
  float angular=100.0*min(1.0,0.166663334/denom)*clamp(range*nl*0.75+0.25,0.0,1.0);
  return angular*e03SpecIntensity*mask*e03HdrColor(e03SpecColor[id])*fresnel;
}
`;function Re(e,t){let n=`#include <opaque_fragment>`;if(!e.fragmentShader.includes(`vec4 e021Result=`)||!e.fragmentShader.includes(n))throw Error(`E3 incompatible base shader`);if(Object.assign(e.uniforms,t),!e.fragmentShader.includes(`vec3 e021Decode(vec3 c) {`))throw Error(`E3 missing shared color uniforms`);e.fragmentShader=e.fragmentShader.replace(`vec3 e021Decode(vec3 c) {`,Le+`
vec3 e021Decode(vec3 c) {`),e.fragmentShader=e.fragmentShader.replace(n,`
    vec2 e03MUV=(e021UVTransform*vec3(e021UV0,1.0)).xy;
    vec3 e03M=texture2D(e021RegionMap,e03MUV).rgb;
    // Region/ID reads may snap to the texel centre; the continuous M/B highlight
    // mask, M/G metallic and A/B masks always use the linear sample below.
    vec3 e03MId=e03DiscreteIds>0.5?texture2D(e021RegionMap,e03SnapRegionUV(e03MUV)).rgb:e03M;
    vec4 e03ASample=texture2D(e03Amap,(e03AUVTransform*vec3(e021UV0,1.0)).xy);
    vec3 e03A=e03ASample.rgb;
    int e03ID=int(max(4.0-floor(5.0*e03MId.r),0.0));
    vec3 e03V=normalize(vViewPosition);
    vec2 e03TanV=vec2(0.0);
    #ifdef USE_NORMALMAP_TANGENTSPACE
      if(e03Crystal>0.5){
        vec3 e03Tan3=vec3(dot(tbn[0],e03V),dot(e03UV0Flip>0.5?-tbn[1]:tbn[1],e03V),dot(normalize(nonPerturbedNormal),e03V));
        float e03TanL=length(e03Tan3);
        if(e03TanL>0.0)e03TanV=e03Tan3.xy/e03TanL;
      }
    #endif
    float e03NdotV=max(dot(e03V,normal),0.01);
    // Three normal is already camera/view-space, equivalent to HoyoToon row normal * inverse-view rotation.
    vec2 e03UV=normal.xy*0.5+0.5;
    if(e03Refract[e03ID].x>0.5){vec2 e03U0=vec2(e021UV0.x,e03UV0Flip>0.5?1.0-e021UV0.y:e021UV0.y);if(e03Crystal>0.5){e03UV=e03U0*e03RefractParam[e03ID].xy+e03RefractParam[e03ID].zw-(e03ASample.a*e03Refract[e03ID].y*(e03NdotV*e03NdotV))*e03TanV;}else{e03UV=(e03ASample.a*e03Refract[e03ID].y)*e03UV+e03U0*e03RefractParam[e03ID].xy+e03RefractParam[e03ID].zw;}}
    e03UV+=e03Time*e03Speed[e03ID];
    if(e03Flags.w>0.5)e03UV.y=1.0-e03UV.y;
    bool e03UVCap=e03UVMatcaps>0.5&&e03UVTransforms[e03ID].w>0.5;
    if(e03UVCap)e03UV=e03UVTransforms[e03ID].x*e03UV+e03UVTransforms[e03ID].yz;
    bool e03HasCap=e03Blend[e03ID].w>0.5||e03UVCap;
    vec2 e03UVdx=dFdx(e03UV),e03UVdy=dFdy(e03UV);
    vec4 e03Texel=e03HasCap?e03Sample(e03ID,e03UV,e03UVdx,e03UVdy):vec4(0.0);
    float e03CapBoost=(e03Crystal>0.5&&e03Refract[e03ID].x>0.5)?4.0:1.0;
    if(e03Crystal>0.5&&e03Refract[e03ID].x>0.5)e03Texel.a=1.0;
    float e03CapMask=(e03Crystal>0.5&&e03UseMatCapMask<0.5)?1.0:e03A.b;
    vec3 e03CrystalRamp=e021A.x>0.5?e021Result.rgb:vec3(1.0);
    vec3 e03Before=outgoingLight;
    vec3 e03After=e03Before;
    vec3 e03Base=e021A.x>0.5?clamp(diffuseColor.rgb*e021Result.rgb,0.0,1.0):diffuseColor.rgb;
    if(e03Crystal>0.5){
      float e03Metal=clamp(e03Metallic*e03M.g,0.0,1.0);
      vec3 e03CrystalAlbedo=diffuseColor.rgb;
      if(e03HasCap){
        e03CrystalAlbedo=e03MatcapScaled(diffuseColor.rgb,e03Texel,e03CapMask,e03ID,e03CapBoost);
        e03CrystalAlbedo*=e03TintAlpha[e03ID]>0.0?pow(e03NdotV,10.0*e03TintAlpha[e03ID]):1.0;
      }
      e03Base=e03CrystalAlbedo;
      e03After=(0.96-0.96*e03Metal)*e03CrystalAlbedo*e03CrystalRamp;
    }else if(e03HasCap){
      e03After=e03Matcap(e03Before,e03Texel,e03A.b,e03ID);
    }
    int e03SpecID=e03MId.r>=0.8?0:(e03MId.r>=0.6?1:(e03MId.r>=0.4?2:(e03MId.r>=0.2?3:4)));
    vec3 e03Highlight=e03ShapedHighlight(normal,e03V,normalize((viewMatrix*vec4(e02Light,0.0)).xyz),e03Base,e03M,e021Result.w,e03SpecID);
    if(e03Crystal>0.5)e03Highlight*=e03CrystalRamp;
    // The original pass has no skin attenuation of the specular (docs/output-stage-transcribed-20261112.md).
    if(e03Enabled>0.5&&e021Diagnostic<0.5){
      if(e03Flags.x>0.5&&(e03RegionFamily[e03ID]>0.5?e03Scopes.x:e03Scopes.y)>0.5)outgoingLight=e03After;
      else if(e03Crystal>0.5&&(e03RegionFamily[e03ID]>0.5?e03Scopes.x:e03Scopes.y)>0.5)outgoingLight=(0.96-0.96*clamp(e03Metallic*e03M.g,0.0,1.0))*diffuseColor.rgb*e03CrystalRamp;
      if(e03Flags.y>0.5&&(e03RegionFamily[e03SpecID]>0.5?e03Scopes.x:e03Scopes.y)>0.5)outgoingLight+=e03Highlight;
      if(e03Diagnostic==1.0)outgoingLight=vec3(float(e03ID)/4.0);
      if(e03Diagnostic==2.0)outgoingLight=vec3(e03CapMask);
      if(e03Diagnostic==3.0)outgoingLight=(e03Flags.z>0.5?e03Decode(e03Texel.rgb):e03Texel.rgb)*e03CapBoost;
      if(e03Diagnostic==4.0)outgoingLight=abs(e03After-e03Before);
      if(e03Diagnostic==5.0)outgoingLight=e03Highlight;
      if(e03Diagnostic==6.0)outgoingLight=vec3(e03M.b);
      if(e03Diagnostic==7.0)outgoingLight=vec3(e03UV,0.0);
    }
    ${n}`)}var ze=Object.freeze([`none`,`normal`,`geometric`,`tangent`,`bitangent`,`frame`,`diffuse`,`family`]),Be=Object.freeze({compensateUV:!0,sourceScaleOrder:!0,preserveEyeFilter:!0,output:`legacy`,diagnostic:`none`});function Ve(e={}){let t={...Be,...e};for(let e of[`compensateUV`,`sourceScaleOrder`,`preserveEyeFilter`])if(typeof t[e]!=`boolean`)throw Error(`E3.5 invalid `+e);if(![`legacy`,`exposure`,`bypass`].includes(t.output)||!ze.includes(t.diagnostic))throw Error(`E3.5 invalid diagnostic/output`);return t}function He(e,t){if(e?.modelSha256!==t.model.sha256||JSON.stringify(e.bindings)!==JSON.stringify(t.bindings.map(e=>e.id))||JSON.stringify(e.normalTransport?.uv0SourceToGLB)!==`[1,0,0,-1,0,1]`)throw Error(`E3.5 missing/incompatible verified normal transport contract`);return-1}function Ue(e,t){if(![1,-1].includes(e)||!Number.isFinite(t))throw Error(`E3.5 invalid inherited normal scale`);return t===0?1:e*Math.sign(t)}function We(e={}){let t={e035Flags:{value:new y},e035Diagnostic:{value:0}};return Ge(t,e),t}function Ge(e,t={}){let n=Ve(t);e.e035Flags.value.set(+n.sourceScaleOrder,+n.preserveEyeFilter,[`legacy`,`exposure`,`bypass`].indexOf(n.output),+n.compensateUV),e.e035Diagnostic.value=ze.indexOf(n.diagnostic)}var X=(e,t,n)=>{if(!e.fragmentShader.includes(t))throw Error(`E3.5 incompatible shader anchor: `+t);e.fragmentShader=e.fragmentShader.replace(t,n)};function Ke(e,t,{hasNormal:n=!1,family:r=`special`,eyeFilter:i=!1,normalYSign:a=1}={}){if(Object.assign(e.uniforms,t),X(e,`#include <common>`,`#include <common>
uniform vec4 e035Flags;
uniform float e035Diagnostic;`),n){if(![1,-1].includes(a))throw Error(`E3.5 invalid normal transport sign`);X(e,`mapN.xy *= normalScale;`,`if(e035Flags.w>0.5)mapN.y*=${a.toFixed(1)};\nmapN.xy *= normalScale;`),X(e,`mapN.xy *= normalScale;`,`mapN.xy *= normalScale;
      if(e035Flags.x>0.5)mapN.z=sqrt(max(0.0,1.0-dot(mapN.xy,mapN.xy)));`)}let o=r===`eyes`&&i?`if(e035Flags.y>0.5)outgoingLight*=1.0-zzzEyeShadowMask*zzzEyeShadowNeutrality;`:``,s=n?`
    if(e035Diagnostic==3.0)outgoingLight=normalize(tbn[0])*0.5+0.5;
    if(e035Diagnostic==4.0)outgoingLight=normalize(tbn[1])*0.5+0.5;
    if(e035Diagnostic==5.0)outgoingLight=vec3(length(tbn[0]),length(tbn[1]),abs(dot(normalize(tbn[0]),normalize(tbn[1]))));`:`if(e035Diagnostic>=3.0&&e035Diagnostic<=5.0)outgoingLight=vec3(1.0,0.0,1.0);`,c={body:`0.2,0.7,1.0`,hair:`0.7,0.3,1.0`,"face-sdf":`1.0,0.65,0.2`,eyes:`0.2,1.0,0.4`,special:`1.0,0.2,0.5`};X(e,`#include <opaque_fragment>`,`${o}
    if(e035Diagnostic==1.0)outgoingLight=normal*0.5+0.5;
    if(e035Diagnostic==2.0)outgoingLight=nonPerturbedNormal*0.5+0.5;
    ${s}
    if(e035Diagnostic==6.0)outgoingLight=diffuseColor.rgb;
    if(e035Diagnostic==7.0)outgoingLight=vec3(${c[r]??c.special});
    #include <opaque_fragment>`),X(e,`#include <tonemapping_fragment>`,`if(e035Diagnostic<0.5){
      if(e035Flags.z<0.5){
        #include <tonemapping_fragment>
      }else if(e035Flags.z<1.5){
        #if defined(TONE_MAPPING)
          gl_FragColor.rgb*=toneMappingExposure;
        #endif
      }
    }`),X(e,`#include <colorspace_fragment>`,`if(e035Diagnostic<0.5||e035Diagnostic==6.0){
      #include <colorspace_fragment>
    }`)}function qe(e={}){let t={original:!0,diagnostic:`none`,...e};if(typeof t.original!=`boolean`||![`none`,`coverage`,`angle`].includes(t.diagnostic))throw Error(`E3.6 invalid selection`);return t}function Je(e,t){if(e?.version!==1||e.model?.sha256!==t.model.sha256||!/^\/__material_renderer\/[\w-]+\.bin$/.test(e.resource?.url)||!Number.isInteger(e.resource?.bytes)||!e.bindings?.length)throw Error(`E3.6 invalid source contract`);for(let n of e.bindings){let r=t.bindings.find(e=>e.id===n.id);if(!r||r.runtimeMesh!==n.runtimeMesh||r.materialName!==n.materialName||n.normalScaleY!==-1||n.cornerCount%3||n.tangentOffset%4||n.validityOffset!==n.tangentOffset+n.cornerCount*16||n.validityOffset+n.cornerCount>e.resource.bytes)throw Error(`E3.6 invalid binding/transport`)}return e}async function Ye(e){let t=await fetch(e.resource.url,{cache:`no-store`});if(!t.ok)throw Error(`E3.6 sidecar HTTP `+t.status);let n=new Uint8Array(await t.arrayBuffer());if(n.length!==e.resource.bytes)throw Error(`E3.6 sidecar size mismatch`);return await P(n,e.resource.sha256),n}async function Xe(e,t){if(e.attributes.position.count!==t.originalVertices||e.index?.count!==t.cornerCount||e.attributes.tangent)throw Error(`E3.6 runtime topology mismatch`);if(Object.values(e.morphAttributes).some(e=>e.length))throw Error(`E3.6 primitive requires original morph tangents before activation`);for(let[n,r]of Object.entries(t.fingerprints)){let t=e.attributes[n];if(!t||t.count!==r.count||t.itemSize!==r.itemSize||t.normalized!==r.normalized)throw Error(`E3.6 attribute mismatch `+n);await P(new Uint8Array(t.array.buffer,t.array.byteOffset,t.array.byteLength),r.sha256)}let n=e.index;await P(new Uint8Array(n.array.buffer,n.array.byteOffset,n.array.byteLength),t.indexSha256)}function Ze(t,n,r){let i=t.toNonIndexed(),a=n.cornerCount,o=new Float32Array(a*4),s=new Float32Array(a),c=new DataView(r.buffer,r.byteOffset,r.byteLength);try{for(let e=0;e<a;e++){let t=r[n.validityOffset+e];if(t!==0&&t!==1)throw Error(`E3.6 invalid coverage byte`);if(s[e]=t,t){for(let t=0;t<4;t++)o[e*4+t]=c.getFloat32(n.tangentOffset+(e*4+t)*4,!0);let t=Array.from(o.slice(e*4,e*4+4));if(!t.every(Number.isFinite)||Math.abs(Math.hypot(...t.slice(0,3))-1)>1e-4||![-1,1].includes(t[3]))throw Error(`E3.6 invalid original tangent`)}else{let t=new E().fromBufferAttribute(i.attributes.normal,e).normalize(),n=Math.abs(t.x)<.8?new E(1,0,0):new E(0,1,0),r=new E().crossVectors(n,t).normalize();o.set([...r.toArray(),1],e*4)}}for(let e=0;e<a;e+=3)if(s[e]!==s[e+1]||s[e]!==s[e+2])throw Error(`E3.6 coverage must be constant per triangle`);return i.name=t.name,i.userData=structuredClone(t.userData),i.setDrawRange(t.drawRange.start,t.drawRange.count),i.boundingBox=t.boundingBox?.clone()??null,i.boundingSphere=t.boundingSphere?.clone()??null,i.setAttribute(`tangent`,new e(o,4)),i.setAttribute(`e036Valid`,new e(s,1)),i}catch(e){throw i.dispose(),e}}function Qe(e){let t={e036Original:{value:1},e036Diagnostic:{value:0}};return $e(t,e),t}function $e(e,t){let n=qe(t);e.e036Original.value=+n.original,e.e036Diagnostic.value=[`none`,`coverage`,`angle`].indexOf(n.diagnostic)}function et(e,t){Object.assign(e.uniforms,t);for(let[t,n]of[[`vertexShader`,`#include <common>`],[`vertexShader`,`#include <begin_vertex>`],[`fragmentShader`,`#include <common>`],[`fragmentShader`,`#include <normal_fragment_begin>`],[`fragmentShader`,`normal = normalize( tbn * mapN );`],[`fragmentShader`,`#include <opaque_fragment>`]])if(!e[t].includes(n))throw Error(`E3.6 incompatible Three anchor `+n);let n=j.normalmap_pars_fragment,r=n.indexOf(`mat3 getTangentFrame(`),i=n.indexOf(`
	}`,r);if(r<0||i<0)throw Error(`E3.6 unsupported derivative function`);let a=n.slice(r,i+4).replace(`getTangentFrame`,`e036DerivativeFrame`);e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
attribute float e036Valid;
varying float e036Coverage;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
e036Coverage=e036Valid;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform float e036Original,e036Diagnostic;
varying float e036Coverage;
`+a).replace(`#include <normal_fragment_begin>`,`#include <normal_fragment_begin>
      mat3 e036Derived=e036DerivativeFrame(-vViewPosition,normal,vNormalMapUv);
      #ifdef DOUBLE_SIDED
        e036Derived[0]*=faceDirection;e036Derived[1]*=faceDirection;
      #endif
      // Native vertex path skins the recovered tangent. Keep its XY directions
      // for backfaces; only N reverses, like the source HoyoToon overload.
      mat3 e036Provided=mat3(normalize(vTangent),normalize(vBitangent),normal);
      tbn=(e036Original>0.5&&e036Coverage>0.5)?e036Provided:e036Derived;
    `).replace(`normal = normalize( tbn * mapN );`,`normal = normalize( tbn * mapN );
      float e036Angle=0.0;
      if(e036Coverage>0.5)e036Angle=acos(clamp(dot(normalize(e036Provided*mapN),normalize(e036Derived*mapN)),-1.0,1.0))/3.141592653589793;
    `).replace(`#include <opaque_fragment>`,`if(e036Diagnostic>0.5&&e036Diagnostic<1.5)outgoingLight=e036Coverage>0.5?vec3(0.0,1.0,0.0):vec3(1.0,0.0,0.0);
      if(e036Diagnostic>1.5)outgoingLight=e036Coverage>0.5?vec3(e036Angle):vec3(1.0,0.0,0.0);
      #include <opaque_fragment>`);for(let t of[`#include <tonemapping_fragment>`,`#include <colorspace_fragment>`])e.fragmentShader=e.fragmentShader.replace(t,`if(e036Diagnostic<0.5){\n${t}\n}`)}var tt=Object.freeze({enabled:!0,diagnostic:`none`}),nt=[`none`,`wide`,`shape`,`both`,`regions`,`specmask`,`smoothness`,`metallic`];function rt(e={}){let t={...tt,...e};if(typeof t.enabled!=`boolean`||!nt.includes(t.diagnostic))throw Error(`E3.7 invalid selection`);return t}function it(e,t){if(!e?.regions||e.regions.length!==5)throw Error(`E3.7 requires verified original parameters`);let n={e037Enabled:{value:1},e037Diagnostic:{value:0},e037Glossiness:{value:e.glossiness??0},e037Region:{value:e.regions.map(e=>e.compatible?new E(e.shape,e.toon,e.modelSize):new E(2,0,0))}};return at(n,t),n}function at(e,t){let n=rt(t);e.e037Enabled.value=+n.enabled,e.e037Diagnostic.value=nt.indexOf(n.diagnostic)}var ot=`
uniform float e037Enabled,e037Diagnostic,e037Glossiness;
uniform vec3 e037Region[5];
vec3 e037WideHighlight(vec3 N,vec3 V,vec3 L,vec3 base,vec3 M,vec3 A,int id){
  if(e037Region[id].x>0.5)return vec3(0.0);
  vec3 sum=V+L;float len=length(sum);if(len==0.0)return vec3(0.0);vec3 H=sum/len;
  float roughness=1.0-A.g*e037Glossiness;roughness*=roughness;
  float r4=roughness*roughness;
  float nl=clamp(e03Shape[id].z*dot(N,L)*0.75+0.25,0.0,1.0);
  float nh=clamp(e03Shape[id].z*dot(N,H)*0.75+0.25,0.0,1.0);
  float lh=clamp(e03Shape[id].z*dot(L,H)*0.75+0.25,0.0,1.0);
  float d=nh*nh*(r4-1.0)+1.00001001;
  float denom=d*d*max(0.100000001,lh*lh)*(roughness*4.0+2.0);
  float broad=clamp(-A.g*e037Glossiness+r4/denom,0.0,1.0)*nl/max(9.99999975e-06,roughness);
  broad=100.0*clamp(10.0*(e037Region[id].z*e037Region[id].y*broad),0.0,1.0);
  if(e03Crystal>0.5)return broad*(e03SpecIntensity*M.b)*e03HdrColor(e03SpecColor[id])*e03SpecularFresnel(N,L,base,M);
  return broad*(e03SpecIntensity*M.b)*e03ParameterColor(e03SpecColor[id])*e03SpecularFresnel(N,L,base,M);
}
`;function st(e,t,{reflections:n=!1}={}){Object.assign(e.uniforms,t);let r=`#include <opaque_fragment>`;if(!e.fragmentShader.includes(r))throw Error(`E3.7 missing output anchor`);if(n){if(!e.fragmentShader.includes(`vec3 e03SpecularFresnel(`)||!e.fragmentShader.includes(`vec3 e03Highlight=`))throw Error(`E3.7 requires shared E3 specular`);e.fragmentShader=e.fragmentShader.replace(`vec3 e03SpecularFresnel(`,ot+`
vec3 e03SpecularFresnel(`),e.fragmentShader=e.fragmentShader.replace(ot,`vec3 e03SpecularFresnel(vec3 N,vec3 L,vec3 base,vec3 M);
`+ot),e.fragmentShader=e.fragmentShader.replace(r,`
    vec3 e037Wide=e037WideHighlight(normal,normalize(vViewPosition),normalize((viewMatrix*vec4(e02Light,0.0)).xyz),e03Base,e03M,e03A,e03SpecID);
    if(e03Crystal>0.5)e037Wide*=e03CrystalRamp;
    float e037Scope=e03RegionFamily[e03SpecID]>0.5?e03Scopes.x:e03Scopes.y;
    bool e037Active=e03Enabled>0.5&&e021Diagnostic<0.5&&e037Scope>0.5;
    if(e037Active&&e037Enabled>0.5&&e03Diagnostic<0.5)outgoingLight+=e037Wide;
    if(e037Diagnostic>0.5){
      outgoingLight=vec3(0.0);
      if(e037Active){
        if(e037Diagnostic==1.0)outgoingLight=e037Enabled>0.5?e037Wide:vec3(0.0);
        if(e037Diagnostic==2.0)outgoingLight=e03Flags.y>0.5?e03Highlight:vec3(0.0);
        if(e037Diagnostic==3.0)outgoingLight=(e037Enabled>0.5?e037Wide:vec3(0.0))+(e03Flags.y>0.5?e03Highlight:vec3(0.0));
        if(e037Diagnostic==4.0)outgoingLight=e037Region[e03SpecID].x<0.5?vec3(0.0,1.0,0.0):(e037Region[e03SpecID].x<1.5?vec3(0.3,0.2,1.0):vec3(0.0));
        if(e037Diagnostic==5.0)outgoingLight=vec3(e03M.b);
        if(e037Diagnostic==6.0)outgoingLight=vec3(e03A.g);
        if(e037Diagnostic==7.0)outgoingLight=vec3(e03M.g);
      }
    }
    ${r}`)}else e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform float e037Diagnostic;`).replace(r,`if(e037Diagnostic>0.5)outgoingLight=vec3(0.0);\n${r}`);for(let t of[`#include <tonemapping_fragment>`,`#include <colorspace_fragment>`])e.fragmentShader=e.fragmentShader.replace(t,`if(e037Diagnostic<3.5){\n${t}\n}`)}var ct=Object.freeze({enabled:!1,preset:`neutral`,giIntensity:0,diagnostic:`none`}),lt=[`neutral`,`zero`,`constant`,`directional`,`quadratic`,`hdr`],ut=[`none`,`ambient`,`gi`,`light`,`probe`,`normal`];function dt(e={}){let t={...ct,...e};if(typeof t.enabled!=`boolean`||!lt.includes(t.preset)||!ut.includes(t.diagnostic)||!Number.isFinite(t.giIntensity)||t.giIntensity<0||t.giIntensity>4)throw Error(`E3.8 invalid diagnostic environment`);if(t.keyColor!==void 0&&(!Array.isArray(t.keyColor)||t.keyColor.length!==3||!t.keyColor.every(e=>Number.isFinite(e)&&e>=0)))throw Error(`E3.8 invalid linear key color`);return t}function ft(e){if(e?.space!==`viewer-world-linear`||!Array.isArray(e.A)||e.A.length!==3||!Array.isArray(e.B)||e.B.length!==3||!Array.isArray(e.C)||e.C.length!==3||[...e.A,...e.B].some(e=>!Array.isArray(e)||e.length!==4||!e.every(Number.isFinite))||!e.C.every(Number.isFinite))throw Error(`E3.8 requires explicit packed RGB SH, linear viewer world space`);return e}function pt(e){ft(e);let t=new v;for(let n=0;n<3;n++){let r=e.A[n],i=e.B[n],a=i[2]/.743125;[(r[3]+.247708*a)/.886227,r[1]/1.023328,r[2]/1.023328,r[0]/1.023328,i[0]/.858086,i[1]/.858086,a,i[3]/.858086,e.C[n]/.429043].forEach((e,r)=>t.coefficients[r].setComponent(n,e))}return new i(t,1)}function mt(e={}){let t=dt(e),n={space:`viewer-world-linear`,A:Array.from({length:3},()=>[0,0,0,0]),B:Array.from({length:3},()=>[0,0,0,0]),C:[0,0,0]};t.preset===`constant`&&n.A.forEach(e=>e[3]=.25),t.preset===`directional`&&n.A.forEach((e,t)=>{e[3]=.35,e[1]=[.2,.1,-.15][t]}),t.preset===`quadratic`&&(n.A.forEach((e,t)=>e[3]=[.3,.25,.2][t]),n.B[0][2]=.3,n.B[1][0]=.2,n.C[2]=-.15),t.preset===`hdr`&&(n.A.forEach((e,t)=>{e[3]=[1.5,.6,.25][t],e[0]=[-.8,.25,.15][t]}),n.B[2][2]=.5);let r=pt(n);return{provenance:`Synthetic diagnostic, not exported from ZZZ`,preset:t.preset,active:t.enabled&&t.preset!==`neutral`,packed:n,probe:r,keyColor:t.keyColor??[1,1,1],giIntensity:t.giIntensity}}function ht(e){let t={e038Apply:{value:0},e038Diagnostic:{value:0},e038GI:{value:0},e038Key:{value:new E},e038SH:{value:Array.from({length:9},()=>new E)}};return gt(t,e),t}function gt(e,t){let n=dt(t),r=mt(n);e.e038Apply.value=+r.active,e.e038Diagnostic.value=ut.indexOf(n.diagnostic),e.e038GI.value=r.giIntensity,e.e038Key.value.fromArray(r.keyColor),r.probe.sh.coefficients.forEach((t,n)=>e.e038SH.value[n].copy(t).multiplyScalar(r.probe.intensity))}var _t=`
uniform float e038Apply,e038GI,e038Diagnostic;
uniform vec3 e038Key,e038SH[9];
vec3 shGetIrradianceAt(in vec3 normal,in vec3 shCoefficients[9]);
void e038Terms(vec3 N,out vec3 ambient,out vec3 light,out vec3 probe,out vec3 gi){
  ambient=max(vec3(0.05),max(shGetIrradianceAt(vec3(0.0),e038SH),shGetIrradianceAt(vec3(0.0,-1.0,0.0),e038SH)));
  light=max(ambient,e038Key);
  probe=shGetIrradianceAt(N,e038SH);
  vec3 g=min(probe,vec3(1.0));
  float intensity=min(1.0,dot(g,vec3(0.299,0.587,0.114)));
  gi=g*intensity*e038GI*(1.0-smoothstep(0.0,1.0,intensity/2.0));
}
`;function vt(e,t){Object.assign(e.uniforms,t);let n=`outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;`,r=`outgoingLight=e021Composition>0.5?`,i=`#include <opaque_fragment>`;if(!e.fragmentShader.includes(n)||!e.fragmentShader.includes(r)||!e.fragmentShader.includes(`vec3 e037Wide=`))throw Error(`E3.8 incompatible E3.7 body composition`);e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
`+_t).replace(n,`outgoingLight = e038Apply>0.5?diffuseColor.rgb:(reflectedLight.directDiffuse + reflectedLight.indirectDiffuse);`).replace(r,`outgoingLight=(e038Apply>0.5||e021Composition>0.5)?`).replace(i,`
    vec3 e038Ambient,e038Light,e038Probe,e038Indirect;
    vec3 e038WorldNormal=transformNormalByInverseViewMatrix(normal,viewMatrix);
    e038Terms(e038WorldNormal,e038Ambient,e038Light,e038Probe,e038Indirect);
    // Base main branch: after MatCaps and both specular contributions. Existing
    // diagnostics remain diagnostics, not inputs into environmental lighting.
    if(e038Apply>0.5&&e021Diagnostic<0.5&&e03Diagnostic<0.5&&e037Diagnostic<0.5)outgoingLight=outgoingLight*e038Light+e038Indirect;
    if(e038Diagnostic==1.0)outgoingLight=e038Ambient;
    if(e038Diagnostic==2.0)outgoingLight=e038Indirect;
    if(e038Diagnostic==3.0)outgoingLight=e038Light;
    if(e038Diagnostic==4.0)outgoingLight=vec3(0.5)+0.125*e038Probe;
    if(e038Diagnostic==5.0)outgoingLight=e038WorldNormal*0.5+0.5;
    ${i}`);for(let t of[`#include <tonemapping_fragment>`,`#include <colorspace_fragment>`])e.fragmentShader=e.fragmentShader.replace(t,`if(e038Diagnostic<0.5||e038Diagnostic==2.0){\n${t}\n}`)}var yt=[`none`,`raw-mask`,`mask`,`contribution`,`regions`,`compatibility`];function bt(e={}){let t={primary:!1,diagnostic:`none`,...e};if(typeof t.primary!=`boolean`||!yt.includes(t.diagnostic))throw Error(`E3.9 invalid emission selection`);return t}function xt(e,t){let n=e.primary,r={e039Mode:{value:+!!e.transcribed},e039Flags:{value:new y(0,+n.ready,+!!n.enabled,+!!n.useMask)},e039Diagnostic:{value:0},e039Colors:{value:n.colors.map(e=>new E(...e??[0,0,0]))}};return St(r,t),r}function St(e,t){let n=bt(t);e.e039Flags.value.x=+n.primary,e.e039Diagnostic.value=yt.indexOf(n.diagnostic)}var Ct=`
uniform vec4 e039Flags;
// e039Mode 1 (generated contracts, docs/layers-transcribed-20261112.md): region from M.r and emission · albedo, as the
// original pass (blob 2700, lines 82 and 588–595). 0 keeps the approved HoyoToon reading (M.b, lit colour).
uniform float e039Mode;
uniform vec3 e039Colors[5];
uniform float e039Diagnostic;
int e039Region(float mb){return mb>=0.8?0:(mb>=0.6?1:(mb>=0.4?2:(mb>=0.2?3:4)));}
float e039Mask(float ab){
  if(ab<=0.02)return 0.0;
  float transformed=clamp(1.25*(ab-0.200000003),0.0,1.0);
  return e039Flags.y>0.5&&e039Flags.z>0.5?(e039Flags.w>0.5?transformed:ab):0.0;
}
// Generated contracts (e039Mode 1): filter the emission result, not the region id. Interpolating M.r across a region
// edge invents intermediate regions (Ben: ×91.6 colour on the decal borders, docs/layers-transcribed-20261112.md).
// HDR emission colours (a channel above 1, e.g. Ben 91.6) are linear: the sRGB decode turned 91.6 into ~45 000, so a
// 1/255 compression-noise mask became a white block. Colours within 0..1 keep the shared decode.
vec3 e039HdrColor(vec3 c){return max(c.r,max(c.g,c.b))>1.0?c:e03ParameterColor(c);}
vec3 e039Filtered(vec3 albedo,vec2 mUV){
  vec2 size=vec2(textureSize(e021RegionMap,0)),st=mUV*size-0.5,base=floor(st),fr=st-base;
  vec2 mScale=vec2(e021UVTransform[0][0],e021UVTransform[1][1]);
  vec3 sum=vec3(0.0);
  for(int j=0;j<2;j++)for(int i=0;i<2;i++){
    vec2 tap=(base+vec2(float(i),float(j))+0.5)/size;
    vec2 uv0=e021UV0+(tap-mUV)/mScale;
    float mr=textureLod(e021RegionMap,tap,0.0).r,ab=textureLod(e03Amap,(e03AUVTransform*vec3(uv0,1.0)).xy,0.0).b;
    float w=(i==0?1.0-fr.x:fr.x)*(j==0?1.0-fr.y:fr.y);
    sum+=w*e039HdrColor(e039Colors[e039Region(mr)])*e039Mask(ab);
  }
  return albedo*sum;
}
vec3 e039Contribution(vec3 incoming,float ab,float mb){
  return incoming*e03ParameterColor(e039Colors[e039Region(mb)])*e039Mask(ab);
}
`;function wt(e,t){Object.assign(e.uniforms,t);let n=`#include <opaque_fragment>`;if(!e.fragmentShader.includes(`vec3 e038WorldNormal=`)||!e.fragmentShader.includes(`vec3 e03A=`)||!e.fragmentShader.includes(n))throw Error(`E3.9 incompatible E3.8 main-pass shader`);e.fragmentShader=e.fragmentShader.replace(`vec3 e021Decode(vec3 c) {`,Ct+`
vec3 e021Decode(vec3 c) {`).replace(n,`
    float e039RegionValue=e039Mode>0.5?e03MId.r:e03MId.b;
    int e039ID=e039Region(e039RegionValue);
    float e039EffectiveMask=e039Mask(e03A.b);
    vec3 e039Added=e039Mode>0.5?e039Filtered(diffuseColor.rgb,e03MUV):e039Contribution(outgoingLight,e03A.b,e039RegionValue);
    ${e.fragmentShader.includes(`e03Crystal`)?`if(e03Crystal>0.5&&e039Mode>0.5)e039Added=e039Filtered(e03Base,e03MUV);`:``}
    bool e039Composed=e021Diagnostic<0.5&&e03Diagnostic<0.5&&e037Diagnostic<0.5&&e038Diagnostic<0.5;
    if(e039Flags.x>0.5&&e039Flags.y>0.5&&e039Flags.z>0.5&&e039Composed)outgoingLight+=e039Added;
    if(e039Diagnostic==1.0)outgoingLight=vec3(e03A.b);
    if(e039Diagnostic==2.0)outgoingLight=vec3(e039EffectiveMask);
    if(e039Diagnostic==3.0)outgoingLight=e039Flags.x>0.5?e039Added:vec3(0.0);
    if(e039Diagnostic==4.0)outgoingLight=vec3(float(e039ID)/4.0);
    if(e039Diagnostic==5.0)outgoingLight=e039Flags.y<0.5?vec3(1.0,0.2,0.0):(e039Flags.z>0.5?vec3(0.0,1.0,0.0):vec3(0.2,0.5,1.0));
    ${n}`);for(let t of[`#include <tonemapping_fragment>`,`#include <colorspace_fragment>`])e.fragmentShader=e.fragmentShader.replace(t,`if(e039Diagnostic<0.5||e039Diagnostic==3.0){\n${t}\n}`)}var Tt=[`none`,`ndotv`,`mask`,`final`,`regions`,`depth`,`compatibility`];function Et(e={}){let t={enabled:!1,diagnostic:`none`,...e};if(typeof t.enabled!=`boolean`||!Tt.includes(t.diagnostic))throw Error(`E3.10 invalid rim selection`);return t}var Dt=`
uniform vec4 e0310Flags;
uniform float e0310Diagnostic,e0310Skin;
uniform vec3 e0310Sun[5],e0310Colors[5];
uniform sampler2D e0310Depth;
uniform vec4 e0310Camera;
uniform vec2 e0310Resolution;
int e0310Region(float mr){return mr<0.200000003?4:(mr<0.400000006?3:(mr<0.600000024?2:(mr<0.800000012?1:0)));}
vec3 e0310Ndotv(vec3 n,vec3 v,vec3 l,float mr){
 bool skin=int(4.0-floor(4.5*mr))==floatBitsToInt(e0310Skin);
 float vl=pow(pow(dot(v,-l)*-0.5+0.5,2.0),2.0);
 float z=mix(n.y,1.0,0.5)*0.5+0.5;z=clamp(skin?z:z*z,0.0,1.0);z=z*z*(3.0-2.0*z);
 float vertical=(pow(z,5.0)*(skin?-0.5:0.1)+(skin?1.0:0.9))*z;
 float edge=clamp((1.0-dot(v,n)-(skin?0.75-0.5*0.0833333358:0.5-0.5*0.0833333358))*(skin?5.00000048:3.33333325),0.0,1.0);edge=edge*edge*(3.0-2.0*edge);
 int id=e0310Region(mr);vec3 sun=e03ParameterColor(e0310Sun[id]);if(!skin)sun=vec3(dot(sun,vec3(0.300000012,0.600000024,0.100000001)));
 float grey=dot(sun,skin?vec3(0.330000013):vec3(0.300000012,0.600000024,0.100000001));sun=pow(sun,vec3(8.0));sun*=grey/(6.10351563e-5+dot(sun,vec3(0.7)));sun=mix(sun,vec3(1.0),pow(vl,20.0));
 float base=(vl*0.5+0.5)*vertical*(0.949999988+0.0500000007)*edge;float mean=0.330000013*(3.0*base);
 return vec3(base)*(mean*mean*0.5+1.0)*sun*e03ParameterColor(e0310Colors[id]);
}
// Algebraically equivalent inverse perspective projection, avoiding near/far
// cancellation at the clear depth (1) in high-ratio camera ranges.
float e0310Linear(float z){return e0310Camera.x/(1.0-z+z*e0310Camera.x/e0310Camera.y);}
// Screen-space helper is tested separately. No width/depth source substitution.
vec2 e0310Offset(vec3 vn,float distanceToCamera,float fov,float width){float range=clamp(fov,0.0,150.0)/180.0;return vn.xy*(width*0.0025*mix(0.5,0.45,range)*clamp(1.0/distanceToCamera,0.0,1.0)/range);}
float e0310Screen(float d,float od,vec3 n,vec3 l){return clamp((od-d)*dot(n,l)*2.5,0.0,1.0);}
`;function Ot(e,t){let n={e0310Flags:{value:new y(0,+e.ndotvReady,+!!e.enabled,0)},e0310Diagnostic:{value:0},e0310Skin:{value:e.skinId??0},e0310Sun:{value:e.sun.map(e=>new E(...e??[0,0,0]))},e0310Colors:{value:e.colors.map(e=>new E(...e??[0,0,0]))},e0310Depth:{value:null},e0310Camera:{value:new y(.1,100,0,0)},e0310Resolution:{value:{x:1,y:1}}};return kt(n,t),n}function kt(e,t){let n=Et(t);e.e0310Flags.value.x=+n.enabled,e.e0310Diagnostic.value=Tt.indexOf(n.diagnostic)}function At(e,t){Object.assign(e.uniforms,t);let n=`    vec3 e038Ambient,e038Light,e038Probe,e038Indirect;`;if(!e.fragmentShader.includes(n))throw Error(`E3.10 missing pre-GI anchor`);e.fragmentShader=e.fragmentShader.replace(`vec3 e021Decode(vec3 c) {`,Dt+`
vec3 e021Decode(vec3 c) {`).replace(n,`
    vec3 e0310WorldN=transformNormalByInverseViewMatrix(normal,viewMatrix);
    vec3 e0310WorldV=transformNormalByInverseViewMatrix(normalize(vViewPosition),viewMatrix);
    vec3 e0310Value=e0310Flags.y>0.5&&e0310Flags.z>0.5?e0310Ndotv(e0310WorldN,e0310WorldV,normalize(e02Light),e03MId.r):vec3(0.0);
    // Composition intentionally blocked until original width/hue/sun and the
    // Unity depth-pass contract are available. Never use a uniform fake mask.
${n}`).replace(`#include <opaque_fragment>`,`
    if(e0310Diagnostic==1.0)outgoingLight=e0310Value;
    if(e0310Diagnostic==2.0||e0310Diagnostic==3.0)outgoingLight=vec3(0.0);
    if(e0310Diagnostic==4.0)outgoingLight=vec3(float(e0310Region(e03MId.r))/4.0);
    if(e0310Diagnostic==5.0){float z=e0310Linear(texture2D(e0310Depth,gl_FragCoord.xy/e0310Resolution).r);outgoingLight=vec3(clamp((z-e0310Camera.x)/(e0310Camera.y-e0310Camera.x),0.0,1.0));}
    if(e0310Diagnostic==6.0)outgoingLight=e0310Flags.y>0.5?vec3(0.2,0.5,1.0):vec3(1.0,0.2,0.0);
    #include <opaque_fragment>`);for(let t of[`#include <tonemapping_fragment>`,`#include <colorspace_fragment>`])e.fragmentShader=e.fragmentShader.replace(t,`if(e0310Diagnostic<0.5||e0310Diagnostic==1.0||e0310Diagnostic==3.0){\n${t}\n}`)}function jt(e,t){let n=`if(labFaceRevision>0.5){`;if(!e.fragmentShader.includes(n)||!e.fragmentShader.includes(`e021FaceTex`))throw Error(`Facial completion requires verified SDF family`);e.uniforms.globalNoseThresholds={value:new C(...t.noseThresholds)},e.uniforms.globalFaceOutlineColors={value:t.colors.map(e=>new E(...e))},e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform vec2 globalNoseThresholds;uniform vec3 globalFaceOutlineColors[3];`),e.fragmentShader=e.fragmentShader.replace(n,`${n}
    if(labNose>0.5){
    vec3 globalV=normalize(vViewPosition),globalL=normalize((viewMatrix*vec4(e02Light,0.0)).xyz);
    float globalNV=dot(normal,globalV),globalNV2=globalNV*globalNV;
    // Even power, avoiding undefined GLSL pow(negative,10).
    float globalNV10=globalNV2*globalNV2*globalNV2*globalNV2*globalNV2;
    int globalNoseId=e021FaceRegion<0.6?2:(e021FaceRegion<0.8?1:0);
    vec3 globalNoseColor=pow(e021Decode(globalFaceOutlineColors[globalNoseId])*0.5,vec3(2.1));
    float globalNoseAlpha=1.0;
    #ifdef USE_MAP
      globalNoseAlpha=texture2D(map,vMapUv).a;
    #endif
    float globalNoseMask=clamp(smoothstep(globalNoseThresholds.x,globalNoseThresholds.y,globalNV10)-globalNoseAlpha,0.0,1.0);
    diffuseColor.rgb*=mix(vec3(1.0),globalNoseColor,globalNoseMask);
    }
  `);let r=`int e021Id=e021R`;if(!e.fragmentShader.includes(r))throw Error(`Facial completion output anchor changed`);e.fragmentShader=e.fragmentShader.replace(r,`
    if(labFaceHighlight>0.5&&labFaceRevision>0.5&&e021FaceEnabled>0.5&&e021A.x>0.5){
      vec3 globalSum=normalize((viewMatrix*vec4(e02Light,0.0)).xyz)+normalize(vViewPosition);
      float globalNH=length(globalSum)>0.0?max(dot(normal,normalize(globalSum)),0.0):0.0;
      float globalThreshold=max(e021Threshold,0.75);
      float globalHigh=smoothstep(globalThreshold-0.75,globalThreshold+0.75,clamp(e021FaceTex.g-0.5,0.0,1.0));
      globalHigh*=float(e021FaceUV.x>0.45&&e021FaceUV.x<0.55)*step(0.5,e021FaceMask);
      outgoingLight+=vec3(globalHigh*pow(globalNH,10.0)*10.0);
    }
    ${r}`)}var Mt=new WeakMap;function Nt(e){if(!e)return!0;let t=Mt.get(e);if(t!==void 0)return t;let n=e.image;if(!n)return!0;let r=!0;try{if(n.data&&typeof n.width==`number`&&typeof n.height==`number`){let e=n.data;r=!1;for(let t=3;t<e.length;t+=4)if(e[t]<250){r=!0;break}}else if(typeof document<`u`){let e=Math.min(n.width||0,512),t=Math.min(n.height||0,512);if(e>0&&t>0){let i=document.createElement(`canvas`);i.width=e,i.height=t;let a=i.getContext(`2d`,{willReadFrequently:!0});if(a){a.drawImage(n,0,0,e,t);let{data:i}=a.getImageData(0,0,e,t);r=!1;for(let e=3;e<i.length;e+=4)if(i[e]<250){r=!0;break}}}}}catch{r=!0}return Mt.set(e,r),r}var Pt=`vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;`;function Ft(e,{mode:t,basis:n,channel:r}){let i=j.normal_fragment_maps;if(!i.includes(Pt)||!e.fragmentShader.includes(`#include <normal_fragment_maps>`)||!e.fragmentShader.includes(`#include <common>`))throw Error(`E1 unsupported Three normal shader anchor`);e.uniforms.e01Basis=n,e.uniforms.e01Channel=r,e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform vec4 e01Basis;
uniform vec4 e01Channel;`);let a=[`normal`,`e2`,`flat-normal`,`diffuse-e2`,`e021`].includes(t)?`
    vec2 e01Encoded = texture2D( normalMap, vNormalMapUv ).rg * 2.0 - 1.0;
    vec2 e01XY = vec2(dot(e01Encoded, e01Basis.xy), dot(e01Encoded, e01Basis.zw));
    vec3 mapN = vec3(e01XY, sqrt(max(0.0, 1.0 - dot(e01XY, e01XY))));
  `:`vec3 mapN = vec3(0.0, 0.0, 1.0);`;if(e.fragmentShader=e.fragmentShader.replace(`#include <normal_fragment_maps>`,i.replace(Pt,a)),t===`channel`){if(!e.fragmentShader.includes(`#include <opaque_fragment>`))throw Error(`E0 unsupported diagnostic shader anchor`);e.fragmentShader=e.fragmentShader.replace(`#include <opaque_fragment>`,`outgoingLight = vec3(dot(texture2D(normalMap, vNormalMapUv), e01Channel));
#include <opaque_fragment>`)}}function It(e,t,n=!1){if(!(n?e?.isMesh:e?.isSkinnedMesh)||Array.isArray(e.material)||e.material.name!==t.materialName||!e.material.isMeshStandardMaterial)throw Error(`E0 material/skinned binding mismatch: ${t.id}`);if(e.material.normalMapType!==0)throw Error(`E1 unsupported normal space: ${t.id}`);let r=e.geometry,i=r.attributes.position?.count;for(let n of[`position`,`normal`,`uv`,...e.isSkinnedMesh?[`skinIndex`,`skinWeight`]:[]]){let e=r.attributes[n];if(!e||e.count!==i)throw Error(`E0 missing/inconsistent ${n}: ${t.id}`);if(!Array.from(e.array).every(Number.isFinite))throw Error(`E0 non-finite ${n}: ${t.id}`)}if(r.attributes.uv.itemSize!==2)throw Error(`E0 UV0 must be VEC2: ${t.id}`);let a=0,o=r.attributes.uv,s=r.index,c=s?.count??i;for(let e=0;e<c;e+=3){let[t,n,r]=[0,1,2].map(t=>s?s.getX(e+t):e+t),i=(o.getX(n)-o.getX(t))*(o.getY(r)-o.getY(t))-(o.getX(r)-o.getX(t))*(o.getY(n)-o.getY(t));Math.abs(i)<1e-12&&a++}if(a===c/3)throw Error(`E1 no usable UV tangent frame: ${t.id}`);return{binding:t.id,degenerateUVTriangles:a,tangentFrame:r.attributes.tangent?`provided`:`UV0 derivatives`,convention:`unverified`}}var Lt=class{constructor(e,t,n,r=new B,i={},a=null,o=null,s=null,c=null,l=null,u=Ye,d={}){if(N(t),t.threeRevision!==`186`)throw Error(`E1 installed Three revision mismatch`);this.contract=t,this.controller=n,this.pool=r,this.generated=t.version===3,this.ownsPool=d.ownsPool!==!1,this.generatedState=d.materialState,this.lightingSources=i,this.selectionKey=null,this.records=[],this.active=[],this.generation=0,this.disposed=!1,this.materialsCreated=0,this.materialsDisposed=0,this.tangentContract=l,this.tangentLoader=u,this.tangentBytes=null,this.tangentByteCache=new Map,this.tangentGeneration=0,this.geometriesCreated=0,this.geometriesDisposed=0;for(let n of t.bindings){let t=[];if(e.traverse(e=>{e.name===n.runtimeMesh&&t.push(e)}),t.length!==1)throw Error(`E0 ambiguous/missing mesh: ${n.runtimeMesh}`);let r=t[0],i=It(r,n,this.generated);this.records.push({mesh:r,binding:n,baseline:r.material,diagnostic:i})}if(this.colorRecords=[],e.traverse(e=>{(!d.runtimeMeshes||d.runtimeMeshes.includes(e.name))&&e.isMesh&&!Array.isArray(e.material)&&e.material.isMeshStandardMaterial&&e.material.map&&this.colorRecords.push(this.records.find(t=>t.mesh===e)??{mesh:e,baseline:e.material,binding:null})}),a)for(let t of[a,...a.additionalBindings??[]]){let n=this.colorRecords.find(e=>e.mesh.name===t.runtimeMesh);if(!n||n.baseline.name!==t.materialName)throw Error(`E2.1 facial runtime binding mismatch`);n.faceBinding=t,n.faceFrame=Ce(e,n.mesh,t),this.faceDiagnostic??=n.faceFrame.diagnostic}if(o)for(let e of o.bindings){Te(e);let t=this.colorRecords.filter(t=>t.mesh.name===e.runtimeMesh&&t.baseline.name===e.materialName);if(t.length!==1)throw Error(`E2.1b ambiguous/missing family binding`);t[0].family=e.family}if(this.familyContract=o,this.reflectionContract=s,this.emissionContract=s?.emissionContract??null,this.rimContract=s?.rimContract??null,this.calibrationContract=c,s)for(let e of s.bindings){let t=this.records.find(t=>t.binding.id===e.id&&t.mesh.name===e.runtimeMesh&&t.baseline.name===e.materialName);if(!t||![`body`,`hair`].includes(t.family))throw Error(`E3 family/runtime binding mismatch`);t.reflectionBinding=e}if(this.emissionContract)for(let e of this.emissionContract.bindings){let t=this.records.find(t=>t.binding.id===e.id&&t.mesh.name===e.runtimeMesh&&t.baseline.name===e.materialName);if(!t?.reflectionBinding||![`body`,`hair`].includes(t.family))throw Error(`E3.9 emission main-pass binding mismatch`);t.emissionBinding=e}if(this.rimContract)for(let e of this.rimContract.bindings){let t=this.records.find(t=>t.binding.id===e.id&&t.mesh.name===e.runtimeMesh&&t.baseline.name===e.materialName);if(!t?.emissionBinding||![`body`,`hair`].includes(t.family))throw Error(`E3.10 rim main-pass binding mismatch`);t.rimBinding=e}this.upstream=n.applySettings,this.wrapper=e=>{e.profile!==`original`&&(this.generation++,this.clearActive()),this.upstream.call(n,e),this.reapply()},n.applySettings=this.wrapper}reapply(){for(let e of this.active)e.mesh.material=e.material,e.tangentGeometry&&(e.mesh.geometry=e.tangentGeometry),e.frameHook&&(e.mesh.onBeforeRender=e.frameHook),e.queueRenderOrder!==void 0&&(e.mesh.renderOrder=e.queueRenderOrder)}async getTangentBytes(e){let t=e.resource.sha256;return this.tangentByteCache.has(t)||this.tangentByteCache.set(t,Promise.resolve().then(()=>this.tangentLoader(e)).catch(e=>{throw this.tangentByteCache.delete(t),e})),this.tangentByteCache.get(t)}ownedTangentGeometry(e,t,n){let r=Ze(e,t,n);return this.geometriesCreated++,r.addEventListener(`dispose`,()=>this.geometriesDisposed++),r}async setTangentSource(e){if(this.disposed)throw Error(`E1 layer disposed`);Je(e,this.contract);let t=++this.tangentGeneration;if(e===this.tangentContract)return!0;let n=e=>e.bindings.map(e=>e.id).sort().join(`|`);if(n(e)!==n(this.tangentContract))throw Error(`Tangent source binding coverage mismatch`);let r=this.generation,i=this.active.filter(e=>e.tangents),a=[],o=await this.getTangentBytes(e);try{for(let t of i){let n=e.bindings.find(e=>e.id===t.binding.id);await Xe(t.originalGeometry,n),a.push({record:t,geometry:this.ownedTangentGeometry(t.originalGeometry,n,o)})}if(this.disposed||r!==this.generation||t!==this.tangentGeneration){for(let e of a)e.geometry.dispose();return!1}for(let{record:e,geometry:t}of a){let n=e.tangentGeometry;e.tangentGeometry=t,e.mesh.geometry=t,n.dispose()}return this.tangentContract=e,this.tangentBytes=Promise.resolve(o),!0}catch(e){for(let e of a)e.geometry.dispose();throw e}}clearActive(){for(let e of this.active){e.mesh.material===e.material&&(e.mesh.material=e.baseline),e.queueRenderOrder!==void 0&&e.mesh.renderOrder===e.queueRenderOrder&&(e.mesh.renderOrder=e.previousRenderOrder),e.frameHook&&e.mesh.onBeforeRender===e.frameHook&&(e.mesh.onBeforeRender=e.previousFrameHook),e.tangentGeometry&&(e.mesh.geometry===e.tangentGeometry&&(e.mesh.geometry=e.originalGeometry),e.tangentGeometry.dispose()),e.material.dispose();for(let t of e.leases)t.release()}this.active=[],this.selectionKey=null}async setMode(e={mode:`original`}){if(this.disposed)throw Error(`E1 layer disposed`);let{mode:t,kind:n=`N`,channel:r=0,variant:i=`rg++`,target:a=`all`}=e,o=le(t),s=t===`e036`||t===`e037`||t===`e038`||t===`e039`||t===`e0310`,c=s&&(!this.generated||!!this.tangentContract),l=(t===`e035`||s)&&(!this.generated||!!this.calibrationContract),u=t===`e3`||t===`e035`||s,d=t===`e021b`||u,f=t===`e021`||d;if(d&&(!this.familyContract||!this.faceDiagnostic&&(!this.generated||this.familyContract.bindings.some(e=>e.family===`face-sdf`))))throw Error(`E2.1b requires verified family/face contracts`);if(u&&!this.reflectionContract)throw Error(`E3 requires verified reflection contract`);let p=l?He(this.calibrationContract,this.contract):1;c&&Je(this.tangentContract,this.contract);let m=t===`e2`||t===`diffuse-e2`||f;if(![`original`,`normal`,`channel`,`e2`].includes(t)&&!o||!ie[i]||![`N`,`M`,`A`].includes(n)||!Number.isInteger(r)||r<0||r>3)throw Error(`E0 invalid diagnostic selection`);let h=new Set([...(this.familyContract?.bindings??[]).filter(e=>[`face-sdf`,`eyes`].includes(e.family)),...this.familyContract?.unimplemented??[]].map(e=>e.runtimeMesh)),g=(o?this.colorRecords:this.records).filter(e=>a===`all`||a===e.binding?.id||d&&a===`face`&&h.has(e.mesh.name));if(!g.length)throw Error(`E0 diagnostic binding unavailable`);let _=t.startsWith(`vertex`)?g.map(e=>ue(e.mesh,t)):[],v=G(e.e2),b=ge(e.e021),ee=De(e.e021b),x=Me(e.e03),S=Ve(e.e035),C=qe(e.e036),w=rt(e.e037),T=dt(e.e038),D=bt(e.e039),te=Et(e.e0310);if(t===`e0310`&&!this.rimContract&&!this.generated)throw Error(`E3.10 requires verified rim inventory`);if(t===`e039`&&!this.emissionContract&&!this.generated)throw Error(`E3.9 requires a verified original emission contract`);let O=JSON.stringify([t,a,t===`channel`?n:`N`,x.uvMatcaps]);if(this.active.length&&this.selectionKey===O){for(let t of this.active)t.basis.value.fromArray(ie[i]),t.component.value.set(0,0,0,0).setComponent(r,1),t.lighting&&(f?be:fe)(t.lighting,f?b:v,e.lightDirection),t.facialUniforms&&ke(t.facialUniforms,ee),t.reflections&&Ie(t.reflections,x,t.family),t.calibration&&Ge(t.calibration,S),t.tangents&&$e(t.tangents,C),t.wide&&at(t.wide,w),t.ambient&&gt(t.ambient,T),t.emission&&St(t.emission,D),t.rim&&kt(t.rim,te);return}let k=++this.generation;if(this.clearActive(),t===`original`)return;let ne=e=>f&&!e.faceBinding&&e.binding?.maps?.T?this.contract.resources[e.binding.maps.T]:null,j=g.map(e=>[...u&&e.reflectionBinding?[...[`N`,`M`,`A`].map(t=>this.pool.acquire(this.contract.resources[e.binding.maps[t]])),...e.reflectionBinding.parameters.regions.filter(e=>Pe(e,x)).map(e=>this.pool.acquire(this.reflectionContract.resources[e.texture]))]:f&&e.faceBinding?[this.pool.acquire(e.faceBinding.resource)]:(m?e.binding?(e.baseline.transparent||e.baseline.alphaTest>0)&&e.binding.maps?.A?[`N`,`M`,`A`]:[`N`,`M`]:[]:o?t===`flat-normal`&&e.binding?[`N`]:[]:[t===`normal`?`N`:n]).map(t=>this.pool.acquire(this.contract.resources[e.binding.maps[t]])),...ne(e)?[this.pool.acquire(ne(e))]:[]]),M=j.flat(),re=await Promise.allSettled(M),N=()=>{for(let e of re)e.status===`fulfilled`&&e.value.release()};if(this.disposed||k!==this.generation){N();return}let P=re.find(e=>e.status===`rejected`);if(P)throw N(),P.reason;let ae=null;if(c){try{this.tangentBytes??=this.getTangentBytes(this.tangentContract).catch(e=>{throw this.tangentBytes=null,e}),ae=await this.tangentBytes,await Promise.all(g.filter(e=>e.binding&&this.tangentContract.bindings.some(t=>t.id===e.binding.id)).map(e=>Xe(e.mesh.geometry,this.tangentContract.bindings.find(t=>t.id===e.binding.id))))}catch(e){throw N(),e}if(this.disposed||k!==this.generation){N();return}}let F=[],oe=0;try{g.forEach((n,a)=>{let s=re.slice(oe,oe+j[a].length).map(e=>e.value);oe+=j[a].length;let h=s[0],g=f&&!!n.faceBinding,O=!!h&&!g,k=d&&[`face-sdf`,`eyes`].includes(n.family)?Oe(ee):null,M=null;if(u&&n.reflectionBinding){let e=3,t=n.reflectionBinding.parameters.regions.map(t=>Pe(t,x)?s[e++].texture:null);M=Fe(n.reflectionBinding.parameters,s[2].texture,t,n.family,x,this.contract.resources[n.binding.maps.M])}let N=g?ye(n.faceBinding.parameters,h.texture):m&&n.binding?f?ye(this.lightingSources[n.binding.id]?.e021,s[1].texture,ne(n)?s[s.length-1].texture:null):de(this.lightingSources[n.binding.id],s[1].texture):null;N&&(f?be:fe)(N,f?b:v,e.lightDirection);let P=n.baseline.clone(),se=l?We(S):null,I=c&&n.binding?this.tangentContract.bindings.find(e=>e.id===n.binding.id):null,L=I?Qe(C):null,R=t===`e037`||t===`e038`||t===`e039`||t===`e0310`?M?it(n.reflectionBinding.wideParameters,w):{e037Diagnostic:{value:0},e037Enabled:{value:1}}:null;R&&at(R,w);let z=(t===`e038`||t===`e039`||t===`e0310`)&&M&&[`body`,`hair`].includes(n.family)?ht(T):null,B=(t===`e039`||t===`e0310`)&&n.emissionBinding?xt(n.emissionBinding.parameters,D):null,ce=t===`e0310`&&n.rimBinding?Ot(n.rimBinding.parameters,te):null;if(o&&(V(P,t),t===`vertex0`&&(P.vertexColors=!0)),this.generated&&n.baseline.color&&P.color.copy(n.baseline.color),this.generated&&this.generatedState){let e=this.generatedState;[0,1,2].includes(e.Cull)&&(P.side=[2,1,0][e.Cull]),[0,1].includes(e.ZWrite)&&(P.depthWrite=!!e.ZWrite),typeof e.toneMapped==`boolean`&&(P.toneMapped=e.toneMapped),typeof e.transparent==`boolean`&&(P.transparent=e.transparent,e.transparent&&e.SrcBlend===5&&e.DstBlend===10&&(P.blending=1)),typeof e.alphaTest==`number`?(P.alphaTest=e.alphaTest,P.alphaToCoverage=!!e.alphaToCoverage,e.transparent&&(P.blending=1)):(e.SrcBlend===1&&e.DstBlend===0&&e.alphaClip===0&&(P.transparent=!1),e.SrcBlend===5&&e.DstBlend===10&&(P.transparent=!0,P.blending=1))}this.materialsCreated++,P.addEventListener(`dispose`,()=>{this.materialsDisposed++});let le={value:new y(...ie[i])},ue=[0,0,0,0];ue[r]=1;let U={value:new y(...ue)};O&&(P.normalMap=h.texture),O&&P.normalScale.copy(n.baseline.normalScale).multiplyScalar(n.binding.bumpScale),I&&(P.normalScale.y=Math.abs(n.baseline.normalScale.y)*n.binding.bumpScale*I.normalScaleY);let W=!!((P.transparent||P.alphaTest>0)&&!P.alphaMap&&P.map&&s[2]?.texture&&!Nt(P.map));W&&(P.alphaMap=s[2].texture);let G=!!(this.generated&&this.generatedState?.transparent),me=!!(G&&this.generatedState?.SrcBlend===1&&this.generatedState?.DstBlend===10),K=this.generated?this.generatedState?.vfxFresnel??null:null,q=!!(this.generated&&n.family===`hair`&&M&&!G),ge=n.baseline.onBeforeCompile,_e=n.baseline.customProgramCacheKey.call(n.baseline);P.onBeforeCompile=(e,r)=>{if(ge.call(n.baseline,e,r),W&&(e.fragmentShader=e.fragmentShader.replace(`#include <alphamap_fragment>`,`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).r;
#endif`)),O&&Ft(e,{mode:d?he:t,basis:le,channel:U}),o&&H(e,t,_[a]),N&&(f?xe(e,N,g):pe(e,N)),k&&Ae(e,k,n.family),M&&Re(e,M),R&&st(e,R,{reflections:!!M}),z&&vt(e,z),B&&wt(e,B),ce&&At(e,ce),se&&Ke(e,se,{hasNormal:O,family:n.family,eyeFilter:!!n.baseline.userData.zzzEyeLayer,normalYSign:L?1:Ue(p,n.baseline.normalScale.y)}),L&&et(e,L),g&&n.faceBinding.completion&&jt(e,n.faceBinding.completion),K&&(e.uniforms.zzzVfxFresnelColor={value:new E(...K.color)},e.uniforms.zzzVfxFresnelPower={value:K.power},e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform vec3 zzzVfxFresnelColor;
uniform float zzzVfxFresnelPower;`)),(G||me||K||q)&&e.fragmentShader.includes(`#include <opaque_fragment>`)){let t=K?`{
                vec3 zzzFN = normalize(normal);
                vec3 zzzFV = normalize(vViewPosition);
                float zzzFF = pow(clamp(1.0 - abs(dot(zzzFN, zzzFV)), 0.0, 1.0), zzzVfxFresnelPower);
                outgoingLight += zzzVfxFresnelColor * zzzFF * 0.55 * smoothstep(0.02, 0.15, diffuseColor.a);
              }
`:``,n=q?`{
                vec3 zzzHN = normalize(normal);
                vec3 zzzHV = normalize(vViewPosition);
                vec3 zzzHL = normalize((viewMatrix * vec4(e02Light, 0.0)).xyz);
                vec3 zzzHH = normalize(zzzHV + zzzHL);
                float zzzHShift = clamp(dot(zzzHN, zzzHH) - 0.18, -1.0, 1.0);
                float zzzHRing = pow(clamp(1.0 - abs(zzzHShift) * 2.2, 0.0, 1.0), 10.0) * max(dot(zzzHN, zzzHL) * 0.5 + 0.5, 0.0);
                outgoingLight += diffuseColor.rgb * zzzHRing * (0.14 * e03M.b);
              }
`:``,r=G?`if (diffuseColor.a > 0.02 && diffuseColor.a < 0.98) {
                float zzzNdotV = abs(dot(normalize(normal), normalize(vViewPosition)));
                float zzzSheer = pow(clamp(1.0 - zzzNdotV, 0.0, 1.0), 2.5);
                diffuseColor.a = mix(diffuseColor.a, 1.0, zzzSheer * 0.35 * smoothstep(0.02, 0.15, diffuseColor.a));
              }
`:``,i=me?`if (diffuseColor.a > 0.001 && diffuseColor.a < 0.999) {
                float zzzAlphaWeight = mix(1.0, max(diffuseColor.a, 0.12), 0.65 * smoothstep(0.0, 0.08, diffuseColor.a));
                outgoingLight /= zzzAlphaWeight;
              }
`:``;e.fragmentShader=e.fragmentShader.replace(`#include <opaque_fragment>`,`${t}${n}${r}${i}#include <opaque_fragment>`)}},P.customProgramCacheKey=()=>`${_e}|zzz-e01-r186-v2-uvcaps-${t}${N?`-lighting-v1`:``}${g?`-face-sdf-v1`:``}${g&&n.faceBinding.completion?`-face-details-v1`:``}${W?`-alpha-r`:``}${G?`-sheer`:``}${me?`-pmglow`:``}${K?`-vfxfresnel`:``}${q?`-hairring`:``}`,P.needsUpdate=!0;let J={...n,material:P,lease:h,leases:s,basis:le,component:U,lighting:N,facialUniforms:k,reflections:M,calibration:se,tangents:L,wide:R,ambient:z,emission:B,rim:ce};this.generated&&this.generatedState?.queue===`transparent`&&(J.previousRenderOrder=n.mesh.renderOrder,J.queueRenderOrder=Math.max(n.mesh.renderOrder,2)),F.push(J),I&&(J.originalGeometry=n.mesh.geometry,J.tangentGeometry=this.ownedTangentGeometry(n.mesh.geometry,I,ae)),g&&(J.previousFrameHook=n.mesh.onBeforeRender,J.frameHook=function(...e){J.previousFrameHook.apply(this,e),n.faceFrame.update(N)},n.faceFrame.update(N)),P.onBeforeCompile({uniforms:{},fragmentShader:A.physical.fragmentShader,vertexShader:A.physical.vertexShader},null)})}catch(e){for(let e of F)e.material.dispose(),e.tangentGeometry?.dispose();throw N(),e}this.active=F,this.selectionKey=O,this.reapply()}stats(){return{...this.pool.stats(),materials:this.active.length,materialsCreated:this.materialsCreated,materialsDisposed:this.materialsDisposed,geometriesCreated:this.geometriesCreated,geometriesDisposed:this.geometriesDisposed,tangentRecovery:this.active.some(e=>e.tangents)?this.tangentContract.bindings.map(e=>({binding:e.id,...e.summary})):[],bindings:this.records.map(e=>e.diagnostic),families:this.familyContract?this.colorRecords.map(e=>({mesh:e.mesh.name,material:e.baseline.name,family:e.family??`special`,implemented:!!e.family})):[],...this.faceDiagnostic?{face:this.faceDiagnostic}:{}}}dispose(){this.disposed||(this.disposed=!0,this.generation++,this.clearActive(),this.ownsPool&&this.pool.dispose(),this.tangentBytes=null,this.tangentByteCache.clear(),this.tangentGeneration++,this.controller.applySettings===this.wrapper&&(this.controller.applySettings=this.upstream))}},Rt=e=>e<=.04045?e/12.92:((e+.055)/1.055)**2.4;function zt(e){let t=e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite);if(e?.shader!==`miHoYo/Character/NapAvatarStandardGunEye`||e.colorAttribute!==`color_1`||![`srgb-to-linear-export`,`raw`].includes(e.colorEncoding)||![`L`,`R`].every(n=>typeof e.eyes?.[n]?.bone==`string`&&t(e.eyes[n].center))||!Array.isArray(e.palette)||e.palette.length!==5||!e.palette.every(e=>Array.isArray(e)&&e.length===5&&e.every(e=>Array.isArray(e)&&e.length===4&&e.every(Number.isFinite)))||![e.state,e.speed,e.squash,e.ignoreTimeScale].every(Number.isFinite))throw Error(`Generated ZZZ contract: invalid gun eye profile`)}Object.freeze(`_UseDissolveTex._group_dissolve_ramptex._InvFresnel._ScreenEffects._AnimationSheets_Switch._VertexAnimation._RigidAnimation._RibbonAnimation._MeshFrameAnimation._UseClipPlane._UseSphereFade._FadeFromCameraOn._group_nearlyDepthClip._group_dither._CloserHighlight._group_CharacterVfxMask._group_maintex_blur._UseFxFogMaskAsMainTex._MoonRockMode._MoonUVMode._CollideWithAvatar._MirrorPos._UiPreTransformFix._Vfx_Volumetric_Shadow._WorldSoftParticle._ApplySceneFog._UseDissolveTexEdgeColor`.split(`.`));var Z=(e,t)=>Array.isArray(e)&&e.length===t&&e.every(Number.isFinite),Bt=e=>Z(e?.st,4)&&Z(e?.clamp,2)&&Z(e?.speed,2)&&Number.isFinite(e?.rotation)&&Number.isFinite(e?.flip);function Vt(e){if(!(e?.shader===`miHoYo/Particles/Particles_Dissolve_CustomColor_Mask`&&typeof e.uvFlipV==`boolean`&&[`mask`,`ramp`,`distortion`,`distortion2`,`softParticles`].every(t=>typeof e.features?.[t]==`boolean`)&&[`main`,`mask`,`ramp`,`distortion`,`distortion2`].every(t=>Bt(e[t]))&&Z(e.main.moveStep,2)&&[e.mask.channel,e.mask.distortionChannel,e.mask.affectsDistortion,e.mask.distortion,e.mask.distortion2,e.ramp.channel,e.distortion.channel,e.distortion.intensity,e.distortion2.channel,e.distortion2.intensity,e.distortionScale,e.colorChannel,e.alphaChannel,e.lerpBrightness,e.affectedByMainLight,e.powerRGB,e.powerAlpha,e.alphaFade,e.alphaFadeTimeline,e.opaqueness,e.blendMode,e.zOffset,e.timeOffset,e.softParticles?.near,e.softParticles?.rcpDistance,e.state?.src,e.state?.dst,e.state?.zWrite,e.state?.zTest,e.state?.cull].every(Number.isFinite)&&Z(e.colorA,4)&&Z(e.colorB,4)&&Z(e.bakedVertexColor,4)&&Z(e.ambientColor,3)))throw Error(`Generated ZZZ contract: invalid particles dissolve profile`)}function Ht(e){if(!e||e.shader!==`Standard`)throw Error(`Generated ZZZ contract: invalid unity-standard shader`);if(![0,1,2,3].includes(e.renderMode)||![0,1,2].includes(e.cull))throw Error(`Generated ZZZ contract: invalid unity-standard render/cull mode`);if(!(e=>Array.isArray(e)&&e.length===4&&e.every(Number.isFinite))(e.color)||!(e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite))(e.emissionColor)||![e.metallic,e.glossiness,e.glossMapScale,e.cutoff,e.bumpScale,e.occlusionStrength,e.zWrite].every(Number.isFinite))throw Error(`Generated ZZZ contract: invalid unity-standard numeric parameters`);if(!e.maps||typeof e.maps!=`object`)throw Error(`Generated ZZZ contract: invalid unity-standard maps`)}function Ut(e){if(!e||e.shader!==`miHoYo/Character/NapAvatarScreen`)throw Error(`Generated ZZZ contract: invalid nap-avatar-screen shader`);if(![0,1,2].includes(e.cull)||![0,1].includes(e.alphaClip)||![0,1].includes(e.zWrite))throw Error(`Generated ZZZ contract: invalid nap-avatar-screen state`);let t=e=>Array.isArray(e)&&e.length===4&&e.every(Number.isFinite),n=e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite),r=e=>Array.isArray(e)&&e.length===2&&e.every(Number.isFinite);if(!t(e.color)||!n(e.emissionColor)||typeof e.emission!=`boolean`||![e.roughness,e.metallic,e.cutoff,e.srcBlend,e.dstBlend].every(Number.isFinite)||e.uvScale!==void 0&&!r(e.uvScale)||e.uvOffset!==void 0&&!r(e.uvOffset)||e.alphaMode!==void 0&&![`opaque`,`blend`,`clip`].includes(e.alphaMode))throw Error(`Generated ZZZ contract: invalid nap-avatar-screen parameters`);if(!e.maps||typeof e.maps!=`object`)throw Error(`Generated ZZZ contract: invalid nap-avatar-screen maps`)}function Wt(e,t){let n=t.faceProfile;if(!n)return;let r=e.resources?.[t.maps?._LightTex],i=e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite)&&Math.abs(Math.hypot(...e)-1)<1e-4;if(!(t.family===`face-sdf`||t.family===`eyes`&&n.eye===!0)||t.mode!==`e021b`||t.capabilities?.sdf?.state!==`bound`||n.runtimeMesh!==t.runtimeMesh||n.materialName!==t.materialName||!r||r.kind!==`F`||n.resource?.sha256!==r.sha256||n.resource?.url!==r.url||typeof n.headBone!=`string`||!n.headBone||n.restFrame!==`skin-bind`||!i(n.forward)||!i(n.right)||Math.abs(n.forward.reduce((e,t,r)=>e+t*n.right[r],0))>1e-4||n.colorAttribute!==`color_1`||n.colorEncoding!==`srgb-to-linear-byte`||n.maxByteError!==.1)throw Error(`Generated ZZZ contract: invalid facial binding/frame/resource`);let a=n.colors;if(!Number.isInteger(a?.vertices)||a.vertices<1||a.vertices>1e6||!Number.isFinite(a.maxAttributeError)||![`absent`,`normalized-raw-bytes`,`srgb-to-linear-export`,`damaged-export`].includes(a.sourceAttributeEncoding))throw Error(`Generated ZZZ contract: invalid facial color evidence`);if(a.reconstructedBytes&&(!Array.isArray(a.reconstructedBytes)||a.reconstructedBytes.length!==a.vertices*4||a.reconstructedBytes.some(e=>!Number.isInteger(e)||e<0||e>255)))throw Error(`Generated ZZZ contract: invalid original facial bytes`);if(a.sourceAttributeEncoding===`damaged-export`&&(!a.reconstructedBytes||a.replaceVerifiedAttribute!==!0))throw Error(`Generated ZZZ contract: damaged facial COLOR_1 without original bytes`);if(n.uv3!==void 0&&(!Array.isArray(n.uv3?.values)||n.uv3.values.length!==a.vertices*2||n.uv3.values.some(e=>!Number.isFinite(e))))throw Error(`Generated ZZZ contract: invalid original facial TEXCOORD3`)}function Gt(e,t,n){let r=t.evidence?.assignment;r?.kind===`material-only`&&(e.policy?.unverifiedMaterials!==1||t.evidence?.geometry?.verified!==!1||r.geometryVerified!==!1||![`explicit-file`,`exact-material-label`,`exact-kit-pptr`].includes(r.method)||t.status===`complete`||t.faceProfile||t.evidence.facial)&&n(`invalid material-only assignment or unverified vertex data`)}function Kt(e){let t=e=>{throw Error(`Generated ZZZ contract: `+e)};(e?.schema!==`zzz-studio.global-contract`||e.version!==1||e.threeRevision!==`186`||!/^[a-f0-9]{64}$/.test(e.model?.sha256))&&t(`schema/model`),(!Array.isArray(e.surfaces)||!e.surfaces.length||e.surfaces.length>4096)&&t(`surfaces`);let n=new Set,r=new Set;for(let i of e.surfaces){if(Wt(e,i),Gt(e,i,t),i.experimentalUI&&(e.policy?.laboratoryUI!==1||i.status===`complete`||![`miHoYo/Character/NapAvatarUI`,`miHoYo/Character/NapAvatarUIFace`,`miHoYo/Character/NapAvatarUIEye`,`miHoYo/Character/NapAvatarUITransparent`].includes(i.source?.shader))&&t(`invalid laboratory UI binding`),(!i.id||r.has(i.id)||!i.runtimeMesh||n.has(i.runtimeMesh))&&t(`ambiguous runtime surface`),r.add(i.id),n.add(i.runtimeMesh),(!Number.isInteger(i.meshIndex)||!Number.isInteger(i.primitiveIndex)||i.meshIndex<0||i.primitiveIndex<0||![`complete`,`partial`,`fallback`].includes(i.status))&&t(`surface identity/status`),i.mode&&![`flat`,`lit-albedo`,`flat-normal`,`e021`,`e021b`,`e3`,`e037`,`e039`,`stencil-shadow`,`gun-eye`,`particles-dissolve`,`unity-standard`,`nap-avatar-screen`].includes(i.mode)&&t(`unsupported runtime mode`),i.mode===`gun-eye`&&zt(i.gunEye),i.mode===`particles-dissolve`){Vt(i.particles);for(let n of Object.values(i.particles.maps??{}))e.resources?.[n]||t(`particles map dependency`);i.particles.maps?.main||t(`particles main map`)}if(i.mode===`unity-standard`){Ht(i.unityStandard);for(let n of Object.values(i.unityStandard.maps??{}))e.resources?.[n]||t(`unity-standard map dependency`)}if(i.mode===`nap-avatar-screen`){Ut(i.napAvatarScreen);for(let n of Object.values(i.napAvatarScreen.maps??{}))e.resources?.[n]||t(`nap-avatar-screen map dependency`)}i.runtimeOptions&&i.runtimeOptions.mode!==i.mode&&t(`mode mismatch`);for(let n of Object.values(i.maps??{}))e.resources?.[n]||t(`map dependency`);i.status!==`fallback`&&(!i.evidence?.geometry?.verified&&i.evidence?.assignment?.kind!==`material-only`||!i.evidence?.material||!i.source?.sha256)&&t(`missing source evidence`)}let i=new Map;for(let[n,r]of Object.entries(e.resources??{}))(!/^[a-f0-9]{64}$/.test(r.sha256)||!/^\/__material_renderer\/generated_[a-f0-9]{24}\.png$/.test(r.url)||![`N`,`M`,`A`,`D`,`F`,`C`,`E`,`X`,`T`].includes(r.kind))&&t(`resource identity`),i.has(r.url)&&i.get(r.url)!==r.sha256&&t(`resource URL collision`),i.set(r.url,r.sha256),(!Number.isInteger(r.width)||!Number.isInteger(r.height)||r.width<1||r.height<1||r.width>32768||r.height>32768)&&t(`resource dimensions`),(r.flipY!==!1||r.uv!==0||r.wrap!==`repeat`||![`none`,`srgb`].includes(r.colorSpace)||!Array.isArray(r.scale)||!Array.isArray(r.offset)||r.scale.length!==2||r.offset.length!==2||![...r.scale,...r.offset].every(Number.isFinite))&&t(`texture state`);for(let[n,r]of Object.entries(e.vertexBuffers??{}))(!/^[a-f0-9]{24}$/.test(n)||r.kind!==`outline`||r.stride!==7||!Number.isInteger(r.vertices)||r.vertices<1||r.vertices>1e6)&&t(`vertex buffer identity`),r.url!==void 0&&(r.url!==`/__material_renderer/generated_`+n+`.bin`||!/^[a-f0-9]{64}$/.test(r.sha256)||r.bytes!==r.vertices*r.stride*4)&&t(`vertex buffer resource`);for(let n of e.surfaces)n.outline?.data&&!e.vertexBuffers?.[n.outline.data]&&t(`outline vertex data`);let a=Object.fromEntries([`complete`,`partial`,`fallback`].map(t=>[t,e.surfaces.filter(e=>e.status===t).length]));return JSON.stringify(a)!==JSON.stringify(e.coverage)&&t(`coverage mismatch`),e}function qt(e,t){Kt(e);let n=t.experimentalUI?{...t.source,shader:t.experimentalUI.runtimeShader}:t.source,r=t.baseBinding?{...t.baseBinding,source:n}:null,i={version:3,threeRevision:`186`,model:e.model,normalConvention:{status:`unverified`,tbn:`uv0-derivatives`},expectedBindings:+!!r,bindings:r?[r]:[],resources:e.resources},a={bindings:[{family:t.family,source:n??{shader:null},runtimeMesh:t.runtimeMesh,materialName:t.materialName}]},o=t.reflection?{bindings:[{id:t.id,runtimeMesh:t.runtimeMesh,materialName:t.materialName,parameters:t.reflection,wideParameters:t.wide}],resources:e.resources}:null;return o&&t.emission&&(o.emissionContract={bindings:[{id:t.id,runtimeMesh:t.runtimeMesh,materialName:t.materialName,parameters:t.emission}]}),{base:i,family:a,reflection:o,calibration:t.evidence.geometry?.transform?.flipV?{modelSha256:e.model.sha256,bindings:i.bindings.map(e=>e.id),normalTransport:{uv0SourceToGLB:[1,0,0,-1,0,1]}}:null,face:t.faceProfile??null,lighting:t.lighting?{[t.id]:{e021:t.lighting}}:{}}}function Jt(e,t){if(e.experimentalUI)return{};let n={...e.capabilities.sourceState},r=t.transparent;return n.queue===`opaque`?r=!1:n.queue===`transparent`?r=!0:(n.SrcBlend===1&&n.DstBlend===0&&n.alphaClip===0&&(r=!1),n.SrcBlend===5&&n.DstBlend===10&&(r=!0)),n.transparent=r,(n.queue===`transparent`||n.queue===`opaque`&&(t?.alphaTest??0)>0)&&n.alphaClip===0&&(n.alphaTest=0,n.alphaToCoverage=!1),e.mode===`flat`&&(n.toneMapped=!0),!r&&n.ZWrite===0&&(n.ZWrite=+!!t.depthWrite),e.vfxFresnel&&(n.vfxFresnel=e.vfxFresnel),n}var Yt=Object.freeze({tint:1,ambient:0}),Xt=`
attribute vec3 zzzOutlineNormal;
attribute vec4 zzzOutlineColor;
uniform float zzzUnit, zzzWidth, zzzWidthScale, zzzZOffset;
varying vec3 vZzzNormalW;
varying vec2 vZzzUv;
varying float vZzzFaceId;`,Zt=`
vec3 zzzN = zzzOutlineNormal;
#ifdef USE_SKINNING
  zzzN = ( skinMatrix * vec4( zzzN, 0.0 ) ).xyz;
#endif
vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
vec3 zzzNw = normalize( mat3( modelMatrix ) * zzzN );
vZzzNormalW = zzzNw;
vZzzUv = uv;
vZzzFaceId = 0.9 - 0.2 * float( int( floor( zzzOutlineColor.b * 255.0 + 0.5 ) ) & 3 );
vec2 zzzN2 = normalize( vec3( ( viewMatrix * vec4( zzzNw, 0.0 ) ).xy, 0.00001 ) ).xy;
float zzzD = -mvPosition.z / ( zzzUnit * projectionMatrix[ 1 ][ 1 ] );
vec3 zzzS = clamp( zzzD * vec3( 10.0, 1.0, 0.5 ) + vec3( 0.0, -0.1, -1.05 ), 0.0, 1.0 );
float zzzW = zzzS.x * 0.00105;
zzzW = zzzS.y * ( 0.005 - zzzS.x * 0.00105 ) + zzzW;
zzzW = zzzS.z * ( 0.0035 - zzzW ) + zzzW;
zzzW *= zzzOutlineColor.r * zzzWidth * zzzWidthScale;
mvPosition.xy += zzzN2 * zzzW * zzzUnit;
mvPosition.xyz += normalize( mvPosition.xyz ) * ( zzzOutlineColor.g - 0.502 ) * zzzZOffset * zzzUnit;
gl_Position = projectionMatrix * mvPosition;`,Qt=`
uniform vec4 zzzColors[5];
uniform vec4 zzzTint;
uniform float zzzMetallic, zzzEngineTint, zzzAmbient;
uniform vec3 zzzLightDir, zzzLightColor;
uniform sampler2D zzzRegionMap;
uniform mat3 zzzRegionUV;
varying vec3 vZzzNormalW;
varying vec2 vZzzUv;
varying float vZzzFaceId;
vec3 zzzRgbToHsv( vec3 c ) {
  vec4 K = vec4( 0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0 );
  vec4 p = mix( vec4( c.bg, K.wz ), vec4( c.gb, K.xy ), step( c.b, c.g ) );
  vec4 q = mix( vec4( p.xyw, c.r ), vec4( c.r, p.yzx ), step( p.x, c.r ) );
  float d = q.x - min( q.w, q.y );
  return vec3( q.z + ( q.w - q.y ) / ( 6.0 * d + 0.0001 ), d / ( q.x + 0.0001 ), q.x );
}`,$t=`
vec3 zzzBase = diffuseColor.rgb * zzzTint.rgb;
int zzzId;
#ifdef ZZZ_OUTLINE_FACE
  zzzId = vZzzFaceId >= 0.8 ? 0 : ( vZzzFaceId >= 0.6 ? 1 : 2 );
#else
  vec2 zzzM = texture2D( zzzRegionMap, ( zzzRegionUV * vec3( vZzzUv, 1.0 ) ).xy ).rg;
  zzzBase *= 1.0 - zzzM.y * zzzMetallic;
  zzzId = zzzM.x < 0.2 ? 4 : ( zzzM.x < 0.4 ? 3 : ( zzzM.x < 0.6 ? 2 : ( zzzM.x < 0.8 ? 1 : 0 ) ) );
#endif
vec4 zzzSlot = zzzColors[ zzzId ];
vec3 zzzHsv = zzzRgbToHsv( clamp( zzzSlot.a * ( zzzBase - 1.0 ) + 1.0, 0.0, 1.0 ) );
// The pass mirrors the view-space depth of the (back-facing) hull normal before lighting it.
vec3 zzzNv = ( viewMatrix * vec4( normalize( vZzzNormalW ), 0.0 ) ).xyz;
zzzNv.z = -zzzNv.z;
vec3 zzzNf = normalize( transpose( mat3( viewMatrix ) ) * zzzNv );
float zzzLit = clamp( ( dot( zzzLightDir, zzzNf ) - 0.28 ) * 10.000001, 0.0, 1.0 ) * 0.3 + 0.7;
float zzzValue = zzzHsv.z * ( ( zzzHsv.z - zzzHsv.y + 1.0 ) * -0.2 + 0.8 ) * zzzLit;
vec3 zzzK = clamp( abs( fract( abs( zzzHsv.x ) + vec3( 1.0, 0.666667, 0.333333 ) ) * 6.0 - 3.0 ) - 1.0, 0.0, 1.0 );
vec3 zzzColour = zzzValue * mix( vec3( 1.0 ), zzzK, zzzHsv.y ) * zzzSlot.rgb * zzzTint.rgb;
vec3 zzzLight = zzzLightColor / max( 1.0, max( zzzLightColor.r, max( zzzLightColor.g, zzzLightColor.b ) ) );
outgoingLight = zzzColour * zzzEngineTint * zzzLight + zzzColour * zzzAmbient;
diffuseColor.a = 1.0;`;function en(e,t,n){for(let t of[`#include <project_vertex>`,`#include <common>`])if(!e.vertexShader.includes(t))throw Error(`Outline vertex anchor changed: `+t);for(let t of[`#include <opaque_fragment>`,`#include <common>`])if(!e.fragmentShader.includes(t))throw Error(`Outline fragment anchor changed: `+t);Object.assign(e.uniforms,t),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>`+Xt).replace(`#include <project_vertex>`,Zt),e.fragmentShader=(n?`#define ZZZ_OUTLINE_FACE
`:``)+e.fragmentShader.replace(`#include <common>`,`#include <common>`+Qt).replace(`#include <opaque_fragment>`,$t+`
#include <opaque_fragment>`)}function Q(e,t){let n=(t.isSkinnedMesh?t:(()=>{let t=null;return e.traverse(e=>{!t&&e.isSkinnedMesh&&(t=e)}),t})())?.skeleton?.bones?.[0],r=new E;return(n??t).getWorldScale(r),(r.x+r.y+r.z)/3}async function tn(e,t){let n;if(t){let r=await t(e.url);if(!r.ok)throw Error(`Outline vertex data HTTP `+r.status);n=await r.arrayBuffer(),await P(n,e.sha256)}else n=await L.get(e);if(n.byteLength!==e.vertices*e.stride*4)throw Error(`Outline vertex data size mismatch`);return new Float32Array(n)}var nn=class{constructor(e,t,{pool:n,light:r,fetcher:i=null}={}){Object.assign(this,{root:e,contracts:t,pool:n,light:r,fetcher:i}),this.hulls=[],this.leases=[],this.enabled=!0,this.widthScale=1,this.engine={...Yt},this.disposed=!1,this.covered=new Set}async prepare(){let e=new Map;this.root.traverse(t=>{if(!t.isMesh||t.userData.p4Shell)return;let n=e.get(t.name);n?n.push(t):e.set(t.name,[t])});let t=[];for(let n of this.contracts)for(let r of n.surfaces){if(!r.outline||this.disposed||(this.covered.add(r.runtimeMesh),!r.outline.enabled||!r.outline.ready))continue;let i=e.get(r.runtimeMesh);if(!i||i.length!==1)continue;let a=i[0],o=r.outline.data?n.vertexBuffers?.[r.outline.data]:null,s=r.outline.mode===`face-bits`,c=r.maps?._OtherDataTex;(s||c&&n.resources?.[c])&&t.push((async()=>{let e=null;if(o?.url)try{e=await tn(o,this.fetcher)}catch(e){console.warn(`[zzz-outline]`,r.runtimeMesh,e)}if(this.disposed)return null;e&&e.length!==a.geometry.attributes.position.count*7&&(e=null);let t=null;return!s&&(t=await this.pool.acquire(n.resources[c]),this.disposed)?(t.release(),null):{source:a,outline:r.outline,data:e,lease:t,face:s}})())}let n=await Promise.all(t);if(this.disposed)for(let e of n)e?.lease?.release();else for(let e of n){if(!e)continue;let t=null;e.lease&&(this.leases.push(e.lease),t=e.lease.texture,t.updateMatrix()),this.hulls.push(this.createHull(e.source,e.outline,e.data,t,e.face))}}createHull(t,n,r,i,a){let o=new ee;for(let[e,n]of Object.entries(t.geometry.attributes))o.setAttribute(e,n);o.morphAttributes=t.geometry.morphAttributes,o.morphTargetsRelative=t.geometry.morphTargetsRelative,o.setIndex(t.geometry.index);for(let e of t.geometry.groups)o.addGroup(e.start,e.count,e.materialIndex);let s=t.geometry.attributes.position.count;if(r){let e=new g(r,7);o.setAttribute(`zzzOutlineNormal`,new T(e,3,0)),o.setAttribute(`zzzOutlineColor`,new T(e,4,3))}else o.setAttribute(`zzzOutlineNormal`,t.geometry.attributes.normal),o.setAttribute(`zzzOutlineColor`,new e(new Float32Array(s*4).fill(0).map((e,t)=>[1,.502,0,1][t%4]),4));let l=t.material,u=l.side===2,d=new w({map:l.map??null,side:1,depthWrite:!0,depthTest:!0,transparent:!1,polygonOffset:u,polygonOffsetFactor:+!!u,polygonOffsetUnits:+!!u});d.name=`ZZZ outline `+l.name,d.toneMapped=!0;let p={zzzUnit:{value:Q(this.root,t)},zzzWidth:{value:n.width},zzzWidthScale:{value:this.widthScale},zzzZOffset:{value:r?n.zOffset:0},zzzColors:{value:Array.from({length:5},(e,t)=>new y(...n.colours[t]??n.colours[n.colours.length-1]))},zzzTint:{value:new y(...n.tint)},zzzMetallic:{value:n.metallic},zzzEngineTint:{value:this.engine.tint},zzzAmbient:{value:this.engine.ambient},zzzLightDir:{value:new E(0,1,0)},zzzLightColor:{value:new c(1,1,1)},zzzRegionMap:{value:i},zzzRegionUV:{value:i?i.matrix.clone():new D}};d.onBeforeCompile=e=>en(e,p,a),d.customProgramCacheKey=()=>`zzz-outline-transcribed-v1-`+a;let m=t.isSkinnedMesh?new k(o,d):new f(o,d);return m.name=`ZZZ outline `+t.name,m.userData.p4Shell=!0,m.frustumCulled=!1,m.renderOrder=t.renderOrder,m.castShadow=!1,m.receiveShadow=!1,t.isSkinnedMesh&&(m.bindMode=t.bindMode,m.bind(t.skeleton,t.bindMatrix)),m.morphTargetInfluences=t.morphTargetInfluences,m.morphTargetDictionary=t.morphTargetDictionary,Object.defineProperty(m,"visible",{configurable:!0,get:()=>this.enabled&&!this.disposed&&t.material?.visible!==!1,set(){}}),t.add(m),{source:t,shell:m,material:d,u:p}}update({enabled:e=this.enabled,widthScale:t=this.widthScale,engine:n={}}={}){this.enabled=!!e,this.widthScale=t,Object.assign(this.engine,n);let r=this.light?.();for(let{u:e}of this.hulls)e.zzzWidthScale.value=this.widthScale,e.zzzEngineTint.value=this.engine.tint,e.zzzAmbient.value=this.engine.ambient,r&&(e.zzzLightDir.value.copy(r.direction),e.zzzLightColor.value.copy(r.color))}stats(){return{hulls:this.hulls.map(e=>e.source.name),covered:[...this.covered],enabled:this.enabled}}dispose(){if(!this.disposed){this.disposed=!0;for(let{shell:e,material:t}of this.hulls){e.removeFromParent();let n=e.geometry;for(let e of Object.keys(n.attributes))e.startsWith(`zzzOutline`)||n.deleteAttribute(e);n.setIndex(null),n.morphAttributes={},n.attributes.zzzOutlineNormal instanceof T||n.deleteAttribute(`zzzOutlineNormal`),n.dispose(),t.dispose()}this.hulls=[];for(let e of this.leases)e.release();this.leases=[]}}},rn=`float e021R=e021FaceRegion>=0.8`;function an(e){if(e.fragmentShader.split(rn).length!==2||!e.fragmentShader.includes(`float e021FaceArea=`))throw Error(`Stencil receiver anchor not found in the face shader`);let t=e.fragmentShader.includes(`float e021OrigX=`)?`e021OrigX=0.0;e021OrigY=1.0;`:``;e.fragmentShader=e.fragmentShader.replace(rn,`e021Threshold=1.0;e021FaceArea=-1.0;`+t+`
    float e021R=e021FaceRegion>=0.8`)}var on=e=>typeof e?.customProgramCacheKey==`function`&&e.customProgramCacheKey().includes(`-face-sdf-v1`)&&typeof e.onBeforeCompile==`function`,sn=`attribute float hairShadowR;
uniform vec3 hsLight;
uniform vec3 hsAxis;
uniform vec4 hsParams; // x=_Length, y=_XOffsetNew, z=_ZOffset, w=_YOffset
uniform float hsUnit;  // world units per Unity metre (bone world scale; 0.01 in the registered GLBs)
`,cn=`
{
  float hsR = hairShadowR;
  vec3 hsWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
  vec3 hsUp = normalize((modelMatrix * vec4(hsAxis, 0.0)).xyz);
  float hsNdl = dot(hsLight, hsUp);
  // The original offsets are Unity metres and Unity clip units (w in metres): scale them to the viewer world.
  vec3 hsPulled = hsWorld + normalize(cameraPosition - hsWorld) * (hsParams.z * hsR * hsUnit);
  vec3 hsLit = hsPulled + hsLight * (hsNdl * hsR * 8.0 * hsUnit);
  mat4 hsVP = projectionMatrix * viewMatrix;
  vec4 hsClip = hsVP * vec4(hsPulled, 1.0);
  vec2 hsD = ((hsVP * vec4(hsLit, 1.0)).xy - hsClip.xy) / hsUnit;
  vec2 hsOff = sign(hsD) * (1.0 - exp(-abs(hsD * 0.1))) * hsParams.x * sign(-hsNdl);
  hsOff += hsR * hsParams.yw;
  hsOff *= hsUnit;
  gl_Position = vec4(hsClip.xy + hsOff, hsClip.zw);
}
`;function ln(e,{ref:t,func:n=519,funcMask:i=255,writeMask:a=255,zPass:o=r}){e.stencilWrite=!0,e.stencilRef=t,e.stencilFunc=n,e.stencilFuncMask=i,e.stencilWriteMask=a,e.stencilFail=s,e.stencilZFail=s,e.stencilZPass=o}var un=[`stencilWrite`,`stencilRef`,`stencilFunc`,`stencilFuncMask`,`stencilWriteMask`,`stencilFail`,`stencilZFail`,`stencilZPass`],dn=class{constructor({root:t,scene:n,shadow:r,faces:i,lightDirection:a}){this.root=t,this.scene=n,this.lightDirection=a,this.enabled=!0,this.disposed=!1,this.saved=new Map,this.hooks=[];let o=i[0].faceStencil;this.bits={ref:o.ref,shadowRef:o.shadowRef,mask:o.ref|o.shadowBit,shadowBit:o.shadowBit};let s=[];if(t.traverse(e=>{e.isMesh&&e.name===r.runtimeMesh&&s.push(e)}),s.length!==1||!s[0].isSkinnedMesh)throw Error(`Hair shadow mesh not found as a unique skinned mesh`);let l=s[0],u=r.hairShadow;if(u.colorR.length!==l.geometry.attributes.position.count)throw Error(`Hair shadow COLOR.r count does not match the GLB primitive`);let d=new Set;for(let e of i)t.traverse(t=>{t.isMesh&&t.name===e.runtimeMesh&&d.add(t)});if(!d.size)throw Error(`Face mesh not found`);let p=l.geometry.clone();p.setAttribute(`hairShadowR`,new e(Float32Array.from(u.colorR),1));let m=new E(0,1,0),h={hsLight:{value:m},hsAxis:{value:new E(...u.referenceAxis)},hsParams:{value:new y(u.length,u.xOffset,u.zOffset,u.yOffset)},hsUnit:{value:Math.max(Q(t,l),1e-6)}},g=new w({name:`${r.materialName} · stencil`,colorWrite:!1,depthWrite:!1,depthTest:!0,side:0,polygonOffset:!0,polygonOffsetFactor:-1,polygonOffsetUnits:-2});ln(g,{ref:this.bits.shadowRef,func:514,funcMask:this.bits.ref,writeMask:this.bits.shadowBit}),g.onBeforeCompile=e=>{Object.assign(e.uniforms,h),e.vertexShader=sn+e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
`+cn)},g.customProgramCacheKey=()=>`zzz-hair-shadow-stencil-v2`,g.userData.outlineParameters={visible:!1};let _=new k(p,g);_.name=`${l.name} · stencil`,_.userData.zzzStencilCaster=!0,_.position.copy(l.position),_.quaternion.copy(l.quaternion),_.scale.copy(l.scale),_.bindMode=l.bindMode,_.bind(l.skeleton,l.bindMatrix),_.frustumCulled=!1,_.castShadow=!1,_.receiveShadow=!1,_.renderOrder=10;let v=u.overrideMainLight?new E(...u.overrideMainLightDir).normalize():null;_.onBeforeRender=e=>{m.copy(v??this.lightDirection()).normalize(),this.stencilAvailable===void 0&&e?.getContext&&(this.stencilAvailable=!!e.getContext().getContextAttributes?.()?.stencil,this.stencilAvailable||this.applyVisibility())},l.parent.add(_),this.caster=_;let b=new c().setRGB(...o.shadowColor,``);t.traverse(e=>{if(!e.isMesh||e===_)return;let t=d.has(e),n=e.onBeforeRender,r=t?{ref:this.bits.ref,writeMask:this.bits.mask}:{ref:0,writeMask:this.bits.mask};e.onBeforeRender=(...t)=>{n?.apply(e,t);let i=t[4];i&&!this.disposed&&(this.saved.has(i)||this.saved.set(i,Object.fromEntries(un.map(e=>[e,i[e]]))),this.enabled?ln(i,r):Object.assign(i,this.saved.get(i)))},this.hooks.push([e,n])}),this.receiverMaterials=new Map,this.receivers=[],this.multiply=new w({name:`ZZZ hair shadow · face pass (multiply)`,color:b,depthWrite:!1,depthFunc:3,toneMapped:!1,fog:!1,blending:5,blendEquation:100,blendSrc:208,blendDst:200}),this.multiply.onBeforeCompile=e=>{e.fragmentShader=e.fragmentShader.replace(`#include <colorspace_fragment>`,``)},this.multiply.customProgramCacheKey=()=>`zzz-hair-shadow-face-multiply-v1`,this.receiverStencil(this.multiply);for(let e of d){let t=e.isSkinnedMesh?new k(e.geometry,this.multiply):new f(e.geometry,this.multiply);t.name=`${e.name} · stencil receiver`,t.userData.zzzStencilReceiver=!0,t.position.copy(e.position),t.quaternion.copy(e.quaternion),t.scale.copy(e.scale),e.isSkinnedMesh&&(t.bindMode=e.bindMode,t.bind(e.skeleton,e.bindMatrix)),t.morphTargetInfluences=e.morphTargetInfluences,t.morphTargetDictionary=e.morphTargetDictionary,t.frustumCulled=!1,t.castShadow=!1,t.receiveShadow=!1,t.renderOrder=11;let n={src:e,mesh:t,base:null};t.onBeforeRender=()=>this.sync(n),this.sync(n),e.parent.add(t),this.receivers.push(n)}this.applyVisibility()}receiverStencil(e){ln(e,{ref:this.bits.shadowRef,func:514,funcMask:this.bits.mask,writeMask:0,zPass:s}),e.userData.outlineParameters={visible:!1}}receiverMaterial(e){if(this.receiverMaterials.has(e))return this.receiverMaterials.get(e);let t=null;if(on(e)){let n=e.onBeforeCompile,r=e.customProgramCacheKey.call(e);t=e.clone(),t.name=`${e.name} · stencil receiver`,t.onBeforeCompile=(t,r)=>{n.call(e,t,r),an(t)},t.customProgramCacheKey=()=>`${r}|zzz-stencil-receiver-v1`,t.depthFunc=3,this.receiverStencil(t);try{t.onBeforeCompile({uniforms:{},vertexShader:A.physical.vertexShader,fragmentShader:A.physical.fragmentShader},null)}catch{t.dispose(),t=null}}if(t??=this.multiply,this.receiverMaterials.size>=8)for(let[e,t]of this.receiverMaterials)this.receivers.some(t=>t.base===e)||(t!==this.multiply&&t.dispose(),this.receiverMaterials.delete(e));return this.receiverMaterials.set(e,t),t}sync(e){if(this.disposed)return;let{src:t,mesh:n}=e;e.base!==t.material&&(e.base=t.material,n.material=this.receiverMaterial(t.material)),n.geometry!==t.geometry&&(n.geometry=t.geometry)}applyVisibility(){let e=this.enabled&&this.stencilAvailable!==!1;this.caster&&(this.caster.visible=e);for(let t of this.receivers??[])t.mesh.visible=e}receiverModes(){return this.receivers.map(e=>({mesh:e.src.name,mode:e.mesh.material===this.multiply?`multiply`:`face-program`}))}setEnabled(e){this.enabled=!!e,this.applyVisibility()}dispose(){if(!this.disposed){this.disposed=!0;for(let[e,t]of this.hooks)e.onBeforeRender=t??ne.prototype.onBeforeRender;for(let[e,t]of this.saved)Object.assign(e,t);for(let e of this.receivers)e.mesh.removeFromParent();for(let e of this.receiverMaterials.values())e!==this.multiply&&e.dispose();this.receiverMaterials.clear(),this.multiply.dispose(),this.caster.removeFromParent(),this.caster.geometry.dispose(),this.caster.material.dispose()}}};function fn(e,t){let n=e.surfaces.find(e=>e.mode===`stencil-shadow`&&e.hairShadow),r=e.surfaces.filter(e=>e.faceStencil).sort((e,t)=>(t.family===`face-sdf`)-(e.family===`face-sdf`));return!n||!r.length?null:new dn({...t,shadow:n,faces:r})}var pn=`
uniform mat4 gunInv[2];uniform vec3 gunCenter[2];uniform vec2 gunOffset;uniform vec4 gunPalette[25];
uniform float gunState,gunTime,gunSpeed,gunSquash,gunSrgb;
varying vec3 gunWorld;varying vec4 gunColor;
float gunByte(float x){return gunSrgb>0.5?(x<=0.0031308?12.92*x:1.055*pow(x,1.0/2.4)-0.055):x;}
vec3 gunAlbedo(bool front){
  int slot=int(clamp(floor(gunState+0.5),0.0,4.0));
  vec4 spec=gunPalette[slot],rim=gunPalette[5+slot],emis=gunPalette[10+slot];
  vec3 mat=gunPalette[15+slot].rgb,outl=gunPalette[20+slot].rgb;
  if(abs(gunState-1.0)<0.5){
    float t=fract(gunTime*gunSpeed);bool a=t>=0.666667,b=t>=0.333333;
    vec3 s=a?rim.rgb:(b?emis.rgb:spec.rgb),r=a?emis.rgb:(b?spec.rgb:rim.rgb),e=a?spec.rgb:(b?rim.rgb:emis.rgb);
    spec.rgb=s;rim.rgb=r;emis.rgb=e;
  }
  float cx=gunByte(gunColor.x);
  bool left=gunByte(gunColor.y)>0.5;
  vec3 lp=(left?(gunInv[0]*vec4(gunWorld,1.0)).xyz:(gunInv[1]*vec4(gunWorld,1.0)).xyz)-(left?gunCenter[0]:gunCenter[1])-vec3(gunOffset,0.0);
  lp.y*=1.0-0.9*gunSquash;
  float d=length(lp);
  vec3 c=d<0.02*spec.a?spec.rgb:(d<0.02*(spec.a+rim.a)?rim.rgb:(d<0.02*(spec.a+rim.a+emis.a)?emis.rgb:mat));
  if(!front)c=mat;
  vec3 o=outl+cx*(1.0-outl);
  return cx*c+(1.0-cx)*o;
}`;function mn(e,t){for(let[t,n]of[[e.vertexShader,`#include <common>`],[e.vertexShader,`#include <project_vertex>`],[e.fragmentShader,`#include <common>`],[e.fragmentShader,`diffuseColor.rgb = labDiffuseRGB;`]])if(t.split(n).length!==2)throw Error(`Gun eye: incompatible Three shader (`+n+`)`);Object.assign(e.uniforms,t),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
attribute vec4 color_1;
varying vec3 gunWorld;
varying vec4 gunColor;`).replace(`#include <project_vertex>`,`gunWorld=(modelMatrix*vec4(transformed,1.0)).xyz;
gunColor=color_1;
#include <project_vertex>`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
`+pn).replace(`diffuseColor.rgb = labDiffuseRGB;`,`diffuseColor.rgb = gunAlbedo(gl_FrontFacing);`)}function hn(e){return{gunInv:{value:[new b,new b]},gunCenter:{value:[`L`,`R`].map(t=>new E(...e.eyes[t].center))},gunOffset:{value:new C},gunPalette:{value:e.palette.flat().map(e=>new y(...e))},gunState:{value:e.state},gunTime:{value:0},gunSpeed:{value:e.speed},gunSquash:{value:e.squash},gunSrgb:{value:+(e.colorEncoding===`srgb-to-linear-export`)}}}var gn=class{constructor(e,t,{runtimeMesh:n,profile:r,clock:i=()=>performance.now()/1e3}){this.controller=t,this.records=[],this.disposed=!1,this.active=[];let a=[];if(e.traverse(e=>{e.isMesh&&e.name===n&&a.push(e)}),a.length!==1||Array.isArray(a[0].material))throw Error(`Gun eye runtime mesh mismatch: `+n);let o=a[0],s=[`L`,`R`].map(e=>{let t=o.skeleton?.bones.find(t=>t.name===r.eyes[e].bone);if(!t)throw Error(`Gun eye bone missing: `+r.eyes[e].bone);return t});if(!o.geometry.attributes.color_1)throw Error(`Gun eye: COLOR_1 missing at runtime`);let c=o.material,l=c.clone(),u=c.onBeforeCompile,d=c.customProgramCacheKey.call(c);V(l,`lit-albedo`),l.map=null,this.uniforms=hn(r),l.onBeforeCompile=(e,t)=>{u.call(c,e,t),H(e,`lit-albedo`),mn(e,this.uniforms)},l.customProgramCacheKey=()=>d+`|zzz-gun-eye-v1`,l.onBeforeRender=()=>{for(let e=0;e<2;e++)this.uniforms.gunInv.value[e].copy(s[e].matrixWorld).invert();this.uniforms.gunTime.value=i()},this.records.push({mesh:o,baseline:c,material:l}),this.upstream=t.applySettings,this.wrapper=e=>{this.upstream.call(t,e),this.reapply()},t.applySettings=this.wrapper,this.reapply()}setOffset(e){let t=Array.isArray(e)&&e.length===2&&e.every(Number.isFinite)?e:[0,0];this.uniforms.gunOffset.value.set(t[0]/100,t[1]/100)}reapply(){for(let e of this.records)e.mesh.material=e.material}dispose(){if(!this.disposed){this.disposed=!0;for(let e of this.records)e.mesh.material===e.material&&(e.mesh.material=e.baseline),e.material.dispose();this.controller.applySettings===this.wrapper&&(this.controller.applySettings=this.upstream)}}},_n=`
uniform sampler2D pdMainTex,pdMaskTex,pdRampTex,pdDistTex,pdDist2Tex;
uniform vec4 pdFeatures; // mask, ramp, distortion, distortion2
uniform vec4 pdMainClamp; // main clamp U/V, backface revert, flip V
uniform vec4 pdMaskClamp; // clamp U/V, affects distortion, -
uniform vec4 pdMaskParams; // channel, distortion channel, distortion 1, distortion 2
uniform vec4 pdRampST;uniform vec4 pdRampParams; // rotation, flip, channel, use main UV
uniform vec4 pdRampClamp; // clamp U/V, only alpha, -
uniform vec4 pdDistParams; // channel 1, intensity 1, channel 2, intensity 2
uniform vec4 pdDistClamp; // clamp U/V of distortion 1 and 2
uniform float pdDistScale;
uniform vec4 pdColorA,pdColorB;
uniform vec4 pdColorParams; // colour channel, alpha channel, two-tone vertex alpha, lerp brightness
uniform vec4 pdOutParams; // power RGB, power alpha, alpha fade, alpha fade timeline
uniform vec4 pdOutParams2; // opaqueness, blend mode, -, -
uniform vec3 pdLightFactor;
varying vec2 pdUv0;varying vec2 pdMainUv;varying vec2 pdMaskUv;varying vec2 pdDistUv;varying vec2 pdDist2Uv;varying vec4 pdVertexB;
float pdChannel(vec4 c,float i){int k=int(clamp(floor(i+0.5),0.0,3.0));return k==0?c.r:(k==1?c.g:(k==2?c.b:c.a));}
vec2 pdClamp(vec2 uv,vec2 on){return mix(uv,clamp(uv,0.0,0.998),step(vec2(0.5),on));}
vec4 pdSample(sampler2D t,vec2 uv){return texture2D(t,pdMainClamp.w>0.5?vec2(uv.x,1.0-uv.y):uv);}
vec2 pdTransform(vec2 uv,float rot,float flip,vec4 st){
  vec4 r=mix(vec4(uv,1.0-uv),vec4(uv.y,1.0-uv.x,1.0-uv.y,uv.x),rot);
  vec4 q=flip<0.5?vec4(r.x,r.y,0.0,rot):(flip<1.5?vec4(r.z,r.y,1.0,rot):(flip<2.5?vec4(r.x,r.w,0.0,1.0-rot):vec4(r.z,r.w,1.0,1.0-rot)));
  return (q.xy-q.zw)*st.xy+st.zw+q.zw;
}
vec4 pdColor(bool front){
  vec2 mainUv=pdMainUv;
  if(pdMainClamp.z>0.5&&!front)mainUv.x=-mainUv.x;
  mainUv=pdClamp(mainUv,pdMainClamp.xy);
  vec2 maskUv=pdClamp(pdMaskUv,pdMaskClamp.xy);
  float d1=0.0,d2=0.0;
  if(pdFeatures.z>0.5)d1=2.0*(pdChannel(pdSample(pdDistTex,pdClamp(pdDistUv,pdDistClamp.xy)),pdDistParams.x)-0.498039)*pdDistScale;
  if(pdFeatures.w>0.5)d2=2.0*(pdChannel(pdSample(pdDist2Tex,pdClamp(pdDist2Uv,pdDistClamp.zw)),pdDistParams.z)-0.498039)*pdDistScale;
  maskUv+=d1*pdMaskParams.z+d2*pdMaskParams.w;
  float mask=1.0,maskDist=1.0;
  if(pdFeatures.x>0.5){vec4 m=pdSample(pdMaskTex,maskUv);mask=pdChannel(m,pdMaskParams.x);maskDist=(pdChannel(m,pdMaskParams.y)-1.0)*pdMaskClamp.z+1.0;}
  mainUv+=d1*maskDist*pdDistParams.y+d2*maskDist*pdDistParams.w;
  vec4 mainTex=pdSample(pdMainTex,mainUv);
  vec3 rampRgb=vec3(1.0);float rampA=1.0;
  if(pdFeatures.y>0.5){
    vec2 rampUv=pdClamp(pdTransform(pdRampParams.w>0.5?mainUv:pdUv0,pdRampParams.x,pdRampParams.y,pdRampST),pdRampClamp.xy);
    vec4 rt=pdSample(pdRampTex,rampUv);
    rampRgb=pdRampParams.z<=3.5?vec3(pdChannel(rt,pdRampParams.z)):rt.rgb;
    rampA=pdChannel(rt,min(pdRampParams.z,3.0));
    if(pdRampClamp.z>0.5)rampRgb=vec3(1.0);else rampA=1.0;
  }
  bool rgbMode=pdColorParams.x>3.5;
  float t=clamp((rgbMode?1.0:pdChannel(mainTex,pdColorParams.x))*pdColorParams.w,0.0,1.0);
  vec3 col=mix(pdColorA.rgb,pdVertexB.rgb,t)*(rgbMode?mainTex.rgb:vec3(1.0))*rampRgb*pdLightFactor;
  float a0=pdChannel(mainTex,pdColorParams.y);
  float alpha=(pdColorParams.z>0.5?a0*(pdVertexB.a-pdColorA.a)+pdColorA.a:pdVertexB.a)*a0*mask;
  float g=pdOutParams2.y<0.5?1.0+0.3*(1.0-pdOutParams2.x):1.0;
  vec3 rgb=pow(max(col,vec3(0.0)),vec3(pdOutParams.x*g));
  float a=clamp(pow(max(alpha,0.0),pdOutParams.y)*pdOutParams.z*rampA*pdOutParams.w,0.0,1.0)*pdOutParams2.x;
  return vec4(rgb,a);
}`,vn=`
uniform float pdTime,pdZOffset,pdUnit;
uniform vec4 pdMainST,pdMainUv2; // rotation, flip, uv move, flip V
uniform vec4 pdMainSpeed; // speed xy, move step xy
uniform vec4 pdMaskST,pdMaskUv2; // rotation, flip, speed xy
uniform vec4 pdDistST,pdDistUv2,pdDist2ST,pdDist2Uv2;
uniform vec4 pdColorB,pdBakedColor;uniform float pdUseVertexColor;
varying vec2 pdUv0;varying vec2 pdMainUv;varying vec2 pdMaskUv;varying vec2 pdDistUv;varying vec2 pdDist2Uv;varying vec4 pdVertexB;
vec2 pdTransform(vec2 uv,float rot,float flip,vec4 st){
  vec4 r=mix(vec4(uv,1.0-uv),vec4(uv.y,1.0-uv.x,1.0-uv.y,uv.x),rot);
  vec4 q=flip<0.5?vec4(r.x,r.y,0.0,rot):(flip<1.5?vec4(r.z,r.y,1.0,rot):(flip<2.5?vec4(r.x,r.w,0.0,1.0-rot):vec4(r.z,r.w,1.0,1.0-rot)));
  return (q.xy-q.zw)*st.xy+st.zw+q.zw;
}
vec3 pdLinear(vec3 c){return mix(c*0.077399,pow((c+0.055)*0.947867,vec3(2.4)),step(vec3(0.04045),c));}`;function yn(e,t,{vertexColors:n}){for(let[t,n]of[[e.vertexShader,`#include <common>`],[e.vertexShader,`#include <project_vertex>`],[e.fragmentShader,`#include <common>`],[e.fragmentShader,`#include <opaque_fragment>`]])if(t.split(n).length!==2)throw Error(`Particles dissolve: incompatible Three shader (`+n+`)`);Object.assign(e.uniforms,t);let r=n?`vec4 vc=vec4(1.0);vc.rgb=vColor.rgb;`:`vec4 vc=vec4(1.0);`;e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
`+vn).replace(`#include <project_vertex>`,`#include <project_vertex>
pdUv0=pdMainUv2.w>0.5?vec2(uv.x,1.0-uv.y):uv;
float pdT=pdTime;
vec2 pdMove=fract(pdT*pdMainSpeed.xy);
pdMove=mix(pdMove,floor(pdMove/max(abs(pdMainSpeed.zw),vec2(1e-8)))*pdMainSpeed.zw,vec2(notEqual(pdMainSpeed.zw,vec2(0.0))));
pdMainUv=pdTransform(pdUv0,pdMainUv2.x,pdMainUv2.y,pdMainST)+(pdMainUv2.z>0.5?pdMove:vec2(0.0));
pdMaskUv=pdTransform(pdUv0,pdMaskUv2.x,pdMaskUv2.y,pdMaskST)+fract(pdT*pdMaskUv2.zw);
pdDistUv=pdTransform(pdUv0,pdDistUv2.x,pdDistUv2.y,pdDistST)+fract(pdT*pdDistUv2.zw);
pdDist2Uv=pdTransform(pdUv0,pdDist2Uv2.x,pdDist2Uv2.y,pdDist2ST)+fract(pdT*pdDist2Uv2.zw);
${r}
pdVertexB=(pdUseVertexColor>0.5?vec4(pdLinear(pdBakedColor.rgb)*vc.rgb,vc.a*pdBakedColor.a):vec4(1.0))*pdColorB;
mvPosition.xyz+=normalize(mvPosition.xyz)*pdZOffset*pdUnit;
gl_Position=projectionMatrix*mvPosition;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
`+_n).replace(`#include <opaque_fragment>`,`gl_FragColor=pdColor(gl_FrontFacing);`)}var $=e=>new y(...e);function bn(e,t,{unit:n=1}={}){let r=e.features,i=t.main;return{pdMainTex:{value:t.main},pdMaskTex:{value:t.mask??i},pdRampTex:{value:t.ramp??i},pdDistTex:{value:t.distortion??i},pdDist2Tex:{value:t.distortion2??i},pdFeatures:{value:$([r.mask&&!!t.mask,r.ramp&&!!t.ramp,r.distortion&&!!t.distortion,r.distortion2&&!!t.distortion2].map(Number))},pdMainClamp:{value:$([...e.main.clamp,+e.main.backfaceRevert,+e.uvFlipV])},pdMaskClamp:{value:$([...e.mask.clamp,e.mask.affectsDistortion,0])},pdMaskParams:{value:$([e.mask.channel,e.mask.distortionChannel,e.mask.distortion,e.mask.distortion2])},pdRampST:{value:$(e.ramp.st)},pdRampParams:{value:$([e.ramp.rotation,e.ramp.flip,e.ramp.channel,+e.ramp.useMainUv])},pdRampClamp:{value:$([...e.ramp.clamp,+e.ramp.onlyAlpha,0])},pdDistParams:{value:$([e.distortion.channel,e.distortion.intensity,e.distortion2.channel,e.distortion2.intensity])},pdDistClamp:{value:$([...e.distortion.clamp,...e.distortion2.clamp])},pdDistScale:{value:e.distortionScale},pdColorA:{value:$(e.colorA)},pdColorB:{value:$(e.colorB)},pdBakedColor:{value:$(e.bakedVertexColor)},pdUseVertexColor:{value:+!e.ignoreVertexColor},pdColorParams:{value:$([e.colorChannel,e.alphaChannel,+e.twoToneVertexAlpha,e.lerpBrightness])},pdOutParams:{value:$([e.powerRGB,e.powerAlpha,e.alphaFade,e.alphaFadeTimeline])},pdOutParams2:{value:$([e.opaqueness,e.blendMode,0,0])},pdLightFactor:{value:new E(...e.ambientColor.map(e=>1+e))},pdTime:{value:0},pdZOffset:{value:e.zOffset},pdUnit:{value:n},pdMainST:{value:$(e.main.st)},pdMainUv2:{value:$([e.main.rotation,e.main.flip,+e.main.uvMove,+e.uvFlipV])},pdMainSpeed:{value:$([...e.main.speed,...e.main.moveStep])},pdMaskST:{value:$(e.mask.st)},pdMaskUv2:{value:$([e.mask.rotation,e.mask.flip,...e.mask.speed])},pdDistST:{value:$(e.distortion.st)},pdDistUv2:{value:$([e.distortion.rotation,e.distortion.flip,...e.distortion.speed])},pdDist2ST:{value:$(e.distortion2.st)},pdDist2Uv2:{value:$([e.distortion2.rotation,e.distortion2.flip,...e.distortion2.speed])}}}var xn=[200,201,208,202,209,204,203,206,207,210,205],Sn=[1,0,2,4,3,6,7,5,1],Cn=[2,1,0];function wn(e){let t=(e,t,n)=>{let r=e[Math.round(t)];if(r===void 0)throw Error(`Particles dissolve: unsupported `+n+` `+t);return r};return{blendSrc:t(xn,e.src,`source factor`),blendDst:t(xn,e.dst,`destination factor`),depthWrite:e.zWrite>.5,depthFunc:t(Sn,e.zTest,`depth test`),side:t(Cn,e.cull,`cull mode`)}}var Tn=class e{static async create(t,n,{runtimeMesh:r,profile:i,textures:a,clock:o}){let s=new e;return await s.init(t,n,{runtimeMesh:r,profile:i,textures:a,clock:o}),s}async init(e,t,{runtimeMesh:n,profile:r,textures:i,clock:a=()=>performance.now()/1e3}){this.controller=t,this.records=[],this.disposed=!1,this.active=[],this.acquired=[];let o=[];if(e.traverse(e=>{e.isMesh&&e.name===n&&o.push(e)}),o.length!==1||Array.isArray(o[0].material))throw Error(`Particles dissolve runtime mesh mismatch: `+n);let s=o[0],c=wn(r.state),l={};try{for(let[e,t]of Object.entries(i))if(t){let{texture:n,release:r}=await t();this.acquired.push(r),l[e]=n}}catch(e){throw this.releaseTextures(),e}if(!l.main)throw this.releaseTextures(),Error(`Particles dissolve: _MainTex unavailable`);let u=!r.ignoreVertexColor&&!!s.geometry.attributes.color;this.uniforms=bn(r,l,{unit:Q(e,s)});let d=new w({name:s.material.name,transparent:!0,premultipliedAlpha:!0,blending:5,blendSrc:c.blendSrc,blendDst:c.blendDst,blendEquation:100,depthWrite:c.depthWrite,depthFunc:c.depthFunc,side:c.side,vertexColors:u});d.onBeforeCompile=e=>yn(e,this.uniforms,{vertexColors:u}),d.customProgramCacheKey=()=>`zzz-particles-dissolve-v1|`+ +u,d.onBeforeRender=()=>{this.uniforms.pdTime.value=a()-r.timeOffset},this.records.push({mesh:s,baseline:s.material,material:d}),this.upstream=t.applySettings,this.wrapper=e=>{this.upstream.call(t,e),this.reapply()},t.applySettings=this.wrapper,this.reapply()}reapply(){for(let e of this.records)e.mesh.material=e.material}releaseTextures(){for(let e of this.acquired.splice(0))e()}dispose(){if(!this.disposed){this.disposed=!0;for(let e of this.records)e.mesh.material===e.material&&(e.mesh.material=e.baseline),e.material.dispose();this.controller.applySettings===this.wrapper&&(this.controller.applySettings=this.upstream),this.releaseTextures()}}},En=[2,1,0],Dn=class e{static async create(t,n,{runtimeMesh:r,profile:i,textures:a={}}){let o=new e;return await o.init(t,n,{runtimeMesh:r,profile:i,textures:a}),o}async init(e,t,{runtimeMesh:n,profile:r,textures:i={}}){this.controller=t,this.records=[],this.disposed=!1,this.active=[],this.acquired=[];let a=[];if(e.traverse(e=>{e.isMesh&&e.name===n&&a.push(e)}),a.length!==1||Array.isArray(a[0].material))throw Error(`Unity Standard runtime mesh mismatch: `+n);let o=a[0],s={};try{for(let[e,t]of Object.entries(i)){if(!t)continue;let{texture:n,release:r}=await t();this.acquired.push(r),s[e]=n}}catch(e){throw this.releaseTextures(),e}let l=s.metallicGloss?r.glossMapScale:r.glossiness,u=new S({name:o.material.name,color:new c(r.color[0],r.color[1],r.color[2]),opacity:r.color[3],transparent:r.renderMode>=2,alphaTest:r.renderMode===1?r.cutoff:0,metalness:r.metallic,roughness:1-Math.min(1,Math.max(0,l)),emissive:new c(r.emissionColor[0],r.emissionColor[1],r.emissionColor[2]),emissiveIntensity:1,map:s.main??null,normalMap:s.bump??null,normalScale:new C(r.bumpScale,r.bumpScale),emissiveMap:s.emission??null,aoMap:s.occlusion??null,aoMapIntensity:r.occlusionStrength,depthWrite:r.zWrite>.5,side:En[Math.round(r.cull)]??0});this.records.push({mesh:o,baseline:o.material,material:u}),this.upstream=t.applySettings,this.wrapper=e=>{this.upstream.call(t,e),this.reapply()},t.applySettings=this.wrapper,this.reapply()}reapply(){for(let e of this.records)e.mesh.material=e.material}releaseTextures(){for(let e of this.acquired.splice(0))e()}dispose(){if(!this.disposed){this.disposed=!0;for(let e of this.records)e.mesh.material===e.material&&(e.mesh.material=e.baseline),e.material.dispose();this.controller.applySettings===this.wrapper&&(this.controller.applySettings=this.upstream),this.releaseTextures()}}},On=[2,1,0],kn=class e{static async create(t,n,{runtimeMesh:r,profile:i,textures:a={}}){let o=new e;return await o.init(t,n,{runtimeMesh:r,profile:i,textures:a}),o}async init(e,t,{runtimeMesh:n,profile:r,textures:i={}}){this.controller=t,this.records=[],this.disposed=!1,this.active=[],this.acquired=[];let a=[];if(e.traverse(e=>{e.isMesh&&e.name===n&&a.push(e)}),a.length!==1||Array.isArray(a[0].material))throw Error(`NapAvatarScreen runtime mesh mismatch: `+n);let o=a[0],s={};try{for(let[e,t]of Object.entries(i)){if(!t)continue;let{texture:n,release:r}=await t();this.acquired.push(r),s[e]=n}}catch(e){throw this.releaseTextures(),e}s.main&&(Array.isArray(r.uvScale)&&r.uvScale.length===2&&(s.main.repeat.set(r.uvScale[0],r.uvScale[1]),s.main.wrapS=l,s.main.wrapT=l),Array.isArray(r.uvOffset)&&r.uvOffset.length===2&&s.main.offset.set(r.uvOffset[0],r.uvOffset[1]),s.main.needsUpdate=!0);let u=r.alphaMode===`blend`||r.srcBlend===5&&r.dstBlend===10,d=r.alphaClip?r.cutoff:u?.02:0,f=new S({name:o.material.name,color:new c(r.color[0],r.color[1],r.color[2]),opacity:r.color[3],transparent:u,alphaTest:d,metalness:r.metallic,roughness:r.roughness,emissive:new c(r.emissionColor[0],r.emissionColor[1],r.emissionColor[2]),emissiveIntensity:+!!r.emission,emissiveMap:r.emission?s.main??null:null,map:s.main??null,depthWrite:r.zWrite>.5,side:On[Math.round(r.cull)]??0});this.records.push({mesh:o,baseline:o.material,material:f}),this.upstream=t.applySettings,this.wrapper=e=>{this.upstream.call(t,e),this.reapply()},t.applySettings=this.wrapper,this.reapply()}reapply(){for(let e of this.records)e.mesh.material=e.material}releaseTextures(){for(let e of this.acquired.splice(0))e()}dispose(){if(!this.disposed){this.disposed=!0;for(let e of this.records)e.mesh.material===e.material&&(e.mesh.material=e.baseline),e.material.dispose();this.controller.applySettings===this.wrapper&&(this.controller.applySettings=this.upstream),this.releaseTextures()}}};function An(e){return Array.from({length:6},(t,n)=>{let r=/^#([0-9a-f]{6})$/i.exec(e?.[n]??``);return r?[0,2,4].map(e=>parseInt(r[1].slice(e,e+2),16)/255):[1,1,1]})}var jn=class{constructor({contract:e,side:t,controller:n,poolFactory:r=()=>new B}){this.contract=Kt(e),this.side=t,this.controller=n,this.pool=r(),this.layers=[],this.results=[],this.pending=new Set,this.disposed=!1}async prepareSurface(e){if(this.disposed)return null;if(e.mode===`stencil-shadow`)return{layer:null,result:{runtimeMesh:e.runtimeMesh,status:e.status,mode:e.mode,issues:e.issues}};if(e.mode===`gun-eye`)try{return{layer:new gn(this.side.loaded.root,this.controller,{runtimeMesh:e.runtimeMesh,profile:e.gunEye}),result:{runtimeMesh:e.runtimeMesh,status:e.status,mode:e.mode,issues:e.issues}}}catch(t){return{layer:new U(this.side.loaded.root,this.controller,{runtimeMeshes:[e.runtimeMesh]}),result:{runtimeMesh:e.runtimeMesh,status:`fallback`,mode:`lit-albedo`,issues:[String(t.message??t)]}}}if(e.mode===`particles-dissolve`)try{let t=Object.fromEntries(Object.entries(e.particles.maps).map(([e,t])=>[e,()=>this.pool.acquire(this.contract.resources[t])])),n=await Tn.create(this.side.loaded.root,this.controller,{runtimeMesh:e.runtimeMesh,profile:e.particles,textures:t});return this.disposed?(n.dispose(),null):{layer:n,result:{runtimeMesh:e.runtimeMesh,status:e.status,mode:e.mode,issues:e.issues}}}catch(t){return this.disposed?null:{layer:new U(this.side.loaded.root,this.controller,{runtimeMeshes:[e.runtimeMesh]}),result:{runtimeMesh:e.runtimeMesh,status:`fallback`,mode:`lit-albedo`,issues:[String(t.message??t)]}}}if(e.mode===`unity-standard`)try{let t=Object.fromEntries(Object.entries(e.unityStandard.maps??{}).map(([e,t])=>[e,()=>this.pool.acquire(this.contract.resources[t])])),n=await Dn.create(this.side.loaded.root,this.controller,{runtimeMesh:e.runtimeMesh,profile:e.unityStandard,textures:t});return this.disposed?(n.dispose(),null):{layer:n,result:{runtimeMesh:e.runtimeMesh,status:e.status,mode:e.mode,issues:e.issues}}}catch(t){return this.disposed?null:{layer:new U(this.side.loaded.root,this.controller,{runtimeMeshes:[e.runtimeMesh]}),result:{runtimeMesh:e.runtimeMesh,status:`fallback`,mode:`lit-albedo`,issues:[String(t.message??t)]}}}if(e.mode===`nap-avatar-screen`)try{let t=Object.fromEntries(Object.entries(e.napAvatarScreen.maps??{}).map(([e,t])=>[e,()=>this.pool.acquire(this.contract.resources[t])])),n=await kn.create(this.side.loaded.root,this.controller,{runtimeMesh:e.runtimeMesh,profile:e.napAvatarScreen,textures:t});return this.disposed?(n.dispose(),null):{layer:n,result:{runtimeMesh:e.runtimeMesh,status:e.status,mode:e.mode,issues:e.issues}}}catch(t){return this.disposed?null:{layer:new U(this.side.loaded.root,this.controller,{runtimeMeshes:[e.runtimeMesh]}),result:{runtimeMesh:e.runtimeMesh,status:`fallback`,mode:`lit-albedo`,issues:[String(t.message??t)]}}}let t,n=()=>{};try{if(e.status===`fallback`)throw Error(e.issues.join(`; `)||`Missing verified material`);let r=[];if(this.side.loaded.root.traverse(t=>{t.name===e.runtimeMesh&&r.push(t)}),r.length!==1||r[0].material.name!==e.materialName)throw Error(`Runtime surface/material mismatch`);let i=qt(this.contract,e);n=Mn(r[0],i.face),t=new Lt(this.side.loaded.root,i.base,this.controller,this.pool,i.lighting,i.face,i.family,i.reflection,i.calibration,null,void 0,{runtimeMeshes:[e.runtimeMesh],ownsPool:!1,materialState:Jt(e,r[0].material)});let a=t.dispose.bind(t);return t.dispose=()=>{a(),n()},this.pending.add(t),await t.setMode({...e.runtimeOptions,lightDirection:this.direction()}),this.pending.delete(t),this.disposed?(t.dispose(),null):{layer:t,result:{runtimeMesh:e.runtimeMesh,status:e.status,mode:e.mode,issues:e.issues}}}catch(r){return t&&this.pending.delete(t),t?.dispose(),n(),this.disposed?null:{layer:new U(this.side.loaded.root,this.controller,{runtimeMeshes:[e.runtimeMesh]}),result:{runtimeMesh:e.runtimeMesh,status:`fallback`,mode:`lit-albedo`,issues:[String(r.message??r)]}}}}async prepare(){let e=this.pool.preload?.(Object.values(this.contract.resources??{}),()=>!this.disposed),t=await Promise.all(this.contract.surfaces.map(e=>this.prepareSurface(e)));for(let e of t)e&&(e.layer&&(this.disposed?e.layer.dispose():this.layers.push(e.layer)),this.disposed||this.results.push(e.result));if(await e,!this.disposed)try{this.hairShadow=fn(this.contract,{root:this.side.loaded.root,scene:this.side.scene,lightDirection:()=>this.direction()})}catch(e){let t=this.results.find(e=>e.mode===`stencil-shadow`);t&&(t.status=`fallback`,t.issues=[...t.issues,`Hair shadow effect unavailable: `+String(e.message??e)])}this.coverage=Object.fromEntries([`complete`,`partial`,`fallback`].map(e=>[e,this.results.filter(t=>t.status===e).length]))}direction(){let e=this.side.lights.key;return e.getWorldPosition(new E).sub(e.target.getWorldPosition(new E)).normalize()}syncLight(){let e=this.direction();for(let t of this.layers)for(let n of t.active??[])n.lighting?.e02Light.value.copy(e)}update(e){this.hairShadow?.setEnabled(e?.shadowsEnabled??!0);let t=this.direction();for(let t of this.layers)t.setOffset?.(e?.zzzGunEyeOffset);for(let n of this.layers)for(let r of n.active??[]){r.lighting?.e02Light.value.copy(t),r.lighting?.e021AlbedoShade&&(r.lighting.e021AlbedoShade.value=+(e?.zzzAlbedoShade!==!1),r.lighting.e021CharCurve.value.set(e?.zzzCharCurveThreshold??.8,e?.zzzCharCurveMax??1.2,+(e?.zzzCharCurve===!0)),r.lighting.e021CharAmbient.value.set(...An([e?.zzzCharAmbient??`#000000`])[0]));let n=r.lighting;if(!n?.e021SkinTints)continue;if(n.e021ColorTint&&n.e021ColorTint.value.copy(n.e021SourceColor.value),n.e021EntityShadow.value=e?.zzzEntityShadow??1,n.e021FadeByZ.value=+(e?.zzzFadeByZ!==!1),r.zzzUnit??=Q(this.side.loaded.root,r.mesh),n.e021UnitScale.value=r.zzzUnit,n.e021RimOn){n.e021RimOn.value=+(e?.rimLightEnabled!==!1),n.e021RimIntensity.value=e?.zzzRimIntensity??10;let t=e?.zzzRimStyle;n.e021RimStyle.value.set(...Array.isArray(t)&&t.length===4?t:[1,1,1,1]),n.e021RimTint.value.set(...An([e?.zzzRimColor])[0]),n.e021LightColor.value.set(this.side.lights.key.color.r,this.side.lights.key.color.g,this.side.lights.key.color.b)}let i=An(e?.zzzSkinTints),a=An(e?.zzzPostTints);for(let e=0;e<6;e++)n.e021SkinTints.value[e].set(...i[e]),n.e021GlobalTints.value[e].set(...a[e])}}dispose(){if(!this.disposed){this.disposed=!0,this.hairShadow?.dispose(),this.hairShadow=null;for(let e of this.pending)e.dispose();this.pending.clear();for(let e of this.layers.slice().reverse())e.dispose();this.layers=[],this.pool.dispose()}}};function Mn(t,n){if(!n)return()=>{};let r=n.colors?.reconstructedBytes,i=n.uv3?.values,a=t.geometry.attributes.position.count;if(r&&t.geometry.attributes.color_1&&!n.colors.replaceVerifiedAttribute)throw Error(`Refusing to replace an unexpected existing COLOR_1`);if(r&&r.length!==a*4)throw Error(`Facial colour sidecar dimensions mismatch`);if(i&&i.length!==a*2)throw Error(`Facial TEXCOORD3 sidecar dimensions mismatch`);let o=t.geometry,s=o.clone();if(r){let t=new Float32Array(r.length);for(let e=0;e<r.length;e++)t[e]=e%4==3?r[e]/255:Rt(r[e]/255);s.setAttribute(`color_1`,new e(t,4))}let c=new Float32Array(a*3);if(i)for(let e=0;e<a;e++)c[3*e]=i[2*e],c[3*e+1]=i[2*e+1],c[3*e+2]=1;s.setAttribute(`e021Uv3`,new e(c,3)),t.geometry=s;let l=!1;return()=>{l||(l=!0,t.geometry===s&&(t.geometry=o),s.dispose())}}function Nn(e){if(typeof e==`string`)return e.trim().replace(/\/+$/,``);let t={BASE_URL:`./`,DEV:!1,MODE:`production`,PROD:!0,PUBLIC_ASSETS_BASE_URL:`https://assets.zzz-studio.app`,PUBLIC_SITE_URL:`	https://zzz-studio.app`,SSR:!1},n=t?.PUBLIC_ASSETS_BASE_URL??t?.VITE_PUBLIC_ASSETS_BASE_URL;if(typeof n==`string`&&n.trim())return n.trim().replace(/\/+$/,``);let r={},i=r?.PUBLIC_ASSETS_BASE_URL??r?.VITE_PUBLIC_ASSETS_BASE_URL;return typeof i==`string`&&i.trim()?i.trim().replace(/\/+$/,``):``}function Pn(e,t){let n=e?.contract??e;if(Kt(n),n.model.sha256!==t)throw Error(`Candidate model hash mismatch`);return e?.contract?e:{version:1,contract:n}}async function Fn(e,{baseUrl:t,fetcher:n=fetch,preferRemote:r}={}){let i=Nn(t);if(i&&(r??!!i)){let t=`/contracts/${encodeURIComponent(e)}.json`,r=await n(t,{cache:`default`}).catch(()=>null),a=/\bjson\b/i.test(r?.headers?.get?.(`content-type`)??``);if(r?.ok&&a){let t=await r.json().catch(()=>null);if(t)return Pn(t,e)}let o=await n(`${i}${t}`,{cache:`default`}).catch(()=>null);if(o?.status===404)return null;if(o?.ok)return Pn(await o.json(),e);if(o)throw Error(`Candidate contract HTTP `+o.status);return null}let a=await n(`/api/zzz-global?`+new URLSearchParams({model:e}).toString(),{cache:`no-store`}).catch(()=>null);if(a?.ok)return Pn(await a.json(),e);if(i&&(!a||a.status===404||a.status===503)){let t=await n(`${i}/contracts/${encodeURIComponent(e)}.json`,{cache:`default`});if(t.status===404)return null;if(!t.ok)throw Error(`Candidate contract HTTP `+t.status);return Pn(await t.json(),e)}if(!a)throw Error(`Candidate contract network failure`);if(a.status===404)return null;throw Error(`Candidate contract HTTP `+a.status)}function In(e){return{name:e.name,type:e.type,role:e.userData.zzzRenderRole??`surface`,alphaPolicy:e.userData.zzzAlphaPolicy??null,transparent:e.transparent,alphaTest:e.alphaTest,opacity:e.opacity,side:e.side,depthWrite:e.depthWrite,depthTest:e.depthTest,colorWrite:e.colorWrite,metalness:e.metalness??null,roughness:e.roughness??null,specularIntensity:e.specularIntensity??null,specularColor:e.specularColor?.toArray()??null,emissive:e.emissive?.toArray()??null,emissiveIntensity:e.emissiveIntensity??null,maps:Object.fromEntries([`map`,`normalMap`,`alphaMap`,`emissiveMap`].map(t=>[t,e[t]?.name??null]))}}function Ln(e,t){let n=(Array.isArray(e.material)?e.material:[e.material]).map(In),r=n.flatMap((e,t)=>e.depthWrite?e.transparent&&e.alphaTest===0?[`${t}:BLEND without alpha-test`]:[]:[`${t}:depthWrite=false`]),i=!0;for(let t=e;t;t=t.parent)i&&=t.visible;return{mesh:e.name,materials:n,skinned:!!e.isSkinnedMesh,morphTargets:e.morphTargetInfluences?.length??0,visible:e.visible,effectiveVisible:i,layerMatch:t?e.layers.test(t.layers):null,policyIncluded:r.length===0,reasons:r,frustumCulled:e.frustumCulled,scope:`Policy eligibility only; ancestor visibility and camera layers reported separately; no rasterization claim`}}var Rn=class{constructor({orthographic:e=!1,size:t=null,scale:n=1,include:r=null}={}){this.orthographic=e,this.size=t,this.scale=n,this.include=r,this.target=null,this.materials=new Map,this.boundUniforms=new Set,this.frames=0,this.created=0,this.disposed=0,this.materialsCreated=0,this.materialsDisposed=0,this.last=null,this.failure=null,this.capturing=!1,this.saved=[],this.savedCount=0,this.pieces=[],this.sizeScratch=new C,this.viewportScratch=new y,this.scissorScratch=new y}depthMaterial(e){let t=this.materials.get(e);return t||(t=new te({depthPacking:p,map:e.map,alphaMap:e.alphaMap,alphaTest:e.alphaTest,opacity:e.opacity,side:e.side,depthTest:e.depthTest,depthWrite:e.depthWrite,vertexColors:e.vertexColors,alphaHash:e.alphaHash,polygonOffset:e.polygonOffset,polygonOffsetFactor:e.polygonOffsetFactor,polygonOffsetUnits:e.polygonOffsetUnits,displacementMap:e.displacementMap,displacementScale:e.displacementScale,displacementBias:e.displacementBias}),t.colorWrite=!1,this.materials.set(e,t),this.materialsCreated++),t}release(){for(let e of this.boundUniforms)e.e0310Depth.value=null;this.boundUniforms.clear(),this.target&&(this.target.dispose(),this.target=null,this.disposed++);for(let e of this.materials.values())e.dispose(),this.materialsDisposed++;this.materials.clear(),this.saved.length=0,this.savedCount=0,this.pieces.length=0}stats(){return{frames:this.frames,created:this.created,disposed:this.disposed,materialsCreated:this.materialsCreated,materialsDisposed:this.materialsDisposed,last:this.last,failure:this.failure}}capture(e,t,n,{matricesCurrent:r=!1}={}){if(this.capturing)return;if(!(t.isPerspectiveCamera||this.orthographic&&t.isOrthographicCamera)||t.coordinateSystem!==2e3||t.reversedDepth||e.renderer.capabilities.logarithmicDepthBuffer||e.renderer.capabilities.reversedDepthBuffer)throw Error(`E3.10 unsupported perspective/depth convention; retain E3.9`);let i=e.renderer,o=this.size?this.sizeScratch.set(this.size,this.size):i.getDrawingBufferSize(this.sizeScratch);this.size||o.set(Math.max(1,Math.round(o.x*this.scale)),Math.max(1,Math.round(o.y*this.scale))),this.target||(this.target=new h(o.x,o.y,{minFilter:d,magFilter:d,depthBuffer:!0,stencilBuffer:!1,samples:0}),this.target.depthTexture=new m(o.x,o.y,a),this.created++),this.target.setSize(o.x,o.y);let s={target:i.getRenderTarget(),viewport:i.getViewport(this.viewportScratch),scissor:i.getScissor(this.scissorScratch),scissorTest:i.getScissorTest(),autoClear:i.autoClear,background:e.scene.background,override:e.scene.overrideMaterial,sceneMatrices:e.scene.matrixWorldAutoUpdate,cameraMatrices:t.matrixWorldAutoUpdate},c=this.saved,l=this.pieces,u=0,f=0;this.savedCount=0,l.length=0,this.capturing=!0;let p=i.shadowMap,g=!!p?.needsUpdate;p&&(p.needsUpdate=!1);try{e.scene.traverse(e=>{if(!e.isMesh)return;let n=Ln(e,t);this.include&&!this.include(e)&&(n.policyIncluded=!1,n.reasons.push(`outside explicit surface contract`)),l.push(n);let r=e.material,i=c[this.savedCount]??={mesh:null,original:null,visible:!0};this.savedCount++,i.mesh=e,i.original=r,i.visible=e.visible,n.policyIncluded?(e.material=Array.isArray(r)?r.map(e=>this.depthMaterial(e)):this.depthMaterial(r),u++):(e.visible=!1,f++)}),r&&(e.scene.matrixWorldAutoUpdate=!1,t.matrixWorldAutoUpdate=!1),e.scene.background=null,e.scene.overrideMaterial=null,i.autoClear=!0,i.setRenderTarget(this.target),i.setViewport(0,0,o.x/i.getPixelRatio(),o.y/i.getPixelRatio()),i.setScissorTest(!1),i.clear(),i.render(e.scene,t),this.frames++,this.last={width:o.x,height:o.y,pixelRatio:i.getPixelRatio(),near:t.near,far:t.far,fov:2*Math.atan(1/t.projectionMatrix.elements[5])*180/Math.PI,samples:this.target.samples,included:u,excluded:f,pieces:l,units:`positive camera-space distance; view display normalized near..far`,policy:`Opaque/alpha-test only; blended and depthWrite=false excluded; no Unity stencil/custom depth contract`},this.last.projection=t.isOrthographicCamera?`orthographic`:`perspective`,t.isOrthographicCamera&&(this.last.fov=null)}finally{for(let e=0;e<this.savedCount;e++){let t=c[e];t.mesh.material=t.original,t.mesh.visible=t.visible,t.mesh=null,t.original=null}this.savedCount=0,e.scene.background=s.background,e.scene.overrideMaterial=s.override,i.setRenderTarget(s.target),i.setViewport(s.viewport),i.setScissor(s.scissor),i.setScissorTest(s.scissorTest),i.autoClear=s.autoClear,p&&(p.needsUpdate=p.needsUpdate||g),this.capturing=!1,e.scene.matrixWorldAutoUpdate=s.sceneMatrices,t.matrixWorldAutoUpdate=s.cameraMatrices}for(let e of n.active)if(e.rim){let n=e.rim;this.boundUniforms.add(n),n.e0310Depth.value=this.target.depthTexture,n.e0310Camera.value.set(t.near,t.far,0,0),n.e0310Resolution.value=o.clone()}}dispose(){this.release()}},zn=class{constructor(){this.cache=new WeakMap,this.builds=0,this.evaluations=0,this.points=0,this.fallbacks=0,this.boneTransforms=0}compute(e){this.evaluations++;let t=e.geometry,r=t.attributes,i=t.morphAttributes.position??[],a=[r.position,r.position.version,r.skinIndex,r.skinIndex.version,r.skinWeight,r.skinWeight.version,t.morphTargetsRelative,...i.flatMap(e=>[e,e.version])],o=this.cache.get(t);if(!o||a.some((e,t)=>e!==o.signature[t])){let e=new Map;for(let t=0;t<r.position.count;t++){let n=[],a=[];for(let e=0;e<4;e++)n.push(r.skinIndex.getComponent(t,e)),a.push(r.skinWeight.getComponent(t,e));let o=n.map((e,t)=>e+`:`+a[t]).join(`,`),s=e.get(o);s||(s={indices:n,weights:a,positions:[],sourceIndices:[],seen:new Set},e.set(o,s));let c=[r.position.getX(t),r.position.getY(t),r.position.getZ(t)],l=c.join(`,`);(i.length||!s.seen.has(l))&&(s.seen.add(l),s.positions.push(...c),s.sourceIndices.push(t))}o={signature:a,groups:[...e.values()].map(({indices:e,weights:t,positions:n,sourceIndices:r})=>({indices:e,weights:t,positions:new Float64Array(n),sourceIndices:r})),bones:[],usedBones:[...new Set([...e.values()].flatMap(e=>e.indices.filter((t,n)=>e.weights[n]!==0)))],blend:new b},this.cache.set(t,o),this.builds++}let s=[];for(let t=0;t<i.length;t++){let n=e.morphTargetInfluences?.[t]??0;n!==0&&s.push({attribute:i[t],weight:n})}let c=e.skeleton;for(let t of o.usedBones)(o.bones[t]??=new b).multiplyMatrices(c.bones[t].matrixWorld,c.boneInverses[t]).premultiply(e.bindMatrixInverse).multiply(e.bindMatrix),this.boneTransforms++;let l=e.boundingBox??=new n;l.makeEmpty();let u=1/0,d=1/0,f=1/0,p=-1/0,m=-1/0,h=-1/0;for(let n of o.groups){let r=o.blend.elements;r.fill(0);let i=0;for(let e=0;e<4;e++){let t=n.weights[e];if(t===0)continue;i+=t;let a=o.bones[n.indices[e]].elements;for(let e=0;e<16;e++)r[e]+=t*a[e]}r[3]=r[7]=r[11]=0,r[15]=1;let a=e.bindMatrixInverse.elements,c=1-i;r[12]+=c*a[12],r[13]+=c*a[13],r[14]+=c*a[14];let l=r,g=n.positions;this.points+=g.length/3;for(let e=0;e<g.length;e+=3){let r=g[e],i=g[e+1],a=g[e+2];if(s.length){let o=n.sourceIndices[e/3],c=0,l=0,u=0;for(let{attribute:e,weight:n}of s)c+=(e.getX(o)-(t.morphTargetsRelative?0:r))*n,l+=(e.getY(o)-(t.morphTargetsRelative?0:i))*n,u+=(e.getZ(o)-(t.morphTargetsRelative?0:a))*n;r+=c,i+=l,a+=u}let o=l[0]*r+l[4]*i+l[8]*a+l[12],c=l[1]*r+l[5]*i+l[9]*a+l[13],_=l[2]*r+l[6]*i+l[10]*a+l[14];u=Math.min(u,o),d=Math.min(d,c),f=Math.min(f,_),p=Math.max(p,o),m=Math.max(m,c),h=Math.max(h,_)}}return l.min.set(u,d,f),l.max.set(p,m,h),l}stats(){return{builds:this.builds,evaluations:this.evaluations,points:this.points,morphFallbacks:this.fallbacks,boneTransforms:this.boneTransforms}}dispose(){this.cache=new WeakMap}},Bn=(e,t)=>!!e&&e.length===t.length&&e.every((e,n)=>e===t[n]);function Vn(e,t,n,r,i){n.length=0,n.push(t.layers.mask),r.clear(),i.clear();for(let{mesh:t}of e){let e=t.geometry;n.push(t,e,...t.matrixWorld.elements,...t.bindMatrix?.elements??[],...t.bindMatrixInverse?.elements??[],...t.morphTargetInfluences??[]);for(let e=t;e;e=e.parent)n.push(e,e.visible,e.layers.mask);for(let t of[`position`,`skinIndex`,`skinWeight`]){let r=e.attributes[t];n.push(r,r?.version)}for(let t of Object.values(e.morphAttributes))for(let e of t)n.push(e,e.version);for(let e of Array.isArray(t.material)?t.material:[t.material]){n.push(e,e.version,e.visible,e.depthWrite,e.transparent,e.alphaTest,e.opacity,e.side,e.displacementScale,e.displacementBias);for(let t of[e.map,e.alphaMap,e.displacementMap])n.push(t,t?.version,t?.offset.x,t?.offset.y,t?.repeat.x,t?.repeat.y,t?.rotation)}if(t.skeleton)for(let e=0;e<t.skeleton.bones.length;e++){let a=t.skeleton.bones[e];r.has(a)||(n.push(a,...a.matrixWorld.elements),r.add(a));let o=t.skeleton.boneInverses[e];i.has(o)||(n.push(o,...o.elements),i.add(o))}}return n}var Hn=Object.freeze({shadows:!0,rim:!0,ramp:!1,strength:.35,width:2,intensity:.2,bias:.001,gap:.002,diagnostic:`none`});function Un(e={}){let t={...Hn,...e};for(let e of[`shadows`,`rim`,`ramp`])if(typeof t[e]!=`boolean`)throw Error(`Invalid depth `+e);for(let[e,n,r]of[[`strength`,0,1],[`width`,0,6],[`intensity`,0,2],[`bias`,0,.02],[`gap`,1e-4,.05]])if(!Number.isFinite(t[e])||t[e]<n||t[e]>r)throw Error(`Invalid depth `+e);if(![`none`,`shadow`,`rim`].includes(t.diagnostic))throw Error(`Invalid depth diagnostic`);return t}var Wn=`vec2 texel=(floor(tap*p5ShadowSize)+.5)/p5ShadowSize;
     float receiver=p5ReceiverCoord.z+dot(p5ReceiverSlope,texel-p5ReceiverCoord.xy);
     p5Visibility+=step(receiver-p5CompareBias,texture2D(p5Shadow,texel).r)/9.0;`,Gn=`vec2 p5St=tap*p5ShadowSize-.5,p5Base=floor(p5St),p5F=p5St-p5Base;
     vec2 p5T0=clamp((p5Base+vec2(0.0,0.0)+.5)/p5ShadowSize,.5/p5ShadowSize,1.0-.5/p5ShadowSize);float p5S0=step(p5ReceiverCoord.z+dot(p5ReceiverSlope,p5T0-p5ReceiverCoord.xy)-p5CompareBias,texture2D(p5Shadow,p5T0).r);vec2 p5T1=clamp((p5Base+vec2(1.0,0.0)+.5)/p5ShadowSize,.5/p5ShadowSize,1.0-.5/p5ShadowSize);float p5S1=step(p5ReceiverCoord.z+dot(p5ReceiverSlope,p5T1-p5ReceiverCoord.xy)-p5CompareBias,texture2D(p5Shadow,p5T1).r);
     vec2 p5T2=clamp((p5Base+vec2(0.0,1.0)+.5)/p5ShadowSize,.5/p5ShadowSize,1.0-.5/p5ShadowSize);float p5S2=step(p5ReceiverCoord.z+dot(p5ReceiverSlope,p5T2-p5ReceiverCoord.xy)-p5CompareBias,texture2D(p5Shadow,p5T2).r);vec2 p5T3=clamp((p5Base+vec2(1.0,1.0)+.5)/p5ShadowSize,.5/p5ShadowSize,1.0-.5/p5ShadowSize);float p5S3=step(p5ReceiverCoord.z+dot(p5ReceiverSlope,p5T3-p5ReceiverCoord.xy)-p5CompareBias,texture2D(p5Shadow,p5T3).r);
     p5Visibility+=mix(mix(p5S0,p5S1,p5F.x),mix(p5S2,p5S3,p5F.x),p5F.y)/9.0;`;function Kn(e,t,{facial:n=!1,regional:r=!1,bilinear:i=!1,ramp:a=!1}={}){if(!e.vertexShader.includes(`#include <project_vertex>`)||!e.fragmentShader.includes(`#include <opaque_fragment>`))throw Error(`Global depth shader anchors changed`);Object.assign(e.uniforms,t);let o=n&&!/attribute\s+vec4\s+color_1\s*;/.test(e.vertexShader)?`attribute vec4 color_1;`:``;e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
 varying vec3 p5World;
 ${o}${n?`varying float p5FaceId;`:``}`).replace(`#include <project_vertex>`,`#include <project_vertex>
 p5World=(modelMatrix*vec4(transformed,1.0)).xyz;
 ${n?`float p5B=color_1.b<=0.0031308?12.92*color_1.b:1.055*pow(color_1.b,1.0/2.4)-0.055;p5FaceId=float(int(floor(p5B*255.0+0.5))&3);`:``}`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
 varying vec3 p5World;
 ${n?`varying float p5FaceId;`:``}
 uniform sampler2D p5Shadow,p5Depth,p5Region;
 uniform mat4 p5LightMatrix;
 uniform mat3 p5RegionUV;
 uniform vec2 p5Resolution,p5ShadowSize,p5Camera;
 uniform vec3 p5LightView,p5LightColors[5],p5ShadowColors[5];
 uniform vec4 p5Flags,p5Settings;
 uniform float p5Bias,p5NormalOffset,p5Gap,p5Diagnostic;
 float p5Linear(float z){return p5Camera.x/(1.0-z+z*p5Camera.x/p5Camera.y);}
 vec3 p5Decode(vec3 c){return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(vec3(.04045),c));}
 `);let s=`
 // Directional orthographic shadow map. Bias is converted from world distance.
 vec4 p5Clip=p5LightMatrix*vec4(p5World,1.0);
 vec3 p5Coord=p5Clip.xyz/p5Clip.w*.5+.5;
 // Evaluate derivatives outside the divergent bounds branch. PCF compares each
 // texel against the receiver plane at that texel, not against its centre depth.
 vec3 p5Dx=dFdx(p5Coord),p5Dy=dFdy(p5Coord);
 float p5Det=p5Dx.x*p5Dy.y-p5Dx.y*p5Dy.x;
 vec2 p5ReceiverSlope=vec2(0.0);
 if(abs(p5Det)>1e-12)p5ReceiverSlope=vec2(p5Dy.y*p5Dx.z-p5Dx.y*p5Dy.z,p5Dx.x*p5Dy.z-p5Dy.x*p5Dx.z)/p5Det;
 // Smooth geometric normal, before normal-map/SDF lighting adjustments. Move
 // only the shadow-test point, never the visible surface or its lighting.
 vec3 p5ReceiverNormal;
 #ifdef FLAT_SHADED
   p5ReceiverNormal=normalize(cross(dFdx(p5World),dFdy(p5World)));
 #else
   p5ReceiverNormal=inverseTransformDirection(normalize(vNormal),viewMatrix);
   #ifdef DOUBLE_SIDED
     p5ReceiverNormal*=faceDirection;
   #endif
 #endif
 vec4 p5ReceiverClip=p5LightMatrix*vec4(p5World+p5ReceiverNormal*p5NormalOffset,1.0);
 vec3 p5ReceiverCoord=p5ReceiverClip.xyz/p5ReceiverClip.w*.5+.5;
 float p5CompareBias=max(p5Bias,8.0/16777215.0);
 float p5Visibility=1.0;
 if(all(greaterThanEqual(p5ReceiverCoord,vec3(0.0)))&&all(lessThanEqual(p5ReceiverCoord,vec3(1.0)))){
   p5Visibility=0.0;
   for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
     vec2 tap=clamp(p5ReceiverCoord.xy+vec2(float(x),float(y))/p5ShadowSize,.5/p5ShadowSize,1.0-.5/p5ShadowSize);
     ${i?Gn:Wn}
   }
 }
 vec2 p5Screen=gl_FragCoord.xy/p5Resolution;
 vec2 p5N=normal.xy;float p5NLength=length(p5N);
 vec2 p5Offset=p5NLength>1e-5?p5N/p5NLength*p5Settings.y/p5Resolution:vec2(0.0);
 vec2 p5NeighborUV=clamp(p5Screen+p5Offset,.5/p5Resolution,1.0-.5/p5Resolution);
 float p5Distance=p5Linear(gl_FragCoord.z);
 float p5Neighbor=p5Linear(texture2D(p5Depth,p5NeighborUV).r);
 float p5Center=p5Linear(texture2D(p5Depth,p5Screen).r);
 // No rim on transparent surfaces absent from the opaque depth prepass.
 float p5Surface=1.0-step(p5Gap,abs(p5Center-p5Distance));
 float p5Edge=smoothstep(p5Gap,2.0*p5Gap,p5Neighbor-p5Distance)*p5Surface;
 p5Edge*=max(dot(normal,normalize(p5LightView)),0.0)*p5Flags.z;
 int p5Id=0;
 ${n?`p5Id=int(clamp(p5FaceId,0.0,2.0));`:r?`float p5MR=texture2D(p5Region,(p5RegionUV*vec3(vMapUv,1.0)).xy).r;p5Id=p5MR<.2?4:(p5MR<.4?3:(p5MR<.6?2:(p5MR<.8?1:0)));`:``}
 outgoingLight*=1.0-p5Flags.x*p5Settings.x*(1.0-p5Visibility);
 outgoingLight+=p5Flags.y*p5Settings.z*p5Edge*p5Decode(mix(p5ShadowColors[p5Id],p5LightColors[p5Id],p5Visibility));
 if(p5Diagnostic==1.0)outgoingLight=vec3(p5Visibility);
 if(p5Diagnostic==2.0)outgoingLight=vec3(p5Edge);
 #include <opaque_fragment>`;if(a&&e.fragmentShader.includes(`float e021CastShadow`)&&e.fragmentShader.includes(`#include <aomap_fragment>`)){let t=s.indexOf(` vec2 p5Screen=`),n=` outgoingLight*=1.0-p5Flags.x*p5Settings.x*(1.0-p5Visibility);
`,r=s.slice(t);if(!r.includes(n))throw Error(`Global depth ramp anchor changed`);e.fragmentShader=e.fragmentShader.replace(`#include <aomap_fragment>`,s.slice(0,t)+` e021CastShadow=mix(1.0,p5Visibility,p5Flags.x*p5Settings.x);
#include <aomap_fragment>`).replace(`#include <opaque_fragment>`,r.replace(n,``))}else e.fragmentShader=e.fragmentShader.replace(`#include <opaque_fragment>`,s)}var qn=class{constructor(e,r,i,a){this.side=e,this.camera=r,this.contract=i,this.pool=a,this.options=Un(),this.bindings=[],this.leases=[],this.cache=new Map,this.saved=[],this.disposed=!1;let o=e=>this.bindings.some(t=>t.mesh===e)&&(!this.contract.allowEmpty||e.material.visible!==!1);this.screen=new Rn({include:o}),this.shadow=new Rn({orthographic:!0,size:i.shadowSize??1024,include:o}),this.bilinear=i.filter===`bilinear`,this.lightCamera=new t,this.created=0,this.released=0,this.frames=0,this.failure=null,this.height=1,this.bounds=new zn,this.poseState=null,this.shadowState=null,this.screenState=null,this.boundsBox=new n,this.reusedFrames=0,this.nextPoseState=[],this.poseRevision=0,this.poseBones=new Set,this.poseInverses=new Set,this.center=new E,this.extent=new E,this.direction=new E,this.lightTarget=new E,this.screenSize=new C,this.matrix=new b,this.transformedBox=new n}async prepare(){try{for(let e of this.contract.bindings){let t=[];if(this.side.loaded.root.traverse(n=>{n.isMesh&&n.name===e.runtimeMesh&&n.material.name===e.materialName&&t.push(n)}),t.length!==1)throw Error(`Depth surface mismatch: `+e.runtimeMesh);let n=null;if(e.region){let t=await this.pool.acquire(e.region);if(this.disposed){t.release();return}this.leases.push(t),n=t.texture,n.updateMatrix()}this.bindings.push({mesh:t[0],binding:e,texture:n})}}catch(e){throw this.dispose(),e}}set(e){this.options=Un({...this.options,...e})}capture({matricesCurrent:e=!1}={}){if(this.disposed||!this.options.shadows&&!this.options.rim&&this.options.diagnostic===`none`)return;let{side:t,camera:n}=this,r=t.renderer;if(!n.isPerspectiveCamera||n.coordinateSystem!==2e3||n.reversedDepth||r.capabilities.logarithmicDepthBuffer||r.capabilities.reversedDepthBuffer)throw Error(`Global depth requires standard WebGL perspective depth`);e||(t.scene.updateMatrixWorld(!0),n.updateMatrixWorld(!0));let i=M(r);(this.shadow.size!==i.shadowSize||this.screen.scale!==i.depthScale)&&(this.shadow.size=i.shadowSize,this.screen.scale=i.depthScale,this.shadowState=this.screenState=null);let a=Vn(this.bindings,n,this.nextPoseState,this.poseBones,this.poseInverses),o=!Bn(this.poseState,a),s=this.boundsBox;if(o){this.poseRevision++,s.makeEmpty();for(let{mesh:e}of this.bindings){let t=Ln(e,n);t.policyIncluded&&t.effectiveVisible&&t.layerMatch&&(!this.contract.allowEmpty||e.material.visible!==!1)&&(e.isSkinnedMesh?s.union(this.transformedBox.copy(this.bounds.compute(e)).applyMatrix4(e.matrixWorld)):(e.geometry.computeBoundingBox(),s.union(this.transformedBox.copy(e.geometry.boundingBox).applyMatrix4(e.matrixWorld))))}}if(s.isEmpty()){if(this.contract.allowEmpty){this.matrix=null,this.nextPoseState=this.poseState??[],this.poseState=a;return}throw Error(`Global depth has no visible opaque casters`)}this.height=Math.max(s.getSize(this.extent).y,1e-4);let c=s.getCenter(this.center),l=Math.max(s.getSize(new E).length()*.55,1e-4),u=t.lights.key,d=u.getWorldPosition(this.direction).sub(u.target.getWorldPosition(this.lightTarget));if(d.lengthSq()<1e-12)throw Error(`Global depth key light has no direction`);d.normalize();let f=[this.poseRevision,d.x,d.y,d.z],p=r.getDrawingBufferSize(this.screenSize),m=[this.poseRevision,...n.matrixWorld.elements,...n.projectionMatrix.elements,p.x,p.y,r.getPixelRatio()],h=!Bn(this.shadowState,f),g=!Bn(this.screenState,m),_=this.lightCamera;h&&(_.position.copy(c).addScaledVector(d,2*l),_.up.set(0,1,0),Math.abs(d.y)>.99&&_.up.set(0,0,1),_.lookAt(c),Object.assign(_,{left:-l,right:l,top:l,bottom:-l,near:l*.05,far:l*4}),_.layers.mask=n.layers.mask,_.updateProjectionMatrix(),_.updateMatrixWorld(!0));let v=!1;if((this.options.shadows||this.options.rim||this.options.diagnostic===`shadow`)&&h&&(this.shadow.capture(t,_,{active:[]},{matricesCurrent:!0}),this.shadowState=f,v=!0),(this.options.rim||this.options.diagnostic===`rim`)&&g&&(this.screen.capture(t,n,{active:[]},{matricesCurrent:!0}),this.screenState=m,v=!0),this.nextPoseState=this.poseState??[],this.poseState=a,v||this.reusedFrames++,v||o){let e=new Set;t.scene.traverse(t=>{if(t.isMesh)for(let n of Array.isArray(t.material)?t.material:[t.material])e.add(n)});for(let t of[this.shadow,this.screen])for(let[n,r]of t.materials)e.has(n)||(r.dispose(),t.materials.delete(n),t.materialsDisposed++)}this.matrix??=new b,this.matrix.multiplyMatrices(_.projectionMatrix,_.matrixWorldInverse),this.lightView=d.transformDirection(n.matrixWorldInverse),v&&this.frames++}begin(){if(this.disposed||!this.matrix||!this.options.shadows&&!this.options.rim&&this.options.diagnostic===`none`)return;let e=new Set,t=this.options,n=this.side.renderer.getDrawingBufferSize(this.screenSize);for(let{mesh:r,binding:i,texture:a}of this.bindings){let o=r.material,s=this.cache.get(o);if(s&&s.ramp!==t.ramp&&(s.material.dispose(),this.cache.delete(o),this.released++,s=null),!s){let e=o.clone(),r=o.onBeforeCompile,c=o.customProgramCacheKey.call(o),l=[,,,,,].fill([0,0,0]),u=i.rim.light??l,d=i.rim.shadow??l,f={p5World:{value:null},p5Shadow:{value:null},p5Depth:{value:null},p5Region:{value:a},p5RegionUV:{value:a?.matrix.clone()??new D},p5LightMatrix:{value:new b},p5Resolution:{value:n.clone()},p5ShadowSize:{value:new C(1024,1024)},p5Camera:{value:new C},p5LightView:{value:new E},p5Flags:{value:new y},p5Settings:{value:new y},p5Bias:{value:0},p5Gap:{value:0},p5Diagnostic:{value:0},p5LightColors:{value:u.map(e=>new E(...e))},p5ShadowColors:{value:d.map(e=>new E(...e))}};f.p5NormalOffset={value:0},e.onBeforeCompile=(e,t)=>{r.call(o,e,t),Kn(e,f,{facial:i.facial,regional:!!a,bilinear:this.bilinear,ramp:p})};let p=t.ramp;e.customProgramCacheKey=()=>c+`|p5-global-depth-v3-geometric-offset-`+i.facial+`-`+!!a+(this.bilinear?`-bilinear`:``)+(p?`-ramp`:``),this.created++;let m=!1;try{let t={uniforms:{},vertexShader:A.physical.vertexShader,fragmentShader:A.physical.fragmentShader};e.onBeforeCompile(t,null),m=p&&t.fragmentShader.includes(`e021CastShadow=mix(`)}catch(t){throw e.dispose(),this.released++,t}s={material:e,u:f,ramp:p,usedRamp:m},this.cache.set(o,s)}let{u:c}=s;e.add(o),c.p5Shadow.value=this.shadow.target?.depthTexture??this.screen.target.depthTexture,c.p5Depth.value=this.screen.target?.depthTexture??this.shadow.target.depthTexture,c.p5ShadowSize.value.set(this.shadow.size,this.shadow.size),c.p5LightMatrix.value.copy(this.matrix),c.p5Resolution.value.copy(n),c.p5Camera.value.set(this.camera.near,this.camera.far),c.p5LightView.value.copy(this.lightView),c.p5NormalOffset.value=(this.lightCamera.right-this.lightCamera.left)/this.shadow.size;let l=this.side.lights.key.intensity>0,u=s.usedRamp?t.strength:Math.min(t.strength,Hn.strength);c.p5Flags.value.set(+(t.shadows&&l&&i.receiveShadows!==!1),+(t.rim&&l),+i.rim.enabled,0),c.p5Settings.value.set(u,t.width,t.intensity,0),c.p5Bias.value=t.bias*this.height/(this.lightCamera.far-this.lightCamera.near),c.p5Gap.value=t.gap*this.height,c.p5Diagnostic.value=[`none`,`shadow`,`rim`].indexOf(t.diagnostic),this.saved.push({mesh:r,base:o,material:s.material}),r.material=s.material}for(let[t,n]of this.cache)e.has(t)||(n.material.dispose(),this.cache.delete(t),this.released++)}end(){for(let{mesh:e,base:t,material:n}of this.saved)e.material===n&&(e.material=t);this.saved=[]}stats(){return{options:this.options,frames:this.frames,reusedFrames:this.reusedFrames,bounds:this.bounds.stats(),created:this.created,released:this.released,failure:this.failure,surfaces:this.bindings.map(e=>({mesh:e.mesh.name,rim:e.binding.rim.enabled,reason:e.binding.rim.reason})),shadow:this.shadow.stats(),screen:this.screen.stats()}}dispose(){if(!this.disposed){this.disposed=!0,this.end();for(let e of this.cache.values())e.material.dispose(),this.released++;this.cache.clear(),this.shadow.dispose(),this.screen.dispose(),this.bounds.dispose(),this.poseState=this.shadowState=this.screenState=null;for(let e of this.leases)e.release();this.leases=[]}}};function Jn(e,t){if(Object.assign(e.uniforms,t),!e.fragmentShader.includes(`#include <opaque_fragment>`))throw Error(`Gem shader anchor changed`);H(e,`flat`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform sampler2D p4Cap,p4Mask,p4Region;
uniform mat3 p4CapUV,p4MaskUV,p4RegionUV;
uniform vec3 p4Tint;
uniform float p4Burst,p4AlphaBurst,p4MaskOnly,p4Diagnostic;
vec3 p4Decode(vec3 c){return vec3(c.r<=0.04045?c.r/12.92:pow((c.r+0.055)/1.055,2.4),c.g<=0.04045?c.g/12.92:pow((c.g+0.055)/1.055,2.4),c.b<=0.04045?c.b/12.92:pow((c.b+0.055)/1.055,2.4));}`),e.fragmentShader=e.fragmentShader.replace(`#include <opaque_fragment>`,`
vec2 p4UV=normal.xy*0.5+0.5;
vec4 p4Texel=texture2D(p4Cap,(p4CapUV*vec3(p4UV,1.0)).xy);
float p4M=texture2D(p4Mask,(p4MaskUV*vec3(vMapUv,1.0)).xy).b;
float p4R=texture2D(p4Region,(p4RegionUV*vec3(vMapUv,1.0)).xy).r;
float p4ID=max(4.0-floor(5.0*p4R),0.0);
float p4A=p4MaskOnly>0.5?clamp(p4M,0.0,1.0):clamp(p4AlphaBurst*clamp(p4Texel.a*p4M,0.0,1.0),0.0,1.0);
vec3 p4Color=p4Decode(p4Texel.rgb)*p4Decode(p4Tint)*p4Burst;
outgoingLight=p4ID<0.5?mix(diffuseColor.rgb,p4Color,p4A):diffuseColor.rgb;
if(p4Diagnostic==1.0)outgoingLight=vec3(p4M);
if(p4Diagnostic==2.0)outgoingLight=vec3(p4ID/4.0);
if(p4Diagnostic==3.0)outgoingLight=p4Color;
if(p4Diagnostic==4.0)outgoingLight=vec3(p4A);
#include <opaque_fragment>`)}function Yn(e,t,n=!1){if(Object.assign(e.uniforms,t),!e.vertexShader.includes(`#include <project_vertex>`)||!e.fragmentShader.includes(`#include <opaque_fragment>`))throw Error(`Hull shader anchors changed`);H(e,`flat`),e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
uniform vec2 p4Resolution;uniform float p4Width;`),e.vertexShader=e.vertexShader.replace(`#include <project_vertex>`,`#include <project_vertex>
// BackSide defines FLIP_SIDED; undo that normal flip for outward extrusion.
vec2 p4Projected=-transformedNormal.xy*vec2(projectionMatrix[0][0],projectionMatrix[1][1])*p4Resolution;
float p4Length=length(p4Projected);
if(p4Length>0.000001)gl_Position.xy+=(p4Projected/p4Length)*(2.0*p4Width/p4Resolution)*gl_Position.w;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
uniform vec3 p4OutlineTint;uniform float p4Darkness;`),e.fragmentShader=e.fragmentShader.replace(`#include <opaque_fragment>`,`outgoingLight=diffuseColor.rgb*p4OutlineTint*p4Darkness;
#include <opaque_fragment>`),n&&(e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
attribute vec4 color_1;varying float globalOutlineFaceId;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
      float globalB=color_1.b<=0.0031308?12.92*color_1.b:1.055*pow(color_1.b,1.0/2.4)-0.055;
      int globalByte=int(floor(globalB*255.0+0.5));globalOutlineFaceId=0.9-float(globalByte&3)*0.2;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
varying float globalOutlineFaceId;uniform vec3 globalOutlineColors[3];`).replace(`outgoingLight=diffuseColor.rgb*p4OutlineTint*p4Darkness;`,`int globalOutlineId=globalOutlineFaceId<0.6?2:(globalOutlineFaceId<0.8?1:0);
      vec3 globalOutlineColor=pow(globalOutlineColors[globalOutlineId]*0.5,vec3(1.5));
      // Facial palette from HoyoToon; pixel width remains an explicit adaptation.
      outgoingLight=diffuseColor.rgb*globalOutlineColor*(p4Darkness/0.15);`))}function Xn(e,t,n=!1){let r=[];if(e.traverse(e=>{e.isMesh&&e.name===t.runtimeMesh&&e.material.name===t.materialName&&r.push(e)}),r.length!==1||!n&&!r[0].isSkinnedMesh||r[0].isInstancedMesh||!r[0].geometry.attributes.normal||!n&&!r[0].geometry.attributes.uv)throw Error(`Special binding mismatch: `+t.runtimeMesh);return r[0]}var Zn=class{constructor(e,t,n=new B,r=!0){this.root=e,this.contract=t,this.pool=n,this.ownsPool=r,this.gem=t.portable&&!t.gem?null:Xn(e,t.gem),this.outlines=t.outlines.map(n=>({source:Xn(e,n,t.portable),binding:n})),this.mode=`off`,this.generation=0,this.disposed=!1,this.leases=[],this.hulls=[],this.gemMaterial=null,this.gemBaseline=null,this.saved=null,this.created=0,this.released=0,this.frames=0,this.formula=`hoyo`,this.diagnostic=`none`,this.width=1,this.darkness=.15,this.rendering=!1}own(e){return this.created++,e.addEventListener(`dispose`,()=>this.released++),e}clear(){this.end();for(let e of this.hulls)e.shell.removeFromParent(),e.shell.material.dispose();this.hulls=[],this.gemMaterial?.dispose(),this.gemMaterial=null,this.gemBaseline=null;for(let e of this.leases)e.release();this.leases=[]}async select(e){if(this.disposed)throw Error(`Experiments disposed`);if(![`off`,`gem`,`outline`,`global`].includes(e))throw Error(`Unknown experiment selection`);let t=++this.generation;if(this.clear(),this.mode=`off`,(e===`gem`||e===`global`)&&!this.gem)throw Error(`Gem needs its own material contract`);if(e===`gem`||e===`global`){let e=await Promise.allSettled([`cap`,`mask`,`region`].map(e=>this.pool.acquire(this.contract.gem.maps[e]))),n=()=>e.forEach(e=>{e.status===`fulfilled`&&e.value.release()});if(this.disposed||t!==this.generation){n();return}let r=e.find(e=>e.status===`rejected`);if(r)throw n(),r.reason;this.leases=e.map(e=>e.value)}if(e===`outline`||e===`global`)try{for(let{source:e,binding:t}of this.outlines){let n=this.own(new S({side:1,depthWrite:!1,depthTest:!0,transparent:!1}));V(n,`flat`),n.toneMapped=!0,n.vertexColors=e.material.vertexColors;let r={p4Resolution:{value:new C(1,1)},p4Width:{value:1},p4OutlineTint:{value:new E(...t.tint)},p4Darkness:{value:.15}};t.facial&&(r.globalOutlineColors={value:t.colors.map(e=>new E(...e))}),n.onBeforeCompile=e=>Yn(e,r,!!t.facial),n.customProgramCacheKey=()=>`zzz-p4-hull-v1-`+!!t.facial,n.onBeforeCompile({uniforms:{},vertexShader:A.standard.vertexShader,fragmentShader:A.standard.fragmentShader});let i=e.isSkinnedMesh?new k(e.geometry,n):new f(e.geometry,n);i.name=`P4 outline `+e.name,i.userData.p4Shell=!0,e.isSkinnedMesh&&(i.bindMode=e.bindMode,i.bind(e.skeleton,e.bindMatrix)),i.morphTargetInfluences=e.morphTargetInfluences,i.morphTargetDictionary=e.morphTargetDictionary,i.visible=!1,i.renderOrder=e.renderOrder+1,i.frustumCulled=!1,i.matrixAutoUpdate=!1,e.add(i),this.hulls.push({source:e,shell:i,u:r})}}catch(e){throw this.clear(),e}this.mode=e}options({formula:e=this.formula,diagnostic:t=this.diagnostic,width:n=this.width,darkness:r=this.darkness}={}){if(![`hoyo`,`mask-only`].includes(e)||![`none`,`mask`,`region`,`cap`,`blend`].includes(t)||!Number.isFinite(n)||n<0||n>4||!Number.isFinite(r)||r<0||r>1)throw Error(`Invalid experiment options`);Object.assign(this,{formula:e,diagnostic:t,width:n,darkness:r})}begin(e){if(!(this.disposed||this.saved||this.root.userData.zzzUniformDiffuse)){if((this.mode===`gem`||this.mode===`global`)&&this.gemEnabled!==!1){let e=this.gem.material;if(this.gemBaseline!==e){this.gemMaterial?.dispose(),this.gemBaseline=e;let t=this.own(e.clone());V(t,`flat`),t.toneMapped=e.toneMapped;let n=this.contract.gem.parameters,[r,i,a]=this.leases.map(e=>e.texture);for(let e of[r,i,a])e.updateMatrix();this.gemUniforms={p4Cap:{value:r},p4Mask:{value:i},p4Region:{value:a},p4CapUV:{value:r.matrix.clone()},p4MaskUV:{value:i.matrix.clone()},p4RegionUV:{value:a.matrix.clone()},p4Tint:{value:new E(...n.tint)},p4Burst:{value:n.colorBurst},p4AlphaBurst:{value:n.alphaBurst},p4MaskOnly:{value:0},p4Diagnostic:{value:0}},t.onBeforeCompile=e=>Jn(e,this.gemUniforms),t.customProgramCacheKey=()=>`zzz-p4-gem-v1`,this.gemMaterial=t}this.gemUniforms.p4MaskOnly.value=+(this.formula===`mask-only`),this.gemUniforms.p4Diagnostic.value=[`none`,`mask`,`region`,`cap`,`blend`].indexOf(this.diagnostic),this.saved={gemMaterial:e},this.gem.material=this.gemMaterial}if(this.mode===`outline`||this.mode===`global`){this.saved??={};let t=e.getDrawingBufferSize(new C);for(let{source:e,shell:n,u:r}of this.hulls){let i=e.material,a=n.material,o=a.map!==i.map||a.alphaTest!==i.alphaTest;a.map=i.map,a.alphaMap=i.alphaMap,a.alphaTest=i.alphaTest,a.opacity=i.opacity,a.alphaToCoverage=i.alphaToCoverage,a.alphaHash=i.alphaHash,o&&(a.needsUpdate=!0),n.geometry=e.geometry,n.matrixWorld.copy(e.matrixWorld),n.layers.mask=e.layers.mask,n.isSkinnedMesh&&(n.bindMatrix.copy(e.bindMatrix),n.bindMatrixInverse.copy(e.bindMatrixInverse)),n.visible=e.visible&&i.visible&&this.outlineEnabled!==!1&&!this.suppressed?.has(e.name),r.p4Resolution.value.copy(t),r.p4Width.value=this.width,r.p4Darkness.value=this.darkness}}this.mode!==`off`&&this.frames++}}end(){this.saved?.gemMaterial&&this.gem.material===this.gemMaterial&&(this.gem.material=this.saved.gemMaterial);for(let e of this.hulls)e.shell.visible=!1;this.saved=null}install(e,t){let n=e.render,r=this;function i(i,a){if(r.disposed||i!==t||r.rendering||r.root.userData.zzzUniformDiffuse||e.getRenderTarget()!==null)return n.call(this,i,a);let o=t.onBeforeRender;r.rendering=!0,t.onBeforeRender=function(...t){if(o.apply(this,t),e.getRenderTarget()===null){if(r.depth)try{r.depth.capture({matricesCurrent:!0})}catch(e){r.depth.failure=String(e),r.depth.set({shadows:!1,rim:!1,diagnostic:`none`}),r.depth.reportError?.(e)}if(r.begin(e),r.depth)try{r.depth.begin()}catch(e){r.depth.end(),r.depth.failure=String(e),r.depth.set({shadows:!1,rim:!1,diagnostic:`none`}),r.depth.reportError?.(e)}}};try{return n.call(this,i,a)}finally{r.depth?.end(),r.end(),t.onBeforeRender=o,r.rendering=!1}}e.render=i,this.uninstall=()=>{e.render===i&&(e.render=n)}}stats(){return{mode:this.mode,frames:this.frames,materialsCreated:this.created,materialsDisposed:this.released,hulls:this.hulls.map(e=>e.source.name),gem:this.gem?.name??null,formula:this.formula,widthPixels:this.width,darkness:this.darkness,textures:this.pool.stats()}}dispose(){this.disposed||(this.disposed=!0,this.generation++,this.depth?.dispose(),this.clear(),this.uninstall?.(),this.ownsPool&&this.pool.dispose())}};function Qn(e,t,n=new c(9086975),{noReceive:r=new Set}={}){let i=[],a=[],o=[],s=new Map;return e.traverse(e=>{e.isMesh&&!e.userData.p4Shell&&!e.userData.zzzStencilReceiver&&s.set(e.name,(s.get(e.name)??0)+1)}),e.traverse(e=>{if(!e.isMesh||e.userData.p4Shell||e.userData.zzzStencilReceiver)return;let c=e.material,l=t.bindings?.find(t=>t.mesh===e)?.role??c?.userData?.zzzRenderRole,u;if(Array.isArray(c)?u=`Multi-material mesh needs primitive splitting`:l===`shadow-proxy`||c.userData?.zzzRenderRole===`shadow-proxy`?u=`Shadow proxy`:e.isInstancedMesh?u=`Instancing needs its own world-position transport`:s.get(e.name)===1?!c.isMeshStandardMaterial||!e.geometry.attributes.position||!e.geometry.attributes.normal?u=`Unsupported material or geometry`:Ln(e,null).policyIncluded||(u=`Blended or intentionally non-depth-writing surface`):u=`Ambiguous mesh name`,u){o.push({mesh:e.name,reason:u});return}let d={runtimeMesh:e.name,materialName:c.name};i.push({...d,tint:[.035,.03,.055]});let f=n.clone().convertLinearToSRGB().toArray();a.push({...d,facial:!1,region:null,...r.has(e.name)?{receiveShadows:!1}:{},rim:{enabled:!0,light:Array.from({length:5},()=>[...f]),shadow:Array.from({length:5},()=>[...f]),reason:`Viewport rim adaptation from scene light colour; no source flag inferred`}})}),{portable:!0,gem:null,outlines:i,depth:{allowEmpty:!0,bindings:a,shadowSize:2048,filter:`bilinear`},excluded:o}}var $n=class{constructor(e,t,n,r=null,{noReceive:i=new Set,contracts:a=[]}={}){this.noReceive=i,this.contracts=a,this.side=e,this.camera=t,this.controller=n,this.pool=r??new B,this.ownsPool=!r,this.disposed=!1}async prepare(){if(this.contract=Qn(this.side.loaded.root,this.controller,this.side.lights.rim?.color,{noReceive:this.noReceive}),this.special=new Zn(this.side.loaded.root,this.contract,this.pool,!1),await this.special.select(`outline`),!this.disposed&&!(this.contract.depth.bindings.length&&(this.depth=new qn(this.side,this.camera,this.contract.depth,this.pool),this.special.depth=this.depth,await this.depth.prepare(),this.disposed))&&(this.special.install(this.side.renderer,this.side.scene),this.contracts.length)){let e=this.side.lights.key,t=new E,n=new E;this.outline=new nn(this.side.loaded.root,this.contracts,{pool:this.pool,light:()=>({direction:e.getWorldPosition(t).sub(e.target.getWorldPosition(n)).normalize(),color:e.color})}),await this.outline.prepare()}}update(e){if(this.disposed||!this.special)return;let t=!!this.outline;this.special.suppressed=t?this.outline.covered:null,this.outline?.update({enabled:t&&!!e.outlineEnabled,widthScale:O.clamp(e.outlineThickness,0,4),engine:{tint:e.zzzOutlineTint??1}}),this.special.outlineEnabled=!!e.outlineEnabled,this.special.mode=e.outlineEnabled?`outline`:`off`,this.special.options({width:O.clamp(e.outlineThickness,0,4)}),this.depth?.set({shadows:!!e.shadowsEnabled,rim:!t&&!!e.rimLightEnabled,ramp:t,strength:t?O.clamp(e.zzzShadowStrength??1,0,1):Hn.strength})}dispose(){this.disposed||(this.disposed=!0,this.outline?.dispose(),this.special?.dispose(),this.ownsPool&&this.pool.dispose())}};async function er(e,{side:t,camera:n,controller:r,settings:i}){let a=new Set((e.contract?.surfaces??[]).filter(e=>e.faceStencil||e.family===`face-sdf`).map(e=>e.runtimeMesh)),o=[e.contract,...(e.extras??[]).map(e=>e.contract)].filter(Boolean),s=new $n(t,n,r,e.pool??null,{noReceive:a,contracts:o}),c=e.dispose.bind(e),l=e.update?.bind(e);return e.effects=s,e.dispose=()=>{s.dispose(),c()},e.update=e=>{l?.(e),s.update(e)},await s.prepare(),s.update(i),s}var tr={flat:`Diffuse sin iluminación`,"lit-albedo":`Diffuse con luz básica`,"flat-normal":`Diffuse y normales RG`,e021:`Diffuse, RG y paleta de sombras`,e021b:`Rostro/SDF u ojos según contrato`,e3:`Sombras y MatCaps`,e037:`Sombras, MatCaps y especular`,e039:`Sombras, MatCaps, especular y emisión disponible`,"unity-standard":`Unity Standard PBR`,"nap-avatar-screen":`NapAvatarScreen (emisión/base)`},nr=e=>tr[e]??`Diffuse de respaldo`;function rr(e){let t=new Map;for(let n of e){let e=n.status===`fallback`?`Respaldo Diffuse`:nr(n.mode);t.set(e,(t.get(e)??0)+1)}return[...t].map(([e,t])=>`${t} × ${e}`).join(` · `)}var ir=e=>({...e,profile:`original`,outlineEnabled:!1,shadowsEnabled:!1,rimLightEnabled:!1});function ar(e,t=[]){return[e??``,...t.map(e=>e??``)].join(`|`)}var or=class{constructor({side:e,camera:t,controller:n,sourceSha256:r,extraSources:i=[],onStatus:a=()=>{},setSceneProfile:o=()=>{},loadCandidateBundle:s=Fn,poolFactory:c=()=>new B,onTiming:l=()=>{}}){Object.assign(this,{side:e,camera:t,controller:n,sourceSha256:r,extraSources:i,onStatus:a,setSceneProfile:o,loadCandidateBundle:s,poolFactory:c,onTiming:l}),this.generation=0,this.session=null,this.candidate=null,this.loading=null,this.disposed=!1,this.wanted=!1,this.settings=null,this.candidateRevision=null}clear(){this.candidate?.dispose(),this.candidate=null,this.session?.dispose(),this.session=null,this.candidateRevision=null}async warmup(e){e()&&this.side.renderer.compileAsync&&(this.onStatus({kind:`loading`,message:`Preparando shader ZZZ Global…`}),await this.side.renderer.compileAsync(this.side.scene,this.camera))}async refreshCandidate(e){for(;this.loading;){let e=this.loading;try{await e}catch{}if(this.loading===e)break}this.disposed||this.settings?.profile!==`zzz-global`||e&&e===this.candidateRevision||(this.generation++,this.clear(),this.loading=null,await this.applySettings(this.settings))}syncLight(){this.session?.syncLight?.()}async applySettings(e){if(this.disposed)return;if(this.settings={...e},e.profile!==`zzz-global`){this.wanted=!1,this.generation++,this.clear(),this.loading=null,this.setSceneProfile(null),this.controller.applySettings(e),this.onStatus(null);return}if(this.controller.applySettings(ir(e)),this.session){this.session.update?.(e);return}if(this.loading)return this.loading;this.wanted=!0;let t=++this.generation;this.onStatus({kind:`loading`,message:`Cargando ZZZ Global…`});let n=this.activate(t);this.loading=n;try{await n}finally{this.loading===n&&(this.loading=null)}}async activate(e){let t,n=()=>!this.disposed&&this.wanted&&e===this.generation,r=performance.now(),i=e=>{let t=performance.now();n()&&this.onTiming(e,Math.round(t-r)),r=t};try{let e=await this.loadCandidateBundle(this.sourceSha256);if(!n())return;if(i(`ZZZ Global: contrato`),!e||e.contract.model.sha256!==this.sourceSha256)throw Error(`Este modelo no tiene un contrato propio activado; se usa la base Diffuse compartida.`);if(t=new jn({contract:e.contract,side:this.side,controller:this.controller,poolFactory:this.poolFactory}),this.candidate=t,await Promise.all([t.prepare(),this.attachExtraContracts(t,n)]),!n()||(i(`ZZZ Global: superficies y texturas`),await er(t,{side:this.side,camera:this.camera,controller:this.controller,settings:this.settings}),!n())||(i(`ZZZ Global: efectos`),t.update(this.settings),await this.warmup(n),!n())){t.dispose();return}i(`ZZZ Global: compilación de shaders`),t.update(this.settings),this.session=t,this.candidate=null,this.candidateRevision=ar(e.dependencies?.revision,t.extraRevisions??[]),this.onStatus({kind:`generated`,coverage:t.coverage,surfaces:t.results,message:rr(t.results)+`
`+t.results.filter(e=>e.issues.length).map(e=>e.runtimeMesh+`: `+e.issues.join(`; `)).join(`
`)});return}catch(e){if(t?.dispose(),this.candidate===t&&(this.candidate=null),!n())return;this.setSceneProfile(null),this.controller.applySettings(ir(this.settings));let r=new U(this.side.loaded.root,this.controller);r.update=()=>{},this.candidate=r;try{await er(r,{side:this.side,camera:this.camera,controller:this.controller,settings:this.settings})}catch(e){r.effects?.dispose(),r.effectError=String(e)}if(!n()){r.dispose(),this.candidate===r&&(this.candidate=null);return}this.session=r,this.candidate=null,this.onStatus({kind:`fallback`,message:String(e instanceof Error?e.message:e)})}}async attachExtraContracts(e,t){let n=this.extraSources??[],r=await Promise.all(n.map(async e=>{if(!t())return null;let n=[];e.root?.traverse(e=>{e.isMesh&&n.push(e.name)});let r=null,i=null,a=``;try{let n=e.sha256?await this.loadCandidateBundle(e.sha256):null;if(!t())return null;if(a=n?.dependencies?.revision??``,n&&n.contract.model.sha256===e.sha256&&(r=new jn({contract:n.contract,side:this.side,controller:this.controller,poolFactory:this.poolFactory}),await r.prepare(),!t()))return r.dispose(),null}catch(e){r?.dispose(),r=null,i=String(e instanceof Error?e.message:e)}if(!t())return r?.dispose(),null;if(!r&&n.length){r=new U(this.side.loaded.root,this.controller,{runtimeMeshes:n});let e=i?`Modular part contract failed: `+i:`Modular part without its own generated contract`;r.results=n.map(t=>({runtimeMesh:t,status:`fallback`,mode:`lit-albedo`,issues:[e]}))}return{session:r,revision:a}}));if(!t()){for(let e of r)e?.session?.dispose();return}let i=[],a=[];for(let e of r)e&&(a.push(e.revision),e.session&&i.push(e.session));if(e.extraRevisions=a,!i.length)return;let o=e.update.bind(e),s=e.dispose.bind(e);e.extras=i,e.update=e=>{o(e);for(let t of i)t.update?.(e)},e.dispose=()=>{for(let e of i)e.dispose();s()},e.results=[...e.results,...i.flatMap(e=>e.results??[])],e.coverage=Object.fromEntries([`complete`,`partial`,`fallback`].map(t=>[t,e.results.filter(e=>e.status===t).length]))}dispose(){this.disposed||(this.disposed=!0,this.wanted=!1,this.generation++,this.clear(),this.setSceneProfile(null))}};export{U as DiffuseFallbackLayer,or as GlobalViewportProfile,ar as combinedRevision,Fn as loadGeneratedBundle};