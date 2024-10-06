import { Page } from "playwright/test";
import { waitNotLessThan } from "../tests/functions/stagingFunctions";

export class GeneralMedicalSurvey {
  constructor(private page: Page) {}

  generalMedicalSurveyHeading = this.page.getByText("Medical Survey before Consultation");
  weightInput = this.page.getByPlaceholder("Weight [kg]");
  heightInput = this.page.getByPlaceholder("Height [cm]");
  genderSelect = this.page.getByLabel("Gender");
  genderMaleOption = this.page.getByRole("option", { name: "Male" });
  contactWithDoctorCheckbox = this.page.getByLabel("I need to speak with a doctor");
  acceptThermsCheckbox = this.page.getByText("I understand that the final decision");
  nextButton = this.page.getByRole("button", { name: "Next" });
  deasiseRadiobuttonNo = this.page
    .getByRole("button", {
      name: "Do you suffer from any chronic diseases?",
    })
    .getByLabel("No");
  drugsRadiobuttonNo = this.page
    .getByRole("button", {
      name: "Do you take medication regularly?",
    })
    .getByLabel("No");
  alergyRadiobuttonNo = this.page
    .getByRole("button", {
      name: "Do you have allergies?",
    })
    .getByLabel("No");

  async fillGeneralMedicalSurvey(page: Page): Promise<void> {
    await waitNotLessThan(page, 1000);
    if (await this.generalMedicalSurveyHeading.isVisible()) {
      await this.weightInput.click();
      await this.weightInput.fill("90");
      await this.heightInput.fill("170");
      await this.deasiseRadiobuttonNo.check();
      await this.drugsRadiobuttonNo.check();
      await this.alergyRadiobuttonNo.check();
      await waitNotLessThan(page, 50);
      await this.contactWithDoctorCheckbox.check();
      await waitNotLessThan(page, 50);
      await this.nextButton.click();
      await waitNotLessThan(page, 1500);
      if (await this.acceptThermsCheckbox.isVisible()) {
        await this.acceptThermsCheckbox.click();
        await waitNotLessThan(page, 50);
        await this.nextButton.click();
      }
    }
  }

  async fillGeneralMedicalSurveyMobile(page: Page): Promise<void> {
    if (await this.generalMedicalSurveyHeading.isVisible()) {
      await this.weightInput.tap();
      await this.weightInput.fill("90");
      await this.heightInput.fill("170");
      await this.deasiseRadiobuttonNo.check();
      await this.drugsRadiobuttonNo.check();
      await this.alergyRadiobuttonNo.check();
      await this.contactWithDoctorCheckbox.check();
      await waitNotLessThan(page, 50);
      await this.nextButton.tap();
      await waitNotLessThan(page, 50);
      await this.acceptThermsCheckbox.tap();
      await waitNotLessThan(page, 50);
      await this.nextButton.tap();
    }
  }
}