const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');
const handlebars = require("handlebars");
const helpers = require('./samples/happiu-mira/happiu-mira-main/helpers')
const data = require('./samples/happiu-mira/happiu-mira-data/dataJson.json')

const Main = require('./core/Main')


const main = async () => {
  try {
    start = new Date()
    const main = new Main('/samples/happiu-mira/happiu-mira-main')

    main.registerHelper()
    main.buildHTML()
    await main.toPDF(data)
    end = new Date()

    console.log((end - start) / 1000
    )
  } catch (error) {
    console.log(error)
  }
}

main()