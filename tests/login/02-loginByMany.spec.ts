import { test, expect } from "@playwright/test";
import { failTestIfResponseStatus5XX, waitNotLessThan } from "../functions/stagingFunctions";
import * as auth from "../data/login.json";
import * as url from "../data/url.json";
import { MultifrontDashboardPage } from "../../pages/multifrontDashboard.page";
import { MultifrontLoginPage } from "../../pages/multifrontLogin.page";

test("[multifrontLoginByMany] GIVEN many accounts with the same phone number, WHEN login using phone number, AND choose account A, THEN should login correct, AND see valid email in user's profile", async ({
  page,
}) => {
  await failTestIfResponseStatus5XX(page);

  // POM objects
  const multifrontDashboardPage = new MultifrontDashboardPage(page);
  const multifrontLogin = new MultifrontLoginPage(page);

  // Login by many flow
  await page.goto(url.multifront);
  await multifrontDashboardPage.waitForAnimationHideHandler(page);
  await multifrontLogin.emailInput.fill(auth.id);
  await waitNotLessThan(page, 50);
  await multifrontLogin.passwordInput.fill(process.env.PASSWORD ?? "Password");
  await waitNotLessThan(page, 50);
  await multifrontLogin.passwordInput.press("Enter");
  await waitNotLessThan(page, 50);
  await page
    .getByRole("row", {
      name: "L******* N*******	*********19	2023-09-11 07:58",
    })
    .getByRole("button", { name: "Wybierz" })
    .click();
  await page.waitForURL(url.base + "pl");
  await waitNotLessThan(page, 50);
  await multifrontDashboardPage.userProfileOpen(page);
  await page
    .locator("div")
    .filter({ hasText: /^Dane kontaktoweEdytuj$/ })
    .getByRole("button", { name: "Edytuj" })
    .click();
  await waitNotLessThan(page, 50);
  const userEmailInput = page.getByPlaceholder("E-mail");

  // Expect
  await expect(userEmailInput).toHaveValue(auth.emailLoginByMany);
  await page.close();
});
