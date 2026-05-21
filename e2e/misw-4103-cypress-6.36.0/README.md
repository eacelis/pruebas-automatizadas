# Cypress E2E - Ghost 6.36.0

Este módulo contiene los escenarios E2E de Cypress para Ghost 6.36.0.

## Prerrequisitos

- Node.js >= 22
- Docker
- Ghost 6.36.0 disponible en `http://localhost:2369`
- Cuenta de administrador creada en `http://localhost:2369/ghost`

## Ejecutar Ghost

Desde cualquier ruta:

```bash
docker run -d \
  --name ghost-6-36-0 \
  -p 2369:2368 \
  -e NODE_ENV=development \
  -e security__staffDeviceVerification=false \
  -e url=http://localhost:2369 \
  -v ghost-data-6-36-0:/var/lib/ghost/content \
  -e spam__user_login__freeRetries=100000 \
  -e spam__global_block__freeRetries=100000 \
  -e spam__user_login__minWait=1 \
  ghost:6.36.0
```

Para reiniciar desde cero:

```bash
docker stop ghost-6-36-0
docker rm ghost-6-36-0
docker volume rm ghost-data-6-36-0
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
npm run test:cypress:latest
```

## Configuración

La configuración principal está en `cypress.config.js`.

- `baseUrl`: `http://localhost:2369`
- `screenshotsFolder`: `../../screenshots/6.36.0/cypress`
- `video`: `false`

Las credenciales pueden configurarse en un archivo `.env` ubicado en esta ruta (se deja archivo de ejemplo en `.env.example`):

```bash
GHOST_URL=http://localhost:2369
GHOST_ADMIN_URL=http://localhost:2369/ghost
GHOST_ADMIN_EMAIL=tu-correo-admin
GHOST_ADMIN_PASSWORD=tu-password-admin
```
