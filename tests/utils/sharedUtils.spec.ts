import { ColumnQuantifiers } from "@funktechno/sqlsimpleparser/lib/types";
import {
  GetColumnQuantifiers,
  dbTypeEnds,
  getDbLabel,
  getMermaidDiagramDb,
  removeHtml,
  GenerateDatabaseModel,
  RemoveNameQuantifiers,
  entityName,
  getCommentIndexes,
  generateComment,
} from "../../src/utils/sharedUtils";
import { multiAssert } from "../helpers";
import {
  DbRelationshipDefinition,
} from "@funktechno/little-mermaid-2-the-sql/lib/src/types";

import "../../src/types/drawio-types";

describe("sharedUtils.ts", () => {
  describe("dbTypeEnds", () => {
    it("dbTypeEnds 1", () => {
      const result = dbTypeEnds("label");
      expect(result).toBe("`label`");
    });
    it("should wrap input with backticks", () => {
      expect(dbTypeEnds("tablename")).toBe("`tablename`");
    });
  });
  describe("GetColumnQuantifiers", () => {
    it("GetColumnQuantifiers 1", () => {
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
    test.each<
      [
        (
          | "mysql"
          | "sqlserver"
          | "sqlite"
          | "postgres"
          | "openapi"
          | "ts"
          | undefined
        ),
        string,
        string
      ]
    >([
      ["mysql", "`", "`"],
      ["sqlserver", "[", "]"],
      ["sqlite", '"', '"'],
      ["postgres", '"', '"'],
      ["openapi", "`", "`"],
      ["ts", "`", "`"],
      [undefined, '"', '"'],
    ])(
      "should return correct characters for %s",
      (type, expectedStart, expectedEnd) => {
        const quantifiers = GetColumnQuantifiers(type);
        expect(quantifiers).toEqual({
          Start: expectedStart,
          End: expectedEnd,
        });
      }
    );
  });

  describe("removeHtml", () => {
    it("should clean HTML tags and return plain text", () => {
      const input = '<div>Hello <span style="color: red;">World</span>!</div>';
      const output = removeHtml(input);
      expect(output).toBe("Hello World!");
    });
    it("should clean HTML tags and return plain text 2", () => {
      const expectedResult = "text only";
      const testData = `<span>${expectedResult}</span>`;
      expect(removeHtml(testData)).toBe("text only");
    });
  });

  describe("RemoveNameQuantifiers", () => {
    test.each([
      ["[name]", "name"],
      ["'name'", "name"],
      ['"name"', "name"],
      ["`name`", "name"],
      ["(name)", "name"],
      ["name", "name"],
    ])("should remove any quantifiers from %s", (input, expected) => {
      expect(RemoveNameQuantifiers(input)).toBe(expected);
    });
  });

  describe("getDbLabel", () => {
    it("should return formatted TableAttribute object", () => {
      const label = "name varchar";
      const quantifiers = { Start: "`", End: "`" };
      const attribute = getDbLabel(label, quantifiers);
      expect(attribute).toEqual({
        attributeComment: null,
        attributeName: "name",
        attributeType: "varchar",
      });
    });
  });

  describe("entityName", () => {
    test.each([
      [undefined, undefined, ""],
      ["Desc", undefined, "/** Desc */"],
      ["Desc", "Format", "/** Desc @format Format */"],
    ])(
      "should format entity name correctly",
      (description, format, expected) => {
        expect(entityName(description, format)).toBe(expected);
      }
    );
  });

  describe("getCommentIndexes", () => {
    const desc = "key";
    it("should return correct index positions when comments are present", () => {
      const result = `--start--/**${desc}*/--end--`;
      const indexes = getCommentIndexes(result);
      expect(indexes).toEqual({
        beforeStart: 9,
        start: 12,
        end: 14,
      });
    });

    it("should return -1 for all positions when comments are absent", () => {
      const result = "Some description";
      const indexes = getCommentIndexes(result);
      expect(indexes).toEqual({
        beforeStart: -1,
        start: -1,
        end: -1,
      });
    });
  });

  describe("GenerateDatabaseModel", () => {
    it("should create a DatabaseModelResult instance with entities and relationships", () => {
      const entities = { table: { name: "table", attributes: [] } };
      const relationships: DbRelationshipDefinition[] = [];
      const db = GenerateDatabaseModel(entities, relationships);
      expect(db.getEntities()).toEqual(entities);
      expect(db.getRelationships()).toEqual(relationships);
    });
    it("getMermaidDiagramDb 1", () => {
      const mockDrawioUI: DrawioUI = {
        fileNode: null,
        hideDialog: () => {},
        showDialog: (...args: any[]) => {},
        editor: {
          graph: {
            getModel: () => {
              const cells: Record<any, DrawioCell> = {};
              return { cells };
            },
          } as any,
        },
        actions: {
          addAction: (name: string, action: () => void) => {},
          get: (name: string) => {
            return { funct: () => {} };
          },
        },
        menus: {
          get: (name: string) => null,
          funct: (...args: any[]) => {},
          enabled: true,
          addMenuItems: (menu: any, arg: any, arg2: any) => {},
        } as any,
        importLocalFile: (args: boolean) => {},
      };
      const result = getMermaidDiagramDb(mockDrawioUI, "mysql");
      const expectedResult = GenerateDatabaseModel({}, []);
      expect(result).toEqual(expectedResult);
    });
  });
  

  describe('generateComment', () => {
    test.each([
      [undefined, undefined, ''],
      ["This is a comment", undefined, '/** This is a comment */'],
      ["This is a comment", "extra", '/** This is a comment @format extra */'],
    ])('should generate a comment string correctly', (description, format, expected) => {
      expect(generateComment(description, format)).toBe(expected);
    });
  });
});
