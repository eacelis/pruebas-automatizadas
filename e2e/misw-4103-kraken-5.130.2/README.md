# Kraken E2E - Ghost 5.130.2

Este módulo contiene los escenarios E2E de Kraken para Ghost 5.130.2.

## Prerrequisitos

- Node.js >= 22
- Docker
- Java JRE/JDK
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
npm install
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
npm run test:kraken:rc
```

## Configuración

La configuración principal está en `properties.json`.

- `GHOST_URL`: `http://localhost:2368`
- `SCREENSHOT_DIR`: `../../screenshots/5.130.2/kraken`
- `ADMIN_EMAIL`: correo del administrador de Ghost
- `ADMIN_PASSWORD`: contraseña del administrador de Ghost

Las credenciales pueden configurarse en un archivo `.env` ubicado en esta ruta (se deja archivo de ejemplo en `.env.example`):

```bash
GHOST_URL=http://localhost:2368
ADMIN_EMAIL=tu-correo-admin
ADMIN_PASSWORD=tu-password-admin
```

---

## Semana 7: Estrategias de Generación de Datos

### Dependencias adicionales

- `@faker-js/faker` (ya incluido en `dependencies`): generación dinámica y pseudo-aleatoria de datos.

### Nuevos archivos creados

| Archivo | Descripción |
|---|---|
| `features/F04_tags_apriori.feature` | Tags — A-Priori con Scenario Outline (12 escenarios) |
| `features/F05_members_apriori.feature` | Members — A-Priori con Scenario Outline (12 escenarios) |
| `features/F04_tags_dynamic.feature` | Tags — Datos dinámicos con hooks Faker (12 escenarios) |
| `features/F05_members_dynamic.feature` | Members — Datos dinámicos con hooks Faker (12 escenarios) |
| `features/F02_posts_random.feature` | Posts — Pseudo-aleatoria (9 escenarios) |
| `features/web/step_definitions/data_generation_steps.js` | Steps para features de generación de datos |
| `features/web/support/hooks.js` | **Actualizado**: hooks `@dynamic-tag`, `@dynamic-member`, `@random` |

### Estrategias de generación de datos

#### 1. Data Pool A-Priori — Scenario Outline

Los features `F04_tags_apriori.feature` y `F05_members_apriori.feature` usan **Scenario Outline con tabla Examples**. Cada fila de la tabla es un escenario independiente con datos fijos predefinidos. Equivalent Gherkin al data pool JSON de Cypress.

#### 2. Dinámica — Hooks con Faker antes de cada escenario

Los features dinámicos usan tagged `Before` hooks en `hooks.js` para inyectar datos generados con Faker en el objeto mundo (`this.dynamicTag`, `this.dynamicMember`):

- `@dynamic-tag` → `this.dynamicTag = { name: faker.word.noun() + suffix, expected: 'success' }`
- `@dynamic-invalid-tag` → `this.dynamicTag = { name: '', expected: 'error' }`
- `@dynamic-member` → `this.dynamicMember = { email: faker.internet.email(), name: faker.person.fullName(), expected: 'success' }`
- `@dynamic-invalid-member` → `this.dynamicMember = { email: faker.string.alphanumeric(10), expected: 'error' }`

Los steps acceden a `this.dynamicTag` y `this.dynamicMember` para completar los formularios.

#### 3. Pseudo-aleatoria — Faker en hooks sin oráculo definido

El feature `F02_posts_random.feature` usa el tag `@random`. El hook inyecta:
- `this.randomData = { title: faker.lorem.words(...), content: faker.lorem.sentences(...) }`

El oráculo es implícito: ausencia de errores de crash en el editor de posts.

### Ejecución de escenarios de generación de datos

```bash
# Solo features A-Priori
npx kraken-node run --tags @F04-APR
npx kraken-node run --tags @F05-APR

# Solo features Dinámicos
npx kraken-node run --tags @dynamic-tag
npx kraken-node run --tags @dynamic-member

# Solo features Pseudo-aleatorios
npx kraken-node run --tags @random

# Todos los escenarios (20 existentes + 57 nuevos = 77 total)
npm test
```
