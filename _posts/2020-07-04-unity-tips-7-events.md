---
layout: post
title: Unity Tips | Part 7 - Events and Messaging
subtitle: How to build an eventful messaging system
bigimg: /img/unity-tips/part7-bigimg.jpg
hdrimg: /img/unity-tips/part7-banner.jpg
tags: [unity, unity-tips, events]
nice-slug: Events
date: 2020-07-04
idnum: 51

part-label: 7
series-name: Unity Tips
---

Communication is key. In all aspects of life, problems can often be solved quicker through slick communication between people than raw individual brainpower alone. When making games, you'll encounter problems which are best solved by maintaining strong separation between the components involved and providing a robust way to send data between them. In this article, we'll look at messaging and event systems in Unity, discuss why they're important, and develop smarter ways to send data between objects.

<hr/>

# The Basics

My favourite programming book, hands-down, is *[Game Programming Patterns](https://gameprogrammingpatterns.com/contents.html)* by Bob Nystrom, and it's available for free online. When I started to program games in Unity, there's a certain amount of organisational discipline enforced by Unity's component structure, but I still ended up with monolith classes which invariably contained the word `Manager` or `Controller` somewhere in the name. This book details many strategies for splitting up classes and decoupling parts of the code from each other - one of those is called the [Observer](https://gameprogrammingpatterns.com/observer.html) design pattern.

This pattern exists to replace direct function calls with a system where **observers** (a class which wishes to receive messages) *subscribe* to a **subject** (the class sending the messages). In this pattern, a subject doesn't know any details about who is subscribing to it - it just maintains a list of some `Observer` type or similar. This is good because the subject can send the same message to any number of observers, and those observers can implement custom event-processing behaviour on their end. Without this pattern, the event-processing logic occurs on the subject's end, which strongly couples together the subject and all its observers. We'll go into more detail about this pattern later.

<hr/>

# Unity SendMessage

Unity has a built-in method which iterates through all components on a `GameObject` and invokes all instances of a particular method. The [SendMessage](https://docs.unity3d.com/ScriptReference/GameObject.SendMessage.html) method takes the name of the function to invoke as a `string` parameter, alongside an optional parameter of type `object` to be used for sending arbitrary data with the message, and a third parameter to control how the messaging system behaves. Here's a simple example.

~~~csharp
public GameObject attackTarget;

private void Attack()
{
    attackTarget.SendMessage("TakeDamage", 10.0f);
}
~~~

Whenever the `Attack` method is called, Unity will look at the components attached to the `attackTarget` `GameObject`, attempt to find a method called `TakeDamage` accepting a single `float` as a parameter on each object, and if one exists, invoke (i.e. call) it. The third parameter, which isn't included here, is an `enum` called `SendMessageOptions` with two possible values - `RequireReceiver` and `DontRequireReceiver`. When `RequireReceiver` is used - the default behaviour - the receiving `GameObject` must have a component attached with a matching method, else an error is logged to the console.

There are two similar variations with the same parameters as `SendMessage`. Where `SendMessage` only invokes the method on the singular `GameObject` it is called on, `SendMessageUpwards` also send the message to its parent, and its parent's parent, and so on; `BroadcastMessage` sends the message to the `GameObject` plus all its children recursively.

Why is `SendMessage` useful? Well, it's easy to understand. You need a message sent somewhere? Just send it! From a "fire-and-forget" perspective, there's little effort required on the part of the programmer because there's no need to iterate through the list of components, or through parents and children, to send a whole heap of messages - just make sure the method names and parameters match and you're good. If one extra data variable seems restrictive, then don't fret - since it extends `object` you can send anything, including custom `struct` data wrappers.

~~~csharp
private void Attack()
{
    var thing = new Thing();
    attackTarget.SendMessage("TakeDamage", thing);
}

struct Thing
{
    public float stuff;
    public Quaternion rotation;
}
~~~

However, it isn't without drawbacks. `SendMessage` and its variants all need to search through a potentially huge list of components to find those that contain a matching method, introducing significant amounts of overhead. Worse still, because they use strings for method names, they use **reflection** to identify matching methods. In this context, [reflection](https://en.wikipedia.org/wiki/Reflection_(computer_programming)) is the ability to interact with and modify the type system at runtime - but invoking methods through reflection is slower than calling a method in the normal way. That's fine if you're using reflection once or twice, but if you're frequently using `SendMessage` then those small performance hits add up. Not only that, but because all of this is happening at runtime, there's no compile-time error checking at all. That makes it easier for small mistakes like typos in the method name take ages to debug.

Another huge drawback comes courtesy of another feature of reflection: you can call private methods on other objects. In the following scenario, where one object contains this code:

~~~csharp
public GameObject attackTarget;

private void Start()
{
    attackTarget.SendMessage("SuperPrivateMethod");
}
~~~

and a second object contains this code:

~~~csharp
private void SuperPrivateMethod()
{
    Debug.Log("My bank details are: [redacted]");
}
~~~

then the private method on the second object will be called, and privacy is a thing of the past.

A key potential issue with the architecture that we've set up is that we've coupled together the subject (the `GameObject` sending the message) with the object it's sending a message to. In some scenarios, this is fine. Picture two objects, where one has a trigger collider and contains a script intended to send a 'hit' message to the other. They might get away with the following methods:

~~~csharp
// Sender
private void OnTriggerEnter(Collider other)
{
    other.SendMessage("GetHit", SendMessageOptions.DontRequireReceiver);
}
~~~

~~~csharp
// Receiver
public void GetHit()
{
    Debug.Log("I'm hit!");
}
~~~

In this example, an **observer** pattern doesn't make much sense - that would mean all objects capable of being hit need to subscribe to all objects that could hit them. The sender would still need to know which object it hit anyway, so that all other subscribers can ignore the message since they're not being hit. However, an alternative scenario sees an object updating some UI element when it is hit, such as a health bar. Here, the health bar is just watching the health value of the first object and will spring into action when it changes, but the object shouldn't need to know that. The object ought to broadcast some message to the wider world mentioning its health has changed without worrying who is listening. That's where **events** come in.

<hr/>

# C# Events

In *Game Programming Patterns*, the **Observer** chapter opens by mentioning that C# bakes the pattern right into the language through the `event` keyword. If you needed any indication that Observer is an important design pattern, that's it. Due to some heavy terminology, C# events can be a bit tricky to get used to if you've never used them before, so we'll start with basic examples and work our way up.

A **subject** - or **publisher** as the C# documentation calls it - declares an event. You declare them kind of like a variable - it looks something like this:

~~~csharp
public event EventHandler HealthChangedEvent;
~~~

Let's take this apart word by word. The `public` keyword is self-explanatory - you can also use other access modifiers like `private` or `protected`, which work as you'd expect here. If it's `private`, for example, then other objects won't be able to subscribe to this event. The `event` keyword comes next and, as expected, tells C# that this is an **event** which can be invoked. The next thing, which in this case is `EventHandler`, is a `delegate` method - it's basically a stand-in that says "any subscribers must subscribe using a method with the same parameter list and return type as me". It's difficult to appreciate what's happening here without seeing examples, so rest assured I'll go into more detail later. Just remember that in the most basic case, you'll probably write `EventHandler` here. The final word is the event's name, which in our case is `HealthChangedEvent`. The `EventHandler` type is contained in the `System` namespace, so make sure you're `using` it. 

A publisher is responsible for invoking the event whenever it wants. In our scenario, we want to raise an event whenever a health variable changes. We do this using the `Invoke` method. For the example, pretend the publisher has some other method which calls `OnGetHit` at the appropriate time.

~~~csharp
private int health = 100;

public event EventHandler HealthChangedEvent;

private void OnGetHit(int damage)
{
    health -= damage;
    HealthChangedEvent?.Invoke(this, EventArgs.Empty);
}
~~~

See the `?.` operator? That's the **null-conditional member access operator**, which is an unnecessarily long name for "if not null"; if nobody has subscribed to the event, this `null` check will fail and the event will not fire. The `Invoke` method takes the same parameters as the event delegate - in our case, this is `EventHandler`, which has an `(object sender, EventArgs e)` signature. Usually, the `sender` will be the publisher, so we can just use `this`, and `EventArgs` is a base type for additional data. For now, we're including no extra data so we can use `EventArgs.Empty`. 

That's the publisher sorted out. What about the subscribers? Well, to start off, the subscribers need access to the publisher, at least temporarily. Usually, a publisher-subscriber relationship is one-to-many, so the publisher should be easy to access - we'll pretend the subscribers already have access in our magical code black box, but in practice you could read up on the [Service Locator](https://gameprogrammingpatterns.com/service-locator.html) design pattern (*Game Programming Patterns* comes to my rescue yet again). This is the inverse of the situation we had when using `SendMessage`, where the message-sender needed a reference to the message-receiver. To receive events, a subscribing object needs a method with the same signature (except the method name) as the delegate.

~~~csharp
private float healthBarLevel = 100;

private void UpdateHealthBar(object sender, EventArgs e)
{
    // Update health bar here!
}
~~~

The subscriber needs to **subscribe** to the publisher's event. This is handled using the `+=` operator, where the thing being "added" is the name of the method we just wrote. You can add several subscribers in this manner - those subscribers could be different instances of the same type as this one, or a mix of other types which have a method which matches the delegate, or you can even define a method on the publisher and subscribe it to its own event. Note that we're still using a `private` method, but since this class is responsible for subscribing its own methods, it's a far cry from the `SendMessage` approach which could raid another class through reflection. Assume we got the `publisher` reference by magic elsewhere:

~~~csharp
private void Start()
{
    publisher.HealthChangedEvent += UpdateHealthBar;
}
~~~

I love the semantics of using this operator to mean "add this method to the event subscriber list". Similar semantics are used when unsubscribing from an event - use the `-=` operator.

~~~csharp
private void OnDestroy()
{
    publisher.HealthChangedEvent -= UpdateHealthBar;
}
~~~

Basic events are as easy as that! However, you probably noticed we didn't send any useful data to the subscribers. Let's look at two ways to send extra data - the "custom delegate" way and the "custom `EventArgs`" way.

## Custom delegates

Typically, this isn't the way you'll pass custom data through events (or at least, it's [not the way recommended by the C# docs](https://docs.microsoft.com/en-us/dotnet/standard/events/)), but I think it's worth discussing how delegates work in a bit more detail. The problem we faced was that a basic `EventHandler` and basic `EventArgs` were unable to contain custom data, and one solution is to use a **custom delegate** to replace `EventHandler`. Let's discard `EventArgs` completely.

~~~csharp
public delegate void HealthChangedEventHandler(int health);
public event HealthChangedEventHandler HealthChangedEvent;

private void OnGetHit(int damage)
{
    health -= damage;
    HealthChangedEvent?.Invoke(health);
}
~~~

We define new delegates with the `delegate` keyword. They are defined similarly to an `abstract` method; all you need to supply is the method signature - its name, return types and parameter list. In our case, I called it `HealthChangedEventHandler` so it's clear what this is for, kept the `void` return type, and changed the `EventArgs` in the parameter list to an `int` called `health`. I also removed the `sender` variable because we weren't using it. Then, we tweak the `event` definition to use the new `HealthChangedEventHandler` instead of `EventHandler`. Finally, we change the invocation from using `EventArgs.Empty` to using the `health` value directly.

On the receiving end, we must change the subscribing method's parameter list to match the new delegate. Now that we have access to the health value, we can also do something with it in the method body.

~~~csharp
private void UpdateHealthBar(int health)
{
    healthBarLevel = health;
    Debug.Log(health);
}
~~~

The C# documentation states that scenarios requiring a custom delegate are rare, but I hope this might clarify what a delegate is, and thereby solidify your understanding of what `EventArgs` is doing in the original example. It's just a stand-in for a concrete method elsewhere in code. Now let's look the other approach.

## Custom EventArgs

To send custom data, we'll need to create a new class which derives from `EventArgs` - you can put its definition in a separate file or below an existing class. This class holds the event data in the form of member variables; we're not required to put anything else in here, but we'll add a constructor.

~~~csharp
public class HealthEventArgs : EventArgs
{
    public int health;

    public HealthEventArgs(int health)
    {
        this.health = health;
    }
}
~~~

To use `HealthEventArgs`, we need to modify the event definition. So far, we've used the regular version of `EventHandler`, but in order to swap out `EventArgs` can use the **generic** version instead. I won't go into too many details about what generics are, but if you've ever used a `List<Something>` then that's generics in action - we use a **type parameter** to specify what the `List` will hold. In our case, we can use `EventHandler<HealthEventArgs>` and C# will know that the second parameter when we invoke the event needs to be of type `HealthEventArgs` instead of the regular `EventArgs`. We'll also tweak the line where we fire the event - we'll construct a `new HealthEventArgs` and use that instead of `EventArgs.Empty`.

~~~csharp
public event EventHandler<HealthEventArgs> HealthChangedEvent;

private void OnGetHit(int damage)
{
    health -= damage;
    HealthChangedEvent?.Invoke(this, new HealthEventArgs(health));
}
~~~

We also need to modify the subscriber's method again to use `HealthEventArgs`.

~~~csharp
private void UpdateHealthBar(object sender, HealthEventArgs e)
{
    healthBarLevel = e.health;
    Debug.Log(e.health);
}
~~~

And that's how to use custom `EventArgs`. We established in the `SendMessage` section that there are problems that don't really fit the **Observer** pattern, but if you've found a problem where you can reasonably choose between normal method calls, `SendMessage` and C# events, then there are advantages of using C# events. Compared to `SendMessage`, there is no reflection so it's much faster, and we can take advantage of compile-time type checking to avoid common errors like misspelling a method name. And compared to a traditional method call, we've removed the burden on the publisher to keep a list of all the objects it needs to send messages to; it makes a lot more sense for the subscribers to locate the publisher and register themselves as a listener. With events, a wide range of different classes can become subscribers, as long as they contain a matching method - with direct method calls, all 'subscribers' would have to be the same type, or otherwise inherit a common `interface`. In my opinion, events deal with this more elegantly. The drawback is that they take a bit longer to get used to, but hopefully this tutorial goes some way to alleviating that issue.

The other major drawback of C# events is that they exist solely within code, so they are not quite as friendly for non-programmers. Luckily, C# events are not the only mechanism for event invocation in Unity.

<hr/>

# UnityEvents

One of the most powerful features of Unity is the ability to assign and modify things in the Inspector. When you create `public` variables on a script, by default they'll appear in the Inspector so that they're easy to change per instance. However, as we saw with C# events, there are some things that don't translate from code to the Editor very well. That's where `UnityEvent`s come in. A `UnityEvent` is a simplified event callback mechanism which still allows you to subscribe and unsubscribe at runtime through code, but also can be exposed to the Inspector so that designers and other non-programmers can assign subscribers in-Editor.

The base `UnityEvent` takes no parameters, like our first C# event example. The architecture is the same too. The publisher declares a `UnityEvent` and is responsible for invoking it where appropriate. The class is contained in the `UnityEngine.Events` namespace, so make sure you're `using` it.

~~~csharp
public UnityEvent healthChangedEvent;

private void OnGetHit(int damage)
{
    health -= damage;
    healthChangedEvent.Invoke();
}
~~~

On the subscriber's end, it's not too different either. If we want to subscribe via code, we'll change the lines where we subscribe and unsubscribe. Instead of using `+=` and `-=` operators, we'll use `AddListener` and `RemoveListener` methods respectively.

~~~csharp
private void Awake()
{
    publisher.healthChangedEvent.AddListener(UpdateHealthBar);
}

private void UpdateHealthBar()
{
    // Update health bar here!
}

private void OnDestroy()
{
    publisher.healthChangedEvent.RemoveListener(UpdateHealthBar);
}
~~~

So far, this is possibly a bit easier to understand than C# events because there are fewer cumbersome keywords to keep track of, but we haven't gained much else apart from that - until we check the Inspector. We're met with a window which lets us press the plus arrow to add a new object from the Hierarchy or the Project View, then add a `public` method - we'll need to make `UpdateHealthBar` `public`, then we can add it to the list. Even if we remove the `AddListener` and `RemoveListener` calls above, it's very easy to add this method as a listener.

<img data-src="/img/unity-tips/part7-unity-event-inspector.jpg" class="center-image lazyload" alt="Unity Event Inspector">

You can add as many objects and methods as you'd like to this list, and they'll all get called when the event fires. Now a programmer can set up an event framework like this, and if an extra event needs to be added or an existing one removed from the list at a later date, a designer or artist working away from the codebase can make the change themselves without needing to call upon a programmer to dive behind the scenes.

## Custom event data

Of course, we've lost the ability to pass custom data through the event. To add this back, we can add up to four type parameters to `UnityEvent` to specify what kind of data we want to send.

~~~csharp
public UnityEvent<int> healthChangedEvent;

private void OnGetHit(int damage)
{
    health -= damage;
    healthChangedEvent?.Invoke(health);
}
~~~

Then on the subscriber, we'll add back the extra parameter.

~~~csharp
private void UpdateHealthBar(int health)
{
    healthBarLevel = health;
    Debug.Log(health);
}
~~~

We can subscribe via code like before, but this isn't quite what we want yet because the event has now disappeared from the Inspector. One of the slightly more annoying parts of this approach is that `UnityEvent<int>`, or indeed any `UnityEvent<T>`, is no longer serializable, so we'll need one more step to make it show up in the Inspector again. Luckily, all we need to do is create a tiny class that derives the generic `UnityEvent<int>` and label it with `[System.Serializable]`.

~~~csharp
// Outside the publishing class definition.
[System.Serializable]
public class HealthChangedEvent : UnityEvent<int>
{

}

// Inside the publishing class.
public HealthChangedEvent healthChangedEvent;
~~~

The `HealthChangedEvent` type is essentially just a `UnityEvent<int>`, and by labelling it with the `System.Serializable` attribute, it should now appear in the Inspector again. This time, when selecting a method from the drop-down, there will be a section at the top with the heading "Dynamic int", which will list the methods which match the parameter list (in our case, a single `int`). When one of those is selected, the method will receive the value passed into the `Invoke` method.

<img data-src="/img/unity-tips/part7-unity-event-inspector-int.jpg" class="center-image lazyload" alt="Dynamic int">

The other useful feature of `UnityEvent` is that we can also add methods which *don't* match the parameter list - they will just fire normally without receiving the data passed into `Invoke`. You can add up to four parameters by using `UnityEvent<int, string>`, or `UnityEvent<float, int, bool>` and so on - just use the "extension class" trick above to make it pop up in the Inspector.

<hr/>

# Conclusion

We've seen a range of messaging and event systems which can be used in Unity and scenarios where each one might be useful, as well as use cases where they fall down. The backbone of a smoothly running game - and, crucially, an easily maintainable one - is robust communication between the different components, and hopefully with this article you'll be able to level up your game's messaging architecture.

<hr/>

# Acknowledgements

### Supporters

[Support me on Patreon](https://www.patreon.com/danielilett) or [buy me a coffee on Ko-fi](https://ko-fi.com/danielilett) for PDF versions of each article and to access certain articles early! Some tiers also get early access to my [YouTube videos](https://www.youtube.com/channel/UClgoE54W_4rX7jzZGiCmrXw) or even copies of my [asset packs](https://itch.io/c/798909/my-asset-packs)!

#### Special thanks to my Patreon backers!

<p style="text-align: center;">
Gemma Louise Ilett<br/>

Jesper Kuutti<br/>

BVR $$\cdot$$ Jack Dixon $$\cdot$$ John Selig $$\cdot$$ Pablo Ruiz<br/>

Chris Sims $$\cdot$$ FonzoUA $$\cdot$$ Jason Swearingen $$\cdot$$ Moishi Rand $$\cdot$$ Shaun Wall $$\cdot$$ Udons<br/>

Anna Voronova $$\cdot$$ Gabriella Pimenta $$\cdot$$ James Poole $$\cdot$$ Christopher Pereira $$\cdot$$ Zachary Alstadt
</p>

#### And a shout-out to my top Ko-fi supporters!

<p style="text-align: center;">
Hung Hoang $$\cdot$$ Takuya $$\cdot$$ Mysterious Anonymous Person
</p>

<hr/>
