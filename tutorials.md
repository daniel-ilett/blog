---
layout: page
title: Tutorial Series
---

<div class="posts-list" markdown="0">
    <article class="post-preview">
        <a href="/2019-12-01-tut4-intro-portals/">
            <img data-src="/img/tut4/tut4-banner.jpg" class="post-bigimg lazyload"/>
            <h2 class="post-title">
                Portals | Physics-Accurate Portals Series
            </h2>
            <h3 class="post-subtitle">
                Fully-featured recursive portals!
            </h3>
        </a>
        <p class="post-meta">
            December 2019
        </p>
        <div class="series-part-list text-center">
        {% for series in site.series-list %}
            {% if series.series-name == "Portals" %}
            {% for part in series.series-parts %}
                <a href="{{ part.link }}">
                    <div class="series-part">
                        {{ part.label }}
                    </div>
                </a>
            {% endfor %}
            {% endif %}
        {% endfor %}
        </div>
        <div class="post-entry">
            <span markdown="1">`Skyboxes`, `Stencil Rendering`, `Oblique Near-Plane Projection`, `Portal Physics`, `Particles`, `Recursion`, `Screenspace Sampling`</span>
            <br/>
            Many games feature portals. This series explores a complete implementation of physics-accurate portals, starting with Spyro-style portals as an hors d'oeuvre and building up to a recursive scene-rendering portal with Rigidbody-based portal momentum preservation!
        </div>
    </article>
    <article class="post-preview">
        <a href="/2019-09-18-tut3-intro-ultra/">
            <img data-src="/img/tut3/tut3-banner.jpg" class="post-bigimg lazyload"/>
            <h2 class="post-title">
                Image Effects | Ultra Filters Series
            </h2>
            <h3 class="post-subtitle">
                Even more fabulous filters!
            </h3>
        </a>
        <p class="post-meta">
            September-November 2019
        </p>
        <div class="series-part-list text-center">
        {% for series in site.series-list %}
            {% if series.series-name == "Ultra Effects" %}
            {% for part in series.series-parts %}
                <a href="{{ part.link }}">
                    <div class="series-part">
                        {{ part.label }}
                    </div>
                </a>
            {% endfor %}
            {% endif %}
        {% endfor %}
        </div>
        <div class="post-entry">
            <span markdown="1">`Fisheye`, `Underwater`, `Mosaic`, `Anaglyph 3D`, `Cinematic`, `Invert`, `Channel Separation`</span>
            <br/>
            Following on from the original Image Effects series, these tutorials go beyond existing effects I've seen in games and go on to implement new effects - from cinematic film grain and black bars, to red-and-cyan-glasses anaglyph 3D, to wobbly and watery waves, there's lots of variety!
        </div>
    </article>
    <article class="post-preview">
        <a href="/2019-08-05-unity-tips-1-garbage-collection/">
            <img data-src="/img/unity-tips/part2-banner.jpg" class="post-bigimg lazyload"/>
            <h2 class="post-title">
                Unity Tips | Deep Dives
            </h2>
            <h3 class="post-subtitle">
                In-depth articles on how to use the Unity Engine
            </h3>
        </a>
        <p class="post-meta">
            August-December 2019
        </p>
        <div class="series-part-list text-center">
        {% for series in site.series-list %}
            {% if series.series-name == "Unity Tips" %}
            {% for part in series.series-parts %}
                <a href="{{ part.link }}">
                    <div class="series-part">
                        {{ part.label }}
                    </div>
                </a>
            {% endfor %}
            {% endif %}
        {% endfor %}
        </div>
        <div class="post-entry">
            Ever needed more of an in-depth look into parts of the Unity Engine? The intention of this series is to consolidate as much high-quality information on each topic into one place as possible. Topics include Interpolation, Garbage Collection, Persistent Data, ScriptableObjects and Coroutines.
        </div>
    </article>
    <article class="post-preview">
        <a href="/2019-05-29-tut2-intro/">
            <img data-src="/img/tut2/intro-banner.jpg" class="post-bigimg lazyload"/>
            <h2 class="post-title">
                Cel Shading | Toon Lighting Shaders
            </h2>
            <h3 class="post-subtitle">
                Building a cel-shaded effect from scratch
            </h3>
        </a>
        <p class="post-meta">
            May-June 2019
        </p>
        <div class="series-part-list text-center">
        {% for series in site.series-list %}
            {% if series.series-name == "Cel-shading" %}
            {% for part in series.series-parts %}
                <a href="{{ part.link }}">
                    <div class="series-part">
                        {{ part.label }}
                    </div>
                </a>
            {% endfor %}
            {% endif %}
        {% endfor %}
        </div>
        <div class="post-entry">
            <span markdown="1">`Diffuse`, `Specular`, `Cel-Shaded`, `Fresnel`, `Normal`, `Edge-Detect`</span>
            <br/>
            Moving on from image effects, this series looks at lighting models used to illuminate 3D models. We look at basic diffuse lighting, then build on our lighting model to introduce specular highlights, fresnel lighting, bold outlines, and - key to cel-shading - introduce hard cuts in our lighting.
        </div>
    </article>
    <article class="post-preview">
        <a href="/2019-04-24-tut1-intro-smo/">
            <img data-src="/img/tut1/intro-banner.jpg" class="post-bigimg lazyload"/>
            <h2 class="post-title">
                Image Effects | Snapshot Mode Filters
            </h2>
            <h3 class="post-subtitle">
                Recreating Super Mario Odyssey's Snapshot Mode effects as Unity shaders
            </h3>
        </a>
        <p class="post-meta">
            April-May 2019
        </p>
        <div class="series-part-list text-center">
        {% for series in site.series-list %}
            {% if series.series-name == "Image Effects" %}
            {% for part in series.series-parts %}
                <a href="{{ part.link }}">
                    <div class="series-part">
                        {{ part.label }}
                    </div>
                </a>
            {% endfor %}
            {% endif %}
        {% endfor %}
        </div>
        <div class="post-entry">
            <span markdown="1">`Greyscale`, `Sepia`, `Silhouette`, `Box Blur`, `Gaussian Blur`, `Line Drawing`, `Neon`, `Bloom`, `NES`, `SNES`, `Game Boy`, `CRT`, `Oil Painting`</span>
            <br/>
            This series is a gentle introduction to many key shader features and guides you gently into shader syntax and the shader-writing mindset. By the end, you'll have written about a dozen fully-featured filter effects!
        </div>
    </article>
</div>
