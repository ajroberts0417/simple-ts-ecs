import { describe, it, expect } from "vitest";
import { createWorld, addEntity, addComponent } from "bitecs";

import { physicsSystem } from "../physics";
import { Position, Velocity } from "../../components";
import { GRAVITY, SQUARE_SIZE } from "../../constants";

function mockCanvas(width = 800, height = 600): HTMLCanvasElement {
    return { width, height } as unknown as HTMLCanvasElement;
}

function makeWorld() {
    return createWorld();
}

function spawnEntity(
    world: ReturnType<typeof createWorld>,
    {
        x = 0,
        y = 0,
        vx = 0,
        vy = 0,
    }: { x?: number; y?: number; vx?: number; vy?: number }
) {
    const eid = addEntity(world);
    addComponent(world, Position, eid);
    addComponent(world, Velocity, eid);
    Position.x[eid] = x;
    Position.y[eid] = y;
    Velocity.x[eid] = vx;
    Velocity.y[eid] = vy;
    return eid;
}

function step(world: ReturnType<typeof createWorld>, dt: number, canvas: HTMLCanvasElement) {
    physicsSystem(world, dt, canvas);
}

describe("physicsSystem", () => {
    it("applies gravity to vertical velocity", () => {
        const world = makeWorld();
        const canvas = mockCanvas();
        const eid = spawnEntity(world, { x: 0, y: 0, vx: 0, vy: 0 });
        const dt = 0.016;
        step(world, dt, canvas);
        expect(Velocity.y[eid]).toBeCloseTo(GRAVITY * dt, 4);
    });

    it("integrates position using velocity", () => {
        const world = makeWorld();
        const canvas = mockCanvas();
        const vx = 10;
        const vy = 5;
        const x = 50;
        const y = 100;
        const eid = spawnEntity(world, { x, y, vx, vy });
        const dt = 0.1;
        step(world, dt, canvas);
        const expectedVy = vy + GRAVITY * dt;
        expect(Position.y[eid]).toBeCloseTo(y + expectedVy * dt, 4);
    });

    it("clamps entity to ground and zeroes y velocity", () => {
        const world = makeWorld();
        const canvas = mockCanvas();
        const startY = canvas.height - SQUARE_SIZE - 1;
        const eid = spawnEntity(world, { x: 0, y: startY, vx: 0, vy: 50 });
        const dt = 0.1;
        step(world, dt, canvas);
        expect(Position.y[eid]).toBe(canvas.height - SQUARE_SIZE);
        expect(Velocity.y[eid]).toBe(0);
    });

    it("wraps horizontally when entity exceeds right edge", () => {
        const world = makeWorld();
        const canvas = mockCanvas();
        const eid = spawnEntity(world, { x: canvas.width + 1, y: 0 });
        const dt = 0;
        step(world, dt, canvas);
        expect(Position.x[eid]).toBe(-SQUARE_SIZE);
    });

    it("wraps horizontally when entity exceeds left edge", () => {
        const world = makeWorld();
        const canvas = mockCanvas();
        const eid = spawnEntity(world, { x: -SQUARE_SIZE - 1, y: 0 });
        const dt = 0;
        step(world, dt, canvas);
        expect(Position.x[eid]).toBe(canvas.width);
    });
}); 