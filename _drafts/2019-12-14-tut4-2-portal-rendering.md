---
layout: post
title: Portals | Part 2 - Stencil-based Portals
subtitle: Headache-inducing geometry
bigimg: /img/tut4/part2-banner.jpg
hdrimg: /img/tut4/part2-banner.jpg
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

This script has a few methods. We'll look over `Awake` and `Start` later. There's also the `OnRenderImage` method we'll talk about later, and the `RenderCamera` method we'll look at now. It takes in an `inPortal` and `outPortal` as parameters - the `inPortal` is the one we're rendering the view for.

~~~csharp
private void RenderCamera(Portal inPortal, Portal outPortal)
{
    ...
}
~~~

The first step was to calculate the player camera's position and rotation relative to the in-portal. For that, we can use the `InverseTransformPoint` function, which converts a **world-space position** to a **local-space position**. The reverse process to convert from local-space to world-space uses the `TransformPoint` function. We'll use the `InverseTransformXPoint` function to convert the player's world-space position to inPortal's local space, then convert the result (after rotating around the portal) from outPortal's local space to world space using `TransformPoint`.

Rotating the point is easy - we can build a rotation of 180 degrees around the local y-axis and multiply the relative point by that rotation. `Quaternion.Euler(0.0f, 180.0f, 0.0f)` gives us a 180-degree rotation around the y-axis. Then, between the point transformation steps, we slot in the rotation. The result is that the `portalCamera` is placed at the correct position behind the `outPortal`.

To deal with the rotations, we'll need to use the built-in functions of the `Quaternion` class. To obtain the relative rotation in `inPortal`'s local space, we'll multiply the player's rotation by the `inPortal`'s inverse rotation; the `Quaternion.Inverse` function does this. Then, we rotate 180 degrees around the local y-axis, just as we did for the position, before finally converting back to world space by multiplying by the `outPortal`'s rotation. The result is that the `portalCamera` points out of the portal and into the world.

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

We're going to use the **stencil buffer** to render the portal surfaces - we've [discussed the stencil buffer in the past](https://danielilett.com/2019-06-15-tut2-4-edge-outline/) if you'd like to read more about them; they are used for storing special per-pixel **reference values** which allows us to implement impossible geometry inside shaders, amongst other things. A pair of shaders will use the stencil. We'll draw the portal surface mesh initially using a block-colour shader which also writes a reference value to the stencil buffer - a unique value for each portal surface. Then, a second shader will be used to write the images captured by the virtual camera to the screen as part of a **post-processing image effect**. That shader will read the stencil buffer and only draw pixels which have the appropriate stencil reference value. Let's look at the shader we'll use for the portal surfaces, found at *Shaders/BasicPortal/PortalMask.shader*. To start off, we'll name the shader `"Portals/PortalMask"` and define two properties: a base colour to fallback to whenever portal rendering is disabled, and an ID.

~~~glsl
Shader "Portals/PortalMask"
{
    Properties
    {
        _Colour("Base Colour", Color) = (1, 1, 1, 1)
        _MaskID("Mask ID", Int) = 1
    }
    SubShader
    {
        ...
    }
}
~~~

Inside the `SubShader`, we have the usual suspects - some `Tags`, and a `Pass` which includes a `CGPROGRAM...ENDCG` block. But the `Pass` contains the less-typical `Stencil` keyword, which is where we interact with the stencil buffer. Recall from previous discussions that the **stencil buffer** is the same size as the **framebuffer** (i.e. the image), and it contains a *value of zero* inside each pixel by default.

~~~glsl
Stencil
{
    Ref [_MaskID]
    Comp Always
    Pass replace
}
~~~

Inside the stencil, we provide a **reference value** using the `Ref` keyword. In our case, we'll want to use the `_MaskID` property as our reference value. The stencil uses a comparison function, `Comp`, to determine whether it should render a pixel by comparing the value already in the stencil buffer to the reference value. In our case, we're using the `Always` function, which means the pixel will be drawn regardless of the stencil value (and provided it passes a depth test too). In the event that the stencil test passes (which it will) and so does the depth test, the `Pass` function determines what happens to the stencil buffer value for this pixel after the shader pass has completed. It's possible to increment or decrement it, or write a value of zero, but we'll want to replace the existing value with the reference value. For that, we use the `Replace` function.

Let's look back at *BasicPortalCamera.cs*. We still need to add a final step to the `RenderCamera` method in order to instruct the `portalCamera` to render from the position we moved it to earlier. First, let's explain what `Awake` and `Start` do and introduce the remaining member variables that we skipped over earlier.

~~~csharp
private RenderTexture tempTexture;

private const int maskID1 = 1;
private const int maskID2 = 2;

private void Awake()
{
    mainCamera = GetComponent<Camera>();
    tempTexture = new RenderTexture(Screen.width, Screen.height, 24);

    portalCamera.targetTexture = tempTexture;
}

private void Start()
{
    portals[0].SetMaskID(maskID1);
    portals[1].SetMaskID(maskID2);
}
~~~

Remember that the `portalCamera` is inactive, so it will only render to its `targetTexture` when instructed to. In `Awake`, we need to set the `targetTexture` of the camera to something, so we create a render texture the same size of the screen, with a **24-bit depth buffer** (it's worth noting the depth and stencil buffers are the same buffer, but bit-depths of 16 or below store depth only, no stencil), and then assign that to the camera. The texture is stored in the `tempTexture` member variable.

The `Start` method assigns a stencil ID to each of the two portals. Theer's no need to go into lots of detail with the `Portal` script, found in *Scripts/Portal.cs*, but let's look at the `SetMaskID` method.

~~~csharp
public void SetMaskID(int id)
{
    material.SetInt("_MaskID", id);
}
~~~

This method sets the mask ID to use within the `PortalMask` shader. We'll tell the first portal to use a stencil reference value of 1, and the other to use a reference value of 2. That means the portals won't interfere with one another while rendering. We'll also add the final bits of code to the `RenderCamera` method in `BasicPortalCamera`. We're ignoring some of the code in the middle of the method, which we will explore in a future tutorial; the final part of the method tells the camera to render its current viewpoint to its `targetTexture`.

~~~csharp
// Render the camera to its render target.
portalCamera.Render();
~~~

Now let's handle the rendering strategy in OnRenderImage. This is a built-in Unity callback for postprocessing effects, so we're going to render the player's point of view, then if either of the portals is in the player's sight we'll render the portal view to a separate texture and paste a small section of the portal image over the base image. The bit that gets cut out depends on the stencil values.

~~~csharp
private void OnRenderImage(RenderTexture src, RenderTexture dst)
{
    if(portals[0].IsRendererVisible())
    {
        // Render the first portal output onto the image.
        RenderCamera(portals[0], portals[1]);
        portalMaterial.SetInt("_MaskID", maskID1);
        Graphics.Blit(tempTexture, src, portalMaterial);
    }

    if(portals[1].IsRendererVisible())
    {
        // Render the second portal output onto the image.
        RenderCamera(portals[1], portals[0]);
        portalMaterial.SetInt("_MaskID", maskID2);
        Graphics.Blit(tempTexture, src, portalMaterial);
    }

    // Output the combined texture.
    Graphics.Blit(src, dst);
}
~~~

Stepping through the method line-by-line, we're saying: if the player can see part or all of the first portal, then render that portal's viewpoint. Using a mask ID of 1, copy the portal texture to the main texture - but only where the portal can be seen on the main texture. Then, do the same thing for the second portal and a mask ID of 2. Finally, output the resulting main texture. The `IsRendererVisible` method is defined in the `Portal` script and looks like this:

~~~csharp
public bool IsRendererVisible()
{
    return renderer.isVisible;
}
~~~

That's everything! Now, if we play the scene, you'll be able to see the correct view through the portal.

<video loop autoplay class="lazyload">
    <source src="/img/tut4/part2-portal-complete.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>

# Limitations

There's a handful of limitations and edge cases in the code we've written so far. Some of them will be fixed in future articles, so I'll talk about the specific limitations of this portal that won't be removed. A minor inconvenience is that, since we're using the stencil buffer, this effect could interfere with other stencil-based effects. It's a pedantic issue, as you can change the stencil IDs used by the effect, but it's something to consider if you're using stencils for something else.

The main issue with this portal is that it's not recursive, meaning it can't render a portal seen inside a portal, inside a portal, and so on. It's feasible to use stencil rendering to achieve this, but it's a complex operation and not substantially more efficient than the alternative method we'll use in a future tutorial to write a recursive portal. That approach won't be a postprocessing effect.

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

- Gemma Louise Ilett
- Jack Dixon
- Christopher Pereira

And a shout-out to my top Ko-fi supporters:

- Hung Hoang

<hr/>
