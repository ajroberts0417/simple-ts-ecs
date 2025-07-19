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
addComponent(world, PlayerControlled, player);

// Initial transform
Position.x[player] = 100;
Position.y[player] = 100;
Velocity.x[player] = 0;
Velocity.y[player] = 0;

// --------------------
// Main Game Loop
// --------------------
let lastTime = performance.now();
function gameLoop(currentTime: number) {
    const dt = (currentTime - lastTime) / 1000; // seconds since last frame
    lastTime = currentTime;

    inputSystem(world, dt);
    physicsSystem(world, dt);
    renderSystem(world);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);


