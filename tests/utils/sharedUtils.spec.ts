import { ColumnQuantifiers } from "@funktechno/sqlsimpleparser/lib/types";
import { GetColumnQuantifiers, dbTypeEnds, getDbLabel, removeHtml } from "../../src/utils/sharedUtils";
import { multiAssert } from "../helpers";
import { TableAttribute } from "../../src/types/sql-plugin-types";

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
  it("removeHtml", () => {
    const expectedResult = "text only";
    const testData = `<span>${expectedResult}</span>`;
    expect(removeHtml(testData)).toBe("text only");
     
  })
  it("getDbLabel", () => {
    const columnQuantifiers = GetColumnQuantifiers("mysql");
    const rowValue = "`LastName` varchar(255)"
    const result = getDbLabel(rowValue, columnQuantifiers);
    const expectedResult:TableAttribute = { attributeName: "LastName", attributeType: "varchar(255)" }
    expect(result).toEqual(expectedResult);
  })
});
