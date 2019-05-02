---
layout: post
title: Cel Shading | Part 2 - Cel-shaded Lighting
subtitle: Removing the smooth gradient lighting
bigimg: /img/tut2/part2-banner.png
gh-repo: daniel-ilett/cel-shading
gh-badge: [star, fork, follow]
tags: [shaders, unity, lighting, cel-shading]
nice-slug: Cel-shaded Lighting
date: 2019-06-01
---

This tutorial builds on what we learned in the Diffuse lighting tutorial and introduces thresholds on our lighting values to give our objects solid shading bands. This results in a non-realistic look, commonly seen in cartoonish 3D games.

<hr/>

# Cel Shading

You're probably aware of cel-shading from popular games such as Jet Set Radio and The Legend of Zelda: The Wind Waker, both of which are seen as pioneers of the aesthetic, to more recent games such as the Borderlands franchise. The effect is characterised by hard shadows with very little smoothing between lit and unlit sections of an object's surface.

For this tutorial, we'll be using the Diffuse shaders from the previous part as a base. However, before get started, we'll need to make a few modifications to the surface shader variant. Much of the power and utility of surface shaders comes from the fact they can be used to specify surface properties and leave the lighting to Unity, but since we're going to be manipulating lighting directly, we'll need to build our own lighting model.

# Surface Shader

Take a look at `Shaders/CelShadedSurf.shader`. It's currently the same as the the finished `DiffuseSurf` shader we wrote in the last tutorial. However, we'll need to write our own lighting model instead of using a built-in one. 

##Lighting Models

Right now, we're using the `Standard` lighting model, which includes the `SurfaceOutputStandard` struct to hold its parameters. With our new lighting model, we won't use that - intead we'll use the more basic `SurfaceOutput` struct. To build a lighting model, we supply a function with a name beginning `Lighting` - the exact semantics we must use can be found [here](https://docs.unity3d.com/Manual/SL-SurfaceShaderLighting.html). We'll write our shader to only interact with Unity's forward rendering pipeline.

~~~glsl
// Above the Input struct definition.
half4 LightingCel(SurfaceOutput s, half3 lightDir, half atten)
{
    ...
}
~~~

Since we called the function `LightingCel`, our lighting model is called `Cel`. To use this model, we'll modify our `#pragma` directive that currently tells Unity to use the `Standard` lighting model.

~~~glsl
#pragma surface surf Cel
~~~

We shall also make a minor tweak to the `surf` function to take a `SurfaceOutput` instead of a `SurfaceOutputStandard`.

~~~glsl
void surf (Input IN, inout SurfaceOutput o)
...
~~~

With that out of the way, we can now define the behaviour of the new `Cel` lighting model. It's going to look very similar to the lighting calculations we wrte in the fragment shader during the last tutorial - we use the dot product to calculate the angle between the normal vector and the directional light's direction. It ought to look very familiar!

~~~glsl
half4 LightingCel(SurfaceOutput s, half3 lightDir, half atten)
{
    float3 normal = normalize(s.Normal);
    half diffuse = dot(normal, lightDir);
    half3 col = s.Albedo * (diffuse * _LightColor0 + unity_AmbientSky);

    return half4(col, s.Alpha);
}
~~~

Now our surface shader is ready to convert

<hr/>

# Conclusion

<hr/>
