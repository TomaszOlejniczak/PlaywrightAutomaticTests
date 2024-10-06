import { test, expect } from "@playwright/test";
import * as auth from "../data/login.json";
import * as url from "../data/url.json";
import * as data from "../data/patientData.json";
import { MultifrontLoginPage } from "../../pages/multifrontLogin.page";
import { failTestIfResponseStatus5XX, waitNotLessThan } from "../functions/stagingFunctions";
import { MultifrontDashboardPage } from "../../pages/multifrontDashboard.page";


test.describe.configure({ mode: "parallel" });

test.describe("password login tests", () => {
  let multifrontLoginPage: MultifrontLoginPage;

  test.beforeEach(async ({ page }) => {
    await failTestIfResponseStatus5XX(page);
    // POM object
    multifrontLoginPage = new MultifrontLoginPage(page);
    await page.goto(url.multifront);
    await waitNotLessThan(page, 50);
  });

  test(
    "[login] WHEN try to login without credentials THEN should see validation AND can't login",
    {
      tag: ["@chromeMobile", "@safariMobile"],
    },
    async ({ page }) => {
      await multifrontLoginPage.emailInput.fill("");
      await multifrontLoginPage.passwordInput.fill("");
      await multifrontLoginPage.loginButton.tap();

      // expect
      await expect(page.getByText("Pole jest wymagane").first()).toBeVisible();
    }
  );

  test(
    "[login] WHEN try to login with invalid credentials THEN should see 'bad credentials' AND can't login",
    {
      tag: ["@chromeMobile", "@safariMobile"],
    },
    async ({ page }) => {
      await multifrontLoginPage.emailInput.fill("randomemail@randomdomain.com");
      await multifrontLoginPage.passwordInput.fill("RandomPassword");
      await multifrontLoginPage.loginButton.tap();

      // expect
      await expect(page.getByText("Nieprawidłowe dane logowania").first()).toBeVisible();
    }
  );

  test(
    "[login] WHEN try to login with invalid credentials 5 times THEN should see informations abouc blocade AND can't login",
    {
      tag: ["@chromeMobile"],
    },
    async ({ page }) => {
      let n = 4;
      while (n > 0) {
        await multifrontLoginPage.emailInput.fill(auth.emailLoginInvalidCredentials);
        await multifrontLoginPage.passwordInput.fill("RandomPassword");
        await multifrontLoginPage.loginButton.tap();
        await waitNotLessThan(page, 200);
        // expect
        await expect(page.getByText("Nieprawidłowe dane logowania").first()).toBeVisible();
        n = n - 1;
      }
      await multifrontLoginPage.emailInput.fill(auth.emailLoginInvalidCredentials);
      await multifrontLoginPage.passwordInput.fill("RandomPassword");
      await multifrontLoginPage.loginButton.tap();
      await waitNotLessThan(page, 200);
      // expect
      await expect(
        page.getByText("Wystąpiło więcej niż 5 nieudanych prób logowania dla tego konta").first()
      ).toBeVisible();
    }
  );

  test(
    "[login] WHEN loging with valid credentials, THEN should login correct AND see patients full name",
    {
      tag: ["@chromeMobile", "@safariMobile"],
    },
    async ({ page }) => {
      const multifrontDashboardPage = new MultifrontDashboardPage(page);
      await multifrontLoginPage.performMobileLogin(
        page,
        url.multifront,
        auth.email,
        process.env.PASSWORD ?? "Password"
      );
      await expect(multifrontDashboardPage.sideMenu.bookVisitButton).toBeVisible();
      await multifrontDashboardPage.userProfileOpen(page);

      // expect
      await expect(page.getByText(data.multifrontPatient.loginPatient.patient.surname).first()).toBeVisible({
        timeout: 10000,
      });
    }
  );

  test.afterEach(async ({ page }) => {
    await page.close();
  });
});
