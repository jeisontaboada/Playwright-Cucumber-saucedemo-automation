# Estrategia de Automatización — SauceDemo

> Informe técnico de decisiones de diseño, patrones implementados y criterios de cobertura para la suite de pruebas automatizadas.

---

## Tabla de Contenidos

1. [Objetivo](#objetivo)
2. [Tecnologías Seleccionadas](#tecnologías-seleccionadas)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Patrones de Diseño](#patrones-de-diseño)
5. [Estrategia de Cobertura](#estrategia-de-cobertura)
6. [Organización de Tests por Tags](#organización-de-tests-por-tags)
7. [Manejo de Datos de Prueba](#manejo-de-datos-de-prueba)
8. [Estrategia de Paralelismo y Reintentos](#estrategia-de-paralelismo-y-reintentos)
9. [Gestión de Evidencias](#gestión-de-evidencias)
10. [Integración Continua](#integración-continua)
11. [Decisiones Técnicas Clave](#decisiones-técnicas-clave)

---

## Objetivo

Validar end-to-end los flujos críticos de la aplicación **SauceDemo** (`https://www.saucedemo.com`) cubriendo:

- Autenticación (login/logout con distintos tipos de usuario)
- Gestión del carrito de compras
- Proceso completo de checkout

La suite debe ser mantenible, legible por perfiles no técnicos, y ejecutarse tanto localmente como en un pipeline de CI/CD.

---

## Tecnologías Seleccionadas

| Herramienta | Versión | Por qué se eligió |
|---|---|---|
| **Playwright** | 1.40.1 | Auto-waiting nativo, sin flakiness por timeouts manuales, soporte TypeScript de primera clase |
| **Cucumber** | 10.3.1 | BDD — los escenarios en Gherkin son legibles por QA, Dev y negocio |
| **TypeScript** | 5.3.3 | Tipado estático detecta errores en compile-time, no en runtime |
| **ts-node** | — | Transpila TypeScript en tiempo de ejecución sin paso de build previo |
| **dotenv** | 16.3.1 | Separa credenciales del código fuente; mismo código corre en local y CI |
| **multiple-cucumber-html-reporter** | — | Dashboard HTML enriquecido con estadísticas y screenshots embebidos |

---

## Arquitectura del Proyecto

```
features/          ← Gherkin: QUÉ se prueba (lenguaje de negocio)
src/steps/         ← Glue code: conecta Gherkin con Page Objects
src/pages/         ← Page Objects: CÓMO se interactúa con la UI
src/support/       ← World (contexto) + Hooks (setup/teardown)
src/utils/         ← Funciones auxiliares reutilizables
.github/workflows/ ← Pipeline CI/CD en GitHub Actions
```

### Flujo de ejecución por escenario

```
Cucumber lee .feature
  → matchea Step Definition en steps/
    → step llama a método de Page Object
      → Page Object usa Playwright para interactuar con el browser
        → resultado vuelve al step
          → Cucumber reporta passed / failed
```

---

## Patrones de Diseño

### Page Object Model (POM)

Cada pantalla de la aplicación tiene una clase propia. Los steps no contienen selectores — solo llaman métodos semánticos.

```
BasePage (abstract)          ← métodos comunes: click, fill, getText, isVisible
  ├── LoginPage              ← login(), getErrorMessage()
  ├── ProductsPage           ← addProductToCart(), getCartBadgeCount(), logout()
  ├── CartPage               ← removeProduct(), proceedToCheckout()
  └── CheckoutPage           ← fillForm(), getSummary(), finishOrder()
```

**Por qué `abstract BasePage`:** impide instanciar la clase base directamente — solo se puede heredar, lo que garantiza que siempre se trabaja con una página concreta.

**Por qué `private resolve()`:** centraliza el manejo de `Locator | string` en un solo punto. Sin él, cada método (`click`, `fill`, `getText`) repetiría el mismo `typeof` check — 5 duplicaciones eliminadas.

### World Pattern (Cucumber)

`CustomWorld` es el contexto compartido por todos los steps de un mismo escenario. Contiene:

- `browser`, `context`, `page` — instancias de Playwright
- `pages` — mapa de Page Objects instanciados
- `lastProductAdded` — estado inter-step dentro del escenario

**Por qué `init()` y no el constructor:** el constructor no puede ser `async`. Playwright requiere `await browser.launch()` — por eso la inicialización va en un método separado que el hook `Before` llama con `await`.

**Por qué `cleanup()` en orden inverso:** cerrar `page → context → browser`. Si se cierra el browser primero, Playwright lanza errores al intentar cerrar el context y la page que ya no existen.

### Factory implícito en World

Los Page Objects se crean una sola vez en `init()` y se reutilizan durante todo el escenario. No hay `new LoginPage()` dispersos en los steps.

---

## Estrategia de Cobertura

### 15 Escenarios — Matriz de cobertura

| ID | Escenario | Tipo | Historia |
|---|---|---|---|
| ES-001 | Login con usuario estándar | Happy path | HU-001 |
| ES-002 | Login con usuario bloqueado | Unhappy path | HU-001 |
| ES-003 | Login con credenciales inválidas | Unhappy path | HU-001 |
| ES-004 | Agregar un producto al carrito | Happy path | HU-002 |
| ES-005 | Agregar múltiples productos | Happy path | HU-002 |
| ES-006 | Ver productos en el carrito | Happy path | HU-002 |
| ES-007 | Remover producto del carrito | Happy path | HU-002 |
| ES-008 | Continuar comprando desde el carrito | Happy path | HU-002 |
| ES-009 | Completar compra exitosamente | Happy path | HU-003 |
| ES-010 | Checkout sin nombre (campo vacío) | Unhappy path | HU-003 |
| ES-011 | Checkout sin apellido | Unhappy path | HU-003 |
| ES-012 | Checkout sin código postal | Unhappy path | HU-003 |
| ES-013 | Cancelar proceso de checkout | Happy path | HU-003 |
| ES-014 | Logout exitoso | Happy path | HU-001 |
| ES-015 | Login con campos vacíos | Unhappy path | HU-001 |

**Total:** 15 escenarios — 10 happy path, 5 unhappy path

### Distribución por funcionalidad

```
Login/Logout  → 5 escenarios  (33%)
Shopping      → 5 escenarios  (33%)
Checkout      → 5 escenarios  (33%)
```

---

## Organización de Tests por Tags

Los tags permiten ejecutar subconjuntos sin tocar la configuración.

| Tag | Escenarios | Propósito |
|---|---|---|
| `@smoke` | ES-001, ES-004, ES-009 | Validación mínima — ¿la app responde? |
| `@login` | ES-001 a ES-003, ES-014, ES-015 | Solo autenticación |
| `@shopping` | ES-004 a ES-008 | Solo carrito |
| `@checkout` | ES-009 a ES-013 | Solo compra |
| `@happy_path` | 10 escenarios | Flujos exitosos |
| `@unhappy_path` | 5 escenarios | Flujos de error |

```bash
npm run test:smoke      # 3 escenarios — validación rápida (~30s)
npm run test:happy      # 10 escenarios — flujos positivos
npm run test:unhappy    # 5 escenarios — manejo de errores
npm test                # 15 escenarios completos
```

---

## Manejo de Datos de Prueba

### Variables de entorno (`.env`)

Las credenciales nunca están hardcodeadas en el código. Se leen de `.env` en local y de **GitHub Secrets** en CI.

```env
STANDARD_USER=standard_user
LOCKED_USER=locked_out_user
PASSWORD=secret_sauce
INVALID_USER=invalid_user
INVALID_PASSWORD=wrong_password
```

### Scenario Outline para casos múltiples

ES-010, ES-011, ES-012 usan `Scenario Outline` + `Examples` para probar los 3 campos obligatorios del checkout con un solo bloque de código:

```gherkin
Scenario Outline: Checkout con campo <field> vacío
  Examples:
    | firstName | lastName | postalCode | expectedError         |
    |           | Doe      | 12345      | First Name is required|
    | John      |          | 12345      | Last Name is required |
    | John      | Doe      |            | Postal Code is required|
```

**Por qué `{float}` y `{int}` en los steps:** Cucumber convierte automáticamente el parámetro al tipo correcto — no hace falta `parseFloat()` ni `parseInt()` en el código del step.

### Precisión de precios

Los cálculos de precio usan `toBeCloseTo(value, 2)` en lugar de `toBe()` — en JavaScript `0.1 + 0.2 !== 0.3` por representación de punto flotante IEEE 754.

---

## Estrategia de Paralelismo y Reintentos

### Paralelismo (2 workers)

```javascript
// cucumber.js
parallel: 2
```

Cucumber ejecuta 2 escenarios simultáneamente. Cada worker tiene su propio `CustomWorld` con browser, context y page independientes — sin estado compartido entre escenarios.

**Por qué 2 y no más:** SauceDemo es una aplicación pública de demo. Con más de 2 workers paralelos puede haber rate limiting o comportamiento inestable del servidor.

### Reintentos (1 retry)

```javascript
retry: 1
```

Si un escenario falla (ej: flakiness de red), se reintenta una vez antes de marcarlo como fallido definitivamente. El `Date.now()` en el nombre del screenshot evita que el retry sobreescriba la evidencia del primer intento.

---

## Gestión de Evidencias

### Screenshots automáticos

El hook `After` captura screenshot al final de **cada escenario**:

```
reports/screenshots/passed/   ← escenarios que pasaron
reports/screenshots/failed/   ← escenarios que fallaron (para debugging)
```

El nombre incluye el timestamp para diferenciar reintentos:
```
Login_with_standard_user_1709734521432.png
```

Los screenshots también se adjuntan al reporte HTML como evidencia inline — visibles sin salir del reporte.

### Reportes disponibles

| Formato | Archivo | Uso |
|---|---|---|
| HTML interactivo | `cucumber-report.html` | Presentación, sustentación |
| JSON | `cucumber-report.json` | Integración con otras herramientas |
| JUnit XML | `cucumber-report.xml` | Compatibilidad con sistemas CI legacy |

---

## Integración Continua

### Pipeline GitHub Actions (`.github/workflows/ci.yml`)

Se dispara en:
- `push` a `main` o `master`
- `pull_request` a `main` o `master`
- Trigger manual desde la pestaña Actions (`workflow_dispatch`)

```
1. actions/checkout@v4          ← descarga el código
2. actions/setup-node@v4        ← Node.js 20 + caché npm
3. npm ci                       ← instala dependencias (reproducible)
4. playwright install chromium  ← solo chromium (sin Firefox/WebKit)
5. npm test                     ← 15 escenarios, HEADLESS=true
6. npm run report               ← genera HTML (if: always)
7. upload-artifact@v4           ← ZIP con reportes + screenshots, 7 días
```

**Por qué `npm ci` y no `npm install`:** `npm ci` instala exactamente las versiones del `package-lock.json` — reproducible y más rápido en CI.

**Por qué solo Chromium:** el proyecto está diseñado para un browser. Agregar Firefox/WebKit triplicaría el tiempo de CI sin valor adicional para este caso de uso.

**Por qué `if: always()` en report y upload:** si los tests fallan, el reporte y las screenshots son la evidencia principal para diagnosticar. Sin `always()` no se generarían cuando más se necesitan.

---

## Decisiones Técnicas Clave

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| `abstract BasePage` | Clase concreta | Previene `new BasePage()` — no tiene sentido instanciarla |
| `private resolve()` | `typeof` en cada método | Elimina 5 duplicaciones del mismo check |
| `init()` async | Constructor | Constructor no puede ser `async` en JS/TS |
| `cleanup()` en orden inverso | Cualquier orden | `page → context → browser` o Playwright lanza errores |
| XPath para botones de producto | CSS selector | CSS no puede navegar hacia un ancestro — XPath sí |
| `toBeCloseTo(x, 2)` | `toBe(x)` | Floating point: `0.1 + 0.2 !== 0.3` en JavaScript |
| `dotenv.config()` a nivel de módulo | Dentro de cada hook | Se ejecuta una vez, no 15 veces (una por escenario) |
| `Promise.all` en `getSummaryProductNames` | `for...of` secuencial | Obtiene todos los nombres en paralelo — más rápido |
| `if (firstName)` falsy check | `firstName !== ''` | String vacío es falsy en JS — más idiomático |
| GitHub Secrets para credenciales | `.env` en el repo | `.env` con credenciales reales nunca debe estar en git |
