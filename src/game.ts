// Import bitecs ECS utilities
import {
    defineComponent,
    Types,
    createWorld,
    addEntity,
    addComponent,
    defineQuery
} from "bitecs";

// Canvas setup
const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

// --------------------
// ECS Components
// --------------------
export const Position = defineComponent({ x: Types.f32, y: Types.f32 });
export const Velocity = defineComponent({ x: Types.f32, y: Types.f32 });
export const PlayerControlled = defineComponent();
export const Collider = defineComponent({
    width: Types.f32,
    height: Types.f32
});

// --------------------
// Input State (outside ECS)
// --------------------
const InputState = {
    keysDown: new Set<string>()
};

window.addEventListener("keydown", (e) => InputState.keysDown.add(e.key));
window.addEventListener("keyup", (e) => InputState.keysDown.delete(e.key));

// --------------------
// Constants
// --------------------
const GRAVITY = 500; // px/s^2
const MOVE_SPEED = 300; // px/s
const SQUARE_SIZE = 100;

// --------------------
// Systems
// --------------------
const playerQuery = defineQuery([PlayerControlled, Velocity]);
const motionQuery = defineQuery([Position, Velocity]);
const renderQuery = defineQuery([Position]);
const colliderQuery = defineQuery([Position, Velocity, Collider]);

function inputSystem(world: any, _dt: number) {
    const entities = playerQuery(world);
    for (const eid of entities) {
        // Horizontal movement
        if (InputState.keysDown.has("ArrowLeft")) Velocity.x[eid] = -MOVE_SPEED;
        else if (InputState.keysDown.has("ArrowRight")) Velocity.x[eid] = MOVE_SPEED;
        else Velocity.x[eid] = 0;

        // Jump / Upwards impulse
        if (InputState.keysDown.has("ArrowUp") && Position.y[eid] >= canvas.height - SQUARE_SIZE) {
            Velocity.y[eid] = -MOVE_SPEED * 2; // simple jump impulse
        }
    }
    return world;
}

function physicsSystem(world: any, dt: number) {
    const entities = motionQuery(world);
    for (const eid of entities) {
        // Apply gravity
        Velocity.y[eid] += GRAVITY * dt;

        // Integrate velocity -> position
        Position.x[eid] += Velocity.x[eid] * dt;
        Position.y[eid] += Velocity.y[eid] * dt;

        // Simple ground collision
        if (Position.y[eid] > canvas.height - SQUARE_SIZE) {
            Position.y[eid] = canvas.height - SQUARE_SIZE;
            Velocity.y[eid] = 0;
        }

        // Wrap horizontally for endless scroll effect
        if (Position.x[eid] > canvas.width) Position.x[eid] = -SQUARE_SIZE;
        if (Position.x[eid] < -SQUARE_SIZE) Position.x[eid] = canvas.width;
    }
    return world;
}

function collisionSystem(world: any) {
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
                // Basic resolution: stop both entities
                Velocity.x[a] = 0;
                Velocity.y[a] = 0;
                Velocity.x[b] = 0;
                Velocity.y[b] = 0;
            }
        }
    }
    return world;
}

function renderSystem(world: any) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const entities = renderQuery(world);
    for (const eid of entities) {
        drawSquare(ctx, Position.x[eid], Position.y[eid], SQUARE_SIZE, SQUARE_SIZE);
    }
    return world;
}

// --------------------
// Helper – draw a filled square
// --------------------
function drawSquare(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
) {
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, width, height);
}

// --------------------
// World & Entities
// --------------------
const world = createWorld();

const player = addEntity(world);
addComponent(world, Position, player);
addComponent(world, Velocity, player);
addComponent(world, Collider, player);
addComponent(world, PlayerControlled, player);

// Initial transform
Position.x[player] = 100;
Position.y[player] = 100;
Velocity.x[player] = 0;
Velocity.y[player] = 0;
Collider.width[player] = SQUARE_SIZE;
Collider.height[player] = SQUARE_SIZE;

// --------------------
// Additional test squares
// --------------------
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

// Spawn two more squares
spawnSquare(300, 100, -50, 0); // moving slowly left
spawnSquare(500, 300, 0, -30); // moving slowly up
// --------------------
// Main Game Loop
// --------------------
let lastTime = performance.now();
function gameLoop(currentTime: number) {
    const dt = (currentTime - lastTime) / 1000; // seconds since last frame
    lastTime = currentTime;

    inputSystem(world, dt);
    physicsSystem(world, dt);
    collisionSystem(world);
    renderSystem(world);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);


