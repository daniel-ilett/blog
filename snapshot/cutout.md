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
                        <li><a href="/snapshot/halftone">Halftone <span class="badge">1.5</span></a></li>
                        <li><a href="/snapshot/barrel-distortion">Barrel Distortion <span class="badge">1.5</span></a></li>
                        <li><a href="/snapshot/vortex">Vortex <span class="badge">1.5</span></a></li>
                        <li><a href="/snapshot/dither-3d">Dither 3D <span class="badge">1.5</span></a></li>
                        <li><a href="/snapshot/colorize">Colorize <span class="badge">1.5</span></a></li>
                        <hr/>
                        <li class="active"><a href="#">Cutout <span class="badge">1.4</span></a></li>
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
                    <h1>Cutout</h1>
                    <p>
                        The cutout effect takes a texture (which usually has a part taken out of the middle with zero alpha) and overlays the texture onto the scene.
                    </p>
                    <p class="box-error">
                        This effect requires the <b>Cutout Texture</b> to be set in order to work properly. A collection of textures is supplied in <b>Resources/Textures/Cutout</b>.
                    </p>
                    <h2>Parameters</h2>
                    <h3>Enabled <span class="badge">Bool</span></h3>
                        Is the effect active?
                    <h3>Cutout Texture <span class="badge">Texture2D</span></h3>
                        The texture to use for the cutout. Pixels inside the texture with an alpha of zero become cut out in the center.
                    <h3>Border Color <span class="badge">Color</span></h3>
                        Color to apply to the outer edges of the cutout texture where alpha is greater that zero.
                    <h3>Stretch <span class="badge">Bool</span></h3>
                        Should the texture stretch to fit the screen? If false, the texture keeps its original aspect ratio.
                    <h3>Zoom <span class="badge">Float</span></h3>
                        The level of zoom to apply to the cutout texture.
                    <h3>Offset <span class="badge">Vector2</span></h3>
                        An offset to apply to the cutout texture.
                    <h3>Rotation <span class="badge">Float</span></h3>
                        Amount of rotation, in degrees, to apply to the cutout texture. The rotation is applied anti-clockwise.
                    <h2>Known Issues</h2>
                </div>
            </div>
        </div>
    </article>
</div>
