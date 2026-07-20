# Pictogrammes — Les Roues Solidaires

4 pictos SVG animés (hover), un par dimension. Design system : couleurs `--oc-*` (voir tokens ci-dessous si le projet cible n'a pas déjà ce design system).

## Fichiers
- `picto-<nom>.svg` — asset statique (sans animation), utilisable en `<img src>`.
- `picto-<nom>-inline-snippet.html` — SVG + CSS avec le hover fonctionnel. **À inliner directement dans le HTML/JSX** (jamais en `<img src>`, sinon :hover ne peut pas atteindre l'intérieur du SVG). Le `<style>` ne se colle qu'une fois par page ; le `<svg>` peut être répété.

## Couleurs utilisées (tokens du design system)
- Moteur : #FFC50A / #FFE89E (hex direct, pas de token dédié)
- Sensoriel : --oc-sensoriel #C64B3B / --oc-sensoriel-tint #F4D9D3
- Cognitif : --oc-cognitif #2E8C6A / --oc-cognitif-tint #CFE7DC
- Lien social : #7084c1 / #4a5a8a (hex direct)

Si ces variables CSS n'existent pas dans le projet cible, soit les définir, soit remplacer par les valeurs hex indiquées.

## Comportement au survol
- Moteur : l'écho (silhouette claire derrière l'éclair) vibre/tremble.
- Sensoriel : les 4 rayons + 2 points autour de l'œil scintillent.
- Cognitif : les 4 courbes internes s'épaississent et de petits points "bubbly" apparaissent en pulsant.
- Lien social : la silhouette de droite (foncée) se décale légèrement.
