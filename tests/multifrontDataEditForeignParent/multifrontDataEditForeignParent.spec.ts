import { test, expect } from "@playwright/test";
import {
  widgetRegistrationWithoutVisit,
  waitNotLessThan,
  failTestIfResponseStatus5XX,
} from "../functions/stagingFunctions";
import * as auth from "../data/login.json";
import * as url from "../data/url.json";
import * as data from "../data/patientData.json";
import { MultifrontLoginPage } from "../../pages/multifrontLogin.page";
import { MultifrontDashboardPage } from "../../pages/multifrontDashboard.page";

test("[dataEditCreation] WHEN new foreign patient register using regApp, THEN patient's full name should be visible in user's profile", async ({
  page,
}) => {
  await failTestIfResponseStatus5XX(page);
  await widgetRegistrationWithoutVisit(
    page,
    url.widgetRegister,
    auth.emailDataEditForeign,
    process.env.PASSWORD ?? "Password",
    auth.phone,
    data.multifrontPatient.dataEditForeignParent.patient.name,
    data.multifrontPatient.dataEditForeignParent.patient.surname,
    "",
    data.multifrontPatient.dataEditForeignParent.patient.id,
    data.multifrontPatient.dataEditForeignParent.patient.birthDate,
    ""
  );

  const multifrontDashboardPage = new MultifrontDashboardPage(page);
  await multifrontDashboardPage.userProfileOpen(page);
  // expect
  expect(page.getByText(data.multifrontPatient.dataEditForeignParent.patient.name).first()).toBeVisible();
  expect(page.getByText(data.multifrontPatient.dataEditForeignParent.patient.surname).first()).toBeVisible();
});

test("[dataCompletionForeignParent] WHEN patient complete data (parent, address) in user's profile AND save, THEN data should be visible", async ({
  page,
}) => {
  const multifrontLoginPage = new MultifrontLoginPage(page);
  await multifrontLoginPage.performLogin(
    page,
    url.multifront,
    auth.emailDataEditForeign,
    process.env.PASSWORD ?? "Password"
  );
  const multifrontDashboardPage = new MultifrontDashboardPage(page);
  await multifrontDashboardPage.userProfileOpen(page);
  await waitNotLessThan(page, 200);
  await multifrontDashboardPage.userProfile.patientPersonalDataEditButton.click();
  await waitNotLessThan(page, 50);
  await page.locator("#parentFirstName").fill(data.multifrontPatient.dataEditForeignParent.parent.name);
  await waitNotLessThan(page, 50);
  await page.locator("#parentLastName").fill(data.multifrontPatient.dataEditForeignParent.parent.surname);
  await waitNotLessThan(page, 50);
  await page.getByLabel("Mężczyzna").check();
  await page.locator("#parentNationality").click();
  await page.getByRole("option", { name: "Portugalia" }).click();
  await page.getByRole("button", { name: "PESEL" }).click();
  await page.getByRole("option", { name: "Numer paszportu" }).click();
  await page.locator("#parentIdentityNumber").fill(data.multifrontPatient.dataEditForeignParent.parent.id);
  await page.locator("#parentBirthDate").fill(data.multifrontPatient.dataEditForeignParent.parent.birthDate);
  await page.locator("#parentGender").getByLabel("Mężczyzna").check();
  await waitNotLessThan(page, 50);
  await multifrontDashboardPage.userProfile.saveButton.click();
  await waitNotLessThan(page, 50);
  await multifrontDashboardPage.userProfile.patientAddressDataEditButton.click();
  await page.getByPlaceholder("Ulica").first().fill(data.multifrontPatient.peselPatientAddress.street);
  await waitNotLessThan(page, 50);
  await page.getByPlaceholder("Nr domu").first().fill(data.multifrontPatient.peselPatientAddress.buildingNumber);
  await waitNotLessThan(page, 50);
  await page.getByPlaceholder("Nr lokalu").first().fill(data.multifrontPatient.peselPatientAddress.flatNumber);
  await waitNotLessThan(page, 50);
  await page.getByLabel("Kod pocztowy").first().fill(data.multifrontPatient.peselPatientAddress.zipCode);
  await waitNotLessThan(page, 50);
  await page.getByPlaceholder("Miejscowość").first().fill(data.multifrontPatient.peselPatientAddress.city);
  await waitNotLessThan(page, 50);
  await page.getByLabel("Adres taki sam jak adres pacjenta (powyżej)").check();
  await waitNotLessThan(page, 50);
  await multifrontDashboardPage.userProfile.saveButton.click();
  await waitNotLessThan(page, 200);
  await expect(page.getByText(data.multifrontPatient.dataEditForeignParent.parent.name).first()).toBeVisible();
  await expect(page.getByText(data.multifrontPatient.peselPatientAddress.zipCode).first()).toBeVisible();
});

test("[dataEditingParentAddress] WHEN patient edit address data in user's profile AND save, THEN new data should be visible", async ({
  page,
}) => {
  await failTestIfResponseStatus5XX(page);
  const multifrontLoginPage = new MultifrontLoginPage(page);
  const multifrontDashboardPage = new MultifrontDashboardPage(page);
  const newStreet = "Nowa";
  const newStreetNumber = "321";
  const newPostalCode = "66-400";
  const newCity = "Koninkonin";

  await multifrontLoginPage.performLogin(
    page,
    url.multifront,
    auth.emailDataEditForeign,
    process.env.PASSWORD ?? "Password"
  );
  await multifrontDashboardPage.closePopUpIfVisibleHandler(page);
  await waitNotLessThan(page, 2000);

  // Go to users profile
  await multifrontDashboardPage.userProfileOpen(page);
  await multifrontDashboardPage.userProfile.patientAddressDataEditButton.click();
  await multifrontDashboardPage.userProfile.streetInput.fill(newStreet);
  await multifrontDashboardPage.userProfile.houseNumberInput.fill(newStreetNumber);
  await multifrontDashboardPage.userProfile.postalCodeInput.fill(newPostalCode);
  await multifrontDashboardPage.userProfile.cityInput.fill(newCity);
  await multifrontDashboardPage.saveButton.click();
  await waitNotLessThan(page, 100);

  // expect
  await expect(page.getByText(newStreet).first()).toBeVisible();
  await expect(page.getByText(newStreetNumber).first()).toBeVisible();
  await expect(page.getByText(newPostalCode).first()).toBeVisible();
  await expect(page.getByText(newCity).first()).toBeVisible();
});

test.afterEach(async ({ page }) => {
  await page.close();
});
