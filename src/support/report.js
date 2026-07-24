const reporter = require('multiple-cucumber-html-reporter');
const path = require('path');
const fs = require('fs');

const jsonReportPath = path.join(__dirname, '../../reports/cucumber-report.json');

if (!fs.existsSync(jsonReportPath)) {
    console.error(`❌ No se encontró el reporte JSON en: ${jsonReportPath}`);
    console.error('   Asegúrate de haber ejecutado los tests primero con: npm test');
    process.exit(1);
}

reporter.generate({
    jsonDir: path.join(__dirname, '../../reports'),
    reportPath: path.join(__dirname, '../../reports/html-report'),
    metadata: {
        browser: { name: 'chrome', version: 'latest' },
        device: 'Local Test Machine',
        platform: { name: process.platform, version: process.version },
    },
    customData: {
        title: 'SauceDemo Automation Report',
        data: [
            { label: 'Project', value: 'Playwright-Cucumber-SauceDemo' },
            { label: 'Release', value: '1.0.0' },
            { label: 'Environment', value: process.env.ENVIRONMENT || 'qa' },
            { label: 'Executed', value: new Date().toLocaleString() },
        ],
    },
    disableLog: false,
    openReportInBrowser: false,
    saveCollectedJSON: true,
});

console.log('✅ Reporte HTML generado en: reports/html-report/index.html');
