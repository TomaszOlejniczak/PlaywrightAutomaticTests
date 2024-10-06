import { Page } from "playwright/test";

export class MultifrontUserProfilePage {
  constructor(private page: Page) {}

  // Patients dashboard locators
  addNewVoucherButton = this.page.getByRole("button", { name: /.*Add new voucher.*/ });
  confirmButton = this.page.getByRole("button", { name: "Confirm" });
  voucherCodeInput = this.page.getByPlaceholder("Voucher code");
  patientPersonalDataEditButton = this.page
    .locator("div")
    .filter({ hasText: /^Personal dataEdit$/ })
    .getByRole("button")
    .or(
      this.page
        .locator("div")
        .filter({ hasText: /^Personal data of a minorEdit$/ })
        .getByRole("button")
    );
  patientAddressDataEditButton = this.page
    .locator("div")
    .filter({ hasText: /^Patient address dataEdit$/ })
    .getByRole("button", { name: "Edit" });

  parentAddressDataEditButton = this.page
    .locator("div")
    .filter({ hasText: /^Guardian address dataEdit$/ })
    .getByRole("button", { name: "Edit" });
  saveButton = this.page.getByRole("button", { name: "Save", exact: true });

  streetInput = this.page.locator("#street");
  houseNumberInput = this.page.locator("#houseNumber");
  postalCodeInput = this.page.locator("#postalCode");
  cityInput = this.page.locator("#city");
  timezoneSelect = this.page.getByPlaceholder("Default timezone");

  // Change password
  changePasswordButton = this.page.getByRole("button", { name: "Change" });
  actualPasswordInput = this.page.getByPlaceholder("Current password");
  newPasswordInput = this.page.getByPlaceholder("New password", { exact: true });
  repeatNewPasswordInput = this.page.getByPlaceholder("Repeat new password");
}