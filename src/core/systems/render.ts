import { defineQuery } from "bitecs";
import type { IWorld } from "bitecs";
import { Position } from "../components";
import { SQUARE_SIZE } from "../constants";

const renderQuery = defineQuery([Position]);

function drawSquare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, size, size);
}

export function renderSystem(world: IWorld, ctx: CanvasRenderingContext2D): IWorld {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const entities = renderQuery(world);
    for (const eid of entities) {
        drawSquare(ctx, Position.x[eid], Position.y[eid], SQUARE_SIZE);
    }
    return world;
} 