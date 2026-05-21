# Cypress E2E - Ghost 5.130.2

Este módulo contiene los escenarios E2E de Cypress para Ghost 5.130.2.

## Prerrequisitos

- Node.js >= 22
- Docker
- Ghost 5.130.2 disponible en `http://localhost:2368`
- Cuenta de administrador creada en `http://localhost:2368/ghost`

## Ejecutar Ghost

Desde cualquier ruta:

```bash
docker run -d \
  --name ghost-5-130-2 \
  -p 2368:2368 \
  -e NODE_ENV=development \
  -e security__staffDeviceVerification=false \
  -e url=http://localhost:2368 \
  -v ghost-data-5-130-2:/var/lib/ghost/content \
  -e spam__user_login__freeRetries=100000 \
  -e spam__global_block__freeRetries=100000 \
  -e spam__user_login__minWait=1 \
  ghost:5.130.2
```

Para reiniciar desde cero:

```bash
docker stop ghost-5-130-2
docker rm ghost-5-130-2
docker volume rm ghost-data-5-130-2
```

## Instalar dependencias

Desde esta carpeta:

```bash
npm install --install-strategy=nested
```

Desde la raíz del repositorio:

```bash
npm run install:e2e
```

## Ejecutar pruebas

Desde esta carpeta:

```bash
npm test
```

Desde la raíz del repositorio:

```bash
npm run test:cypress:rc
```

## Configuración

La configuración principal está en `cypress.config.js`.

- `baseUrl`: `http://localhost:2368`
- `screenshotsFolder`: `../../screenshots/5.130.2/cypress`
- `video`: `false`

Las credenciales pueden configurarse en un archivo `.env` ubicado en esta ruta (se deja archivo de ejemplo en `.env.example`):

```bash
GHOST_URL=http://localhost:2368
GHOST_ADMIN_URL=http://localhost:2368/ghost
GHOST_ADMIN_EMAIL=tu-correo-admin
GHOST_ADMIN_PASSWORD=tu-password-admin
```

---

## Semana 7: Estrategias de Generación de Datos

### Dependencias adicionales

- `@faker-js/faker` (ya incluido en `devDependencies`): generación dinámica y pseudo-aleatoria de datos en runtime.

### Nuevos archivos creados

| Archivo | Descripción |
|---|---|
| `cypress/fixtures/F02_posts_data_pool.json` | Data pool a-priori para posts (7 entradas) |
| `cypress/fixtures/F03_pages_data_pool.json` | Data pool a-priori para páginas (7 entradas) |
| `cypress/fixtures/F04_tags_data_pool.json` | Data pool a-priori para tags (7 entradas) |
| `cypress/fixtures/F05_members_data_pool.json` | Data pool a-priori para members (7 entradas) |
| `cypress/support/dataGenerators.js` | Funciones Faker con campo `expected` y `oracle` |
| `cypress/e2e/F02_posts_apriori.cy.js` | Posts — estrategia A-Priori (7 scenarios) |
| `cypress/e2e/F03_pages_apriori.cy.js` | Pages — estrategia A-Priori (7 scenarios) |
| `cypress/e2e/F04_tags_apriori.cy.js` | Tags — estrategia A-Priori (7 scenarios) |
| `cypress/e2e/F05_members_apriori.cy.js` | Members — estrategia A-Priori (7 scenarios) |
| `cypress/e2e/F02_posts_dynamic.cy.js` | Posts — estrategia Dinámica Online (7 scenarios) |
| `cypress/e2e/F04_tags_dynamic.cy.js` | Tags — estrategia Dinámica Online (7 scenarios) |
| `cypress/e2e/F05_members_dynamic.cy.js` | Members — estrategia Dinámica Online (7 scenarios) |
| `cypress/e2e/F02_posts_random.cy.js` | Posts — estrategia Pseudo-aleatoria (7 scenarios) |
| `cypress/e2e/F03_pages_random.cy.js` | Pages — estrategia Pseudo-aleatoria (7 scenarios) |

### Estrategias de generación de datos

#### 1. Data Pool A-Priori (estático)

Los data pools son archivos JSON en `cypress/fixtures/` generados **antes** de la ejecución. Cada entrada tiene:

- `id`: identificador del caso de prueba
- `description`: descripción del caso
- `input`: campos del formulario (título, email, nombre, etc.)
- `expected`: `"success"` o `"error"`
- `oracle`: descripción de qué debe verificarse

Los specs iteran el JSON con `forEach` y cada entrada genera un `it()` independiente.

#### 2. Data Pool Dinámico — Online (Faker en runtime)

El módulo `cypress/support/dataGenerators.js` expone funciones que generan datos usando `@faker-js/faker` **en tiempo de ejecución**. Cada función retorna `{ input, expected, oracle }` con el oráculo calculado en base al dato generado.

No requiere API key ni configuración externa.

#### 3. Pseudo-aleatoria (Faker sin oráculo definido)

Faker genera datos completamente aleatorios en cada ejecución, sin oráculo de éxito/error predefinido. El oráculo es **implícito**: ausencia de errores de crash en el editor.

### Ejecución de escenarios de generación de datos

```bash
# Solo escenarios A-Priori
npx cypress run --spec "cypress/e2e/*_apriori.cy.js"

# Solo escenarios Dinámicos
npx cypress run --spec "cypress/e2e/*_dynamic.cy.js"

# Solo escenarios Pseudo-aleatorios
npx cypress run --spec "cypress/e2e/*_random.cy.js"

# Todos los escenarios (20 existentes + 63 nuevos = 83 total)
npm test
```
