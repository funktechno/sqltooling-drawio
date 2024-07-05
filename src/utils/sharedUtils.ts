import { DbDefinition, DbRelationshipDefinition } from "@funktechno/little-mermaid-2-the-sql/lib/src/types";
import { ColumnQuantifiers, DatabaseModelResult, TableAttribute, TableEntity } from "../types/sql-plugin-types";

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


/**
 * generate db from drawio graph models
 * @param ui 
 * @param type 
 * @returns 
 */
export function getMermaidDiagramDb(ui: DrawioUI, type: "mysql" | "sqlserver" | "sqlite" | "postgres" | "ts" | "openapi" | undefined): DatabaseModelResult{
    const model = ui.editor.graph.getModel();
    // same models from mermaid for diagram relationships
    // only difference is entities is an array rather than object to allow duplicate tables
    const entities: Record<string,TableEntity> = {};
    const relationships: DbRelationshipDefinition[] = [];
    // build models
    for (const key in model.cells) {
        if (Object.hasOwnProperty.call(model.cells, key)) {
            const mxcell = model.cells[key];
            if(mxcell.mxObjectId.indexOf("mxCell") !== -1) {
                if(mxcell.style && mxcell.style.trim().startsWith("swimlane;")){
                    const entity: TableEntity = {
                        name: RemoveNameQuantifiers(mxcell.value),
                        attributes: [] as TableAttribute[],
                    };
                    for (let c = 0; c < mxcell.children.length; c++) {
                        const col = mxcell.children[c];
                        if(col.mxObjectId.indexOf("mxCell") !== -1) {
                            if(col.style && col.style.trim().startsWith("shape=partialRectangle")){
                                const columnQuantifiers = GetColumnQuantifiers(type);
                                //Get delimiter of column name
                                //Get full name
                                const attribute = getDbLabel(col.value, columnQuantifiers);
                                const attributeKeyType = col.children.find(x=> ["FK","PK"].findIndex(k => k== x.value.toUpperCase()) !== -1 ||
                                    x.value.toUpperCase().indexOf("PK,")!=-1);
                                if(attributeKeyType){
                                    attribute.attributeKeyType = attributeKeyType.value;
                                    if(attribute.attributeKeyType != "PK" && attribute.attributeKeyType.indexOf("PK") != -1){
                                        attribute.attributeKeyType = "PK";
                                    }
                                }
                                entity.attributes.push(attribute);
                                if(col.edges && col.edges.length){
                                    // check for edges foreign keys
                                    for (let e = 0; e < col.edges.length; e++) {
                                        const edge = col.edges[e];
                                        if(edge.mxObjectId.indexOf("mxCell") !== -1) {
                                            if(edge.style && edge.style.indexOf("endArrow=") != -1 && edge.source && 
                                                edge.source.value && edge.target && edge.target.value){
                                                    // need to check if end is open or certain value to determin relationship type
                                                    // extract endArrow txt
                                                    // check if both match and contain many or open
                                                    // if both match and are many then create a new table
                                                    const endCheck = "endArrow=";
                                                    const endArr = edge.style.indexOf(endCheck) != -1 ?
                                                    edge.style.substring(edge.style.indexOf(endCheck) + endCheck.length, edge.style.substring(edge.style.indexOf(endCheck) + endCheck.length).indexOf(";") + edge.style.indexOf(endCheck) + endCheck.length)
                                                    : "";
                                                    const startCheck = "startArrow=";
                                                    const startArr = edge.style.indexOf(startCheck) != -1 ?
                                                    edge.style.substring(edge.style.indexOf(startCheck) + startCheck.length, edge.style.substring(edge.style.indexOf(startCheck) + startCheck.length).indexOf(";") + edge.style.indexOf(startCheck) + startCheck.length)
                                                    : "";

                                                    const manyCheck = ["open","many"];
                                                    const sourceIsPrimary = endArr && manyCheck
                                                    .findIndex(x => endArr.toLocaleLowerCase().indexOf(x)!=-1) != -1;
                                                    const targetIsPrimary = startArr && manyCheck
                                                        .findIndex(x => startArr.toLocaleLowerCase().indexOf(x)!=-1) != -1;
                                                    // has to be one to many and not one to one
                                                    if((targetIsPrimary || sourceIsPrimary) &&
                                                        !(targetIsPrimary && sourceIsPrimary)
                                                    ){
                                                        let sourceId = edge.source.value;
                                                        const sourceAttr = getDbLabel(sourceId, columnQuantifiers);
                                                        sourceId = sourceAttr.attributeName;
                                                        const sourceEntity = RemoveNameQuantifiers(edge.source.parent.value);
                                                        let targetId = edge.target.value;
                                                        const targetAttr = getDbLabel(targetId, columnQuantifiers);
                                                        targetId = targetAttr.attributeName;
                                                        const targetEntity = RemoveNameQuantifiers(edge.target.parent.value);
                                                        // entityA primary
                                                        // entityB foreign
                                                        const relationship: DbRelationshipDefinition = {
                                                            entityA: sourceIsPrimary ? sourceEntity : targetEntity,
                                                            entityB: sourceIsPrimary ? targetEntity : sourceEntity,
                                                            // based off of styles?
                                                            relSpec: {
                                                                cardA: "ZERO_OR_MORE",
                                                                cardB: "ONLY_ONE",
                                                                relType: "IDENTIFYING"
                                                            },
                                                            roleA: sourceIsPrimary ? 
                                                                `[${sourceEntity}.${sourceId}] to [${targetEntity}.${targetId}]` : 
                                                                `[${targetEntity}.${targetId}] to [${sourceEntity}.${sourceId}]`
                                                        };
                                                        // check that is doesn't already exist
                                                        const exists = relationships.findIndex(r => r.entityA == relationship.entityA && r.entityB == relationship.entityB && r.roleA == relationship.roleA);
                                                        if(exists ==-1){
                                                            relationships.push(relationship);
                                                        }
                                                    } else if(targetIsPrimary && sourceIsPrimary){
                                                        // add a new many to many table
                                                        let sourceId = edge.source.value;
                                                        const sourceAttr = getDbLabel(sourceId, columnQuantifiers);
                                                        sourceAttr.attributeKeyType = "PK";
                                                        sourceId = sourceAttr.attributeName;
                                                        const sourceEntity = RemoveNameQuantifiers(edge.source.parent.value);
                                                        let targetId = edge.target.value;
                                                        const targetAttr = getDbLabel(targetId, columnQuantifiers);
                                                        targetAttr.attributeKeyType = "PK";
                                                        targetId = targetAttr.attributeName;
                                                        const targetEntity = RemoveNameQuantifiers(edge.target.parent.value);
                                                        const compositeEntity = {
                                                            name: RemoveNameQuantifiers(sourceEntity) + "_" + RemoveNameQuantifiers(targetEntity),
                                                            attributes: [sourceAttr, targetAttr]
                                                        };
                                                        // add composite entity
                                                        if(entities[compositeEntity.name]){
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
                                                                relType: "IDENTIFYING"
                                                            },
                                                            roleA: `[${sourceEntity}.${sourceId}] to [${compositeEntity.name}.${sourceId}]`
                                                        };
                                                        // check that is doesn't already exist
                                                        let exists = relationships.findIndex(r => r.entityA == relationship.entityA && r.entityB == relationship.entityB && r.roleA == relationship.roleA);
                                                        if(exists ==-1){
                                                            relationships.push(relationship);
                                                        }
                                                        const relationship2 = {
                                                            entityA: targetEntity,
                                                            entityB: compositeEntity.name,
                                                            // based off of styles?
                                                            relSpec: {
                                                                cardA: "ZERO_OR_MORE",
                                                                cardB: "ONLY_ONE",
                                                                relType: "IDENTIFYING"
                                                            },
                                                            roleA: `[${targetEntity}.${targetId}] to [${compositeEntity.name}.${targetId}]`
                                                        };
                                                        // check that is doesn't already exist
                                                        exists = relationships.findIndex(r => r.entityA == relationship2.entityA && r.entityB == relationship2.entityB && r.roleA == relationship2.roleA);
                                                        if(exists ==-1){
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
                    if(entities[entity.name]){
                        let count = 2;
                        while(entities[entity.name + count.toString()]){
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

export function GenerateDatabaseModel(entities: Record<string, TableEntity>, relationships: DbRelationshipDefinition[]) {
    class DatabaseModel{
        constructor(entities: Record<string, TableEntity>, relationships: DbRelationshipDefinition[]){
            this.entities = entities;
            this.relationships = relationships;
        }
        
        private entities: Record<string, TableEntity>;
        
        private relationships: DbRelationshipDefinition[];

        getEntities(){
            return this.entities;
        }

        getRelationships(){
            return this.relationships;
        }
    }

    const db:DatabaseModelResult = new DatabaseModel(entities, relationships);

    return db;
}