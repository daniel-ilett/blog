---
layout: post
title: Unity Tips | Part 2 - Coroutines
subtitle: Suspend execution over multiple frames
bigimg: /img/unity-tips/part2-banner.jpg
tags: [unity, unity-tips, coroutines, concurrency]
nice-slug: Coroutines
date: 2019-08-20
idnum: 19

part-label: 2
series-name: Unity Tips
---

Coroutines are special types of function that do not need to complete execution in a single frame. Using the `yield` keyword, they can suspend their operation at any point until the next frame or until a few seconds have elapsed. However, unlike threading, they are a lightweight way of performing asynchronous tasks. In this article we’ll explore a few ways of using coroutines in Unity.

{: .box-warning}
This article was available to [$5+ Patreon supporters](https://www.patreon.com/bePatron?u=1011297) two weeks early.

Also check out a newer video about Coroutines over on YouTube:

<div class="video-embed">
<iframe src="https://www.youtube.com/embed/hp-8TgTmkTI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="center-image lazyload"></iframe>
</div>

<hr/>

# Writing Coroutines

It’s possible to perform tasks over several frames by doing a little bit of the work each `Update` loop, but you’d have to store intermediate data inside a member variable or struct – it’d be very cumbersome. You might decide instead to set up a thread to do the concurrent work, but that’s very heavy-handed for most tasks and you must deal with thread-safety. Not only that but most of the Unity API is not thread-safe in the first place.

A coroutine is a Unity-specific feature that allows us to suspend execution for this frame and specify when execution should begin again. To use a function as a coroutine, it needs to have a specific return type – `IEnumerator` – and at least one suspension point within the function.

~~~csharp
private IEnumerator DoTask()
{
    yield return null;
}
~~~

Ordinarily, a `return` statement would stop function execution completely and return control to the part of the code that called the function. In this example, we `yield` control to the part of code that called this coroutine, but control will be returned to the coroutine later. Returning `null` means that execution will resume next frame. To run a coroutine function, you can’t call it like a normal function – you must use the `StartCoroutine` function.

~~~csharp
var routine = StartCoroutine(DoTask());
~~~

As you can see, the coroutine itself can be stored in a variable. Its type is `Coroutine`. By saving it in a member variable, we could access it somewhere else in the code in order to halt its execution – we use `StopCoroutine` for this.

~~~csharp
StopCoroutine(routine);
~~~

If we wish to stop executing every `Coroutine` started on this `MonoBehaviour`, then we may use the `StopAllCoroutines` function.

~~~csharp
StopAllCoroutines();
~~~

Now we’ve seen the basics of how to create, start and stop a coroutine, let’s look at some use cases.

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

## Controlling a loop

We can use coroutines to split executions of a loop over a few frames. For example, if we wish to use a Lerp function to control the position of an object over time, we may use a `Coroutine` together with `yield return null`.

~~~csharp
private IEnumerator DoTask()
{
    float startXPos = 3.0f;
    float endXPos = 10.0f;

    Vector3 position;

    for (float t = 0.0f; t < 5.0f; t += Time.deltaTime)
    {
        position = transform.position;
        position.x = Mathf.Lerp(startXPos, endXPos, t / 5.0f);
        transform.position = position;

        yield return null;
    }

    position = transform.position;
    position.x = endXPos;
    transform.position = position;
}
~~~

The inside of the loop executes until 5 seconds have elapsed because the loop counter is incremented by `Time.deltaTime` each frame. After the loop finishes, a few extra lines are added to set the desired object position in case the loop timer under-shoots slightly. This is a common idiom for animating values in code in Unity.

## Adding a delay

There are many ways of adding a delay before carrying out a function in Unity. One such method is the `Invoke` function.

~~~csharp
private void Start()
{
    Invoke("MyFunc", 5.0f);
}

private void MyFunc()
{
    // Do something here
}
~~~

In this case, we may use `Invoke` to call `MyFunc` with a delay of 5 seconds. However, this can’t be used to call functions with parameters. For that, we should instead use a coroutine and `yield` on a `WaitForSeconds` enumerator within the coroutine.

~~~csharp
private void Start()
{
    StartCoroutine(MyFunc2(1, 5.0f));
}

private IEnumerator MyFunc2(int param1, float waitTime)
{
    yield return new WaitForSeconds(waitTime);
}
~~~

An extra benefit of using a coroutine with `WaitForSeconds` over an `Invoke` is that `WaitForSeconds` is affected by changes to `Time.timeScale`, while `Invoke` is not. If you wish to use a coroutine that is not affected by the time scale, Unity supplies `WaitForSecondsRealtime` as an alternative. `WaitForSeconds` is a class, so we create an instance using the `new` keyword; this means we can assign `WaitForSeconds` instances to a variable and reuse them in cases where the delay time is constant. This avoids creating excess `garbage`, especially in the case where a `yield` is used within a loop; garbage collection was discussed in the previous Unity Tips article.

~~~csharp
private WaitForSeconds waitFiveSeconds = new WaitForSeconds(5.0f);

private void Start()
{
    StartCoroutine(MyFunc2(1, 5.0f));
}

private IEnumerator MyFunc2(int param1, float waitTime)
{
    yield return waitFiveSeconds;
}
~~~

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

## Coroutine chaining

It’s possible to `yield` one coroutine in order to wait for another to execute and exit. Classes such as `WaitForSeconds` inherit from a class called `YieldInstruction`, which in turn inherits from `IEnumerator` – the same as the return type of all coroutines. That’s useful, because we can use a call to `StartCoroutine` in place of a `YieldInstruction`.

~~~csharp
private WaitForSeconds waitFiveSeconds = new WaitForSeconds(5.0f);

private void Start()
{
    StartCoroutine(MyFunc1());
}

private IEnumerator MyFunc1()
{
    Debug.Log("MyFunc1: started.");
    yield return StartCoroutine(MyFunc2(1, 5.0f));
    Debug.Log("MyFunc1: finished MyFunc2.");
    yield return waitFiveSeconds;
    Debug.Log("MyFunc1: waited 5 seconds.");
}

private IEnumerator MyFunc2(int param1, float waitTime)
{
    Debug.Log("MyFunc2: started.");
    yield return waitFiveSeconds;
    Debug.Log("MyFunc2: waited 5 seconds.");
}
~~~

This also demonstrates the usage of more than one `yield` statement in series. When the `Start` function executes normally, it starts the `MyFunc1` coroutine. After logging a debug message, it yields on the `MyFunc2` coroutine, which then halts for 5 seconds before exiting as normal. When it exits, function execution resumes on `MyFunc1` at the point where it yielded on `MyFunc2` – it waits a further 5 seconds before it exits itself. Running this code and looking at the console log would confirm the order of operations.

## Unity callbacks as Coroutines

So far, you’ll have seen Unity callback message functions such as `Start`, `Awake` or `Update` have a `void` return type – under normal circumstances, they all do. Some – not all – of them can have a return type of `IEnumerator`; if they do, Unity will automatically call them as a coroutine. That means we can use `yield` statements directly in those functions instead of starting separate coroutines. In previous examples, I’ve shown how to start a coroutine that waits five seconds from the `Start` function, but we can roll the functionality directly into `Start` itself.

~~~csharp
private WaitForSeconds waitFiveSeconds = new WaitForSeconds(5.0f);

private IEnumerator Start()
{
    yield return waitFiveSeconds;
}
~~~

Functions tied to an update loop of any kind typically can’t be labelled as coroutines – that includes `Update`, `FixedUpdate`, `LateUpdate` and `OnGUI`. Nor can `Awake` or `OnEnable` become coroutines, or `OnDisable`, or `OnDestroy`. However, many functions not tied to the object’s lifecycle, such as `OnCollisionXXX`, `OnTriggerXXX` or `OnMouseXXX`, can return an `IEnumerator`. Check the `Messages` subsection of the [`MonoBehaviour` Scripting API](https://docs.unity3d.com/ScriptReference/MonoBehaviour.html) if you’re unsure whether a function can be a coroutine.

It’s best practice to use `Start` for initialising an instance of a class, so this functionality is great when your initialisation requires a few frames. Outside of setup, you’d be best off using `StartCoroutine` inside a `void`-returning `Start` function to maintain code readability. The same goes for other callbacks – use coroutines wisely!

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

## Creating a fixed update loop

Unity comes with several update loops. `Update` and `LateUpdate` both happen once per frame and are dependent on the framerate, and `FixedUpdate` runs just before the internal physics update and attempts to run with a fixed interval between calls – it could run more than once per frame. 

Unity callbacks have a defined order of operations, as seen on the [Unity Order of Event Functions flowchart](https://docs.unity3d.com/uploads/Main/monobehaviour_flowchart.svg). It’s best to keep physics-based operations in `FixedUpdate` and input-reading in `Update` for that reason – a program designed with those guidelines synchronises well with Unity’s internal physics update and input-checking – but what if we wanted to run some code at a regular interval, without running each and every frame and not tied to `FixedUpdate`?

Looking at the diagram, there is a defined point at which control returns to a coroutine based on the type of `YieldInstruction` it uses; most are right after `Update`. If we had expensive code that only needs to update every second or so, we could check a timer each `Update`, but this bloats up the `Update` loop and makes the code harder to read; alternatively, we can set up our own coroutine-based update loop and decouple it from the regular `Update` function.

~~~csharp
private void Start()
{
    StartCoroutine(UpdateEachSecond());
}

private IEnumerator UpdateEachSecond()
{
    var wait = new WaitForSecondsRealtime(1.0f);

    while(true)
    {
        // Do expensive operations here.

        yield return wait;
    }
}
~~~

This is a great demonstration of where you would use `WaitForSecondsRealtime` over `WaitForSeconds` – we don’t want the loop to be influenced by `Time.timeScale` changing. Strictly speaking, this may not provide exactly the desired behaviour; `Update` automatically stops executing on inactive objects, but coroutines do not. If we must ensure the coroutine stops running, we could start it when `OnEnable` is triggered instead of on `Start` and stop it when `OnDisable` is called.

~~~csharp
private Coroutine updateEachSecond;

private void OnEnable()
{
    updateEachSecond = StartCoroutine(UpdateEachSecond());
}

private void OnDisable()
{
    StopCoroutine(updateEachSecond);
    updateEachSecond = null;
}

private IEnumerator UpdateEachSecond()
{
    var wait = new WaitForSecondsRealtime(1.0f);

    while(true)
    {
        // Do expensive operations here.

        yield return wait;
    }
}
~~~

If the object is not frequently disabled and reenabled, this technique would be adequate. But beware – when `OnDisable` is called and the old coroutine is no longer needed, it will be marked for de-allocation by the memory manager and incur a garbage collection penalty. If this happens frequently, some other solution should be used. 

## Waiting for a download

If your game needs to download data from the internet, you wouldn’t want to stall until the download has finished. Thankfully, Unity provides a way of sending a web request and yielding on a coroutine until the download has completed.

~~~csharp
private IEnumerator WaitForDownload(string url)
{
    var request = UnityWebRequest.Get(url);

    yield return request.SendWebRequest();

    // Do something when the server returns data.
}
~~~

The `UnityWebRequest` class provides an easy way to communicate via HTTP over the internet. The class resides in the `UnityEngine.Networking` namespace, so you’ll have to tell Unity you’re `using` it. The `SendWebRequest` function returns a special type of `AsyncOperation`, which itself inherits `YieldInstruction` – that means it can be yielded on. This is most useful if you need to download, say, entries on a leaderboard to display in-game – realtime communication between players would be completely infeasible using this method. For more information on how to use the data returned by the request, check the [Unity documentation](https://docs.unity3d.com/ScriptReference/Networking.UnityWebRequest.Get.html).

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

# Custom YieldInstructions

This class inherits `YieldInstruction`. The idea behind this class is to expose only one property – `keepWaiting` – which, when it becomes false, makes any coroutine yielding on this instruction continue its execution. We define our own class extending `CustomYieldInstruction` and modify the value of `keepWaiting` in any way we wish. We could create a `YieldInstruction` that waits until a random number passes a threshold; the value of `keepWaiting` is polled every frame between `Update` and `LateUpdate` so we can implement some behaviour in its getter.

~~~csharp
public class WaitForRandomChance : CustomYieldInstruction
{
    private float threshold = 0.0f;

    public override bool keepWaiting
    {
        get
        {
            return Random.value <= threshold;
        }
    }

    public WaitForRandomChance(float threshold)
    {
        this.threshold = threshold;
    }
}
~~~

Using this instruction, we can write a coroutine that has a 25% chance of resuming execution each frame.

~~~csharp
private IEnumerator MyFunc()
{
    yield return new WaitForRandomChance(0.25f);
}
~~~

It’s as easy as that! You could go further and run any code you wish in the `keepWaiting` getter but take care not to perform expensive checks because it will be run each frame. Another great example of when to use a `CustomYieldInstruction` is waiting for user input; the [Unity documentation](https://docs.unity3d.com/ScriptReference/CustomYieldInstruction.html) entry for `CustomYieldInstruction` gives the example of waiting for the right mouse button to be pressed, but we could extend that to any button or key input, or any mouse button.

~~~csharp
public class WaitForButtonDown : CustomYieldInstruction
{
    private string buttonName;

    public override bool keepWaiting
    {
        get
        {
            return !Input.GetButtonDown(buttonName);
        }
    }

    public WaitForButtonDown(string buttonName)
    {
        this.buttonName = buttonName;
    }
}
~~~

Even some of the newer instructions provided by Unity by default inherit from `CustomYieldInstruction`. One is `WaitForSecondsRealtime`, which we saw earlier. There are two powerful instructions – `WaitWhile` and `WaitUntil` – which accept an arbitrary Boolean delegate and return control when the Boolean becomes false or true respectively. We could replace the `WaitForButtonDown` example using `WaitUntil`.

~~~csharp
private IEnumerator MyFunc(string buttonName)
{
    yield return new WaitUntil(() => Input.GetButtonDown(buttonName));
}
~~~

A discussion about custom instructions in coroutines can be found on the [Unity Blog](https://blogs.unity3d.com/2015/12/01/custom-coroutines/).

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

# What Coroutines are NOT for

For all the benefits of coroutines, there are scenarios which are not suited to them. The most important distinction to draw is that they are NOT the same as threads. By implementing threading into your program, you split up work between different CPU cores – threading runs code in parallel, so you may move expensive operations such as AI or network communication off the main thread and maximise CPU throughput.

However, the Unity API is not thread-safe and you should call Unity-specific functions from the main thread. This is where coroutines have the edge over threading because they run on the main thread, albeit differently to regular code. But on the other hand, blocking code implemented in a coroutine still blocks the main thread, so threading would be more suitable for solving this problem.

<hr/>

# Coming Up

The next article in this series, which will be published on September 2nd, will be about Interpolation! It is already available in PDF format for $5 Patreon backers.

<hr/>

# Acknowledgements

[This content was a timed exclusive for my Patreon $5+ backers](https://www.patreon.com/danielilett). I’d like to thank my $5 and $20 tier backers for making this content possible!

## $20 Backers

Special thanks to my $20 backers:

- Gemma Louise Ilett

<hr/>
