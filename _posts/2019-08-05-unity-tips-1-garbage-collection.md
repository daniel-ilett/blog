---
layout: post
title: Unity Tips | Part 1 - Garbage Collection
subtitle: Avoid interruptions to your game’s execution
bigimg: /img/unity-tips/part1-banner.png
tags: [unity, unity-tips, garbage-collection, optimisation, performance]
nice-slug: Garbage Collection
date: 2019-08-05
idnum: 18
---

It's the launch of a new series today - Unity Tips! Whenever I need to do something in Unity, there are plenty of places I could go with high-quality information - but I also see a lot of misinformation, or instances where quality content is spread around, and I'd like there to be more resources that consolidate information into a single location. That's what Unity Tips is for - each article will be a substantial look at some portion of Unity. Of course, it will always be impossible to capture every tidbit of information on every topic - but I've done my best to research the key points. 

With that out of the way, I'd also like to mention that this series will release fortnightly, with articles being available to my $5 Patreon supporters two weeks early. $1+ supporters will get access to a PDF version of artciles at the same time they are published on this site. If you can spare a little each month, I would hugely appreciate your support and I'm looking into ways to expand the Patreon and this site in the future!

{: .box-warning}
This article was available to [$5+ Patreon supporters](https://www.patreon.com/bePatron?u=1011297) two weeks early.

<hr/>

Garbage Collection is a process used by several programming languages and software tools to clean up portions of memory that are no longer being used by the application. Without a garbage collector, these programs will be unable to allocate new variables and objects because old, unused data will be taking up all the allotted memory – before long, the program will crash. But garbage collection can also be a slow process and may result in CPU spikes; there are several common operations in Unity that are deceptively heavy on the garbage collector. This article will explain how memory is managed by Unity, look at why garbage collection can be slow and explore methods for minimising GC calls.

<hr/>

# Memory Management in Unity

## Heap memory

When persistent resources are created at runtime in C# - be it strings, objects or collections intended to last between function calls – they are stored in `heap memory`. It’s the alternative to `stack memory`, which is used to store temporary variables during function call execution; the `stack` is a last-in-first-out structure, so each time a function call is invoked it reserves a block of data at the top of the stack, which becomes free when the function returns. Any functions called within that function put their data on top of it on the stack, so that the currently executing function’s data is always at the top of the stack. On the other hand, `heap memory` has no inherent structure, since there is no temporal relation between blocks of data on the heap; any block could be freed at any time. For more information, there are tons of explanations on this topic, such as [this StackOverflow page](https://stackoverflow.com/questions/79923/what-and-where-are-the-stack-and-heap).

## The Garbage Collector

A garbage collector operates on heap memory. In languages without garbage collection (GC), a programmer must manually free memory that is no longer in use – if you’ve heard of `memory leaks`, those occur when memory no longer in use is erroneously left un-freed. GC handles this process for us by keeping track of which memory is still in use then releasing blocks when they become unused. GC in Unity pauses the execution of all your program code until it has finished all its work. This is known as a `stop-the-world` garbage collector, which is great for software with a lot of downtime between user actions, but for games targeting at least 60 frames per second (fps) excessive GC can cause such significant CPU spikes that frames are dropped and the game stutters briefly. That’s obviously not ideal because a player might feel the game is not running smoothly. Microsoft provides [more details on how GC works](https://docs.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals) in `.NET` languages such as `C#`.

GC could be triggered via explicit function call in your code or implicitly by the memory manager whenever the system is running low on memory or the memory usage of your program has reached some threshold. From our perspective as game designers, we can consider the garbage collector to be a black box that could be invoked at a time outside our control, so we will concentrate on identifying actions that generate erroneous `garbage` – that is, they needlessly `allocate` and `free` blocks on the heap.

<hr/>

# Garbage-generating Actions

## String Concatenation

This is the poster child for innocent-looking actions that secretly enjoy flaying the garbage collector. String concatenation in `C#` involves using the `+` operator on two `string` objects to create a brand-new `string` object on the heap.

~~~csharp
string newString = "Hello, " + "world!";
~~~

Due to the way C# treats `objects` and `references`, even if this string is a temporary variable inside a function, the string `“Hello, world!”` is stored on the heap, and the variable `newString` is created on the stack and `references` the string data. One heap allocation isn’t so bad, but in Unity you might have code to update a UI Text element each frame.

~~~csharp
private void Update()
{
    string enemyString = "There are " + enemiesLeft.ToString() + " enemies left.";
    enemiesText.text = enemyString;
}
~~~

Let’s step through what’s happening here. Each frame, a new `enemyString` string object is created on the heap. To obtain that value, the strings `“There are ”`, `“ enemies left.”` and a string representing the value of `enemiesLeft.ToString()` are individually created on the heap, too. For the sake of argument, let’s say the `enemiesLeft` string is equal to `“5”`. The final string `“There are 5 enemies left.”` is also allocated on the heap – that’s four allocations each frame!

The C# compiler automatically optimises certain string concatenation operations for us. Without those optimisations, the code above would generate five strings because it would have to perform both concatenations separately – `“There are 5”` would exist on the heap too. However, the compiler can combine up to four multiple-concatenated strings into a call to the `String.Concat()` method which performs concatenations in-place for us. From the [Microsoft documentation](https://docs.microsoft.com/en-us/dotnet/api/system.string.concat?view=netframework-4.8): 

{: .box-note}
“You can also use your language's string concatenation operator … compilers translate the concatenation operator into a call to one of the overloads of String.Concat.”

Once you concatenate more than 4 strings inline, the compiler will need to perform multiple `String.Concat` steps. Plus, it won’t work for loops that incrementally build up a string from smaller strings.

~~~csharp
public string GetPositionString(float[] positions)
{
    string positionString = "Positions are: " + positions[0];

    for(int i = 1; i < positions.Length; ++i)
    {
        positionString += ", " + positions[i].ToString();
    }

    return positionString;
}
~~~

Those strings are especially heavy on heap memory, because each loop iteration creates string objects for each part of the concatenation operation, plus the result.

## Sensible Strings

To avoid this excessive garbage collection, there are several strategies. The first option is to move logic outside of `Update()`. In many circumstances, the string should be recalculated only when a state change is detected – in this case, the UI text element should only be updated when the enemy count is changed somehow.

~~~csharp
public void ChangeEnemyCount(int change)
{
    enemiesLeft += change;

    string enemyString = "There are " + enemiesLeft.ToString() + " enemies left.";
    enemiesText.text = enemyString;
}
~~~

This is a good start – we no longer produce garbage each frame, unless `ChangeEnemyCount()` is called each frame – but that’s unlikely. This is good practice when you want to reduce heap allocations (while also reducing CPU time each frame).

When you are incrementally building a string in a loop, we can adopt another strategy. Whereas string concatenation in `Update()` creates a constant stream of garbage, calling a function that involves a string loop generates a lot of garbage all at once. Thankfully, there is a utility called `StringBuilder` that optimises this process – it incurs some overhead so it’s best-used when the number of concatenated strings is large (say, above 9 or 10), but you should profile your program to determine whether this approach is best for you.

~~~csharp
public string GetPositionString(float[] positions)
{
    var sb = new System.Text.StringBuilder();

    for(int i = 1; i < positions.Length; ++i)
    {
        sb.Append(", " + positions[i].ToString());
    }

    return sb.ToString();
}
~~~

Strings are `immutable` in C#. That means the contents of a `string` cannot be modified once it is in memory and that’s why, so far, each new string has allocated brand-new heap memory. On the other hand, `StringBuilder` reserves a buffer in memory and modifies its contents in-place, so it is a `mutable` string. There’s overhead involved with reserving a bulk of memory, but without `StringBuilder` a new string would be allocated on the heap every iteration the size of the entire built string at that stage – the overall usage with `StringBuilder` is vastly reduced for big loops.

<hr/>

# Object Instantiation and Destruction

A common pattern in games is to create or spawn objects such as enemies or collectibles, keep them alive for some amount of time, then destroy them when they are no longer needed. In Unity, the `Instantiate()` method is used for spawning copies of a `GameObject`, and `Destroy()` is used to remove those copies from the game. As you’ve probably worked out, `Instantiate` allocates memory resources to bring the object into the game and `Destroy` removes them from memory – if you’ve got a game that relies on these functions to create and delete bullets sprayed from a machine gun, I’m sure you can see why GC becomes a huge issue.

~~~csharp
private void SpawnBullet(Vector3 pos, Quaternion rot)
{
    var newBullet = Instantiate(bulletPrefab, pos, rot);

    // Do other things with newBullet here...
}
~~~

~~~csharp
// This function is called when the bullet collides.
private void DeleteBullet()
{
    Destroy(gameObject);
}
~~~

In this example, the upper function exists on some object like a gun, and the lower function exists on the bullets fired by that gun. This example is especially heinous because it results in a lot of `memory fragmentation`. Deleted items can leave a ‘hole’ in memory if the objects either side of it are not also deleted. Because memory for each object is allocated by finding the first `contiguous` block large enough to hold the object data, the next time a large object needs allocating it would skip over that too-small gap and find somewhere later on in memory – this is known as `fragmentation`. Unity’s garbage collector does not compact memory to fill those gaps. A [more full description](https://docs.unity3d.com/Manual/BestPracticeUnderstandingPerformanceInUnity4-1.html) of Unity’s garbage collector can be found in the Unity Manual.

## Lighter Life-cycles

We’ll fix the fragmentation problem by reducing reliance on runtime calls to `Instantiate` and `Destroy`, opting instead to front-load all Instantiate calls and rely on automatic deletion when a scene is destroyed. This has the added benefit of reducing CPU time creating objects. We shall achieve this with a basic `object pool`.

The idea behind an object pool is to `Instantiate` all your objects during scene construction and `deactivate` them. They’ll take up a large contiguous block of memory and front-load the total CPU hit for instantiation. Then, whenever you would ordinarily use `Instantiate` to create an object, instead you `activate` one of those pooled objects. Treat it as you usually would until it should be `Destroy`ed – at which point, `deactivate` it instead and allow it to be recycled whenever another object is requested. This has multiple benefits. The CPU overhead of activating and deactivating objects is less than that of creating and deleting them, and we’ve removed the major garbage collection issue – memory no longer needs to be freed until the scene terminates so we no longer suffer those memory fragmentation issues.

~~~csharp
using UnityEngine;

public class Pool : MonoBehaviour
{
    [SerializeField]
    private GameObject prefab;

    private GameObject[] pool;

    private void Awake()
    {
        pool = new GameObject[50];

        for(int i = 0; i < pool.Length; ++i)
        {
            var newPrefab = Instantiate(prefab);
            newPrefab.SetActive(false);
            pool[i] = newPrefab;
        }
    }

    public GameObject GetObject()
    {
        for(int i = 0; i < pool.Length; ++i)
        {
            if(pool[i].activeSelf == false)
            {
                return pool[i];
            }
        }

        return null;
    }
}
~~~

This code provides a possible implementation of an object pool. It’s not fancy – you could certainly add more advanced behaviour – but it’ll do the job. Any code to deactivate the object would be written on a component on that object.

The pool should be created with enough objects to cover the ‘worst case’ maximum number of objects that might co-exist in the scene. If the game requests an object from the pool and none are inactive, there are two options: don’t spawn an object, or extend the pool. In cases such as a particle system, it might be preferable to stop spawning objects because they’re not crucial to gameplay. For something like spawning enemies, it might be acceptable to perform a one-off `Instantiate/Destroy` and rely on GC for clean-up, or you might opt to extend the pool by creating an ‘overflow’ pool.

<hr/>

# Finding Components and GameObjects

Finally, we shall look at functions provided by the Unity API to find `GameObjects` in the hierarchy or Components attached to an object – functions like these:

- `GameObject.Find`: find an object in the hierarchy based on its name;
- `GameObject.FindWithTag`: find an object in the hierarchy with the provided tag;
- `GameObject.GetComponent`: find a `Component` of a specified type attached to some object;
- `GameObject.GetComponentInChildren`: find a `Component` attached to the children of an object.

There are a handful more of these functions, some of which return lists of results. Let’s step through one of them, look at what garbage is generated and explore strategies for reducing that garbage.

## GetComponent

When you call `GetComponent` on an object, Unity internally creates a list of the components on your object before iterating through the list to grab the one you requested. That list needs to be cleared from memory afterwards – it’s garbage. This function might be used in a program whenever you need quick access to, say, the `Renderer` component. Imagine if you needed access every frame – you might be tempted to use `GetComponent` in the `Update` loop.

~~~csharp
private void Update()
{
    var renderer = GetComponent<Renderer>();

    // Do something with the renderer here...
}
~~~

This would generate garbage each frame. Instead, we know that the `Renderer` is unlikely to change – the `Renderer` component available during `Awake` is probably going to be the same `Renderer` we’re accessing each frame. We can cache the reference to the `Renderer` component in a variable instead. For some built-in Unity components, you must use the `new` keyword to hide deprecated member variables if you decide to use the same variable name – `renderer` is one of those variables.

~~~csharp
private new Renderer renderer;

private void Awake()
{
    renderer = GetComponent<Renderer>();
}

private void Update()
{
   // Do something with the renderer here...
}
~~~

With this solution, the GC hit is absorbed in `Awake`. If you’d like to optimise any of the other functions, follow the same pattern of caching references to the results and avoiding usage inside `Update`. Even for use cases where it’s not possible to cache once in `Awake`, it’s usually possible to use find functions when some event occurs in the game rather than every frame or to manage a cached list of objects manually and make the list accessible to other classes. You could use the [Singleton design pattern](http://gameprogrammingpatterns.com/singleton.html) but be mindful of its limitations.

<hr/>

# Incremental Garbage Collection

A new experimental feature in Unity runs the garbage collector in Incremental Mode, splitting up the GC process over several frames. One of the big issues in a demanding realtime application like a game is that the GC spike could last long enough to cause a frame drop, so one of the best mitigation strategies is to perform manual GC calls outside of normal gameplay so the player does not notice. Incremental GC goes a step further and smooths out the spikes over a few frames. There is extra overhead due to the way the work needs to be split, but the trade-off would probably be worth it if no frames are dropped. You can read more about this experimental feature on the [Unity Blog](https://blogs.unity3d.com/2018/11/26/feature-preview-incremental-garbage-collection/).

<hr/>

# Coming Up

The next article in this series, which will be published on August 19th, will be about Coroutines! It is already available in PDF format for $5 Patreon backers.

<hr/>

# Acknowledgements

[This content was a timed exclusive for my Patreon $5+ backers](https://www.patreon.com/danielilett). I’d like to thank my $5 and $20 tier backers for making this content possible!

## $20 Backers

Special thanks to my $20 backers:

- Gemma Louise Ilett

<hr/>
