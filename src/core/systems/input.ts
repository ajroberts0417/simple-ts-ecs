import { defineQuery } from "bitecs";
import type { IWorld } from "bitecs";
import { PlayerControlled, Velocity, Position } from "../components";
import { InputState } from "../../input/InputState";
import { MOVE_SPEED, SQUARE_SIZE } from "../constants";

const playerQuery = defineQuery([PlayerControlled, Velocity, Position]);

export function inputSystem(world: IWorld, _dt: number, canvas: HTMLCanvasElement): IWorld {
    const entities = playerQuery(world);
    for (const eid of entities) {
        if (InputState.keysDown.has("A")) Velocity.x[eid] = -MOVE_SPEED;
        else if (InputState.keysDown.has("D")) Velocity.x[eid] = MOVE_SPEED;
        else Velocity.x[eid] = 0;

        if (
            InputState.keysDown.has("W") &&
            Position.y[eid] >= canvas.height - SQUARE_SIZE
        ) {
            Velocity.y[eid] = -MOVE_SPEED * 2;
        }
    }
    return world;
} 