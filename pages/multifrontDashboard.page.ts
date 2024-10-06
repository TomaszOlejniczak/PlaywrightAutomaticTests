import { Page, expect } from "playwright/test";
import { waitNotLessThan } from "../tests/functions/stagingFunctions";
import { MultifrontSideMenu } from "../components/multifrontSideMenu.component";
import { MultifrontUserProfilePage } from "../components/multifrontUserProfile.component";
import { randomInt } from "crypto";

export class MultifrontDashboardPage {
  constructor(private page: Page) {}

  sideMenu = new MultifrontSideMenu(this.page);
  userProfile = new MultifrontUserProfilePage(this.page);

  // Patients dashboard locators
  usersProfileButton = this.page.getByLabel("Profil użytkownika").or(this.page.getByLabel("User profile"));
  myDataButton = this.page.getByRole("menuitem", { name: /.*Moje dane.*/ });
  languageButton = this.page.getByText("Język: PolskiPolskiEnglishEspañolукраїнськийPortuguêsРусскийLietuvių");

  languageEnButton = this.page.getByRole("button", { name: "English" });
  popUpCloseButton = this.page.getByRole("button", { name: "" });
  insurancePopUpCloseButton = this.page.getByTestId("close-icon");
  acceptCookies = this.page.getByRole("button", { name: "Akceptuję", exact: true });
  bookForButton = this.page.getByRole("button", { name: "Umów za" });
  bookForButtonEN = this.page.getByRole("button", { name: "Make an appointment for" });

  bookForFreeButton = this.page
    .getByRole("button", { name: "Umów za 0 PLN*" })
    .or(this.page.locator(".select-time__wrapper--buttons-wrapper > button:nth-child(2)"));
  bookForFreeButtonMobile = this.page.getByRole("button", { name: "PLN*" });
  bookForFreeButtonStationary = this.page.getByRole("button", { name: "Umów się za 0 PLN" });
  bookForButtonMobile = this.page.locator("button.fk-button");

  tomorrowThermRadiobutton = this.page.getByText("Jutro").or(this.page.getByText("Tomorrow"));
  chatChannelRadiobutton = this.page.getByText("Czat").or(this.page.getByText("Chat"));
  videoChannelRadiobutton = this.page.getByText("Wideo").or(this.page.getByText("Video"));
  payButton = this.page
    .getByRole("button", { name: "Opłać", exact: true })
    .or(this.page.getByRole("button", { name: "Pay", exact: true }));
  enterConsultationButton = this.page
    .getByRole("button", { name: "Wejdź", exact: true })
    .or(this.page.getByRole("button", { name: "Enter", exact: true }));
  saveButton = this.page.getByRole("button", { name: "Zapisz" });
  fillPersonalDataButton = this.page.getByRole("button", { name: "Uzupełnij" });
  doctorAskForFillSurveyHeading = this.page.getByText("Twój Lekarz prosi o uzupełnienie ankiety medycznej");
  moreThanOnePozConsultationPerDayHeading = this.page.getByText("Nie możemy umówić Cię na konsultację");
  monthlyPozLimitMessage = this.page.getByText("Wykorzystałeś już dodatkowy pakiet 3 telekonsultacji w tym miesiącu.");
  //TelemediGo
  telemediGoCheckbox = this.page.getByText(
    "Korzystam z pakietu TelemediGO i zniżki 50% przez cały rok na wszystkie konsulta"
  );
  telemediGoInternistCheckbox = this.page.getByText("Chcę dołączyć do TelemediGO");
  telemediGoCheckoutHeading = this.page.getByRole("heading", { name: "Twoja oferta" });
  telemediGoBanner = this.page
    .getByRole("main")
    .locator("div")
    .filter({ hasText: "GOTaniej przez cały rok bez ograniczeń!50%Tańsze konsultacje:z lekarzem ogó" })
    .first();
  telemediGoCheckoutBanner = this.page.locator(".telemedi-go-container");
  telemediGoConfirmationAfterBuyHeading = this.page.getByText("Twój pakiet jest jużaktywny!");
  buyNowButton = this.page.getByRole("button", { name: "Kup teraz" });
  telemediByForButton = this.page.getByRole("button", { name: "Kup za 89,00 PLN" });

  fillMedicalSurveyButton = this.page
    .getByRole("button", { name: "Wypełnij ankietę medyczną" })
    .or(this.page.getByRole("button", { name: "Complete the medical" }));
  fillMedicalSurveyHeading = this.page.getByRole("heading", { name: "Wypełnij ankietę medyczną" });
  fillSurveyButton = this.page.getByRole("button", { name: "Wypełnij ankietę", exact: true });
  consultationChatbox = this.page.getByPlaceholder("Tu wpisz wiadomość");
  sendButton = this.page.getByRole("button", { name: "Wyślij" });
  cancelVisitButton = this.page
    .getByRole("button", { name: "Anuluj", exact: true })
    .or(this.page.getByRole("button", { name: "Cancel", exact: true }));
  cancelVisitWithTrashButton = this.page.getByTestId("trash-icon");
  cancelVisitWithTelemediGoButton = this.page.getByRole("button", { name: "Anuluj usługi" });
  showMoreVisitsButton = this.page
    .getByRole("button", { name: "Pokaż więcej" })
    .or(this.page.getByRole("button", { name: "Show more" }));
  goToBookedVisitButton = this.page.getByRole("button", {
    name: "Przejdź do umówionej wizyty",
  });
  goToConsultationButton = this.page
    .getByRole("button", { name: "Przejdź do konsultacji" })
    .or(this.page.getByRole("button", { name: "Go to consultation" }));
  goToHomepageButton = this.page
    .getByRole("button", { name: "Przejdź na stronę główną" })
    .or(this.page.getByRole("button", { name: "Go to homepage" }));

  addVoucherButton = this.page.getByText("Dodaj kod rabatowy");
  voucherConsbookInput = this.page.getByPlaceholder("Podaj kod");
  useVoucherButton = this.page.getByRole("button", { name: "Zrealizuj" });
  visitBookedHeading = this.page.getByRole("heading", { name: "Wizyta umówiona!" });

  //Therms popUp for new patient
  acceptThermsNewPatientCheckbox = this.page.getByText("Akceptuję Regulamin Serwisu oraz Politykę Prywatności*");
  aproveButton = this.page.getByRole("button", { name: "Potwierdź" });

  // Remote Visit
  specializationSelect = this.page.locator("#react-select-2-input");
  specializationSelectMobile = this.page.locator("div.select-v2__mobile-content");

  priceWithTelemediGoText = this.page
    .getByText("Cena z TelemediGo:")
    .or(this.page.getByText("Roczny pakiet TelemediGO:"));
  payForButton = this.page.getByRole("button", { name: "Opłać za" });
  payForButtonEN = this.page.getByRole("button", { name: "Pay" });
  noThermsMessage = this.page.getByText("Niestety nie mamy w tej chwili wolnych terminów");

  // Prescription order locators
  medicineNameSearchbox = this.page.locator("#react-select-2-input");
  packageSizeSelect = this.page.locator("label").filter({ hasText: "Wybierz wielkość opakowania" });
  numberOfPackagesSelect = this.page
    .locator("div")
    .filter({ hasText: /^Ilość opakowań$/ })
    .nth(1);
  acceptTermsLabel = this.page.locator("label").filter({
    hasText: "Akceptuję, że to lekarz decyduje",
  });
  chooseButton = this.page.getByRole("button", { name: "Wybierz" });
  checkAllCheckbox = this.page.getByText("Zaznacz wszystkie");
  additionalHelpNeededButton = this.page.getByRole("button", {
    name: "Tak - poproszę o dodatkową pomoc / mam pytania do lekarza",
  });
  additionalHelpNotNeededButton = this.page.getByRole("button", {
    name: "Nie - nie potrzebuję dodatkowej porady od lekarza",
  });
  alergyMedicineLocator = this.page
    .locator("div")
    .filter({
      hasText: "Allertec",
    })
    .first();

  // documentation locators
  allFilesTab = this.page.getByRole("tab", { name: "Wszystkie pliki" });
  downloadFileButton = this.page.getByRole("button", { name: "pobierz" });
  addFile = this.page.getByRole("button", { name: /.*Dodaj plik.*/ });

  // examination locators
  examSearchbox = this.page.getByLabel("Wyszukaj badanie").first();
  voucherCodeInput = this.page.locator("id=voucher");
  filechooserButton = this.page.getByText("Przeciągnij plik z dysku lub kliknij tutaj");
  orderExamnationButton = this.page.getByRole("button", { name: "Zamów" });

  // Sick leave locators
  emplymentFormSelect = this.page.locator("div.select-v2").or(this.page.locator("div.select-v2__mobile-content"));

  civilianEmployeeOption = this.page.locator("#react-select-2-option-0");
  studentOption = this.page.locator("#react-select-2-option-1");
  studentOptionMobile = this.page.getByText("Student / uczeń");
  uniformedEmployeeOption = this.page.locator("#react-select-2-option-2");
  uniformedEmployeeOptionMobile = this.page.getByText("Pracownik służb mundurowych");
  foreignEmployeeOption = this.page.locator("#react-select-2-option-3");
  foreignEmployeeOptionMobile = this.page.getByText("Pracownik w firmie");
  surveyButton = this.page
    .getByRole("button", {
      name: "Wypełnij ankietę medyczną",
    })
    .or(this.page.getByRole("button", { name: "Complete the medical" }));
  sickLeaveSurveyHeading = this.page.getByText("Uzupełnij dane niezbędne do wystawienia e-zwolnienia");

  nurseAnimation = this.page.getByLabel("animation");

  needContactDoctorCheckbox = this.page.getByText(
    "Potrzebuję porozmawiać z lekarzem (lekarz ma możliwość wystawienia recepty)"
  );
  visitReasonHeading = this.page.getByText("Jaki jest powód Twojej wizyty?");
  consultationHeading = this.page.getByRole("heading", { name: "Konsultacja" });
  surveyBeforeConsultationHeading = this.page.getByRole("heading", {
    name: "Ankieta medyczna przed konsultacją",
  });
  weNeedYourDataHeading = this.page.getByRole("heading", {
    name: "Potrzebujemy Twoich danych!",
  });

  paymentSuccessfulHeading = this.page
    .getByRole("heading", { name: "Płatność powiodła się" })
    .or(this.page.getByRole("heading", { name: "Payment successful" }));
  chooseSpecializationHeading = this.page.getByRole("heading", { name: "1. Wybierz specjalizację" });
  nextButton = this.page.getByRole("button", { name: "Dalej" });

  // Insurance pop-ups
  noInsuranceMessage = this.page.getByText("Brak aktywnej polisy");
  noInsuranceMessageS7 = this.page.getByText("Pakiet medyczny nieaktywny");
  activeInsuranceMessage = this.page.getByText("Twój pakiet medyczny jest aktywny");

  // Stationary locators
  nonIntegratedFormButton = this.page.getByRole("button", { name: "Przejdź do formularza" });
  cityInputNonIntegratedForm = this.page.getByPlaceholder("Miejscowość");
  specializationSelectNonIntegratedForm = this.page.getByPlaceholder("Wybierz specjalizację");
  dropdownSpecializationListButton = this.page.getByLabel("Open");
  preferredTermCheckbox = this.page.getByLabel("Chcę podać terminy i godziny");
  textbox1NonIntegratedForm = this.page.getByPlaceholder("Np. środa po godz. 17,");
  textbox2NonIntegratedForm = this.page.getByPlaceholder("Np. możesz tutaj wpisać");
  bookStationaryWidgetButton = this.page.getByRole("button", { name: "Umów", exact: true });
  nonIntegratedFormSentHeading = this.page.getByRole("heading", { name: "Formularz wysłany!" });
  searchButton = this.page.getByRole("button", { name: "Wyszukaj" });
  referralCheckbox = this.page.getByText("Potwierdzam, że jeżeli wymaga");
  stationaryPozDateSelect = this.page
    .locator("div:nth-child(3) > div > .fk-select > .select-react > .select-v2 > .css-yk16xz-control")
    .first();
  stationaryPOZSlotOption = this.page.locator("div.fk-select-v2__option");

  // Actions

  async bookNonIntegratedVisitDashboard(
    page: Page,
    specializationName: string,
    cityName: string,
    text1: string,
    text2: string
  ): Promise<void> {
    await this.nonIntegratedFormButton.click();
    await this.cityInputNonIntegratedForm.fill(cityName);
    await this.specializationSelectNonIntegratedForm.click();
    await page.getByRole("option", { name: specializationName }).locator("div").click();
    await this.preferredTermCheckbox.check();
    await this.textbox1NonIntegratedForm.fill(text1);
    await this.textbox2NonIntegratedForm.fill(text2);
    await this.bookStationaryWidgetButton.click();
  }

  async closePopUpIfVisible(page: Page, timeout: number): Promise<void> {
    await waitNotLessThan(page, timeout);
    if (await this.popUpCloseButton.isVisible()) {
      await this.popUpCloseButton.click();
    }
    await waitNotLessThan(page, 50);
  }

  async closePopUpIfVisibleHandler(page: Page): Promise<void> {
    await page.addLocatorHandler(page.getByRole("heading", { name: "Niedługo zaczynasz konsultację" }), async () => {
      await page.waitForTimeout(randomInt(100, 800));
      if (await this.popUpCloseButton.isVisible()) {
        await this.popUpCloseButton.click();
      }
    });
  }

  async waitForAnimationHideHandler(page: Page): Promise<void> {
    await page.addLocatorHandler(
      this.nurseAnimation,

      async () => {
        await this.nurseAnimation.waitFor({ state: "hidden" });
      }
    );
  }

  // Funkcja otwiera profil użytkownika dopóki skutecznie się nie otworzy

  async userProfileOpen(page: Page): Promise<void> {
    let trigger = false;
    while (trigger == false) {
      await waitNotLessThan(page, 50);
      await this.usersProfileButton.hover();
      await waitNotLessThan(page, 50);
      await this.usersProfileButton.click();
      await waitNotLessThan(page, 50);
      await this.myDataButton.hover();
      await waitNotLessThan(page, 50);
      await this.myDataButton.click();
      await waitNotLessThan(page, 1000);
      let url = await page.url();
      if (url.includes("user-profile#myProfile")) {
        trigger = true;
      }
    }
    await waitNotLessThan(page, 50);
  }

  async changeLanguage(page: Page, language: String): Promise<void> {
    await this.usersProfileButton.hover();
    await waitNotLessThan(page, 50);
    await this.usersProfileButton.click();
    await waitNotLessThan(page, 50);
    await this.languageButton.click();
    await page.getByRole("button", { name: `${language}` }).click();
    await waitNotLessThan(page, 1000);
  }

  async bookRemoteVisitDashboard(page: Page): Promise<void> {
    await this.sideMenu.bookVisitButton.click();
    await waitNotLessThan(page, 200);
    await this.sideMenu.bookRemoteVisitButton.click();
    await waitNotLessThan(page, 200);
    if (await this.sideMenu.bookRemoteVisitButton.isVisible()) {
      await page.locator("body").click();
    }
  }

  async bookRemoteVisitDashboardMobile(page: Page): Promise<void> {
    await this.sideMenu.consultationsButton.tap();
    await waitNotLessThan(page, 200);
    await this.sideMenu.bookVisitButton.tap();
    await waitNotLessThan(page, 200);
    await this.sideMenu.bookRemoteVisitButton.tap();
    await waitNotLessThan(page, 200);
  }

  async searchSpecializationMobile(page: Page, text: string): Promise<void> {
    await this.specializationSelectMobile.tap();
    await page.getByPlaceholder("Wyszukaj...").tap();
    await page.getByPlaceholder("Wyszukaj...").fill(text);
  }

  async bookStationaryVisitDashboard(page: Page): Promise<void> {
    await this.sideMenu.bookVisitButton.click();
    await waitNotLessThan(page, 200);
    await this.sideMenu.bookStationaryVisit.click();
    await waitNotLessThan(page, 200);
  }

  async bookStationaryVisitPOZDashboard(page: Page): Promise<void> {
    await this.sideMenu.bookVisitButton.click();
    await waitNotLessThan(page, 200);
    await this.sideMenu.bookStationaryPozVisit.click();
    await waitNotLessThan(page, 200);
  }

  async chooseRemoteVisitSpecialization(page: Page, specialization: string): Promise<void> {
    await waitNotLessThan(page, 50);
    await this.specializationSelect.click();
    await waitNotLessThan(page, 50);
    await page.getByText(specialization).last().click();
    await waitNotLessThan(page, 50);
  }

  async checkVisitReason(page: Page): Promise<void> {
    await waitNotLessThan(page, 500);
    if (await this.visitReasonHeading.isVisible()) {
      await this.needContactDoctorCheckbox.check();
      await this.nextButton.click();
      await waitNotLessThan(page, 500);
    }
  }

  async cancelAllVisits(page: Page): Promise<void> {
    await waitNotLessThan(page, 1000);
    let trigger = true;
    while (trigger) {
      await waitNotLessThan(page, 1000);
      if (await this.showMoreVisitsButton.isVisible()) {
        await this.showMoreVisitsButton.click();
      }
      await waitNotLessThan(page, 1000);
      if (await this.cancelVisitButton.first().isVisible()) {
        await this.cancelVisitButton.first().click();
        await this.cancelVisitWithTelemediGoButton.or(this.cancelVisitWithTrashButton).waitFor({ state: "visible" });
        if (await this.cancelVisitWithTelemediGoButton.isVisible()) {
          await this.cancelVisitWithTelemediGoButton.click();
        }
        if (await this.cancelVisitWithTrashButton.isVisible()) {
          await this.cancelVisitWithTrashButton.click();
        }
      } else {
        trigger = false;
      }
    }
  }

  async cancelAllVisitsMobile(page: Page): Promise<void> {
    let trigger = true;
    while (trigger) {
      await waitNotLessThan(page, 2000);
      if (await this.showMoreVisitsButton.isVisible()) {
        await this.showMoreVisitsButton.tap();
      }
      await waitNotLessThan(page, 1000);
      if (await this.cancelVisitButton.isVisible()) {
        await this.cancelVisitButton.tap();
        await this.cancelVisitWithTelemediGoButton.or(this.cancelVisitWithTrashButton).waitFor({ state: "visible" });
        if (await this.cancelVisitWithTelemediGoButton.isVisible()) {
          await this.cancelVisitWithTelemediGoButton.tap();
        }
        if (await this.cancelVisitWithTrashButton.isVisible()) {
          await this.cancelVisitWithTrashButton.tap();
        }
      } else {
        trigger = false;
      }
    }
  }

  async chooseExam(page: Page, examName: string): Promise<void> {
    await this.examSearchbox.click();
    await this.examSearchbox.fill(examName.slice(0, 5));
    await waitNotLessThan(page, 500);
    await this.page.getByText(examName).click();
  }
  async waitForPaymentOrSurvey(page: Page): Promise<void> {
    await this.surveyBeforeConsultationHeading
      .or(page.getByRole("link", { name: "Przelew Wybierz swój bank" }))
      .waitFor({ state: "visible", timeout: 40000 });
  }

  async acceptTherms(): Promise<void> {
    await this.acceptThermsNewPatientCheckbox.click({ position: { x: 2, y: 2 } });
    await this.aproveButton.click();
  }

  //Function resets password inside patient's dashboard
  //Precondition: user is logged in on multifront dashboard
  async passwordResetInsideAccount(page: Page, oldPassword: string, newPassword: string): Promise<void> {
    await waitNotLessThan(page, 50);
    await this.userProfileOpen(page);
    await this.userProfile.changePasswordButton.click();
    await waitNotLessThan(page, 50);
    await this.userProfile.actualPasswordInput.fill(oldPassword);
    await this.userProfile.newPasswordInput.fill(newPassword);
    await this.userProfile.repeatNewPasswordInput.fill(newPassword);
    await waitNotLessThan(page, 50);
    await this.userProfile.saveButton.click();
    await waitNotLessThan(page, 50);
  }

  //function add voucher code (dashboard only) and checks message
  async executeCode(page: Page, code: string, usedText: string): Promise<void> {
    await waitNotLessThan(page, 50);
    await this.userProfile.voucherCodeInput.fill(code);
    await waitNotLessThan(page, 50);
    await this.userProfile.confirmButton.click();
    await waitNotLessThan(page, 50);
    await expect.soft(page.getByText(usedText)).toBeVisible();
    await waitNotLessThan(page, 50);
  }

  async waitForTelemediGo(page: Page): Promise<void> {
    await waitNotLessThan(page, 50);
    await this.telemediGoCheckbox.or(this.priceWithTelemediGoText).waitFor({ state: "visible" });
  }

  async checkAndchangeLanguageToPL(page: Page, url: string): Promise<void> {
    await waitNotLessThan(page, 50);
    if (page.url().includes("/en")) {
      await page.goto(url);
    }
    await waitNotLessThan(page, 50);
  }
}
