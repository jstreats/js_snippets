const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const path = require('path');

// Set the custom path for chromedriver
const chromedriverPath = path.resolve('/path/to/your/custom/chromedriver');

describe('Dashboard Regression Tests', function () {
  let driver;

  before(async function () {
    const service = new chrome.ServiceBuilder(chromedriverPath).build();
    chrome.setDefaultService(service);

    driver = await new Builder().forBrowser('chrome').build();
    await driver.get('https://qsctoreporting.uk.hsbc:9000/DMDLens/Vision27%20GBGFs');
  });

  after(async function () {
    await driver.quit();
  });

  it('should load the dashboard page', async function () {
    const title = await driver.getTitle();
    expect(title).to.include('HSBC DMD Lens');
  });

  it('should display correct release frequency', async function () {
    const releaseFrequency = await driver.findElement(By.css('.release-frequency')).getText();
    expect(releaseFrequency.trim()).to.equal('172.3');
  });

  it('should display correct incidents count', async function () {
    const incidents = await driver.findElement(By.css('.incidents')).getText();
    expect(incidents.trim()).to.equal('54078');
  });

  it('should display correct change failure rate', async function () {
    const changeFailureRate = await driver.findElement(By.css('.change-failure-rate')).getText();
    expect(changeFailureRate.trim()).to.equal('0.30%');
  });

  it('should display correct LTDD value', async function () {
    const ltdd = await driver.findElement(By.css('.ltdd')).getText();
    expect(ltdd.trim()).to.equal('3.0');
  });

  it('should display the release frequency chart', async function () {
    const chart = await driver.findElement(By.css('.release-frequency-chart'));
    expect(chart).to.not.be.null;
  });

  it('should display the incidents chart', async function () {
    const chart = await driver.findElement(By.css('.incidents-chart'));
    expect(chart).to.not.be.null;
  });

  it('should display the change failure rate chart', async function () {
    const chart = await driver.findElement(By.css('.change-failure-rate-chart'));
    expect(chart).to.not.be.null;
  });

  it('should display the LTDD chart', async function () {
    const chart = await driver.findElement(By.css('.ltdd-chart'));
    expect(chart).to.not.be.null;
  });

  it('should have correct data in the table for Markets & Sec Services IT', async function () {
    const data = await driver.findElement(By.xpath('//tr[td[text()="Markets & Sec Services IT"]]')).getText();
    const dataArray = data.trim().split(/\s+/);
    expect(dataArray).to.deep.equal(['Markets & Sec Services IT', '449.4', '7325', '0.30%', '2.3']);
  });

  it('should have correct data in the table for Wholesale IT', async function () {
    const data = await driver.findElement(By.xpath('//tr[td[text()="Wholesale IT"]]')).getText();
    const dataArray = data.trim().split(/\s+/);
    expect(dataArray).to.deep.equal(['Wholesale IT', '113.9', '18605', '0.40%', '2.9']);
  });

  // Add more tests for other rows in the table as needed.

  it('should match the release frequency chart data', async function () {
    const bars = await driver.findElements(By.css('.release-frequency-chart .bar'));
    const chartData = [];
    for (let bar of bars) {
      chartData.push(await bar.getText());
    }
    expect(chartData).to.deep.equal(['150', '175', '200', '225', '250', '275', '300']);
  });

  it('should match the incidents chart data', async function () {
    const bars = await driver.findElements(By.css('.incidents-chart .bar'));
    const chartData = [];
    for (let bar of bars) {
      chartData.push(await bar.getText());
    }
    expect(chartData).to.deep.equal(['80864', '75000', '70000', '65000', '60000', '55000', '50000']);
  });

  it('should match the change failure rate chart data', async function () {
    const bars = await driver.findElements(By.css('.change-failure-rate-chart .bar'));
    const chartData = [];
    for (let bar of bars) {
      chartData.push(await bar.getText());
    }
    expect(chartData).to.deep.equal(['0.40%', '0.35%', '0.30%', '0.25%', '0.20%', '0.15%', '0.10%']);
  });

  it('should match the LTDD chart data', async function () {
    const bars = await driver.findElements(By.css('.ltdd-chart .bar'));
    const chartData = [];
    for (let bar of bars) {
      chartData.push(await bar.getText());
    }
    expect(chartData).to.deep.equal(['3.3', '3.0', '2.7', '2.4', '2.1', '1.8', '1.5']);
  });

  // Add more tests for other charts as needed.
});