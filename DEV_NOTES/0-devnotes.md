This game is going to be a physics engine. It's just for me.

It's something I'm building to delight myself, to delight in the computer and to enjoy Typescript.

The whole project is purely for joy. This is very very important to me.

Specifically, the joy of being in the editor, the joy of perfect code, the joy of being able to extend and add features to my system exactly the way I want to do so.

Here are the major systems I need to model:


1. Game Loop & Frame Rate
- my game is designed to run at 60 frames per second, but it will have variable frame rate.
- every frame, the game will do a few things:
- calculate a time delta from last frame
- 1. update the InputState eg. inputState.update(delta)
- 2. update core systems, so for instance physicsEngine.update(delta)
- 3.

1. InputState:
    - 1. a set of all keys that are currently down



Here are some experiments I need to run to figure things out:

Basic:

Game Loop: how do i create a simple game loop at a fixed frame rate?
Graphics: how do I render a single square?


Physics: (without graphics) how do I build a very simple physics system that affects just one "thing" (a PhysicsObject? Which is a type of interface, I guess? How do I get typescript to accept)
- Question: should position be separate from Physics? And then do I tightly couple some of my component systems, such that the physics system can access properties from the position system? or is that dumb? should I just keep position in the physics system? But then what if an object has position without physics? Should all physics be one component or should Gravity be a component, and then Collision is a separate component?


Entities: how do I create entities in the world?
Position: how do I give all those entities Position?
Shape: how do I give those entities a Shape?
Physics: how do I give all those entities Physics (gravity, weight, size, velocity, acceleration, bounciness, etc...)
Collision: how do I give all of those entities Collision?




Later:
Art: how do I render a simple sprite?
Music: how do i play a background track?


Advanced: 
Spritesheet Generation: how do i generate 4 animated frames into a spritesheet from one simple sprite (likely python)
    - Question: I want to generate a simple "automatic animation system". Is it better to pre-generate these by creating an animated sprite sheet for each sprite? Or is it better to just move my sprite around back and forth via translation, and do the animation in code?



