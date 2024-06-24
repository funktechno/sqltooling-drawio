console.log("starting nosql plugin");
import { DbParser } from "@funktechno/little-mermaid-2-the-sql/lib/src/generate-sql-ddl";
import { DbDefinition, DbRelationshipDefinition } from "@funktechno/little-mermaid-2-the-sql/lib/src/types";
import { ColumnQuantifiers, TableAttribute, TableEntity } from "./types/sql-plugin-types";
// import { SqlSimpleParser } from "@funktechno/sqlsimpleparser";
import { DatabaseModel, ForeignKeyModel, PrimaryKeyModel, PropertyModel, TableModel } from "@funktechno/sqlsimpleparser/lib/types";
import { JSONSchema4 } from "json-schema";
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

// // sibling-module.js is a CommonJS module.
// const siblingModule = require('./sibling-module');


// import {
//     getTypeScriptReader,
//     getOpenApiWriter,
//     makeConverter,
//     getTypeScriptWriter,
//     getOpenApiReader,
//   } from "typeconv";
// import { convertTypeScriptToCoreTypes } from "core-types-ts";
import { convertCoreTypesToJsonSchema, convertOpenApiToCoreTypes, jsonSchemaDocumentToOpenApi } from "core-types-json-schema";
import { JsonSchemaDocumentToOpenApiOptions, PartialOpenApiSchema } from "openapi-json-schema";
import { convertTypeScriptToCoreTypes } from "core-types-ts/dist/lib/ts-to-core-types";
// import { convertCoreTypesToJsonSchema } from "core-types-json-schema/dist/lib/core-types-to-json-schema";
// import {
//     JsonSchemaDocumentToOpenApiOptions,
//     jsonSchemaDocumentToOpenApi,
//     openApiToJsonSchema,
// } from "openapi-json-schema";

declare const window: Customwindow;

/**
 * SQL Tools Plugin for importing and exporting typescript interfaces.
 * Version: <VERSION>
 */

Draw.loadPlugin(function(ui) {
    console.log("loading nosql plugin");

    // export sql methods
    const pluginVersion = "<VERSION>";

    //Create Base div
    const divGenSQL = document.createElement("div");
    divGenSQL.style.userSelect = "none";
    divGenSQL.style.overflow = "hidden";
    divGenSQL.style.padding = "10px";
    divGenSQL.style.height = "100%";

    const sqlInputGenSQL = document.createElement("textarea");
    sqlInputGenSQL.style.height = "200px";
    sqlInputGenSQL.style.width = "100%";
    const sqlExportDefault = "-- click a database type button";
    sqlInputGenSQL.value = sqlExportDefault;
    mxUtils.br(divGenSQL);
    divGenSQL.appendChild(sqlInputGenSQL);
    const theMenuExportAs = ui.menus.get("exportAs");
    let buttonLabel = "tonosql=To TS";
    // vscode extension support
    if(!(theMenuExportAs && !window.VsCodeApi)) {
        buttonLabel = "tonosql=Export As TS";
    }
    // Extends Extras menu
    mxResources.parse(buttonLabel);

    const wndGenSQL = new mxWindow(mxResources.get("tonosql"), divGenSQL, document.body.offsetWidth - 480, 140,
        320, 320, true, true);
    wndGenSQL.destroyOnClose = false;
    wndGenSQL.setMaximizable(false);
    wndGenSQL.setResizable(false);
    wndGenSQL.setClosable(true);

    /**
     * return text quantifiers for dialect
     * @returns json
     */
    function GetColumnQuantifiers(type: "ts" | "openapi" | undefined): ColumnQuantifiers {
        const chars = {
            Start: "\"",
            End: "\"",
        };
        // if (type == "ts") {
            chars.Start = "`";
            chars.End = "`";
        // }
        // else if (type == "sqlserver") {
        //     chars.Start = "[";
        //     chars.End = "]";
        // }
        return chars;
    }
    /**
     * sometimes rows have spans or styles, an attempt to remove them
     * @param {*} label 
     * @returns 
     */
    function removeHtml(label: string){
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = label;
        const text = tempDiv.textContent || tempDiv.innerText || "";
        tempDiv.remove();
        return text;
    }
    /**
     * extract row column attributes
     * @param {*} label 
     * @param {*} columnQuantifiers 
     * @returns 
     */
    function getDbLabel(label: string, columnQuantifiers: ColumnQuantifiers): TableAttribute{
        let result = removeHtml(label);
        // fix duplicate spaces and different space chars
        result = result.toString().replace(/\s+/g, " ");
        const firstSpaceIndex = result[0] == columnQuantifiers.Start &&
            result.indexOf(columnQuantifiers.End + " ") !== -1
            ? result.indexOf(columnQuantifiers.End + " ")
            : result.indexOf(" ");
        const attributeType = result.substring(firstSpaceIndex + 1).trim();
        const attributeName = RemoveNameQuantifiers(result.substring(0, firstSpaceIndex + 1));
        const attribute = {
            attributeName,
            attributeType
        };
        return attribute;
    }
    function RemoveNameQuantifiers(name: string) {
        return name.replace(/\[|\]|\(|\"|\'|\`/g, "").trim();
    }

    function getMermaidDiagramDb(type: "ts" | "openapi" | undefined): DbDefinition{
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
                                                            var sourceId = edge.source.value;
                                                            var sourceAttr = getDbLabel(sourceId, columnQuantifiers);
                                                            sourceId = sourceAttr.attributeName;
                                                            var sourceEntity = RemoveNameQuantifiers(edge.source.parent.value);
                                                            var targetId = edge.target.value;
                                                            var targetAttr = getDbLabel(targetId, columnQuantifiers);
                                                            targetId = targetAttr.attributeName;
                                                            var targetEntity = RemoveNameQuantifiers(edge.target.parent.value);
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
                                                            var exists = relationships.findIndex(r => r.entityA == relationship.entityA && r.entityB == relationship.entityB && r.roleA == relationship.roleA);
                                                            if(exists ==-1){
                                                                relationships.push(relationship);
                                                            }
                                                        } else if(targetIsPrimary && sourceIsPrimary){
                                                            // add a new many to many table
                                                            var sourceId = edge.source.value;
                                                            sourceAttr = getDbLabel(sourceId, columnQuantifiers);
                                                            sourceAttr.attributeKeyType = "PK";
                                                            sourceId = sourceAttr.attributeName;
                                                            var sourceEntity = RemoveNameQuantifiers(edge.source.parent.value);
                                                            var targetId = edge.target.value;
                                                            targetAttr = getDbLabel(targetId, columnQuantifiers);
                                                            targetAttr.attributeKeyType = "PK";
                                                            targetId = targetAttr.attributeName;
                                                            var targetEntity = RemoveNameQuantifiers(edge.target.parent.value);
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
                                                            var exists = relationships.findIndex(r => r.entityA == relationship.entityA && r.entityB == relationship.entityB && r.roleA == relationship.roleA);
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

        const db = new DatabaseModel(entities, relationships) as unknown as DbDefinition;

        return db;
    }

    function generateSql(type: "ts" | "openapi" | undefined) {

        // get diagram model
        const db = getMermaidDiagramDb(type);
        // load parser
        const parser = new DbParser(type as string, db);
        // generate sql
        let sql = parser.getSQLDataDefinition();
        sql = `/*\n\tGenerated in drawio\n\tDatabase: ${type}\n\tPlugin: sql\n\tVersion: ${pluginVersion}\n*/\n\n` + sql;
        sql = sql.trim();
        // update sql value in text area
        sqlInputGenSQL.value = sql;
        // TODO: use selection as well?
        const modelSelected = ui.editor.graph.getSelectionModel();
    };

    mxUtils.br(divGenSQL);

    const resetBtnGenSQL = mxUtils.button(mxResources.get("reset"), function() {
        sqlInputGenSQL.value = sqlExportDefault;
    });

    resetBtnGenSQL.style.marginTop = "8px";
    resetBtnGenSQL.style.marginRight = "4px";
    resetBtnGenSQL.style.padding = "4px";
    divGenSQL.appendChild(resetBtnGenSQL);

    const btnGenSQL_ts = mxUtils.button("TS", function() {
        generateSql("ts");
    });

    btnGenSQL_ts.style.marginTop = "8px";
    btnGenSQL_ts.style.padding = "4px";
    divGenSQL.appendChild(btnGenSQL_ts);

    // Adds action
    ui.actions.addAction("tonosql", function() {
        wndGenSQL.setVisible(!wndGenSQL.isVisible());

        if (wndGenSQL.isVisible()) {
            sqlInputGenSQL.focus();
        }
    });
    // end export sql methods

    // import diagrams from sql text methods


    //Table Info
    let foreignKeyList: ForeignKeyModel[] = [];
    let primaryKeyList: PrimaryKeyModel[] = [];
    let tableList: TableModel[] = [];
    let cells: mxCell[] = [];
    let tableCell: mxCell|null = null;
    let rowCell: mxCell|null = null;
    let dx = 0;
    let exportedTables = 0;


    //Create Base div
    const divFromNOSQL = document.createElement("div");
    divFromNOSQL.style.userSelect = "none";
    divFromNOSQL.style.overflow = "hidden";
    divFromNOSQL.style.padding = "10px";
    divFromNOSQL.style.height = "100%";

    var graph = ui.editor.graph;

    const sqlInputFromNOSQL = document.createElement("textarea");
    sqlInputFromNOSQL.style.height = "200px";
    sqlInputFromNOSQL.style.width = "100%";
    const defaultReset = `/*\n\tDrawio default value\n\tPlugin: sql\n\tVersion: ${pluginVersion}\n*/\n\n
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


    const defaultResetOpenApi = `
{
  "openapi": "3.0.0",
  "info": {
    "title": "My API",
    "version": "1.0.0",
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

    sqlInputFromNOSQL.value = defaultReset;
    mxUtils.br(divFromNOSQL);
    divFromNOSQL.appendChild(sqlInputFromNOSQL);

    var graph = ui.editor.graph;

    // Extends Extras menu
    mxResources.parse("fromNoSql=From TS");

    const wndFromNOSQL = new mxWindow(mxResources.get("fromNoSql"), divFromNOSQL, document.body.offsetWidth - 480, 140,
        320, 320, true, true);
    wndFromNOSQL.destroyOnClose = false;
    wndFromNOSQL.setMaximizable(false);
    wndFromNOSQL.setResizable(false);
    wndFromNOSQL.setClosable(true);

    function AddRow(propertyModel: PropertyModel, tableName: string) {
        
        const cellName = propertyModel.Name + (propertyModel.ColumnProperties ? " " + propertyModel.ColumnProperties: "");

        rowCell = new mxCell(cellName, new mxGeometry(0, 0, 90, 26),
            "shape=partialRectangle;top=0;left=0;right=0;bottom=0;align=left;verticalAlign=top;spacingTop=-2;fillColor=none;spacingLeft=64;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;dropTarget=0;");
        rowCell.vertex = true;

        const columnType = propertyModel.IsPrimaryKey && propertyModel.IsForeignKey ? "PK | FK" : propertyModel.IsPrimaryKey ? "PK" : propertyModel.IsForeignKey ? "FK" : "";

        const left = sb.cloneCell(rowCell, columnType);
        left.connectable = false;
        left.style = "shape=partialRectangle;top=0;left=0;bottom=0;fillColor=none;align=left;verticalAlign=middle;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=180;points=[];portConstraint=eastwest;part=1;";
        left.geometry.width = 54;
        left.geometry.height = 26;
        rowCell.insert(left);

        const size = ui.editor.graph.getPreferredSizeForCell(rowCell);
        
        if(tableCell){
            if (size !== null && tableCell.geometry.width < size.width + 10) {
                tableCell.geometry.width = size.width + 10;
            }

            tableCell.insert(rowCell);
            tableCell.geometry.height += 26;
        }

        rowCell = rowCell;

    };

    function parseFromInput(text: string, type?: "ts" | "openapi" | undefined) {
        // reset values
        cells = [];
        tableCell = null;
        rowCell = null;
        // load parser
        // const parser = new SqlSimpleParser(type);
        // const user: object = JSON.parse(text);
        debugger;
        // const reader = getTypeScriptReader( );

        // const writer = getOpenApiWriter( { format: "json", title: "My API", version: "v1" } );
        // // getTypeScriptWriter
        // // getOpenApiReader

        // const { convert } = makeConverter( reader, writer );
        // convert({ data: text })
        //     .then( ( { data } ) => {
        //     debugger;
        //     const models: any | null = null;
            
        //     if(models){ 
        //         foreignKeyList = models.ForeignKeyList;
        //         primaryKeyList = models.PrimaryKeyList;
        //         tableList = models.TableList;
        //         exportedTables = tableList.length;
        //     }

        //     //Create Table in UI
        //     CreateTableUI(type);
        //     });
        try {
            let openApi: PartialOpenApiSchema|null = null;
            const openApiOptions: JsonSchemaDocumentToOpenApiOptions = {
                title: "nosql",
                version: pluginVersion
            };
            if(type == "openapi"){
                const data = JSON.parse(text);
                const { data: doc } = convertOpenApiToCoreTypes( data );
                const { data: jsonSchema } = convertCoreTypesToJsonSchema( doc );
                
                openApi = jsonSchemaDocumentToOpenApi( jsonSchema, openApiOptions );
            } else if(type == "ts"){
               
                const { data: doc } = convertTypeScriptToCoreTypes( text );


                const { data: jsonSchema } = convertCoreTypesToJsonSchema( doc );

                openApi = jsonSchemaDocumentToOpenApi( jsonSchema, openApiOptions );
            }
            debugger;
            const schemas  = openApi?.components?.schemas;
            if(schemas){
            
                const stringOpen = JSON.stringify(openApi, null, 2);
                const models: DatabaseModel = {
                    Dialect: "nosql",
                    TableList: [],
                    PrimaryKeyList: [],
                    ForeignKeyList: [],
                };

                for (const key in schemas) {
                    if (Object.prototype.hasOwnProperty.call(schemas, key)) {
                        const schema = schemas[key] as JSONSchema4;
                        const tableModel: TableModel = {
                            Name: key,
                            Properties: [],
                        };
                        for (const propertyKey in schema.properties) {
                            if (Object.prototype.hasOwnProperty.call(schema.properties, propertyKey)) {
                                const property = schema.properties[propertyKey];
                                const propertyModel: PropertyModel = GeneratePropertyModel(key, propertyKey, property);
                                tableModel.Properties.push(propertyModel);
                                
                                if(propertyModel.ColumnProperties.includes("object")) {
                                    let refName: string| null | undefined= null;
                                    if(property.$ref) {
                                        refName = property.$ref.split("/").pop();
                                    } else if(property.items && typeof property.items == "object") {
                                        refName = (property.items as JSONSchema4).$ref?.split("/").pop();
                                    }
                                    if(refName) {
                                        const foreignKeyModel: ForeignKeyModel = {
                                            PrimaryKeyTableName: key,
                                            ReferencesTableName: refName,
                                            PrimaryKeyName: propertyKey,
                                            // should just point to first property in uml table
                                            ReferencesPropertyName: "",
                                            IsDestination: true
                                        };
                                        models.ForeignKeyList.push(foreignKeyModel);
                                    }
                                }
                            }
                        }

                        models.TableList.push(tableModel);
                    }
                }
                debugger;
                foreignKeyList = models.ForeignKeyList;
                primaryKeyList = models.PrimaryKeyList;
                tableList = models.TableList;
                exportedTables = tableList.length;
                CreateTableUI(type);
            }
         
        } catch (error) {
            console.log(`unable to serialize the response:${type}`);
            console.log(error);
        }
    };

    function CreateTableUI(type: "ts" | "openapi" | undefined) {
        tableList.forEach(function(tableModel) {
            //Define table size width
            const maxNameLenght = 100 + tableModel.Name.length;

            //Create Table
            tableCell = new mxCell(tableModel.Name, new mxGeometry(dx, 0, maxNameLenght, 26),
                "swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=26;fillColor=default;horizontalStack=0;resizeParent=1;resizeLast=0;collapsible=1;marginBottom=0;swimlaneFillColor=default;align=center;");
            tableCell.vertex = true;

            //Resize row
            if(rowCell){
            const size = ui.editor.graph.getPreferredSizeForCell(rowCell);
                if (size !== null) {
                    tableCell.geometry.width = size.width + maxNameLenght;
                }
            }

            //Add Table to cells
            cells.push(tableCell);

            //Add properties
            tableModel.Properties.forEach(function(propertyModel) {

                //Add row
                AddRow(propertyModel, tableModel.Name);
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
            const x = Math.ceil(Math.max(0, bds.x / view.scale - view.translate.x) + 4 * graph.gridSize);
            const y = Math.ceil(Math.max(0, (bds.y + bds.height) / view.scale - view.translate.y) + 4 * graph.gridSize);

            graph.setSelectionCells(graph.importCells(cells, x, y));
            // add foreign key edges
            const model = graph.getModel();
            const columnQuantifiers = GetColumnQuantifiers(type);
            const pt = graph.getFreeInsertPoint();
            foreignKeyList.forEach(function(fk){
                if(fk.IsDestination && fk.PrimaryKeyName && fk.ReferencesPropertyName && 
                    fk.PrimaryKeyTableName && fk.ReferencesTableName) {
                    const insertEdge = mxUtils.bind(this, function(targetCell, sourceCell, edge){
                        const label = "";
                        const edgeStyle = "edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERzeroToMany;startArrow=ERzeroToOne;labelBackgroundColor=none;fontFamily=Verdana;fontSize=14;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=-0.018;entryY=0.608;entryDx=0;entryDy=0;entryPerimeter=0;";
                        const edgeCell = graph.insertEdge(null, null, label || "", (edge.invert) ?
                        sourceCell : targetCell, (edge.invert) ? targetCell : sourceCell, edgeStyle);
                    });
                    const edge = {
                        invert: true
                    };
                    let targetCell = null;
                    let sourceCell = null;
                    // locate edge source and target cells
                    for (const key in model.cells) {
                        if(targetCell && sourceCell)
                            break;
                        if (Object.hasOwnProperty.call(model.cells, key)) {
                            const mxcell = model.cells[key];
                            if(mxcell.style && mxcell.style.trim().startsWith("swimlane;")){
                                const entity = {
                                    name: mxcell.value,
                                    attributes: []
                                };
                                const isPrimaryTable = entity.name == fk.PrimaryKeyTableName;
                                const isForeignTable = entity.name == fk.ReferencesTableName;
                                if(isPrimaryTable || isForeignTable){
                                    for (let c = 0; c < mxcell.children.length; c++) {
                                        if(targetCell && sourceCell)
                                            break;
                                        const col = mxcell.children[c];
                                        if(col.mxObjectId.indexOf("mxCell") !== -1) {
                                            if(col.style && col.style.trim().startsWith("shape=partialRectangle")){
                                                const attribute = getDbLabel(col.value, columnQuantifiers);
                                                if(isPrimaryTable && attribute.attributeName == fk.PrimaryKeyName){
                                                    targetCell = col;
                                                    break;
                                                } else if(isForeignTable && attribute.attributeName == fk.ReferencesPropertyName){
                                                    sourceCell = col;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }

                            }
                        }
                    }
                    if(targetCell && sourceCell)
                        insertEdge(targetCell, sourceCell, edge);
                }
            });
            graph.scrollCellToVisible(graph.getSelectionCell());
        }

        wndFromNOSQL.setVisible(false);
    };

    mxUtils.br(divFromNOSQL);

    const resetBtnFromNOSQL = mxUtils.button(mxResources.get("reset"), function() {
        sqlInputFromNOSQL.value = defaultReset;
    });

    resetBtnFromNOSQL.style.marginTop = "8px";
    resetBtnFromNOSQL.style.marginRight = "4px";
    resetBtnFromNOSQL.style.padding = "4px";
    divFromNOSQL.appendChild(resetBtnFromNOSQL);

    const resetOpenAPIBtnFromNOSQL = mxUtils.button(mxResources.get("resetOpenAPI"), function() {
        sqlInputFromNOSQL.value = defaultResetOpenApi;
    });

    resetOpenAPIBtnFromNOSQL.style.marginTop = "8px";
    resetOpenAPIBtnFromNOSQL.style.marginRight = "4px";
    resetOpenAPIBtnFromNOSQL.style.padding = "4px";
    divFromNOSQL.appendChild(resetOpenAPIBtnFromNOSQL);

    const btnFromNOSQL_ts = mxUtils.button("Insert TS", function() {
        parseFromInput(sqlInputFromNOSQL.value, "ts");
    });

    btnFromNOSQL_ts.style.marginTop = "8px";
    btnFromNOSQL_ts.style.padding = "4px";
    divFromNOSQL.appendChild(btnFromNOSQL_ts);

    const btnFromNOSQL_OpenAPI = mxUtils.button("Insert OpenAPI", function() {
        parseFromInput(sqlInputFromNOSQL.value, "openapi");
    });

    btnFromNOSQL_OpenAPI.style.marginTop = "8px";
    btnFromNOSQL_OpenAPI.style.padding = "4px";
    divFromNOSQL.appendChild(btnFromNOSQL_OpenAPI);

    // Adds action
    ui.actions.addAction("fromNoSql", function() {
        wndFromNOSQL.setVisible(!wndFromNOSQL.isVisible());

        if (wndFromNOSQL.isVisible()) {
            sqlInputFromNOSQL.focus();
        }
    });
    // end import diagrams from sql text methods

    // finalize menu buttons
    const theMenu = ui.menus.get("insert");
    if(theMenu) {
        const oldMenu = theMenu.funct;
        theMenu.funct = function(...args) {
            const [menu, parent] = args;
            oldMenu.apply(this, args);
            ui.menus.addMenuItems(menu, ["fromNoSql"], parent);
        };
    }
    if(theMenuExportAs && !window.VsCodeApi) {
        var oldMenuExportAs = theMenuExportAs.funct;

        theMenuExportAs.funct = function(...args) {
            const [menu, parent] = args;
            oldMenuExportAs.apply(this, args);
            ui.menus.addMenuItems(menu, ["tonosql"], parent);
        };
    } else {
        // vscode file export sql menu
	    const menu = ui.menus.get("file");
        if(menu && menu.enabled) {
            var oldMenuExportAs = menu.funct;
            menu.funct = function(...args) {
                const [menu, parent] = args;
                oldMenuExportAs.apply(this, args);
                ui.menus.addMenuItems(menu, ["tonosql"], parent);
            };
        }
    }
});
// TODO: may need to make recursive for when schema property items is array
function GeneratePropertyModel(tableName: string, propertyName: string, property: JSONSchema4): PropertyModel {
    let columnProperties = (property.type ?? "object").toString();
    if(property.nullable) {
        columnProperties += " nullable";
    }
    const result: PropertyModel = {
        Name: propertyName,
        IsPrimaryKey: false,
        IsForeignKey: false,
        ColumnProperties: columnProperties,
        TableName: tableName,
        ForeignKey: [],
    };
    return result;
}
