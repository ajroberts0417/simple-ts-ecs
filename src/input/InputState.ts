export const InputState = {
    keysDown: new Set<string>(),
};

if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => InputState.keysDown.add(e.key.toUpperCase()));
    window.addEventListener("keyup", (e) => InputState.keysDown.delete(e.key.toUpperCase()));
} 