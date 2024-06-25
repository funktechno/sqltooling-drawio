import { ColumnQuantifiers, TableAttribute } from "../types/sql-plugin-types";

/**
 * return text quantifiers for dialect
 * @returns json
 */
export function GetColumnQuantifiers(
  type:
    | "mysql"
    | "sqlserver"
    | "sqlite"
    | "postgres"
    | "openapi"
    | "ts"
    | undefined
): ColumnQuantifiers {
  const chars = {
    Start: "\"",
    End: "\"",
  };
  if (type && ["mysql", "ts", "openapi"].includes(type)) {
    chars.Start = "`";
    chars.End = "`";
  } else if (type == "sqlserver") {
    chars.Start = "[";
    chars.End = "]";
  }
  return chars;
}

/**
 * sometimes rows have spans or styles, an attempt to remove them
 * @param {*} label
 * @returns
 */
export function removeHtml(label: string) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = label;
  const text = tempDiv.textContent || tempDiv.innerText || "";
  tempDiv.remove();
  return text;
}

export function dbTypeEnds(label: string): string {
  const char1 = "`";
  const char2 = "`";
  // if (type == "mysql") {
  //   char1 = "`";
  //   char2 = "`";
  // }
  return `${char1}${label}${char2}`;
}

export function RemoveNameQuantifiers(name: string) {
  return name.replace(/\[|\]|\(|\"|\'|\`/g, "").trim();
}

/**
 * extract row column attributes
 * @param {*} label
 * @param {*} columnQuantifiers
 * @returns
 */
export function getDbLabel(
  label: string,
  columnQuantifiers: ColumnQuantifiers
): TableAttribute {
  let result = removeHtml(label);
  // fix duplicate spaces and different space chars
  result = result.toString().replace(/\s+/g, " ");
  const firstSpaceIndex =
    result[0] == columnQuantifiers.Start &&
    result.indexOf(columnQuantifiers.End + " ") !== -1
      ? result.indexOf(columnQuantifiers.End + " ")
      : result.indexOf(" ");
  const attributeType = result.substring(firstSpaceIndex + 1).trim();
  const attributeName = RemoveNameQuantifiers(
    result.substring(0, firstSpaceIndex + 1)
  );
  const attribute = {
    attributeName,
    attributeType,
  };
  return attribute;
}
