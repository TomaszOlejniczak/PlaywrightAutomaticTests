import { test, expect } from "@playwright/test";
import {
  failTestIfResponseStatus5XX,
  performPayment,
  v4PerformLogin,
  waitNotLessThan,
  widgetConsWithRegister,
} from "../functions/stagingFunctions";
import * as auth from "../data/login.json";
import * as url from "../data/url.json";
import { MultifrontLoginPage } from "../../pages/multifrontLogin.page";
import { MultifrontDashboardPage } from "../../pages/multifrontDashboard.page";

test.describe("Widget consultation order tests", () => {
  test.setTimeout(70000);

  let multifrontDashboardPage: MultifrontDashboardPage;
  let multifrontLoginPage: MultifrontLoginPage;

  test.beforeEach(async ({ page }) => {
    await failTestIfResponseStatus5XX(page);
    multifrontDashboardPage = new MultifrontDashboardPage(page);
    multifrontLoginPage = new MultifrontLoginPage(page);
  });

  test("[widgetConsRemoteWithRegister] WHEN book visit for new patient using widget, THEN 'Go to consultation' button should be visible", async ({
    page,
  }) => {
    await widgetConsWithRegister(page, auth.emailConsWidget, auth.phone, process.env.PASSWORD ?? "Password");
    await multifrontDashboardPage.waitForPaymentOrSurvey(page);
    await multifrontDashboardPage.generalMedicalSurvey.fillGeneralMedicalSurvey(page);
    await performPayment(page);

    // expect
    await expect(multifrontDashboardPage.goToConsultationButton).toBeVisible({ timeout: 20000 });
  });

  test("[widgetConsRemoteWithLogin] WHEN existing user book visit from widget, THEN user should login correct AND see visit page or 'fill survey' button", async ({
    page,
  }) => {
    await failTestIfResponseStatus5XX(page);
    await page.goto(url.widgetCons);
    await page.locator(".css-1hb7zxy-IndicatorsContainer").first().click();
    await page.getByText("Pediatra").first().click();
    await page.getByText("Umów teleporadę za").click();
    await page.getByRole("button", { name: "Zaloguj się" }).click();
    await page.getByPlaceholder("E-mail, PESEL lub identyfikator*").fill(auth.emailConsWidget);
    await page.getByPlaceholder("Hasło*").fill(process.env.PASSWORD ?? "Password");
    await page.getByRole("button", { name: "Zaloguj się" }).click();
    await multifrontDashboardPage.payForButton.first().click();
    await performPayment(page);
    await multifrontDashboardPage.closePopUpIfVisibleHandler(page);
    await waitNotLessThan(page, 1000);
    await multifrontDashboardPage.goToConsultationButton.click({ timeout: 20000 });
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.consultationChatbox.fill("Dzień dobry!");
    await multifrontDashboardPage.consultationChatbox.press("Enter");
    await waitNotLessThan(page, 50);
    await expect(
      page
        .locator("div")
        .filter({ hasText: /^Dzień dobry!$/ })
        .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
    ).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    await page.close();
  });
});
