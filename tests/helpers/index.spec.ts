import { multiAssert } from ".";
import { AssertionError } from "assert";

describe("helpers/index.ts", () => {
  it("multiassert renders", () => {
    multiAssert([
      () => expect(true).toEqual(true),
      () => expect(false).toEqual(false),
    ]);
  });
  it("multiassert fail", () => {
    let triggered = false;
    const testFailedAssertions = [
      () => expect(true).toEqual(false),
      () => expect(false).toEqual(true),
    ];
    try {
      multiAssert(testFailedAssertions);
    } catch (error) {
      let message = "Unknown Error";
      if (error instanceof Error) message = error.message;
      expect(message).not.toBeNull();
      const errors: AssertionError[] = JSON.parse(message);
      expect(errors.length).toEqual(testFailedAssertions.length);
      triggered = true;
    }
    expect(triggered).toBeTruthy();
  });
});
