import { ColumnQuantifiers } from "@funktechno/sqlsimpleparser/lib/types";
import { GetColumnQuantifiers, dbTypeEnds } from "../../src/utils/sharedUtils";
import { multiAssert } from "../helpers";

describe("sharedUtils.ts", () => {
  it("dbTypeEnds", () => {
    const result = dbTypeEnds("label");
    expect(result).toBe("`label`");
  });
  it("GetColumnQuantifiers", () => {
    const testTheory: (() => void)[] = [];
    const testTypes: Record<string, ColumnQuantifiers> = {
      mysql: { Start: "`", End: "`" },
      ts: { Start: "`", End: "`" },
      openapi: { Start: "`", End: "`" },
      sqlserver: { Start: "[", End: "]" },
      sqlite: { Start: "\"", End: "\"" },
      postgres: { Start: "\"", End: "\"" },
    };

    for (const key in testTypes) {
      testTheory.push(() =>
        expect(
          GetColumnQuantifiers(
            key as
              | "mysql"
              | "ts"
              | "openapi"
              | "sqlserver"
              | "sqlite"
              | "postgres"
          )
        ).toEqual(testTypes[key])
      );
    }
    let type_undefined: undefined;
    testTheory.push(() =>
      expect(GetColumnQuantifiers(type_undefined)).toEqual({
        Start: "\"",
        End: "\"",
      })
    );

    multiAssert(testTheory);
  });
});
