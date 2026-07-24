import { Before, After, Status, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import dotenv from 'dotenv';

// Cargar variables de entorno una única vez al inicio
dotenv.config();

// ─── Helper ──────────────────────────────────────────────────────────────────

async function takeScreenshot(
  world: CustomWorld,
  folder: 'passed' | 'failed',
  scenarioName: string,
): Promise<void> {
  const safeName = scenarioName.replace(/\s+/g, '_');
  const path = `reports/screenshots/${folder}/${safeName}_${Date.now()}.png`; // Date.now() evita sobreescribir si el mismo escenario se reintenta
  const screenshot = await world.page.screenshot({ path, fullPage: true });
  world.attach(screenshot, 'image/png');
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

BeforeAll(async function () {
  console.log('Iniciando ejecución de tests...');
  console.log(`Ambiente : ${process.env.ENVIRONMENT}`);
  console.log(`URL Base : ${process.env.BASE_URL}`);
  console.log(`Headless : ${process.env.HEADLESS}`);
  console.log('-------------------------------------------\n');
});

Before(async function (this: CustomWorld, { pickle }) {
  await this.init();
  console.log(`\nEjecutando escenario: ${pickle.name}`);
});

After(async function (this: CustomWorld, { pickle, result }) {
  const name = pickle.name;

  if (result?.status === Status.FAILED) {
    console.log(`FALLIDO ✖  "${name}"`);
    await takeScreenshot(this, 'failed', name);
  } else if (result?.status === Status.PASSED) {
    console.log(`PASADO  ✔  "${name}"`);
    await takeScreenshot(this, 'passed', name);
  }

  await this.cleanup();
});

AfterAll(async function () {
  console.log('Ejecución de tests completada');
  console.log('Revisa los reportes en la carpeta reports/');
});
