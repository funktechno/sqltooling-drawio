import { ColumnQuantifiers } from "../types/sql-plugin-types";

// export sql methods
export const pluginVersion = "<VERSION>";

export const commentColumnQuantifiers: ColumnQuantifiers = {
  Start: "/**",
  End: "*/",
};

export const formatKeyword = "@format";

export const enumKeyword = "enum";

export const validEnumTypes = ["string", "number", "integer", "boolean"]; 