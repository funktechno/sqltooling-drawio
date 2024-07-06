import { ColumnQuantifiers } from "@funktechno/sqlsimpleparser/lib/types";
import {
  GetColumnQuantifiers,
  dbTypeEnds,
  getDbLabel,
  getMermaidDiagramDb,
  removeHtml,
  GenerateDatabaseModel,
} from "../../src/utils/sharedUtils";
import { multiAssert } from "../helpers";
import { DatabaseModelResult, TableAttribute } from "../../src/types/sql-plugin-types";
import {
  DbDefinition,
  DbEntityAttributesDefinition,
  DbEntityDefinition,
  DbRelSpec,
  DbRelationshipDefinition,
} from "@funktechno/little-mermaid-2-the-sql/lib/src/types";

import '../../src/types/drawio-types';

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
      sqlite: { Start: '"', End: '"' },
      postgres: { Start: '"', End: '"' },
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
        Start: '"',
        End: '"',
      })
    );

    multiAssert(testTheory);
  });
  it("removeHtml", () => {
    const expectedResult = "text only";
    const testData = `<span>${expectedResult}</span>`;
    expect(removeHtml(testData)).toBe("text only");
  });
  it("getMermaidDiagramDb", () => {
    const mockDrawioUI: DrawioUI = {
      fileNode: null,
      hideDialog:() => {},
      showDialog:(...args: any[]) => {},
      editor: {
        graph: {
          getModel:() => {
            const cells: Record<any, DrawioCell> = {};
            return {cells};
          }
        } as any
      },
      actions: {
        addAction:(name: string, action: () => void)=> {},
        get:(name: string)=> { return {funct: () => {}} } 
      },
      menus: {
        get:(name: string) => null,
        funct: (...args: any[]) => {},
        enabled: true,
        addMenuItems:(menu: any, arg: any, arg2: any) => {}
      } as any,
      importLocalFile:(args: boolean) => {}
    };
    const result = getMermaidDiagramDb(mockDrawioUI, "mysql");
    const expectedResult = GenerateDatabaseModel({}, [])
    expect(result).toEqual(expectedResult);
  });
});
