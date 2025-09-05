import { gameWorld, spawnTestEntities } from "./core/GameWorld";
import { canvas, ctx } from "./core/Canvas";
import { inputSystem } from "./core/systems/input";
import { physicsSystem } from "./core/systems/physics";
import { collisionSystem } from "./core/systems/collision";
import { renderSystem } from "./core/systems/render";

// --------------------
// Main Game Loop
// --------------------
let lastTime = performance.now();
function gameLoop(currentTime: number) {
    const dt = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    inputSystem(gameWorld, dt, canvas);
    physicsSystem(gameWorld, dt, canvas);
    collisionSystem(gameWorld);
    renderSystem(gameWorld, ctx);

    requestAnimationFrame(gameLoop);
}

if (import.meta.env.DEV) {
    spawnTestEntities(gameWorld);
}

requestAnimationFrame(gameLoop);


