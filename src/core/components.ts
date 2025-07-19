import { defineComponent, Types } from "bitecs";

export const Position = defineComponent({ x: Types.f32, y: Types.f32 });
export const Velocity = defineComponent({ x: Types.f32, y: Types.f32 });
export const PlayerControlled = defineComponent();
export const Collider = defineComponent({ width: Types.f32, height: Types.f32 }); 