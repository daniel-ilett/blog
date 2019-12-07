---
layout: post
title: Portals | Part 2 - Stencil-based Portals
subtitle: Impossible geometry via portals
bigimg: /img/tut4/part2-banner.jpg
gh-repo: daniel-ilett/shaders-portal
gh-badge: [star, fork, follow]
tags: [unity, shaders, portals, physics, manifold-garden, stencil]
nice-slug: Stencil-based Portals
date: 2019-12-14
idnum: 32
---

I recently played *Manifold Garden*, a game based on Escher-esque architecture. It's full of mind-blowing sequences, and one of my favourite technical elements was the game's portals, which are used heavily to explore the concept of impossible space. You walk into a small room, and there's a vast world inside! Today, we'll recreate this kind of portal.

![Manifold Portal](/img/tut4/part2-manifold-portals.jpg){: .center-image }

*Screenshot from [Manifold Garden](https://manifold.garden/)*

<hr/>

# Portal Surfaces

There's several technologies we can use to create a portal effect, but they all include using a camera to capture what the world looks like from behind a portal's exit, then pasting the image over the portal's entrance. The first part of this article is going to be about positioning the camera properly in order to take that photo, and then in the second half we'll figure out how to use the rendered image to display something on the portal's surface. We'll only be talking about the basic visuals today - the mechanics of travelling through the portal and other effects will be described in later tutorials.

<hr/>

# Camera Positioning

There are a lot of moving parts (literally!) when it comes to positioning the cameras correctly. But the general idea goes like this: place a **virtual camera** behind the "out-portal" with the same offset and rotation as that of the player in front of the "in-portal". Let's explore the method in more detail.

The player will be looking in an arbitrary direction, from an arbitrary position, and we'll have two portal surfaces in the scene. We need each portal's surface to look like the world as seen from the other portal. So, for each portal - let's call the one being considered the "in-portal" - we'll retrieve the rotation of the player and their offset from the in-portal, then convert both of them from *world space* to the in-portal's *local space*. The position and rotation are now relative to the in-portal; the diagram below abstracts this idea to 2D.

![Space Conversion](/img/tut4/part2-local-space.jpg){: .center-image }

Take that relative offset and imagine it is now relative to the other portal - the "out-portal". We want to reflect the positional offset in the out-portal's surface plane so that it is behind the portal. Then, we'll do the same with the relative rotation: rather than pointing towards the area behind the portal, rotate it 180 degrees such that it points to the world outside the portal. Now, convert the position and rotation from the out-portal's local space to world space and place a secondary camera in the scene with the new position and rotation. The end result will be the one seen in the diagram below:

![Desired position](/img/tut4/part2-desired-position.jpg){: .center-image }

That's the method for positioning the camera. Now let's look at some real code. Much of the code pertains to later tutorials, so for now I shall skip over those sections. For now, open up the *BasicPortals.unity* scene. The scene contains some basic level geometry, a lovely animated robot asset from the Unity Asset Store, our two portal surfaces, and a camera object called *BasicPortalCamera* containing the player camera and the virtual camera. Observe that the virtual camera is **inactive**. We're going to use it to capture the scene through the two portals at runtime.

The player camera has a script called *BasicPortalCamera.cs* attached to it - let's open that file (found at *Scripts/BasicPortal/BasicPortalCamera.cs*) and code up the positioning method we just discussed.

This script requires a few references first. It needs access to the two portals, the 'virtual' portal camera, and a material we'll use for drawing the portal surfaces later. We'll also cache the player camera component with the `mainCamera` variable and there's a couple of other member variables we'll talk about in the rendering section later.

~~~csharp
[SerializeField]
private Portal[] portals = new Portal[2];

[SerializeField]
private Camera portalCamera;

[SerializeField]
private Material portalMaterial;

private Camera mainCamera;
~~~

This script has a few methods. We'll skip over `Awake` and `Start` - the only thing relevant so far is setting the `mainCamera` reference inside `Awake`. There's the `OnRenderImage` method we'll talk about later, and the `RenderCamera` method we'll look at now. It takes in an `inPortal` and `outPortal` as parameters - the `inPortal` is the one we're rendering the view for.

~~~csharp
private void RenderCamera(Portal inPortal, Portal outPortal)
{
    ...
}
~~~

The first step was to calculate the player camera's position and rotation relative to the in-portal. For that, we can use the `InverseTransformPoint` function, which converts a **world-space position** to a **local-space position**. The reverse process to convert from local-space to world-space uses the `TransformPoint` function. We'll use the `InverseTransformXPoint` function to convert the player's world-space position to inPortal's local space, then convert the result (after rotating around the portal) from outPortal's local space to world space using `TransformPoint`.

Rotating the point is easy - we can build a rotation of 180 degrees around the local y-axis and multiply the relative point by that rotation. `Quaternion.Euler(0.0f, 180.0f, 0.0f)`

To deal with the rotations, we'll need to use the built-in functions of the `Quaternion` class. To obtain the relative rotation in `inPortal`'s local space, we'll multiply the player's rotation by the `inPortal`'s inverse rotation; the `Quaternion.Inverse` function does this. Then, we rotate 180 degrees around the local y-axis, just as we did for the position, before finally converting back to world space by multiplying by the `outPortal`'s rotation.

~~~csharp
Transform inTransform = inPortal.transform;
Transform outTransform = outPortal.transform;

// Position the camera behind the other portal.
Vector3 relativePos = inTransform.InverseTransformPoint(transform.position);
relativePos = Quaternion.Euler(0.0f, 180.0f, 0.0f) * relativePos;
portalCamera.transform.position = outTransform.TransformPoint(relativePos);

// Rotate the camera to look through the other portal.
Quaternion relativeRot = Quaternion.Inverse(inTransform.rotation) * transform.rotation;
relativeRot = Quaternion.Euler(0.0f, 180.0f, 0.0f) * relativeRot;
portalCamera.transform.rotation = outTransform.rotation * relativeRot;
~~~

Those transformations will put the camera in the correct position. Now, we'll deal with rendering.

# Portal Rendering

We're going to use the **stencil buffer** to render the portal surfaces - we've [discussed the stencil buffer in the past](https://danielilett.com/2019-06-15-tut2-4-edge-outline/) if you'd like to read more about them; they are used for storing special per-pixel **reference values** which allows us to implement impossible geometry inside shaders, amongst other things. A pair of shaders will use the stencil. We'll draw the portal surface mesh initially using a block-colour shader which also writes a reference value to the stencil buffer - a unique value for each portal surface. Then, a second shader will be used to write the images captured by the virtual camera to the screen as part of an image effect. That shader will read the stencil buffer to determine where to draw. Let's look at the shader we'll use for the portal surfaces, found at *Shaders/BasicPortal/PortalMask.shader*.

# Conclusion

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
