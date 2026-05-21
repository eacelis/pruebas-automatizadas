# Pruebas de regresión visual Ghost

Esta carpeta contiene un script de regresión visual ResembleJS para comparar capturas de pantalla de Ghost CMS generadas por Cypress y Kraken.

## Requisitos previos

- Node.js >= 22
- Las capturas de pantalla ya deben existir en `./screenshots/`
- Estructura de captura de pantalla esperada:

```text
./screenshots/
├── 5.130.2/
│   ├── cypress/
│   └── kraken/
└── 6.36.0/
    ├── cypress/
    └── kraken/
```

Cada carpeta `cypress` y `kraken` debe contener nombres de archivo PNG coincidentes entre las carpetas `6.36.0` (latestVersion) y `5.130.2` (rcVersion).

## Instalación

Desde la **raíz del repositorio**:

```bash
npm run resemblejs:install
```

Desde esta carpeta:

```bash
npm install
```

## Cómo correr

```bash
node index.js
```

o:

```bash
npm run report
```

## Configuración

Edita `config.json` para cambiar las versiones comparadas, la ubicación de las capturas de pantalla, la carpeta de salida o el umbral:

```json
{
  "latestVersion": "6.36.0",
  "rcVersion": "5.130.2",
  "screenshotsBasePath": "./screenshots",
  "outputDir": "./results",
  "threshold": 0.1
}
```

El threshold es el porcentaje máximo de discrepancia permitido por ResembleJS. Una comparación pasa cuando `misMatchPercentage <= threshold`.

## Salida

Cada ejecución crea una carpeta con marca de tiempo:

```text
./results/{timestamp}/report.html
```

El informe incluye una tabla resumen y una sección por herramienta con la captura de pantalla de la versión lastest, la captura de pantalla de la versión RC y la imagen diff generada.
