# ⚔️ JS Quest

Curso personal de JavaScript para DSA y entrevistas, en forma de juego. Solo necesita Node 20 o más nuevo.

## Empezar

```bash
cd js/roadmap
npm install   # una sola vez
npm start
```

Se abre `http://127.0.0.1:4321`. Déjalo corriendo mientras estudias.

## El loop diario

1. **Lección** en la app: primero predices, luego ves la explicación y la animación.
2. **Quiz** del módulo: 5 preguntas de "¿qué imprime?". Con 4 de 5 dañas al mob.
3. **Ejercicio**: abres el archivo en `exercises/`, lees el enunciado (en inglés), escribes tu solución y le das a **Atacar** en la app. Los tests deciden.
4. Cuando el mob cae, aparece el **jefe**: dos problemas estilo entrevista.
5. Derrotar al jefe abre el siguiente módulo.

Cualquier cosa que completes (o intentes) en el día mantiene tu racha 🔥.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Abre la app y guarda tu progreso en `progress.json` |
| `npm run wifi` | Igual que `npm start`, pero también deja entrar a tu celular o iPad (con usuario y contraseña) |
| `npm run user -- add <nombre>` | Crea una cuenta. También: `passwd <nombre>`, `remove <nombre>`, `list` |
| `npm run check` | Corre todos tus ejercicios desde la terminal y actualiza el progreso |
| `npm run check -- m2` | Solo los del módulo 2 |
| `node --test exercises/m1-types/01-real-type.test.js` | Un solo ejercicio, con el detalle de cada test |

## En tu celular o iPad (modo Wi-Fi)

1. Crea tu cuenta una vez: `npm run user -- add papasin` (te pide una contraseña de 8 caracteres o más).
2. Arranca con `npm run wifi`. La terminal te muestra la dirección, algo como `http://192.168.1.29:4321`.
3. Ábrela en el celular, conectado al mismo Wi-Fi, y entra con tu usuario.

- La **primera cuenta es la del dueño**: usa tu `progress.json` y tu carpeta `exercises/` de siempre, así que en el celular ves el mismo progreso que en la Mac.
- Las demás cuentas tienen su progreso y sus ejercicios aparte, en `users/<nombre>/`.
- La Mac tiene que estar prendida con el servidor corriendo.
- Quien tenga cuenta puede correr código en tu Mac (eso son los tests). Dale cuenta solo a gente de confianza.
- La conexión no va cifrada: úsalo en la red de tu casa, no en un café.

## Modo dibujo ✍️

En cualquier ejercicio, el botón **Dibujar** abre una hoja para escribir el código a mano con el dedo, una pluma o el mouse. Al terminar, Claude lo pasa a texto y cae en el editor, con tus errores incluidos: si olvidaste un `;`, no te lo pone.

Necesita una API key de Anthropic. Crea un archivo `.env` en esta carpeta y reinicia el servidor:

```
ANTHROPIC_API_KEY=tu-key
```

Solo se manda la imagen de tu letra: Claude no ve el enunciado ni tu archivo. Cada lectura cuesta centavos de dólar. El archivo `.env` y `users.json` no se suben a git.

## Qué hay en cada carpeta

| Carpeta | Contenido |
|---|---|
| `exercises/` | **Tu zona de trabajo.** Un `.js` por ejercicio y su `.test.js` |
| `content/act1.js` | Las lecciones, quizzes y pistas (son datos; se pueden editar) |
| `app/` | La interfaz, el visualizador y el juego en pixel art |
| `users/` | Progreso y ejercicios de las cuentas que no son la del dueño |
| `.solutions/` | Soluciones de referencia. La app te las enseña **después** de pasar cada ejercicio. No hagas trampa 👀 |
| `progress.json` | Tu XP, racha y lo completado. Haz commit: tu racha queda en tu historial de git |

## Reglas de la casa

- **Predice antes de ver la respuesta.** Equivocarte en la predicción es justo lo que hace que se te quede.
- **Atórate al menos 10 minutos antes de pedir una pista.** Y antes de la pista, busca en MDN o javascript.info: cada lección trae los links.
- **Explica en voz alta** qué vas a hacer antes de teclear. En la entrevista te van a pedir eso mismo.
- Un poco diario le gana a un maratón semanal.

## Notas

- Si abres `index.html` con doble clic, las lecciones y quizzes funcionan, pero el progreso se queda en el navegador y no hay botón de ataque. Usa `npm start`.
- ¿Ya dominas un módulo y quieres saltártelo? Activa **Modo libre** al pie de la app.
- Las lecciones enlazan a la versión en inglés de javascript.info. Existe en español en `es.javascript.info` con las mismas rutas.

## Ruta

- **Acto I · JavaScript por dentro** (listo): tipos y coerción, scope y closures, `this` y prototipos, async y event loop.
- **Acto II · Herramientas de DSA**: Big O, arrays y strings, hash maps, two pointers y sliding window.
- **Acto III · Estructuras de datos**: stack y queue, linked lists, árboles, heaps, grafos.
- **Acto IV · Patrones FAANG**: backtracking, binary search, BFS/DFS, programación dinámica, mock interviews.

Los actos II a IV se construyen al terminar el I, ajustados a lo que te costó y lo que te enganchó.
