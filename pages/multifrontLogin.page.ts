import { Page } from "playwright/test";
import { MultifrontDashboardPage } from "./multifrontDashboard.page";
import { waitNotLessThan } from "../tests/functions/stagingFunctions";
import * as urlfile from "../tests/data/url.json";

export class MultifrontLoginPage {
  constructor(private page: Page) {}

  // Locators
  emailInput = this.page.locator('[placeholder="E-mail, PESEL lub identyfikator"]');
  passwordInput = this.page.locator('[placeholder="Hasło"]');
  loginButton = this.page.getByRole("button", { name: "Zaloguj się", exact: true });
  receptionLoginLink = this.page.getByRole("button", { name: "https://staging.tmdi04.com/pl" });
  doctorLoginInfo = this.page.getByText("Skorzystaj z dedykowanego");
  incorectData = this.page.getByText("Nieprawidłowe dane logowania");
  closePopupButton = this.page.getByRole("button", { name: "" });
  popupCheckbox = this.page.getByLabel("Nie pokazuj więcej tego");

  // Perform login to patient's dashboard
  async performLogin(page: Page, url: string, email: string, password: string): Promise<void> {
    const multifrontDashboardPage = new MultifrontDashboardPage(page);
    await waitNotLessThan(page, 50);
    const goalURL = url;
    let actualURL = await page.url();
    await waitNotLessThan(page, 50);
    if (goalURL !== actualURL) {
      await page.goto(url);
    }
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.passwordInput.press("Enter");
    await multifrontDashboardPage.waitForAnimationHideHandler(page);
    // await page.waitForURL(urlfile.base + "pl");
    await waitNotLessThan(page, 3000);
  }

  // Perform login to patient's mobile dashboard
  async performMobileLogin(page: Page, url: string, email: string, password: string): Promise<void> {
    const multifrontDashboardPage = new MultifrontDashboardPage(page);
    await waitNotLessThan(page, 50);
    const goalURL = url;
    let actualURL = await page.url();
    await waitNotLessThan(page, 50);
    if (goalURL !== actualURL) {
      await page.goto(url);
    }
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await multifrontDashboardPage.acceptCookies.tap();
    await waitNotLessThan(page, 50);
    await this.loginButton.tap();
    await multifrontDashboardPage.waitForAnimationHideHandler(page);
    await page.waitForURL(urlfile.base + "pl");
    await waitNotLessThan(page, 1000);
  }

  async closeLoginPopUpIfVisibleHandler(page: Page): Promise<void> {
    await page.addLocatorHandler(this.popupCheckbox, async () => {
      await page.waitForTimeout(50);
      await this.closePopupButton.click();
      await page.waitForTimeout(500);
    });
  }
}
