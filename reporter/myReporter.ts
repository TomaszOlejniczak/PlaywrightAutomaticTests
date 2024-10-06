import { Reporter, TestCase, TestResult, FullResult } from "@playwright/test/reporter";
import * as fs from "fs";

class CustomReporter implements Reporter {
  private results: {
    passed: number;
    failed: number;
    flaky: number;
    failedTests: Set<string>;
    totalTests: number;
  };
  private testCounts: Map<string, number>;
  private testStatus: Map<string, "passed" | "failed" | "flaky">;

  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      flaky: 0,
      failedTests: new Set(),
      totalTests: 0,
    };
    this.testCounts = new Map();
    this.testStatus = new Map();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testId = `${test.location.file}:${test.location.line}`;
    const currentCount = this.testCounts.get(testId) || 0;
    this.testCounts.set(testId, currentCount + 1);

    // Zliczamy test tylko przy pierwszym uruchomieniu
    if (currentCount === 0) {
      this.results.totalTests++;
    }

    const currentStatus = this.testStatus.get(testId);

    if (result.status === "passed") {
      if (currentStatus === "failed") {
        // Test był wcześniej nieudany, ale teraz przeszedł - oznaczamy jako flaky
        this.results.flaky++;
        this.results.failed--;
        this.testStatus.set(testId, "flaky");
      } else if (!currentStatus) {
        // Test przeszedł za pierwszym razem
        this.results.passed++;
        this.testStatus.set(testId, "passed");
      }
      this.results.failedTests.delete(test.title);
    } else if (result.status === "failed" || result.status === "timedOut") {
      if (!currentStatus) {
        // Test nie przeszedł za pierwszym razem
        this.results.failed++;
        this.results.failedTests.add(test.title);
        this.testStatus.set(testId, "failed");
      }
      // Jeśli test już był oznaczony jako failed lub flaky, nie zmieniamy statusu
    }

    // Ignorujemy statusy "skipped" i "interrupted"
    if (result.status === "skipped" || result.status === "interrupted") {
      return;
    }

    // // Dodajemy logowanie dla debugowania
    // console.log(`Test ended: ${test.title}`);
    // console.log(`Status: ${result.status}`);
    // console.log(`Current count: ${currentCount}`);
    // console.log(`Current status: ${currentStatus}`);
    // console.log(`Results: ${JSON.stringify(this.results, null, 2)}`);
  }

  onEnd(result: FullResult) {
    const reportPath = "test-report.json";
    const finalResults = {
      ...this.results,
      failedTests: Array.from(this.results.failedTests),
    };
    fs.writeFileSync(reportPath, JSON.stringify(finalResults, null, 2));
    console.log(`Test report saved to ${reportPath}`);
  }
}

export default CustomReporter;
