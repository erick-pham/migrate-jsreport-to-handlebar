const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');
const handlebars = require("handlebars");
const _ = require('lodash')
class Main {
  constructor(templateName, options, width) {
    this.rootFolder = templateName.split('/').slice(0, -1).join('/')
    this.mainTemplate = null
    this.handlebars = handlebars
    this.templateName = templateName
    this.options = options ? options : {
      format: 'A4',
      preferCSSPageSize: true,
      margin: {
        top: "3.5cm",
        bottom: "2.5cm",
        left: "1cm",
        right: "1cm"
      },
      path: 'pdfPath.pdf',
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: '<div></div>',
    }
  }

  registerHelper() {
    const helpers = require(path.join(process.cwd() + `${this.templateName}/helpers.js`))
    _.forEach(helpers, i => {
      this.handlebars.registerHelper(i.name, i)
    })
  }

  buildHTML() {
    const templateHtml = fs.readFileSync(path.join(process.cwd(), `${this.templateName}/content.handlebars`), 'utf8');
    this.mainTemplate = handlebars.compile(templateHtml);
  }

  _buildHeaderAndFooter() {
    if (this.options.displayHeaderFooter) {
      const headerTemplate = fs.readFileSync(path.join(process.cwd(), `${this.templateName}/header.handlebars`), 'utf8');
      const footerTemplate = fs.readFileSync(path.join(process.cwd(), `${this.templateName}/footer.handlebars`), 'utf8');
      this.options.headerTemplate = headerTemplate;
      this.options.footerTemplate = footerTemplate;
    }

  }

  async toPDF(data) {
    const html = this.mainTemplate(data);
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-setuid-sandbox', '--font-render-hinting=none'],
      // headless: false,
      // devtools: true
    });

    var page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle2",
      timeout: 300000,
      waitFor: 30000,
    })

    const element = await page.$('#main-style');
    const element_property = await element.getProperty('innerHTML');
    let inner_html = await element_property.jsonValue()
    inner_html = inner_html.replace(/,/g, '\n').trim();
    const styleFilename = inner_html.split(' ')[1]
    var templateCss = fs.readFileSync(path.join(process.cwd(), `${this.rootFolder}/${styleFilename}/content.css`), 'utf8');
    await page.evaluate((templateCss) => {
      document.querySelector('#main-style').innerHTML = templateCss
    }, templateCss);
    const htmlOutput = await page.content();

    fs.writeFileSync(path.join(process.cwd() + '/templateHtml.html'), htmlOutput);
    await page.goto(`file:${path.join(process.cwd() + '/templateHtml.html')}`, {
      waitUntil: 'networkidle2'
    });

    this._buildHeaderAndFooter()
    const rs = await page.pdf(this.options);
    // pdfStreem = await page.createPDFStream(options)
    await browser.close();
  }
}

module.exports = Main