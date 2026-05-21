'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── Validate required environment variables ───────────────────────────────────
const GHOST_EMAIL = process.env.GHOST_EMAIL;
const GHOST_PASSWORD = process.env.GHOST_PASSWORD;

if (!GHOST_EMAIL || !GHOST_PASSWORD) {
  console.error(
    '\nERROR: Las variables de entorno GHOST_EMAIL y GHOST_PASSWORD son obligatorias.\n' +
    'Uso:   GHOST_EMAIL=admin@example.com GHOST_PASSWORD=yourpassword node run-all.js [F1|F2|F3|F4|F5]\n'
  );
  process.exit(1);
}

// ── Feature definitions ───────────────────────────────────────────────────────
// targetSection is for folder naming only — RIPuppet does not read it from config.
const BASE_URL = 'http://localhost:2368';
const FEATURES = [
  {
    id: 'F1',
    label: 'Dashboard',
    folder: 'F1-dashboard',
    config: {
      baseUrl: BASE_URL,
      url: '/ghost/#/dashboard',
      headless: false,
      depthLevels: 2,
      inputValues: true,
      values: { identification: GHOST_EMAIL, password: GHOST_PASSWORD },
      browsers: ['chromium'],
    },
  },
  {
    id: 'F2',
    label: 'Posts',
    folder: 'F2-posts',
    config: {
      baseUrl: BASE_URL,
      url: '/ghost/#/posts',
      headless: false,
      depthLevels: 2,
      inputValues: true,
      values: { identification: GHOST_EMAIL, password: GHOST_PASSWORD },
      browsers: ['chromium'],
    },
  },
  {
    id: 'F3',
    label: 'Pages',
    folder: 'F3-pages',
    config: {
      baseUrl: BASE_URL,
      url: '/ghost/#/pages',
      headless: false,
      depthLevels: 2,
      inputValues: true,
      values: { identification: GHOST_EMAIL, password: GHOST_PASSWORD },
      browsers: ['chromium'],
    },
  },
  {
    id: 'F4',
    label: 'Tags',
    folder: 'F4-tags',
    config: {
      baseUrl: BASE_URL,
      url: '/ghost/#/tags',
      headless: false,
      depthLevels: 2,
      inputValues: true,
      values: { identification: GHOST_EMAIL, password: GHOST_PASSWORD },
      browsers: ['chromium'],
    },
  },
  {
    id: 'F5',
    label: 'Members',
    folder: 'F5-members',
    config: {
      baseUrl: BASE_URL,
      url: '/ghost/#/members',
      headless: false,
      depthLevels: 2,
      inputValues: true,
      values: { identification: GHOST_EMAIL, password: GHOST_PASSWORD },
      browsers: ['chromium'],
    },
  },
];

// ── Optional single-feature argument ─────────────────────────────────────────
const arg = process.argv[2];
let featuresToRun = FEATURES;
if (arg) {
  featuresToRun = FEATURES.filter(f => f.id.toUpperCase() === arg.toUpperCase());
  if (featuresToRun.length === 0) {
    console.error(
      `\nERROR: Funcionalidad '${arg}' no reconocida.\n` +
      `Opciones válidas: ${FEATURES.map(f => f.id).join(', ')}\n`
    );
    process.exit(1);
  }
}

// ── Paths ─────────────────────────────────────────────────────────────────────
const ROOT = __dirname;
const CONFIG_PATH = path.join(ROOT, 'config.json');
const RESULTS_PATH = path.join(ROOT, 'results');

// ── Helpers ───────────────────────────────────────────────────────────────────
function getResultEntries() {
  if (!fs.existsSync(RESULTS_PATH)) return new Set();
  return new Set(fs.readdirSync(RESULTS_PATH));
}

function separator(char = '─', width = 60) {
  return char.repeat(width);
}

// ── Main execution ────────────────────────────────────────────────────────────
const originalConfig = fs.readFileSync(CONFIG_PATH, 'utf8');
const summary = [];

console.log(separator('═'));
console.log(`RIPuppet run-all — ${featuresToRun.length} funcionalidad(es)`);
console.log(separator('═'));

try {
  for (const feature of featuresToRun) {
    console.log(`\n${separator('─')}`);
    console.log(`▶  ${feature.id} — ${feature.label}  →  results/${feature.folder}`);
    console.log(separator('─'));

    // Write the feature-specific config
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(feature.config, null, 2));

    // Snapshot results/ before running
    const before = getResultEntries();

    try {
      execSync('node index.js', { stdio: 'inherit', cwd: ROOT });

      // Find the new timestamp folder created by RIPuppet
      const after = getResultEntries();
      const newEntries = [...after].filter(e => !before.has(e));

      if (newEntries.length > 0) {
        // Sort descending so the most recent is first (handles rare double-run edge case)
        const newest = newEntries.sort().reverse()[0];
        const srcPath = path.join(RESULTS_PATH, newest);
        const destPath = path.join(RESULTS_PATH, feature.folder);

        if (fs.existsSync(destPath)) {
          fs.rmSync(destPath, { recursive: true, force: true });
        }
        fs.renameSync(srcPath, destPath);
        console.log(`\n✓  Resultados guardados en: results/${feature.folder}`);
      } else {
        console.warn(`\n⚠  No se detectó nueva carpeta en results/ para ${feature.id}. ` +
          'Puede que RIPuppet no generó salida o ya existía una carpeta con ese timestamp.');
      }

      summary.push({ id: feature.id, label: feature.label, folder: feature.folder, status: 'OK' });
    } catch (err) {
      console.error(`\n✗  Error durante la ejecución de ${feature.id}: ${err.message}`);
      summary.push({ id: feature.id, label: feature.label, folder: feature.folder, status: 'FAILED' });
    }
  }
} finally {
  // Always restore the original config.json
  fs.writeFileSync(CONFIG_PATH, originalConfig);
  console.log(`\n${separator('─')}`);
  console.log('config.json original restaurado.');

  // Print execution summary
  console.log(`\n${separator('═')}`);
  console.log('RESUMEN DE EJECUCIÓN');
  console.log(separator('═'));
  for (const s of summary) {
    const icon = s.status === 'OK' ? '✓' : '✗';
    console.log(`  ${icon}  ${s.id} — ${s.label.padEnd(10)}  [${s.status}]  →  results/${s.folder}`);
  }
  const failed = summary.filter(s => s.status !== 'OK');
  console.log(separator('─'));
  if (failed.length === 0) {
    console.log(`Todas las ejecuciones completaron exitosamente (${summary.length}/${summary.length}).`);
  } else {
    console.log(`Completadas: ${summary.length - failed.length}/${summary.length}. ` +
      `Fallidas: ${failed.map(s => s.id).join(', ')}`);
  }
  console.log(separator('═'));
}
