import { Browser, Builder, By, ThenableWebDriver, until } from "selenium-webdriver"
import fs from "fs"
import path from "path"
import moment from "moment"
import screenshot from "screenshot-desktop"
import chrome from "selenium-webdriver/chrome"
import { getRDPStatus } from "./utils"

let driver: ThenableWebDriver;
let screenshotIntervalId: NodeJS.Timeout;
export async function run(url: string) {
    try {
        await driver.quit();
    }
    catch (err) {
        console.log("Error druing closing window");
    }
    try {

        const chromeOptions = new chrome.Options();
        const extensionPath = path.resolve(__dirname, "../extension");
        chromeOptions.addArguments(`load-extension=${extensionPath}`)

        driver = new Builder().forBrowser(Browser.CHROME).setChromeOptions(chromeOptions).build();
        await driver.get(url);
        driver.wait(until.elementLocated(By.id("helloworld")), 1000 * 60 * 10).catch(err => {
            console.error("Error during run function");
        });
    }
    catch (err) {
        console.error("Error during run function");
    }
}


export async function exit() {
    try {
        await driver.quit();
    }
    catch (err) {
        console.error("Error in exciting selenium");
    }
}

export async function isOpened() {
    try {
        // await driver.executeScript("return document.readyState");
        console.log(await driver.getWindowHandle())
    }
    catch (err) {
        return false;
    }
    return true;
}


export async function startScreenShot(id: string) {
    // let disconnect_count = 0;
    screenshotIntervalId = setInterval(async () => {
        try {
            if (!(await isOpened())) {
                clearInterval(screenshotIntervalId);
                setTimeout(() => fetch(`http://localhost:8001/logoff`), 1000 * 5);
            }
            if (await getRDPStatus() === "connected") {
                const dir = path.join(__dirname, "../static", id);
                const filePath = path.join(dir, moment().format("YYYY-MM-DD-HH-mm-ss") + ".png");
                await fs.promises.mkdir(dir, { recursive: true });
                screenshot({ format: 'png' })
                    .then((imageBuffer: any) => {
                        // Write the image buffer to a file
                        fs.writeFile(filePath, imageBuffer, (err) => {
                            if (err) {
                                console.error('Error saving screenshot:', err);
                            } else {
                                console.log('Screenshot saved to', filePath);
                            }
                        });
                    })
                    .catch((err: any) => {
                        console.error('Error capturing screenshot:', err);
                    });
            } else {
                // disconnect_count++;
                // if (disconnect_count == 3) {
                //     clearInterval(screenshotIntervalId);
                //     fetch(`http://localhost:8001/logoff`);
                // }
            }
        }
        catch (err) {
            console.log("Error occured during screenshot");
        }
    }, 5000);
};