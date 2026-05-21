![pruebas_automatizadas](https://github.com/user-attachments/assets/10279226-bb1b-41cb-8c73-eade9f49a3dc)

# MISW-4103 Proyecto

Este repositorio ha sido creado como parte del curso _Pruebas Automatizadas de Software_ de la Maestría en Ingeniería de Software (MISO). Su objetivo principal es proporcionar un entorno práctico para que los estudiantes desarrollen competencias avanzadas en la automatización de pruebas, utilizando la aplicación GHOST como caso de estudio. A través de este proyecto, se busca que los estudiantes adquieran habilidades para diseñar, ejecutar y mantener pruebas automatizadas de alta calidad, contribuyendo al éxito de proyectos de software en entornos profesionales.

Durante las próximas semanas, los estudiantes realizarán actividades semanales diseñadas para aplicar conceptos teóricos, implementar estrategias de pruebas automatizadas y enfrentar desafíos reales. Estas actividades están orientadas a fortalecer su perfil profesional como ingenieros especializados en pruebas automatizadas.

## Estructura del Repositorio

Este repositorio está diseñado para guiar a los estudiantes en el desarrollo de habilidades prácticas en pruebas automatizadas, fomentando el aprendizaje colaborativo y la aplicación de buenas prácticas en entornos profesionales.

El repositorio cuenta con una estructura inicial mínima para el desarrollo del proyecto. A medida que avance el curso, el _Equipo Docente_ proporcionará instrucciones sobre los cambios y configuraciones necesarias para completar las actividades semanales. Al recibir el repositorio, encontrarán la siguiente estructura de archivos:

```plaintext
📦 root
 ┣---- 📂 .github
 ┣---- 📂 actividades
 ┃     ┣---- 📂 actividad-semana-X
 ┃     ┃     ┣---- 📜 README.md
 ┃     ┃     ┗---- 📜 RETRO.md
 ┃     ┗---- 📂 ...
 ┃
 ┣---- 📂 e2e
 ┃     ┣---- 📜 README.md
 ┃     ┗---- 📂 ...
 ┃
 ┣---- 📂 reconocimiento
 ┃     ┣---- 📜 README.md
 ┃     ┗---- 📂 ...
 ┃
 ┣---- 📂 vrt
 ┃     ┣---- 📜 README.md
 ┃     ┗---- 📂 ...
 ┃
 ┣---- 📜 EQUIPO.md
 ┣---- 📜 README.md
 ┣---- 📜 package.json
 ┣---- 📜 package-lock.json
 ┗---- 📜 .gitignore
```

### Detalles de los Archivos y Directorios

- **`EQUIPO.md`**: Este archivo debe ser completado por el equipo de trabajo. Como mínimo, deben incluir los nombres y correos electrónicos de los integrantes. Además, se recomienda que el equipo redacte un "contrato" o acuerdos para el desarrollo de las actividades del proyecto.

- **`actividades/`**: Este directorio contiene los _templates_ de los informes del proyecto (`README.md` y `RETRO.md`). Los equipos deben utilizar este espacio para documentar las actividades semanales.
  - Los informes deben ser autocontenidos, ya que serán evaluados por el _Equipo Docente_.
  - Si se incluyen archivos multimedia, se recomienda utilizar gestores de contenido (_Google Drive, YouTube, etc._) y agregar los enlaces correspondientes, asegurándose de que evidencien la última fecha de edición.

- **`e2e/`, `reconocimiento/` y `vrt/`**: Estos directorios contienen la configuración base de los frameworks y herramientas necesarias para las actividades del proyecto.
  - Inicialmente, solo incluyen archivos `README` con instrucciones para configurar las herramientas de automatización de pruebas. Cada semana se les indicarán las actividades y acciones para configurar los frameworks y herramientoas

- **Archivos y directorios restringidos**: Los siguientes elementos contienen configuraciones esenciales para el proyecto. **NO** deben ser modificados por los estudiantes, cualquier modificación en ellos resultará en penalizaciones en las entregas semanales:
  - `📂 .github/`
  - `📜 package.json` (en la raíz del repositorio)
  - `📜 package-lock.json` (en la raíz del repositorio)
  - `📜 README.md` (en la raíz del repositorio)

## Cómo Contribuir

### Workspaces

El repositorio utiliza [_npm Workspaces_](https://docs.npmjs.com/cli/v7/using-npm/workspaces) para el manejo granular de dependencias para cada herramienta y framework de automatización; En el `package.json` (principal) que se encuentra en la raíz se pueden observar los directorios que conforman los _Workspaces_ del repositorio

```javascript
// ./package.json
{
    ...
    "workspaces": ["e2e/*", "reconocimiento/*", "vrt/*"]
    ...
}
```

Esto facilita el manejo de dependencias entre módulos (**`e2e/`, `reconocimiento/` y `vrt/`**), al igual que su conexión. Por ejemplo, una vez se haya configurado el framework de automatización _Kraken_ dentro del directorio **`e2e/misw4103-kraken`**, este tendrá un `package.json` propio.

```javascript
// .e2e/misw4103-kraken/package.json
{
    "name": "misw4103-kraken",
    ...
    "scripts": {
        "kraken:install": "npm install -w misw-4103-kraken",
        "kraken:prepare": "npm run prepare -w misw-4103-kraken",
        "kraken:test": "npm run test -w misw-4103-kraken",
    }
}
```

Para gestionar este módulo (instalar dependencias, ejecutar scripts, etc.), se pueden utilizar los siguientes comandos desde la raiz del repositorio.

```bash

npm run kraken:install  # instalación de dependencias para un workspace particular
npm run kraken:prepare  # preparación de un workspace particular para ser ejecutado
npm run kraken:test     # ejecución de scripts de un workspace particular
```

## Ejecución Pruebas E2E y de Regresión Visual

### Prerrequisitos

- Node.js >= 22
- Docker
- Ghost 5.130.2 corriendo en Docker en el puerto 2368
- Ghost 6.36.0 corriendo en Docker en el puerto 2369
- Dependencias instaladas en cada subcarpeta (`npm install`)

### Pasos

1. Instalar dependencias de las carpetas E2E:
```bash
   npm run install:e2e
```
**Nota:** Esto instala las dependencias de las 4 carpetas (cypress y kraken para Ghost 5.130.2 y Ghost 6.36.0), ya que se dejaron los 4 subproyectos para facilidad de replicación.

2. Detener y eliminar contenedores previos de Ghost, si existen:
```bash
   docker stop ghost-5-130-2 ghost-6-36-0
   docker rm ghost-5-130-2 ghost-6-36-0
```

3. Ejecutar Ghost 5.130.2 en el puerto 2368:
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

4. Ejecutar Ghost 6.36.0 en el puerto 2369:
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

5. Verificar que ambos contenedores estén corriendo:
```bash
   docker ps
```

6. Configurar la cuenta de administrador en ambas instancias (Siga las instrucciones en el `README.md` de los subproyectos en la carpeta e2e):
- Ghost 5.130.2: `http://localhost:2368/ghost`
- Ghost 6.36.0: `http://localhost:2369/ghost`

7. Ejecutar pruebas Cypress contra Ghost 6.36.0:
```bash
   npm run test:cypress:latest
```

8. Ejecutar pruebas Cypress contra Ghost 5.130.2:
```bash
   npm run test:cypress:rc
```

9. Ejecutar pruebas Kraken contra Ghost 6.36.0:
```bash
   npm run test:kraken:latest
```

10.  Ejecutar pruebas Kraken contra Ghost 5.130.2:
```bash
   npm run test:kraken:rc
```

11.  Instalar dependencias de la carpeta VRT:
```bash
   npm run resemblejs:install
```
También puedes seguir las instrucciones del archivo `README.md` en la carpeta `vrt\misw-4103-resemblejs`, ejecutando esos comandos desde ese espacio.

12.  Ejecutar regresión visual:
```bash
   npm run vrt
```
o
```bash
   npm run resemblejs:report
```

Los screenshots de las pruebas e2e para las pruebas de regresión visual se generan en `./screenshots/{version}/{tool}/`.
El reporte HTML de regresión visual se genera en `vrt/misw-4103-resemblejs/results/{timestamp}/report.html`.
