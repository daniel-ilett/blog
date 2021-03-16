---
layout: post
title: Cel Shading | Part 2 - Cel-shaded Lighting
subtitle: Removing the smooth gradient lighting
bigimg: /img/tut2/part2-banner.jpg
gh-repo: daniel-ilett/cel-shading
gh-badge: [star, fork, follow]
tags: [shaders, unity, lighting, cel-shading]
nice-slug: Cel-shaded Lighting
date: 2019-06-08
idnum: 14

part-label: 2
series-name: Cel-shading
---

This tutorial builds on what we learned in the Diffuse lighting tutorial and introduces thresholds on our lighting values to give our objects solid shading bands. This results in a non-realistic look, commonly seen in cartoonish 3D games.

<hr/>

# Cel Shading

You're probably seen cel-shading in popular games such as Jet Set Radio and The Legend of Zelda: The Wind Waker, both of which are pioneers of the aesthetic, and recent titles like the Borderlands franchise. The effect is characterised by hard shading with very little smoothing between lit and unlit sections of an object's surface.

For this tutorial, we'll be using the Diffuse shaders from the previous part as a base. Before we get started, we'll need to make a few modifications to the surface shader variant. Much of the power and utility of surface shaders comes from the fact they can be used to specify surface properties and leave the lighting to Unity, but since we're going to be manipulating lighting directly, we'll need to build our own lighting model.

# Surface Shader

Open `Shaders/CelShadedSurf.shader`. It's currently the same as the finished `DiffuseSurf` shader we wrote in the last tutorial. However, we'll need to write our own lighting model instead of using a built-in one. 

## Lighting Models

Right now, we're using the `Standard` lighting model, which includes the `SurfaceOutputStandard` struct to hold its parameters. With our new lighting model, we won't use that - instead we'll use the more basic `SurfaceOutput` struct. To build a lighting model, we supply a function with a name beginning `Lighting` - the exact semantics we must use can be found [here](https://docs.unity3d.com/Manual/SL-SurfaceShaderLighting.html). We'll write our shader to only interact with Unity's forward rendering pipeline.

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

With that out of the way, we can now define the behaviour of the new `Cel` lighting model. It's going to look very similar to the lighting calculations we wrote in the fragment shader during the last tutorial - we use the dot product to calculate the angle between the normal vector and the directional light's direction. It ought to look very familiar!

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

## Cel-shading implementation

The most basic way of implementing two-tone cel-shading - that is, cel-shading with one light section and one dark section - is to specify a cutoff point on the dot product value - above the cutoff, the material is lit, and below the cutoff, it's in shade.

~~~glsl
// Our existing diffuse calculation:
float diffuse = dot(normal, lightDir);

// An additional line to implement two-tone shading:
diffuse = diffuse > 0 ? 1 : 0;
~~~

The resulting effect certainly reaches the cel-shading requirements. Hurray, we can all go home now, we're done! ...except I think we can do a little better. After all, we don't even have specular lighting, and we might want more flexibility with the cut-off points. We could implement more cut-off points, which would give us more lighting "bands". We could implement fresnel shading - which we'll explore in the next tutorial. And the cutoff results in a very sharp change from fully lit to fully shaded; it'd look better with a very small falloff to prevent aliasing artefacts.

## Smooth falloff

It seems ironic to remove all lighting falloff just to reimplement a small amount of falloff, but welcome to the world of computer graphics. For this, we'll use the `fwidth` function - this function tells us how fast a value changes between this pixel and adjacent pixels. It's based upon the `ddx` and `ddy` functions that calculate the rate of change in the horizontal and vertical directions respectively, so `fwidth` can be considered a combination of two derivatives. In short, in the middle of a lit or shaded area, the rate of change will be zero, and on the border between both regions, it'll be something greater than zero.

We'll use that in combination with the `smoothstep` function, which can be thought of as the soulmate to the `lerp` function. While `lerp` gives a lower bound and an upper bound and you control the returned value by supplying a third parameter between 0 and 1, the `smoothstep` function asks you to supply an upper and lower bound again, but returns a value between 0 and 1 depending on where your third parameter rests between those bounds. In other words, `lerp(0, 5, 0.5)` will return a value of 2.5, and `smoothstep(0, 5, 2.5)` will return a value of 0.5. It should be noted that `smoothstep` isn't linear, which is a useful property for us that will produce a smooth but swift lighting transition.

~~~glsl
// In Properties.
_Antialiasing("Band Smoothing", Float) = 5.0

// With other variable declarations.
float _Antialiasing;

// In LightingCel.
float diffuse = dot(normal, lightDir);

float delta = fwidth(diffuse) * _Antialiasing;
float diffuseSmooth = smoothstep(0, delta, diffuse);

float3 col = s.Albedo * (diffuseSmooth * _LightColor0 + unity_AmbientSky);
~~~

You'll see I've kept the same `diffuse` calculation, but I've used it to calculate a `delta` value using `fwidth`. I multiply this by a new property called `_Antialiasing`, because it's nice to give control to your artists by exposing things in the Inspector, and the `delta` value is too small to be noticeable by itself. The `diffuseSmooth` calculation replaces our old cel-shading calculation, which utilised the ternary operator. Remember to use the new `diffuseSmooth` variable in the colour calculation instead of the old `diffuse` variable!

You should now have a very small lighting falloff that gives our object a less harsh transition from light to dark. It's fully controllable from the material in the Inspector. Beware that large values for the `_Antialiasing` variable (called `Band smoothing` in the Inspector) look atrocious, so keep it low!

<img data-src="/img/tut2/part2-cel-shaded-falloff-surf.jpg" class="center-image lazyload" alt="Smooth Falloff Surf">

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

## Specular lighting

Diffuse lighting doesn't take the view direction into account. Specular lighting, on the other hand, does. Specular highlights are the "shiny" parts of an object - if you think of a well-polished ball, you might imagine a small circle on the top of the ball that reflects really brightly - that's a specular highlight, and it manifests due to the light source reflecting off that part of the ball into your eyes directly.

It's relatively easy to implement this. Our lighting model can use the view direction by passing it into the model function; the `viewDir` variable in this example denotes the vector from the camera's position pointing forward into the centre of the screen.

~~~glsl
float4 LightingCel(SurfaceOutput s, half3 lightDir, half3 viewDir, half atten)
...
~~~

For diffuse lighting, we specified a base albedo colour to use as a base. Similarly, for a specular lighting component, we must know how "shiny" our material is - this controls the size of the specular highlight. We'll also want to know the colour of the specular highlights, but we can use the directional light's colour in the same way as our diffuse component, so we'll only need one more entry in `Properties`.

~~~glsl
// In Properties.
_Glossiness("Glossiness/Shininess", Float) = 400

// With other variable declarations.
float _Glossiness;
~~~

How exactly do we consider the view direction? First, we calculate what's called the "half vector" - a vector that points exactly halfway between the view direction and the light direction. Then we perform the dot product on the normal vector and the half vector. We'll put our specular calculation code between the diffuse calculations and the final colour calculation.

~~~glsl
float3 halfVec = normalize(lightDir + viewDir);
float specular = dot(normal, halfVec);
~~~

By adding the vectors together and normalising the result, we get the half vector. However, this would result in a very large specular highlight and doesn't yet take the `_Glossiness` property into account; we'll use a power function to get the best result. We don't want specular highlights to appear on the shaded sections of the object, so we'll also multiply our specular coefficient by the existing smooth diffuse value.

~~~glsl
specular = pow(specular * diffuseSmooth, _Glossiness);
~~~

The `pow` function raises the first parameter to the power of the second parameter. By multiplying `specular` together with `diffuseSmooth`, we'll only get specular highlights on the lit sections of the object, and by raising to the power of `_Glossiness`, we can control the specularity with a value in the Inspector.

We'll also do a smoothing step like we did with the diffuse component of the lighting. We won't use the same trick with `fwidth` because the rate of change between pixels is too high and the results aren't very pleasant. Instead, we'll just use `smoothstep` directly and define our own upper bound, controlled by the `_Antialiasing` property.

~~~glsl
float specularSmooth = smoothstep(0, 0.01 * _Antialiasing, specular);
~~~

All that's left is to include the specular highlights in the final lighting calculation. We'll just add the diffuse and specular light values together, since both types of lighting are additive in nature.

~~~glsl
float3 col = s.Albedo * ((diffuseSmooth + specularSmooth) * _LightColor0 + unity_AmbientSky);
return float4(col, s.Alpha);
~~~

<img data-src="/img/tut2/part2-cel-shaded-surf.jpg" class="center-image lazyload" alt="Specular Surf">

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

# Fragment Shader

Now's let's go over all that again with a vertex and fragment shader variant. Almost everything will be the same or very similar, with only a couple of steps unique to the fragment shader. Open the `Shaders/CelShadedFrag.shader` file - it's essentially the same as `Shaders/Complete/DiffuseFrag`.

We'll add the `_Antialiasing` and `_Glossiness` variables like we did for the surface shader.

~~~glsl
// In Properties.
_Antialiasing("Band Smoothing", Float) = 5.0
_Glossiness("Glossiness/Shininess", Float) = 400

// With other variable declarations.
float _Antialiasing;
float _Glossiness;
~~~

On top of that, remember to include the `Lighting.cginc` file.

~~~glsl
// Below UnityCG include statement.
#include "Lighting.cginc"
~~~

Then, we shall deal with sending the view direction through the pipeline. In the surface shader, we passed this as an extra parameter to the lighting model function, but for this shader we're going to have to go all traditional and calculate it ourselves. There's a function Unity provides called `WorldSpaceViewDir()` to which we can provide a vertex as an argument and it'll return a vector pointing from the camera to that vertex. We'll declare the new `viewDir` variable inside the `v2f` struct and calculate it inside the vertex shader.

~~~glsl
// Add to v2f.
float3 viewDir : TEXCOORD1;

// Inside vertex shader, just above the return statement.
o.viewDir = WorldSpaceViewDir(v.vertex);
~~~

Wonderful - that's most of the differences between this shader and the surface shader version dealt with. The rest of the code looks pretty much the same - here's the fragment shader in its entirety.

~~~glsl
fixed4 frag (v2f i) : SV_Target
{
    fixed4 albedo = tex2D(_MainTex, i.uv) * _Color;

    float3 normal = normalize(i.worldNormal);
    float diffuse = dot(normal, _WorldSpaceLightPos0);

    float delta = fwidth(diffuse) * _Antialiasing;
    float diffuseSmooth = smoothstep(0, delta, diffuse);

    float3 halfVec = normalize(_WorldSpaceLightPos0 + i.viewDir);
    float specular = dot(normal, halfVec);
    specular = pow(specular * diffuseSmooth, _Glossiness);

    float specularSmooth = smoothstep(0, 0.01 * _Antialiasing, specular);

    fixed4 col = albedo * ((diffuseSmooth + specularSmooth) * _LightColor0 + unity_AmbientSky);
    return col;
}
~~~

With that, you should see a cel-shaded object like the surface shader version.

<img data-src="/img/tut2/part2-cel-shaded-frag.jpg" class="center-image lazyload" alt="Specular Frag">

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

# Conclusion

In this tutorial, we learned how to implement a very simple two-tone cel shader. We then iterated upon it to make the cut slightly smoother using `smoothstep` and added a specular highlight. Next time, we'll look at a more complex model and implement normal/bump mapping and fresnel lighting.

<hr/>
