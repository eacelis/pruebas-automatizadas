# Pruebas de Regresión Visual

Esta carpeta contiene la implementación de pruebas de regresión visual para Ghost CMS usando ResembleJS. El objetivo es comparar capturas generadas por las pruebas E2E de Cypress y Kraken entre dos versiones de Ghost.

## Estructura

- `vrt/misw-4103-resemblejs/index.js`: script principal de comparación visual.
- `vrt/misw-4103-resemblejs/config.json`: configuración de versiones, rutas y umbral.
- `vrt/misw-4103-resemblejs/package.json`: dependencias y scripts de la herramienta.
- `vrt/misw-4103-resemblejs/README.md`: documentación detallada de la herramienta.

## Requisitos previos

- Node.js 22 o superior.
- Dependencias instaladas en el proyecto de VRT.
- Capturas de pantalla generadas previamente por Cypress y Kraken.
- Instancias de Ghost ejecutadas y probadas previamente para las versiones comparadas.

La estructura esperada de capturas es:

- `screenshots/5.130.2/cypress/`
- `screenshots/5.130.2/kraken/`
- `screenshots/6.36.0/cypress/`
- `screenshots/6.36.0/kraken/`

## Instalación

Desde la raíz del repositorio:

`npm run resemblejs:install`

También se puede instalar directamente desde la carpeta de la herramienta:

`cd vrt/misw-4103-resemblejs && npm install`

## Ejecución

Desde la raíz del repositorio:

`npm run vrt`

O desde la carpeta de la herramienta:

`cd vrt/misw-4103-resemblejs && npm run report`

## Configuración

La configuración principal se encuentra en:

`vrt/misw-4103-resemblejs/config.json`

Allí se definen las versiones comparadas, la ruta base de screenshots, el directorio de salida y el umbral de comparación visual.

## Resultados

Cada ejecución genera un reporte HTML en:

`vrt/misw-4103-resemblejs/results/{timestamp}/report.html`

El reporte incluye las imágenes base, actual y diff, junto con el porcentaje de diferencia calculado por ResembleJS.

## Relación con la estrategia EP1

La regresión visual complementa las pruebas E2E de Cypress y Kraken, permitiendo detectar diferencias visuales entre versiones de Ghost que no necesariamente aparecen como fallos funcionales. Los resultados deben analizarse manualmente antes de clasificar una diferencia como defecto real.
