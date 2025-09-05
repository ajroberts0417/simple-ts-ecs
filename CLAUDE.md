# Claude Code Rules for Game Engine Development


## Core Principle: Incremental Learning Over Premature Abstraction
This project is a learning exercise in game engine development. The maintainer is new to game engines and needs to understand each decision through hands-on experience, not theoretical abstractions.


## Architecture Guidelines


### 1. Avoid Over-Engineering Early
- **Don't jump to complex abstractions** like EntityFactory classes, LevelManager systems, or DebugSystem classes
- **Prefer simple, direct solutions** that solve the immediate problem
- **One step at a time** - make the minimal change that improves the current situation


### 2. Learn Through Evolution
- Each architectural decision should be discovered through experience, not imposed top-down
- Refactor when pain points become clear, not when abstractions seem "correct"
- Build systems that can be easily changed as understanding grows


### 3. Pragmatic Refactoring Rules
- **Extract only when there's real duplication or mixing of concerns**
- **Keep abstractions thin** - prefer simple functions over classes
- **Maintain working code** throughout refactoring
- **Question whether abstractions are needed** - simpler is often better


### 4. Current Architecture Patterns That Work
- **Clean separation of concerns** without over-abstraction
- **Conditional development features** (test entities only in dev mode)
- **Simple composition** (spawnPlayer calls spawnSquare, adds PlayerControlled)
- **Flat module structure** rather than deep hierarchies


## Red Flags to Avoid
- Creating classes when functions suffice
- Building "systems" before understanding the problem space
- Implementing features for theoretical future needs
- Complex inheritance or deep abstraction layers

## Remember
The goal is to learn game engine concepts through direct experience. Every abstraction should be earned through encountering real pain points, not built preemptively because it seems like "good architecture."