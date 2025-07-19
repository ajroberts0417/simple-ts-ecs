import { createWorld, addEntity, addComponent } from "bitecs";
import type { IWorld } from "bitecs";
import { Position, Velocity, PlayerControlled, Collider } from "./core/components";
import { inputSystem } from "./core/systems/input";
import { physicsSystem } from "./core/systems/physics";
import { collisionSystem } from "./core/systems/collision";
import { renderSystem } from "./core/systems/render";
import { SQUARE_SIZE } from "./core/constants";

// Canvas setup
const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// --------------------
// World & Entities
// --------------------
const world: IWorld = createWorld();

const player = addEntity(world);
addComponent(world, Position, player);
addComponent(world, Velocity, player);
addComponent(world, Collider, player);
addComponent(world, PlayerControlled, player);

// Initial player state
Position.x[player] = 100;
Position.y[player] = 100;
Velocity.x[player] = 0;
Velocity.y[player] = 0;
Collider.width[player] = SQUARE_SIZE;
Collider.height[player] = SQUARE_SIZE;

// Utility to create generic squares
function spawnSquare(x: number, y: number, vx = 0, vy = 0) {
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

// Spawn additional test squares
spawnSquare(300, 100, -50);
spawnSquare(500, 300, 0, -30);

// --------------------
// Main Game Loop
// --------------------
let lastTime = performance.now();
function gameLoop(currentTime: number) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    inputSystem(world, dt, canvas);
    physicsSystem(world, dt, canvas);
    collisionSystem(world);
    renderSystem(world, ctx);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);


