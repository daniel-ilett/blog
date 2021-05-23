---
layout: post
title: "Bytesize Gamedev #5 - [SerializeField] and [field:SerializeField]"
subtitle: 
bigimg: /img/bytesize/part5-bigimg.jpg
hdrimg: /img/bytesize/part5-banner.jpg
#gh-repo: daniel-ilett/shaders-pmd
#gh-badge: [star, fork, follow]
tags: [unity, bytesize, SerializeField]
nice-slug: SerializeField
date: 2021-04-09
idnum: 67

part-label: 5
series-name: Bytesize Gamedev
---

Do your scripts have a lot of variables that you need to modify in the Inspector, but you want to keep `private` in your scripts? Read on!

{: .box-note}
Bytesize Gamedev is a series of shorter game development tutorials.

Hang out with me and other shader enthusiasts over on [Discord]((https://discord.gg/tPQEUwPpb3)) and share what you're working on! And check out this tutorial over on YouTube:

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/Kn_zSTtIQUE" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
</div>

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

Let's start with a tiny example script.

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour
{
    private int maxHealth;

    public int Health { get; private set; }

    public void GetHit(int damage)
    {
        Health -= damage;

        // Do other things here.
    }
}
```

Some of you might not use C# properties, so let's break this down. `maxHealth` is a standard variable, and `Health` is a property - we're using special syntax here to say we can `get` its value from other scripts, but we can only `set` its value within this script. This one is called an **auto-implemented property** because it creates its **backing field** automatically. There's [more about properties](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/properties) on Microsoft's website if some of that went over your head, but we're here to talk about how to use them in Unity.

As we know, `private` fields won't appear in the Unity Inspector, but we can add an attribute called `[SerializeField]` to keep it private while forcing Unity to display it. Let's stick that on both `Health` and `maxHealth`.

```csharp
[SerializeField]
private int maxHealth;

[SerializeField]
public int Health { get; private set; }
```

<img data-src="/img/bytesize/part5-just-serialize.png" class="center-image lazyload" alt="[SerializeField]." title="Perfect if you need to keep things private in scripts but you need to set values in the Editor.">
*Perfect if you need to keep things private in scripts but you need to set values in the Editor.*

Now we can set the value of `maxHealth` inside Unity. But what about `Health`? Despite using `[SerializeField]`, we don't see it here. We need to use a slightly different attribute here called `[field:SerializeField]`.

```csharp
[field:SerializeField]
public int Health { get; private set; }
```

<img data-src="/img/bytesize/part5-field-serialize-field.png" class="center-image lazyload" alt="[field:SerializeField]." title="Not many people know you can do this!">
*Not many people know you can do this!*

Et voila - now we can expose auto-implemented properties in the Inspector! Only later versions of Unity make the name look pretty, and I'm unsure exactly when this was added - but it's an invaluable bit of information.

Thanks for reading *Bytesize Gamedev*, your one-stop shop for shorter game development tips, tricks and tutorials!

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

# Acknowledgements

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early! Some tiers also get early access to my [YouTube videos](https://www.youtube.com/channel/UClgoE54W_4rX7jzZGiCmrXw) or even copies of my [asset packs](https://itch.io/c/798909/my-asset-packs)!

#### Special thanks to my Patreon backers for April 2021!

<p style="text-align: center;">
Gemma Louise Ilett<br/>

JP $$\cdot$$ Pablo Ruiz<br/>

Jack Dixon $$\cdot$$ Paul Froggatt $$\cdot$$ Tuomas Männistö $$\cdot$$ Sébastien Perouffe<br/>

Chris Sims $$\cdot$$ FonzoUA $$\cdot$$ MR MD HARDING $$\cdot$$ Moishi Rand $$\cdot$$ Shaun Wall<br/>

Anna Voronova $$\cdot$$ Christopher Pereira $$\cdot$$ Harshad $$\cdot$$ James Poole $$\cdot$$ Ming Lei $$\cdot$$ sadizeng $$\cdot$$ Zachary Alstadt
</p>

#### And a shout-out to my top Ko-fi supporters!

<p style="text-align: center;">
Hung Hoang $$\cdot$$ Arthur H $$\cdot$$ Megan Taylor $$\cdot$$ Takuya $$\cdot$$ "Somebody"
</p>

<hr/>
