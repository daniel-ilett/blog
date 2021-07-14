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
                        <li class="active"><a href="">Dither (Basic) <span class="badge">1.2</span></a></li>
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
                    <h1>Dither (Basic)</h1>
                    <p>
                        Shades in the scene with a brush stroke pattern. Darker parts of the scene have a more noticeable stroke effect.
                    </p>
                    <p class="box-error">
                        This effect requires the <b>Noise Texture</b> to be set in order to work properly. Examples are provided at <b>Resources/Textures/BlueNoise.png</b> and <b>Resources/Textures/BlueNoise.png</b>.
                    </p>
                    <h2>Parameters</h2>
                    <h3>Enabled <span class="badge">Bool</span></h3>
                        Is the effect active?
                    <h3>Noise Texture <span class="badge">Texture2D</span></h3>
                        The dithering pattern used for smooth shading emulation.
                    <h3>Noise Size <span class="badge">Float</span></h3>
                        The resolution of the noise texture (higher values mean lower on-screen resolution).
                    <h3>Threshold Offset <span class="badge">Float</span></h3>
                        The value to use as the comparison point between light and dark pixels. This is added to values from the Noise Texture.
                    <h3>Dark Color <span class="badge">Color</span></h3>
                        Color to use for pixels that fall beneath the dithering threshold.
                    <h3>Light Color <span class="badge">Color</span></h3>
                        Color to use for pixels that go above the dithering threshold.
                    <h3>Use Scene Color <span class="badge">Bool</span></h3>
                        If this is ticked, the <b>Light Color</b> is ignored and the original scene colors are used for parts outside the halftone dots.
                    <h2>Known Issues</h2>
                </div>
            </div>
        </div>
    </article>
</div>
