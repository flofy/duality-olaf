# Campagne 2026-09-13 — reconstruction de la progression

> **Remplacé** par [`campaign-plan-2026-09-23.md`](./campaign-plan-2026-09-23.md)
> : mondes 4/5 réorganisés (téléporteurs en 4, portes en 5) et contraintes de
> progression renforcées. Ce document reste historique.

## Méthode

La campagne a été reconstruite à partir de trois pools de candidats :

- `head` : la campagne committée (55 niveaux, très largement redondante entre
  mondes — jusqu'à 5 doublons exacts par niveau).
- `cur` : la reprise des niveaux extraits du jeu legacy (working tree).
- `new` : l'ancienne mouture `levels_new/`.

Chaque candidat a été validé par le solveur (`packages/game/src/LevelSolver`)
et scoré via `LevelValidator` (`score = coups × 10 + log2(états explorés)`).

Sélection :

1. **Dédoublonnage exact** par signature (plateau + positions de départ +
   étoiles), priorité `cur` > `head` > `new`.
2. **Mondes 1–3 (33 niveaux)** : sélection gloutonne par score croissant avec
   contrainte de diversité — similarité de Jaccard sur les murs intérieurs
   < 0,70 entre tout couple de niveaux retenus (bordures exclues du calcul).
3. **Monde 4 (11 niveaux)** : générés de façon déterministe par
   `generateChallenge` (murs + **portes/interrupteurs**), 12 murs, 3 étoiles,
   score 130–225, même contrainte de diversité. **Critère supplémentaire : la
   solution optimale doit actionner la porte** (la mécanique ne peut pas être
   évitée) — vérifié par `commandsToggleDoor`.
4. **Monde 5 (11 niveaux)** : générés avec murs + **portes +
   téléporteurs**, 14 murs, 3 étoiles. **Critères supplémentaires** :
   - la solution optimale passe par au moins un warp (`commandsWarp`) ;
   - il existe une solution qui **se téléporte depuis les deux pads**
     (recherche BFS à drapeaux, `existsSolutionUsingBothPads` dans
     `MechanicCoverage.ts`) — garantit que le téléporteur fonctionne
     réellement dans les deux sens.

## Progression obtenue (score solveur)

| Monde | Thème          | Mécaniques                                       | Score début → fin |
| ----- | -------------- | ------------------------------------------------ | ----------------- |
| 1     | Découverte     | mouvement                                        | 10 → 66           |
| 2     | Positionnement | mouvement                                        | 66 → 106          |
| 3     | Coordination   | mouvement                                        | 108 → 129         |
| 4     | Combinaisons   | + portes/interrupteurs (action requise)          | 131 → 202         |
| 5     | Maîtrise       | + téléporteurs (bidirectionnels, action requise) | 210 → 334         |

## Plan détaillé

```
WORLD  ORDER  ID                    SRC   SCORE  MOVES
W1      1     world-1-level-01      cur     10  1
W1      2     world-1-level-02      cur     33  3
W1      3     world-1-level-03      cur     33  3
W1      4     world-1-level-04      cur     44  4
W1      5     world-1-level-05      cur     44  4
W1      6     world-1-level-06      cur     44  4
W1      7     world-1-level-07      cur     44  4
W1      8     world-1-level-08      cur     55  5
W1      9     world-1-level-09      cur     56  5
W1     10     world-1-level-10      cur     66  6
W1     11     world-1-level-11      cur     66  6
W2      1     world-2-level-01      cur     66  6
W2      2     world-2-level-02      cur     76  7
W2      3     world-2-level-03      cur     76  7
W2      4     world-2-level-04      cur     77  7
W2      5     world-2-level-05      cur     78  7
W2      6     world-2-level-06      cur     88  8
W2      7     world-2-level-07      cur     97  9
W2      8     world-2-level-08      cur     97  9
W2      9     world-2-level-09      cur     98  9
W2     10     world-2-level-10      cur     99  9
W2     11     world-2-level-11      cur    106  10
W3      1     world-3-level-01      cur    108  10
W3      2     world-3-level-02      cur    108  10
W3      3     world-3-level-03      cur    109  10
W3      4     world-3-level-04      cur    109  10
W3      5     world-3-level-05      cur    117  11
W3      6     world-3-level-06      cur    118  11
W3      7     world-3-level-07      cur    119  11
W3      8     world-3-level-08      cur    119  11
W3      9     world-3-level-09      cur    119  11
W3     10     world-3-level-10      cur    120  11
W3     11     world-3-level-11      cur    129  12
W4      1     seed 16       131  12
W4      2     seed 18       131  12
W4      3     seed 63       131  12
W4      4     seed 3        132  12
W4      5     seed 36       141  13
W4      6     seed 21       142  13
W4      7     seed 30       162  15
W4      8     seed 13       172  16
W4      9     seed 17       173  16
W4     10     seed 38       202  19
W4     11     seed 62       202  19
W5      1     seed 312      210  20
W5      2     seed 53       224  21
W5      3     seed 193      224  21
W5      4     seed 429      234  22
W5      5     seed 219      244  23
W5      6     seed 70       252  24
W5      7     seed 165      274  26
W5      8     seed 431      275  26
W5      9     seed 332      283  27
W5     10     seed 87       284  27
W5     11     seed 468      334  32
```

Les niveaux générés proviennent des seeds `generateChallenge(seed, ...)`
documentés ci-dessus (reproductibles : le générateur est déterministe par
seed). Les ids `challenge-<seed>-0` correspondent au contenu écrit dans
`packages/level-format/levels/world-0N/`.

## Garde-fous

- `packages/game/src/CampaignProgression.test.ts` : 55 niveaux solvables,
  scores monotones dans chaque monde, aucun monde ne démarre sous la fin du
  précédent.
- `packages/game/src/World4Doors.test.ts` : la solution optimale de chaque
  niveau du monde 4 actionne réellement sa porte.
- `packages/game/src/World5Teleporters.test.ts` : chaque niveau du monde 5
  passe par un warp dans sa solution optimale ET offre une solution qui se
  téléporte depuis les deux pads (`MechanicCoverage.ts`).
- `DifficultyRanking.test.ts` : classement global croissant.
