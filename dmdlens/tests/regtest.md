const puppeteer = require('puppeteer');
const { expect } = require('chai');

describe('Dashboard Regression Tests', function () {
  let browser;
  let page;

  before(async function () {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('https://qsctoreporting.uk.hsbc:9000/DMDLens/Vision27%20GBGFs', { waitUntil: 'networkidle2' });
  });

  after(async function () {
    await browser.close();
  });

  it('should load the dashboard page', async function () {
    const title = await page.title();
    expect(title).to.include('HSBC DMD Lens');
  });

  it('should display correct release frequency', async function () {
    const releaseFrequency = await page.$eval('.release-frequency', el => el.textContent.trim());
    expect(releaseFrequency).to.equal('172.3');
  });

  it('should display correct incidents count', async function () {
    const incidents = await page.$eval('.incidents', el => el.textContent.trim());
    expect(incidents).to.equal('54078');
  });

  it('should display correct change failure rate', async function () {
    const changeFailureRate = await page.$eval('.change-failure-rate', el => el.textContent.trim());
    expect(changeFailureRate).to.equal('0.30%');
  });

  it('should display correct LTDD value', async function () {
    const ltdd = await page.$eval('.ltdd', el => el.textContent.trim());
    expect(ltdd).to.equal('3.0');
  });

  it('should display the release frequency chart', async function () {
    const chart = await page.$('.release-frequency-chart');
    expect(chart).to.not.be.null;
  });

  it('should display the incidents chart', async function () {
    const chart = await page.$('.incidents-chart');
    expect(chart).to.not.be.null;
  });

  it('should display the change failure rate chart', async function () {
    const chart = await page.$('.change-failure-rate-chart');
    expect(chart).to.not.be.null;
  });

  it('should display the LTDD chart', async function () {
    const chart = await page.$('.ltdd-chart');
    expect(chart).to.not.be.null;
  });

  it('should have correct data in the table for Markets & Sec Services IT', async function () {
    const data = await page.$$eval('.data-table tr', rows => {
      const row = rows.find(row => row.textContent.includes('Markets & Sec Services IT'));
      return row ? row.textContent.trim().split(/\s+/) : [];
    });
    expect(data).to.deep.equal(['Markets & Sec Services IT', '449.4', '7325', '0.30%', '2.3']);
  });

  it('should have correct data in the table for Wholesale IT', async function () {
    const data = await page.$$eval('.data-table tr', rows => {
      const row = rows.find(row => row.textContent.includes('Wholesale IT'));
      return row ? row.textContent.trim().split(/\s+/) : [];
    });
    expect(data).to.deep.equal(['Wholesale IT', '113.9', '18605', '0.40%', '2.9']);
  });

  // Add more tests for other rows in the table as needed.

  it('should match the release frequency chart data', async function () {
    const chartData = await page.$$eval('.release-frequency-chart .bar', bars => bars.map(bar => bar.textContent.trim()));
    expect(chartData).to.deep.equal(['150', '175', '200', '225', '250', '275', '300']);
  });

  it('should match the incidents chart data', async function () {
    const chartData = await page.$$eval('.incidents-chart .bar', bars => bars.map(bar => bar.textContent.trim()));
    expect(chartData).to.deep.equal(['80864', '75000', '70000', '65000', '60000', '55000', '50000']);
  });

  it('should match the change failure rate chart data', async function () {
    const chartData = await page.$$eval('.change-failure-rate-chart .bar', bars => bars.map(bar => bar.textContent.trim()));
    expect(chartData).to.deep.equal(['0.40%', '0.35%', '0.30%', '0.25%', '0.20%', '0.15%', '0.10%']);
  });

  it('should match the LTDD chart data', async function () {
    const chartData = await page.$$eval('.ltdd-chart .bar', bars => bars.map(bar => bar.textContent.trim()));
    expect(chartData).to.deep.equal(['3.3', '3.0', '2.7', '2.4', '2.1', '1.8', '1.5']);
  });

  // Add more tests for other charts as needed.
});