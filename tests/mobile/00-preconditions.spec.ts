import { expect, test } from "@playwright/test";
import * as voucher from "../data/voucher.json";
import {
  addDataToJsonFile
} from "../functions/stagingFunctions";

test.setTimeout(150000);

test(
  "[mobilePreconditions][CreateRemote100Registry] WHEN create 100 remote registry, THEN register name should be visible on registers list",
  {
    tag: ["@beforeMobile"],
  },
  async ({ page }) => {
    var today = new Date();
    const specialization = "Testy Automatyczne";
    const codeName = voucher.remote100.name + "Mobile" + today;

    //saving code name to JSON
    const newSampleData = {
      remote100Mobile: codeName,
    };
    const filePath = "tests/data/voucherCodes.json";
    await addDataToJsonFile(newSampleData, filePath);

    // expect
    await expect(page.getByRole("rowheader", { name: voucher.remote100.name }).first()).toBeVisible({ timeout: 15000 });
  }
);

test(
  "[mobilePreconditions][CreateExam50Registry] WHEN create 50% exam registry, THEN register name should be visible on registers list",
  {
    tag: ["@beforeMobile"],
  },
  async ({ page }) => {
    var today = new Date();
    const codeName = voucher.examination50.name + "Mobile" + today;

    //saving code name to JSON
    const newSampleData = {
      exam50Mobile: codeName,
    };
    const filePath = "tests/data/voucherCodes.json";
    await addDataToJsonFile(newSampleData, filePath);
  }
);
