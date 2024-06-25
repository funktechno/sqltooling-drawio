import { dbTypeEnds } from "../../src/utils/sharedUtils";

describe("sharedUtils.ts", () => {
  it("dbTypeEnds", () => {
    const result = dbTypeEnds("label");
    expect(result).toBe("`label`");
  });
});
