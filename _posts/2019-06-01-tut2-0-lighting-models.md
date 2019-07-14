---
layout: post
title: Cel Shading | Part 0 - Lighting Models
subtitle: Exploring a range of lighting models
bigimg: /img/tut2/part0-banner.png
gh-repo: daniel-ilett/cel-shading
gh-badge: [star, fork, follow]
tags: [shaders, unity, lighting, cel-shading, primer]
nice-slug: Lighting Models
date: 2019-06-01
idnum: 12
---

There are several lighting models used in 3D graphics. With the advent of realtime photorealistic rendering, we've seen more complex lighting than ever, and modern lighting systems mimic the way real light interacts with objects - this is called physically based rendering (PBR). Ray-tracing, Nvidia's favourite buzzword of the day, simulates light as particles travelling in straight lines, bouncing off objects - hence, "ray-tracing". Today, we're going to look at some of the more traditional lighting models from a theoretical perspective; we'll build on and implement them throughout the series. We'll also look at a few new shader features we'll use throughout the series.

# Phong Shading

Before Phong shading, we had Gouraud shading - lighting calculations were made only on the vertices of a model and interpolated across the face; the resultant lighting looked blocky unless a high-vertex-count model is used. And before Gouraud shading, we had flat shading, where lighting was calculated per-face - it looked very blocky! Phong shading uses the same lighting calculations as Gouraud shading but calculates lighting per-pixel, making it a lot more computationally expensive and realistic than its predecessors. You could consider these early lighting models to be the birthplace of photorealistic computer graphics rendering. Let's look at what goes into the Phong lighting model.

Here is a diagram of the vectors associated with Phong lighting calculations - we'll explore each one in more detail.

![Lighting vectors](/img/tut2/part0-lighting-model.png){: .center-image }

## Ambient Light

If you close your curtains in the daytime, close your door and turn off any lights, your bedroom will still be slightly lit. Just a tiny bit of light will "leak" through the gaps in the curtains and beneath your door and seemingly fill the room with a tiny bit of light. This is because light bounces all over your room, illuminating objects with a "base" level of light. Even in a bright outdoor scene, shadowed areas will still be highly illuminated due to light reflecting off other objects onto the shadowed area. This "base" level of light is called `ambient light` - the indirect lighting that falls on all scene objects. Techniques like ray-tracing can simulate ambient light perfectly, but for Phong shading it's good enough to apply a small amount of light to all objects to act as a "base". All other lighting is added on top of the ambient light and choosing a colour value for ambient light is down to personal preference and the mood you're going for in a scene.

So far, our total lighting calculation looks like this:

$$
L_{total} = L_{ambient}
$$

## Diffuse Light

If you imagine a surface that is perfectly matte, not shiny, then this is what `diffuse light` looks like: the amount of light is dependent only on the angle between the surface and the light rays. A light source could be a lamp or the Sun, and throughout the series we'll consider a singular Unity directional light which mimics the Sun. Lighting is additive, so if you had a scene with multiple lights shining directly on a surface, you'd add up the lighting contributions of all those lights. In fact, the light source doesn't have to be direct; some ray-tracers use the same calculations as Phong shading, but the incoming light rays could be indirect light bounces from another object.

![Diffuse Light](/img/tut2/part1-diffuse-model.png){: .center-image }

In practice, to calculate the amount of light incident on an object's surface, we use the `dot product`. In linear algebra, the dot product of two `vectors` is proportional to the angle between them.

$$
a \cdot b = \vert\vert a \vert\vert . \vert\vert b \vert\vert . cos(\theta)
$$

We have the light ray, `l`, as one of these vectors, but which other vector do we pick? A surface has a `normal vector`, `n`, defined as a vector perpendicular to the surface (and, as convention dictates, pointing away from the object); this is the vector we choose.

$$
L_{diffuse} = n \cdot l
$$

Calculating the dot product between the light ray and the surface normal vector yields the diffuse lighting coefficient. This is multiplied by the light's colour to obtain the final diffuse colour applied to the surface. The difference, then, between Gouraud shading and Phone shading is that Gouraud shading calculates diffuse light at the vertices and interpolates the light across face pixels, whereas Phong shading interpolates the vertex normals across the face and calculates diffuse light at each and every pixel. That is why it's more expensive, but much higher quality.

Lighting is now based on the ambient light and the diffuse light.

$$
L_{total} = L_{ambient} + L_{diffuse}
$$

## Specular Light

Now think about shiny surfaces. Matte surfaces exist when there are micro-bumps and imperfections on the surface - it is not a perfectly smooth surface, so there is a large amount of light scattering in all directions. No matter what the angle between the viewer (a person's eyes or a camera) and the surface, there is a uniform amount of light reflecting directly from the light source, off the surface, and into the viewer. On a shiny surface, there is little to no scattering, so almost all the light incident on the surface is reflected in the same direction. When a viewer is positioned in that direction, they will see a bright highlight on the surface. This is `specular light`.

![Specular Light](/img/tut2/part2-specular-model.png){: .center-image }

We perform another dot product using a different pair of vectors. The first is the normal vector, as before. The second is called the `half-vector`, which is the mean average of the light ray direction and the view direction.

$$
\begin{align}
h &= \frac{v + l}{2} \\
L_{specular} &= n \cdot h
\end{align}
$$

This gives us the final component of Phong lighting: the specular lighting coefficient. As with diffuse lighting, this is multiplied by the light colour and added to the pixel's total lighting value. 

The final (simplified) Phong lighting calculation takes specular into account:

$$
L_{total} = L_{ambient} + L_{diffuse} + L_{specular}
$$

<hr/>

# Other Types of Lighting

We'll also look at other forms of lighting not usually included in the basic Phong lighting model. These kinds of light can still be calculated per-pixel in the same manner we've discussed.

## Fresnel/Rim Lighting

Imagine a dark scene in which the only light source is positioned behind an object and is obscured from view by that object. Rather than the object appearing completely dark, you'll often notice some lighting bleeding around the edges, creating an "outline" effect. This is called `rim lighting`, or simply back lighting, and is a stylistic effect used in photography to give objects a better sense of shape.

Rim lighting also manifests on surfaces such as a pool of water, when a viewer looks at the top of the water at an extreme angle. The same phenomenon appears - the shallower the angle, the brighter the surface appears. In our scenes, we can use rim lighting to make objects stand out against each other. Together with the other cel-shading effects we will implement, it'll help object outlines to look much bolder.

Fresnel lighting uses the dot product between the normal vector of the surface and the view vector - the lighting direction doesn't matter at all. We want the maximum amount of lighting when the view vector and normal vector are perpendicular to each other - when a pixel is on the outer edge of a surface - so we subtract that dot product from one.

$$
L_{fresnel} = 1 - v \cdot n
$$

Now our total light looks like this:

$$
L_{total} = L_{ambient} + L_{diffuse} + L_{specular} + L_{fresnel}
$$

<hr/>

# Unity Surface Shaders

In this series, we're also going to be using a new kind of shader built into Unity. `Surface shaders` give us the flexibility to write lighting-aware code once and let Unity automatically compile it such that it is compatible with multiple rendering paths. Unity provides some functionality for us, such as supplying the vectors and light parameters we need through some predefined include files. We'll go into a bit more detail throughout the series, but if you'd like to take a look at surface shaders ahead of the series, there's [plenty of material](https://docs.unity3d.com/Manual/SL-SurfaceShaders.html) to get you started.

<hr/>

# Conclusion

You should have a solid understanding of the terms we'll be using throughout the rest of the series. Next article will kick off with a simple diffuse lighting shader; we'll be building two variants of the shader, one using conventional vertex and fragment shaders, and the other using Unity's special surface shaders.

<hr/>
