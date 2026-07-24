# Playwright-Cucumber-SauceDemo-Automation

> 🔗 **Repositorio:** https://github.com/jeisontaboada/Playwright-Cucumber-saucedemo-automation

Suite de pruebas automatizadas para la aplicación web Sauce Demo utilizando Playwright con Cucumber, implementando el patrón Page Object Model.

> 📋 **Informe de Estrategia y Patrones:** ver [`STRATEGY.md`](STRATEGY.md)


## Descripción

Este proyecto implementa una suite de pruebas automatizadas end-to-end para validar las funcionalidades principales de la aplicación Sauce Demo:

- Inicio de sesión con diferentes tipos de usuarios
- Gestión del carrito de compras
- Proceso completo de checkout y compra

## Tecnologías Utilizadas

- **Playwright** v1.40.1 - Framework de automatización de navegadores
- **Cucumber** v10.3.1 - Framework BDD (Behavior Driven Development)
- **TypeScript** v5.3.3 - Lenguaje de programación con tipado fuerte
- **Node.js** v25.2.1 - Entorno de ejecución
- **dotenv** v16.3.1 - Gestión de variables de entorno

## Requisitos Previos

Asegúrate de tener instalado:

- Node.js (versión 18 o superior)
- npm (versión 9 o superior)
- Git

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/jeisontaboada/Playwright-Cucumber-saucedemo-automation
cd Playwright-Cucumber-saucedemo-automation
```

2. Instalar las dependencias:

```bash
npm install
```

3. Instalar los navegadores de Playwright:

```bash
npx playwright install chromium
```

## Configuración

### Variables de Entorno

El proyecto utiliza un archivo `.env` para la configuración. Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

Las variables disponibles son:

```env
# URL de la aplicación
BASE_URL=https://www.saucedemo.com

# Credenciales de usuarios
STANDARD_USER=standard_user
LOCKED_USER=locked_out_user
PASSWORD=secret_sauce
INVALID_USER=invalid_user
INVALID_PASSWORD=wrong_password

# Configuración de timeouts (en milisegundos)
ACTION_TIMEOUT=15000
NAVIGATION_TIMEOUT=30000
TEST_TIMEOUT=60000

# Configuración de Playwright
HEADLESS=false
VIEWPORT_WIDTH=1920
VIEWPORT_HEIGHT=1080
RECORD_VIDEO=false

# Ambiente
ENVIRONMENT=qa
```

**Nota:** 
- `HEADLESS=false` ejecuta los tests con navegador visible
- `HEADLESS=true` ejecuta los tests en modo headless (sin UI)

## Estructura del Proyecto

```
Playwright-Cucumber-saucedemo-automation/
├── features/                    # Feature files en Gherkin
│   ├── login.feature           # Escenarios de autenticación (incluyendo logout)
│   ├── shopping.feature        # Escenarios de carrito de compras
│   └── checkout.feature        # Escenarios de proceso de compra
├── src/
│   ├── pages/                  # Page Object Model
│   │   ├── BasePage.ts        # Clase base con métodos comunes
│   │   ├── LoginPage.ts       # Página de login
│   │   ├── ProductsPage.ts    # Página de productos
│   │   ├── CartPage.ts        # Página del carrito
│   │   └── CheckoutPage.ts    # Página de checkout
│   ├── steps/                  # Step Definitions
│   │   ├── loginSteps.ts      # Implementación de pasos de login y logout
│   │   ├── shoppingSteps.ts   # Implementación de pasos de shopping
│   │   └── checkoutSteps.ts   # Implementación de pasos de checkout
│   ├── support/                # Archivos de soporte
│   │   ├── world.ts           # Contexto compartido (World)
│   │   ├── hooks.ts           # Hooks (Before/After)
│   │   └── report.js          # Generador de reporte HTML detallado
│   └── utils/                  # Utilidades reutilizables
│       └── priceUtils.ts      # Funciones de manipulación de precios
├── reports/                    # Reportes generados
│   ├── screenshots/           
│   │   ├── passed/            # Screenshots de tests exitosos
│   │   └── failed/            # Screenshots de tests fallidos
│   ├── cucumber-report.html   # Reporte HTML de Cucumber
│   ├── cucumber-report.json   # Reporte JSON
│   └── cucumber-report.xml    # Reporte JUnit XML
├── .env                        # Variables de entorno (no versionado)
├── .env.example               # Plantilla de variables de entorno
├── .gitignore                 # Archivos ignorados por Git
├── cucumber.js                # Configuración de Cucumber
├── tsconfig.json              # Configuración de TypeScript
├── STRATEGY.md                # Informe de estrategia y patrones de diseño
└── package.json               # Dependencias y scripts del proyecto
```

## Ejecución de Pruebas

### Ejecutar todos los tests

```bash
npm test
```

### Ejecutar tests específicos por tags

```bash
# Solo tests críticos (smoke)
npm run test:smoke

# Solo tests de login
npm run test:login

# Solo tests de shopping
npm run test:shopping

# Solo tests de checkout
npm run test:checkout

# Solo flujos exitosos
npm run test:happy

# Solo flujos de error
npm run test:unhappy

# Escenario específico
npm test -- --tags "@ES-001"
```

### Ejecutar en modo secuencial (un test a la vez)

```bash
npm run test:sequential
```

> **Para ejecutar con navegador visible:** establece `HEADLESS=false` en tu archivo `.env` antes de correr cualquier script.

### Opciones de ejecución

- Los tests se ejecutan en paralelo por defecto (2 workers)
- Si un test falla, se reintenta automáticamente 1 vez
- Los screenshots se guardan automáticamente en `reports/screenshots/`

## Reportes

Después de ejecutar los tests, se generan automáticamente:

### Reportes de Cucumber

- **HTML:** `reports/cucumber-report.html` - Reporte visual interactivo
- **JSON:** `reports/cucumber-report.json` - Para integración con otras herramientas
- **JUnit XML:** `reports/cucumber-report.xml` - Para sistemas CI/CD

### Screenshots

Los screenshots se organizan automáticamente:

- `reports/screenshots/passed/` - Screenshots de tests exitosos
- `reports/screenshots/failed/` - Screenshots de tests fallidos (para debugging)

## Integración Continua (CI/CD)

El proyecto incluye un workflow de GitHub Actions (`.github/workflows/ci.yml`) que se ejecuta automáticamente en cada `push` o `pull request` a la rama `main`.

### Flujo del pipeline

```
git push
  → Checkout del código
  → Setup Node.js 20
  → npm ci (instala dependencias)
  → npx playwright install chromium
  → npm test (15 escenarios en paralelo)
  → npm run report (genera HTML)
  → Upload artefactos (ZIP con reportes + screenshots)
```

### Configuración de Secrets

Las credenciales no viven en el repo — se configuran como **Repository Secrets** en GitHub:

| Secret | Descripción |
|---|---|
| `BASE_URL` | URL de la aplicación |
| `STANDARD_USER` | Usuario estándar |
| `LOCKED_USER` | Usuario bloqueado |
| `PASSWORD` | Contraseña |
| `INVALID_USER` | Usuario inválido |
| `INVALID_PASSWORD` | Contraseña inválida |

> Settings → Secrets and variables → Actions → New repository secret

### Artefactos generados

Después de cada ejecución, el pipeline sube un ZIP descargable desde la pestaña **Actions** con:
- Reporte HTML interactivo
- Screenshots de todos los escenarios (passed/failed)
- Reporte JSON

Los artefactos se conservan **7 días** por ejecución.

### Trigger manual

Además del trigger automático por push, el workflow puede dispararse manualmente:
> Actions → Playwright + Cucumber Tests → Run workflow → Run

---

## Estrategia de Automatización

### Enfoque BDD (Behavior Driven Development)

Se utiliza Cucumber con Gherkin para escribir los escenarios en lenguaje natural, permitiendo:

- Colaboración entre equipos técnicos y no técnicos
- Documentación viva de los requisitos
- Fácil mantenimiento y comprensión de los tests

### Cobertura de Pruebas

El proyecto cubre los siguientes flujos:

1. **Autenticación (5 escenarios)**
   - Login exitoso con usuario estándar
   - Login fallido con usuario bloqueado
   - Login fallido con credenciales inválidas
   - Login fallido con campos vacíos
   - Logout exitoso

2. **Gestión del Carrito (5 escenarios)**
   - Agregar un producto al carrito
   - Agregar múltiples productos
   - Ver productos en el carrito
   - Remover productos del carrito
   - Continuar comprando desde el carrito

3. **Proceso de Compra (5 escenarios)**
   - Completar compra exitosamente
   - Validación de campos obligatorios
   - Validación de información parcial
   - Cancelar proceso de checkout
   - Verificar cálculos de precios

**Total:** 15 escenarios que validan el flujo completo de la aplicación

### Tipos de Pruebas

- **Pruebas positivas:** Validan el flujo feliz (happy path)
- **Pruebas negativas:** Validan manejo de errores y validaciones
- **Pruebas de integración:** Validan flujos completos end-to-end

## Patrones de Diseño

### Page Object Model (POM)

El proyecto implementa el patrón Page Object Model para:

- **Separación de responsabilidades:** Cada página tiene su propia clase
- **Reutilización de código:** Métodos compartidos en BasePage
- **Mantenibilidad:** Cambios en la UI se reflejan solo en los Page Objects
- **Legibilidad:** Los steps son claros y descriptivos

**Estructura POM:**

```
BasePage (clase abstracta)
    ├── Métodos comunes (click, fill, getText, etc.)
    │
    ├── LoginPage extends BasePage
    │   └── Métodos específicos de login
    │
    ├── ProductsPage extends BasePage
    │   └── Métodos de gestión de productos
    │
    ├── CartPage extends BasePage
    │   └── Métodos de gestión del carrito
    │
    └── CheckoutPage extends BasePage
        └── Métodos de proceso de compra
```

### Otros Patrones Implementados

- **Factory Pattern:** Creación de instancias de Page Objects en el World
- **Singleton Pattern:** Contexto compartido (World) único por escenario
- **Strategy Pattern:** Configuración flexible mediante variables de entorno

## Escenarios de Prueba

### Tags Utilizados

Los escenarios están organizados con tags para facilitar la ejecución selectiva:

- `@HU-001`, `@HU-002`, `@HU-003` - Historias de usuario
- `@ES-001` a `@ES-015` - IDs de escenarios
- `@smoke` - Tests críticos que deben ejecutarse siempre
- `@happy_path` - Flujos exitosos del usuario (camino feliz)
- `@unhappy_path` - Flujos de error y validaciones (camino alterno)
- `@login`, `@shopping`, `@checkout` - Categorías funcionales

### Usuarios de Prueba

El proyecto utiliza los siguientes tipos de usuario:

- **standard_user:** Usuario estándar con acceso completo
- **locked_out_user:** Usuario bloqueado (para pruebas negativas)
- **invalid_user:** Usuario que no existe (para pruebas negativas)

Las credenciales concretas se configuran en `.env` siguiendo la plantilla de `.env.example`.

## Criterios de Aceptación Validados

El proyecto valida todos los criterios de aceptación del reto:

1. El usuario puede iniciar sesión con credenciales válidas (ES-001)
2. El usuario no puede iniciar sesión con credenciales inválidas (ES-002, ES-003)
3. El usuario puede agregar un producto al carrito desde la página de productos (ES-004, ES-005)
4. El usuario puede ver los productos agregados en el carrito de compras (ES-006)
5. El usuario puede completar el proceso de compra hasta la confirmación (ES-009)


## Buenas Prácticas Implementadas

- Uso de TypeScript para tipado fuerte y prevención de errores
- Variables de entorno para configuración flexible
- Hooks para setup y teardown automáticos
- Screenshots automáticos para debugging
- Reintentos automáticos en caso de fallos intermitentes
- Ejecución paralela para optimizar tiempos
- Separación clara entre código de pruebas y código de la aplicación
- Comentarios y documentación en el código

## Autor

Jeison
