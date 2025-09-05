import { createWorld, addEntity, addComponent } from "bitecs";
import type { IWorld } from "bitecs";
import { Position, Velocity, PlayerControlled, Collider } from "./components";
import { SQUARE_SIZE } from "./constants";

function spawnSquare(world: IWorld, x: number, y: number, vx = 0, vy = 0) {
    const eid = addEntity(world);
    addComponent(world, Position, eid);
    addComponent(world, Velocity, eid);
    addComponent(world, Collider, eid);
    Position.x[eid] = x;
    Position.y[eid] = y;
    Velocity.x[eid] = vx;
    Velocity.y[eid] = vy;
    Collider.width[eid] = SQUARE_SIZE;
    Collider.height[eid] = SQUARE_SIZE;
    return eid;
}

export function spawnPlayer(world: IWorld, x: number, y: number) {
    const eid = spawnSquare(world, x, y, 0, 0);
    addComponent(world, PlayerControlled, eid);
    return eid;
}

export const gameWorld = createWorld();

export function spawnTestEntities(world: IWorld) {
    spawnPlayer(world, 100, 100);
    spawnSquare(world, 300, 100, -50);
    spawnSquare(world, 500, 300, 0, -30);
}