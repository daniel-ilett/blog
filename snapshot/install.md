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
                        <li class="active"><a href="#">Installation Guide</a></li>
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
                    <h1>Installation Guide</h1>
                    <p>
                        The installation process looks a bit different for each pipeline. When you download <i>Snapshot Shaders Pro</i>, you will receive a package which itself contains a README file and three more packages - open the package corresponding to the render pipeline you are using. Then follow the additional steps for your pipeline:
                    </p>
                    <h2>✨ Universal Render Pipeline (URP)</h2>
                    <p>
                        This version of the package works on Unity 2019.3 and above. Once the package contents have been extracted, you will need to follow these steps to activate effects.
                    </p>
                    <ul>
                        <li>Find your <b>Forward Renderer asset</b> and add the effects you wish to use to the <b>Renderer Features</b> section.</li>
                        <li>Create a volume profile asset via <b>Create -> Volume Profile</b> and add the same effects you want to use to the profile.</li>
                        <li>Add a volume to your scene and attach the volume profile.</li>
                        <li>Tweak the settings on the volume profile. All effects will start in an inactive state. Take note of which effects require textures to work properly.</li>
                    </ul>
                    <h2>✨ High Definition Render Pipeline (HDRP)</h2>
                    <p>
                        This version of the package works on Unity 2019.3 and above. Once the package contents have been extracted, you will need to follow these steps to activate effects.
                    </p>
                    <ul>
                        <li>Go to <b>Project Settings -> HDRP Default Settings -> Custom Post Process Orders</b> and add each effect you want to use to the <b>After Post Process</b> section. The only exception to this is the <b>Light Streaks</b> effect, which is in the <b>Before Post Process</b> section.</li>
                        <li>Create a volume profile asset via <b>Create -> Volume Profile</b> and add the same effects you want to use to the profile.</li>
                        <li>Add a volume to your scene and attach the volume profile.</li>
                        <li>Tweak the settings on the volume profile. All effects will start in an inactive state. Take note of which effects require textures to work properly.</li>
                    </ul>
                    <h2>✨ Built-in Render Pipeline</h2>
                    <p>
                        This version of the package works for Unity versions 2019.2 and above, but it requires the <b>Post Processing Stack v2</b> package to be installed to operate. Once the package contents have been extracted, you will need to follow these steps to activate effects.
                    </p>
                    <ul>
                        <li>Add a <b>Post Processing Layer</b> to the camera you will use to render the effects.</li>
                        <li>Set a layer mask to determine which volumes in which layers will be activated by this camera.</li>
                        <li>Create a volume profile asset via <b>Create -> Post Processing Profile</b> and add the same effects you want to use to the profile.</li>
                        <li>Add a <b>Post Processing Volume</b> to your scene and attach the volume profile.</li>
                        <li>Tweak the settings on the volume profile. All effects will start in an inactive state. Take note of which effects require textures to work properly.</li>
                    </ul>
                </div>
            </div>
        </div>
    </article>
</div>
