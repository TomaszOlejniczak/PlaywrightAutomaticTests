import { test, expect } from "@playwright/test";
import * as auth from "../data/login.json";
import * as url from "../data/url.json";
import { MultifrontLoginPage } from "../../pages/multifrontLogin.page";
import {
  failTestIfResponseStatus5XX,
  performMobilePayment,
  readJsonFile,
  returnQuoteFromString,
  waitNotLessThan,
} from "../functions/stagingFunctions";
import { MultifrontDashboardPage } from "../../pages/multifrontDashboard.page";

test.setTimeout(110000);

test.describe("mobile multifront services tests", () => {
  let multifrontLoginPage: MultifrontLoginPage;
  let multifrontDashboardPage: MultifrontDashboardPage;

  test.beforeEach(async ({ page }) => {
    await failTestIfResponseStatus5XX(page);
    // POM object
    multifrontLoginPage = new MultifrontLoginPage(page);
    multifrontDashboardPage = new MultifrontDashboardPage(page);
    await multifrontLoginPage.performMobileLogin(
      page,
      url.multifront,
      auth.emailCons,
      process.env.PASSWORD ?? "Password"
    );
    await multifrontDashboardPage.closePopUpIfVisibleHandler(page);
    await expect(multifrontDashboardPage.sideMenu.bookVisitButton).toBeVisible();
    await waitNotLessThan(page, 5000);
  });

  test(
    "[mobile][remoteConsAccountFirstSlot] WHEN patient book visit for first slot, AND make payment, THEN sholud see 'go to consultation button' or medical survey",
    {
      tag: ["@chromeMobile", "@safariMobile"],
    },
    async ({ page }) => {
      await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.sideMenu.bookRemoteVisitButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.bookForButtonMobile.first().tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.payForButton.first().tap();
      await performMobilePayment(page);
      await expect(page).toHaveURL(/.*staging-dashboard.tmdi.*/, {
        timeout: 30000,
      });

      await waitNotLessThan(page, 500);
      await expect(
        multifrontDashboardPage.goToConsultationButton
          .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
          .or(multifrontDashboardPage.surveyButton)
      ).toBeVisible({ timeout: 30000 });
      await page.close();
    }
  );

  test(
    "[mobile][remoteConsNextDay] WHEN patient book visit for next day, AND make payment, THEN sholud be redirected to consultation",
    {
      tag: ["@chromeMobile", "@safariMobile"],
    },
    async ({ page }) => {
      await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.sideMenu.bookRemoteVisitButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.tomorrowThermRadiobutton.tap();
      await waitNotLessThan(page, 50);
      await multifrontDashboardPage.chatChannelRadiobutton.tap();
      await waitNotLessThan(page, 50);
      await multifrontDashboardPage.bookForButtonMobile.first().tap();
      await waitNotLessThan(page, 50);
      await expect(page.getByText("Przez czat")).toBeVisible();
      await multifrontDashboardPage.payForButton.first().tap();
      await performMobilePayment(page);
      await expect(page).toHaveURL(/.*staging-dashboard.tmdi.*/, {
        timeout: 30000,
      });

      await waitNotLessThan(page, 50);
      await expect(
        multifrontDashboardPage.goToConsultationButton
          .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
          .or(multifrontDashboardPage.surveyButton)
      ).toBeVisible({ timeout: 30000 });
      await page.close();
    }
  );

  test(
    "[mobile][remoteConsSpecialist] WHEN patient book visit to specialist AND perform payment THEN sholud be redirected to consultation",
    {
      tag: ["@chromeMobile", "@safariMobile"],
    },
    async ({ page }) => {
      await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.sideMenu.bookRemoteVisitButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.specializationSelectMobile.tap();
      await page.getByText(/.*Dermatolog*/).tap();
      await multifrontDashboardPage.videoChannelRadiobutton.tap();
      await waitNotLessThan(page, 50);
      await multifrontDashboardPage.bookForButtonMobile.first().tap();
      await waitNotLessThan(page, 50);
      await expect(page.getByText("Przez wideo")).toBeVisible();
      await multifrontDashboardPage.payForButton.first().tap();
      // general medical survey
      await multifrontDashboardPage.waitForPaymentOrSurvey(page);
      await waitNotLessThan(page, 50);
      await performMobilePayment(page);
      await expect(page).toHaveURL(/.*staging-dashboard.tmdi.*/, {
        timeout: 30000,
      });

      await waitNotLessThan(page, 50);
      await expect(
        multifrontDashboardPage.goToConsultationButton
          .or(multifrontDashboardPage.surveyBeforeConsultationHeading)
          .or(multifrontDashboardPage.surveyButton)
      ).toBeVisible({ timeout: 30000 });
      await page.close();
    }
  );

  test(
    "[mobile][noChargeConsultationVoucher] WHEN add voucher and book visit THEN 0.00 price should be visible",
    {
      tag: ["@chromeMobile", "@safariMobile"],
    },
    async ({ page }) => {
      await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.sideMenu.bookRemoteVisitButton.tap();
      await waitNotLessThan(page, 3000);
      await page.locator("div.select-v2__mobile-content").tap();
      await page.getByText("Testy Automatyczne").tap();
      await multifrontDashboardPage.bookForButtonMobile.first().tap();
      
      const codes = await readJsonFile("./tests/data/voucherCodes.json");
      await multifrontDashboardPage.addVoucherButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.voucherConsbookInput.fill(codes.remote100Mobile);
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.useVoucherButton.tap();
      // await expect(page.getByText("Dodano voucher")).toBeVisible({ timeout: 15000 });
      await expect(multifrontDashboardPage.payForButton).toBeHidden({ timeout: 15000 });
      await expect(multifrontDashboardPage.aproveButton).toBeVisible();
      await multifrontDashboardPage.aproveButton.tap();
      await expect(multifrontDashboardPage.visitBookedHeading).toBeVisible({ timeout: 15000 });
      await page.close();
    }
  );

  test(
    "[mobile][orderExam] WHEN book examination THEN price should be correct sum of all exams in cart",
    {
      tag: ["@chromeMobile", "@safariMobile"],
    },
    async ({ page }) => {
      const examName1 = "Morfologia krwi (C55)( Krew żylna, pełna (EDTA) )";
      const examName2 = "Odczyn Biernackiego";
      const relativeFilePath = "./uploadItems/testFilePDF.pdf";

      // Examination with code price check
      await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.sideMenu.bookMedicalExamButton.tap();
      await waitNotLessThan(page, 50);
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

      // assertion
      expect.soft(priceSum).toBe(examSum);
      await multifrontDashboardPage.orderExamnationButton.tap();
      await expect(page).toHaveURL(/.*merch-prod.snd.payu.com/, { timeout: 30000 });
      await page.close();
    }
  );

  test(
    "[mobile][ExaminationPriceSummaryWithVoucherPatientCheck] GIVEN 50% examination voucher created, WHEN book examination with voucher code, THEN price should be 50% AND user shoul be redirected to payment",
    {
      tag: ["@chromeMobile", "@safariMobile"],
    },
    async ({ page }) => {
      const examName1 = "Morfologia krwi (C55)( Krew żylna, pełna (EDTA) )";
      const examName2 = "Odczyn Biernackiego";
      const relativeFilePath = "./uploadItems/testFilePDF.pdf";

      // Examination with code price check
      await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.sideMenu.bookMedicalExamButton.tap();
      await waitNotLessThan(page, 50);
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

      // assertion
      expect.soft(priceSum).toBe(examSum);

      // base price save to const
      const priceText = await page.getByText("Cena:").innerText();
      const basePrice = await returnQuoteFromString(priceText);
      await multifrontDashboardPage.voucherCodeInput.tap();
      const codes = await readJsonFile("./tests/data/voucherCodes.json");
      await multifrontDashboardPage.voucherCodeInput.fill(String(codes.exam50Mobile));

      await waitNotLessThan(page, 6000);
      const priceText2 = await page.getByText("Cena:").innerText();
      const finalPrice = await returnQuoteFromString(priceText2);

      // assertion
      expect.soft(basePrice).toBeCloseTo(Number(finalPrice) * 2, 1);
      // await multifrontDashboardPage.orderExamnationButton.tap();
      // await waitNotLessThan(page, 50);
      // await expect(page).toHaveURL(/.*merch-prod.snd.payu.com/, { timeout: 30000 });
      // await page.close();
    }
  );

  test(
    "[mobile][SickLeaveForeignEmployee] WHEN book sick-leve visit as a foreign employee, Then should see medical survey",
    {
      tag: ["@chromeMobile", "@safariMobile"],
    },
    async ({ page }) => {
      await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.sideMenu.bookSickLeaveButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.emplymentFormSelect.tap();
      await waitNotLessThan(page, 50);
      await multifrontDashboardPage.foreignEmployeeOptionMobile.tap();
      await waitNotLessThan(page, 50);
      await multifrontDashboardPage.bookForButton.first().tap();
      await multifrontDashboardPage.waitForTelemediGo(page);
      if (await multifrontDashboardPage.telemediGoCheckbox.isVisible()) {
        await multifrontDashboardPage.telemediGoCheckbox.tap();
      }
      await waitNotLessThan(page, 50);
      await multifrontDashboardPage.bookForButton.first().tap();
      await performMobilePayment(page);
      await waitNotLessThan(page, 500);
      await expect(multifrontDashboardPage.surveyButton.or(multifrontDashboardPage.sickLeaveSurveyHeading)).toBeVisible(
        { timeout: 30000 }
      );
      await page.close();
    }
  );

  test(
    "[mobile][SickLeaveUniformedEmployee] WHEN book sick-leve visit as a uniformed employee, Then should see medical survey",
    {
      tag: ["@chromeMobile", "@safariMobile"],
    },
    async ({ page }) => {
      await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.sideMenu.bookSickLeaveButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.emplymentFormSelect.tap();
      await waitNotLessThan(page, 50);
      await multifrontDashboardPage.uniformedEmployeeOptionMobile.tap();
      await waitNotLessThan(page, 50);
      await multifrontDashboardPage.bookForButton.first().tap();
      await multifrontDashboardPage.waitForTelemediGo(page);
      if (await multifrontDashboardPage.telemediGoCheckbox.isVisible()) {
        await multifrontDashboardPage.telemediGoCheckbox.tap();
      }
      await waitNotLessThan(page, 50);
      await multifrontDashboardPage.bookForButton.first().tap();
      await performMobilePayment(page);
      await waitNotLessThan(page, 50);
      await expect(multifrontDashboardPage.surveyButton.or(multifrontDashboardPage.sickLeaveSurveyHeading)).toBeVisible(
        { timeout: 30000 }
      );
      await page.close();
    }
  );

  test(
    "[mobile][SickLeaveStudentEmployee] WHEN book sick-leve visit as a student, Then should see medical survey",
    {
      tag: ["@chromeMobile", "@safariMobile"],
    },
    async ({ page }) => {
      await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.sideMenu.bookSickLeaveButton.tap();
      await waitNotLessThan(page, 500);
      await multifrontDashboardPage.emplymentFormSelect.tap();
      await waitNotLessThan(page, 50);
      await multifrontDashboardPage.studentOptionMobile.tap();
      await waitNotLessThan(page, 50);
      await multifrontDashboardPage.bookForButton.first().tap();
      await multifrontDashboardPage.waitForTelemediGo(page);
      if (await multifrontDashboardPage.telemediGoCheckbox.isVisible()) {
        await multifrontDashboardPage.telemediGoCheckbox.tap();
      }
      await waitNotLessThan(page, 50);
      await multifrontDashboardPage.bookForButton.first().tap();
      await performMobilePayment(page);
      await waitNotLessThan(page, 500);
      await expect(multifrontDashboardPage.surveyButton.or(multifrontDashboardPage.sickLeaveSurveyHeading)).toBeVisible(
        { timeout: 30000 }
      );
      await page.close();
    }
  );
});

test(
  "[mobile][ServicesCheckForPatientWithoutData] WHEN patient without data try to book any service THEN sholud see fill data prompt AND booking should be blocked",
  {
    tag: ["@chromeMobile", "@safariMobile"],
  },
  async ({ page }) => {
    await failTestIfResponseStatus5XX(page);
    // POM object
    const multifrontLoginPage = new MultifrontLoginPage(page);
    const multifrontDashboardPage = new MultifrontDashboardPage(page);
    await multifrontLoginPage.performMobileLogin(
      page,
      url.multifront,
      auth.emailWithoutData,
      process.env.PASSWORD ?? "Password"
    );

    await waitNotLessThan(page, 1000);
    // remote visit assertion
    await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
    await multifrontDashboardPage.sideMenu.bookRemoteVisitButton.tap();
    await expect.soft(multifrontDashboardPage.weNeedYourDataHeading).toBeVisible();
    // book exam assertion
    await multifrontDashboardPage.sideMenu.consultationsButton.tap();
    await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
    await multifrontDashboardPage.sideMenu.bookMedicalExamButton.tap();
    await expect.soft(multifrontDashboardPage.weNeedYourDataHeading).toBeVisible();
    // prescription visit assertion
    await multifrontDashboardPage.sideMenu.consultationsButton.tap();
    await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
    await multifrontDashboardPage.sideMenu.bookPrescriptionButton.tap();
    await expect.soft(multifrontDashboardPage.weNeedYourDataHeading).toBeVisible();
    await multifrontDashboardPage.sideMenu.consultationsButton.tap();
    // stationary POZ visit assertion
    await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
    await multifrontDashboardPage.sideMenu.bookStationaryPozVisit.tap();
    await expect.soft(multifrontDashboardPage.weNeedYourDataHeading).toBeVisible();
    // sick leave visit assertion
    await multifrontDashboardPage.sideMenu.consultationsButton.tap();
    await multifrontDashboardPage.sideMenu.bookVisitButton.tap();
    await multifrontDashboardPage.sideMenu.bookSickLeaveButton.tap();
    await expect(multifrontDashboardPage.weNeedYourDataHeading).toBeVisible({ timeout: 20000 });
    await page.close();
  }
);
