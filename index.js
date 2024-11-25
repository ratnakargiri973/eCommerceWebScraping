import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import XLSX from 'xlsx';

const filePath = './shoesData.txt';
const jsonFilePath = 'productInformation.json';
const xlsxFilePath = 'productInformation.xlsx';

async function scrapeAmazon() {
    try {
        const response = await axios.get('https://www.amazon.in/s?k=shoes&crid=VLE0A5G37Y32&sprefix=shoes%2Caps%2C251&ref=nb_sb_noss_1');

        await writeFile(filePath, response.data);

        const data = fs.readFileSync(filePath, 'utf-8');
        const $ = cheerio.load(data);

        const productInformation = [];

        $('.a-size-base-plus.a-color-base').each((index, tag) => {
            productInformation[index] = {};
            productInformation[index].productName = $(tag).text();
        });

        $('.a-size-base-plus.a-color-base.a-text-normal').each((index, tag) => {
            productInformation[index].Accessibility = $(tag).text();
        });

        $('.a-price-whole').each((index, tag) => {
            productInformation[index].price = $(tag).text();
        });

        $('.a-icon-alt').each((index, tag) => {
            productInformation[index].Rating = $(tag).text();
        });

        fs.writeFileSync(jsonFilePath, JSON.stringify(productInformation, null, 2));

        convertJsonToXlsx(productInformation, xlsxFilePath);

    } catch (error) {
        console.error('Error occurred while scraping Amazon:', error);
    }
}

function writeFile(filePath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log("File written successfully");
                resolve();
            }
        });
    });
}

function convertJsonToXlsx(jsonData, outputFilePath) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(jsonData);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, outputFilePath);
    console.log('JSON data has been converted to XLSX and saved to', outputFilePath);
}

// Run the scraper
scrapeAmazon();
