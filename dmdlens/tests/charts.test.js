const puppeteer = require('puppeteer');
const { expect } = require('chai');

describe('DMDLens Dashboard - Charts Rendering', function() {
  let browser;
  let page;

  before(async function() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  after(async function() {
    await browser.close();
  });

  it('should render table line chart', async function() {
    await page.goto('https://qsctoreporting.uk.hsbc9000/DMDLens/Wealth&PersonalBankingIT');
    await page.waitForSelector('#tableLineChart');
    const chart = await page.$('#tableLineChart');
    expect(chart).to.not.be.null;
  });

  it('should render bar chart', async function() {
    await page.goto('https://qsctoreporting.uk.hsbc9000/DMDLens/Wealth&PersonalBankingIT');
    await page.waitForSelector('#barChart');
    const chart = await page.$('#barChart');
    expect(chart).to.not.be.null;
  });

  it('should have correct data in table line chart', async function() {
    await page.goto('https://qsctoreporting.uk.hsbc9000/DMDLens/Wealth&PersonalBankingIT');
    await page.waitForSelector('#tableLineChart');
    const data = await page.evaluate(() => {
      // Replace with actual data extraction logic
      return document.querySelector('#tableLineChart').dataset;
    });
    expect(data).to.include.keys('expectedKey');
  });

  it('should update charts correctly when filters are applied', async function() {
    await page.goto('https://qsctoreporting.uk.hsbc9000/DMDLens/Wealth&PersonalBankingIT');
    await page.waitForSelector('#filter');
    await page.click('#filter');
    await page.select('#filter', 'newFilterValue');
    await page.waitForTimeout(1000); // Wait for charts to update

    const chart = await page.$('#tableLineChart');
    const isVisible = await chart.boundingBox() !== null;
    expect(isVisible).to.be.true;
  });

  it('should display tooltips on hover', async function() {
    await page.goto('https://qsctoreporting.uk.hsbc9000/DMDLens/Wealth&PersonalBankingIT');
    await page.waitForSelector('#barChart');
    await page.hover('#barChart');
    const tooltip = await page.$('.tooltip');
    expect(tooltip).to.not.be.null;
  });
});
