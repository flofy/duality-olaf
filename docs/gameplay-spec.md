# Gameplay specification

## Reference behavior

The historical CPC version uses the arrow keys for movement and `SPACE` to switch between the round form and square form. The objective is to destroy all bonuses with the blue ball; the square is used to solve the puzzle. The later Maouss DS adaptation describes the same two-form idea as a spaceship that destroys stars and a square that stops on obstacles.

For the modern Duality implementation, we keep the **switch-with-SPACE** interaction because it matches the remembered/original CPC experience and makes the game usable on mobile with one explicit form-switch control.

## Core rules

1. The board is a rectangular grid surrounded by blocking cells.
2. Exactly one form is active at a time: `ball` or `square`.
3. Arrow/touch input moves the active form one cell when the destination is valid.
4. A wall blocks movement.
5. The two forms cannot occupy the same cell in the current prototype.
6. Stars are collectible only by the ball.
7. A level is complete when every star has been collected.
8. `SPACE` / the mobile form button switches the active form without moving it.
9. `R` resets the current level.
10. Progress is stored locally after a level is completed.

## Historical compatibility note

Maouss DS used separate DS controls for the spaceship and square rather than the CPC-style switch control. This project intentionally does not reproduce that hardware-specific input scheme; the game domain remains independent of the input adapter so another control scheme can be added later.

## Validation target

The published Maouss DS walkthrough for level 1 is retained as a behavioral reference: the solution alternates square and spaceship movement and collects three stars. Our first handcrafted levels should require genuine switching rather than allowing every star to be collected by the ball from its initial position.
