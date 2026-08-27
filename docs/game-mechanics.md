# Game mechanics

## Historical reference

The reference family is **Olaf / Le Touti Rikiki, Maousse Costo**, later adapted as **Maouss DS**.

The modern project must reproduce the gameplay model independently rather than copy proprietary implementation details.

## Core model

The level is a grid containing walls/obstacles, a controllable moving form, a second controllable blocking form, and collectible/target cells.

The two forms have different movement properties. The active form can be switched during play. The puzzle is solved by positioning the blocking form so that the moving form follows the intended path and reaches/clears all targets.

## Prototype rules

The first prototype should explicitly model:

- orthogonal line/column sliding: a press moves the active form one cell at a time along a single row or column, always aligned to the cell centre; it stops on the last free cell before a wall or the other form;
- grid-based field with continuous positions and a collision radius;
- active-form switching;
- collision with obstacles;
- moving-form stopping behaviour;
- blocking-form stopping behaviour;
- target collection/destruction;
- level completion;
- restart/reset;
- keyboard controls;
- touch controls.

Do not hard-code historical assumptions into the engine: keep these behaviours configurable so that differences between CPC and DS versions can be documented.
