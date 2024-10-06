import { test, expect } from "@playwright/test";
import { failTestIfResponseStatus5XX, waitNotLessThan } from "../functions/stagingFunctions";
import * as auth from "../data/login.json";
import * as url from "../data/url.json";
import { MultifrontLoginPage } from "../../pages/multifrontLogin.page";
import { MultifrontDashboardPage } from "../../pages/multifrontDashboard.page";

test.describe.configure({ mode: "parallel" });

test.describe("Slots by age test set", () => {
  test.setTimeout(90000);
  let multifrontDashboardPage: MultifrontDashboardPage;
  let multifrontLoginPage: MultifrontLoginPage;

  test.beforeEach(async ({ page }) => {
    await failTestIfResponseStatus5XX(page);
    multifrontDashboardPage = new MultifrontDashboardPage(page);
    multifrontLoginPage = new MultifrontLoginPage(page);
    await multifrontDashboardPage.closePopUpIfVisibleHandler(page);
  });

  const doctorName = "NieUsuwać AutomatyWiek";

  test("[filteringDoctorsByPatietntsAgeOnDashboard] WHEN patient (age 0) try to book remote visit THEN sholud see slots only in specific specialization", async ({
    page,
  }) => {
    const negativeSpecializations = ["AutomatySlotyDzieci1-17", "AutomatySloty0-100"];
    const positiveSpecializations = ["AutomatySlotyDzieci0-1"];

    await multifrontLoginPage.performLogin(page, url.multifront, auth.patientAge0, process.env.PASSWORD ?? "Password");
    await multifrontDashboardPage.acceptCookies.click();
    await waitNotLessThan(page, 3000);
    // positive path
    for (const specialization of positiveSpecializations) {
      await multifrontDashboardPage.bookRemoteVisitDashboard(page);
      await page.getByText("Pediatra").waitFor({ state: "visible" });
      await waitNotLessThan(page, 1000);
      await multifrontDashboardPage.specializationSelect.click();
      await page.getByText(specialization).click();
      await expect(multifrontDashboardPage.bookForButton.first()).toBeVisible({ timeout: 10000 });
      await multifrontDashboardPage.bookForButton.first().click();
      await expect(page.getByText(doctorName)).toBeVisible();
    }
    // negative path
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await page.getByText("Pediatra").waitFor({ state: "visible" });
    await waitNotLessThan(page, 2000);
    for (const specialization of negativeSpecializations) {
      await waitNotLessThan(page, 1000);
      await multifrontDashboardPage.specializationSelect.click();
      await page.getByText(specialization).click();
      await waitNotLessThan(page, 1000);
      await expect(multifrontDashboardPage.bookForButton.first()).toBeHidden();
      await expect(multifrontDashboardPage.noThermsMessage).toBeVisible();
    }
    await page.close();
  });

  test("[filteringDoctorsByPatietntsAgeOnDashboard] WHEN patient (age 10) try to book remote visit THEN sholud see slots only in specific specialization", async ({
    page,
  }) => {
    const hiddenSpecializations = ["AutomatySlotyDzieci12-17", "AutomatySlotyDzieci0-1"]; // (should not see specializations)
    const positiveSpecializations = ["AutomatySlotyDzieci1-17", "AutomatySlotyDzieci2-17"];
    const visibleSpecializations = ["AutomatySlotyDzieci1-17", "AutomatySlotyDzieci2-17", "AutomatySloty0-100"];
    const noSlotsSpecialization = ["AutomatySloty0-100"];

    await multifrontLoginPage.performLogin(page, url.multifront, auth.patientAge10, process.env.PASSWORD ?? "Password");
    await multifrontDashboardPage.acceptCookies.click();
    await waitNotLessThan(page, 3000);

    // negative path (should not see specializations)
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await multifrontDashboardPage.specializationSelect.click();
    for (const specialization of hiddenSpecializations) {
      await expect(page.getByText(specialization)).toBeHidden();
    }

    //visibility check (should see specializations)
    for (const specialization of visibleSpecializations) {
      await expect(page.getByText(specialization)).toBeVisible();
    }

    //no slots in specialization
    for (const specialization of noSlotsSpecialization) {
      await multifrontDashboardPage.bookRemoteVisitDashboard(page);
      await multifrontDashboardPage.bookForButton
        .first()
        .or(multifrontDashboardPage.noThermsMessage)
        .waitFor({ state: "visible" });
      await multifrontDashboardPage.specializationSelect.click();
      await page.getByText(specialization).click();
      await waitNotLessThan(page, 3000);
      await expect(multifrontDashboardPage.bookForButton.first()).toBeHidden({ timeout: 10000 });
      await expect(multifrontDashboardPage.noThermsMessage).toBeVisible();
    }

    // positive path (should find slots in specializations)
    for (const specialization of positiveSpecializations) {
      await multifrontDashboardPage.bookRemoteVisitDashboard(page);
      await multifrontDashboardPage.specializationSelect.click();
      await page.getByText(specialization).click();
      await waitNotLessThan(page, 2000);
      await expect(multifrontDashboardPage.bookForButton.first()).toBeVisible({ timeout: 8000 });
      await waitNotLessThan(page, 2000);
      await multifrontDashboardPage.bookForButton.first().click();
      await expect(page.getByText(doctorName)).toBeVisible();
    }
    await page.close();
  });

  test("[filteringDoctorsByPatietntsAgeOnDashboard] WHEN patient (age > 18) try to book remote visit THEN sholud see slots only in specific specialization", async ({
    page,
  }) => {
    const hiddenSpecializations = ["AutomatySlotyDzieci12-17", "AutomatySlotyDzieci0-1"];
    const visibleSpecializations = ["AutomatySloty0-100", "AutomatySloty18-100"];
    const noSlotsSpecialization = ["AutomatySloty0-100"];
    const positiveSpecializations = ["AutomatySloty18-100"];

    await multifrontLoginPage.performLogin(page, url.multifront, auth.patientAge18, process.env.PASSWORD ?? "Password");
    await multifrontDashboardPage.acceptCookies.click();
    await waitNotLessThan(page, 3000);

    // negative path (should not see specializations)
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await multifrontDashboardPage.specializationSelect.click();
    for (const specialization of hiddenSpecializations) {
      await expect(page.getByText(specialization)).toBeHidden();
    }

    //visibility check (should see specializations)
    for (const specialization of visibleSpecializations) {
      await expect(page.getByText(specialization)).toBeVisible();
    }

    //no slots in specialization
    for (const specialization of noSlotsSpecialization) {
      await multifrontDashboardPage.bookRemoteVisitDashboard(page);
      await multifrontDashboardPage.bookForButton
        .first()
        .or(multifrontDashboardPage.noThermsMessage)
        .waitFor({ state: "visible" });
      await multifrontDashboardPage.specializationSelect.click();
      await page.getByText(specialization).click();
      await waitNotLessThan(page, 3000);
      await expect(multifrontDashboardPage.bookForButton.first()).toBeHidden();
      await expect(multifrontDashboardPage.noThermsMessage).toBeVisible();
    }

    // positive path (should find slots in specializations)
    for (const specialization of positiveSpecializations) {
      await multifrontDashboardPage.bookRemoteVisitDashboard(page);
      await multifrontDashboardPage.specializationSelect.click();
      await page.getByText(specialization).click();
      await waitNotLessThan(page, 2000);
      await expect(multifrontDashboardPage.bookForButton.first()).toBeVisible({ timeout: 8000 });
      await multifrontDashboardPage.bookForButton.first().click();
      // await expect(page.getByText(doctorName)).toBeVisible();
    }
    await page.close();
  });
});
