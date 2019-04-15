---
layout: post
title: Image Effects - Part 2 - Getting Deep
subtitle: Introducing a new kind of buffer to take data from
bigimg: /img/tut1/part2-banner.png
tags: [shaders, unity]
nice-slug: Getting Deep
date: 2019-04-12 02:00:00
---

Today we'll look at the Silhouette effect, which draws objects close to the camera in a darker shade than those far back in the distance. So far, we've been interacting with the framebuffer - the 2D array of values that pixel colour values are rendered into - and today another buffer, the depth buffer, will be analysed.

# Silhouette

![Silhouette](/img/tut1/part2-silhouette.png)

The Silhouette filter is a striking effect which emphasizes objects in the foreground, bringing the eye's focus towards those elements. With this shader, we're going to develop some metric to determine how far away from the screen each pixel is.

Imagine a complex scene with many objects obscuring other objects from view, in whole or in part. How exactly does the GPU decide to render the objects in front, but ignore those behind? A naive implementation of a rendering algorithm might just take every object in the scene in some indeterminate order and draw them all in turn, and it'd be a mess - some objects would probably be erroneously drawn in front of object that they ought to be behind. Our graphics pipeline should keep track of what has already been drawn to the screen - lucky for us, generations of smart graphics people are ahead of us!

When the GPU wants to draw a pixel to the screen, we can calculate how far away from the camera the pixel is. We remember that value by recording it in a 2D array called the "depth buffer" or "z-buffer" - the distance recorded is called the "depth value", and each member of this array corresponds to a pixel position on the screen. Indeed, the buffer used to hold all the screen pixel colours is called the "framebuffer". So when we attempt to draw a pixel to the screen, we'll do some "depth testing" - if there is already a depth value in the depth buffer lower than the one for the pixel we're trying to draw at that position, then we'll discard it instead. Else, we shall draw it to the framebuffer at that pixel position and log its depth value in the depth buffer.

This is useful for us, as the silhouette effect is, essentially, colouring pixels based on their depth. If we can access the depth buffer in the fragment shader for our image effect, then we'll be able to apply colours based on how far away objects were when they were initially rendered to the framebuffer.

Let's go over the implementation details of the depth buffer. Usually, depth values are floating-point decimals between 0 and 1, where a depth value of 0 is very close to the camera, and a value of 1 is very far away. How close and how far, I hear you ask? Cameras have a few parameters to keep track of this. Our camera is in perspective mode, meaning that it renders objects in a sort of pyramid shape, similar to how your eyes work - objects further away look smaller than objects close to you. The angle of the cone is often referred to as the "field of view". A camera won't render everything in world space as it has to cull some objects for efficiency reasons; for that purpose, a camera has a 'near' clip distance and a 'far' clip distance. Anything closer than the near clip distance or further away from the far clip distance doesn't get drawn. 

The resulting volume in which objects get drawn ends up shaped like a square-based pyramid with the top cut off - a rectangular frustum. Pixels positioned exactly on the near clip plane have a depth of 0, pixels on the far clip plane have a depth of 1, and all positions in between have depths between 0 and 1. Those are the values in the depth buffer. But to throw one more curveball into the mix, depth values typically aren't stored in the depth buffer as-is; the actual value stored in the buffer is usually a reciprocal, as explained [here](https://developer.nvidia.com/content/depth-precision-visualized). That might seem counter-intuitive at first, but because of floating-point precision issues, we want to represent objects near the camera with more precision than objects far away from the camera - this lets us do that. Don't worry about the implementation details too much, as we'll use pre-defined functions that worry about it on our behalf.

We can retrieve the depth buffer as a texture to use in shaders in Unity. Open up the shader template found in `Shaders/Silhouette.shader` and take a look at the fragment shader - I've defined a depth varaible, which is instantly returned. Running this shader now will result in a completely black screen - let's fix this. First off, let's grab the texture containing the depth buffer values. Remember that an image effect is drawn after the camera has finished rendering to a texture - that texture is passed to the image effect shader in `_MainTex`. Similarly, we can retrieve another texture called `_CameraDepthTexture`, like this:

~~~glsl
// Other variable definitions.
sampler2D _CameraDepthTexture;
~~~

There are no special settings to modify to obtain the depth texture - by default, [it is available](https://docs.unity3d.com/Manual/SL-CameraDepthTexture.html) for our image effect shader to use. This texture isn't the depth buffer itself, but it does contain the values that were in the depth buffer when the camera finished rendering the scene. Unity defines many helpful functions inside `UnityCG.cginc`, as discussed in the Shader Primer - we'll use one of those to help us get depth values from the depth texture. Inside the fragment shader, let's change the value we use for the depth:

~~~glsl
float depth = UNITY_SAMPLE_DEPTH(tex2D(_CameraDepthTexture, i.uv));
~~~

`UNITY_SAMPLE_DEPTH` is a special function which we can use, alongside sampling the depth texture as usual, to get a depth value out.
