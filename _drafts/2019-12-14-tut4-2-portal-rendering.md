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

![Manifold Portal](/img/tut4/part1-manifold-portals.jpg){: .center-image }

<hr/>

# Portal Surfaces

There's several technologies we can use to create a portal effect, but they all include using a camera to capture what the world looks like from behind a portal's exit, then pasting the image over the portal's entrance. The first part of this article is going to be about positioning the camera properly in order to take that photo, and then in the second half we'll figure out how to use the rendered image to display something on the portal's surface.

<hr/>

# Camera Positioning

There are a lot of moving parts (literally) when it comes to positioning the cameras correctly. But the general idea goes like this: place a **virtual camera** behind the "out-portal" with the same offset and rotation as that of the player in front of the "in-portal". Let's explore the method in more detail.

The player will be looking in an arbitrary direction, from an arbitrary position, and we'll have two portal surfaces in the scene. We need each portal's surface to look like the world as seen from the other portal's surface. So, for each portal - the one being considered is the "in-portal" - we'll retrieve the rotation of the player and their offset from the in-portal, then convert both of them from *world space* to the in-portal's *local space*. The position and rotation are now relative to the in-portal. The diagram below abstracts this idea to 2D.

![Space Conversion](/img/tut4/part2-local-space.jpg){: .center-image }

Take that relative offset and imagine it is now relative to the other portal - the "out-portal". We want to reflect this offset in the out-portal's surface plane so that it is behind the portal. Then, we'll do the same with the relative rotation: rather than pointing towards the area behind the portal, rotate it such that it points to the world outside the portal. Now, convert the position and rotation from the out-portal's local space to world space and place a secondary camera in the scene with the new position and rotation. The end result will be the one seen in the diagram below:

![Desired position](/img/tut4/part2-desired-position.jpg){: .center-image }

That's the method for positioning the camera. Now let's look at some real code. Much of the code pertains to later tutorials, so for now I shall skip over those sections. For now, open up the BasicPortals.unity scene. The scene contains some basic level geometry, a lovely animated robot asset from the Unity Asset Store, our two portal surfaces and a camera object called *BasicPortalCamera* containing the player camera and the two virtual cameras. Observe that the two portals are 

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
