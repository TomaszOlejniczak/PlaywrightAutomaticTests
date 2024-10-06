import { test, expect } from "@playwright/test";
import { failTestIfResponseStatus5XX, waitNotLessThan } from "../functions/stagingFunctions";
import * as auth from "../data/login.json";
import * as url from "../data/url.json";
import { MultifrontLoginPage } from "../../pages/multifrontLogin.page";
import { MultifrontDashboardPage } from "../../pages/multifrontDashboard.page";
const fs = require("fs");

test.describe("Multifront files upload and download tests", () => {
  let multifrontLoginPage: MultifrontLoginPage;
  let multifrontDashboardPage: MultifrontDashboardPage;
  test.setTimeout(50000);

  test.beforeEach(async ({ page }) => {
    await failTestIfResponseStatus5XX(page);
    //POM object
    multifrontLoginPage = new MultifrontLoginPage(page);
    multifrontDashboardPage = new MultifrontDashboardPage(page);

    await multifrontLoginPage.performLogin(
      page,
      url.multifront,
      auth.emailDownloadUpload,
      process.env.PASSWORD ?? "Password"
    );
    await waitNotLessThan(page, 1000);
    await multifrontDashboardPage.sideMenu.documentationButton.click();
    await multifrontDashboardPage.allFilesTab.waitFor({ state: "visible" });
    await waitNotLessThan(page, 50);
  });

  test("[fileDownload] GIVEN file in patient's documentation, WHEN you download file, THEN file should exist in valid path", async ({
    page,
  }) => {
    // download:
    const downloadPromise = page.waitForEvent("download");
    await multifrontDashboardPage.downloadFileButton.first().click();
    const download = await downloadPromise;
    const fileName = download.suggestedFilename();
    await waitNotLessThan(page, 50);
    await download.saveAs("downloadedFiles/" + fileName);
    await waitNotLessThan(page, 50);

    // expect
    expect(fs.existsSync("downloadedFiles/" + fileName)).toBeTruthy();
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });
});
