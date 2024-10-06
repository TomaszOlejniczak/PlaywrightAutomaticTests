import { Page, expect } from "@playwright/test";
import { readFile, writeFile, existsSync } from "fs";
import { readFile as readFileAsync } from "fs/promises";
import { promisify } from "util";
import * as url from "../data/url.json";
import * as createCsvWriter from "csv-writer";
import axios from "axios";

export async function getUserIdByPesel(pesel: string): Promise<string> {
  const url = `https://staging.com/patients/find-by-text/${pesel}`;

  try {
    const response = await axios.get(url, {
      headers: { accept: "application/json" },
    });

    return response.data?.id || "";
  } catch (error) {
    return "";
  }
}

export async function saveCsvCodes(page: Page): Promise<void> {
  const newCode1 = "csvCode1_" + getFormattedDate(0);
  const newCode2 = "csvCode2_" + getFormattedDate(0);
  const data = [
    {
      code: newCode1,
      total_limit: 1,
      date_from: "03-10-2023",
      date_to: "05-10-2029",
      days_valid: 2,
    },
    {
      code: newCode2,
      total_limit: 1,
      date_from: "03-10-2023",
      date_to: "05-10-2029",
      days_valid: 2,
    },
  ];
  // Ścieżka pliku CSV
  const csvWriter = createCsvWriter.createObjectCsvWriter({
    path: "uploadItems/codes_to_upload.csv",
    header: [
      { id: "code", title: "code" },
      { id: "total_limit", title: "total_limit" },
      { id: "date_from", title: "date_from" },
      { id: "date_to", title: "date_to" },
      { id: "days_valid", title: "days_valid" },
    ],
  });
  csvWriter.writeRecords(data);
  await waitNotLessThan(page, 50);
}

export async function performPayment(page: Page): Promise<void> {
  await page.waitForURL(/.*merch-prod.snd.payu.com/, { timeout: 45000 });
  await expect.soft(page).toHaveURL(/.*merch-prod.snd.payu.com/);
  await page
    .getByRole("link", { name: "Przelew Wybierz swój bank" })
    .or(page.getByRole("link", { name: "Bank transfer Choose your bank" }))
    .click();

  await page.getByTitle("Płacę z iPKO").click();
  await page
    .getByRole("button", { name: "Pozytywna autoryzacja" })
    .or(page.getByRole("button", { name: "Positive authorization" }))
    .click();
  await page
    .getByRole("button", { name: "Kontynuuj" })
    .or(page.getByRole("button", { name: "Continue" }))
    .click();
  await waitNotLessThan(page, 50);
}

export async function performMobilePayment(page: Page): Promise<void> {
  await page.waitForURL(/.*merch-prod.snd.payu.com/, { timeout: 40000 });
  await expect.soft(page).toHaveURL(/.*merch-prod.snd.payu.com/);
  await page
    .getByRole("link", { name: "Przelew Wybierz swój bank" })
    .or(page.getByRole("link", { name: "Bank transfer Choose your bank" }))
    .tap();

  await page.getByTitle("Płacę z iPKO").tap();
  await waitNotLessThan(page, 500);
  await page
    .getByRole("button", { name: "Pozytywna autoryzacja" })
    .or(page.getByRole("button", { name: "Positive authorization" }))
    .click();
  await waitNotLessThan(page, 500);
  await page
    .getByRole("button", { name: "Kontynuuj" })
    .or(page.getByRole("button", { name: "Continue" }))
    .click();
  await waitNotLessThan(page, 50);
}

interface Data {
  [key: string]: any;
}

export const addDataToJsonFile = async (newData: Data, filePath: string): Promise<void> => {
  const readFileAsync = promisify(readFile);
  const writeFileAsync = promisify(writeFile);

  let resolvePromise: (() => void) | undefined;

  const writeCompletePromise = new Promise<void>((resolve) => {
    resolvePromise = resolve;
  });

  if (!existsSync(filePath)) {
    const jsonData = JSON.stringify(newData, null, 2);
    await writeFileAsync(filePath, jsonData);
  } else {
    const fileData = await readFileAsync(filePath, "utf-8");

    let existingData: Data = {};
    try {
      existingData = JSON.parse(fileData);
    } catch (parseError) {
      throw parseError;
    }

    const updatedData: Data = { ...existingData, ...newData };
    const jsonData = JSON.stringify(updatedData, null, 2);

    await writeFileAsync(filePath, jsonData);
  }
  if (resolvePromise) {
    resolvePromise();
  }
  await writeCompletePromise;
};

export const readJsonFile = async (filePath) => {
  try {
    const data = await readFileAsync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    throw error;
  }
};

export async function widgetConsWithRegister(
  page: Page,
  email: string,
  phone: string,
  password: string
): Promise<void> {
  await page.goto(url.widgetCons);
  await page.getByText("Umów teleporadę").first().click();
  await page.getByPlaceholder("E-mail*").fill(email);
  await page.getByPlaceholder("Telefon*").fill(phone);
  await page.getByPlaceholder("Hasło*").fill(password);
  await page.getByText("Akceptuję Regulamin Serwisu oraz Politykę Prywatności *").click({ position: { x: 2, y: 2 } });
  await page.getByRole("button", { name: "Opłać za" }).first().click();
}

export async function waitNotLessThan(page: Page, minWaitTime: number): Promise<void> {
  await page.waitForLoadState();
  await page.waitForTimeout(minWaitTime);
}

export async function widgetRegistrationWithoutVisit(
  page: Page,
  url: string,
  email: string,
  password: string,
  phone: string,
  name: string,
  surname: string,
  pesel: string,
  id: string,
  birthDate: string,
  voucherCode: string
): Promise<void> {
  await page.goto(url);
  await waitNotLessThan(page, 50);
  await page.getByPlaceholder("E-mail*").fill(email);
  await waitNotLessThan(page, 50);
  await page.getByPlaceholder("Hasło*").first().fill(password);
  await waitNotLessThan(page, 50);
  await page.getByPlaceholder("Powtórz hasło*").fill(password);
  await waitNotLessThan(page, 50);
  await page.getByRole("button", { name: "Dalej" }).click();
  await waitNotLessThan(page, 50);
  await page.locator("#prefixCode div").first().click();
  await waitNotLessThan(page, 50);
  await page.getByText("Polska (+48)", { exact: true }).click();
  await waitNotLessThan(page, 50);
  await page.getByPlaceholder("Numer telefonu*").fill(phone);
  await waitNotLessThan(page, 50);
  await page.getByPlaceholder("Imię*").fill(name);
  await waitNotLessThan(page, 50);
  await page.getByPlaceholder("Nazwisko*").fill(surname);
  await waitNotLessThan(page, 50);
  await page.getByPlaceholder("Data urodzenia dd-mm-yyyy*").fill(birthDate);
  await waitNotLessThan(page, 50);
  await page.getByPlaceholder("Wprowadź kod vouchera").fill(voucherCode);
  await waitNotLessThan(page, 50);
  await page.locator("#root").click();

  if (pesel !== "") {
    await page.getByPlaceholder("Numer PESEL*").fill(pesel);
    await waitNotLessThan(page, 50);
  }
  if (id !== "") {
    await page.locator('select[name="nationality"]').selectOption("PT");
    await page.locator("#root").click();
    await page.locator('select[name="identityDocumentType"]').selectOption("4");
    await page.getByPlaceholder("Numer wybranego dokumentu*").fill(id);
    await waitNotLessThan(page, 50);
  }

  await page.getByLabel("AkceptujęRegulamin serwisuorazPolitykę prywatności*").check();
  await waitNotLessThan(page, 50);
  await page.getByRole("button", { name: "Załóż konto" }).click();
  await waitNotLessThan(page, 50);
  await page.getByRole("button", { name: "Przejdź do panelu Pacjenta" }).click();
  await waitNotLessThan(page, 50);
}

export async function v4PerformLogin(page: Page, url: string, email: string, password: string): Promise<void> {
  await page.goto(url);

  if (await page.getByRole("button", { name: "Wyślij" }).isVisible()) {
    const emailInput = await page.locator('[placeholder*="Email"]');
    await emailInput.fill(email);
    await waitNotLessThan(page, 200);
    await page.getByRole("button", { name: /.*Wyślij.*/ }).click();
    const passwordInput = await page.locator('[placeholder="Hasło"]');
    await passwordInput.fill(password);
    await waitNotLessThan(page, 200);
    await page.getByRole("button", { name: /.*Wyślij.*/ }).click();
    await page.waitForTimeout(2500);
  }
}

export function getFormattedDate(dateShift: number): string {
  var d = new Date();
  d.setDate(d.getDate() + dateShift);
  var month = "" + (d.getMonth() + 1);
  var day = "" + d.getDate();
  var year = d.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [day, month, year].join("-");
}

export function getFormattedDateYYYYMMDD(dateShift: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dateShift);
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

export async function failTestIfResponseStatus5XX(page: Page): Promise<void> {
  page.on("response", (response) => {
    if (response.status() == 500) {
      console.log(`Response URL: ${response.url()}`);
      console.log(`Response status: ${response.status()}`);
      console.error("Server error (500) detected!");
      expect.soft(false).toBeTruthy();
    }
  });
}

export async function returnQuoteFromString(string: string): Promise<number | undefined> {
  const tekst = string;
  const dopasowanie = tekst.match(/(\d+,\d+)/);

  if (dopasowanie) {
    const amountStr = dopasowanie[1];
    const kwota = parseFloat(amountStr.replace(",", "."));
    return kwota;
  } else {
    return undefined;
  }
}
