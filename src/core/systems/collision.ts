import { defineQuery } from "bitecs";
import type { IWorld } from "bitecs";
import { Position, Velocity, Collider } from "../components";

const colliderQuery = defineQuery([Position, Velocity, Collider]);

export function collisionSystem(world: IWorld): IWorld {
    const entities = colliderQuery(world);
    for (let i = 0; i < entities.length; i++) {
        const a = entities[i];
        const ax = Position.x[a];
        const ay = Position.y[a];
        const aw = Collider.width[a];
        const ah = Collider.height[a];

        for (let j = i + 1; j < entities.length; j++) {
            const b = entities[j];
            const bx = Position.x[b];
            const by = Position.y[b];
            const bw = Collider.width[b];
            const bh = Collider.height[b];

            const overlapX = ax < bx + bw && ax + aw > bx;
            const overlapY = ay < by + bh && ay + ah > by;

            if (overlapX && overlapY) {
                Velocity.x[a] = 0;
                Velocity.y[a] = 0;
                Velocity.x[b] = 0;
                Velocity.y[b] = 0;
            }
        }
    }
    return world;
} 