---
layout: post
title: Ultra Effects | Part 6 - Chromatic Course
subtitle: 
bigimg: /img/tut3/part6-banner.jpg
gh-repo: daniel-ilett/image-ultra
gh-badge: [star, fork, follow]
tags: [unity, shaders, image-effects, ultra-effects, chromatic-aberration, vignette]
nice-slug: Chromatic Course
date: 2019-11-27
idnum: 29
---

As with last week's filmic effects, we can derive many pleasing postprocessing effects by considering the limitations of camera technology. Last week, we talked about the imperfections of photographic film, and today we'll talk about the issues caused by camera lenses. Lenses work by focusing an incoming image onto a *focal point* - parts of the photo outside that point look blurry, as you'll see on many photos with an exaggerated *depth-of-field* effect. Depending on the lens and the construction of the camera, a phenomenon called **vignetting** can occur where the field-of-view is restricted artificially by physical obstacles around the entrance to the lens, or naturally by the illumination falloff of light. On top of that, different wavelengths of light may not share the same focal point. Some lenses bend blue light a bit more strongly than red light - the two colours are on opposite ends of the visible light spectrum - and the result is that the colour channels seem to separate on the edge of the photo. This is called **chromatic aberration**, and today we'll look at that alongside **vignetting**.

![Jewellery Photo](/img/tut3/part6-jewellery-example.jpg){: .center-image }

[Photo by Slavica Panova on Wikimedia Commons](https://en.wikipedia.org/wiki/File:Filigranski_nakit_02_edit.JPG)

<hr/>

# Vignetting

Vignetting is the reduction of brightness at the edges of a photo - it's usually most intense at the corners. It can appear for several reasons - the [Wikipedia entry](https://en.wikipedia.org/wiki/Vignetting) gives a good breakdown of the main causes - and it's generally considered either a nuisance or an artistic choice, depending on your outlook. Today, we're artists.

This effect isn't too difficult to recreate. We need to calculate some metric to determine how close to the edges a pixel is. We'll also need a property to control the overall strength of the effect, and another to control how smooth it is - how fast the effect goes from maximum to minimum vignetting. Let's crack on with a shader to cover all of this.

This shader is available at *Resources/Shaders/Vignette.shader*. First off, we'll need to fill the **Properties** block with the variables we've just described and add them as variables later on in the shader.

~~~glsl
// In Properties.
_MainTex ("Texture", 2D) = "white" {}
_Strength("Strength", Float) = 0.5
_Size("Size", Float) = 0.75
_Falloff("Falloff", Float) = 0.25

// Above fragment shader.
uniform sampler2D _MainTex;
uniform float _Strength;
uniform float _Size;
uniform float _Falloff;
~~~

We're using the `_Strength` property to control the global strength of the effect. The `_Size` property will control how far from the edge the effect will start, and the `_Falloff` property controls how far the vignette will spread towards the centre - the higher it is, the further the vignette will crawl and the softer it will be. Let's start off the fragment shader.

~~~glsl
fixed4 frag (v2f i) : SV_Target
{
    fixed4 col = tex2D(_MainTex, i.uv);

    ...

    return col;
}
~~~

The skeleton of the fragment shader begins with sampling `_MainTex`. We won't be messing with UVs while sampling in the vignette shader. Next, we must calculate how far from the centre the pixel is.

~~~glsl
float dist = distance(i.uv, float2(0.5f, 0.5f));
~~~

The `distance` function calculates the magnitude of the vector between two points. In our case, we're comparing the UV coordinate of the pixel with (0.5, 0.5) - the centre of the image. This means the distance will be equal to half the square root of two in the corners, and that our vignette will get squashed into a non-circular ellipsoid for non-square rectangular images.

Now we'll determine how strong the vignette effect should be at this pixel. The further away from the centre, the stronger it should be, with a falloff. For this, we'll use the `smoothstep` function. We've talked about [alternative interpolation techniques](https://danielilett.com/2019-09-08-unity-tips-3-interpolation/) on this site before, but to remind you, smoothstep is a non-linear inerpolation curve that 'speeds up' towards the middle.

$$
    smoothstep(a,b,t)=a+(b-a)(-2t^3+3t^2)
$$

~~~glsl
float vignette = smoothstep(_Size, _Size - _Falloff, dist);
vignette = lerp(1.0f, vignette, _Strength);
~~~

On the first line of code we're saying the vignette should be at its strongest at a distance of `_Size` from the centre, and it should gradually get weaker as you head towards the centre, until you are a distance of `_Falloff` away from the strongest point. We're using the actual distance from the centre, `dist`, as the third parameter.

The second line of code is there to control the maximum darkness of the vignette effect - we can't just multiply the final vignette value by _Strength because this will affect non-vignetted pixels in the centre of the screen. By `lerp`ing between 1.0 and the `vignette` value from the previous line of code, we'll scale the amount of darkness in the vignetted pixels only.

Finally, we'll combine the vignette values with the original texture sample. For this, we can use the `saturate` function, which clamps the value betwen 0.0 and 1.0.

~~~glsl
col = saturate(col * vignette);
~~~

We should have a nice bignette effect now. Let's see the script that controls the effect.

<hr/>

# Acknowledgements

I'd like to thank my Patreon supporters for making this content possible. [Become a Patron](https://www.patreon.com/danielilett) for $1+ to receive PDF versions of all articles, or $5+ to get certain articles early!

This tutorial series uses the following asset packs - available on the Unity Asset Store:

[Forest - Low Poly Toon Battle Arena / Tower Defense Pack](https://assetstore.unity.com/packages/3d/environments/forest-low-poly-toon-battle-arena-tower-defense-pack-100080) | [**AurynSky**](https://assetstore.unity.com/publishers/17283)

## $20 Backers

Special thanks to my $20 backers:

- Gemma Louise Ilett

<hr/>
