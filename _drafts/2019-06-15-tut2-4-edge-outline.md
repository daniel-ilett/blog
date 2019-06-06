---
layout: post
title: Cel Shading | Part 4 - Edge Outlining
subtitle: Using edge detection to draw bold outlines
bigimg: /img/tut2/part4-banner.png
gh-repo: daniel-ilett/cel-shading
gh-badge: [star, fork, follow]
tags: [shaders, unity, lighting, cel-shading, edge-outline]
nice-slug: Edge Outlining
date: 2019-06-15
---

The final step of our cel-shading effect is to draw bold outlines around our object. There are several ways to do that, and the method we're about to explore involves drawing the object a second time in a second pass, slightly larger than the first time, and excluding the pixels that were drawn in the first pass.

# Outline Effect

We're almost at the end of our journey with Ethan - as of the end of the fresnel lighting tutorial, he looks like this:

![Fresnel Ethan](/img/tut2/part3-ethan-bump-fresnel.png){: .center-image }

It's a fine-looking effect for sure, and wouldn't look out of place in a cartoonish game. However, we sometimes want an extra bit of contract to make some characters or objects stand out; for this, we'll capture the comic book aesthetic a little with a thick, bold outline.

The methodology is simple. We'll draw Ethan as usual in a first pass, then in a second pass we will use a vertex shader to extrude each vertex position slightly along its normal, so that the object is rendered slightly larger than normal. The fragment shader will draw the entire second pass in a single colour, which could be hard-coded into the shader or passed in `Properties` like a well-written shader should do. Finally, we'll have to find a way to avoid drawing over the first pass - for this, we'll use a stencil to mask out the pixels drawn in the first pass.

Our template, found in `Shaders/OutlineCelShaded.shader`, uses `Shaders/Complete/RimCelShaded.shader` as a base - the first pass is already defined and a skeleton second pass is included. Our first step will be to populate the second pass with a vertex and fragment shader.

~~~glsl
CGPROGRAM
#pragma vertex vert
#pragma fragment frag

#include "UnityCG.cginc"

...

ENDCG
~~~

Remember the basics of writing a vertex-fragment program - the rest of our code is going to be written in place of the `...`. Let's add things step by step. We're going to want to set the size and colour of the outline as properties. and include them in this shader after the `#include`.

~~~glsl
// In Properties.
_OutlineSize("Outline Size", Float) = 0.01
_OutlineColor("Outline Color", Color) = (0, 0, 0, 1)

// In second pass.
float _OutlineSize;
float4 _OutlineColor;
~~~

We won't need any other global variables inside our shader - not even `_MainTex`, as we're setting a block colour and won't be doing any texture sampling in the fragment shader. Now let's consider the pipeline of variables we'll pass between shader stages. We will need to pass the vertex positions and vertex normals into the vertex shader - both will be used to calculate the final vertex positions that will be passed through the rasterisation step.

~~~glsl
struct appdata
{
    float4 vertex : POSITION;
    float3 normal : NORMAL;
};
~~~

Our fragment shader is just going to draw block colours, so the only thing that needs to be output by the vertex shader are the vertex positions - the normals won't be needed past this stage.

~~~glsl
struct v2f 
{
    float4 vertex : SV_POSITION;
};
~~~

The vertex shader will read the vertex positions passed in `appdata`, and will add the normalised normal vector multiplied by the `_OutlineSize` we defined in `Properties` to that position.

~~~glsl
v2f vert(appdata v)
{
    v2f o;
    float3 normal = normalize(v.normal) * _OutlineSize;
    float3 pos = v.vertex + normal;

    o.vertex = UnityObjectToClipPos(pos);

    return o;
}

~~~

It's important the normals and positions are added before the call to `UnityObjectToClipPos()`, because both the input normals and input positions exist in Unity object space. Next up, we'll deal with the fragment shader. All it needs to do is set the output colour to the `_OutlineColor` we defined in `Properties`.

~~~glsl
float4 frag(v2f i) : SV_Target
{
    return _OutlineColor;
}
~~~

If we run the shader now, after setting the `_OutlineSize` to something like 0.01 and the `_OutlineColour` to black, the result is something like this:

![Ethan Outline Part 1](/img/tut2/part4-ethan-outline-wrong.png){: .center-image }

Something's not right. If you look very closely, you'll notice the entirety of Ethan is shaded with the `_OutlineColour`, which might not be what you wanted. Let's fix it by introducing a powerful new tool: stencils.

<hr/>

# Stencil Buffer

<hr/>

# Conclusion

<hr/>
