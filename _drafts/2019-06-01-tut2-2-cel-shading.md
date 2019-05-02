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
float4 LightingCel(SurfaceOutput s, half3 lightDir, half atten)
{
    float3 normal = normalize(s.Normal);
    float diffuse = dot(normal, lightDir);
    float3 col = s.Albedo * (diffuse * _LightColor0 + unity_AmbientSky);

    return float4(col, s.Alpha);
}
~~~

Now our surface shader is ready to build a cel-shaded effect on!

## Cel-shading implementation

The most basic way of implementing two-tone cel-shading - that is, cel-shading with one light section and one dark section - is to specify a cutoff point on the dot product value - above the cutoff, the material is lit, and below the cutoff, it's in shade.

~~~glsl
// Our existing diffuse calculation:
float diffuse = dot(normal, lightDir);

// An additional line to implement two-tone shading:
diffuse = diffuse > 0 ? 1 : 0;
~~~

The resulting effect definitely counts as cel-shading. Hurray, we can all go home now, we're done! ...except I think we can do a little better. After all, we don't even have specular lighting, and we might want more flexibility with the cut-off points. We could implement more cut-off points, which would give us more lighting "bands". We could implement fresnel shading - which we'll explore in the next tutorial. And the cutoff results in a very sharp change from fully-lit to fully-shaded; it'd look better with a very small falloff to prevent aliasing artefacts.

## Smooth falloff

It seems ironic to remove all lighting falloff just to reimplement a small amount of falloff, but welcome to the world of computer graphics. For this, we'll use the `fwidth` function - this function tells us how fast a value changes between this pixel and adjacent pixels. It's based upon the `ddx` and `ddy` functions that calculate the rate of change in the horizontal and vertical directions respectively, so `fwidth` can be considered a combination of two derivatives. In short, in the middle of a lit or shaded area, the rate of change will be zero, and on the border between both regions, it'll be something greater than zero.

We'll use that in combination with the `smoothstep` function, which can be thought of as the soulmate to the `lerp` function. While `lerp` gives a lower bound and an upper bound and you control the returned value by supplying a third parameter between 0 and 1, the `smoothstep` function asks you to supply an upper and lower bound again, but returns a value between 0 and 1 depending on where your third parameter rests between those bounds. In other words, `lerp(0, 5, 0.5)` will return a value of 2.5, and `smoothstep(0, 5, 2.5)` will return a value of 0.5. It should be noted that `smoothstep` isn't linear, which is a useful property for us that will produce a smooth but swift lighting transition.

~~~glsl
// In Properties.
_Antialiasing("Band Smoothing", Float) = 5.0

// In LightingCel.
float diffuse = dot(normal, lightDir);

float delta = fwidth(diffuse) * _Antialiasing;
float diffuseSmooth = smoothstep(0, delta, diffuse);

float3 col = s.Albedo * (diffuseSmooth * _LightColor0 + unity_AmbientSky);
~~~

You'll see I've kept the same `diffuse` calculation, but I've used it to calculate a `delta` value using `fwidth`. I multiply this by a new property called `_Antialiasing`, because it's nice to give control to your artists by exposing things in the Inspector, and the `delta` value is pretty small and rarely noticeable by itself. The `diffuseSmooth` calculation replaces our old cel-shading calculation, which utilised the ternary operator. Remember to use the new `diffuseSmooth` variable in the colour calculation instead of the old `diffuse` variable!

You should now have a very small lighting falloff that gives our object a less harsh transition from light to dark. It's fully controllable from the material in the Inspector. Beware that large values for the `_Antialiasing` variable (called `Band smoothing` in the Inspector) look atrocious, so keep it low!

## Specular lighting

Diffuse lighting doesn't take the view direction into account. Specular lighting, on the other hand, does. Specular highlights are the "shiny" parts of an object - if you think of a well-polished ball, you might imagine a small circle on the top of the ball that reflects really brightly - that's a specular highlight, and it manifests due to the light source reflecting off that part of the ball into your eyes directly.

It's relatively easy to implement this.

<hr/>

# Conclusion

<hr/>
