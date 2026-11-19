# Pistas de Salsa 🐾

A small server that runs on your Mac. When you fail a code challenge in SauceCode, the app sends it your code and the failing tests. The server asks Claude for **one short hint**, never the solution.

Your API key **stays on your Mac**. The app only knows the server's address and a token.

## Run it

```bash
cd chispa-app/hint-server
npm install        # only the first time
npm start
```

The key is read from `hint-server/.env` (`ANTHROPIC_API_KEY=...`). If that file doesn't exist, it uses the one in `js/roadmap/.env`. Both are ignored by git.

The first time it starts, it creates `.token` with a random token (also ignored by git). Build the app with that token:

```bash
cd chispa-app
flutter build ios --release --dart-define=HINT_TOKEN=$(cat hint-server/.token)
```

By default the app looks for `http://QUE-PADRE.local:8787`. To use another Mac, add `--dart-define=HINT_URL=http://other-mac.local:8787`.

## How it works

| | |
|---|---|
| `POST /hint` | `{lang, prompt, code, fails:[{call, expected, got}], error}` → `{hint}` (requires `Authorization: Bearer <token>`) |
| `GET /health` | `{ok, key}` |

- Limit: 30 hints per minute, and requests up to 40 KB.
- Model: `claude-opus-5-5` with low effort, so hints arrive in a few seconds. To change it, set `SALSA_MODEL=...`.
- The iPhone has to be on the same Wi-Fi as the Mac. The first time, iOS asks for permission to use the local network.
