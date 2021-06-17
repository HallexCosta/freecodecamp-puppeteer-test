const fs = require("fs");
const puppeteer = require("puppeteer");

const performTest = async (
  fingerprintFilename = "fingerprint.json",
  screenshotFilename = "results.png",
  mockBrowserFingerprint = true
) => {
  // The URL of the test.
  const url = "https://arh.antoinevastel.com/bots/areyouheadless";

  // Launch the headless browser and create a new tab.
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });
  const page = await browser.newPage();

  if (mockBrowserFingerprint) {
    // Load in a prerecorded browser fingerprint.
    const fingerprint = JSON.parse(
      fs.readFileSync(fingerprintFilename).toString()
    );

    const testUrl = "https://arh.antoinevastel.com/bots/scannerareuhead";

    const headers = {
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0",
      "accept-language": "en-US,en;q=0.5",
      "accept-encoding": "gzip, deflate, br",
    };

    await page.setRequestInterception(true);
    page.on("request", async (interceptedRequest) => {
      // Merge the header overrides into the request.
      const overrides = {
        headers: {
          ...interceptedRequest.headers(),
          ...headers,
        },
      };

      // Override the fingerprint for the test URL.
      if (interceptedRequest.url() === testUrl) {
        // Update the UUID and URL from the page.
        fingerprint.uuid = await page.evaluate(() => uuid);
        fingerprint.url = page.url();

        // Merge this stuff into the request overrides.
        const postData = JSON.stringify(fingerprint);
        overrides.headers["content-length"] = postData.length;
        overrides.postData = postData;
      }

      // Continue on our merry way.
      interceptedRequest.continue(overrides);
    });
  }

  // Visit the page and take a screenshot.
  await page.goto(url);
  await page.screenshot({ path: screenshotFilename });

  // Clean up the browser before exiting.
  await browser.close();
};

(async () => {
  await performTest();
})();
