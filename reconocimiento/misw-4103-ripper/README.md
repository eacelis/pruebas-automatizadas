# Playwirght Random Tester (GUI Ripper)

Este repositorio contiene el código para un GUI Ripper desarrollado utilizando [Playwright](https://playwright.dev/) un ejecutor de pruebas End to End construido sobre JavaScript.

Este repositorio está basado en la implementación de [TheSoftwareDesignLab/RIPuppetCoursera](https://github.com/TheSoftwareDesignLab/RIPuppetCoursera).

## Requisitos

* **Node.js**: v22 o superior (Recomendado `lts`).
* **npm**: v9.x o superior.
* **Docker**: Requerido para levantar Ghost localmente.
* **ABP (Ghost 5.130.2)**: Corriendo en `http://localhost:2368`.

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

## Modificaciones al código base

Se realizaron múltiples modificaciones a `index.js` para adaptar RIPuppet al admin de Ghost, que es una SPA (Single Page Application) construida con Ember.js y requiere autenticación previa.

### Cambio No. 1 — Detección de navegación post-interacción (`index.js`)

**Problema:** `scrapLinks()` se ejecutaba _antes_ de `interactWithObjects()`. En la página de signin no hay `<a href>` links, por lo que `links = []`. Tras el login, el browser navegaba al dashboard, pero el `for` loop ya tenía la lista vacía y no exploraba nada.

**Solución:** Después de `interactWithObjects()`, se espera `networkidle` y se compara la URL actual con la de origen. Si cambió (navegación post-login), la nueva URL se agrega al array `links` antes del loop de recursión:

```js
await page.waitForLoadState("networkidle").catch(() => {});
const landedUrl = page.url();
if (landedUrl !== link && !links.includes(landedUrl)) {
  links.push(landedUrl);
}
```

### Cambio No. 2 — Verificación de dominio con fragmento hash (`index.js`)

**Problema:** El Ripper se desviaba a páginas externas (redes sociales, docs de Ghost) si el enlace contenía la URL del host como parámetro. Además, las rutas del admin como `/ghost/#/dashboard` eran a veces ignoradas si el check de dominio era muy estricto o muy laxo.

**Solución:** Se define `baseDomain` forzando el path `/ghost/`. Esto asegura que el Ripper no se escape al blog público ni a sitios externos, y se utiliza `startsWith` en lugar de `includes` para mayor seguridad:

```js
const _parsedBase = new URL(baseUrl);
const baseDomain = _parsedBase.origin + "/ghost/";

// ... luego en la exploración ...
if (link.startsWith(baseDomain)) { ... }
```

El check se cambió de `link.includes(baseUrl)` a `link.includes(baseDomain)`.

### Función `loginGhost` — Login como pre-condición (`index.js`)

Se agregó la función `loginGhost(page)` que ejecuta el login en Ghost Admin _antes_ de que comience la exploración recursiva. El login no forma parte del grafo de estados explorado.

```
loginGhost navega a:    http://localhost:2368/ghost/#/signin
Usa selectores:         [data-test-input='email']
                        [data-test-input='password']
                        [data-test-button='sign-in']
Espera confirmación:    page.waitForURL("**/ghost/#/dashboard", { timeout: 15000 })
```

Las credenciales se leen de `config.json > values > identification` y `password`. La función se llama en el IIFE principal si `baseUrl` contiene `/ghost/`.

### Auto-dismiss del modal "Unsaved changes" (`index.js`)

Ghost muestra un modal `[data-test-modal="unsaved-post-changes"]` al intentar navegar fuera de un post/página sin guardar. Se registró un handler con `page.addLocatorHandler()` que hace click automáticamente en "Leave" cada vez que el modal bloquea una acción:

```js
await page.addLocatorHandler(
  page.locator('[data-test-modal="unsaved-post-changes"]'),
  async () => {
    await page.locator("[data-test-leave-button]").click();
  },
);
```

### Escape de la sección Settings (`index.js`)

La sección `/ghost/#/settings` es una SPA profunda que causaba scroll infinito al no encontrar más nodos para explorar. Se agregó un guard al inicio de `recursiveExploration`: si la URL aterriza en settings, se hace click en el botón Close (`[data-testid="exit-settings"]`) y se retorna sin explorar esa sección:

```js
if (page.url().includes("/ghost/#/settings")) {
  await page
    .locator('[data-testid="exit-settings"]')
    .click()
    .catch(() => {});
  await page.waitForLoadState("networkidle").catch(() => {});
  return;
}
```

### Script `run-all.js` — Ejecución secuencial de las 5 funcionalidades

Se creó `run-all.js` en la raíz del proyecto para ejecutar RIPuppet 5 veces de forma secuencial, una por funcionalidad. Cada ejecución:

1. Escribe un `config.json` temporal con la URL de la sección objetivo.
2. Ejecuta `node index.js` y espera a que termine.
3. Detecta la carpeta de resultados nueva en `results/` y la renombra a su nombre de funcionalidad.
4. Al terminar todas, restaura el `config.json` original.

Las credenciales se leen de variables de entorno (nunca hardcodeadas):

- `GHOST_EMAIL` → campo `identification` del config
- `GHOST_PASSWORD` → campo `password` del config

### Script `test:all` en `package.json`

Se agregó el script `"test:all": "node run-all.js"` al `package.json`.


## Cómo ejecutar

Para usar el GUI Ripper, debes seguir estos pasos:

- **Instalar los módulos requeridos**

  Desde la **raíz del repositorio**:

### Instalación

```bash
cd misw-4103-ripper
npm install
npm run prepare
```

### Configuración

El archivo `config.json` controla el comportamiento base. Al usar `run-all.js`, este archivo se reemplaza temporalmente por cada ejecución y se restaura al finalizar.

| Parámetro               | Descripción                        | Valor configurado                      |
| ----------------------- | ---------------------------------- | -------------------------------------- |
| `url`                   | URL inicial de exploración         | Sección objetivo de cada funcionalidad |
| `headless`              | Modo sin interfaz gráfica          | `false`                                |
| `depthLevels`           | Profundidad máxima del grafo       | `2`                                    |
| `inputValues`           | Usar valores definidos en `values` | `true`                                 |
| `values.identification` | Email para el login                | Inyectado desde `GHOST_EMAIL`          |
| `values.password`       | Contraseña para el login           | Inyectado desde `GHOST_PASSWORD`       |
| `browsers`              | Navegadores a usar                 | `["chromium"]`                         |

### Ejecución

```bash
# Correr las 5 funcionalidades secuencialmente
GHOST_EMAIL=admin@example.com GHOST_PASSWORD=yourpassword npm run test:all
# En Windows CMD el comando cambia por:
set GHOST_EMAIL=admin@example.com&& set GHOST_PASSWORD=yourpassword&& npm run test:all

# Correr solo una funcionalidad (F1, F2, F3, F4 o F5)
GHOST_EMAIL=admin@example.com GHOST_PASSWORD=yourpassword node run-all.js F3

# Correr una sola ejecución con el config.json actual
npm test
```

**Nota:** Si se requiere modificar la URL Base, se debe realizar en la constante `BASE_URL` del artchivo `run-all.js`.

### URLs de exploración por funcionalidad

| ID  | Funcionalidad | URL de inicio                             | Carpeta de resultados   |
| --- | ------------- | ----------------------------------------- | ----------------------- |
| F1  | Dashboard     | `http://localhost:2368/ghost/#/dashboard` | `results/F1-dashboard/` |
| F2  | Posts         | `http://localhost:2368/ghost/#/posts`     | `results/F2-posts/`     |
| F3  | Pages         | `http://localhost:2368/ghost/#/pages`     | `results/F3-pages/`     |
| F4  | Tags          | `http://localhost:2368/ghost/#/tags`      | `results/F4-tags/`      |
| F5  | Members       | `http://localhost:2368/ghost/#/members`   | `results/F5-members/`   |

> **Nota:** `loginGhost` siempre autentica en `http://localhost:2368/ghost/#/signin` antes de navegar a la URL de inicio, independientemente del valor de `url` en `config.json`.

## Reportes

El GUI Ripper genera un reporte con la exploración realizada por cada uno de los browsers definidos en la configuración. Cada reporte contiene un un archivo `.html` y una serie de archivos `.json` con el grafo de exploración.

### Ver resultados

```bash
# Opción 1: servidor local
cd results/F1-dashboard/chromium
npx serve .
# Abrir http://localhost:3000/report.html

# Opción 2: extensión Live Server de VSCode
# Clic derecho en results/F1-dashboard/chromium/report.html → "Open with Live Server"
```

> [!NOTE]
>
> - La reproducibilidad está garantizada por la exploración determinista del DOM. Con el mismo `depthLevels` y el mismo estado inicial de la aplicación, el grafo de estados generado será el mismo.