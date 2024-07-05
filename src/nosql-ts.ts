import { DbDefinition, DbRelationshipDefinition } from "@funktechno/little-mermaid-2-the-sql/lib/src/types";
import { DatabaseModelResult, TableAttribute, TableEntity } from "./types/sql-plugin-types";
import { DatabaseModel, ForeignKeyModel, PrimaryKeyModel, PropertyModel, TableModel } from "@funktechno/sqlsimpleparser/lib/types";
import { JSONSchema4, JSONSchema4TypeName } from "json-schema";
import { convertCoreTypesToJsonSchema, convertOpenApiToCoreTypes, jsonSchemaDocumentToOpenApi } from "core-types-json-schema";
import { JsonSchemaDocumentToOpenApiOptions, PartialOpenApiSchema } from "openapi-json-schema";
import { convertTypeScriptToCoreTypes } from "core-types-ts/dist/lib/ts-to-core-types";
import { convertCoreTypesToTypeScript } from "core-types-ts";
import { GetColumnQuantifiers, RemoveNameQuantifiers, dbTypeEnds, getDbLabel, getMermaidDiagramDb } from "./utils/sharedUtils";
import { pluginVersion } from "./utils/constants";
import { dbToOpenApi } from "./utils/nosqlUtils";

declare const window: Customwindow;

/**
 * SQL Tools Plugin for importing and exporting typescript interfaces.
 * Version: <VERSION>
 */
Draw.loadPlugin(function(ui) {

    //Create Base div
    const divGenSQL = document.createElement("div");
    divGenSQL.style.userSelect = "none";
    divGenSQL.style.overflow = "hidden";
    divGenSQL.style.padding = "10px";
    divGenSQL.style.height = "100%";

    const sqlInputGenSQL = document.createElement("textarea");
    sqlInputGenSQL.style.height = "200px";
    sqlInputGenSQL.style.width = "100%";
    const sqlExportDefault = "-- click a nosql type button";
    sqlInputGenSQL.value = sqlExportDefault;
    mxUtils.br(divGenSQL);
    divGenSQL.appendChild(sqlInputGenSQL);
    const theMenuExportAs = ui.menus.get("exportAs");
    let buttonLabel = "tonosql=To NoSQL";
    // vscode extension support
    // FIXME: not compatible with vscode getting unexpected syntax error
    if(!(theMenuExportAs && !window.VsCodeApi)) {
        buttonLabel = "tonosql=Export As NoSQL";
    }
    // Extends Extras menu
    mxResources.parse(buttonLabel);

    const wndGenSQL = new mxWindow(mxResources.get("tonosql"), divGenSQL, document.body.offsetWidth - 480, 140,
        320, 320, true, true);
    wndGenSQL.destroyOnClose = false;
    wndGenSQL.setMaximizable(false);
    wndGenSQL.setResizable(false);
    wndGenSQL.setClosable(true);

    function generateNoSql(type: "ts" | "openapi" | undefined) {
        // get diagram model
        const db = getMermaidDiagramDb(ui, type);
        const openapi = dbToOpenApi(db);
        let result = "";
        if(type == "ts"){
            
            const { data: doc } = convertOpenApiToCoreTypes( openapi );
            const { data: sourceCode } = convertCoreTypesToTypeScript( doc );
            result = `/*\n\tGenerated in drawio\n\tDatabase: ${type}\n\tPlugin: nosql\n\tVersion: ${pluginVersion}\n*/\n\n` + result;
            result += sourceCode;
        
        } else if(type == "openapi"){
           result = JSON.stringify(openapi, null, 2);
        }
        sqlInputGenSQL.value = result;
    };

    mxUtils.br(divGenSQL);

    const resetBtnGenSQL = mxUtils.button(mxResources.get("reset"), function() {
        sqlInputGenSQL.value = sqlExportDefault;
    });

    resetBtnGenSQL.style.marginTop = "8px";
    resetBtnGenSQL.style.marginRight = "4px";
    resetBtnGenSQL.style.padding = "4px";
    divGenSQL.appendChild(resetBtnGenSQL);

    let btnGenSQL_ts = mxUtils.button("TS", function() {
        generateNoSql("ts");
    });

    btnGenSQL_ts.style.marginTop = "8px";
    btnGenSQL_ts.style.padding = "4px";
    divGenSQL.appendChild(btnGenSQL_ts);

    btnGenSQL_ts = mxUtils.button("OpenAPI", function() {
        generateNoSql("openapi");
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

    const sqlInputFromNOSQL = document.createElement("textarea");
    sqlInputFromNOSQL.style.height = "200px";
    sqlInputFromNOSQL.style.width = "100%";
    const defaultReset = `/*\n\tDrawio default value\n\tPlugin: nosql\n\tVersion: ${pluginVersion}\n*/\n\n
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

    sqlInputFromNOSQL.value = defaultReset;
    mxUtils.br(divFromNOSQL);
    divFromNOSQL.appendChild(sqlInputFromNOSQL);

    // const graph = ui.editor.graph;

    // Extends Extras menu
    mxResources.parse("fromNoSql=From NoSQL");

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

    };

    function parseFromInput(text: string, type?: "ts" | "openapi" | undefined) {
        // reset values
        cells = [];
        tableCell = null;
        rowCell = null;
        try {
            let openApi: PartialOpenApiSchema|null = null;
            const openApiOptions: JsonSchemaDocumentToOpenApiOptions = {
                title: "nosql default options",
                version: pluginVersion
            };
            if(type == "openapi"){
                // should already be a json, but going to serialize to openapi for validation
                const data = JSON.parse(text);
                const { data: doc } = convertOpenApiToCoreTypes( data );
                const { data: jsonSchema } = convertCoreTypesToJsonSchema( doc );
                openApi = jsonSchemaDocumentToOpenApi( jsonSchema, openApiOptions );
            } else if(type == "ts"){
                // serialize typescript classes to openapi spec
                const { data: doc } = convertTypeScriptToCoreTypes( text );
                const { data: jsonSchema } = convertCoreTypesToJsonSchema( doc );
                openApi = jsonSchemaDocumentToOpenApi( jsonSchema, openApiOptions );
            }
            const schemas  = openApi?.components?.schemas;
            if(schemas){
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
                            Name: dbTypeEnds(key),
                            Properties: [],
                        };
                        for (const propertyKey in schema.properties) {
                            if (Object.prototype.hasOwnProperty.call(schema.properties, propertyKey)) {
                                const property = schema.properties[propertyKey];
                                const propertyModel: PropertyModel = GeneratePropertyModel(key, propertyKey, property);
                                if(propertyModel.ColumnProperties.includes("object") || 
                                    propertyModel.ColumnProperties.includes("array")) {
                                    let refName: string| null | undefined= null;
                                    if(property.$ref) {
                                        refName = property.$ref.split("/").pop();
                                    } else if(property.items && typeof property.items == "object") {
                                        refName = (property.items as JSONSchema4).$ref?.split("/").pop();
                                    }
                                    if(refName) {
                                        
                                        const primaryKeyModel: ForeignKeyModel = {
                                            PrimaryKeyTableName: dbTypeEnds(key),
                                            ReferencesTableName: dbTypeEnds(refName),
                                            PrimaryKeyName: dbTypeEnds(propertyKey),
                                            // should just point to first property in uml table
                                            ReferencesPropertyName: "",
                                            IsDestination: false
                                        };
                                        const foreignKeyModel: ForeignKeyModel = {
                                            ReferencesTableName: dbTypeEnds(key),
                                            PrimaryKeyTableName: dbTypeEnds(refName),
                                            ReferencesPropertyName: dbTypeEnds(propertyKey),
                                            // should just point to first property in uml table
                                            PrimaryKeyName: "",
                                            IsDestination: true
                                        };
                                        models.ForeignKeyList.push(foreignKeyModel);
                                        models.ForeignKeyList.push(primaryKeyModel);
                                        propertyModel.IsForeignKey = true;
                                    }
                                }
                                
                                tableModel.Properties.push(propertyModel);
                            }
                        }

                        models.TableList.push(tableModel);
                    }
                }
                for (let i = 0; i < models.ForeignKeyList.length; i++) {
                    const fk = models.ForeignKeyList[i];
                    if(!fk.ReferencesPropertyName){
                        // match to first entry
                        const property = models.TableList.find(t => t.Name == fk.ReferencesTableName)?.Properties[0];
                        if(property){
                            models.ForeignKeyList[i].ReferencesPropertyName = property.Name;
                        }
                    }
                    if(!fk.PrimaryKeyName){
                        // match to first entry
                        const property = models.TableList.find(t => t.Name == fk.PrimaryKeyTableName)?.Properties[0];
                        if(property){
                            models.ForeignKeyList[i].PrimaryKeyName = property.Name;
                        }
                    }
                    
                }
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
            // const pt = graph.getFreeInsertPoint();
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
                                                if(isPrimaryTable && dbTypeEnds(attribute.attributeName) == fk.PrimaryKeyName){
                                                    targetCell = col;
                                                    break;
                                                } else if(isForeignTable && dbTypeEnds(attribute.attributeName) == fk.ReferencesPropertyName){
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

    const resetBtnFromNOSQL = mxUtils.button(mxResources.get("Reset TS"), function() {
        sqlInputFromNOSQL.value = defaultReset;
    });

    resetBtnFromNOSQL.style.marginTop = "8px";
    resetBtnFromNOSQL.style.marginRight = "4px";
    resetBtnFromNOSQL.style.padding = "4px";
    divFromNOSQL.appendChild(resetBtnFromNOSQL);

    const resetOpenAPIBtnFromNOSQL = mxUtils.button("Reset OpenAPI", function() {
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
        const oldMenuExportAs = theMenuExportAs.funct;

        theMenuExportAs.funct = function(...args) {
            const [menu, parent] = args;
            oldMenuExportAs.apply(this, args);
            ui.menus.addMenuItems(menu, ["tonosql"], parent);
        };
    } else {
        // vscode file export sql menu
	    const menu = ui.menus.get("file");
        if(menu && menu.enabled) {
            const oldMenuExportAs = menu.funct;
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
        Name: dbTypeEnds(propertyName),
        IsPrimaryKey: false,
        IsForeignKey: false,
        ColumnProperties: columnProperties,
        TableName: dbTypeEnds(tableName),
        ForeignKey: [],
    };
    return result;
}

