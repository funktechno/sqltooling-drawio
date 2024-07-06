import {
  DbDefinition,
  DbRelationshipDefinition,
} from "@funktechno/little-mermaid-2-the-sql/lib/src/types";
import {
  ColumnQuantifiers,
  DatabaseModelResult,
  TableAttribute,
  TableEntity,
} from "../types/sql-plugin-types";
import { commentColumnQuantifiers, formatKeyword } from "./constants";
import {
  TableModel,
  ForeignKeyModel,
  PropertyModel,
} from "@funktechno/sqlsimpleparser/lib/types";

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
    Start: '"',
    End: '"',
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
/**
 * add db ends
 * @param label
 * @returns
 */
export function dbTypeEnds(label: string): string {
  const char1 = "`";
  const char2 = "`";
  // if (type == "mysql") {
  //   char1 = "`";
  //   char2 = "`";
  // }
  return `${char1}${label}${char2}`;
}
/**
 * remove name quantifiers
 * @param name
 * @returns
 */
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

export function entityName(description?: string, format?: string): string {
  let result = "";
  if (description) {
    result += `${description}`;
  }
  if (format) {
    result += ` ${formatKeyword} ${format}`;
  }
  if (result) {
    result = result.trim();
    result = `/** ${result} */`;
  }
  return result;
}

export function getCommentIndexes(result: string) {
  let hasComment = false;
  if (
    result.indexOf(commentColumnQuantifiers.Start) !== -1 &&
    result.indexOf(commentColumnQuantifiers.End) !== -1
  ) {
    hasComment = true;
  }
  const beforeIndex = hasComment
    ? result.indexOf(commentColumnQuantifiers.Start)
    : -1;
  const firstSpaceIndex = hasComment
    ? result.indexOf(commentColumnQuantifiers.Start) +
      commentColumnQuantifiers.Start.length
    : -1;
  const lastSpaceIndex = hasComment
    ? result.indexOf(commentColumnQuantifiers.End) - 1
    : -1;

  return {
    beforeStart: beforeIndex,
    start: firstSpaceIndex,
    end: lastSpaceIndex,
  };
}
/**
 * generate db from drawio graph models
 * @param ui
 * @param type
 * @returns
 */
export function getMermaidDiagramDb(
  ui: DrawioUI,
  type:
    | "mysql"
    | "sqlserver"
    | "sqlite"
    | "postgres"
    | "ts"
    | "openapi"
    | undefined
): DatabaseModelResult {
  const model = ui.editor.graph.getModel();
  // same models from mermaid for diagram relationships
  // only difference is entities is an array rather than object to allow duplicate tables
  const entities: Record<string, TableEntity> = {};
  const relationships: DbRelationshipDefinition[] = [];
  // TODO: support for ts and openapi enum
  // build models
  // fix fk for comments
  for (const key in model.cells) {
    if (Object.hasOwnProperty.call(model.cells, key)) {
      const mxcell = model.cells[key];
      if (mxcell.mxObjectId.indexOf("mxCell") !== -1) {
        if (mxcell.style && mxcell.style.trim().startsWith("swimlane;")) {
          let entityName = mxcell.value.toString();
          let description = "";
          let formatValue = "";
          if (
            entityName?.includes(commentColumnQuantifiers.Start) &&
            entityName?.includes(commentColumnQuantifiers.End)
          ) {
            let result = entityName.toString();
            const commentIndexes = getCommentIndexes(result);
            const firstSpaceIndex = commentIndexes.start;
            const lastSpaceIndex = commentIndexes.end;
            entityName = result.substring(0, commentIndexes.beforeStart);
            result = result.substring(firstSpaceIndex, lastSpaceIndex);
            if (result.indexOf(formatKeyword) !== -1) {
              const formatIndex = result.indexOf(formatKeyword);
              formatValue = result
                .substring(formatIndex + formatKeyword.length)
                .trim();
              result = result.substring(0, formatIndex);
            }
            if (result) {
              description = result;
            }

            // decription = attribute.attributeType?.replace("/**", "").replace("*/", "");
          }
          const entity: TableEntity = {
            name: RemoveNameQuantifiers(entityName),
            attributes: [] as TableAttribute[],
          };
          const comment = generateComment(description, formatValue);
          if (comment) {
            entity.name += ` ${comment}`;
          }
          // const comment =
          for (let c = 0; c < mxcell.children.length; c++) {
            const col = mxcell.children[c];
            if (col.mxObjectId.indexOf("mxCell") !== -1) {
              if (
                col.style &&
                col.style.trim().startsWith("shape=partialRectangle")
              ) {
                const columnQuantifiers = GetColumnQuantifiers(type);
                //Get delimiter of column name
                //Get full name
                const attribute = getDbLabel(col.value, columnQuantifiers);
                const attributeKeyType = col.children.find(
                  (x) =>
                    ["FK", "PK"].findIndex(
                      (k) => k == x.value.toUpperCase()
                    ) !== -1 || x.value.toUpperCase().indexOf("PK,") != -1
                );
                if (attributeKeyType) {
                  attribute.attributeKeyType = attributeKeyType.value;
                  if (
                    attribute.attributeKeyType != "PK" &&
                    attribute.attributeKeyType.indexOf("PK") != -1
                  ) {
                    attribute.attributeKeyType = "PK";
                  }
                }
                entity.attributes.push(attribute);
                if (col.edges && col.edges.length) {
                  // check for edges foreign keys
                  for (let e = 0; e < col.edges.length; e++) {
                    const edge = col.edges[e];
                    if (edge.mxObjectId.indexOf("mxCell") !== -1) {
                      if (
                        edge.style &&
                        edge.style.indexOf("endArrow=") != -1 &&
                        edge.source &&
                        edge.source.value &&
                        edge.target &&
                        edge.target.value
                      ) {
                        // need to check if end is open or certain value to determin relationship type
                        // extract endArrow txt
                        // check if both match and contain many or open
                        // if both match and are many then create a new table
                        const endCheck = "endArrow=";
                        const endArr =
                          edge.style.indexOf(endCheck) != -1
                            ? edge.style.substring(
                                edge.style.indexOf(endCheck) + endCheck.length,
                                edge.style
                                  .substring(
                                    edge.style.indexOf(endCheck) +
                                      endCheck.length
                                  )
                                  .indexOf(";") +
                                  edge.style.indexOf(endCheck) +
                                  endCheck.length
                              )
                            : "";
                        const startCheck = "startArrow=";
                        const startArr =
                          edge.style.indexOf(startCheck) != -1
                            ? edge.style.substring(
                                edge.style.indexOf(startCheck) +
                                  startCheck.length,
                                edge.style
                                  .substring(
                                    edge.style.indexOf(startCheck) +
                                      startCheck.length
                                  )
                                  .indexOf(";") +
                                  edge.style.indexOf(startCheck) +
                                  startCheck.length
                              )
                            : "";

                        const manyCheck = ["open", "many"];
                        const sourceIsPrimary =
                          endArr &&
                          manyCheck.findIndex(
                            (x) => endArr.toLocaleLowerCase().indexOf(x) != -1
                          ) != -1;
                        const targetIsPrimary =
                          startArr &&
                          manyCheck.findIndex(
                            (x) => startArr.toLocaleLowerCase().indexOf(x) != -1
                          ) != -1;
                        // has to be one to many and not one to one
                        if (
                          (targetIsPrimary || sourceIsPrimary) &&
                          !(targetIsPrimary && sourceIsPrimary)
                        ) {
                          let sourceId = edge.source.value;
                          const sourceAttr = getDbLabel(
                            sourceId,
                            columnQuantifiers
                          );
                          sourceId = sourceAttr.attributeName;
                          let sourceEntity = edge.source.parent.value;
                          // extract comments
                          let commentsIndexes = getCommentIndexes(sourceEntity);
                          if (
                            commentsIndexes.start != -1 &&
                            commentsIndexes.end != -1
                          ) {
                            const sourceComment = sourceEntity
                              .substring(
                                commentsIndexes.start,
                                commentsIndexes.end
                              )
                              .trim();
                            sourceEntity = sourceEntity
                              .substring(0, commentsIndexes.beforeStart)
                              .trim();
                            sourceEntity = `${RemoveNameQuantifiers(
                              sourceEntity
                            )} ${generateComment(sourceComment)}`;
                          } else {
                            sourceEntity = RemoveNameQuantifiers(sourceEntity);
                          }
                          let targetId = edge.target.value;
                          const targetAttr = getDbLabel(
                            targetId,
                            columnQuantifiers
                          );
                          targetId = targetAttr.attributeName;

                          let targetEntity = edge.target.parent.value;
                          commentsIndexes = getCommentIndexes(targetEntity);
                          if (
                            commentsIndexes.start != -1 &&
                            commentsIndexes.end != -1
                          ) {
                            const targetComment = targetEntity
                              .substring(
                                commentsIndexes.start,
                                commentsIndexes.end
                              )
                              .trim();
                            targetEntity = targetEntity
                              .substring(0, commentsIndexes.beforeStart)
                              .trim();
                            targetEntity = `${RemoveNameQuantifiers(
                              targetEntity
                            )} ${generateComment(targetComment)}`;
                          } else {
                            targetEntity = RemoveNameQuantifiers(targetEntity);
                          }
                          // const targetEntity = RemoveNameQuantifiers(
                          //   edge.target.parent.value
                          // );
                          // entityA primary
                          // entityB foreign
                          const relationship: DbRelationshipDefinition = {
                            entityA: sourceIsPrimary
                              ? sourceEntity
                              : targetEntity,
                            entityB: sourceIsPrimary
                              ? targetEntity
                              : sourceEntity,
                            // based off of styles?
                            relSpec: {
                              cardA: "ZERO_OR_MORE",
                              cardB: "ONLY_ONE",
                              relType: "IDENTIFYING",
                            },
                            roleA: sourceIsPrimary
                              ? `[${sourceEntity}.${sourceId}] to [${targetEntity}.${targetId}]`
                              : `[${targetEntity}.${targetId}] to [${sourceEntity}.${sourceId}]`,
                          };
                          // check that is doesn't already exist
                          const exists = relationships.findIndex(
                            (r) =>
                              r.entityA == relationship.entityA &&
                              r.entityB == relationship.entityB &&
                              r.roleA == relationship.roleA
                          );
                          if (exists == -1) {
                            relationships.push(relationship);
                          }
                        } else if (targetIsPrimary && sourceIsPrimary) {
                          // add a new many to many table
                          let sourceId = edge.source.value;
                          const sourceAttr = getDbLabel(
                            sourceId,
                            columnQuantifiers
                          );
                          sourceAttr.attributeKeyType = "PK";
                          sourceId = sourceAttr.attributeName;
                          const sourceEntity = RemoveNameQuantifiers(
                            edge.source.parent.value
                          );
                          let targetId = edge.target.value;
                          const targetAttr = getDbLabel(
                            targetId,
                            columnQuantifiers
                          );
                          targetAttr.attributeKeyType = "PK";
                          targetId = targetAttr.attributeName;
                          const targetEntity = RemoveNameQuantifiers(
                            edge.target.parent.value
                          );
                          const compositeEntity = {
                            name:
                              RemoveNameQuantifiers(sourceEntity) +
                              "_" +
                              RemoveNameQuantifiers(targetEntity),
                            attributes: [sourceAttr, targetAttr],
                          };
                          // add composite entity
                          if (entities[compositeEntity.name]) {
                            // DON'T add duplicate composite tables
                          } else {
                            entities[compositeEntity.name] = compositeEntity;
                          }
                          // entityA primary
                          // entityB foreign
                          const relationship = {
                            entityA: sourceEntity,
                            entityB: compositeEntity.name,
                            // based off of styles?
                            relSpec: {
                              cardA: "ZERO_OR_MORE",
                              cardB: "ONLY_ONE",
                              relType: "IDENTIFYING",
                            },
                            roleA: `[${sourceEntity}.${sourceId}] to [${compositeEntity.name}.${sourceId}]`,
                          };
                          // check that is doesn't already exist
                          let exists = relationships.findIndex(
                            (r) =>
                              r.entityA == relationship.entityA &&
                              r.entityB == relationship.entityB &&
                              r.roleA == relationship.roleA
                          );
                          if (exists == -1) {
                            relationships.push(relationship);
                          }
                          const relationship2 = {
                            entityA: targetEntity,
                            entityB: compositeEntity.name,
                            // based off of styles?
                            relSpec: {
                              cardA: "ZERO_OR_MORE",
                              cardB: "ONLY_ONE",
                              relType: "IDENTIFYING",
                            },
                            roleA: `[${targetEntity}.${targetId}] to [${compositeEntity.name}.${targetId}]`,
                          };
                          // check that is doesn't already exist
                          exists = relationships.findIndex(
                            (r) =>
                              r.entityA == relationship2.entityA &&
                              r.entityB == relationship2.entityB &&
                              r.roleA == relationship2.roleA
                          );
                          if (exists == -1) {
                            relationships.push(relationship2);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          // allows for duplicates if another table has the same name
          if (entities[entity.name]) {
            let count = 2;
            while (entities[entity.name + count.toString()]) {
              count++;
            }
            entities[entity.name + count.toString()] = entity;
          } else {
            entities[entity.name] = entity;
          }
        }
      }
    }
  }

  const db = GenerateDatabaseModel(entities, relationships);

  return db;
}
/**
 * genearte a database model
 * @param entities
 * @param relationships
 * @returns
 */
export function GenerateDatabaseModel(
  entities: Record<string, TableEntity>,
  relationships: DbRelationshipDefinition[]
) {
  class DatabaseModel {
    constructor(
      entities: Record<string, TableEntity>,
      relationships: DbRelationshipDefinition[]
    ) {
      this.entities = entities;
      this.relationships = relationships;
    }

    private entities: Record<string, TableEntity>;

    private relationships: DbRelationshipDefinition[];

    getEntities() {
      return this.entities;
    }

    getRelationships() {
      return this.relationships;
    }
  }

  const db: DatabaseModelResult = new DatabaseModel(entities, relationships);

  return db;
}
/**
 * generate a comment using description and format
 * @param description
 * @param formatValue
 * @returns
 */
export function generateComment(description?: string, formatValue?: string) {
  let result = "";
  if (description) {
    result += `${description}`;
  }
  if (formatValue) {
    result += ` ${formatKeyword} ${formatValue}`;
  }
  if (result) {
    result = result.trim();
    result = `${commentColumnQuantifiers.Start} ${result} ${commentColumnQuantifiers.End}`;
  }
  return result;
}
/**
 * create uml tables from db models
 * @param ui
 * @param wndFromInput
 * @param tableList
 * @param cells
 * @param rowCell
 * @param tableCell
 * @param foreignKeyList
 * @param dx
 * @param type
 * @returns
 */
export function CreateTableUI(
  ui: DrawioUI,
  wndFromInput: mxWindow,
  tableList: TableModel[],
  cells: mxCell[],
  rowCell: mxCell | null,
  tableCell: mxCell | null,
  foreignKeyList: ForeignKeyModel[],
  dx: number,
  type:
    | "mysql"
    | "sqlite"
    | "postgres"
    | "sqlserver"
    | "ts"
    | "openapi"
    | undefined
) {
  tableList.forEach(function (tableModel) {
    //Define table size width
    const maxNameLenght = 100 + tableModel.Name.length;

    //Create Table
    tableCell = new mxCell(
      tableModel.Name,
      new mxGeometry(dx, 0, maxNameLenght, 26),
      "swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=26;fillColor=default;horizontalStack=0;resizeParent=1;resizeLast=0;collapsible=1;marginBottom=0;swimlaneFillColor=default;align=center;"
    );
    tableCell.vertex = true;

    //Resize row
    if (rowCell) {
      const size = ui.editor.graph.getPreferredSizeForCell(rowCell);
      if (size !== null) {
        tableCell.geometry.width = size.width + maxNameLenght;
      }
    }

    //Add Table to cells
    cells.push(tableCell);

    //Add properties
    tableModel.Properties.forEach(function (propertyModel) {
      //Add row
      const addRowResult = AddRow(
        ui,
        propertyModel,
        tableModel.Name,
        rowCell,
        tableCell
      );
      if (addRowResult) {
        rowCell = addRowResult.rowCell;
        tableCell = addRowResult.tableCell;
      }
    });

    //Close table
    dx += tableCell.geometry.width + 40;
    tableCell = null;
  });

  if (cells.length > 0) {
    const graph = ui.editor.graph;
    const view = graph.view;
    const bds = graph.getGraphBounds();

    // Computes unscaled, untranslated graph bounds
    const x = Math.ceil(
      Math.max(0, bds.x / view.scale - view.translate.x) + 4 * graph.gridSize
    );
    const y = Math.ceil(
      Math.max(0, (bds.y + bds.height) / view.scale - view.translate.y) +
        4 * graph.gridSize
    );

    graph.setSelectionCells(graph.importCells(cells, x, y));
    // add foreign key edges
    const model = graph.getModel();
    const columnQuantifiers = GetColumnQuantifiers(type);
    // const pt = graph.getFreeInsertPoint();
    foreignKeyList.forEach(function (fk) {
      if (
        fk.IsDestination &&
        fk.PrimaryKeyName &&
        fk.ReferencesPropertyName &&
        fk.PrimaryKeyTableName &&
        fk.ReferencesTableName
      ) {
        const insertEdge = mxUtils.bind(
          this,
          function (targetCell, sourceCell, edge) {
            const label = "";
            const edgeStyle =
              "edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERzeroToMany;startArrow=ERzeroToOne;labelBackgroundColor=none;fontFamily=Verdana;fontSize=14;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=-0.018;entryY=0.608;entryDx=0;entryDy=0;entryPerimeter=0;";
            const edgeCell = graph.insertEdge(
              null,
              null,
              label || "",
              edge.invert ? sourceCell : targetCell,
              edge.invert ? targetCell : sourceCell,
              edgeStyle
            );
          }
        );
        const edge = {
          invert: true,
        };
        let targetCell = null;
        let sourceCell = null;
        // locate edge source and target cells
        for (const key in model.cells) {
          if (targetCell && sourceCell) break;
          if (Object.hasOwnProperty.call(model.cells, key)) {
            const mxcell = model.cells[key];
            if (mxcell.style && mxcell.style.trim().startsWith("swimlane;")) {
              const entity = {
                name: mxcell.value,
                attributes: [],
              };
              const isPrimaryTable = entity.name == fk.PrimaryKeyTableName;
              const isForeignTable = entity.name == fk.ReferencesTableName;
              if (isPrimaryTable || isForeignTable) {
                for (let c = 0; c < mxcell.children.length; c++) {
                  if (targetCell && sourceCell) break;
                  const col = mxcell.children[c];
                  if (col.mxObjectId.indexOf("mxCell") !== -1) {
                    if (
                      col.style &&
                      col.style.trim().startsWith("shape=partialRectangle")
                    ) {
                      const attribute = getDbLabel(
                        col.value,
                        columnQuantifiers
                      );
                      if (
                        isPrimaryTable &&
                        dbTypeEnds(attribute.attributeName) == fk.PrimaryKeyName
                      ) {
                        targetCell = col;
                        // allow recursion
                      }
                      if (
                        isForeignTable &&
                        dbTypeEnds(attribute.attributeName) ==
                          fk.ReferencesPropertyName
                      ) {
                        sourceCell = col;
                      }
                      if (targetCell && sourceCell) break;
                    }
                  }
                }
              }
            }
          }
        }
        if (targetCell && sourceCell) insertEdge(targetCell, sourceCell, edge);
      }
    });
    graph.scrollCellToVisible(graph.getSelectionCell());
  }

  wndFromInput.setVisible(false);
  return {
    cells,
    rowCell,
    tableCell,
    dx,
  };
}
/**
 * add row to uml table
 * @param ui
 * @param propertyModel
 * @param tableName
 * @param rowCell
 * @param tableCell
 * @returns
 */
function AddRow(
  ui: DrawioUI,
  propertyModel: PropertyModel,
  tableName: string,
  rowCell: mxCell | null,
  tableCell: mxCell | null
) {
  const cellName =
    propertyModel.Name +
    (propertyModel.ColumnProperties
      ? " " + propertyModel.ColumnProperties
      : "");

  rowCell = new mxCell(
    cellName,
    new mxGeometry(0, 0, 90, 26),
    "shape=partialRectangle;top=0;left=0;right=0;bottom=0;align=left;verticalAlign=top;spacingTop=-2;fillColor=none;spacingLeft=64;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;dropTarget=0;"
  );
  rowCell.vertex = true;

  const columnType =
    propertyModel.IsPrimaryKey && propertyModel.IsForeignKey
      ? "PK | FK"
      : propertyModel.IsPrimaryKey
      ? "PK"
      : propertyModel.IsForeignKey
      ? "FK"
      : "";

  const left = sb.cloneCell(rowCell, columnType);
  left.connectable = false;
  left.style =
    "shape=partialRectangle;top=0;left=0;bottom=0;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=180;points=[];portConstraint=eastwest;part=1;";
  left.geometry.width = 54;
  left.geometry.height = 26;
  rowCell.insert(left);

  const size = ui.editor.graph.getPreferredSizeForCell(rowCell);

  if (tableCell) {
    if (size !== null && tableCell.geometry.width < size.width + 10) {
      tableCell.geometry.width = size.width + 10;
    }

    tableCell.insert(rowCell);
    tableCell.geometry.height += 26;
  }
  return {
    rowCell,
    tableCell,
  };
}
