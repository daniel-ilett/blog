---
layout: post
title: Image Effects | Part 2 - Getting Deep
subtitle: Introducing a new kind of buffer to take data from
bigimg: /img/tut1/part2-banner.png
gh-repo: daniel-ilett/smo-shaders
gh-badge: [star, fork, follow]
tags: [shaders, unity, image-effects, silhouette]
nice-slug: Getting Deep
date: 2019-05-04
---

Today we'll look at the Silhouette effect, which draws objects close to the camera in a darker shade than those far back in the distance. So far, we've been interacting with the framebuffer - the 2D array of values that pixel colour values are rendered into - and today another buffer, the depth buffer, will be analysed.

<hr/>

![Silhouette](/img/tut1/part2-silhouette.png)

# Silhouette

The Silhouette filter is a striking effect which emphasizes objects in the foreground, bringing the eye's focus towards those elements. With this shader, we're going to develop some metric to determine how far away from the screen each pixel is.

Imagine a complex scene with many objects obscuring other objects from view, in whole or in part. How exactly does the GPU decide to render the objects in front, but ignore those behind? A naive implementation of a rendering algorithm might just take every object in the scene in some indeterminate order and draw them all in turn, and it'd be a mess - objects would likely be erroneously drawn in front of object that they ought to be behind. Our graphics pipeline should keep track of what has already been drawn to the screen - lucky for us, generations of smart graphics people thought up some neat ways of doing this!

When the GPU wants to draw a pixel to the screen, we can calculate how far away from the camera the pixel is. We remember that value by recording it in a 2D array called the "depth buffer" or "z-buffer" - the distance recorded is called the "depth value", and each member of this array corresponds to a pixel position on the screen. The corresponding buffer used to hold all the screen pixel colours is called the "framebuffer". When we attempt to draw a pixel to the framebuffer, we'll do some "depth testing" - if there is already a depth value in the depth buffer lower than the one for the pixel we're trying to draw at that position, then we'll discard it instead. Else, we shall draw it to the framebuffer at that pixel position and record its depth value in the depth buffer.

This is useful for us, as the silhouette effect is, essentially, colouring pixels based on their depth. If we can access the depth buffer in the fragment shader for our image effect, then we'll be able to apply colours based on how far away objects were when they were initially rendered to the framebuffer.

![Camera Frustum](/img/tut1/part2-camera-frustum.png){: .center-image }

Let's go over the implementation details of the depth buffer. Usually, depth values are floating-point decimals between 0 and 1, where 0 is very close to the camera, and 1 is far away. How close and how far, I hear you ask? Well, our camera is in perspective mode, so objects further away look smaller than objects close to you. We only want the camera to draw certain objects, so we define a volume shaped like a square-based pyramid with the top cut off - a rectangular frustum - to decide what is or isn't in the camera's view. The angle of the frustum is controlled by a "field of view" parameter, and the base and top of the pyramid are called the 'near' clip plane and 'far' clip plane. Pixels resting exactly on the near plane have a depth of 0, and those on the far plane have a depth of 1. Anything outside that frustum shape won;t be drawn at all.

To throw one more complexity into the equation, depth values aren't calculated linearly between the near and far clip planes, as explained [here](https://developer.nvidia.com/content/depth-precision-visualized). That might seem counter-intuitive at first, but we can exploit the properties of floating-point numbers to store close objects with more precision than faraway objects. Don't worry about it too much - we'll be using pre-defined functions to handle the necessary conversions for us.

![Camera Parameters](/img/tut1/part2-camera-params.png){: .center-image }

Before we start, make sure to set your camera's far clip plane value to something sensible - I used a value of 75 which should keep the example scene all in frame, but this will likely require a bit of tweaking based on the size of your scene. If it's too large, you'll barely see the difference between close objects when the shader is complete, and if it's not large enough, some objects in your scene will not be rendered.

We can retrieve the depth buffer as a texture to use in shaders in Unity. Open up the shader template found in `Shaders/Silhouette.shader` and take a look at the fragment shader - I've defined a depth varaible that we'll be modifying. Running this shader now will result in a completely black screen - let's fix this. Remember how the texture rendered by the camera is passed to the image effect shader in `_MainTex`? Similarly, we can retrieve the camera depth texture called `_CameraDepthTexture`, like this:

~~~glsl
// Other variable definitions.
sampler2D _CameraDepthTexture;
~~~

We don't need to do anything special to enable this functionality - by default, [it is available](https://docs.unity3d.com/Manual/SL-CameraDepthTexture.html) for our image effect shader to use. Each pixel of the depth texture contains the depth buffer values for that pixel; the texture is the same size as `_MainTex`. Unity defines many helpful functions inside `UnityCG.cginc`, as discussed in the Shader Primer - we'll use one of those to help us get depth values from the depth texture. Inside the fragment shader, let's change the value we use for the depth:

~~~glsl
float depth = UNITY_SAMPLE_DEPTH(tex2D(_CameraDepthTexture, i.uv));
~~~

`UNITY_SAMPLE_DEPTH` is a special function which we can use to get a depth value out of the depth texture. We'll sample the depth texture the same way we would sample any other texture, then use `UNITY_SAMPLE_DEPTH()` to convert it from a colour to a single depth value. If you apply this shader now, the colours will be the wrong way round - we want the background to be white. Let's change the depth value with an extra line of code.

~~~glsl
float depth = UNITY_SAMPLE_DEPTH(tex2D(_CameraDepthTexture, i.uv));
depth = Linear01Depth(depth);
~~~

Before applying the `Linear01Depth` function, the depth value actually represents the reciprocal of the true depth, as per the article I linked earlier. By using the function, we make the depth value linear between 0 and 1 - now the background is fully white and the foreground elements are easier to distinguish from one another. I tweaked this line further to make the effect a bit more pronounced, but this is likely going to be down to personal preference:

~~~glsl
depth = pow(Linear01Depth(depth), 3);
~~~

By using a power function, the distances between objects close to the screen will be exaggerated even more. We now have a depth effect, but it's entirely greyscale, so let's add a bit of colour.

~~~glsl
// Properties.
_NearColour ("Near Clip Colour", Color) = (0.75, 0.35, 0, 1)
_FarColour  ("Far Clip Colour", Color)  = (1, 1, 1, 1)

// Shader variables.
fixed4 _NearColour;
fixed4 _FarColour;
~~~

My apologies for how I'm spelling 'colour', by the way - I'm a stubborn Brit so it's in my blood to add in the 'u'. We'll define two colours - one is the colour value for pixels at the near clip plane, and the other for pixels at the far clip plane. Now we'll need a bit of code in our shader to pick a colour between those two, based on the depth value. The `lerp()` function is perfect for this - it takes in two colours and some floating-point decimal between 0 and 1, and returns a colour blended between the first and second colour, based on that decimal.

~~~glsl
return lerp(_NearColour, _FarColour, depth);
~~~

The word 'lerp' is short for 'linear interpolation', and here we'll see it in action. If you run the shader with those values, you'll get a lovely yellow-orange blend reminiscent of the Sand Kingdom's silhouette effect.

<hr/>

# Conclusion

Those are the basics of using the depth buffer and depth textures to achieve an effect based on how far away pixels are. If you'd like to play around with the effect a bit, you could probably find a way to implement a cheap fog effect by keeping the base pixel colours but making them lighter the further away they are.

Next tutorial, we'll be taking a look at the Blur effect and a few different approaches we could take to implement a blur.

<hr/>
