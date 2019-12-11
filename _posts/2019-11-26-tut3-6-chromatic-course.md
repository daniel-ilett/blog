---
layout: post
title: Ultra Effects | Part 6 - Chromatic Course
subtitle: Simulating lens imperfections
bigimg: /img/tut3/part6-banner.jpg
gh-repo: daniel-ilett/image-ultra
gh-badge: [star, fork, follow]
tags: [unity, shaders, image-effects, ultra-effects, chromatic-aberration, vignette]
nice-slug: Chromatic Course
date: 2019-11-26
idnum: 29
---

As with last week's filmic effects, we can derive many pleasing postprocessing effects by considering the limitations of camera technology. Last week, we talked about the imperfections of photographic film, and today we'll talk about the issues caused by camera lenses. Lenses work by focusing an incoming image onto a *focal point*. 

Depending on the lens and the construction of the camera, a phenomenon called **vignetting** can occur where the field-of-view is restricted, causing shadows at the edges of the photo. On top of that, different wavelengths of light may not share the same focal point, resulting in different colour channels seemingly separating at the edge of the photo. This is called **chromatic aberration**, and today we'll look at that alongside **vignetting**.

![Jewellery Photo](/img/tut3/part6-jewellery-example.jpg){: .center-image .lazyload }

[Photo by Slavica Panova on Wikimedia Commons](https://en.wikipedia.org/wiki/File:Filigranski_nakit_02_edit.JPG)

<hr/>

# Vignetting

**Vignetting** is the reduction of brightness at the edges of a photo - it's usually most intense at the corners. It can appear for several reasons - the [Wikipedia entry](https://en.wikipedia.org/wiki/Vignetting) gives a good breakdown of the main causes - and it's generally considered either a nuisance or an artistic choice, depending on your outlook. Today, we're artists.

This effect isn't too difficult to recreate. We need to calculate some metric to determine how close to the edges a pixel is. We'll also need a property to control the overall strength of the effect, and another to control how smooth it is - how fast the effect goes from maximum to minimum vignetting. Let's crack on with a shader to cover all of this.

This shader is available at *Resources/Shaders/Vignette.shader*. First off, we'll need to fill the **Properties** block with the variables we've just described and add them as variables later in the shader.

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

Now we'll determine how strong the vignette effect should be at this pixel. The further away from the centre, the stronger it should be, with a falloff. For this, we'll use the `smoothstep` function. We've talked about [alternative interpolation techniques](https://danielilett.com/2019-09-08-unity-tips-3-interpolation/) on this site before, but to remind you, smoothstep is a non-linear interpolation curve that 'speeds up' towards the middle.

$$
    smoothstep(a,b,t)=a+(b-a)(-2t^3+3t^2)
$$

~~~glsl
float vignette = smoothstep(_Size, _Size - _Falloff, dist);
vignette = lerp(1.0f, vignette, _Strength);
~~~

On the first line of code we're saying the vignette should be at its strongest at a distance of `_Size` from the centre, and it should gradually get weaker as you head towards the centre, until you are a distance of `_Falloff` away from the strongest point. We're using the actual distance from the centre, `dist`, as the third parameter.

The second line of code is there to control the maximum darkness of the vignette effect - we can't just multiply the final vignette value by `_Strength` because this will affect non-vignetted pixels in the centre of the screen. By `lerp`ing between 1.0 and the `vignette` value from the previous line of code, we'll scale the amount of darkness in the vignetted pixels only.

Finally, we'll combine the vignette values with the original texture sample. For this, we can use the `saturate` function, which clamps the value between 0.0 and 1.0.

~~~glsl
col = saturate(col * vignette);
~~~

We should have a nice vignette effect now. Let's see the script that controls the effect. It's found in *Scripts/Image Effects/VignetteEffect.cs*.

~~~csharp
[CreateAssetMenu(menuName = "Image Effects Ultra/Vignette", order = 1)]
public class VignetteEffect : BaseEffect
{
    [SerializeField]
    private float strength = 0.5f;

    [SerializeField]
    private float size = 0.75f;

    [SerializeField]
    private float falloff = 0.25f;

    // Find the Vignette shader source.
    public override void OnCreate()
    {
        baseMaterial = new Material(Resources.Load<Shader>("Shaders/Vignette"));
        baseMaterial.SetFloat("_Strength", strength);
        baseMaterial.SetFloat("_Size", size);
        baseMaterial.SetFloat("_Falloff", falloff);
    }

    public override void Render(RenderTexture src, RenderTexture dst)
    {
        Graphics.Blit(src, dst, baseMaterial);
    }
}
~~~

We're exposing `strength`, `size` and `falloff` variables and then setting them on our material to link them to the `_Strength`, `_Size` and `_Falloff` shader properties in the `OnCreate` method. Then, the `Render` method performs a `Graphics.Blit` to run the vignette as a postprocessing effect.

I've created two examples of the vignette effect inside the *Effects* folder - they're named *Vignette.asset* and *VignetteStrong.asset*. The former offers a very slight darkening effect at the corners, while the latter produces a much more obvious effect. Let's see what the strong version looks like in practice.

![Vignette Effect](/img/tut3/part6-vignette-complete.jpg){: .center-image .lazyload }

A value of somewhere around 0.7 to 0.8 tends to work well for the `_Size` property, somewhere around 0.25 for the `_Falloff` property produces a smooth falloff and the value of `_Strength` depends on how intense you'd like the effect but I found that approximately 0.5 worked well.

<hr/>

# Chromatic Aberration

Now let's get into the meat of this tutorial. Earlier we talked about the way some lenses focus different wavelengths of light more or less strongly than others, and how this can produce coloured artefacts at the edges and corners of an image; that's **chromatic aberration**. A typical human eye picks up colour in the red, green and blue parts of the visible light spectrum, so we will treat our image as three separate channels of light and subtly move the channels outwards towards the edges or inwards towards the centre depending on which channel we're moving, and depending on the desired strength of the effect.

Let's look at the shader for this effect, found at *Resources/Shaders/ChromaticAberration.shader*. We'll start off with the **Properties** block, which will contain the same four properties as the **Vignette** shader.

~~~glsl
// In Properties.
_MainTex ("Texture", 2D) = "white" {}
_Strength("Strength", Float) = 0.05
_Size("Size", Float) = 0.75
_Falloff("Falloff", Float) = 0.25

// Above fragment shader.
uniform sampler2D _MainTex;
uniform float _Strength;
uniform float _Size;
uniform float _Falloff;
~~~

Let's move to the **fragment shader**. We're going to carry out a similar process to the **Vignette** shader in order to calculate how far from the centre the pixel is. Instead of multiplying that value by the sampled colour, we'll use it to determine how much we wish to separate each colour channel.

~~~glsl
fixed4 frag (v2f i) : SV_Target
{
    float2 fromCenter = i.uv - float2(0.5f, 0.5f);
    float dist = length(fromCenter);
    float vignette = 1.0f - smoothstep(_Size, _Size - _Falloff, dist);

    ...
}
~~~

The calculation is slightly different here. The value of dist is the same as in the Vignette shader, but we're storing the value of `fromCenter` for use later in the shader. The `distance` function, which we used previously, does the same thing as subtracting one vector from the other and calculating the result's `length`. Then, while calculating the `vignette` value, we subtract the result of `smoothstep` from 1.0; whereas in the **Vignette** shader we wanted a white centre with black edges, in the **Chromatic Aberration** shader we want a black centre surrounded by white edges. This is because we're going to multiply the `fromCenter` value by the `vignette` value, then multiply by `_Strength` to obtain an offset value, like this:

~~~glsl
float rOffset = fromCenter * vignette * _Strength;
~~~

But what will this offset be used for? Recall that we're going to treat this image as three separate colour channels. In order to do that, we'll need to sample the image three times and pull only the red values from one, green for the second and blue for the third. We're going to offset the red and blue channels - the two extremes of the visible colour spectrum - by sampling with different UV coordinates for each channel. That's why it was important to preserve the value of `fromCentre` - we're going to sample slightly outwards from the centre for the red channel, and slightly inwards for the blue channel. For the green channel, we'll sample using the base UVs.

~~~glsl
float rOffset = fromCenter * vignette * _Strength;
float r = dot(tex2D(_MainTex, i.uv + rOffset), float3(1.0f, 0.0f, 0.0f));

float g = dot(tex2D(_MainTex, i.uv), float3(0.0f, 1.0f, 0.0f));

float bOffset = -rOffset;
float b = dot(tex2D(_MainTex, i.uv + bOffset), float3(0.0f, 0.0f, 1.0f));
~~~

For each texture sample, we're using the `dot` product to retrieve the value for only one colour channel. The final step is to combine all three channels into a single vector.

~~~glsl
return fixed4(r, g, b, 1.0f);
~~~

![Chromatic Aberration](/img/tut3/part6-chr-ab-complete.jpg){: .center-image .lazyload }

You should be able to see the effect most strongly on the left-hand side of this screenshot (you may have to view it in a separate tab). The effect is subtle - and chromatic aberration is definitely an effect to use sparingly if you opt to add it to your scenes. The above screenshot was taken using the *ChromaticAberration.asset* effect attached to the camera. Stronger aberration effects are useful if you're going for something like a glitch effect, in which aberration could be combined with other effects. Stronger chromatic aberration looks like this:

![Strong Aberration](/img/tut3/part6-strong-aberration.jpg){: .center-image .lazyload }

For funsies, I also included an effect inside the *Effects* folder called *VignetteAberration.asset*, which combines both effects.

![Vignette Aberration](/img/tut3/part6-vignette-aberration.jpg){: .center-image .lazyload }

<hr/>

# Conclusion

Camera lenses aren't perfect. Sometimes, the mechanical design of the camera or the natural falloff of light can cause darkness artefacts on the edges and corners of the image, called **vignetting**. And other times, the lenses might focus different wavelengths of light more or less strongly than others, resulting in **chromatic aberration** - the separation of colour information.

We're going to take a short break for this series during December to make way for **a brand new series**! But watch this space - there will be more tutorials in the Ultra Effects series in the future!

<hr/>

# Acknowledgements

I'd like to thank my Patreon supporters for making this content possible. [Become a Patron](https://www.patreon.com/danielilett) for $1+ to receive PDF versions of all articles, or $5+ to get certain articles early!

This tutorial series uses the following asset packs - available on the Unity Asset Store:

[Forest - Low Poly Toon Battle Arena / Tower Defense Pack](https://assetstore.unity.com/packages/3d/environments/forest-low-poly-toon-battle-arena-tower-defense-pack-100080) | [**AurynSky**](https://assetstore.unity.com/publishers/17283)

## $20 Backers

Special thanks to my $20 backers:

- Gemma Louise Ilett

<hr/>
