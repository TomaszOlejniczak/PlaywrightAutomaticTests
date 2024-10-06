import { test, expect } from "@playwright/test";
import {
  failTestIfResponseStatus5XX,
  performPayment,
  waitNotLessThan,
} from "../functions/stagingFunctions";
import * as auth from "../data/login.json";
import * as url from "../data/url.json";
import { MultifrontLoginPage } from "../../pages/multifrontLogin.page";
import { MultifrontDashboardPage } from "../../pages/multifrontDashboard.page";

test.setTimeout(90000);

test.describe("timezoneUSA", () => {
  const timezone = "America/New_York";
  test.use({ locale: "en-US", timezoneId: timezone });

  test("[TimeZoneChecking_USA] WHEN user set timezone in device settings, THEN default timezone change in user's profile", async ({
    page,
  }) => {
    const multifrontDashboardPage = new MultifrontDashboardPage(page);
    const multifrontLoginPage = new MultifrontLoginPage(page);

    await failTestIfResponseStatus5XX(page);
    await multifrontLoginPage.performLogin(
      page,
      url.multifront,
      auth.emailTimezonePatient,
      process.env.PASSWORD ?? "Password"
    );
    await multifrontDashboardPage.closePopUpIfVisibleHandler(page);
    await waitNotLessThan(page, 2000);
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await multifrontDashboardPage.bookForButton.first().click();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.payForButton.first().click();
    await multifrontDashboardPage.waitForPaymentOrSurvey(page);
    await multifrontDashboardPage.generalMedicalSurvey.fillGeneralMedicalSurvey(page);
    await performPayment(page);
    await expect.soft(page).toHaveURL(/.*staging-dashboard.tmdi.*/, {
      timeout: 30000,
    });
    await waitNotLessThan(page, 50);
    await expect
      .soft(
        multifrontDashboardPage.goToConsultationButton
          .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
          .or(multifrontDashboardPage.surveyButton)
      )
      .toBeVisible({ timeout: 20000 });
    await multifrontDashboardPage.checkAndchangeLanguageToPL(page, url.base + "pl");
    await multifrontDashboardPage.userProfileOpen(page);
    await multifrontDashboardPage.userProfile.patientPersonalDataEditButton.click();

    // assertion
    await expect(multifrontDashboardPage.userProfile.timezoneSelect).toHaveValue(timezone);
    await page.close();
  });
});

test.describe("timezoneUTC", () => {
  const timezone = "UTC";
  test.use({ locale: "pl-PL", timezoneId: timezone });

  test("[TimeZoneChecking_UTC] WHEN user set timezone in device settings, THEN default timezone change in user's profile", async ({
    page,
  }) => {
    const multifrontDashboardPage = new MultifrontDashboardPage(page);
    const multifrontLoginPage = new MultifrontLoginPage(page);

    await failTestIfResponseStatus5XX(page);
    await multifrontLoginPage.performLogin(
      page,
      url.multifront,
      auth.emailTimezonePatient,
      process.env.PASSWORD ?? "Password"
    );
    await multifrontDashboardPage.closePopUpIfVisibleHandler(page);
    await waitNotLessThan(page, 2000);
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await multifrontDashboardPage.bookForButton.first().click();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.payForButton.first().click();
    await multifrontDashboardPage.waitForPaymentOrSurvey(page);
    await multifrontDashboardPage.generalMedicalSurvey.fillGeneralMedicalSurvey(page);
    await performPayment(page);
    await expect.soft(page).toHaveURL(/.*staging-dashboard.tmdi.*/, {
      timeout: 30000,
    });
    await waitNotLessThan(page, 50);
    await expect
      .soft(
        multifrontDashboardPage.goToConsultationButton
          .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
          .or(multifrontDashboardPage.surveyButton)
      )
      .toBeVisible({ timeout: 20000 });
    await multifrontDashboardPage.checkAndchangeLanguageToPL(page, url.base + "pl");
    await multifrontDashboardPage.userProfileOpen(page);
    await multifrontDashboardPage.userProfile.patientPersonalDataEditButton.click();

    // assertion
    await expect(multifrontDashboardPage.userProfile.timezoneSelect).toHaveValue(timezone);
  });
});

test.describe("timezonePL", () => {
  const timezone = "Europe/Warsaw";
  test.use({ locale: "pl-PL", timezoneId: timezone });
  test("[TimeZoneChecking_PL] WHEN user set timezone in device settings, THEN default timezone change in user's profile", async ({
    page,
  }) => {
    const multifrontDashboardPage = new MultifrontDashboardPage(page);
    const multifrontLoginPage = new MultifrontLoginPage(page);

    await failTestIfResponseStatus5XX(page);
    await multifrontLoginPage.performLogin(
      page,
      url.multifront,
      auth.emailTimezonePatient,
      process.env.PASSWORD ?? "Password"
    );
    await multifrontDashboardPage.closePopUpIfVisibleHandler(page);
    await waitNotLessThan(page, 2000);
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await multifrontDashboardPage.bookForButton.first().click();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.payForButton.first().click();
    await multifrontDashboardPage.waitForPaymentOrSurvey(page);
    await multifrontDashboardPage.generalMedicalSurvey.fillGeneralMedicalSurvey(page);
    await performPayment(page);
    await expect.soft(page).toHaveURL(/.*staging-dashboard.tmdi.*/, {
      timeout: 30000,
    });
    await waitNotLessThan(page, 50);
    await expect
      .soft(
        multifrontDashboardPage.goToConsultationButton
          .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
          .or(multifrontDashboardPage.surveyButton)
      )
      .toBeVisible({ timeout: 20000 });
    await multifrontDashboardPage.checkAndchangeLanguageToPL(page, url.base + "pl");
    await multifrontDashboardPage.userProfileOpen(page);
    await multifrontDashboardPage.userProfile.patientPersonalDataEditButton.click();

    // assertion
    await expect(multifrontDashboardPage.userProfile.timezoneSelect).toHaveValue(timezone);
    await page.close();
  });
});