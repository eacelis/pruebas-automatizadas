# Cypress Random Tester (Monkey)

Este repositorio contiene el código para un monkey aleatorio desarrollado utilizando [Cypress](https://www.cypress.io/), un ejecutor de pruebas End to End construido sobre JavaScript. Usamos esta tecnología debido a la facilidad para gestionar páginas web en una variedad de navegadores, incluyendo Chrome, Canary, Edge, Electron, etc., y su funcionalidad de grabar y reproducir. La idea del primer monkey es realizar una prueba completamente aleatoria en una aplicación web, inspirado en un monkey similar, el [Android Monkey](https://developer.android.com/studio/test/monkey). El segundo monkey existe debido a la alta tasa de errores y la baja probabilidad de obtener eventos que cambien el estado de la aplicación del monkey Monkey.

Este repositorio está basado en la implementación de [TheSoftwareDesignLab/monkey-cypress](https://github.com/TheSoftwareDesignLab/monkey-cypress).

## Requisitos

- **Node.js**: v22 o superior (Recomendado `lts`).
- **npm**: v9.x o superior.
- **Docker**: Requerido para levantar Ghost localmente.
- **ABP (Ghost 5.130.2)**: Corriendo en `http://localhost:2368`.

## Cómo ejecutar

### Levantar la ABP (Ghost)

Para que las herramientas puedan realizar el login sin verificación de dispositivo, es necesario levantar el contenedor con la siguiente variable de seguridad:

```bash
docker run -d \
  --name ghost \
  -p 2368:2368 \
  -e NODE_ENV=development \
  -e security__staffDeviceVerification=false \
  -v ghost-data:/var/lib/ghost/content \
  ghost:5.130.2
```

O con Docker Compose, creando el archivo 'docker-compose.yml' con el siguiente contenido:

```bash
version: '3.8'

services:
  ghost:
    image: ghost:5.130.2
    container_name: ghost
    restart: always
    ports:
      - "2368:2368"
    environment:
      - NODE_ENV=development
      - security__staffDeviceVerification=false
    volumes:
      - ghost-data:/var/lib/ghost/content

volumes:
  ghost-data:
```

Luego ejecutando el siguiente comando desde su ubicación:

```bash
docker compose up -d
```

Y verificar que Ghost esté disponible en: http://localhost:2368/ghost

### Adaptaciones Realizadas al Código

#### `cypress/e2e/monkey.cy.js` — Login como pre-condición

Se extendió el bloque `before()` para incluir autenticación en Ghost Admin antes de la exploración pseudo-aleatoria. El cuerpo de la prueba (`it("test random events")`) no fue modificado.

El `before()` realiza:

1. Inicializa el PRNG (`jsf32`) y `faker` con la semilla del entorno.
2. Configura el viewport.
3. Navega a `/ghost/#/signin` y completa el login usando los selectores `data-test-input='email'`, `data-test-input='password'` y `data-test-button='sign-in'`.
4. Confirma que la URL resultante incluye `/ghost/#/dashboard`.

#### Nuevos archivos — Un spec por funcionalidad

Se crearon 5 archivos spec independientes en `cypress/e2e/`, uno por sección del admin de Ghost. Cada archivo usa una semilla específica del objeto `seeds` en `cypress.config.js` para garantizar reproducibilidad independiente entre funcionalidades.

| Archivo                  | Describe              | SEED (desde config) | Ruta post-login      |
| ------------------------ | --------------------- | ------------------- | -------------------- |
| `monkey-dashboard.cy.js` | monkey - F1 Dashboard | `seeds.dashboard`   | `/ghost/#/dashboard` |
| `monkey-posts.cy.js`     | monkey - F2 Posts     | `seeds.posts`       | `/ghost/#/posts`     |
| `monkey-pages.cy.js`     | monkey - F3 Pages     | `seeds.pages`       | `/ghost/#/pages`     |
| `monkey-tags.cy.js`      | monkey - F4 Tags      | `seeds.tags`        | `/ghost/#/tags`      |
| `monkey-members.cy.js`   | monkey - F5 Members   | `seeds.members`     | `/ghost/#/members`   |

Cada spec:

- Importa `faker` de `@faker-js/faker` y define `jsf32` localmente.
- Inicializa el PRNG con `jsf32(0xf1ae533d, SEED, SEED, SEED)` y `faker.seed(SEED)`.
- Realiza login en `before()` y navega a su sección objetivo después de autenticar.
- Tiene un bloque `it("test random events")` idéntico al del archivo original.
- Lee `delay` y `actions` desde `Cypress.env()` (sin cambiar `cypress.config.js`).

### Instalación

Para usar el monkey, debes seguir los siguiente pasos de instalación:

```bash
cd misw-4103-monkey
npm install
npm run prepare
```

### Ejecución y Reportes

Para ejecutar todas las pruebas y generar un reporte consolidado con todos los tests:

```bash
npm test
```

Este comando:

1. Limpia reportes anteriores (`clean:reports`)
2. Ejecuta todos los tests de Cypress
3. Combina todos los reportes JSON individuales en uno consolidado
4. Genera el reporte HTML final en `cypress/results/monkey-report-full.html`

#### Reportes Generados

- **Reportes individuales**: `cypress/results/monkey-test-*.json` (uno por test)
- **Reporte consolidado**: `cypress/results/merged-report.json`
- **Reporte HTML final**: `cypress/results/monkey-report-full.html`

El reporte HTML consolidado contiene todos los tests ejecutados, con logs completos, evidencia de screenshots/videos, y trazabilidad de cada acción realizada.

#### Ejecución Individual

Si deseas ejecutar un test específico:

```bash
npx cypress run --spec "cypress/e2e/monkey-dashboard.cy.js"
```

Nota: El navegador predeterminado es Electron 78 en modo headless. Para probar con otro navegador, ejecuta con el siguiente comando: `cross-env BROWSER=nombreNavegador npm test`, indicando cuál de los [navegadores soportados](https://docs.cypress.io/guides/guides/launching-browsers.html#Browsers) deseas usar.

### Configuración

La carpeta raíz del módulo contiene el archivo de configuración de Cypress (`cypress.config.js`), que incluye los parámetros del monkey aleatorio.

| Parámetro                        | Descripción                      | Ejemplo                    |
| -------------------------------- | -------------------------------- | -------------------------- |
| `baseUrl`                        | URL de la ABP                    | `http://localhost:2368`    |
| `viewportWidth`                  | Ancho del viewport fijo          | `1920`                     |
| `viewportHeight`                 | Alto del viewport fijo           | `1080`                     |
| `env.seeds.dashboard`            | Semilla para Dashboard           | `0xf1ae533d`               |
| `env.seeds.posts`                | Semilla para Posts               | `0xdeadbeef`               |
| `env.seeds.pages`                | Semilla para Pages               | `0xcafe1234`               |
| `env.seeds.tags`                 | Semilla para Tags                | `0xabad1dea`               |
| `env.seeds.members`              | Semilla para Members             | `0x1337c0de`               |
| `env.delay`                      | Milisegundos entre eventos       | `1000`                     |
| `env.adminEmail`                 | Email del administrador Ghost    | `cientificstudy@gmail.com` |
| `env.adminPassword`              | Contraseña del administrador     | `ingeniero1999`            |
| `env.actions.click`              | Número de eventos de clic        | `0`                        |
| `env.actions.scroll`             | Número de eventos de scroll      | `10`                       |
| `env.actions.keypress`           | Número de eventos de teclado     | `0`                        |
| `env.actions.viewport`           | Número de cambios de viewport    | `2`                        |
| `env.actions.navigation`         | Número de eventos de navegación  | `8`                        |
| `env.actions.smartClick`         | Número de clics inteligentes     | `20`                       |
| `env.actions.smartCleanup`       | Número de limpiezas inteligentes | `0`                        |
| `env.actions.smartInput`         | Número de inputs inteligentes    | `5`                        |
| `reporterOptions.reportFilename` | Patrón nombre reportes           | `monkey-test-[datetime]`   |
| `reporterOptions.overwrite`      | Sobrescribir reportes            | `false`                    |

Las acciones o eventos anteriores se describen a continuación:

- **Eventos de Clic Aleatorio**: Clic izquierdo, derecho o doble clic, así como desplazamientos (_mouseover_) realizados a un elemento desde una posición aleatoria.
- **Eventos de Desplazamiento**: Desplazar la página hacia arriba, abajo, a la izquierda o a la derecha.
- **Eventos de Teclado**: Introducir un carácter (alfanumérico) o un carácter especial (`Enter`, `Supr`, `Esc`, `Backspace`, `Flechas`) con modificadores (`Shift`, `Alt` o `Ctrl`) dentro de un elemento enfocado. Es equivalente a presionar una tecla del teclado al enfocar un elemento.
- **Eventos de Navegación de Página**: Navegación típica que un usuario podría realizar, como ir a la página anterior o a la siguiente en la pila de navegación.
- **Eventos del Navegador**: Eventos que cambian la configuración del navegador, como cambiar el tamaño de la ventana.

Adicionalmente, hay 3 categorías _más inteligentes_ que pueden incluirse en las ejecuciones:

- **Eventos de Clic Aleatorio Inteligente**: Clic izquierdo, derecho o doble clic, así como desplazamientos (_mouseover_) realizados a un elemento _clickeable_ (`<a>`, `<button>`, `<input>`).
- **Eventos de Limpieza Inteligente**: Eventos que limpian la configuración del navegador (cookies, almacenamiento local) o limpian un campo `<input>`.
- **Entrada Inteligente**: Introduce diferentes tipos de valores (frases, correos electrónicos, contraseñas, fechas, números) en un campo `<input>` dependiendo de su tipo.

#### Ejemplo del contenido del archivo:

```javascript
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "monkey-cypress.io.github.thesoftwaredesignlab",
  reporter: require.resolve("mochawesome"),
  reporterOptions: {
    reportDir: "cypress/results",
    reportFilename: "monkey-test-[datetime]",
    overwrite: false,
    json: true,
    charts: true,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:2368",
    viewportWidth: 1920,
    viewportHeight: 1080,
  },
  env: {
    // Semillas específicas por funcionalidad para patrones diferenciados
    seeds: {
      dashboard: 0xf1ae533d, // F1 Dashboard
      posts: 0xdeadbeef, // F2 Posts
      pages: 0xcafe1234, // F3 Pages
      tags: 0xabad1dea, // F4 Tags
      members: 0x1337c0de, // F5 Members
    },
    delay: 1000, // Delay between action executions

    // Credenciales Ghost Admin
    adminEmail: "cientificstudy@gmail.com",
    adminPassword: "ingeniero1999",

    actions: {
      click: 0, // Hovers and clicks (single, double, right) on a random position
      scroll: 10, // Scrolls (horizontal and vertical)
      keypress: 0, // Alphanumeric and special keys
      viewport: 2, // Change in viewports and orientation
      navigation: 8, // Reload, go back, go forward
      smartClick: 20, // Hovers and clicks (single, double, right) on clickable elements
      smartCleanup: 0, // Clears inputs, cookies and local storage
      smartInput: 5, // Fills input tags with fake data (multi-character)
    },
  },
  pageLoadTimeout: 120000,
  screenshotsFolder: "cypress/results/screenshots",
  videosFolder: "cypress/results/videos",
  video: true,
  videoCompression: 32,
});
```

### Otras formas de Ejecución

Los comandos para ejecutar las pruebas deben ejecutarse desde la **raíz del repositorio**.

```bash
# Spec original (monkey.cy.js) — modo headless
npm run test

# Spec original — modo UI (con interfaz gráfica de Cypress)
npm run test:ui

# Correr un spec específico por funcionalidad
npx cypress run --spec "cypress/e2e/monkey-posts.cy.js"

# Correr todos los specs de funcionalidad (F1–F5) en modo headless
npx cypress run --spec "cypress/e2e/monkey-dashboard.cy.js,cypress/e2e/monkey-posts.cy.js,cypress/e2e/monkey-pages.cy.js,cypress/e2e/monkey-tags.cy.js,cypress/e2e/monkey-members.cy.js"
```

### Semillas documentadas

| Spec                     | Semilla      | Funcionalidad |
| ------------------------ | ------------ | ------------- |
| `monkey-dashboard.cy.js` | `0xf1ae533d` | F1 Dashboard  |
| `monkey-posts.cy.js`     | `0xdeadbeef` | F2 Posts      |
| `monkey-pages.cy.js`     | `0xcafe1234` | F3 Pages      |
| `monkey-tags.cy.js`      | `0xabad1dea` | F4 Tags       |
| `monkey-members.cy.js`   | `0x1337c0de` | F5 Members    |

> [!IMPORTANT]
>
> **Reproducibilidad**: Cada funcionalidad usa una semilla específica para garantizar que los patrones de acción sean consistentes entre ejecuciones, pero diferenciados entre funcionalidades. El viewport está fijado en 1920x1080 para asegurar consistencia en diferentes dispositivos.

### Resultados y Reportes

El monkey está configurado para usar [Mochawesome](https://www.npmjs.com/package/cypress-mochawesome-reporter) como herramienta de reporte con combinación automática de reportes. Por defecto, el reporte contendrá la secuencia de eventos ejecutados, videos de la ejecución y evidencia completa de todos los tests.

Los reportes quedan en `cypress/results/` (o según la configuración de `cypress.config.js`):

- `monkey-report-full.html` — **Reporte HTML consolidado** con todos los tests (Dashboard, Posts, Pages, Tags, Members)
- `merged-report.json` — Reporte JSON consolidado
- `monkey-test-*.json` — Reportes JSON individuales por test
- `videos/` — Grabaciones de cada ejecución
- `screenshots/` — Capturas en caso de fallo

#### Generación de Reportes Consolidados

Para generar un reporte completo con todos los tests:

```bash
npm test  # Ejecuta todos los tests y combina los reportes automáticamente
```

El comando `npm test` realiza automáticamente:

1. Limpia reportes anteriores
2. Ejecuta todos los 5 tests de funcionalidad
3. Combina todos los reportes JSON en uno consolidado
4. Genera el reporte HTML final con toda la información

> [!NOTE]
>
> - Los reportes consolidados solo se generan para ejecuciones en modo headless.
> - Para ejecuciones largas, el video puede deshabilitarse en la configuración de Cypress (`video: false`), o la compresión puede modificarse para reducir el tamaño del archivo (`videoCompression`).
> - La reproducibilidad está garantizada por la semilla (`SEED`) de cada spec. Con la misma semilla y el mismo estado inicial de Ghost, la secuencia de eventos será idéntica. Los specs F1–F5 tienen semillas hardcodeadas; el spec original usa `env.seed` de `cypress.config.js`.
