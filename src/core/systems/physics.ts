import { defineQuery } from "bitecs";
import type { IWorld } from "bitecs";
import { Position, Velocity } from "../components";
import { GRAVITY, SQUARE_SIZE } from "../constants";

const motionQuery = defineQuery([Position, Velocity]);

export function physicsSystem(world: IWorld, dt: number, canvas: HTMLCanvasElement): IWorld {
    const entities = motionQuery(world);
    for (const eid of entities) {
        // Gravity
        Velocity.y[eid] += GRAVITY * dt;

        // Integrate
        Position.x[eid] += Velocity.x[eid] * dt;
        Position.y[eid] += Velocity.y[eid] * dt;

        // Ground
        if (Position.y[eid] > canvas.height - SQUARE_SIZE) {
            Position.y[eid] = canvas.height - SQUARE_SIZE;
            Velocity.y[eid] = 0;
        }

        // Horizontal wrap
        if (Position.x[eid] > canvas.width) Position.x[eid] = -SQUARE_SIZE;
        if (Position.x[eid] < -SQUARE_SIZE) Position.x[eid] = canvas.width;
    }
    return world;
} 