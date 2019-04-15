---
layout: post
title: Image Effects - Part 2 - Getting Deep
subtitle: Introducing a new kind of buffer to take data from
bigimg: /img/tut1/part2-banner.png
tags: [shaders, unity]
nice-slug: Getting Deep
date: 2019-04-12 02:00:00
---

Today we'll look at the Silhouette effect, which draws objects close to the camera in a darker shade than those far back in the distance. So far, we've been interacting with the framebuffer - the 2D array of values that pixel colour values are rendered into - and today another buffer, the depth buffer, will be analysed.

# Silhouette

![Silhouette](/img/tut1/part2-silhouette.png)

The Silhouette filter is a striking effect which emphasizes objects in the foreground, bringing the eye's focus towards those elements.
