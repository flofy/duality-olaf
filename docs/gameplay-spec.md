# Gameplay specification

## Reference behavior

The historical CPC version uses the arrow keys for movement and `SPACE` to switch between the round form and square form. The objective is to destroy all bonuses with the blue ball; the square is used to solve the puzzle. The later Maouss DS adaptation describes the same two-form idea as a spaceship that destroys stars and a square that stops on obstacles.

For the modern Duality implementation, we keep the **switch-with-SPACE** interaction because it matches the remembered/original CPC experience and makes the game usable on mobile with one explicit form-switch control.

## Core rules

1. The board is a rectangular grid surrounded by blocking cells.
2. Exactly one form is active at a time: `ball` or `square`.
3. A single arrow/touch press slides the active form **all the way along a line or column**, one cell at a time, and stops on the last free cell before the first wall or the other form. The form is always aligned to its cell centre (integer position).
4. Movement is strictly orthogonal (only one axis at a time); no diagonal is allowed, so forms slide along a single row or column.
5. A wall blocks movement; the form never slides sideways along a wall.
6. The two forms cannot share the same cell (they stop one cell apart).
7. Stars are collected by the ball when it sweeps over their cells along its path.
8. A level is complete when every star has been collected.
9. `SPACE` / the mobile form button switches the active form without moving it.
10. `R` resets the current level.
11. Progress is stored locally after a level is completed.

## Historical compatibility note

Maouss DS used separate DS controls for the spaceship and square rather than the CPC-style switch control. This project intentionally does not reproduce that hardware-specific input scheme; the game domain remains independent of the input adapter so another control scheme can be added later.

## Validation target

The published Maouss DS walkthrough for level 1 is retained as a behavioral reference: the solution alternates square and spaceship movement and collects three stars. Our first handcrafted levels should require genuine switching rather than allowing every star to be collected by the ball from its initial position.
