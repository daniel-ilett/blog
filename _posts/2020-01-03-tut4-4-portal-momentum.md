---
layout: post
title: Portals | Part 4 - Portal Momentum
subtitle: Hole in the wall!
bigimg: /img/tut4/part4-pbody-portal.jpg
hdrimg: /img/tut4/part4-banner.jpg
gh-repo: daniel-ilett/shaders-portal
gh-badge: [star, fork, follow]
tags: [unity, shaders, portals, physics, momentum]
nice-slug: Portal Momentum
date: 2020-01-03
idnum: 34

part-label: 4
series-name: Portals
---

What happens when an object travels through a portal? There are tons of videos and articles online discussing the conservation of momentum when portals are in operation. Some common thought experiments include "what happens if a portal moves into another portal" or "what happens when a portal crushes an object", but it's simpler to restrict things to non-moving portals - as games often do. It's easier to design around a smaller possibility space so there's fewer cases to program. Thus, the portals in our universe can't move, and the only momentum we must consider is that of the object travelling through the portal.

Check out my recreation of the portal effect in URP over on YouTube too!

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/PkGjYig8avo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
</div>

# Breaking the Law

Let's talk basic physics. The **momentum** of an object is the product of its mass and velocity and in a closed system, the law of conservation of momentum stipulates that the total momentum stays constant. If a 5kg mass lurches to the left at a velocity of 2 meters per second, a mass of 10kg should lurch to the right at a speed of one meter per second to compensate. Now think of an object entering a portal travelling to the right and exiting a portal facing upwards - in order to conserve momentum, the portals (or anything else in the system) should also move to the left and downwards respectively. But the portals are supposedly stationary, so perhaps they have a near-infinite mass and move a negligible distance. That'd probably create a black hole and destroy the entire game.

But we're getting ahead of ourselves. Games are about suspending the player's disbelief. It's fun to think about how portals in *Portal* would actually work, but as game designers we can just say "thing goes in, thing comes out" and leave the thinking to the players. Our portals are made of hand-wave-ium and objects conserve their **local momentum** upon portal entry.

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

## Local momentum

When I say "local momentum", I mean that a box travelling at 5 meters per second to the right into a portal will have a velocity of 5 meters per second travelling out of the portal - but the direction might be up, or down, or left. We'll use similar code for transforming the position and velocity direction of the object as we did for transforming the position of the portal rendering cameras. Open the *Scripts/PortalableObject.cs* file and scroll down to the `Warp` method. It assumes that references to the `inPortal` and `outPortal` have already been assigned and that we have access to the attached `Rigidbody` component. Since we perform a 180-degree rotation in multiple methods in this class, it's stored in a `static readonly` member variable named `halfTurn`.

~~~csharp
// Member variables.
private Portal inPortal;
private Portal outPortal;

private new Rigidbody rigidbody;

private static Quaternion halfTurn = Quaternion.Euler(0.0f, 180.0f, 0.0f);

// Warp method.
public virtual void Warp()
{
    var inTransform = inPortal.transform;
    var outTransform = outPortal.transform;

    // Update position of object.
    Vector3 relativePos = inTransform.InverseTransformPoint(transform.position);
    relativePos = halfTurn * relativePos;
    transform.position = outTransform.TransformPoint(relativePos);

    // Update rotation of object.
    Quaternion relativeRot = Quaternion.Inverse(inTransform.rotation) * transform.rotation;
    relativeRot = halfTurn * relativeRot;
    transform.rotation = outTransform.rotation * relativeRot;

    // Update velocity of rigidbody.
    Vector3 relativeVel = inTransform.InverseTransformDirection(rigidbody.velocity);
    relativeVel = halfTurn * relativeVel;
    rigidbody.velocity = outTransform.TransformDirection(relativeVel);
}
~~~

You might notice that the method is `virtual` - that's because `PlayerController` will **inherit** `PortalableObject` and we'll need to consider an edge case related to it later. Otherwise, these chunks of code will look familiar by now if you've read the previous parts of this tutorial series - the position, rotation and velocity of the object will be transformed from the `inPortal`'s local space to the `outPortal`'s local space.

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

## Considering collisions

Now, let's talk about how to detect when an object travels through the portal. In particular, let's consider **collision**. After all, the portal rests on a wall surface with collision enabled, so surely we need to cut a hole in the wall so that objects can travel through? A system that cuts a hole in the collision mesh of the wall at runtime would be the most "realistic" way of doing this, but it's complicated and might be slow if your level geometry contains many triangles. Instead, when an object is inside (or almost inside) the portal, we can disable the collision between the object and the wall.

Both portals have a thin box **trigger collider** that covers its surface. On the `Portal` script (*Scripts/Portal.cs*), we'll keep track of object that enter and exit the collider using the `OnTriggerEnter` and `OnTriggerExit` methods.

~~~csharp
// Member variables.
private List<PortalableObject> portalObjects = new List<PortalableObject>();

private void OnTriggerEnter(Collider other)
{
    var obj = other.GetComponent<PortalableObject>();
    if (obj != null)
    {
        portalObjects.Add(obj);
        obj.SetIsInPortal(this, otherPortal, wallCollider);
    }
}

private void OnTriggerExit(Collider other)
{
    var obj = other.GetComponent<PortalableObject>();

    if(portalObjects.Contains(obj))
    {
        portalObjects.Remove(obj);
        obj.ExitPortal(wallCollider);
    }
}
~~~

We're keeping track of the objects in a list because we'll need to check inside `Update` whether they've crossed through the portal. We do this by using `InverseTransformPoint` on the position of each object. If the object is behind the portal - if the z-component of the inverted position is greater than zero - then we'll call `Warp` on the object.

~~~csharp
private void Update()
{
    for (int i = 0; i < portalObjects.Count; ++i)
    {
        Vector3 objPos = transform.InverseTransformPoint(portalObjects[i].transform.position);

        if (objPos.z > 0.0f)
        {
            portalObjects[i].Warp();
        }
    }
}
~~~

The `OnTriggerEnter` method notifies the `PortalableObject` which portal is the `inPortal` and which is the `outPortal` and identifies which wall collider should be ignored. On `PortalableObject`, we've written the `SetIsInPortal` method for this.

~~~csharp
public void SetIsInPortal(Portal inPortal, Portal outPortal, Collider wallCollider)
{
    this.inPortal = inPortal;
    this.outPortal = outPortal;

    Physics.IgnoreCollision(collider, wallCollider);

    cloneObject.SetActive(true);

    ++inPortalCount;
}
~~~

Here is where we set the `inPortal` and `outPortal`, which are used in the `Warp` function. The `Physics.IgnoreCollision` method tells the physics engine to disregard collisions between any two colliders in the scene - here, we'll disable collision between the object and the wall the portal is on. This will allow the object to travel through the portal! We'll come back to `cloneObject` in a little while, and we're using `inPortalCount` to keep track of how many portals we're near. Instead of using a `bool`, counting is a failsafe in case we're ever nearby two portals at the same time so that we don't assume we exit all portals the moment `OnTriggerExit` is called between this object and only one portal. We'll only call code for exiting portals when `inPortalCount` reaches zero.

We'll also need to re-enable collision when the object exits the portal's proximity trigger. In the `ExitPortal` method, which takes only the `wallCollider` as a parameter, we'll use `Physics.IgnoreCollision` between `wallCollider` and the object's collider along with the `false` flag, meaning collision will *not* be ignored any longer.

~~~csharp
public void ExitPortal(Collider wallCollider)
{
    Physics.IgnoreCollision(collider, wallCollider, false);
    --inPortalCount;

    if (inPortalCount == 0)
    {
        cloneObject.SetActive(false);
    }
}
~~~

Now objects will be able to travel between two portals. Let's see it in action.

<div class="embed-responsive embed-responsive-16by9">
<video loop autoplay controls class="lazyload embed-responsive-item">
    <source src="/img/tut4/part4-portal-objects-no-clone.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
</div>

If you have a keen eye, then you'll notice a small problem: the object seems to get "cut off" while it's travelling through the portal. The following screenshot illustrates what I mean:

<img data-src="/img/tut4/part4-no-clone.jpg" class="center-image lazyload" alt="Object clipping">

The sphere physically exists on the right-hand side, falling downwards into the portal. That means the lower half has clipped through the portal surface and *should* be visible in the left-hand portal, but because of the way we're rendering the portal surface it's been clipped out of existence. Likewise, we can't see the lower half of the sphere in the right-hand portal because no physical version of it exists on the left, which is where the portal view is being rendered. We're going to need to create a 'cloned' version of the object on the opposite side of the portal.

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

## Object cloning

Let's talk about the `cloneObject` we skipped over, contained in the `PortalableObject` class. It's a **visual clone** of the object - a distinct `GameObject` with the same mesh and materials, but no other physical properties like rigidbodies or colliders, and no other scripts. It's created in `Awake` and immediately deactivated:

~~~csharp
protected virtual void Awake()
{
    cloneObject = new GameObject();
    cloneObject.SetActive(false);
    var meshFilter = cloneObject.AddComponent<MeshFilter>();
    var meshRenderer = cloneObject.AddComponent<MeshRenderer>();

    meshFilter.mesh = GetComponent<MeshFilter>().mesh;
    meshRenderer.materials = GetComponent<MeshRenderer>().materials;

    rigidbody = GetComponent<Rigidbody>();
    collider = GetComponent<Collider>();
}
~~~

As with the `Warp` method, `Awake` is `virtual` because `PlayerController` needs to deal with extra functionality. Before caching the Rigidbody and Collider components we've used elsewhere in this script, we create a brand new `GameObject` - `cloneObject` - and attach new `MeshFilter` and `MeshRenderer` components. Alongside `Transform`, these will be the only components on the clone. We then copy the primary object's mesh and set of renderer materials to the clone. In `SetIsInPortal` and `ExitPortal`, we activated and deactivated `cloneObject` respectively. Since it's deactivated off the bat in `Awake`, we'll only see the clone when the original object is near the portal.

In order to position the clone correctly, we'll update its position in `LateUpdate` rather than `Update` so that we can be sure the primary object is in its final position for this frame (checking whether the object should warp happens in `Update` in the `Portal` class). We only want to display a clone if both portals exist in the scene, so we'll start off with a check.

~~~csharp
private void LateUpdate()
{
    if(inPortal == null || outPortal == null)
    {
        return;
    }

    if(cloneObject.activeSelf && inPortal.IsPlaced() && outPortal.IsPlaced())
    {
        ...
    }
    else
    {
        cloneObject.transform.position = new Vector3(-1000.0f, 1000.0f, -1000.0f);
    }
}
~~~

If either portal has not been placed (we'll cover this in the next tutorial), or if the object isn't near or intersecting the portal, then we won't attempt to position the clone. We'll just stick it at a faraway location. Once we've made sure we're inside the portal and the clone is enabled (`cloneObject.activeSelf`) and that both portals have been placed in the scene, we'll position the clone relative to the other portal.

~~~csharp
if(cloneObject.activeSelf && inPortal.IsPlaced() && outPortal.IsPlaced())
{
    var inTransform = inPortal.transform;
    var outTransform = outPortal.transform;

    // Update position of clone.
    Vector3 relativePos = inTransform.InverseTransformPoint(transform.position);
    relativePos = halfTurn * relativePos;
    cloneObject.transform.position = outTransform.TransformPoint(relativePos);

    // Update rotation of clone.
    Quaternion relativeRot = Quaternion.Inverse(inTransform.rotation) * transform.rotation;
    relativeRot = halfTurn * relativeRot;
    cloneObject.transform.rotation = outTransform.rotation * relativeRot;
}
~~~

This positioning code is starting to look very familiar - it's essentially the same as the code we wrote in `Warp` earlier! Now, when we run the scene, we ought to see a complete sphere popping out of both portals.

<img data-src="/img/tut4/part4-clone-obj.jpg" class="center-image lazyload" alt="Cloned object">

Note that there are some graphical oddities across the portal boundary. That's to do with the lighting being different on each portal surface. If you're going to use these portals, it might be a good idea not to rely on just a single directional light for your scene and to find an alternative lighting method that faithfully lights up objects on both sides of the portal.

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

## The Player

The player is a special case. For most objects, its rotation exiting the portal is the transformed entrance rotation - an external observer will see a seamless entrance into the portal. However, a player is fundamentally different because their view always needs to be oriented such that down faces the same way as gravity. If two portals are placed on the floor - as they are here - then an unmodified version of the code will leave the player facing upside down when travelling through the portal. We need to recalculate the rotation of the player so that its local 'up-direction' and the world-space up-direction are the same.

The `PlayerController` class inherits from `PortalableObject`, but it's very short. It adds small amounts of functionality to the `Awake` and `Warp` methods so that the `CameraMove` component is told to reorient itself.

~~~csharp
public class PlayerController : PortalableObject
{
    private CameraMove cameraMove;

    protected override void Awake()
    {
        base.Awake();

        cameraMove = GetComponent<CameraMove>();
    }

    public override void Warp()
    {
        base.Warp();
        cameraMove.ResetTargetRotation();
    }
}
~~~

By calling `base.Awake` and `base.Warp`, the original functionality of both methods from `PortalableObject` is preserved. Let's now look at the `ResetTargetRotation` method on `CameraMove`, found at *Scripts/CameraMove.cs*.

~~~csharp
public void ResetTargetRotation()
{
    targetRotation = Quaternion.LookRotation(transform.forward, Vector3.up);
}
~~~

The `Quaternion.LookRotation` method builds a new rotation, where the first parameter becomes the **forward-direction** of the rotation. The **right-direction** of the rotation is the **cross-product** of the two parameters - that is, a new vector perpendicular to both vectors - and the up-direction of the new rotation is not `Vector3.up` in this example, as you might expect, but the cross-product of the forward-direction and right-direction we just calculated. The result is a new rotation that *kind of* points in the same direction as before, but oriented with a new up-direction.

In the `Update` method, the actual rotation is spherically interpolated toward the `targetRotation` we just calculated using the `Quaternion.Slerp` method (for more on interpolation, see my [*Unity Tips* article on **Interpolation**](https://danielilett.com/2019-09-08-unity-tips-3-interpolation/)). The rotation delta is based on the mouse movement and the rotation around the x-axis - the 'vertical' camera movement - is clamped. There's other code regarding movement that we don't need to worry about.

~~~csharp
private void Update()
{
    // Rotate the camera.
    var rotation = new Vector2(-Input.GetAxis("Mouse Y"), Input.GetAxis("Mouse X"));
    var targetEuler = targetRotation.eulerAngles + (Vector3)rotation * cameraSpeed;
    if(targetEuler.x > 180.0f)
    {
        targetEuler.x -= 360.0f;
    }
    targetEuler.x = Mathf.Clamp(targetEuler.x, -75.0f, 75.0f);
    targetRotation = Quaternion.Euler(targetEuler);

    transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, 
        Time.deltaTime * 15.0f);
        
    ...
}
~~~

Now let's see what the world looks like from a player's perspective. Note that the portals are in the same positions as the other examples so far.

<div class="embed-responsive embed-responsive-16by9">
<video loop autoplay controls class="lazyload embed-responsive-item">
    <source src="/img/tut4/part4-player-orientation.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
</div>

## Large objects

The other issue to deal with is large objects. If we disable collision between the wall and a large object, won't it clip through the wall partially while travelling through the portal? That's possible - and to counteract this, the portal also contains a non-trigger collider frame around itself which blocks objects that are detected by the portal trigger but are too large to fit through the portal. Here's what the mesh for the collider looks like in *Blender*:

<img data-src="/img/tut4/part4-portal-frame.jpg" class="center-image lazyload" alt="Portal frame">

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

# Conclusion

We can handle the velocity of objects exiting a portal in several ways, but it's easiest to disregard real-world physics behaviour and pick the one that results in the best gameplay. It's also good enough to use a simple solution to collisions rather than trying to engineer a solution that modifies the wall collider in realtime. The player controller is a special case, given a player's expectations of how their in-game character will behave. And we need to deal with the edge case when objects are clipping through the portal by adding a visual clone on the other side of the portal.

In the next tutorial, we'll deal with placing portals of our own, including raycasting and portal orientation.

<div class="embed-responsive embed-responsive-16by9">
<video loop autoplay controls class="lazyload embed-responsive-item">
    <source src="/img/tut4/part4-portal-objects.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
</div>

# Acknowledgements

## Assets

This tutorial series uses the following asset packs from various sources:

["Skybox Volume 2 (Nebula)"](https://assetstore.unity.com/packages/2d/textures-materials/sky/skybox-volume-2-nebula-3392) | [**Hedgehog Team**](https://assetstore.unity.com/publishers/1351)
["Robot Sphere"](https://assetstore.unity.com/packages/3d/characters/robots/robot-sphere-136226) | [**Razgrizzz Demon**](https://assetstore.unity.com/publishers/27109)
["Low Poly Hand Painted Dungeon Arch"](https://sketchfab.com/3d-models/low-poly-hand-painted-dungeon-arch-0040f94c8efd43639d8010874e4fefb6) | **BitGem**

## Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early!

Special thanks to my Patreon backers:

- Gemma Louise Ilett
- Jack Dixon
- Christopher Pereira

And a shout-out to my top Ko-fi supporters:

- Hung Hoang

<hr/>
