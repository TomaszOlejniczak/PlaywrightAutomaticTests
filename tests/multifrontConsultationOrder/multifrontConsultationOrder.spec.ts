import { test, expect } from "@playwright/test";
import {
  failTestIfResponseStatus5XX,
  performPayment,
  returnQuoteFromString,
  v4PerformLogin,
  waitNotLessThan,
} from "../functions/stagingFunctions";
import * as auth from "../data/login.json";
import * as url from "../data/url.json";
import * as data from "../data/patientData.json";
import { MultifrontLoginPage } from "../../pages/multifrontLogin.page";
import { MultifrontDashboardPage } from "../../pages/multifrontDashboard.page";

test.describe("Multifront consultation order tests", () => {
  test.setTimeout(120000);
  let multifrontDashboardPage: MultifrontDashboardPage;
  let multifrontLoginPage: MultifrontLoginPage;

  test.beforeEach(async ({ page }) => {
    await failTestIfResponseStatus5XX(page);
    multifrontDashboardPage = new MultifrontDashboardPage(page);
    multifrontLoginPage = new MultifrontLoginPage(page);
    await multifrontDashboardPage.closePopUpIfVisibleHandler(page);
  });

  test("[consultationStatusesChangingChecking] WHEN patient book, make payment AND cancell visit THEN consultation status on dashboard should change", async ({
    page,
  }) => {
    await multifrontLoginPage.performLogin(page, url.multifront, auth.emailCons, process.env.PASSWORD ?? "Password");
    await waitNotLessThan(page, 4000);
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await multifrontDashboardPage.bookForButton.first().click();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.payForButton.first().click();
    // Break payment process
    await waitNotLessThan(page, 10000);
    await page.goto(url.multifront);
    // Expect visit status is "Not payed"
    await expect(page.getByText("Nieopłacona")).toBeVisible({ timeout: 10000 });
    await expect(multifrontDashboardPage.payButton.first()).toBeVisible();
    // Perform payment
    await multifrontDashboardPage.payButton.first().click();
    await performPayment(page);
    await expect(page).toHaveURL(/.*staging-dashboard.tmdi.*/, {
      timeout: 30000,
    });
    await waitNotLessThan(page, 50);
    await expect(
      multifrontDashboardPage.goToConsultationButton
        .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
        .or(multifrontDashboardPage.fillMedicalSurveyButton)
    ).toBeVisible({ timeout: 30000 });
    await page.goto(url.multifront);
    await expect(page.getByText("Nieopłacona")).toBeHidden();
    await expect(multifrontDashboardPage.payButton.first()).toBeHidden({ timeout: 30000 });
    await waitNotLessThan(page, 2000);
    if (await multifrontDashboardPage.fillSurveyButton.isVisible()) {
      await multifrontDashboardPage.fillSurveyButton.click();
      await multifrontDashboardPage.generalMedicalSurvey.fillGeneralMedicalSurvey(page);
      await page.goto(url.multifront);
    }
    await expect.soft(multifrontDashboardPage.enterConsultationButton.first()).toBeVisible();
    await multifrontDashboardPage.cancelAllVisits(page);
    await expect(multifrontDashboardPage.enterConsultationButton.first()).toBeHidden();
    // await expect(page.getByText("Anulowana", { exact: true }).first()).toBeVisible();
    await page.close();
  });

  test("[remoteConsAccountFirstSlot] WHEN patient book visit for first slot, AND make payment, THEN sholud see 'go to consultation button' or medical survey", async ({
    page,
  }) => {
    await multifrontLoginPage.performLogin(page, url.multifront, auth.emailCons, process.env.PASSWORD ?? "Password");
    await waitNotLessThan(page, 4000);
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await multifrontDashboardPage.bookForButton.first().click();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.payForButton.first().click();
    await multifrontDashboardPage.waitForPaymentOrSurvey(page);
    await multifrontDashboardPage.generalMedicalSurvey.fillGeneralMedicalSurvey(page);
    await performPayment(page);
    await expect(page).toHaveURL(/.*staging-dashboard.tmdi.*/, {
      timeout: 30000,
    });
    await waitNotLessThan(page, 50);
    await expect(
      multifrontDashboardPage.goToConsultationButton
      // .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
      // .or(multifrontDashboardPage.fillMedicalSurveyButton)
    ).toBeVisible({ timeout: 30000 });
    await page.close();
  });

  test("[bookVisitInENlanguage] WHEN patient change book visit in EN language THEN slots should be visible AND sholud see 'go to consultation button' or medical survey", async ({
    page,
  }) => {
    await multifrontLoginPage.performLogin(page, url.multifront, auth.emailCons, process.env.PASSWORD ?? "Password");
    await multifrontDashboardPage.sideMenu.bookVisitButton.waitFor({ state: "visible" });
    await waitNotLessThan(page, 1000);
    await multifrontDashboardPage.changeLanguage(page, "English");
    await expect(page).toHaveURL(/.*en*/, {
      timeout: 10000,
    });
    await multifrontDashboardPage.sideMenu.bookVisitButtonEN.click();
    await waitNotLessThan(page, 200);
    await multifrontDashboardPage.sideMenu.bookRemoteVisitButtonEN.click();
    await waitNotLessThan(page, 200);
    await multifrontDashboardPage.bookForButtonEN.first().click();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.payForButtonEN.first().click();
    await performPayment(page);
    await expect(page).toHaveURL(/.*staging-dashboard.tmdi.*/, {
      timeout: 30000,
    });
    await waitNotLessThan(page, 50);
    await expect(
      multifrontDashboardPage.goToConsultationButton
    ).toBeVisible({ timeout: 30000 });
    await page.close();
  });

  test("[remoteConsNextDay] WHEN patient book visit for next day, AND make payment, THEN sholud be redirected to consultation", async ({
    page,
  }) => {
    await failTestIfResponseStatus5XX(page);

    await multifrontLoginPage.performLogin(page, url.multifront, auth.emailCons, process.env.PASSWORD ?? "Password");
    await waitNotLessThan(page, 4000);
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.tomorrowThermRadiobutton.click();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.chatChannelRadiobutton.click();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.bookForButton.first().click();
    await waitNotLessThan(page, 50);
    await expect(page.getByText("Przez czat")).toBeVisible();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.payForButton.first().click();
    await multifrontDashboardPage.waitForPaymentOrSurvey(page);
    await multifrontDashboardPage.generalMedicalSurvey.fillGeneralMedicalSurvey(page);
    await performPayment(page);
    await expect(
      multifrontDashboardPage.goToConsultationButton
      // .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
      // .or(multifrontDashboardPage.fillMedicalSurveyButton)
    ).toBeVisible({ timeout: 30000 });
    if (await multifrontDashboardPage.fillMedicalSurveyButton.isVisible()) {
      await multifrontDashboardPage.fillMedicalSurveyButton.click();
      await multifrontDashboardPage.generalMedicalSurvey.fillGeneralMedicalSurvey(page);
    } else {
      await multifrontDashboardPage.goToConsultationButton.click();
    }
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.consultationChatbox.fill("Dzień dobry!");
    await multifrontDashboardPage.consultationChatbox.press("Enter");
    await waitNotLessThan(page, 50);

    // assertion
    await expect(page.locator("div").filter({ hasText: /^Dzień dobry!$/ })).toBeVisible();
    await expect(page.getByText("Konsultacja Online - Czat")).toBeVisible();
    await page.close();
  });

  // test covers 3 TS: voucher adding, no charge consultation and specialist consultation
  test("[remoteConsSpecialist] WHEN patient book visit to specialist AND perform payment THEN sholud be redirected to consultation", async ({
    page,
  }) => {
    //Voucher adding
    await multifrontLoginPage.performLogin(page, url.multifront, auth.emailCons, process.env.PASSWORD ?? "Password");
    await waitNotLessThan(page, 4000);

    //Consultation making
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await page.locator(".css-yk16xz-control").click(); //specialization select
    await page.getByText(/.*Dermatolog*/).click();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.videoChannelRadiobutton.click();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.bookForButton.first().click();
    await waitNotLessThan(page, 50);
    await expect(page.getByText("Przez wideo")).toBeVisible();
    await multifrontDashboardPage.payForButton.first().click();
    await multifrontDashboardPage.waitForPaymentOrSurvey(page);
    await multifrontDashboardPage.generalMedicalSurvey.fillGeneralMedicalSurvey(page);
    await performPayment(page);
    await expect(
      multifrontDashboardPage.goToConsultationButton
      // .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
      // .or(multifrontDashboardPage.fillMedicalSurveyButton)
    ).toBeVisible({ timeout: 30000 });
    if (await multifrontDashboardPage.fillMedicalSurveyButton.isVisible()) {
      await multifrontDashboardPage.fillMedicalSurveyButton.click();
      await multifrontDashboardPage.generalMedicalSurvey.fillGeneralMedicalSurvey(page);
    } else {
      await multifrontDashboardPage.goToConsultationButton.click();
    }
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.consultationChatbox.fill("Dzień dobry!");
    await multifrontDashboardPage.consultationChatbox.press("Enter");
    await waitNotLessThan(page, 50);

    // assertion
    await expect(page.locator("div").filter({ hasText: /^Dzień dobry!$/ })).toBeVisible();
    await expect(page.getByText("Konsultacja Online - Wideo")).toBeVisible();
    await page.close();
  });

  test("[remoteConsSpecialist] WHEN patient book visit to specialist second time the same day AND perform payment THEN sholud be redirected to consultation", async ({
    page,
  }) => {
    //Voucher adding
    await multifrontLoginPage.performLogin(page, url.multifront, auth.emailCons, process.env.PASSWORD ?? "Password");
    await waitNotLessThan(page, 4000);

    //Consultation making
    await multifrontDashboardPage.bookRemoteVisitDashboard(page);
    await page.locator(".css-yk16xz-control").click(); //specialization select
    await page.getByText(/.*Dermatolog*/).click();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.bookForButton.first().click();
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.payForButton.first().click();
    await multifrontDashboardPage.waitForPaymentOrSurvey(page);
    await multifrontDashboardPage.generalMedicalSurvey.fillGeneralMedicalSurvey(page);
    await performPayment(page);
    await expect(
      multifrontDashboardPage.goToConsultationButton
      // .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
      // .or(multifrontDashboardPage.fillMedicalSurveyButton)
    ).toBeVisible({ timeout: 30000 });
    if (await multifrontDashboardPage.fillMedicalSurveyButton.isVisible()) {
      await multifrontDashboardPage.fillMedicalSurveyButton.click();
      await multifrontDashboardPage.generalMedicalSurvey.fillGeneralMedicalSurvey(page);
    } else {
      await multifrontDashboardPage.goToConsultationButton.click();
    }
    await waitNotLessThan(page, 50);
    await multifrontDashboardPage.consultationChatbox.fill("Dzień dobry!");
    await multifrontDashboardPage.consultationChatbox.press("Enter");
    await waitNotLessThan(page, 50);

    // assertion
    await expect(page.locator("div").filter({ hasText: /^Dzień dobry!$/ })).toBeVisible();
    await page.close();
  });

  test("[ServicesCheckForPatientWithoutData] WHEN patient without data try to book any service THEN sholud see fill data prompt AND booking should be blocked", async ({
    page,
  }) => {
    await multifrontLoginPage.performLogin(
      page,
      url.multifront,
      auth.emailWithoutData,
      process.env.PASSWORD ?? "Password"
    );
    await waitNotLessThan(page, 1000);
    // remote visit assertion
    await multifrontDashboardPage.sideMenu.bookVisitButton.click();
    await multifrontDashboardPage.sideMenu.bookRemoteVisitButton.click();
    await expect.soft(multifrontDashboardPage.weNeedYourDataHeading).toBeVisible();
    // book exam assertion
    await multifrontDashboardPage.sideMenu.consultationsButton.click();
    await multifrontDashboardPage.sideMenu.bookVisitButton.click();
    await multifrontDashboardPage.sideMenu.bookMedicalExamButton.click();
    await expect.soft(multifrontDashboardPage.weNeedYourDataHeading).toBeVisible();
    // prescription visit assertion
    await multifrontDashboardPage.sideMenu.consultationsButton.click();
    await multifrontDashboardPage.sideMenu.bookVisitButton.click();
    await multifrontDashboardPage.sideMenu.bookPrescriptionButton.click();
    await expect.soft(multifrontDashboardPage.weNeedYourDataHeading).toBeVisible();
    await multifrontDashboardPage.sideMenu.consultationsButton.click();
    // stationary POZ visit assertion
    await multifrontDashboardPage.sideMenu.bookVisitButton.click();
    await multifrontDashboardPage.sideMenu.bookStationaryPozVisit.click();
    await expect.soft(multifrontDashboardPage.weNeedYourDataHeading).toBeVisible();
    // sick leave visit assertion
    await multifrontDashboardPage.sideMenu.consultationsButton.click();
    await multifrontDashboardPage.sideMenu.bookVisitButton.click();
    await multifrontDashboardPage.sideMenu.bookSickLeaveButton.click();
    await expect(multifrontDashboardPage.weNeedYourDataHeading).toBeVisible({ timeout: 20000 });
    await page.close();
  });

  test("[orderExam] WHEN book examination THEN price should be correct sum of all exams in cart", async ({ page }) => {
    const examName1 = "Morfologia krwi (C55)( Krew żylna, pełna (EDTA) )";
    const examName2 = "Odczyn Biernackiego";
    const relativeFilePath = "./uploadItems/testFilePDF.pdf";

    // Patient login:
    const multifrontLoginPage = new MultifrontLoginPage(page);
    await multifrontLoginPage.performLogin(page, url.multifront, auth.emailCons, process.env.PASSWORD ?? "Password");

    // Examination with code price check
    const multifrontDashboardPage = new MultifrontDashboardPage(page);
    await waitNotLessThan(page, 3000);
    await multifrontDashboardPage.sideMenu.bookVisitButton.click();
    await multifrontDashboardPage.sideMenu.bookMedicalExamButton.click();
    await multifrontDashboardPage.chooseExam(page, examName1);
    await multifrontDashboardPage.chooseExam(page, examName2);

    // prices summary

    await waitNotLessThan(page, 1000);
    const textExam1 = await page.getByRole("cell", { name: "zł" }).first().innerText();
    const priceExam1 = await returnQuoteFromString(textExam1);

    const textExam2 = await page.getByRole("cell", { name: "zł" }).nth(1).innerText();
    const priceExam2 = await returnQuoteFromString(textExam2);
    const examSum = Number(priceExam1) + Number(priceExam2);

    await waitNotLessThan(page, 1000);
    const priceSumText = await page.getByText("Cena:").innerText();
    const priceSum = await returnQuoteFromString(priceSumText);

    // // refferal  upload
    // const fileChooserPromise = page.waitForEvent("filechooser");
    // await multifrontDashboardPage.filechooserButton.click();
    // const fileChooser = await fileChooserPromise;
    // await fileChooser.setFiles([relativeFilePath]);
    // await waitNotLessThan(page, 6000);

    // assertion
    expect.soft(priceSum).toBe(examSum);
    await multifrontDashboardPage.orderExamnationButton.click();
    await waitNotLessThan(page, 50);
    await expect(page).toHaveURL(/.*merch-prod.snd.payu.com/, { timeout: 30000 });
    await page.close();
  });

  test("[allServicesRefund] WHEN filter user's payments, AND make refound, THEN 'refound' button should be hidden", async ({
    page,
  }) => {
    await v4PerformLogin(page, url.v4, auth.adminUsername, process.env.ADMIN_PASSWORD ?? "Password");
    // Refunds:
    await page.getByRole("link", { name: " Lista płatności" }).click();
    await waitNotLessThan(page, 50);
    await page.locator('input[name="pesel"]').fill(data.multifrontPatient.withPeselConsultationAdult.patient.pesel);
    await waitNotLessThan(page, 50);
    await page.getByRole("button", { name: "Szukaj" }).click();
    await waitNotLessThan(page, 1000);
    await expect(page.getByRole("link", { name: "Zwróć" }).first()).toBeVisible();
    let count = 0;
    if (await page.getByRole("link", { name: "Zwróć" }).first().isVisible()) {
      count = await page.getByRole("link", { name: "Zwróć" }).count();
      if (count > 5) {
        count = 5;
      }
    }
    while (count > 0) {
      await page.getByRole("link", { name: "Zwróć" }).first().click();
      await page.getByRole("button", { name: "Potwierdź" }).click();
      await page.getByRole("button", { name: "Potwierdź" }).waitFor({ state: "hidden" });
      count = count - 1;
      await waitNotLessThan(page, 50);
    }
    await page.getByRole("button", { name: "Szukaj" }).click();
    //expects
    // await expect(page.getByRole("link", { name: "Zwróć" }).first()).toBeHidden();
    await expect(page.locator("tr").getByText("Zwrócona").first()).toBeVisible();
    await expect(page.locator("tr").getByText("Staging Admin_all_clinic").first()).toBeVisible();
    await page.close();
  });
});
