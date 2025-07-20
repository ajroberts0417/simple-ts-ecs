import { describe, it, expect, beforeEach } from "vitest";
import { createWorld, addEntity, addComponent } from "bitecs";
import type { IWorld } from "bitecs";
import { collisionSystem } from "../collision";
import { Position, Velocity, Collider } from "../../components";

function makeWorld(): IWorld {
    return createWorld();
}

function spawnEntity(
    world: IWorld,
    { x = 0, y = 0, vx = 0, vy = 0, width = 10, height = 10 }: { x?: number; y?: number; vx?: number; vy?: number; width?: number; height?: number } = {}
): number {
    const eid = addEntity(world);
    addComponent(world, Position, eid);
    addComponent(world, Velocity, eid);
    addComponent(world, Collider, eid);
    Position.x[eid] = x;
    Position.y[eid] = y;
    Velocity.x[eid] = vx;
    Velocity.y[eid] = vy;
    Collider.width[eid] = width;
    Collider.height[eid] = height;
    return eid;
}

describe("collisionSystem", () => {
    let world: IWorld;
    beforeEach(() => {
        world = makeWorld();
    });

    it("does not affect entities that do not overlap", () => {
        const a = spawnEntity(world, { x: 0, y: 0, vx: 1, vy: 1 });
        const b = spawnEntity(world, { x: 100, y: 100, vx: -1, vy: -1 });
        collisionSystem(world);
        expect(Velocity.x[a]).toBe(1);
        expect(Velocity.y[a]).toBe(1);
        expect(Velocity.x[b]).toBe(-1);
        expect(Velocity.y[b]).toBe(-1);
    });

    it("zeroes velocities when two entities overlap", () => {
        const a = spawnEntity(world, { x: 0, y: 0, vx: 2, vy: 3 });
        const b = spawnEntity(world, { x: 5, y: 5, vx: -2, vy: -3 }); // overlap with a
        collisionSystem(world);
        expect(Velocity.x[a]).toBe(0);
        expect(Velocity.y[a]).toBe(0);
        expect(Velocity.x[b]).toBe(0);
        expect(Velocity.y[b]).toBe(0);
    });

    it("does not zero velocities for edge-touching (no overlap)", () => {
        const a = spawnEntity(world, { x: 0, y: 0, width: 10, height: 10, vx: 1, vy: 1 });
        const b = spawnEntity(world, { x: 10, y: 0, width: 10, height: 10, vx: -1, vy: -1 }); // right edge of a touches left edge of b
        collisionSystem(world);
        expect(Velocity.x[a]).toBe(1);
        expect(Velocity.y[a]).toBe(1);
        expect(Velocity.x[b]).toBe(-1);
        expect(Velocity.y[b]).toBe(-1);
    });

    it("handles multiple overlapping entities (all zeroed)", () => {
        const a = spawnEntity(world, { x: 0, y: 0, vx: 1, vy: 1 });
        const b = spawnEntity(world, { x: 5, y: 5, vx: 2, vy: 2 }); // overlaps with a
        const c = spawnEntity(world, { x: 7, y: 7, vx: 3, vy: 3 }); // overlaps with b
        collisionSystem(world);
        expect(Velocity.x[a]).toBe(0);
        expect(Velocity.y[a]).toBe(0);
        expect(Velocity.x[b]).toBe(0);
        expect(Velocity.y[b]).toBe(0);
        expect(Velocity.x[c]).toBe(0);
        expect(Velocity.y[c]).toBe(0);
    });

    it("does not affect a single entity (no collisions)", () => {
        const a = spawnEntity(world, { x: 0, y: 0, vx: 1, vy: 1 });
        collisionSystem(world);
        expect(Velocity.x[a]).toBe(1);
        expect(Velocity.y[a]).toBe(1);
    });

    it("handles different collider sizes", () => {
        const a = spawnEntity(world, { x: 0, y: 0, width: 20, height: 20, vx: 1, vy: 1 });
        const b = spawnEntity(world, { x: 15, y: 15, width: 10, height: 10, vx: -1, vy: -1 }); // overlap
        collisionSystem(world);
        expect(Velocity.x[a]).toBe(0);
        expect(Velocity.y[a]).toBe(0);
        expect(Velocity.x[b]).toBe(0);
        expect(Velocity.y[b]).toBe(0);
    });
}); 