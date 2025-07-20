Here are some notes on re-building the collision and contact resolution system to support bounciness.

Yes — **you’re 100% on the right track**, and **yes**, you should **remove the velocity zeroing from `collisionSystem`** and instead introduce a proper **`ContactResolutionSystem`** to handle post-collision effects like bounce, restitution, friction, etc.

Let’s break down exactly why, and how to proceed:

---

## ✅ Why Move Velocity Mutation Out of `collisionSystem`

### Problems with mutating velocity in `collisionSystem`:

* **Mixes concerns**: Now the system both *detects* and *responds* to collisions.
* **No separation of detection vs resolution**: This makes future effects (bouncing, friction, penetration correction) harder to modularize.
* **Prevents reuse**: You can’t reuse the collision detection for e.g. UI hit testing, triggers, sensors, etc.
* **No material awareness**: Right now it doesn’t know about `restitution`, `mass`, or `isStatic`.

---

## ✅ What to Do Instead

### Step 1: Change `collisionSystem` to **only detect collisions**

* It should record results in something like `world.contacts: CollisionContact[]`
* Don't modify `Velocity` at all

```ts
// types.ts
export interface CollisionContact {
  a: number
  b: number
  normalX: number
  normalY: number
  penetration: number
}
```

```ts
world.contacts = [] // initialize somewhere in setup

if (overlapX && overlapY) {
  const contact: CollisionContact = {
    a, b,
    normalX: resolveNormal(ax, ay, aw, ah, bx, by, bw, bh).x,
    normalY: resolveNormal(ax, ay, aw, ah, bx, by, bw, bh).y,
    penetration: 1 // placeholder
  }
  world.contacts.push(contact)
}
```

You can implement `resolveNormal(...)` as an AABB collision direction estimator.

---

### Step 2: Create `contactResolutionSystem(world, dt)`

In this system:

1. For each contact
2. Look up velocities and `PhysicsMaterial` (restitution)
3. Compute bounce (restitution)
4. Apply impulse to `Velocity`

This lets you later extend to friction, separation, mass-based momentum exchange, etc.

---

## ✅ Should the Ground Be a Collider?

**Yes. Always.** Make everything use the same logic:

* Define the ground as an entity with:

  * `Collider`
  * maybe a `Static` tag (or `Collider.isStatic = true`)
* This avoids special-casing logic and lets you:

  * Have multiple ground types
  * Define different bounciness/friction per surface
  * Have mobile platforms or breakable terrain

Example:

```ts
addComponent(world, eid, Collider)
Collider.width[eid] = 500
Collider.height[eid] = 20
Position.x[eid] = 0
Position.y[eid] = 480
Collider.isStatic[eid] = 1
```

Then `contactResolutionSystem` skips velocity updates for static bodies.

---

## 🚀 Next Steps (Immediate)

1. [ ] Remove all `Velocity` mutations from `collisionSystem`
2. [ ] Add `world.contacts: CollisionContact[]` and write to it from `collisionSystem`
3. [ ] Create `contactResolutionSystem(world, dt)` that reads from `world.contacts`
4. [ ] Add a `PhysicsMaterial` component (with `restitution`, optional `friction`)
5. [ ] Add a `Static` tag or `isStatic` field to `Collider`

---

Would you like:

* 🔧 A concrete implementation of `resolveNormal` and contact generation?
* ⚙️ A minimal `contactResolutionSystem` that handles bounces via restitution?

Let me know and I can write out the full code.


---

## 🔶 Overview of Phases

1. **Collision Detection System**
   Broadphase + narrowphase detection of overlapping colliders.
   Populates a transient list of `Contact` structs in `world.contacts`.

2. **Contact Resolution System**
   Resolves overlaps and updates `Velocity` / `Position` (e.g. bounces, restitution, friction).

3. **Collision Event System** *(optional)*
   Emits gameplay-triggered one-shot `CollisionEvent` components or bus commands when a new collision is detected (e.g. hit enemy).

---

## 1️⃣ Define Contact Data Structure

Add this outside the ECS:

```ts
export type Contact = {
  a: number  // Entity A
  b: number  // Entity B
  nx: number // Normal X
  ny: number // Normal Y
  depth: number // Penetration depth
}

export interface PhysicsContext {
  contacts: Contact[]
}
```

Inject this into your world if you want:

```ts
const world = createWorld({ contacts: [] }) as IWorld & PhysicsContext
```

---

## 2️⃣ Collision Detection System

This system detects overlaps and pushes contact data:

```ts
import { defineQuery } from 'bitecs'
import { Position, Collider } from '../components'
import type { PhysicsContext, Contact } from '../types'

const queryColliders = defineQuery([Position, Collider])

export function collisionSystem(world: IWorld & PhysicsContext): IWorld {
  world.contacts.length = 0 // Clear from last frame

  const entities = queryColliders(world)
  for (let i = 0; i < entities.length; i++) {
    const a = entities[i]
    const ax = Position.x[a]
    const ay = Position.y[a]
    const aw = Collider.width[a]
    const ah = Collider.height[a]

    for (let j = i + 1; j < entities.length; j++) {
      const b = entities[j]
      const bx = Position.x[b]
      const by = Position.y[b]
      const bw = Collider.width[b]
      const bh = Collider.height[b]

      const dx = (ax + aw / 2) - (bx + bw / 2)
      const dy = (ay + ah / 2) - (by + bh / 2)
      const overlapX = Math.abs(dx) < (aw + bw) / 2
      const overlapY = Math.abs(dy) < (ah + bh) / 2

      if (overlapX && overlapY) {
        // Determine contact normal and penetration depth
        const px = (aw + bw) / 2 - Math.abs(dx)
        const py = (ah + bh) / 2 - Math.abs(dy)
        if (px < py) {
          world.contacts.push({ a, b, nx: Math.sign(dx), ny: 0, depth: px })
        } else {
          world.contacts.push({ a, b, nx: 0, ny: Math.sign(dy), depth: py })
        }
      }
    }
  }

  return world
}
```

---

## 3️⃣ Contact Resolution System

Handles actual response (position correction, bounce):

```ts
import { Velocity, Position } from '../components'

export function contactResolutionSystem(world: IWorld & PhysicsContext): IWorld {
  for (const contact of world.contacts) {
    const { a, b, nx, ny } = contact

    // simple elastic bounce response
    const bounce = 0.8

    const vax = Velocity.x[a]
    const vay = Velocity.y[a]
    const vbx = Velocity.x[b]
    const vby = Velocity.y[b]

    const relVelX = vax - vbx
    const relVelY = vay - vby
    const velAlongNormal = relVelX * nx + relVelY * ny

    if (velAlongNormal > 0) continue // already separating

    const impulse = -(1 + bounce) * velAlongNormal / 2

    Velocity.x[a] += impulse * nx
    Velocity.y[a] += impulse * ny
    Velocity.x[b] -= impulse * nx
    Velocity.y[b] -= impulse * ny

    // optional: positional correction (to resolve overlap)
    const correction = contact.depth * 0.5
    Position.x[a] += nx * correction
    Position.y[a] += ny * correction
    Position.x[b] -= nx * correction
    Position.y[b] -= ny * correction
  }

  return world
}
```

---

## 4️⃣ Optional: Collision Events

Use a one-frame component like:

```ts
export const CollisionEvent = defineComponent({
  other: Types.eid
})

// then in a system:
addComponent(world, a, CollisionEvent)
CollisionEvent.other[a] = b
```

Use for sound, damage, scoring, etc. Clear it next frame.

---

## 🟦 Summary

| System                    | Role                                 |
| ------------------------- | ------------------------------------ |
| `collisionSystem`         | Finds overlaps, builds `Contact[]`   |
| `contactResolutionSystem` | Applies bounce, separation, friction |
| `collisionEventSystem`    | (Optional) emits game-level effects  |

This separation keeps physics clean and composable, and mirrors how engines like Box2D or Unity work internally.

Want help adding friction, mass, or restitution to this?
