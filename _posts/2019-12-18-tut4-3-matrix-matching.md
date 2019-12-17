---
layout: post
title: Portals | Part 3 - Matrix Clipping
subtitle: Clipping the camera correctly
bigimg: /img/tut4/part3-banner.jpg
hdrimg: /img/tut4/part3-banner.jpg
gh-repo: daniel-ilett/shaders-portal
gh-badge: [star, fork, follow]
tags: [unity, shaders, portals, matrix, clip-plane]
nice-slug: Matrix Clipping
date: 2019-12-18
idnum: 33

part-label: 3
series-name: Portals
---

In the last tutorial, we managed to render a realistic portal using stencil buffers. We skipped over a few things to talk about in future tutorials, but I asked one key question: what happens to all the stuff between the portal camera and the portal surface? Wouldn't the stuff behind the portal get rendered unless we do something to exclude it? The answer is yes - and today we're going to explore how to prevent the scene behind the out-portal being rendered onto the in-portal surface.

<hr/>

# Camera Clipping

Cameras don't render the entire world. We use occlusion culling to ignore objects behind other objects, back-face culling to exclude object geometry facing away from the screen, and **frustum culling** to disregard objects outside the camera frustum. In order to cut out the bits of the scene between the camera and the portal, we'll be dealing with frustum culling - or more specifically, the **near clipping plane**.

Let's diagnose the problem. If we open up *Scripts/BasicPortal/BasicPortalCamera.cs* and look at the `RenderCamera` method, comment out lines 74 to 81 (inclusive) and then run the **BasicPortals** scene. The portals look totally wrong, don't they?

<div class="embed-responsive embed-responsive-16by9">
<video loop autoplay class="lazyload embed-responsive-item">
    <source src="/img/tut4/part3-no-near-clip.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
</div>

We're seeing the back of a wall behind the other portal. There's a very easy fix to this - just set the near clipping distance of the portal to be the distance from the portal to the camera. Then, the wall will be culled and the image in the portal should be correct, right? Let's add this line of code in place of the code we commented out.

~~~csharp
portalCamera.nearClipPlane = 
    Vector3.Distance(portalCamera.transform.position, outTransform.position);
~~~

It'll be easier to demonstrate the problem if we scale the portals by 2x. Now, when we run the scene, out two portals look like this:

<img data-src="/img/tut4/part3-wrong-clip-1.jpg" class="center-image lazyload" alt="Incorrect Clipping 1">

<img data-src="/img/tut4/part3-wrong-clip-2.jpg" class="center-image lazyload" alt="Incorrect Clipping 2">

So, what gives? When we set the near clipping plane as we did, it's **perpendicular** to the camera's **forward direction**. The artefacts we're seeing here where bits of the portal view are missing are parts of the portal surface that have been **clipped**, as they are behind the camera's near clipping plane. The bright colours that are getting rendered inside the portal are the ones we defined in `PortalMask` (see [Part 2](https://danielilett.com/2019-12-14-tut4-2-portal-rendering/)) - those parts are meant to be behind the near clipping plane, but they're being rendered erroneously. We need to angle the near plane slightly, so it rests over the portal surface's plane - in most circumstances this won't be perpendicular to the camera's forward direction. This requires some complex maths.

<hr/>

# Oblique Projection Matrix

What we're aiming to calculate is called an **oblique projection matrix**. Usually the camera calculates a **projection matrix** behind the scenes to define its **view frustum** in its local space - the only difference here that makes it **oblique** is that the near and far clip planes won't necessarily be parallel. We'll take the existing projection matrix and use a built-in Unity function called `CalculateObliqueMatrix` to turn it into an oblique projection matrix with the same field of view and far clip plane, but a different near clip plane.

Let's scrap the code we just added and uncomment the code that was there before. In order to define a new near clip plane for the camera, we'll first need to calculate the position of the plane in **world space**. Unity makes this easy with its built-in `Plane` object, which accepts a **normal vector** and a **position vector** as parameters to its constructor to create a Plane passing through that position, with that normal vector.

~~~csharp
Plane p = new Plane(-outTransform.forward, outTransform.position);
~~~

From here on out, though, we must define everything using the `Vector4` type. Conveniently, a plane can also be defined using a normal vector and a distance - and we can get that data directly from the `Plane` object we just created.

~~~csharp
Vector4 clipPlane = new Vector4(p.normal.x, p.normal.y, p.normal.z, p.distance);
~~~

Now we must convert this to the camera's local space. Annoyingly, there are several methods defined by Unity to transform `Vector3` from world to local space, but a total lack of easy ways to do this for `Vector4`. Instead, we're going to take `portalCamera`'s **world-to-camera matrix** - the matrix that transforms from world space to `portalCamera`'s camera clip space during rendering - and calculate the **inverse transpose** of this matrix. By multiplying `clipPlane` by the inverse transpose, we will obtain the `clipPlane` in camera space - so I've named the variable `clipPlaneCameraSpace`. There's a lot of linear algebra in this section but I hope that makes sense! 

~~~csharp
Vector4 clipPlaneCameraSpace =
    Matrix4x4.Transpose(Matrix4x4.Inverse(portalCamera.worldToCameraMatrix)) * clipPlane;
~~~

Now we can use the `CalculateObliqueMatrix` method I mentioned by passing in the new clip plane. It's defined on the `Camera` type. Since the `portalCamera` and `mainCamera` should have the same **far clip plane** and **field of view**, we're going to use this method on `mainCamera` in order to use `mainCamera`'s projection matrix instead of `portalCamera`'s (which could result in errors due to portalCamera already having an oblique projection matrix from the previous frame). The final step is to replace the `projectionMatrix` of `portalCamera` with the new oblique matrix.

~~~csharp
var newMatrix = mainCamera.CalculateObliqueMatrix(clipPlaneCameraSpace);
portalCamera.projectionMatrix = newMatrix;
~~~

If we run the scene now, there ought to be no rendering oddities!

<div class="embed-responsive embed-responsive-16by9">
<video loop autoplay class="lazyload embed-responsive-item">
    <source src="/img/tut4/part3-correct-clip.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
</div>

<hr/>

# Conclusion

Rendering portals properly comes with tons of edge cases you might not have thought of. In order to clip the correct details, we must  make use of an **oblique projection matrix**, which involves modifying the near clip plane so that it intersects the portal plane. It goes to show how much work just 5 lines or so of code can accomplish!

In the next tutorial, we'll deal with **travelling through portals**. How do we warp an object across portals while faithfully **conserving momentum**?

<hr/>

# Acknowledgements

### Assets

This tutorial series uses the following asset packs from various sources:

["Skybox Volume 2 (Nebula)"](https://assetstore.unity.com/packages/2d/textures-materials/sky/skybox-volume-2-nebula-3392) | [**Hedgehog Team**](https://assetstore.unity.com/publishers/1351)
["Robot Sphere"](https://assetstore.unity.com/packages/3d/characters/robots/robot-sphere-136226) | [**Razgrizzz Demon**](https://assetstore.unity.com/publishers/27109)
["Low Poly Hand Painted Dungeon Arch"](https://sketchfab.com/3d-models/low-poly-hand-painted-dungeon-arch-0040f94c8efd43639d8010874e4fefb6) | **BitGem**

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early!

Special thanks to my Patreon backers:

- Gemma Louise Ilett ($20)
- Jack Dixon ($5)
- Christopher Pereira ($1)

And a shout-out to my top Ko-fi supporters:

- Hung Hoang

<hr/>
