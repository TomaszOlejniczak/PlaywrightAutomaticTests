import { test, expect } from "@playwright/test";
import {
  waitNotLessThan,
  failTestIfResponseStatus5XX
} from "../functions/stagingFunctions";
import * as auth from "../data/login.json";
import * as url from "../data/url.json";
import { MultifrontLoginPage } from "../../pages/multifrontLogin.page";
import { MultifrontDashboardPage } from "../../pages/multifrontDashboard.page";

test.setTimeout(90000);

let multifrontDashboardPage: MultifrontDashboardPage;
let multifrontLoginPage: MultifrontLoginPage;

test.describe("POZ global test suite", () => {
  test.beforeEach(async ({ page }) => {
    await failTestIfResponseStatus5XX(page);
    multifrontDashboardPage = new MultifrontDashboardPage(page);
    multifrontLoginPage = new MultifrontLoginPage(page);
    await multifrontLoginPage.performLogin(
      page,
      url.multifront,
      auth.emailPOZGlobal,
      process.env.PASSWORD ?? "Password"
    );
    await multifrontDashboardPage.closePopUpIfVisibleHandler(page);
    await waitNotLessThan(page, 2000);
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await multifrontDashboardPage.visitReasonHeading
      .or(multifrontDashboardPage.chooseSpecializationHeading)
      .waitFor({ state: "visible" });
    await multifrontDashboardPage.checkVisitReason(page);
    await multifrontDashboardPage.bookForFreeButton.first().click();
    await waitNotLessThan(page, 50);
  });

  test("[noChargeConsultationPOZ-Global] GIVEN patient with POZ-Global, WHEN book free consultation, THEN should see medical survey", async ({
    page,
  }) => {
    // different expects depending on survey configuration (commented)
    await expect(
      multifrontDashboardPage.goToBookedVisitButton
        .or(multifrontDashboardPage.surveyButton)
        .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
    ).toBeVisible({
      timeout: 30000,
    });


    await page.close();
  });

  test("[oneConsultationPerDayPOZ] GIVEN patient with POZ-Global and one POZ consultation, WHEN try to book another POZ consultation same day, THEN should be blocked, And should see information about one per day limit", async ({
    page,
  }) => {
    await expect(multifrontDashboardPage.moreThanOnePozConsultationPerDayHeading).toBeVisible({ timeout: 25000 });
    await page.close();
  });
});

test.describe("POZ limited test suite", () => {
  test.beforeEach(async ({ page }) => {
    await failTestIfResponseStatus5XX(page);
    multifrontDashboardPage = new MultifrontDashboardPage(page);
    multifrontLoginPage = new MultifrontLoginPage(page);
    await multifrontLoginPage.performLogin(
      page,
      url.multifront,
      auth.emailPOZLimited,
      process.env.PASSWORD ?? "Password"
    );
    await multifrontDashboardPage.closePopUpIfVisibleHandler(page);
    await waitNotLessThan(page, 2000);
  });

  test("[noChargeConsultationPOZ-Limited] GIVEN patient with POZ-Limited, WHEN book free consultation, THEN should see medical survey", async ({
    page,
  }) => {
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await multifrontDashboardPage.visitReasonHeading
      .or(multifrontDashboardPage.chooseSpecializationHeading)
      .waitFor({ state: "visible" });
    await multifrontDashboardPage.checkVisitReason(page);
    await waitNotLessThan(page, 500);
    await multifrontDashboardPage.bookForFreeButton.first().click();
    await waitNotLessThan(page, 50);

    // different expects depending on survey configuration (commented)
    await expect(
      multifrontDashboardPage.goToBookedVisitButton
        .or(multifrontDashboardPage.surveyButton)
        .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
    ).toBeVisible({
      timeout: 30000,
    });
  });

  test("[stationaryConsultationPOZ] GIVEN patient with POZ-Limited, WHEN book stationary POZ consultation, THEN should see medical survey", async ({
    page,
  }) => {
    await multifrontDashboardPage.bookStationaryVisitPOZDashboard(page);
    await expect(page.getByText("Warszawa")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Dziś").or(page.getByText("Jutro"))).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Lekarz Ogólny")).toBeVisible();
    await multifrontDashboardPage.bookForButtonMobile.first().click();
    await waitNotLessThan(page, 50);

    // Locators visibility depends on new survey checkbox on or off
    const locator1 = multifrontDashboardPage.surveyBeforeConsultationHeading;
    const locator2 = multifrontDashboardPage.goToBookedVisitButton;

    // assertion
    await expect(locator1.or(locator2)).toBeVisible({ timeout: 30000 });
    await page.close();
  });
});
