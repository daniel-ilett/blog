---
layout: post
title: More Holograms in Shader Graph and URP
subtitle:
bigimg: /img/tut5/part10-bigimg.jpg
hdrimg: /img/tut5/part10-banner.jpg
gh-repo: daniel-ilett/shaders-hologram
gh-badge: [star, fork, follow]
tags: [unity, shaders, urp, hologram, shader-graph]
nice-slug: Holograms
date: 2020-07-21
idnum: 53

part-label: 10
series-name: URP
---

Last time, we took a look at holograms using a bright fresnel shell around the object and scanlines passing vertically through it. In many interpretations of holographic technology, artists often add glitches and other effects to make the effect look more believable - a perfect hologram can look *too* good. Today, we're going to make a bunch of alterations to our hologram to remove shadows and add imperfections such as distortion and noise grain.

# Removing Shadows

Holograms, of course, emit light. One of the oversights in the previous tutorial - one I noticed almost immediately after posting it - is that objects with this shader receive shadows, which looks strange. Unfortunately for us, it's a bit more cumbersome to turn off receiving shadows in URP - while it's as easy as unticking a box on any renderer component in the built-in pipeline, we now must add a **keyword** to the shader graph and then use the **Debug Mode** in the Inspector to add the keyword to each material using the shader. Yes, really. I found this workaround in [a forum post requesting an easy way to do this](https://forum.unity.com/threads/turn-off-receive-shadows-on-custom-pbr-graph-lwrp.657814/) - go figure! You could also use an `Unlit Master` node instead of `PBR Master`, but then we'd lose the **Emission** channel.

Open up the hologram graph from last time. Under the **Blackboard**'s plus arrow drop-down, pick the *Keyword -> Boolean* option at the very bottom and give your new keyword a reference of `_RECEIVE_SHADOWS_OFF` - the capitalisation and position of the underscores is important. By default, leave it ticked. Then, go to the Inspector and, using the small three-dot menu in the upper-right corner, change the Inspector to **Debug Mode**. This unlocks a few more options usually hidden from view. Select all materials using the hologram shader and you'll notice one of those new options called "Shader Keywords"; type `_RECEIVE_SHADOWS_OFF` in the text box. Now, all your holograms should be shadow-free - you can now change your Inpector back to **Normal Mode**.

# Imperfections

## Vertex Distortion

## Noise Grain

# Acknowledgements

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early! Some tiers also get early access to my [YouTube videos](https://www.youtube.com/channel/UClgoE54W_4rX7jzZGiCmrXw) or even copies of my [asset packs](https://itch.io/c/798909/my-asset-packs)!

#### Special thanks to my Patreon backers!

<p style="text-align: center;">
Gemma Louise Ilett<br/>

Jesper Kuutti<br/>

Jack Dixon $$\cdot$$ BVR $$\cdot$$ John Selig $$\cdot$$ Pablo Ruiz<br/>

Chris Sims $$\cdot$$ FonzoUA $$\cdot$$ Jason Swearingen $$\cdot$$ Moishi Rand $$\cdot$$ Udons $$\cdot$$ Shaun Wall<br/>

Anna Voronova $$\cdot$$ Gabriella Pimenta $$\cdot$$ James Poole $$\cdot$$ Christopher Pereira $$\cdot$$ Zachary Alstadt
</p>

#### And a shout-out to my top Ko-fi supporters!

<p style="text-align: center;">
Hung Hoang $$\cdot$$ Takuya $$\cdot$$ Mysterious Anonymous Person
</p>

<hr/>
