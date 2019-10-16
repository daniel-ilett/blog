---
layout: post
title: Ultra Effects | Part 1 - Something Fishy
subtitle: Emulating wide-angle lenses using UVs
bigimg: /img/tut3/part1-banner.png
gh-repo: daniel-ilett/image-ultra
gh-badge: [star, fork, follow]
tags: [unity, shaders, image-effects, ultra-effects, fish-eye, lens, uvs]
nice-slug: Something Fishy
date: 2019-10-16
idnum: 23
---

Fisheye lenses gained popularity throughout the 1900s for their ability to capture ultrawide-angle views using a spherical papping, rather than conventional imaging which captures images with a straight-line perspective. The name comes from how American physicist Robert W. Wood imagined a fish would view the world underwater. Images created using a fisheye lens are characterised by objects in the centre appearing 'closer' than they otherwise would. Nowadays, we use fisheye lenses for a range of applications, from artistic choices in entertainment media to computer graphics, where we can use two 180-degree virtual lenses to create environment maps. Today, we combine both of those use cases and look at a cheap way to convert arbitrary images into fisheye-style images: using computer graphics to achieve an artistic style.

<!-- Image of fisheye photo here -->

<hr/>

# Virtual lenses

Conventional virtual cameras capture rectilinear images - features such as walls appear straight. In theory, you could use an alternative projection matrix to achieve a fisheye effect, but we won't be changing the way the camera renders the original image - instead, we'll create a postprocessing effect that mimics the distortion effect introduced by fisheye lenses. In order to do this, all we need is a bit of maths to jig around our UVs a little.

For those that haven't come across UVs before, they are a type of coordinate system that allow us to map 2D textures (images) to 3D objects. In our case, our "3D object" is the screen, which we can consider to be a 2D object for simplicity. The UV coordinates, then, map a 2D texture to a 2D screen. That 2D texture will be the result of rendering the scene, right before our fisheye shader is put into action. Before we look at how such a shader would work, let's talk about the shader system I've developed for this series.

<hr/>

# Shader system

In the last series, I provided two shader files for each shader: one complete, and one with gaps for people to fill in. There were a handful of scripts to facilitate special features on some of the shaders, such as Gaussian blur. This time, I've simplified things - the GitHub repository will only include complete versions of the shaders.

For each shader, I'll provide a corresponding script that includes Inspector-accessible variables for each of the special features of the shader. Those scripts use ScriptableObject as a base class, so you can create assets directly inside the Editor - this will allow you to create multiple instances of Then, you can create a material that uses the shader and

# Conclusion

<hr/>

# Acknowledgements

I'd like to thank my Patreon supporters for making this content possible. [Become a Patron](https://www.patreon.com/danielilett) for $1+ to receive PDF versions of all articles, or $5+ to get certain articles early!

This tutorial series uses the following asset packs - available on the Unity Asset Store:

[Forest - Low Poly Toon Battle Arena / Tower Defense Pack](https://assetstore.unity.com/packages/3d/environments/forest-low-poly-toon-battle-arena-tower-defense-pack-100080) | [**AurynSky**](https://assetstore.unity.com/publishers/17283)

## $20 Backers

Special thanks to my $20 backers:

- Gemma Louise Ilett

<hr/>
