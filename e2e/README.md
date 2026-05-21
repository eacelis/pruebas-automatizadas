# Pruebas End to End (E2E)

Las pruebas End to End (E2E) son un tipo de prueba de software que valida el funcionamiento completo de una aplicación, desde el inicio hasta el final, asegurando que todos los componentes interactúan correctamente. Este tipo de pruebas simula el comportamiento real de los usuarios para garantizar que el sistema funcione como se espera en un entorno de producción.

## Frameworks Utilizados

En este proyecto, se utilizarán los siguientes frameworks para realizar las pruebas E2E:

- **Cypress**: es un framework moderno y fácil de usar para realizar pruebas E2E. Ofrece una interfaz intuitiva y herramientas integradas para depuración. Es ideal para pruebas en aplicaciones web modernas.
- **Playwright**: es un framework que permite realizar pruebas automatizadas en múltiples navegadores (Chromium, Firefox, WebKit). Es conocido por su capacidad de manejar escenarios complejos y su soporte para pruebas en dispositivos móviles.
- **Puppeteer**: es una biblioteca que proporciona una API de alto nivel para controlar navegadores basados en Chromium. Es útil para pruebas E2E y tareas de scraping.

## Configuración

El archivo `setup_frameworks.yml` es un flujo de trabajo de GitHub Actions diseñado para configurar automáticamente los frameworks necesarios para las pruebas E2E en un entorno de integración continua (CI).

Pasos para usarlo:

1. Diríjase al repositorio en GitHub.
2. Seleccione la pestaña _Actions_. Una vez la página haya cargado, encontrará un flujo llamado "Setup Frameworks Automatización", el cual debe seleccionar.
3. Abra el dropdown _Run Workflow_ (ver imagen), seleccione el framework que desea utilizar para el proyecto y oprima el botón para ejecutar el flujo
   ![setup framework workflow](https://github.com/Uniandes-MISW4103/proyecto-base-actions/blob/947f8e7bc91d907c719b278e0f9aac77f9278a2c/public/setup-framework-workflow.png)
4. Una vez el flujo termine su ejecución, podrá ver los resultados en la lista. Del mismo modo, el repositorio deberá tener un nuevo commit con el módulo del framework seleccionado

Este flujo descarga el módulo _base_ del framework que haya seleccionado en su repositorio, y actualiza el `package.json` para incluir scripts de ejecución. Una vez la ejecución haya finalizado, debe utilizar el comando `git pull` en su ambiente local para que los cambios se vean reflejados

> [!IMPORTANT]
> La configuración solamente descarga el módulo _base_ del framework, pero no instala las dependencias ni librerias de manera local. Una vez haya utilizado el comando `git pull` usted deberá hacer la instalación de dependencias.

### Requisitos Básicos

- Node.js (versión 22 o superior). Recomendamos utilizar la versión `lts/jod`
- npm para la gestión de dependencias

### Instalación de Dependencias

Antes de ejecutar las pruebas, deben instalar todas las dependencias necesarias. Para ello, dirígase al README de la raíz del repositorio y revise la sección "_Cómo Contribuir_".

---

## Semana 7 — Conteo de Escenarios de Generación de Datos

Total de sub-escenarios generados con las tres estrategias de datos: **120 escenarios**.

### Cypress (`misw-4103-cypress-5.130.2`) — 63 escenarios

| Archivo | Estrategia | Funcionalidad | Escenarios |
|---|---|---|---|
| `F02_posts_apriori.cy.js` | A-Priori (forEach JSON) | F2 - Posts | 7 |
| `F03_pages_apriori.cy.js` | A-Priori (forEach JSON) | F3 - Pages | 7 |
| `F04_tags_apriori.cy.js` | A-Priori (forEach JSON) | F4 - Tags | 7 |
| `F05_members_apriori.cy.js` | A-Priori (forEach JSON) | F5 - Members | 7 |
| `F02_posts_dynamic.cy.js` | Dinámica Online (Faker) | F2 - Posts | 7 |
| `F04_tags_dynamic.cy.js` | Dinámica Online (Faker) | F4 - Tags | 7 |
| `F05_members_dynamic.cy.js` | Dinámica Online (Faker) | F5 - Members | 7 |
| `F02_posts_random.cy.js` | Pseudo-aleatoria | F2 - Posts | 7 |
| `F03_pages_random.cy.js` | Pseudo-aleatoria | F3 - Pages | 7 |
| **Total Cypress** | | | **63** |

### Kraken (`misw-4103-kraken-5.130.2`) — 57 escenarios

| Archivo | Estrategia | Funcionalidad | Escenarios |
|---|---|---|---|
| `F04_tags_apriori.feature` | A-Priori (Scenario Outline) | F4 - Tags | 12 |
| `F05_members_apriori.feature` | A-Priori (Scenario Outline) | F5 - Members | 12 |
| `F04_tags_dynamic.feature` | Dinámica (@dynamic-tag hooks) | F4 - Tags | 12 |
| `F05_members_dynamic.feature` | Dinámica (@dynamic-member hooks) | F5 - Members | 12 |
| `F02_posts_random.feature` | Pseudo-aleatoria (@random hooks) | F2 - Posts | 9 |
| **Total Kraken** | | | **57** |

### Total general: 63 + 57 = **120 escenarios** ✓
