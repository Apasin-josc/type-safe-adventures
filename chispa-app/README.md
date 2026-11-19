# SauceCode (app de iPhone)

La versión en Flutter de `brilliant-js` (Chispa): el mismo curso, pero como app en tu teléfono. Salsa, la mascota, te espera en el camino y salta a la siguiente lección cada vez que terminas una.

## Instalarla en tu iPhone por Wi-Fi

Tu iPhone tiene que estar en la misma red que la Mac y ya emparejado con Xcode (lo está si alguna vez instalaste yellow así).

```bash
cd chispa-app
flutter devices                      # busca tu iPhone en la lista y copia su id
flutter run --release -d <id-del-iphone>
```

Cuando termine de instalar, puedes cortar con `q`: la app se queda en tu teléfono. Como se firma con tu cuenta de Apple Developer, dura un año sin reinstalar.

Si tu iPhone no aparece: conéctalo una vez con cable, abre Xcode → Window → Devices and Simulators y activa "Connect via network".

## Comandos

| Comando | Qué hace |
|---|---|
| `flutter run -d <id>` | Corre en modo desarrollo (con recarga en caliente) |
| `flutter run --release -d <id>` | Instala la versión rápida, la que se queda en tu teléfono |
| `flutter test` | Pruebas: el motor de código y un recorrido completo de la lección 1 |
| `flutter test integration_test -d <id>` | Las mismas pruebas, pero dentro de un iPhone o simulador |
| `node tool/export_content.js` | Copia las lecciones de `../brilliant-js/content/` a la app |
| `flutter test tool/icon_test.dart` | Vuelve a dibujar el ícono (`tool/icon-1024.png`) |

## Cómo está armada

| Carpeta | Contenido |
|---|---|
| `assets/courses/` | Los cursos en JSON (salen de `brilliant-js/content/`, no se editan a mano) |
| `lib/data/` | Modelos, progreso (`ProgressRepository`) y el motor que corre tu código |
| `lib/screens/` | El camino (`home_screen.dart`) y el reproductor de lecciones |
| `lib/steps/` | Cada tipo de pantalla interactiva; `registry.dart` las conecta con su `type` |
| `lib/ui/` | Tema, textos ES/EN, Salsa, botones y resaltado de código |

**El progreso** se guarda en el teléfono. Todo pasa por `ProgressRepository`: el día que haya login, una implementación nueva que sincronice con un servidor reemplaza a `LocalProgressRepository` y el resto de la app no cambia.

**El reto de código** corre en el motor de JavaScript del iPhone, en un hilo aparte. Cada loop lleva un contador que lo corta después de 5 millones de vueltas, así un loop infinito no congela la app.

**Para capturas:** `--dart-define=START=/lesson/algos/binary --dart-define=STEP=6` abre la app directo en esa pantalla.
