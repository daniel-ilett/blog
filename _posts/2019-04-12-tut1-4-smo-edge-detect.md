---
layout: post
title: Image Effects | Part 4 - Edgy Talk
subtitle: Calculating image gradients and drawing some edges
bigimg: /img/tut1/part4-banner.png
tags: [shaders, unity, image-effects, edge-detect]
nice-slug: Edgy Talk
date: 2019-04-12 04:00:00
---

Detecting edges in images allows developers to write cartoon shaders to boldly outline objects. Typically, they would use object geometry, but we can achieve a cheap edge-detection effect using image effects. In this tutorial, we shall explore the Sobel-Feldman operator and take a look at bloom effects to implement the Neon effect in Super Mario Odyssey.

# Edge Detection

![Edge Detection](/img/tut1/part4-edge-detect.png)

To detect edges using an image effect, let's think about what an edge actually is. Without being able to use object geometry to decide where an edge is, we will consider edges in the image to be places where the colour changes suddenly in lightness or hue. That means we will have to consider multiple pixels as we did with the Blur filters, but using a different kernel. Let's take a look at the Sobel filter.

A Sobel operator calculates "gradients" across an image and then uses the magnitude of those gradients to decide where there are edges. Since a gradient is inherently something we can only do in one direction at a time, we shall perform two calculations in the x- and y-directions - but this time, we thankfully won't need to do them in separate passes, as you'll see. Each calculation involves a 3x3 kernel.

$$ 
G_x = 
\begin{bmatrix}
    -1 & 0 & 1 \\
    -2 & 0 & 2 \\
    -1 & 0 & 1
\end{bmatrix}
\hspace{25pt}
G_y = 
\begin{bmatrix}
    -1 & -2 & -1 \\
     0 &  0 &  0 \\
     1 &  2 &  1
\end{bmatrix}
$$

Now let's take a look at this in a shader - the template for this can be found in `Shaders/EdgeDetect.shader`. I've defined a `sobel()` function which will do the heavy lifting for us - the fragment shader is already complete. Running the shader now will give you a very underwhelming black screen, so let's add some calculation to the `sobel()` function.

We've defined accumulator variables for the horizontal (x) and vertical (y) passes, and for the sake of saving on some typing, `texelSize` is its own variable. For each of the kernel values, we will want to multiply them by the corresponding pixel values, similar to the Blur shaders, but since we know the kernel is always 3x3, there's no point writing everything in a complex loop - let's just hard-code the calculations. Between the `texelSize` variable definition and the return statement, splice in this code:

~~~glsl
x += tex2D(_MainTex, uv + float2(-texelSize.x, -texelSize.y)) * -1.0;
x += tex2D(_MainTex, uv + float2(-texelSize.x,            0)) * -2.0;
x += tex2D(_MainTex, uv + float2(-texelSize.x,  texelSize.y)) * -1.0;

x += tex2D(_MainTex, uv + float2( texelSize.x, -texelSize.y)) *  1.0;
x += tex2D(_MainTex, uv + float2( texelSize.x,            0)) *  2.0;
x += tex2D(_MainTex, uv + float2( texelSize.x,  texelSize.y)) *  1.0;

y += tex2D(_MainTex, uv + float2(-texelSize.x, -texelSize.y)) * -1.0;
y += tex2D(_MainTex, uv + float2(           0, -texelSize.y)) * -2.0;
y += tex2D(_MainTex, uv + float2( texelSize.x, -texelSize.y)) * -1.0;

y += tex2D(_MainTex, uv + float2(-texelSize.x,  texelSize.y)) *  1.0;
y += tex2D(_MainTex, uv + float2(           0,  texelSize.y)) *  2.0;
y += tex2D(_MainTex, uv + float2( texelSize.x,  texelSize.y)) *  1.0;
~~~

If you look over the values, you'll see they correspond to the kernel calculations, but I've missed out the ones which are multiplied by zero since they won't have an effect on the final value anyway. Run the shader now, and you should see some lovely edge detection! I'd suggest that if you intend to use this effect in a game as-is, then consider turning off shadows, because they'll also be edge-detected and could look strange. Alternatively, use that as your aesthetic - be creative!

<hr/>

# Neon

The Edge Detect shader was a bit of a breeze compared to the Blur shaders, so let's take things up a notch and consider the Neon effect. It's easy to see this is based on Edge Detect with a bit of added colour, so as a first step let's try multiplying the original image colours by the edge detect values. You'll find the template in `Shaders/Neon.shader`, although it's essentially the same as `EdgeDetect.shader`. Modify the fragment shader like this:

~~~glsl
float3 s = sobel(i.uv);
float3 tex = tex2D(_MainTex, i.uv);

return float4(tex * s, 1.0);
~~~

Already it's looking a bit neon! But if the source file has muted colours, then the end result will also look fairly dull. Increasing the saturation of the colours will help inject a little more life into the scene. I won't go into too much detail about colour theory, but we'll need to convert from RGB colour space to some other space such as HSV - which stands for "hue, saturation, value" - then modify the saturation and convert back to RGB. There isn't code built into the shader language or Unity to perform this conversion for us, so instead let's use [code from elsewhere](http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl). The code in that example is written in GLSL, so I've also converted it into HLSL so we can splice it into our shader.

~~~glsl
// Credit for these two functions:
// http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
float3 rgb2hsv(float3 c)
{
    float4 K = float4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    float4 p = c.g < c.b ? float4(c.bg, K.wz) : float4(c.gb, K.xy);
    float4 q = c.r < p.x ? float4(p.xyw, c.r) : float4(c.r, p.yzx);

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return float3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

float3 hsv2rgb(float3 c)
{
    float4 K = float4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    float3 p = abs(frac(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * lerp(K.xxx, saturate(p - K.xxx), c.y);
}
~~~

Now let's perform the conversions. As well as modifying the saturation, I also modify the value/lightness so that the bright colours pop even more.

~~~glsl
float3 hsvTex = rgb2hsv(tex);
hsvTex.y = 1.0;		// Modify saturation.
hsvTex.z = 1.0;		// Modify lightness/value.
float3 col = hsv2rgb(hsvTex);

return float4(col * s, 1.0);
~~~

Run the shader now, and the neon effect should look pretty decent now! The conversion makes pixels that were near-greyscale look much more colourful than before, so the whole scene might look very different to what you were expecting.

<hr/>

# Conclusion

<hr/>
