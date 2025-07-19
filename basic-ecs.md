Here's a production-style ECS implementation using `bitECS` with systems for input handling and physics. It sets up keyboard/mouse input state tracking and a gravity-based physics system.

---

### 🧱 Components
```ts
import { defineComponent, Types } from 'bitecs'

export const Position = defineComponent({ x: Types.f32, y: Types.f32 })
export const Velocity = defineComponent({ x: Types.f32, y: Types.f32 })
export const PlayerControlled = defineComponent()
```

---

### 🕹️ Input State (outside ECS)
```ts
export const InputState = {
  keysDown: new Set<string>(),
  mouseDown: false,
  mouseX: 0,
  mouseY: 0
}

window.addEventListener('keydown', (e) => InputState.keysDown.add(e.key))
window.addEventListener('keyup', (e) => InputState.keysDown.delete(e.key))
window.addEventListener('mousedown', () => InputState.mouseDown = true)
window.addEventListener('mouseup', () => InputState.mouseDown = false)
window.addEventListener('mousemove', (e) => {
  InputState.mouseX = e.clientX
  InputState.mouseY = e.clientY
})
```

---

### ⚙️ Systems
```ts
import { query } from 'bitecs'

const GRAVITY = 0.98
const MOVE_SPEED = 2

export const physicsSystem = (world) => {
  const entities = query(world, [Position, Velocity])
  for (const eid of entities) {
    Velocity.y[eid] += GRAVITY
    Position.x[eid] += Velocity.x[eid]
    Position.y[eid] += Velocity.y[eid]
  }
  return world
}

export const inputSystem = (world) => {
  const entities = query(world, [PlayerControlled, Velocity])
  for (const eid of entities) {
    if (InputState.keysDown.has('ArrowLeft')) Velocity.x[eid] = -MOVE_SPEED
    else if (InputState.keysDown.has('ArrowRight')) Velocity.x[eid] = MOVE_SPEED
    else Velocity.x[eid] = 0

    if (InputState.keysDown.has('ArrowUp')) Velocity.y[eid] = -MOVE_SPEED
    else if (InputState.keysDown.has('ArrowDown')) Velocity.y[eid] = MOVE_SPEED
  }
  return world
}
```

---

### 🚀 Main Setup
```ts
import { createWorld, addEntity, addComponent } from 'bitecs'
import { Position, Velocity, PlayerControlled } from './components'
import { inputSystem, physicsSystem } from './systems'

const world = createWorld()

const player = addEntity(world)
addComponent(world, player, Position)
addComponent(world, player, Velocity)
addComponent(world, player, PlayerControlled)
Position.x[player] = 100
Position.y[player] = 100

const mainLoop = () => {
  inputSystem(world)
  physicsSystem(world)
  requestAnimationFrame(mainLoop)
}

mainLoop()
```

---

### 🧪 Next Steps
- Add a rendering system (`CanvasRenderingContext2D` or `WebGL`)
- Add `Collider` components and `collisionSystem`
- Add `CommandBus` abstraction for UI/interaction
- Move to shared `Float32Array` backing stores for performance

Let me know if you'd like to modularize systems, handle delta time, or add a UI system that generates ECS events based on interaction.
