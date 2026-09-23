# Campagne 2026-09-23 — révision des niveaux par monde

Ce document remplace `campaign-plan-2026-09-13.md` : les mondes 4 et 5 ont
changé de thème (les téléporteurs arrivent en monde 4, les portes en monde 5)
et les contraintes de progression ont été renforcées.

## Spec appliquée

| Monde | Thème          | Nouveautés                | Contraintes                                                                                               |
| ----- | -------------- | ------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1     | Découverte     | balle seule               | aucun carré ; feu à partir du niveau 05                                                                   |
| 2     | Positionnement | carré (il apparaît)       | finissable **sans jamais bouger le carré** (il ne fait que s'afficher) ; feu dès le niveau 05             |
| 3     | Coordination   | interaction balle ↔ carré | le carré est requis (aucune solution balle seule) **et doit être déplacé** ; feu dès le niveau 05         |
| 4     | Téléporteurs   | téléporteurs              | L01 balle + téléporteur ; L02+ carré + téléporteur ; warp dans l'optimal + solution traversant les 2 pads |
| 5     | Portes         | portes                    | L01 balle + porte ; L02–04 carré + porte ; L05+ les 4 éléments ; porte actionnée + warp + 2 pads          |

Dans tous les mondes : score (et coups) croissants niveau à niveau, et les
**fins de mondes strictement croissantes** : 134 < 167 < 372 < 394 < 406.

## Progression obtenue (score solveur)

| Monde | Thème          | Mécaniques en plus            | Score début → fin |
| ----- | -------------- | ----------------------------- | ----------------- |
| 1     | Découverte     | mouvement, feu dès L05        | 11 → 134          |
| 2     | Positionnement | + carré (fixe), feu dès L05   | 53 → 167          |
| 3     | Coordination   | + carré déplacable requis     | 68 → 372          |
| 4     | Téléporteurs   | + téléporteurs (2 pads)       | 64 → 394          |
| 5     | Portes         | + portes, combinatoire finale | 86 → 406          |

Les fourchettes se chevauchent volontairement entre mondes (un puzzle de
positionnement difficile peut dépasser un puzzle de coordination facile) :
seule la fin de chaque monde doit progresser.

## Plan détaillé

`fixe` = le niveau reste finissable sans bouger le carré (contrainte en monde
2, inversée en monde 3, mesuré pour 4–5 ; `n/a` sans carré).

```
WORLD  ORDER  ID                   SCORE  MOVES  FEU  CARRE  FIXE  PORTE  TP
W1      1     world-1-level-01       11     1     0    -      n/a   0      0
W1      2     world-1-level-02       32     3     0    -      n/a   0      0
W1      3     world-1-level-03       32     3     0    -      n/a   0      0
W1      4     world-1-level-04       32     3     0    -      n/a   0      0
W1      5     world-1-level-05       42     4     2    -      n/a   0      0
W1      6     world-1-level-06       53     5     3    -      n/a   0      0
W1      7     world-1-level-07       63     6     3    -      n/a   0      0
W1      8     world-1-level-08       73     7     4    -      n/a   0      0
W1      9     world-1-level-09       85     8     4    -      n/a   0      0
W1     10     world-1-level-10      103    10     3    -      n/a   0      0
W1     11     world-1-level-11      134    13     6    -      n/a   0      0
W2      1     world-2-level-01       53     5     0    y      oui   0      0
W2      2     world-2-level-02       63     6     0    y      oui   0      0
W2      3     world-2-level-03       63     6     0    y      oui   0      0
W2      4     world-2-level-04       66     6     0    y      oui   0      0
W2      5     world-2-level-05       73     7     2    y      oui   0      0
W2      6     world-2-level-06       83     8     3    y      oui   0      0
W2      7     world-2-level-07       97     9     1    y      oui   0      0
W2      8     world-2-level-08      105    10     4    y      oui   0      0
W2      9     world-2-level-09      118    11     4    y      oui   0      0
W2     10     world-2-level-10      147    14     5    y      oui   0      0
W2     11     world-2-level-11      167    16     6    y      oui   0      0
W3      1     world-3-level-01       68     6     0    y      non   0      0
W3      2     world-3-level-02       89     8     0    y      non   0      0
W3      3     world-3-level-03       99     9     0    y      non   0      0
W3      4     world-3-level-04      107    10     0    y      non   0      0
W3      5     world-3-level-05      108    10     2    y      non   0      0
W3      6     world-3-level-06      108    10     3    y      non   0      0
W3      7     world-3-level-07      118    11     1    y      non   0      0
W3      8     world-3-level-08      137    13     4    y      non   0      0
W3      9     world-3-level-09      149    14     4    y      non   0      0
W3     10     world-3-level-10      168    16     2    y      non   0      0
W3     11     world-3-level-11      372    36     6    y      non   0      0
W4      1     world-4-level-01       64     6     0    -      n/a   0      2
W4      2     world-4-level-02       90     8     0    y      oui   0      2
W4      3     world-4-level-03      111    10     0    y      non   0      2
W4      4     world-4-level-04      128    12     0    y      oui   0      2
W4      5     world-4-level-05      141    13     0    y      non   0      2
W4      6     world-4-level-06      172    16     0    y      non   0      2
W4      7     world-4-level-07      172    16     0    y      non   0      2
W4      8     world-4-level-08      186    17     0    y      oui   0      2
W4      9     world-4-level-09      201    19     0    y      oui   0      2
W4     10     world-4-level-10      221    21     0    y      non   0      2
W4     11     world-4-level-11      394    38     0    y      non   0      2
W5      1     world-5-level-01       86     8     0    -      n/a   1      0
W5      2     world-5-level-02      100     9     0    y      oui   1      0
W5      3     world-5-level-03      122    11     0    y      oui   1      0
W5      4     world-5-level-04      131    12     0    y      non   1      0
W5      5     world-5-level-05      151    14     0    y      non   1      2
W5      6     world-5-level-06      163    15     0    y      non   1      2
W5      7     world-5-level-07      175    16     0    y      non   1      2
W5      8     world-5-level-08      192    18     0    y      non   1      2
W5      9     world-5-level-09      215    20     0    y      non   1      2
W5     10     world-5-level-10      235    22     0    y      non   1      2
W5     11     world-5-level-11      406    39     0    y      non   1      2
```

## Outil de rebuild

`packages/game/src/campaign-rebuild.test.ts` reconstruit chaque monde à partir
d'un pool de candidats (les niveaux sur disque + `world3Refined`) puis de
graines déterministes `generateChallenge`, sous contrainte de fenêtre de score
et des règles du monde (`fire`, `requiresSquare`, `squareStill`, `doors`,
`teleporters`, `warps`, `bothPads`, `prefer`). La suite est ignorée sans
`REBUILD=1` car elle coûte plusieurs minutes de solveur :

```sh
REBUILD=1 npx vitest run src/campaign-rebuild.test.ts                          # vérifie
REBUILD=1 WRITE_LEVELS=1 npx vitest run src/campaign-rebuild.test.ts           # écrit
REBUILD=1 WRITE_LEVELS=1 npx vitest run src/campaign-rebuild.test.ts -t 'world 2'
```

## Garde-fous (tests CI)

- `CampaignProgression.test.ts` : 55 niveaux solvables, scores monotones dans
  chaque monde, fins de mondes strictement croissantes.
- `World1Discovery.test.ts` : pas de carré ; feu dès L05.
- `World2Positioning.test.ts` : carré présent ; feu dès L05 ; chaque niveau se
  termine **sans bouger le carré** (`existsSolutionWithoutMovingSquare`).
- `World3Coordination.test.ts` : aucune solution balle seule + aucun niveau
  finissable sans bouger le carré (double verrou d'interaction).
- `World4Teleporters.test.ts` : warp optimal + solution traversant les deux
  pads sur chaque niveau ; L01 sans carré.
- `World5Doors.test.ts` : porte actionnée dans chaque optimal ; warp quand
  `teleporters > 0` ; deux pads ; L01 sans carré ni téléporteur.
- `DifficultyRanking.test.ts` : classement global croissant.

## Notes

- En W4 (L02, L04, L08, L09) et W5 (L02, L03), le carré peut encore rester en
  place : cela enseigne d'abord le nouveau mécanisme (téléporteur/porte) avant
  d'exiger la double forme. Le verrou « carré déplacé requis » n'est appliqué
  qu'en W3.
- Les fenêtres de score par niveau vivent dans `campaign-rebuild.test.ts` :
  les ajuster puis relancer le rebuild suffit à régénérer un monde.
