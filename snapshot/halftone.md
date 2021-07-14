---
layout: page
title: Snapshot Shaders Pro
---

<div class="posts-list" markdown="0">
    <article class="post-preview">
        <div class="row nopadding">
            <h2 class="text-center">For Unity 2019.3+ | URP | HDRP | Built-in</h2>
            <br/>
            <div class="col-lg-12 col-md-12 nopadding doc-page">
                <div class="col-lg-3 col-md-12 nopadding doc-nav">
                    <ul class="nav nav-pills nav-stacked">
                        <li><a href="/snapshot">Snapshot Shaders Pro</a></li>
                        <li><a href="/snapshot/install">Installation Guide</a></li>
                        <li><a href="#">Scripting Guide</a></li>
                        <hr/>
                        <li class="active"><a href="#">Halftone <span class="badge">1.5</span></a></li>
                        <li><a href="/snapshot/barrel-distortion">Barrel Distortion <span class="badge">1.5</span></a></li>
                        <li><a href="/snapshot/vortex">Vortex <span class="badge">1.5</span></a></li>
                        <li><a href="/snapshot/dither-3d">Dither 3D <span class="badge">1.5</span></a></li>
                        <li><a href="/snapshot/colorize">Colorize <span class="badge">1.5</span></a></li>
                        <hr/>
                        <li><a href="/snapshot/cutout">Cutout <span class="badge">1.4</span></a></li>
                        <li><a href="/snapshot/glitch">Glitch <span class="badge">1.4</span></a></li>
                        <li><a href="/snapshot/invert">Invert <span class="badge">1.4</span></a></li>
                        <li><a href="/snapshot/light-streaks">Light Streaks <span class="badge">1.4</span></a></li>
                        <li><a href="/snapshot/radial-blur">Radial Blur <span class="badge">1.4</span></a></li>
                        <li><a href="/snapshot/sharpen">Sharpen <span class="badge">1.4</span></a></li>
                        <hr/>
                        <li><a href="/snapshot/drawing">Drawing <span class="badge">1.2</span></a></li>
                        <li><a href="/snapshot/dither-basic">Dither (Basic) <span class="badge">1.2</span></a></li>
                        <li><a href="/snapshot/kaleidoscope">Kaleidoscope <span class="badge">1.2</span></a></li>
                        <li><a href="/snapshot/scanlines">Scanlines <span class="badge">1.2</span></a></li>
                        <li><a href="/snapshot/outlines-fancy">Outlines (Fancy) <span class="badge">1.2</span></a></li>
                        <li><a href="/snapshot/neon-fancy">Neon (Fancy) <span class="badge">1.2</span></a></li>
                        <hr/>
                        <li><a href="/snapshot/oil-painting">Oil Painting <span class="badge">1.0</span></a></li>
                        <li><a href="/snapshot/underwater">Underwater <span class="badge">1.0</span></a></li>
                        <li><a href="/snapshot/snes">SNES <span class="badge">1.0</span></a></li>
                        <li><a href="/snapshot/game-boy">Game Boy <span class="badge">1.0</span></a></li>
                        <li><a href="/snapshot/outline-sobel">Outline (Sobel) <span class="badge">1.0</span></a></li>
                        <li><a href="/snapshot/neon-sobel">Neon (Sobel) <span class="badge">1.0</span></a></li>
                        <li><a href="/snapshot/silhouette">Silhouette <span class="badge">1.0</span></a></li>
                        <li><a href="/snapshot/mosaic">Mosaic <span class="badge">1.0</span></a></li>
                        <li><a href="/snapshot/pixelate">Pixelate <span class="badge">1.0</span></a></li>
                        <li><a href="/snapshot/film-bars">Film Bars <span class="badge">1.0</span></a></li>
                        <li><a href="/snapshot/blur">Blur <span class="badge">1.0</span></a></li>
                        <li><a href="/snapshot/greyscale">Greyscale <span class="badge">1.0</span></a></li>
                        <li><a href="/snapshot/sepia-tone">Sepia Tone <span class="badge">1.0</span></a></li>
                    </ul>
                </div>
                <div class="col-lg-9 col-md-12 doc-content">
                    <h1>Halftone</h1>
                    <p>
                        The halftone effect can be used to create fake "gradients" by using a series of differently-sized dots. It's used in some kinds of printing technology, but you might recognise it from comics in particular.
                    </p>
                    <p class="box-error">
                        This effect requires the <b>Halftone Texture</b> to be set in order to work properly.
                    </p>
                    <h2>Parameters</h2>
                    <h3>Enabled <span class="badge">Bool</span></h3>
                        Is the effect active?
                    <h3>Halftone Texture <span class="badge">Texture2D</span></h3>
                        Texture to use for the halftone effect. This texture encodes a gradient which is used to determine the shape of the halftone 'dots'.
                    <h3>Softness <span class="badge">Float</span></h3>
                        How soft the transition between shaded dots and lighter parts is. A lower value means a harder cutoff.
                    <h3>Texture Size <span class="badge">Float</span></h3>
                        How large the halftone dots appear on-screen. A larger value means the dots appear larger.
                    <h3>Min Max Luminance <span class="badge">Vector2</span></h3>
                        Use this option to remap the luminance values of the original image. For example, setting a value of (0.5, 1) means that all pixels with a luminance below 0.5 are set to 0, then the rest are stretched so that they fit the range (0, 1). Then the halftone is applied.
                    <h3>Dark Color <span class="badge">Color</span></h3>
                        Color to use for the halftone dots.
                    <h3>Light Color <span class="badge">Color</span></h3>
                        Color to use outside the halftone dots.
                    <h3>Use Scene Color <span class="badge">Boolean</span></h3>
                        If this is ticked, the <b>Light Color</b> is ignored and the original scene colors are used for parts outside the halftone dots.
                    <h2>Known Issues</h2>
                </div>
            </div>
        </div>
    </article>
</div>
