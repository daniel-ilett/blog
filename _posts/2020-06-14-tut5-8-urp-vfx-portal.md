---
layout: post
title: Million Particle Portals in Visual Effect Graph
subtitle: All part of the bigger picture
bigimg: /img/tut5/part8-bigimg.jpg
hdrimg: /img/tut5/part8-banner.jpg
gh-repo: daniel-ilett/vfx-portal
gh-badge: [star, fork, follow]
tags: [unity, shaders, urp, vfx-graph, portals]
nice-slug: VFX Portals
date: 2020-06-14
idnum: 50

part-label: 8
series-name: URP
---

Back in Unity 3.5, an era that feels a lifetime away, a brand-new "Shuriken" particle system launched, replacing the legacy particle tools with a configurable and performant upgrade. That system has stuck around for about 8 years now, receiving incremental updates over that time; Shuriken is capable of rendering thousands of particles on-screen, but it's limited by running on the CPU. With **Visual Effect Graph**, the new way of creating particle systems which became production-ready in Unity 2019.3, those particles now run on the GPU with *millions* of particles on-screen at a time. Today, we're going to see if a million particles is a realistic goal for particles in your games.

UPDATE: This tutorial is also available on my YouTube!

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/abGzzDka9j0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
</div>

<hr/>

# Setup

For this tutorial, I'll be using **Universal Render Pipeline**, although this should also work on **High Definition Render Pipeline**. We'll need to download Visual Effect Graph using the Package Manager alongside one of the render pipelines, since VFX Graph is incompatible with the built-in renderer. Once it's finished downloading, we can crack on with the tutorial. We'll be creating a particle system for a portal which generates one million particles a second - if that's likely to melt your computer, then I'd recommend tweaking the numbers in the tutorial to scale with your hardware's capabilities!

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

<hr/>

# Portal Particles

I'm going to be using a portal frame model from [Sketchfab](https://sketchfab.com/3d-models/low-poly-hand-painted-dungeon-arch-0040f94c8efd43639d8010874e4fefb6) - it's the same one I used previously in the *Spyro*-style portal tutorial - but you can use any frame you want for your portal. The particle system will generate new particles along the edge of a circle, so a frame which can contain that shape will work best. We'll start by creating a new **VFX Graph** by right-clicking in the Project window and choosing *Create->Visual Effects->Visual Effect Graph*. Double-click it to bring up the VFX Graph editor window.

<img data-src="/img/tut5/part8-default-vfx.jpg" class="center-image lazyload" alt="Default VFX Graph">
*By default, the VFX Graph contains blocks we won't need.*

Brand new VFX Graphs contain several blocks we don't need. Inside the **Initialize Particle** context, we can remove the `Set Velocity Random` block because we'll be controlling particle velocity in a different way, and then remove the `Set Lifetime Random` block because we'll be giving all particles a constant lifetime. From the **Output Particle Quad** context, remove the `Set Size Over Life` block because we won't need it. You can keep the `Set Color Over Life` block if you want, but I removed this one and added it to the **Update Particle** context instead because I think it's clearer.

<img data-src="/img/tut5/part8-starting-graph.jpg" class="center-image lazyload" alt="Stripped Graph">
*All the blocks we didn't need have been removed.*

There's not much to change on the **Output Particle Quad** context - we won't be adding any new blocks here. I choose to enable **Use Soft Particle** and change the **Blend Mode** to **Additive** - our portal effect will be made of many tiny particles, so I want their colours to add together where there is overlap rather than the default alpha-blending behaviour. Not only does this end up looking better, it's also much more efficient. We'll also change the **Main Texture** from **DefaultParticle** to **Default-ParticleSystem** - both are default textures which should be available in your project. The latter is just a circle with feathered edges.

<img data-src="/img/tut5/part8-output-particle.jpg" class="center-image lazyload" alt="Output Context">
*Only small tweaks are needed on the Output context.*

Now we will create the shape of our particle system and start spawning in a greater number of particles. In the **Initialize Particle** context, first add a new `Set Lifetime` block and set the lifetime to 5 seconds. While testing the limits of VFX Graph for this tutorial, I originally planned to have a million particles on screen at a time, but the system is very resilient and I managed to spawn that many *per second* and still run at about 160 frames per second! In the **Spawn** context, I've set the **Constant Spawn Rate** to one million, and in **Initialize Particle** I've set the **Capacity** to five million (equal to the spawn rate multiplied by the lifetime). At this stage, you might see a lot of slowdown because those particles are overlapping so much. We'll need to **Set Size** to something very small - 0.0045 does it for me, although you'll want to make this bigger if you want to use fewer particles.

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

Then we'll set the proper spawn positions of our particles and remove a bit of that slowdown. We'll add a `Position (Circle)` block, then expand the **Arc Circle** dropdown, then the **Circle** dropdown, and set the **Radius** to 1.1 - just a bit higher than the default. Things should be looking a lot smoother now, and we can position the particle system so that the circle intersects with the portal frame.

<img data-src="/img/tut5/part8-particle-circle.jpg" class="center-image lazyload" alt="Particle Circle">
*The circle of particles in front of the portal frame.*

And now all that's left to do inside the **Initialize Particle** context is to set the particles in motion towards the centre of the circle. There are several ways of adding a velocity to particles, but by far the best block to use here is `Add Velocity from Direction & Speed (Spherical)`. As the name suggests, this block adds velocity along a sphere - there's no corresponding version which adds velocity on a circle, so this is the best we've got. By setting the **Center** to (0, 0, 0) - the same as the centre of the spawning circle - and the **Speed** to a negative value, the particles will move towards the centre. A speed of -0.22 is just about enough for the particles to reach the centre of the circle upon death without overshooting.

<img data-src="/img/tut5/part8-initialize-context.jpg" class="center-image lazyload" alt="Initialize Particle">

<img data-src="/img/tut5/part8-portal-filled.jpg" class="center-image lazyload" alt="Filled Portal">
*The frame should be full of tiny bright white particles.*

All that's left is the **Update Particle** context. We don't want our particles to stay white, so we'll add a `Set Color over Life` block. We'll leave the **Mode** as **Color and Alpha** then open the **Color** gradient editor. You can set whatever colours you want here, but the best ways to make this effect look great are to set the alpha a bit lower - 128 looks good - and to use HDR colours for the start of the effect, gradually lowering the intensity throughout the particle's lifetime. For my portal effect, I transition from a purple hue with an HDR intensity of 4.2, to a blue with intensity 3, to a darker blue with intensity 0 (it's not HDR any more), ending with a lighter blue with intensity 0.

<div class="embed-responsive embed-responsive-16by9">
<video loop autoplay controls class="lazyload embed-responsive-item">
    <source src="/img/tut5/part8-particle-colours.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
</div>

The final step is optional, but it might look nice for the portal surface to taper off into the distance like a sort of wormhole. To do that, we can add velocity to the particles over their lifetime - the `Add Velocity Random From Curve` block is great for this. We'll leave the x and y curves alone and tweak the z curve. Click on the curve to open the curve editor. This curve needs only two points - leave the first endpoint at (0, 0), and set the second endpoint to a time of 1 and a value of -0.005 by right-clicking it and selecting **Edit Key**. With luck, your portal surface will now taper off backwards. You can also set the **Sample Mode** to **Over Life** and the effect will look fine, but I prefer the fuzzier appearance of the **Random** mode.

<img data-src="/img/tut5/part8-update-context.jpg" class="center-image lazyload" alt="Update Particle">

<div class="embed-responsive embed-responsive-16by9">
<video loop autoplay controls class="lazyload embed-responsive-item">
    <source src="/img/tut5/part8-particle-trail.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
</div>

Running the full effect in Game View with all five million particles on screen at once, the effect holds up well at around 160 frames per second on my GTX 1070. I'm very surprised by how silky smooth an effect of this magnitude runs!

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

<hr/>

# Conclusion

Visual Effect Graph is magnitudes more powerful than the old built-in particle system. We managed to generate millions of particles without Unity faltering and at a consistently high frame rate. The effect we built looks great when combined with the built-in features of URP, such as high-intensity HDR colours working together with the default bloom post processing. With VFX graph, we have more control over the behaviour of particles in Unity than ever.

<hr/>

# Acknowledgements

### Assets

This tutorial uses the following assets:

["Low Poly Hand Painted Dungeon Arch"](https://sketchfab.com/3d-models/low-poly-hand-painted-dungeon-arch-0040f94c8efd43639d8010874e4fefb6) | **BitGem**

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early! Some tiers also get early access to my [YouTube videos](https://www.youtube.com/channel/UClgoE54W_4rX7jzZGiCmrXw) or even copies of my [asset packs](https://itch.io/c/798909/my-asset-packs)!

#### Special thanks to my Patreon backers!

<p style="text-align: center;">
Gemma Louise Ilett<br/>

Jesper Kuutti<br/>

Jack Dixon $$\cdot$$ BVR $$\cdot$$ John Selig $$\cdot$$ Pablo Ruiz<br/>

Chris Sims $$\cdot$$ FonzoUA $$\cdot$$ Jason Swearingen $$\cdot$$ Moishi Rand $$\cdot$$ Shaun Wall<br/>

Anna Voronova $$\cdot$$ Gabriella Pimenta $$\cdot$$ Srikar $$\cdot$$ James Poole $$\cdot$$ Christopher Pereira $$\cdot$$ Pat $$\cdot$$ Zachary Alstadt
</p>

#### And a shout-out to my top Ko-fi supporters!

<p style="text-align: center;">
Hung Hoang $$\cdot$$ Takuya $$\cdot$$ Mysterious Anonymous Person
</p>

<hr/>
