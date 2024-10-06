import { Page } from "playwright/test";

export class MultifrontSideMenu {
  constructor(private page: Page) {}

  bookVisitButton = this.page.getByRole("button", { name: /.*Book an appointment$/ }).or(this.page.getByLabel("Book an appointment"));
  bookVisitButtonEN = this.page.getByRole("button", { name: " Book a visit" });
  bookSickLeaveButton = this.page.getByRole("button", {
    name: "Sick leave Consultation with a medical questionnaire",
  });

  bookRemoteVisitButton = this.page
    .getByRole("button", {
      name: "Remote visit Consultation with an online doctor",
    })
    .or(this.page.getByRole("button", { name: "Image Remote visit" }));
  bookRemoteVisitButtonEN = this.page.getByRole("button", { name: "Image Remote visit Online" });

  bookPrescriptionButton = this.page.getByRole("button", {
    name: "Prescription Consultation with a medical questionnaire",
  });
  bookMedicalExamButton = this.page.getByRole("button", {
    name: "Exams Laboratory tests",
  });
  bookStationaryPozVisit = this.page.getByRole("button", {
    name: "In-person visits - Primary Care",
  });
  bookStationaryVisit = this.page.getByRole("button", { name: /.*In-person visit/ }).last();

  documentationButton = this.page.getByRole("link", { name: /.*Documentation.*/ });
  consultationsButton = this.page.locator("span.icon-stetoscope");
  preventionButton = this.page.getByRole("link", { name: /.*Prevention.*/ });
}