//typescript
import {
  dbToOpenApi,
  GeneratePropertyModel,
  ConvertOpenApiToDatabaseModel,
} from "../../src/utils/nosqlUtils";
import { JSONSchema4 } from "json-schema";
import {
  OpenApiSchemaTypeDefinition,
} from "openapi-json-schema";
import {
  DatabaseModelResult,
  TableEntity,
} from "../../src/types/sql-plugin-types";
import { GenerateDatabaseModel } from "../../src/utils/sharedUtils";

describe("dbToOpenApi", () => {
  it("should handle empty entities correctly", () => {
    const dbResult = {
      getEntities: () => ({}),
    } as DatabaseModelResult;

    const result = dbToOpenApi(dbResult);
    expect(result).toEqual(
      expect.objectContaining({
        openapi: "3.0.0",
        info: expect.anything(),
        paths: {},
        components: {
          schemas: {},
        },
      })
    );
  });

  it("should process entities and populate schemas", () => {
    const entities: Record<string, TableEntity> = {
      User: {
        name: "User",
        attributes: [
          { attributeName: "id", attributeType: "string" },
          { attributeName: "name", attributeType: "string" },
        ],
      },
    };
    const dbResult = GenerateDatabaseModel(entities, []);

    const result = dbToOpenApi(dbResult);
    expect(result.components?.schemas).toHaveProperty("User");
    expect(result.components?.schemas?.User).toEqual(
      expect.objectContaining({
        type: "object",
        properties: {
          id: expect.any(Object),
          name: expect.any(Object),
        },
      })
    );
  });
});

describe("GeneratePropertyModel", () => {
  it("should properly construct a PropertyModel from JSONSchema", () => {
    const jsonSchema: JSONSchema4 = {
      type: "string",
      nullable: true,
    };
    const propertyName = "username";
    const tableName = "User";

    const propertyModel = GeneratePropertyModel(
      tableName,
      propertyName,
      jsonSchema
    );
    expect(propertyModel.TableName).toEqual("`User`");
    expect(propertyModel.Name).toBe("`username`");
    expect(propertyModel.ColumnProperties).toContain("string nullable");
  });
});

describe("ConvertOpenApiToDatabaseModel", () => {
  it("should convert empty schemas to minimal DatabaseModel", () => {
    const schemas: Record<string, OpenApiSchemaTypeDefinition> = {};

    const model = ConvertOpenApiToDatabaseModel(schemas);
    expect(model).toEqual(
      expect.objectContaining({
        Dialect: "nosql",
        TableList: [],
        PrimaryKeyList: [],
        ForeignKeyList: [],
      })
    );
  });

  it("should convert populated schemas to DatabaseModel", () => {
    const schemas: Record<string, OpenApiSchemaTypeDefinition> = {
      User: {
        properties: {
          id: { type: "string", $ref: "#/components/schemas/Id" },
        },
        type: "object",
      },
    };

    const model = ConvertOpenApiToDatabaseModel(schemas);
    expect(model.TableList).toHaveLength(1);
    expect(model.ForeignKeyList).toHaveLength(2); // Primary and foreign key relationships
  });
});

//
