import { ColumnQuantifiers } from "../types/sql-plugin-types";

// export sql methods
export const pluginVersion = "<VERSION>";

export const commentColumnQuantifiers: ColumnQuantifiers = {
  Start: "/**",
  End: "*/",
};

export const formatKeyword = "@format";

export const enumKeyword = "enum";

export const nullableKeyword = "nullable";

export const arrayKeyword = "array";

export const objectKeyword = "object";
