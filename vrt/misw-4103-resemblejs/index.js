import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import config from "./config.json" with { type: "json" };

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOOLS = ["cypress", "kraken"];
const COMPARE_OPTIONS = {
  output: {
    errorColor: { red: 255, green: 0, blue: 255 },
    errorType: "movement",
    largeImageThreshold: 1200,
    useCrossOrigin: false,
    outputDiff: true,
  },
  scaleToSameSize: true,
  ignore: "antialiasing",
};

function timestamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + "_" + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("-");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function htmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pngFiles(dirPath, baseDir = dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`Warning: screenshot folder not found: ${dirPath}`);
    return [];
  }

  const files = fs.readdirSync(dirPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      return pngFiles(entryPath, baseDir);
    }
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".png")) {
      return [];
    }
    return path.relative(baseDir, entryPath);
  });

  if (files.length === 0) {
    console.warn(`Warning: no PNG files found in: ${dirPath}`);
  }

  return files.sort();
}

function summaryForTool(results, tool) {
  const toolResults = results.filter((result) => result.tool === tool);
  const passed = toolResults.filter((result) => result.passed).length;
  return {
    tool,
    total: toolResults.length,
    passed,
    failed: toolResults.length - passed,
  };
}

function summaryTable(results, runTimestamp) {
  const rows = TOOLS.map((tool) => summaryForTool(results, tool))
    .map(
      ({ tool, total, passed, failed }) => `<tr>
        <td>${htmlEscape(tool)}</td>
        <td>${total}</td>
        <td>${passed}</td>
        <td>${failed}</td>
      </tr>`,
    )
    .join("");

  return `<section class="summary">
    <h2>Summary</h2>
    <div class="summary-grid">
      <div><strong>Execution timestamp</strong><span>${htmlEscape(runTimestamp)}</span></div>
      <div><strong>Ghost versions</strong><span>${htmlEscape(config.latestVersion)} vs ${htmlEscape(config.rcVersion)}</span></div>
      <div><strong>Threshold</strong><span>${config.threshold}%</span></div>
    </div>
    <table class="summary-table">
      <thead>
        <tr>
          <th>Tool</th>
          <th>Total comparisons</th>
          <th>Passed</th>
          <th>Failed</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </section>`;
}

function imageCard(label, src) {
  return `<div class="imgcontainer">
    <span class="imgname">${htmlEscape(label)}</span>
    <img class="img2" src="${htmlEscape(src)}" alt="${htmlEscape(label)}">
  </div>`;
}

function toReportPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function comparisonSection(result) {
  const badgeClass = result.passed ? "pass" : "fail";
  const badgeText = result.passed ? "PASS" : "FAIL";
  const toolClass = result.tool;
  const statusClass = result.passed ? "passed" : "failed";

  return `<article class="comparison ${toolClass} ${statusClass}">
    <header class="comparison-header">
      <div>
        <h3>${htmlEscape(result.filename)}</h3>
        <p>Mismatch: <strong>${htmlEscape(result.misMatchPercentage)}%</strong></p>
      </div>
      <span class="badge ${badgeClass}">${badgeText}</span>
    </header>
    <div class="imgline three-columns">
      ${imageCard(`Ghost ${config.latestVersion}`, result.latestReportPath)}
      ${imageCard(`Ghost ${config.rcVersion}`, result.rcReportPath)}
      ${imageCard("Diff", result.diffReportPath)}
    </div>
  </article>`;
}

function toolSection(results, tool) {
  const toolResults = results.filter((result) => result.tool === tool);
  const title = tool.charAt(0).toUpperCase() + tool.slice(1);
  const body = toolResults.length === 0
    ? '<p class="empty">No comparisons were generated for this tool.</p>'
    : toolResults.map(comparisonSection).join("");

  return `<section class="browser" id="tool-${htmlEscape(tool)}">
    <h2>${htmlEscape(title)}</h2>
    ${body}
  </section>`;
}

function createReport(results, runTimestamp) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Ghost VRT Report</title>
    <link href="index.css" type="text/css" rel="stylesheet">
  </head>
  <body>
    <main>
      <h1>Ghost Visual Regression Testing Report</h1>
      ${summaryTable(results, runTimestamp)}
      <div class="filters">
        <label for="tool-filter">Filter by Tool:</label>
        <select id="tool-filter">
          <option value="all">All</option>
          <option value="cypress">Cypress</option>
          <option value="kraken">Kraken</option>
        </select>
        <label for="status-filter">Filter by Status:</label>
        <select id="status-filter">
          <option value="all">All</option>
          <option value="passed">Passed</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div id="visualizer">
        ${TOOLS.map((tool) => toolSection(results, tool)).join("")}
      </div>
    </main>
    <script>
      function filterComparisons() {
        const toolFilter = document.getElementById('tool-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const comparisons = document.querySelectorAll('.comparison');

        comparisons.forEach(comparison => {
          const toolMatch = toolFilter === 'all' || comparison.classList.contains(toolFilter);
          const statusMatch = statusFilter === 'all' || comparison.classList.contains(statusFilter);
          comparison.style.display = (toolMatch && statusMatch) ? '' : 'none';
        });
      }

      document.getElementById('tool-filter').addEventListener('change', filterComparisons);
      document.getElementById('status-filter').addEventListener('change', filterComparisons);

      // Initial filter
      filterComparisons();
    </script>
  </body>
</html>`;
}

async function comparePair({
  tool,
  filename,
  latestPath,
  rcPath,
  outputRoot,
  outputToolDir,
}) {
  const compareImages = require("resemblejs/compareImages");
  const result = await compareImages(
    fs.readFileSync(latestPath),
    fs.readFileSync(rcPath),
    COMPARE_OPTIONS,
  );

  const nestedDir = path.dirname(filename) === "." ? "" : path.dirname(filename);
  const baseName = path.basename(filename);
  const outputDir = path.join(outputToolDir, nestedDir);
  const latestOutputPath = path.join(outputDir, `latest_${baseName}`);
  const rcOutputPath = path.join(outputDir, `rc_${baseName}`);
  const diffOutputPath = path.join(outputDir, `diff_${baseName}`);

  ensureDir(outputDir);
  fs.writeFileSync(diffOutputPath, result.getBuffer());
  fs.copyFileSync(latestPath, latestOutputPath);
  fs.copyFileSync(rcPath, rcOutputPath);

  const misMatchPercentage = Number(result.misMatchPercentage);
  return {
    tool,
    filename,
    latestReportPath: toReportPath(path.relative(outputRoot, latestOutputPath)),
    rcReportPath: toReportPath(path.relative(outputRoot, rcOutputPath)),
    diffReportPath: toReportPath(path.relative(outputRoot, diffOutputPath)),
    misMatchPercentage: result.misMatchPercentage,
    isSameDimensions: result.isSameDimensions,
    diffBounds: result.diffBounds,
    analysisTime: result.analysisTime,
    passed: misMatchPercentage <= config.threshold,
  };
}

async function run() {
  const runTimestamp = timestamp();
  const screenshotsBasePath = path.join(__dirname, config.screenshotsBasePath);
  const outputRoot = path.join(__dirname, config.outputDir, runTimestamp);
  const results = [];

  ensureDir(outputRoot);

  for (const tool of TOOLS) {
    const latestDir = path.join(screenshotsBasePath, config.latestVersion, tool);
    const rcDir = path.join(screenshotsBasePath, config.rcVersion, tool);
    const outputToolDir = path.join(outputRoot, tool);
    const files = pngFiles(latestDir);

    if (files.length === 0) {
      continue;
    }

    ensureDir(outputToolDir);

    for (const filename of files) {
      const latestPath = path.join(latestDir, filename);
      const rcPath = path.join(rcDir, filename);

      if (!fs.existsSync(rcPath)) {
        console.warn(`Warning: matching RC screenshot not found, skipping: ${rcPath}`);
        continue;
      }

      const comparison = await comparePair({
        tool,
        filename,
        latestPath,
        rcPath,
        outputRoot,
        outputToolDir,
      });
      results.push(comparison);
      console.log(`${tool}/${filename}: ${comparison.misMatchPercentage}%`);
    }
  }

  fs.writeFileSync(
    path.join(outputRoot, "report.html"),
    createReport(results, runTimestamp),
  );
  fs.copyFileSync(path.join(__dirname, "index.css"), path.join(outputRoot, "index.css"));
  console.log(`VRT report generated: ${path.join(outputRoot, "report.html")}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
