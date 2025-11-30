# `tk`

> [!WARNING]
> `tk` is beta software, it might not work, or it might be buggy.

`tk` is an all in one Roblox toolchain.

The end goal is to create a suitable replacement to:

- Rojo
- `roblox-ts`
- The nonexistant 3D-model to rbxm tooling

## Why?

Simplicity. I don't like managing a lot of tools, and I like it when there isn't weird jank like an `out` folder. Yes, this is a gripe I have with `roblox-ts`, can't blame them, it's an insane project and I have nothing but the utmost respect for the work they've done, they can't get everything perfect.

## What about-

Unfortuantely, I don't have time to implement the features people want, this is a me-tool, but if you do want to open a PR, I will happily review it and tweak it and merge it, but I don't have infinite time, as much as I'd wish.

## FAQ

<detail>
<summary>
Why not Rust?
</summary>
Good question, I love Rust as a language, and a lot of Roblox tooling is written in it, but I do want this to be easy to contribute to, additionally, the lack of garbage collection can be annoying at times. Nevertheless, my heart still yearns for ADTs.
</detail>

<detail>
<summary>
Why do you hate Aftman and Foreman so much
</summary>
I don't, I just think there's no good reason to use them when Rokit exists, they're both great projects.
</detail>

## Getting Started

```
rokit install spin-the-hexagon/tk
tk init
```
