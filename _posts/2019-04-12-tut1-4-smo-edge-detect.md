---
layout: post
title: Image Effects | Part 4 - Edgy Talk
subtitle: Calculating image gradients and drawing some edges
bigimg: /img/tut1/part4-banner.png
tags: [shaders, unity]
nice-slug: Edgy Talk
date: 2019-04-12 04:00:00
---

Detecting edges in images allows developers to write cartoon shaders to boldly outline objects. Typically, they would use object geometry, but we can achieve a cheap edge-detection effect using image effects. In this tutorial, we shall explore the Sobel-Feldman operator and take a look at bloom effects to implement the Neon effect in Super Mario Odyssey.

# Edge Detection

![Edge Detection](/img/tut1/part4-edge-detect.png)

To detect edges using an image effect, let's think about what an edge actually is. Without being able to use object geometry to decide where an edge is, we will consider edges in the image to be places where the colour changes suddenly in lightness or hue. That means we will have to consider multiple pixels as we did with the Blur filters, but using a different kernel. Let's take a look at the Sobel filter.

A Sobel operator calculates "gradients" across an image and then uses the magnitude of those gradients to decide where there are edges. Since a gradient is inherently something we can only do in one direction at a time, we shall perform two calculations in the x- and y-directions - but this time, we thankfully won't need to do them in separate passes, as you'll see. Each calculation involves a 3x3 kernel.

$$ 
G_x = 
\begin{bmatrix}
    -1 & 0 & 1 \\
    -2 & 0 & 2 \\
    -1 & 0 & 1
\end{bmatrix}
\hspace{25pt}
G_y = 
\begin{bmatrix}
    -1 & -2 & -1 \\
     0 &  0 &  0 \\
     1 &  2 &  1
\end{bmatrix}
$$



<hr/>

# Neon

# Conclusion

<hr/>
