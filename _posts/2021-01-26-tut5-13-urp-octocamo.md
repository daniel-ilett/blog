---
layout: post
title: MGS4 Octocamo in Shader Graph and URP
subtitle: Sneaky Shaders
bigimg: /img/tut5/part13-bigimg.jpg
hdrimg: /img/tut5/part13-banner.jpg
gh-repo: daniel-ilett/shaders-octocamo
gh-badge: [star, fork, follow]
tags: [unity, shaders, urp, octocamo]
nice-slug: MGS4 Octocamo
date: 2021-01-26
idnum: 56

part-label: 13
series-name: URP
---

The Octocamo mechanic in *Metal Gear Solid 4: Guns of the Patriots* is an extension of the same mechanic from *MGS3*, with the additional feature where your camouflage *automatically* adjusts to your environment. In this tutorial, we will interact with Unity's terrain system to figure out which texture the player is stood on, then automatically change the texture on the player's camouflage material with a bit of interpolation.

{: .box-warning}
This tutorial is aimed at people who have at least some experience with Shader Graph and C# scripting. We are using Unity 2019.4 and URP 7.3.1. It may also help if you have some knowledge of the terrain system, but it's not required here.

Also check out this same tutorial over on my YouTube channel:

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/EwkNOyrk_aQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
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

# The Camo Database

This tutorial ended up being over an hour long when I posted it on YouTube, which is clearly ridiculous, so I'm going to rein it in here. Check out the GitHub repository for the full project, including a very basic character controller and a terrain.

We're going to start by creating a new script to register each texture on the terrain and associate it with a color. Our project will contain a Camo Index to indicate how well-camouflaged the player is, and we'll do that by directly comparing the mean color of one texture to another. *MGS4* probably has a more sophisticated way of doing this, but we're going for a quick approximation.

Create a new script by right-clicking in the Project window and selecting *Create -> C# Script*. We'll call it `CamoDatabase`. To begin with, this script won't be inheriting `MonoBehaviour`, and instead, we're going to create a singleton instance of this class, which will contain a `Dictionary` to store textures and corresponding colors.

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CamoDatabase
{
    ...
}
```

We want the database to be accessible from other scripts and easily locatable. There are a few ways to do that - using a `static` class or a separate class for registering/finding 'service' classes, for instance - but we're going to go with a quick and cheap singleton instance. Using C#'s properties with a backing field is a good way to do this. The backing field is a `private`, `static` member variable which is set to `null` during initialisation.

```csharp
private static CamoDatabase instance = null;
```

The property uses the same name, but capitalised, and uses a `public` **getter** and a `private` **setter** to deal with automatically creating the singleton instance if one does not exist.

```csharp
public static CamoDatabase Instance
{
    get
    {
        if(instance == null)
        {
            return new CamoDatabase();
        }
        return instance;
    }
    private set
    {
        instance = value;
    }
}
```

We also need the `Dictionary` to be a member variable. We're going to map `Texture2D` to `Color`, so those are the key and value types for our `Dictionary`.

```csharp
private Dictionary<Texture2D, Color> camoColours 
    = new Dictionary<Texture2D, Color>();
```

We need two more methods. One for accessing the terrain color, given an input `Texture2D`, and another for registering a new texture-color database entry, which also takes in a `Texture2D`.

```csharp
public Color GetCamoColour(Texture2D texture)
{
    ...
}

public Color AddCamoColour(Texture2D texture)
{
    ...
}
```

The `GetCamoColour` method just needs to check if the color has already been registered and return it if so, or register the texture if not.

```csharp
if(camoColours.ContainsKey(texture))
{
    return camoColours[texture];
}
else
{
    return AddCamoColour(texture);
}
```

The `AddCamoColour` method is a bit more complicated. It needs to iterate over each pixel of the texture, sum the red, green and blue colors of those pixels, then take the mean average. As you can imagine, this is computationally expensive when you're dealing with 1024x1024 textures and over - for that reason, you might want to pre-calculate these colors in a real game! But this was more fun to code. That said, you do need to make sure every texture you're using has read/write permissions enabled in the import settings.

<img data-src="/img/tut5/part13-read-write-enabled.jpg" class="center-image lazyload" alt="Read/Write enabled setting." title="Make sure Read/Write Enabled is ticked on every camouflage texture, since we're using GetPixels().">
*Make sure Read/Write Enabled is ticked on every camouflage texture, since we're using GetPixels().*

I store the intermediate summation values inside a `Vector3` because `Color` can't contain large enough values, then convert back to a `Color` after division. Now, whenever we encounter an unseen texture and try to grab its color, we will be able to automatically add its color to the database.

```csharp
var pixels = texture.GetPixels();
Vector3 color = new Vector3();

for(int i = 0; i < pixels.Length; ++i)
{
    color.x += pixels[i].r;
    color.y += pixels[i].g;
    color.z += pixels[i].b;
}

color /= pixels.Length;

var returnColor = new Color(color.x, color.y, color.z);
camoColours.Add(texture, returnColor);
return returnColor;
```

If I wanted to pretend this has real-world advantages, this would work in a game where players can upload their own textures to use on the terrain - I hope someone makes that idea one day! For now, let's move on to the system that will interact between the player and the terrain - the `CamoController` script.

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

# Interacting with the Terrain: the CamoController script

This script will be quite a lot more complicated than `CamoDatabase`. Unlike `CamoDatabase`, `CamoController` will inherit from `MonoBehaviour` and be placed on the player object. We'll need to add a `using UnityEngine.UI` statement because we'll be interacting with the UI system to display how well the player is camouflaged.

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class CamoController : MonoBehaviour
{
    ...
}
```

We'll need some member variables to start with. We're going to be polling the terrain for texture data and modifying the material attached to the player, so we'll need `terrain` and `camoMaterial` variables. For the camo index, we'll need to access a `Text` component and an `Image` component on the UI - that's why we needed to be `using` the `UnityEngine.UI` namespace. All of these variables will be public so that we can assign them in the Inspector later.

```csharp
public Terrain terrain;
public Material camoMaterial;
public Text camoIndexText;
public Text camoIndexImage;
```

We also need some `private` variables. To store the camo index, which will be between 0 and 1, we will use `float camoIndex`. To keep track of the currently-equipped camouflage texture, we'll use `Texture2D currentCamo`. When we update the camo index, it will be
expensive to recalculate it every frame, so we will only poll the terrain every few frames or seconds. To keep track of how long it's been since the last update, use `float camoIndexUpdateTime`. Finally, we will also save the camouflage update coroutine inside a variable called `setCamoRoutine`.

```csharp
private float camoIndex = 0.0f;
private Texture2D currentCamo;
private float camoIndexUpdateTime = 0.0f;
private Coroutine setCamoRoutine = null;
```

On top of these, we will also use a few constants, using the `const` keyword, for values that won't change. The coroutine that swaps out one camouflage for another will always take the same amount of time to interpolate between two textures, so we'll use a `const float camoSwitchTime` and give it a value of 0.75 seconds. We also need a threshold value to determine which texture is the most prominent on the terrain if we are in a position where several textures are blended together. Since our terrain uses only two textures, we can set the `const float camoThreshold` to `0.5`. Finally, we need to define a threshold time for the camo index to automatically check if it can update. For that, add a `const float camoIndexUpdateThreshold` with a value of `1.0`. You can change any of these values in the script if you want.

```csharp
private const float camoSwitchTime = 0.75f;
private const float camoThreshold = 0.5f;
private const float camoIndexUpdateThreshold = 1.0f;
```

The very last thing we'll need is another private variable, but one we won't need to set. It's going to be a reference to the `PlayerController` script also attached to this GameObject. I won't go into detail about this script too much, but later we'll be using a method I wrote called `IsMoving` to determine if the player is walking.

```csharp
private PlayerController playerController;
```

Now all the variables are set up - now it's time to add a few methods. We'll start, appropriately, with `Start`. In this method, the first thing we want to do is register the texture the non-camouflage texture and player's starting camouflage texture on the `CamoDatabase`. That means that when we come to compare the player's texture to the terrain texture to calculate the camo index, those textures will already be registered. We will also cache the `PlayerController` attached to the GameObject.

```csharp
private void Start()
{
    currentCamo = (Texture2D)camoMaterial.GetTexture("_CamoTexture");
    CamoDatabase.Instance.AddCamoColour((Texture2D)camoMaterial.mainTexture);
    CamoDatabase.Instance.AddCamoColour(currentCamo);
    playerController = GetComponent<PlayerController>();
}
```

Next, we want to write a method which finds the player's position on the terrain and returns which texture is the most prevalent one at that point on the terrain. It'll `return` a `Texture2D` and take zero parameters.

```csharp
private Texture2D GetTerrainTexture()
{
    ...
}
```

The `Terrain` object has an attached `terrainData` member of type `TerrainData`, which contains all the underlying data related to terrain textures, heights and so on. What we're interested in is the `alphamaps`, which store the relative strengths of the terrain textures at each point on the terrain. The code to retrieve those maps is as follows:

```csharp
TerrainData tData = terrain.terrainData;

Vector3 position;
position.x = ((transform.position.x - terrain.transform.position.x) / tData.size.x) * tData.alphamapWidth;
position.z = ((transform.position.z - terrain.transform.position.z) / tData.size.z) * tData.alphamapHeight;

int textureID = 0;
float[,,] alphamaps = tData.GetAlphamaps((int)position.x, (int)position.z, 1, 1);
```

There's a lot going on here! We're calculating the exact position of the player on the terrain and storing it in the `position` variable. Once we have that, we're using the `GetAlphamaps` method to get the correct alphamap data. The first two parameters determine where on the XZ plane we are starting from - so we use the `position` - and the last two parameters are how many positions on the terrain we're polling, so we use (1, 1) to poll a single point.

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

The data returned by `GetAlphamaps` is a three-dimensional array, where the first two dimensions represent the x and z position *relative to the start point we specified*, and the third dimension is the ID of a texture on the terrain. We have two textures on our terrain, so this array will contain two values at `(0, 0, 0)` and `(0, 0, 1)`. The first value is how strong texture 0 is at `(position.x, position.z)`, and the second value is how strong texture 1 is at `(position.x, position.z)`. I hope that makes sense because the return value is a little strange!

Next, we'll iterate through each texture and if the value in the alphamap array is greater than `camoThreshold`, we'll make that the return texture. We can retrieve the texture from the `terrainData` object; it has an array member called `terrainLayers`, where each entry represents one of the texture layers on the terrain. The `diffuseTexture` member on those layers is the texture we want.

```csharp
for(int i = 0; i < alphamaps.GetLength(2); ++i)
{
    if (camoThreshold < alphamaps[0, 0, i])
    {
        textureID = i;
    }
}

return tData.terrainLayers[textureID].diffuseTexture;
```

Now that we know how to get the texture on the terrain where we stand, we can start writing the code to swap out the player's camouflage with the texture on the terrain. We will make this method a `Coroutine`, which can execute over several frames without halting Unity's main thread. They use the `IEnumerator` return type.

```csharp
private IEnumerator SetCamo()
{
    ...
}
```

The first port of call on this method is to get the terrain texture. Thankfully, we just wrote a method called `GetTerrainTexture`. If that texture is the same as the one already on the player, we don't need to do anything - at this point, the method can just return. However, in a coroutine, you don't write `return` to do that - you write `yield break` instead. This is a little technical, but under the hood, Unity implements its coroutines as **enumerators**, which use the `yield` keyword to control when they are able to 'return' a value to whatever other method requested a value from the enumerator, and `yield break` is just a way to say there are no more values to 'return' from this enumerator.

```csharp
var camoTexture = GetTerrainTexture();
if(camoTexture == camoMaterial.GetTexture("_CamoTexture"))
{
    yield break;
}
```

Then, we'll write the loop which interpolates the current camouflage back to the 'uncamouflaged' texture. We haven't yet seen the shader which will do this, but we are going to use a property named `_CamoAmount` - when this is 0, we want to display the uncamouflaged texture (`_MainTexture`), and when it is 1, we will display the camouflage texture (`_CamoTexture`). This loop reverts to `_MainTexture` in `camoSwitchTime` seconds.

```csharp
for(float t = 0; t < camoSwitchTime; t += Time.deltaTime)
{
    camoMaterial.SetFloat("_CamoAmount", 1.0f - (t / camoSwitchTime));
    yield return null;
}
camoMaterial.SetFloat("_CamoAmount", 0.0f);
```

Once that's done, we will register the new camouflage texture on the `CamoDatabase` (the `GetCamoColour` method has side effects and makes the check if the texture was already registered - yes I know it's messy and the check should be on `AddCamoColour`, but it works, please don't hurt me) and set `_CamoTexture` to the new texture. Then, we will set the new `camoTexture` and update the camo index using a method we are yet to write, `UpdateCamoIndex`.

```csharp
camoMaterial.SetTexture("_CamoTexture", camoTexture);
CamoDatabase.Instance.GetCamoColour(camoTexture);
currentCamo = camoTexture;
UpdateCamoIndex();
```

We are almost done with this method. Now, we'll perform another interpolation loop, but we'll go from the uncamouflaged texture to the new camouflage. The final step is to set the `setCamoRoutine` variable to `null`. This variable will externally be used to store this coroutine to prevent us from resetting our camouflage while already resetting our camouflage.

```csharp
for (float t = 0; t < camoSwitchTime; t += Time.deltaTime)
{
    camoMaterial.SetFloat("_CamoAmount", (t / camoSwitchTime));
    yield return null;
}
camoMaterial.SetFloat("_CamoAmount", 1.0f);

setCamoRoutine = null;
```

That's the `SetCamo` method done. Now we can move onto the `UpdateCamoIndex` method - its return type is `void` and it takes no parameters. This one is relatively straightforward - we will grab the texture on the terrain where we stand, then get the colours of both that and the player's `currentCamo` from `CamoDatabase`.

```csharp
private void UpdateCamoIndex()
{
    var terrainTexture = GetTerrainTexture();

    var terrainColor = CamoDatabase.Instance.GetCamoColour(terrainTexture);
    var camoColor = CamoDatabase.Instance.GetCamoColour(currentCamo);

    ...
}
```

We can use whatever approach we'd like to compare the two colours for similarity, but I'm going to use Pythagoras' Theorem, as it's the most straightforward. Once we have recalculated the `camoIndex` with the similarity value, we can update the `camoIndexText` and `camoIndexImage` accordingly; `camoIndexText` displays the `camoIndex` as a percentage, and the `camoIndexImage` gets more transparent the more well-camouflaged the player is.

```csharp
camoIndex = 1.0f - Mathf.Sqrt(Mathf.Pow(terrainColor.r - camoColor.r, 2) +
    Mathf.Pow(terrainColor.g - camoColor.g, 2) + Mathf.Pow(terrainColor.b - camoColor.b, 2));

camoIndexText.text = Mathf.RoundToInt(camoIndex * 100) + "%";
camoIndexImage.color = new Color(1.0f, 1.0f, 1.0f, 1.0f - camoIndex);

camoIndexUpdateTime = 0.0f;
```

Almost done now! We need to keep track of when to automatically check if the camo index needs updating, and we should poll user input to check if we should attempt to change our camouflage. We will do both of these things in `Update`.

```csharp
private void Update()
{
    ...
}
```

Starting with user input, we'll check the `Fire1` button to try resetting our camouflage. To make sure the camo-change animation is not already playing, we'll check if the coroutine is already playing using `setCamoRoutine == null`. Inside the if-statement, we will invoke the coroutine using the `StartCoroutine` method.

```csharp
if (Input.GetButtonDown("Fire1") && setCamoRoutine == null)
{
    setCamoRoutine = StartCoroutine(SetCamo());
}
```

Else, we will check if enough time has passed to automatically try updating the camo index. If `camoIndexUpdateTime` exceeds `camoIndexUpdateThreshold`, we'll call `UpdateCamoIndex`, but only if the player is moving to avoid unnecessary checks. Outside the if-else-statements, we will advance the `camoIndexUpdateTime` timer.

```csharp
else if(camoIndexUpdateTime > camoIndexUpdateThreshold && playerController.IsMoving())
{
    UpdateCamoIndex();
}

camoIndexUpdateTime += Time.deltaTime;
```

That was quite a lot to get through! Now, we will see what the shader looks like. We'll be starting with a **PBR Graph** (use *Create -> Shader -> PBR Graph* to add one). The shader needs three properties, which we've already mentioned: a `Texture2D` called `Main Texture`, with a reference of `_MainTexture`; another `Texture2D` called `Camo Texture`, with a reference of `_CamoTexture`; and a `Vector1` named `Camo Amount`, whose reference is `_CamoAmount`. You could also make the last one a slider between 0 and 1 for testing in the Inspector, but it's not required for the shader to work properly at runtime.

The graph is surprisingly basic. We'll have two `Sample Texture 2D` nodes - one reads from `Main Texture`, and the other from `Camo Texture`. The **RGBA** output of both are used in a `Lerp` node, with `Camo Amount` in the **T** slot. That gets output into **Albedo** on `PBR Master`, and that's it! 

<img data-src="/img/tut5/part13-shader-entirety.jpg" class="center-image lazyload" alt="Octocamo Shader Graph." title="The complete shader graph only takes a handful of nodes.">
*The complete shader graph only takes a handful of nodes.*

The core lesson in this tutorial is that very simple shaders can often be made more impressive in tandem with a bit of code, although in this case we ended up with a lot more code than shader! It's important to remember that each "part" of game development can be limited, but when you connect systems together, you end up with a mechanic that's far more impressive than it otherwise would've been. The Octocamo camouflage mechanic in *MGS4* wouldn't exist without the ability to interpolate textures on materials on the fly.

<div class="embed-responsive embed-responsive-16by9">
<video loop autoplay controls class="lazyload embed-responsive-item">
    <source src="/img/tut5/part13-demonstration.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
</div>

<hr/>

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

# Conclusion

Unity contains so many systems, many of which can be paired together to make interesting effects. The Octocamo mechanic relies of many of Unity's systems - the shader graph is perhaps one of the easier parts of the entire package, and the heavy lifting is done by some C# scripting. Shaders can't do anything, which is why we often use scripts to augment the capabilities of shaders.

<hr/>

# Acknowledgements

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early! Some tiers also get early access to my [YouTube videos](https://www.youtube.com/channel/UClgoE54W_4rX7jzZGiCmrXw) or even copies of my [asset packs](https://itch.io/c/798909/my-asset-packs)!

#### Special thanks to my Patreon backers for January 2021!

<p style="text-align: center;">
Gemma Louise Ilett<br/>

JP<br/>

Jack Dixon $$\cdot$$ Tuomas Männistö<br/>

Chris Sims $$\cdot$$ FonzoUA $$\cdot$$ Jesper Kuutti $$\cdot$$ MR MD HARDING $$\cdot$$ Maya Nedeljkovich $$\cdot$$ Moishi Rand $$\cdot$$ Shaun Wall<br/>

Anna Voronova $$\cdot$$ James Poole $$\cdot$$ Christopher Pereira $$\cdot$$ sadizeng $$\cdot$$ Zachary Alstadt
</p>

#### And a shout-out to my top Ko-fi supporters!

<p style="text-align: center;">
Hung Hoang $$\cdot$$ Arthur H $$\cdot$$ Megan Taylor $$\cdot$$ Takuya $$\cdot$$ "Somebody"
</p>

<hr/>
