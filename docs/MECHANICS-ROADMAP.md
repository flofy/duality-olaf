# Duality — Mechanics & Live Content Roadmap

## Principle

The initial campaign remains a stable **55-level canonical campaign**.

New mechanics should not be silently injected into existing levels. They are introduced as new worlds, themed campaigns, or challenge modes so that:

- the original progression stays understandable;
- the solver can validate each mechanic;
- each new mechanic gets a dedicated tutorial arc.

## Advanced mechanics

### 🚪 Doors & switches

A switch changes the state of one or more doors.

```
● → switch
      ↓
🚪 opens
```

Design value:

- state management;
- planning which form should activate the switch;
- irreversible choices.

### 🌀 Teleporters

Teleporters connect two board positions.

```
A 🌀 ───── 🌀 B
```

Design value:

- non-local movement;
- surprising trajectories;
- routing puzzles.

### 🔒 Blocking / deadlocks

The two forms can create critical positions for each other.

A future expert world should deliberately teach:

- safe blocking;
- temporary blocking;
- permanent deadlocks;
- recovery planning.

This is the natural continuation of World 3 coordination.

## Suggested future progression

| Content | Main idea |
|---|---|
| Worlds 1–5 | Canonical 55-level campaign |
| World 6 | Doors & switches |
| World 7 | Teleporters |
| World 8 | Mixed mechanics |
| Challenge mode | Random/generated validated levels |
| Seasonal worlds | Visual themes and limited-time campaigns |

## 🎃 Seasonal themes

Themes should be primarily **visual and content-driven**, while preserving the core rules.

Examples:

### Halloween

- 🎃 board skin
- 🦇 stars arranged as a bat
- 👻 themed targets
- purple/orange atmosphere

### Christmas

- 🎄 tree-shaped star patterns
- ❄️ snow visual theme
- 🎁 event puzzles

### Other events

A themed world can have:

- an availability window;
- a yearly identifier;
- persistent completion for players who unlocked it.

## Random / generated levels

Generated levels should always follow this pipeline:

```
Generate candidate
       ↓
Validate board
       ↓
Solve
       ↓
Reject impossible levels
       ↓
Rank difficulty
       ↓
Publish challenge
```

The existing solver is therefore part of the product architecture, not only a test tool.

## Implementation rule

Before adding a new mechanic to gameplay:

1. extend the level format;
2. extend the validator;
3. extend the runner;
4. extend the solver;
5. add mechanic-specific tests;
6. create tutorial levels;
7. only then add it to a campaign world.

This keeps Duality extensible without making the current game unstable.
