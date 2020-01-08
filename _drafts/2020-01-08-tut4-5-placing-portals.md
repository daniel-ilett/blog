---
layout: post
title: Portals | Part 5 - Placing Portals
subtitle:
bigimg: /img/tut4/part5-banner.jpg
hdrimg: /img/tut4/part5-banner.jpg
gh-repo: daniel-ilett/shaders-portal
gh-badge: [star, fork, follow]
tags: [unity, shaders, portals, physics, raycast]
nice-slug: Portal Momentum
date: 2020-01-08
idnum: 35

part-label: 5
series-name: Portals
---

Placing portals and ensuring they're positioned correctly is more involved than you may expect. The basic idea is to point in a direction and press shoot to move a portal to that point on the wall. But there are many questions to ask: what types of object can block the portal shot? What if that position would hang over the edge of a surface or intersect another wall? And how do we make sure the portal has the correct rotation?

# Proper placement

To start off with, let's handle the initial positioning. We'll **raycast** in the direction the player is facing until we hit a wall (and do nothing if we're looking into thin air). At the point the wall is hit, we'll place the portal and make sure it is rotated correctly. Already, there's a lot of fiddly maths to deal with, so let's jump right in.

Open up the `PortalPlacement` class, found at *Scripts/PortalPlacement.cs*. This will get attached to the player object and is responsible for shooting portals. The `Portal` class - found at *Scripts/Portal.cs* - will deal with corrective repositioning. Let's jump into `PortalPlacement`.

~~~csharp
[RequireComponent(typeof(CameraMove))]
public class PortalPlacement : MonoBehaviour
{
    [SerializeField]
    private PortalPair portals;

    [SerializeField]
    private LayerMask layerMask;

    [SerializeField]
    private Crosshair crosshair;

    private CameraMove cameraMove;

    private void Awake()
    {
        cameraMove = GetComponent<CameraMove>();
    }

    ...

}
~~~

This class needs access to each of the two portal objects so it can communicate when the player presses the left or right mouse button to place a portal. We're requesting the `PortalPair` object (storing it in the `portals` variable), which contains references to thw two individual portals. We'll need a `LayerMask` (aptly named `layerMask`) to tell the physics engine which layers we want to be considered or ignored during the raycast. We'll also reference a new `Crosshair` object, which is a UI element placed in the scene so a) we can see where the centre of the screen is, and b) we can see which of the two portals are active. Finally, we'll reference the `CameraMove` object attached to the player so that we use the player's `targetRotation` instead of its current rotation when shooting portals - that will cover the edge case in which a player exits a portal and shoots another one while their rotation is being reoriented. We don't want portals to be placed strangely because of that.

~~~csharp
private void Update()
{
    if(Input.GetButtonDown("Fire1"))
    {
        FirePortal(0, transform.position, transform.forward);
    }
    else if (Input.GetButtonDown("Fire2"))
    {
        FirePortal(1, transform.position, transform.forward);
    }
}
~~~

Firing the initial portal is easy. We'll poll the `Fire1` and `Fire2` buttons for the first and second portals respectively, and call `FirePortal` if either is pressed. The ID of the portal is passed to the function along with the firing position and direction. Let's write FirePortal piece by piece.

~~~csharp
private void FirePortal(int portalID, Vector3 pos, Vector3 dir)
{
    RaycastHit hit;
    Physics.Raycast(pos, dir, out hit, 250.0f, layerMask);

    if(hit.collider != null)
    {
        ...
    }
}
~~~

**Raycasting** is the process of shooting a **virtual "ray"** and detecting if a `Collider` was hit by the ray. There are several kind of casts we may use, but `Physics.Raycast` and `Physics.Linecast` are the most basic types and raycasting is the one that makes most sense here. We're casting from the player camera's position in the direction they're facing. We need to retrieve data about any colliders detected by the cast, so we also pass in a `RaycastHit` struct using the `out` keyword, which means the function will output (not `return`) a `RaycastHit` and store it in the `hit` variable. We'll specify a maximum raycast length of 250, and use layerMask to restrict the types of objects detected by the raycast. 

Stepping outside of the code for a second and looking at the `PortalPlacement` component on the player camera, we'll see that the layer mask selects only the *LevelGeom* and *Portal* layers; the level's static geometry - anything we want a portal to attach to - is set to the *LevelGeom* layer, and the two portals (only their surface and not the graohical outline or border colliders from last tutorial) are labelled *Portal*. This means that we can stick most other objects in the Default layer and the portal will pass straight through them. If you wish to implement objects that can block portal shots, you can enable a separate layer on this mask and add some code to immediately `return` from the `FirePortal` method when an object in that layer is hit.

Let's return to the code. We'll skip the if-statement which checks for objects tagged "Portal" until later as this code relates to shooting portals through portals. After that, the next bunch of code handles the positioning and rotation of the new portal.

We'll handle portal rotation a little differently than you might expect. Because we can place portals on a wall, floor or ceiling, we need to be careful with how we calculate the portal's rotation. If we were only able to place portals on vertical walls, we could just make the up-direction the same as the world up-direction - but that wouldn't work on floors and ceilings. We also want to orient the portal along the cardinal grid directions. That means we'll need to 'round' the rotation along certain axes to the nearest 90 degrees.

Let's deal with the rounding first. In the end, we're going to construct the new rotation using `Quaternion.LookRotation`, which will require us to pass in the up-direction and forward-direction - but it's not easy to calculate the up-direction yet. Thankfully, we can calculate the right-direction, which is also the easiest to round to the nearest 90 degrees, then use the vector cross product using that right-direction and a known forward-direction to calculate the up-direction.

~~~csharp
var cameraRotation = cameraMove.TargetRotation;

var portalRight = cameraRotation * Vector3.right;

if(Mathf.Abs(portalRight.x) >= Mathf.Abs(portalRight.z))
{
    portalRight = (portalRight.x >= 0) ? Vector3.right : -Vector3.right;
}
else
{
    portalRight = (portalRight.z >= 0) ? Vector3.forward : -Vector3.forward;
}

var portalForward = -hit.normal;
var portalUp = -Vector3.Cross(portalRight, portalForward);

var portalRotation = Quaternion.LookRotation(portalForward, portalUp);
~~~

We'll retrieve the camera's `TargetRotation` as mentioned so that we're calculating the proper desired rotation. We can get the player's right-direction by multiplying `Vector3.right` by the camera's rotation. It's fairly simple to round that vector to the nearest 90 degrees by comparing its x- and z-components with each other to determine which of four possible quadrants the vector is pointing in, then setting the vector to be equal to one of the four cardinal directions

Only the vector representing the portal's new right-direction will need rounding, as we'll calculate the up-direction and forward-direction using this.

## Fixing overhangs

## Fixing intersections

# Shooting through portals

# Limitations

Since we only used raycasts to check for intersections and overhangs, we're hampered by 

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
- Shaun Wall
- Christopher Pereira
- JacksonG
- Pat

And a shout-out to my top Ko-fi supporters:

- Hung Hoang

<hr/>
