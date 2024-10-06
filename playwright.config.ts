import { defineConfig, devices } from "@playwright/test";
require("dotenv").config();

export default defineConfig({
  // timeout: 30000,
  testDir: "./tests",
  // fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [
        ["list"],
        ["./reporter/myReporter.ts"],
        ["playwright-json-summary-reporter"],
        ["json", { outputFile: "test-results.json" }],
        ["html", { outputFolder: "playwright-report" }],
      ]
    : [
        ["list"],
        ["./reporter/myReporter.ts"],
        ["playwright-json-summary-reporter"],
        ["json", { outputFile: "test-results.json" }],
        ["html", { outputFolder: "playwright-report" }],
      ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */

  use: {
    locale: "pl-PL",
    timezoneId: "Europe/Warsaw",

    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
    video: "retain-on-failure",
    // headless: process.env.HEADLESS == "true",

    ignoreHTTPSErrors: true,
    launchOptions: {
      slowMo: 50,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    // {
    //   name: "Google Chrome",
    //   use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 }, channel: "chrome" },
    // },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1900, height: 1000 } },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "mobileChrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobileSafari",
      use: {
        ...devices["iPhone 12 Pro Max"],
        viewport: {
          width: 428,
          height: 926,
        },
        isMobile: false,
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
