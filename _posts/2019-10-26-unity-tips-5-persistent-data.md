---
layout: post
title: Unity Tips | Part 5 - Persistent Data
subtitle: Saving data between game sessions
bigimg: /img/unity-tips/part5-banner.jpg
tags: [unity, unity-tips, scriptable-objects, monobehaviour]
nice-slug: Persistent Data
date: 2019-10-26
idnum: 25
---

In ye olden times, games weren’t saved at all – once a session was over, you started from the beginning next time. Early “saving” systems used password entry screens to skip to certain sections of the game. But in the end, we devised ways of saving progress onto hardware. Expansion cards for consoles and hard drive space were the norm for a long time, and nowadays we have cloud-based saves that can be recovered on any device. This tutorial focuses on saving to a local disk, but in Unity, it turns out there are several ways of doing that, each with different quirks.

{: .box-warning}
This article was available to [$5+ Patreon supporters](https://www.patreon.com/bePatron?u=1011297) early.

<hr/>

# Saving with PlayerPrefs

The first approach we’ll look at is a Unity API called `PlayerPrefs`. The API was originally designed to store player preferences between game sessions, so it was designed with simple data such as game options in mind. In technical terms, `PlayerPrefs` are a set of key-value pairs, where the keys are strings (such as “health”, “audio volume”, etc) and the values are floating-point numbers, integer numbers or strings. They can store a limited amount of data types, which is adequate for small-scale use cases.

~~~csharp
private int health;

private void Load()
{
    if(PlayerPrefs.HasKey("health"))
    {
        health = PlayerPrefs.GetInt("health");
    }
}

private void Save()
{
    PlayerPrefs.SetInt("health", health);
    PlayerPrefs.Save();
}
~~~

The API defines functions for getting and setting these key-value pairs and saving them to disk. You can modify the values at runtime whenever you like then use the `Save` function to ‘commit’ them to disk. It’s very easy to understand what `PlayerPrefs` do and how to use them, so they’re great for beginners, and since they’re built right into the Unity API, they have great cross-platform support. The actual save location of the data on disk differs per platform and it’s handled for you – the file path is determined by the **Product Name** and **Company Name** fields defined in the **Player** tab inside **Project Settings**.

But they quickly fall apart when you need more than a dozen or so options. When you might have a few hundred individual things you want to keep track of, some of which might require more complex data structures than singular integers, floats or strings, you’ll need something far more robust lest you drown in a sea of key strings. How convenient would it be if we could use **structs** instead? You will also have to check if `PlayerPrefs` contains each individual key you’re reading, or risk errors.

`PlayerPrefs` are also not portable between systems. On Android, they are stored as an **.xml** file. On iOS and macOS, it’s a **.plist** file. Windows Store apps use **.dat** files, and on classic Windows, they’re stored as *registry keys*, which in my humble opinion is bonkers. Other platforms spawn even more conflicting formats – none can be interchanged like-for-like.

To wrap up `PlayerPrefs`, then, you should only use them for what the name implies: player preferences. Even then, modern games are complicated enough that you’ll want to use a more advanced method for that, too. See the [Unity documentation](https://docs.unity3d.com/ScriptReference/PlayerPrefs.html) for `PlayerPrefs` for more information.

**Advantages** | Easy to understand.
| Good for small use cases.
| Cross-platform API.
**Disadvantages** | Totally infeasible for more than a handful of variables.
| Only three supported types.
| No custom/composite type support.
| Completely non-portable save formats.

<hr/>

# Saving with Binary Serialization

**Serialization** (or, if you’re British like me, **serialisation**) is the process of transforming data into a format so that it can be easily stored or transmitted across a network. Every serialization technique has a corresponding **deserialization** process that can reconstruct the original data from the serialized data. The process is like a translator that can convert English into German and back again, perfectly.

Unity uses a custom serializer to support some of its key features. In Unity, any data stored on `MonoBehaviour` scripts on each `GameObject` are serialized the moment you enter Play Mode and are deserialized when you go back to Edit Mode – that’s why changes made while inside Play Mode do not persist when you exit. Unity can serialize a wide range of data types as listed in the documentation – primitive types, anything deriving `UnityEngine.Object` including complete `GameObjects` and `Components`, some of the basic types like `Vector2/3/4` and `Quaternions`, **structs**, **enums**, and lists or arrays of those serializable types. Any private fields marked with the `[SerializeField]` attribute or public fields will be serialized under those rules and be shown in the **Inspector** – there are more nuances in the documentation. The first gripe you’re likely to encounter with Unity’s built-in serializer is that it cannot serialize `Dictionaries`.

Where does this get us? Well, unfortunately, we can’t use Unity’s serializer to save to disk easily. I think it’s important to know what Unity does behind the scenes with regards to serialization to make it clear that serialization inside the Editor and serialization for saving on disk are two separate processes. For saving to disk, we will use the **.NET serializer**. In this context, we’re using serialization to transform an instance of a class into binary data to save directly to disk.

Let’s contrive a scenario. We have one player and several enemies, whose stats are stored in the `PlayerData` and `EnemyData` classes respectively. The singular `PlayerData` has access to a list of all `EnemyData` instances alongside its own stats. We’re throwing the concept of data hiding out of the window and making `EnemyData`’s fields **public** for simplicity.

~~~csharp
using System.Collections.Generic;
using UnityEngine;

public class PlayerData : MonoBehaviour
{
    private string playerName;
    private int level;
    private int exp;

    private List<EnemyData> enemies = new List<EnemyData>();
}
~~~

~~~csharp
using UnityEngine;

public class EnemyData : MonoBehaviour
{
    public int health;
}
~~~

The number of enemies can vary at runtime, so `PlayerPrefs` go right out of the window. Thankfully, **.NET** serialization still works properly on primitive types, lists and arrays. It also works on structs with those types of variables as members – this is the device we’ll use for our save data. Since both `EnemyData` and `PlayerData` are `MonoBehaviours`, we won’t be able to serialize them directly in this way, so we will create a new kind of **struct** with the appropriate data below the `PlayerData` class.

~~~csharp
public struct SaveData
{
    private string playerName;
    private int playerLevel;
    private int playerExp;
    private List<int> enemyHealthList;
}
~~~

This single type encapsulates all the data we want to save in the entire game. We’ll also provide a constructor in order to populate the struct members.

~~~csharp
public SaveData(string playerName, int playerLevel, int playerExp, 
    List<int> enemyHealthList)
{
    this.playerName = playerName;
    this.playerLevel = playerLevel;
    this.playerExp = playerExp;
    this.enemyHealthList = enemyHealthList;
}
~~~

We’ll create an instance of the struct from the outside in a function called `Save` on the `PlayerData` class. Let’s assume this is called at some point during gameplay (in a real-world scenario, this would probably be in a separate class).

~~~csharp
public void Save()
{
    // Create the save data structure.
    List<int> enemiesHealth = new List<int>(enemies.Count);
    foreach(var enemy in enemies)
    {
        enemiesHealth.Add(enemy.health);
    }

    SaveData saveData = new SaveData(playerName, level, exp, enemiesHealth);

    // Save the data to disk.
}
~~~

We’ve neatly packaged all the data we wish to save into a convenient package which we can now save to disk. For the first step, we are going to need to tell the **C#** serializer that we wish to serialize the struct by adding a `[System.Serializable]` attribute to the struct definition.

~~~csharp
[System.Serializable]
public struct SaveData
{
    ...
}
~~~

Now we can return to the `Save` function. We’ll need to use some built-in C# classes: `BinaryFormatter` to transform the `SaveData` into binary data and the `FileStream` class to open a file to save to. Add the following `using` statements to the top of your file.

~~~csharp
using System.Runtime.Serialization.Formatters.Binary;
using System.IO;
~~~

Now we can save the file. In Unity, the `Application.persistentFilePath` variable will give us a platform-independent way of finding a filepath related to our project’s **Product Name** and **Company Name** (like `PlayerPrefs`, but without using a Windows registry key!). Let’s see what saving looks like.

~~~csharp
// Save the data to disk.
string filepath = Application.persistentDataPath + "/save.dat";

using (FileStream file = File.Create(filepath))
{
    new BinaryFormatter().Serialize(file, saveData);
}
~~~

We start off by creating the file name and path. We’re giving the file a **.dat** file extension, but you can use anything you like here, including no extension – this just makes it clear it’s used for data. We create a file using that filepath and then we create a `BinaryFormatter` object which formats the `SaveData` we created earlier, placing it in that file. The file is closed for us automatically because we used a **using statement**.

That’s all there is to the serialization process. Now, let’s talk deserialization. It’s the same process in reverse, but we will need to cast the data into a `SaveData` object, which might cause runtime issues if the data becomes corrupted.

~~~csharp
public void Load()
{
    string filepath = Application.persistentDataPath + "/save.dat";

    using (FileStream file = File.Open(filepath, FileMode.Open))
    {
        object loadedData = new BinaryFormatter().Deserialize(file);
        SaveData saveData = (SaveData)loadedData;
    }
}
~~~

So, what do we gain from using **serialization** over `PlayerPrefs`? Firstly, we can package all the data we want to save into a single structure, making it easy to reason about. Secondly, the data is in a binary format so opening it in a text editor will likely return invalid characters as it attempts to read binary data as if it were text. These difficulties provide a small layer of protection against modification of the save file – whether this is a strength depends on the type of game.

On the other hand, it’s more difficult to detect obvious saving errors by looking at the save file. Deserializing the file might not catch an error with the saving process. And the added code complexity also makes it harder to debug than `PlayerPrefs`.

**Advantages** | Obfuscated data - protected against modification.
| Supports composite types such as structs.
**Disadvantages** | Obfuscated data... difficult to debug.
| Requires a lot of custom code.

<hr/>

# Saving with JSON

It’s likely you’re aware of **JSON** already, especially if you’ve developed web apps. But for the uninitiated, [JSON](https://en.wikipedia.org/wiki/JSON) stands for **JavaScript Object Notation** and it’s a string representation of JavaScript objects that acts like a dictionary where the keys are variable names and the values are, well, their corresponding values. It’s designed to be lightweight for transportation over the web and easy to read for both humans and computers. Unity has built-in JSON facilities. To use it in a saving and loading system, our code will look similar in structure to the binary serialization example.

Let’s consider saving. Firstly, we’ll need to create a JSON-formatted string after creating the `SaveData` object inside the `Save` function. For that, Unity has a built-in class called `JsonUtility` which [contains functions](https://docs.unity3d.com/ScriptReference/JsonUtility.html) to do the heavy lifting for us.

~~~csharp
string saveJSON = JsonUtility.ToJson(saveData);
~~~

Let’s also remember to change our save file extension in both the `Save` and `Load` functions to **.json**.

~~~csharp
string filepath = Application.persistentDataPath + "/save.json";
~~~

The process we’ll use for saving that data to disk will also be slightly different. We won’t be using a `BinaryFormatter` now, so all we need is a `StreamWriter` which will write our JSON string to the file.

~~~csharp
using (StreamWriter sw = new StreamWriter(filepath))
{
    sw.WriteLine(saveJSON);
}
~~~

That’s all there is to saving. Loading is much the same process – although we’ll read the file line-by-line with **StreamReader** so the code is a bit longer.

~~~csharp
using (StreamReader sr = new StreamReader(filepath))
{
    string saveJSON = "";

    string line;
    while((line = sr.ReadLine()) != null)
    {
        saveJSON += line;
    }
}
~~~

It also should be noted that the `Load` function needs some extra logic to read back the contents of the `SaveData` struct, but I’m sure you can figure that out yourself!

Using **JSON**, we gain some advantages over `PlayerPrefs` and even over binary serialization. Firstly, JSON is totally human-readable. This makes it very easy to debug problems during saving or loading, and even allows the designer to hand-author save files. It’s easy for computers to parse too, so we don’t lose much in terms of efficiency. It supports composite types – and in fact, this implementation uses Unity’s default serializer behind the scenes, although it only works with public fields so we still can't use it to save entire `GameObject`s, complete with `Component`s. And the big advantage to using JSON is that, if we wished, we could transmit this over the web with no problems – it’s such a common Internet data exchange format.

The drawbacks with JSON are that the save files tend to be larger than binary serialization. The latter is great at densely packing data, whereas JSON is not. To illustrate this, the example save scenario with 100 enemy instances and one player takes up 917 bytes using binary serialization, and 1.28kB using JSON. JSON is more compact than other data exchange formats such as XML, but it will always require just a bit more data than compressed formats. Finally, there is more built-in Unity support for JSON than for binary serialization, but it’s still not a single function call like it is for `PlayerPrefs`.

**Advantages** | Human-readable - easy to read and debug.
| Portable format with cross-platform support.
| Supports composite types such as structs.
| Uses Unity's serializer - can serialize `MonoBehaviour`, `Component`, `Quaternion` etc directly.
**Disadvantages** | Human-readable... easy to "cheat" via modification?
| Larger save files than binary serialization.
| Still needs lots of custom code.

<hr/>

# Wrapping Up

There are multiple ways of saving data in Unity. Some require more space than others, and some have more portable APIs, but ultimately the method you choose will depend on the nature of the game you’re creating and the data you’re saving. This article should give you enough detail about each method to decide which strategy is right for you.

<hr/>

# Coming Up

The Unity Tips series will be taking a break for now. There will be more content in the future but I hope these tutorials have been helpful for someone so far!

<hr/>

# Acknowledgements

[This content was a timed exclusive for my Patreon $5+ backers](https://www.patreon.com/danielilett). I’d like to thank my $5 and $20 tier backers for making this content possible!

## $20 Backers

Special thanks to my $20 backers:

- Gemma Louise Ilett

<hr/>
