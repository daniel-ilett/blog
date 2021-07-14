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
                        <li class="active"><a href="#">Underwater <span class="badge">1.0</span></a></li>
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
                    <h1>Underwater</h1>
                    <p>
                        The Underwater effect creates waves that distort the image and adds a colored water fog.
                    </p>
                    <p class="box-error">
                        This effect works best when the far clipping plane of the camera is set to a smaller value, such that the entire scene just about fits within the camera.
                    </p>
                    <p class="box-error">
                        This effect requires the <b>Bump Map</b> to be set in order to work properly. An example is provided at <b>Resources/Textures/UnderwaterNormals.png</b>.
                    </p>
                    <h2>Parameters</h2>
                    <h3>Bump Map <span class="badge">Texture2D</span></h3>
                        A texture to control the direction and amount of wave distortion.
                    <h3>Strength <span class="badge">Float</span></h3>
                        The strength of the wave distortion.
                    <h3>Water Color <span class="badge">Color</span></h3>
                        The water tint colour at the far clipping plane.
                    <h3>Fog Strength <span class="badge">Float</span></h3>
                        The strength of the water fog (and the distance that the fog first appears at).
                    <h2>Known Issues</h2>
                </div>
            </div>
        </div>
    </article>
</div>
