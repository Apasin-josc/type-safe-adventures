# SauceCode (web)

Aprende JavaScript con intuición, al estilo de las lecciones interactivas: una idea por pantalla, tocas y mueves cosas, y sabes al instante si vas bien.

## Abrir

Doble clic a `index.html`. No necesita servidor, internet ni `npm install`.

Las lecciones forman un camino que serpentea. Salsa, la mascota (una galga atigrada), se para en la lección que te toca y salta a la siguiente cada vez que terminas una. Toca cualquier parada para ver de qué trata.

Tu progreso y tu racha se guardan en el navegador donde lo abras.

## Qué hay

**Dos cursos, 22 lecciones**, cada uno dividido en unidades:

- **Algoritmos con intuición:** primeros pasos, patrones (ventana deslizante, hash maps) y recursión y árboles.
- **JavaScript a fondo:** en el orden de javascript.info, de fundamentos a objetos, arrays, closures, clases, errores y async.

La primera unidad de Algoritmos:

1. **Una fila de casilleros**: índices, `length`, leer fuera del array, el loop clásico.
2. **Contar pasos**: la intuición de Big O con cartas boca abajo y un slider de n, n² y log n.
3. **Partir a la mitad**: adivina el número, búsqueda binaria a mano y armarla con bloques.
4. **Dos punteros**: mueves L y R tú mismo y al final escribes `pairSum` en el navegador.

Tipos de pantalla: leer, opción múltiple, tocar un casillero, escribir un número, completar huecos con fichas, ordenar bloques de código (se prueban corriendo el código, así que cualquier orden correcto vale), seguir el código paso a paso, y retos interactivos (cartas, slider, adivinar, búsqueda binaria, dos punteros). El reto de código corre las pruebas dentro de tu navegador, con un límite de 2 segundos por si escribes un loop infinito.

## Agregar contenido

Las lecciones son datos en `content/`. Cada pantalla es un objeto con un `type` (ver `app/widgets.js`) y sus textos en `{ es, en }`. Para un curso nuevo, crea otro archivo en `content/` que haga `window.COURSES.push({...})` y agrégalo a `index.html`.

## Carpetas

| Carpeta | Contenido |
|---|---|
| `content/` | Los cursos (datos) |
| `app/app.js` | Camino de lecciones, reproductor de lecciones y progreso |
| `app/widgets.js` | Cada tipo de pantalla interactiva |
| `app/runner.js` | Corre tu código en un Web Worker |
| `app/editor.js`, `app/hl.js` | Editor de código y resaltado |
