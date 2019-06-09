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
Pass
{
    CGPROGRAM
    #pragma vertex vert
    #pragma fragment frag

    #include "UnityCG.cginc"

    ...

    ENDCG
}
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

![Ethan Bad Outline](/img/tut2/part4-ethan-outline-wrong.png){: .center-image }

Something's not right. If you look very closely, you'll notice the entirety of Ethan is shaded with the `_OutlineColour`, which might not be what you wanted. Let's fix it by introducing a powerful new tool: stencils.

<hr/>

# Stencil Buffer

A stencil buffer is a way of remembering a section of pixels so that we can modify only a specific section of an image or discard a subset of pixels at a later stage. In our example, we're interested in the latter case; we want to draw Ethan as usual, remember which pixels he was drawn on, then draw Ethan's outline on top, but discard the pixels where Ethan was already drawn. We can do this by writing a stencil when drawing Ethan the first time, then reading that stencil during the outline pass.

The syntax for stencils is fairly straightforward, and ShaderLab holds our hand for the most part. A stencil runs over the whole image alongside the rest of the Pass, so each of the following stages happen on a per-pixel basis. At the top of the first Pass, between our Tags and CGPROGRAM block, we define a `Stencil`.

~~~glsl
Stencil
{
    ...
}
~~~

To link two stencils together, we use a reference value, `Ref`. Think of a stencil like a bit mask - the stencil buffer is another screen-sized 2D array where each pixel has its own reference value. When writing to the stencil buffer, we're setting the reference value. Note that defining a reference value doesn't mean it will get written to the stencil buffer - we must specify this using another keyword.

~~~glsl
// Inside the Stencil{} block.
Ref 1
~~~

Next up, we need a comparison function - a stencil test, `Comp`. This is used when we're reading the stencil to decide whether we want to render a pixel. In the first pass, we always want to render the pixel no matter what the value in the stencil buffer is - so we use the `always` comparison function.

~~~glsl
Comp always
~~~

Then, we define what stencil behaviour should occur if the stencil test and depth test both succeed, using `Pass`. We want to replace the previous contents of the stencil buffer with the reference value. The default value is `keep`, which won't write to the stencil buffer, so instead we'll use `replace`.

~~~glsl
Pass replace
~~~

Finally, we'll define what happens to the stencil buffer value if the stencil test fails, using the `Fail` keyword. The default behaviour is to `keep` the reference value inside the stencil buffer. The same is true of `ZFail` when the stencil test passed but the depth test fails; the default behavious is to `keep`. We'll keep both defaults.

~~~glsl
Fail keep
ZFail keep
~~~

For a bit more information on the parameters available for a stencil buffer, check the official [Unity documentation](https://docs.unity3d.com/Manual/SL-Stencil.html). Of course, this won't have any effect just yet, since we're only writing to the stencil buffer in the first pass. We must now read from it in the second pass.

Before writing the next stencil, I added a couple 'sanity checks' to make sure Z-testing works as intended. I don't want the second pass to write to the depth buffer, but I do want it to read from the buffer and perform the depth test.

~~~glsl
Pass
{
    ZWrite off
    ZTest on
}
~~~

Now we're going to define a second stencil, at the top of the second pass, with a reference of 1 - the same reference value as the first stencil.

~~~glsl
Pass
{ 
    ...
    Stencil
    {
        Ref 1
    }
}
~~~

Now our two stencils are linked by reference. We'll only want to write to the framebuffer when the stencil reference value is not equal to 1, so we'll use the `notequal` comparison function.

~~~glsl
Comp notequal
~~~

We can modify `Pass` or `Fail` parameters if we wish, but the defaults are also fine. Now, when we run our shader, we should have the outline effect we've been aiming for!

![Ethan Good Outline](/img/tut2/part4-ethan-complete.png){: .center-image }

<hr/>

# Conclusion

We've completed our cel-shading effect! Now we've added an outline to the effect, with configurable width and colour, learning how to use the stencil buffer on the way. In the final part of this series on Cel Shading, we'll put the finishing touches on the effect and recap the shader features we've seen throughout the series.

<hr/>
