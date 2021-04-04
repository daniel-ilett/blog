---
layout: post
title: Unity Basics - Shader Code in URP
subtitle: Shady Business
bigimg: /img/unity-basics/part3-bigimg.jpg
hdrimg: /img/unity-basics/part3-banner.jpg
#gh-repo: daniel-ilett/shaders-pmd
#gh-badge: [star, fork, follow]
tags: [unity, basics, shaders, urp]
nice-slug: Reverse Engineering Effects
date: 2021-04-02
idnum: 62

part-label: 3
series-name: Unity Basics
---

We've covered Shader Graph a lot, but by comparison we've avoided talking about shader code, especially when it comes to any of Unity's newer render pipelines. Even if you only plan to use Shader Graph, I think it's still useful to have some knowledge of how things work behind the scenes - and to know what Shader Graph handles invisibly in the background - so in this instalment of *Unity Basics*, we're going to explore the world of shader code in Universal Render Pipeline. Even if you've written shaders for the built-in pipeline, you might find some of the differences between that and URP shader coding useful!

{: .box-note}
Unity Basics aims to teach you a little part of Unity in an easy-to-understand and clear format.

{: .box-warning}
This tutorial is aimed at people who might have used Shader Graph or written shader code for the built-in render pipeline before, but are looking for an introduction to coding shaders in URP specifically.

By the way, I have a [Discord server](https://discord.gg/tPQEUwPpb3) for people who are making things using shaders! If you want to share something you've worked on, see what others are doing, ask questions about shaders or otherwise just wanna hang out with others who like shaders, come join us!

This tutorial should go live at the same time over on my YouTube channel too!

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/gY1Mx4kkZPU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
</div>

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-5101496396569275"
     data-ad-slot="3740606711"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

<hr/>

# Shader Code in URP

As with the built-in pipeline, we'll start by creating a new shader by right-clicking in the Project View and selecting Create -> Shader -> Unlit Shader. I named mine "ExampleShader", but you can name it whatever you want. When you open the file up, you’ll be greeted by a lot of boilerplate – we’re actually going to select everything between `CGPROGRAM` and `ENDCG` and delete it. This template code is designed for the older built-in renderer, but we want to set up our shader to use the shiny new features of URP! We’re left with comparatively little code. This is written in a language called **ShaderLab**, which is a Unity-specific shader language which bridges the gap between Unity and quote-unquote 'real' shader code.

```glsl
Shader "Unlit/ExampleShader"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" }
        LOD 100

        Pass
        {
            
        }
    }
}
```

In the first line, we can **Name** the shader by changing what’s between the double-quotes. This name defines how the shader will appear in the material inspector’s Shader drop-down, so for me it will appear under *Unlit -> ExampleShader*. Next up are the **Properties**. These act the same as Shader Graph properties and are variables which we can use in the shader, but also modify within the Unity Editor. Currently there's only one, and the syntax goes like this: its name is `_MainTex`, and the name we'll use in the Inspector is "Texture". Its type is `Texture2D`, and by default, we want it to use a completely white texture. We will see a few more types of property later. 

Then we have a **SubShader**. A single shader file can contain several SubShaders, one after the other, and the first one which can run on the hardware will be picked, although I very rarely use this cascading behaviour of SubShaders myself. Inside a SubShader, we have **Tags** which define when and how the shader is rendered, and the **LOD** level which can be increased if this shader is particularly demanding. You can force Unity to fallback to SubShaders with an LOD level below a certain threshold. 

Finally, we have a **Pass**. During a single shader Pass, Unity will render the object that this shader is attached to once, according to whatever shader code we’ve written. However, we just deleted all the shader code so of course, nothing will happen yet. This is where we’re going to put back some quote-unquote ‘real’ shader code of our own!

In URP, we use a shader language called **HLSL**, or *High Level Shading Language*. If you’ve written shaders in the built-in pipeline in the past, you will likely have used **Cg** (Nvidia's deprecated shading language) instead of HLSL, but this is the quote-unquote ‘proper’ way of doing things now because URP’s core libraries are written in HLSL. Now that we know which language we’ll be using inside the pass, I can stop saying “quote-unquote real shader code” and things will hopefully go a bit more smoothly.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-5101496396569275"
     data-ad-slot="3740606711"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

So, how do we start writing HLSL? We need to tell ShaderLab that we are changing to HLSL and there are two different ways of doing that. Just above the Pass, we are going to write `HLSLINCLUDE` and `ENDHLSL` on separate lines, and between this, we are going to set up the things that will be used inside our shader pass. We can define more than one pass, and everything between the `HLSLINCLUDE` block will be available to all those passes. To start off with, we will import the standard URP shader library. It’s a pretty long line – we need to say `#include “Packages/com.unity.render-hyphen-pipelines.universal/ShaderLibrary/Core.hlsl”`, with the exact capitalisation seen here. This file contains a bunch of stuff that will be helpful for many of the shaders we’re going to write.

```glsl
HLSLINCLUDE
#include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

ENDHLSL
```

Now we will deal with properties… again. We’ve declared properties in at the top of the file, but we need to include them a second time in HLSL. In URP, it’s a bit different to the way you might have handled properties before – we declare a container for the properties called a `CBUFFER`, between `CBUFFER_START` and `CBUFFER_END`. We give it the special name `UnityPerMaterial`, which ensures that these properties will be the same for every shader pass. It might seem strange that we need to put all these inside a buffer like this, but this makes our material compatible with the SRP Batcher – which, to oversimplify massively, makes rendering happen faster.

```glsl
CBUFFER_START(UnityPerMaterial)
     
CBUFFER_END
```

Inside the block, we redefine all the properties we had before, but using their HLSL types. It’s a bit annoying but you’ve gotta do it! We’re going to add another property at the top of the file first, inside the **Properties** block. I’ll call it `_BaseColor`, give it a name “Base Color”, its type is `Color`, and the default value is `(1, 1, 1, 1)` which corresponds to white, because the red, green, blue and alpha values are all full.

```glsl
_BaseColor ("Base Color", Color) = (1, 1, 1, 1)
```

Now inside the `CBUFFER`, we write `float4 _BaseColor`. `float4` is HLSL’s type for RGBA colours, although really it’s just a 4-element vector – `float4`s don’t necessarily have to be colours. Textures are special and don’t need to go inside the `CBUFFER`. We need to define the texture and a sampler we can use to sample the texture – we do that by saying `TEXTURE2D(_MainTex)`, then `SAMPLER(sampler_MainTex)`. The name of the sampler is the same as your texture, with the word “sampler” stapled to the front. That’s a lot of setup, but you get used to it quickly – for a lot of my shaders, I just copy my previous work and change the bits that aren’t boilerplate. Now we can write some shader behaviour.

```glsl
CBUFFER_START(UnityPerMaterial)
     float4 _BaseColor;
CBUFFER_END

TEXTURE2D(_MainTex);
SAMPLER(sampler_MainTex);
```

When we talk about shaders colloquially, we are usually talking about the overall combination of everything inside this shader file. On a deeper level, shaders are usually made up of a vertex shader and a fragment shader – we’re going to deal with the first one first. I mean, that makes sense, right? Starting at the beginning! The shader starts by receiving data from Unity. Not just the properties – there’s more that we need to handle, such as vertex positions and UV coordinates, which Shader Graph would handle for you invisibly. The vertex shader then operates on every vertex of the mesh of the object the shader is attached to, and typically places the vertices in the correct positions on-screen.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-5101496396569275"
     data-ad-slot="3740606711"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

We write a struct to contain data passed as input to the vertex shader – sometimes the struct is called `Attributes` or `appdata`, but I prefer to call it `VertexInput` because it’s input to the vertex shader. Our shader isn’t very complicated so all we will need here is the vertex position and the UV coordinates – for that, we can say `float4 position` and `float2 uv`. HLSL also requires us to add what are called [semantics](https://docs.microsoft.com/en-us/windows/win32/direct3dhlsl/dx-graphics-hlsl-semantics) to those variables so that the shader compiler knows what each variable is intended for. The position variable uses the `POSITION` semantic and the uv uses `TEXCOORD0`, which is short for ‘texture coordinate’.

```glsl
struct VertexInput
{
     float4 position : POSITION;
     float2 uv : TEXCOORD0;
};
```

We also need a struct containing data output by the vertex shader. You could call it `Varyings` or `v2f` (because these are the things that vary either side of the vertex shader, and they are passed from vertex to fragment shader, hence "v2f"), but I prefer `VertexOutput`. I’m sure you can guess why. We will be outputting a position and a uv coordinate again, so we will say `float4 position`, with the `SV_POSITION` semantic, and `float2 uv`, with the `TEXCOORD0` semantic. `SV_Position` is slightly different from before, and it means “pixel position”. For both these structs, make sure you remember the semicolon at the end!

```glsl
struct VertexOutput
{
     float4 position : SV_POSITION;
     float2 uv : TEXCOORD0;
};
```

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-5101496396569275"
     data-ad-slot="3740606711"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

Now we can write the **vertex shader**. We’ve actually written everything we need inside the `HLSLINCLUDE` block, so now we can finally talk about the second way to declare HLSL code! Inside the Pass, we will write `HLSLPROGRAM` and `ENDHLSL` and here we can write our vertex shader. It’s a *C-like* function, so we put the return type – `VertexOutput` – then the name of the function, `vert`, and a list of parameters – we’ll specify a `VertexInput` named `i`, for “input”. 

```glsl
HLSLPROGRAM

VertexOutput vert(VertexInput i)
{
     
}

ENDHLSL
```

Inside the function, we’ll declare a `VertexOutput` called `o`, for “output”, and we’re going to populate each of its members one by one. Here, we need to transform the vertices from object space – where each vertex is positioned relative to the model’s own centre point – to clip space – where each vertex is positioned relative to the 2D screen coordinates. Unity provides a function for this. It used to be called `UnityObjectToClipPos` back in the built-in render pipeline, but in URP it’s now called `TransformObjectToHClip`, into which we pass the vertex input position and assign it to the vertex output position. You might get warnings back in the Unity Editor about "implicit truncation", and to make those disappear, just use `.xyz` on the input to `TransformObjectToHClip`. Then we can just say `o.uv` equals `i.uv`, because we don’t need to do any special transformations for the UV coordinates.

```glsl
VertexOutput vert(VertexInput i)
{
     VertexOutput o;
     o.position = TransformObjectToHClip(i.position.xyz);
     o.uv = i.uv;
     return o;
}
```

Now we can write the **fragment shader**. This is sometimes called the **pixel shader**, because these image fragments are usually the size of one pixel. After the vertex shader is complete, HLSL takes all the triangles that are visible on-screen and turns them into fragments in a step called **rasterization**. Our fragment shader will operate on every pixel and return a colour as a `float4`, which is the final colour of those pixels, and it takes a `VertexOutput` as its only parameter. We need to give the function itself a semantic called `SV_Target`, which is a bit different to the vertex shader, which doesn’t need one at all.

```glsl
float4 frag(VertexOutput i) : SV_Target
{
     
}
```

Inside the fragment shader, it’s fairly straightforward. We can sample `_MainTex` at the correct UV coordinate by using the `SAMPLE_TEXTURE2D` macro and passing in the main texture, its sampler, and the UV coordinate specified in `VertexOutput`. As we mentioned, colors are `float4`s, so this gets assigned to a `float4` called `baseTex`. To mix colors together, we can just multiply `float4`s together, and HLSL will multiply each element one by one and return a new `float4`. So if we want to combine `baseTex` and `_BaseColor` together and return that as the final color in one fell swoop, we can just write `return baseTex * _BaseColor`. Awesome, that’s the fragment shader completed!

```glsl
float4 frag(VertexOutput i) : SV_Target
{
     float4 baseTex = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, i.uv);
     return baseTex * _BaseColor;
}
```

We just need to tell HLSL that these functions are the vertex and fragment shaders by saying `#pragma vertex vert` and `#pragma fragment frag`, and then if we assign this shader to a material by selecting *Unlit -> ExampleShader* from the Shader drop-down menu, we can start to assign textures and change the colour to see changes.

```glsl
HLSLPROGRAM
#pragma vertex vert
#pragma fragment frag
...
```

This tutorial should give you enough base knowledge to get started with an extremely basic Unlit shader, but if you’re looking to take things further, I’ve linked a few things in the description to get you started. There’s the [Unity documentation](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@10.1/manual/writing-shaders-urp-basic-unlit-structure.html), although since the Scriptable Render Pipelines launched it’s been a little harder navigating the split documentation so I’ve linked a relevant page. Cyan also has a brilliant [guide for getting set up with URP shaders](https://cyangamedev.wordpress.com/2020/06/05/urp-shader-code/) – he goes further than I do here so it’s well worth checking out.

Unity Basics will return in the future with more shader goodness, as well as tons of content about the rest of the Unity Engine!

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-5101496396569275"
     data-ad-slot="3740606711"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

<hr/>

# Acknowledgements

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early! Some tiers also get early access to my [YouTube videos](https://www.youtube.com/channel/UClgoE54W_4rX7jzZGiCmrXw) or even copies of my [asset packs](https://itch.io/c/798909/my-asset-packs)!

#### Special thanks to my Patreon backers for March 2021!

<p style="text-align: center;">
Gemma Louise Ilett<br/>

JP $$\cdot$$ Pablo Ruiz<br/>

Jack Dixon $$\cdot$$ Paul Froggatt $$\cdot$$ Tuomas Männistö $$\cdot$$ Sébastien Perouffe<br/>

Chris Sims $$\cdot$$ FonzoUA $$\cdot$$ Jesper Kuutti $$\cdot$$ MR MD HARDING $$\cdot$$ Moishi Rand $$\cdot$$ Shaun Wall<br/>

Anna Voronova $$\cdot$$ Christopher Pereira $$\cdot$$ Harshad $$\cdot$$ James Poole $$\cdot$$ Ming Lei $$\cdot$$ sadizeng $$\cdot$$ Zachary Alstadt
</p>

#### And a shout-out to my top Ko-fi supporters!

<p style="text-align: center;">
Hung Hoang $$\cdot$$ Arthur H $$\cdot$$ Megan Taylor $$\cdot$$ Takuya $$\cdot$$ "Somebody"
</p>

<hr/>
