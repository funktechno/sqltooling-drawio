import { DbDefinition } from "@funktechno/little-mermaid-2-the-sql/lib/src/types";
import { PartialOpenApiSchema } from "openapi-json-schema";
import { pluginVersion } from "./constants";
import { JSONSchema4, JSONSchema4TypeName } from "json-schema";
import { DatabaseModelResult } from "../types/sql-plugin-types";

/**
 * convert db to openapi
 * @param db
 * @returns
 */
export function dbToOpenApi(db: DatabaseModelResult): PartialOpenApiSchema {
  const result: PartialOpenApiSchema = {
    openapi: "3.0.0",
    info: {
      // drawio file name?
      title: "drawio nosql export",
      version: pluginVersion,
      "x-comment": "Generated by from drawio uml using plugin nosql",
    },
    paths: {},
    components: {
      schemas: {},
    },
  };
  const schema: JSONSchema4 = {};
  const entities = db.getEntities();
  for (const key in entities) {
    if (Object.prototype.hasOwnProperty.call(entities, key)) {
      const entity = entities[key];
      if (schema[key]) {
        continue;
      }
      schema[key] = {
        type: "object",
        title: key,
        additionalProperties: false,
        properties: {},
      };
      for (let p = 0; p < entity.attributes.length; p++) {
        const attribute = entity.attributes[p];
        const propName = attribute.attributeName;
        if (!propName || schema[key].properties[propName]) {
          continue;
        }
        const attType = attribute.attributeType?.split(" ") ?? [];
        const property: JSONSchema4 = {
          title: `${key}.${propName}`,
          nullable: attribute.attributeType?.includes("nullable") ?? false,
          type: (attType[0] ?? "string") as JSONSchema4TypeName,
        };
        schema[key].properties[attribute.attributeName!] = property;
      }
    }
  }
  result.components!.schemas = schema;
  return result;
}