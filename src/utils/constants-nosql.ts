import { pluginVersion } from "./constants";

export const defaultReset = `/*\n\tDrawio default value\n\tPlugin: nosql\n\tVersion: ${pluginVersion}\n*/\n\n
export interface WeatherForecast {
  /** @format date-time */
  date?: string;
  /** @format int32 */
  temperatureC?: number;
  /** @format int32 */
  temperatureF?: number;
  summary?: string | null;
  nestedProp: string[];
  children?: Child[];
}

export interface Child {
  name: string
}
    `;

export const defaultResetOpenApi = `
{
  "openapi": "3.0.0",
  "info": {
    "title": "nosql plugin sample",
    "version": "${pluginVersion}",
    "x-comment": "Generated by core-types-json-schema (https://github.com/grantila/core-types-json-schema)"
  },
  "paths": {},
  "components": {
    "schemas": {
      "WeatherForecast": {
        "properties": {
          "date": {
            "title": "WeatherForecast.date",
            "description": "@format date-time",
            "type": "string"
          },
          "temperatureC": {
            "title": "WeatherForecast.temperatureC",
            "description": "@format int32",
            "type": "number"
          },
          "temperatureF": {
            "title": "WeatherForecast.temperatureF",
            "description": "@format int32",
            "type": "number"
          },
          "summary": {
            "title": "WeatherForecast.summary",
            "nullable": true,
            "type": "string"
          },
          "nestedProp": {
            "items": {
              "title": "WeatherForecast.nestedProp.[]",
              "type": "string"
            },
            "title": "WeatherForecast.nestedProp",
            "type": "array"
          },
          "child": {
            "$ref": "#/components/schemas/Child",
            "title": "WeatherForecast.child"
          }
        },
        "required": [
          "nestedProp"
        ],
        "additionalProperties": false,
        "title": "WeatherForecast",
        "type": "object"
      },
      "Child": {
        "properties": {
          "name": {
            "title": "Child.name",
            "type": "string"
          }
        },
        "required": [
          "name"
        ],
        "additionalProperties": false,
        "title": "Child",
        "type": "object"
      }
    }
  }
}
    `;