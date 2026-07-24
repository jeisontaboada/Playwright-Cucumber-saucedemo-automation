module.exports = {
  default: {
    // Ubicación de los archivos .feature (escenarios en Gherkin)
    paths: ["features/**/*.feature"],

    // Ubicación de los step definitions (implementación de los pasos)
    require: ["src/steps/**/*.ts", "src/support/**/*.ts"],

    // Configuración para usar TypeScript
    requireModule: ["ts-node/register"],

    format: [
      "progress-bar",
      "html:reports/cucumber-report.html",
      "json:reports/cucumber-report.json",
      "junit:reports/cucumber-report.xml",
    ],

    // Publicar resultados en la consola de manera detallada
    formatOptions: {
      snippetInterface: "async-await",
    },

    // Configuración de ejecución
    parallel: 2,
    retry: 1,
  },
};
