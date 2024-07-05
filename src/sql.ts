import { DbParser } from "@funktechno/little-mermaid-2-the-sql/lib/src/generate-sql-ddl";
import { DbDefinition, DbRelationshipDefinition } from "@funktechno/little-mermaid-2-the-sql/lib/src/types";
import { TableAttribute, TableEntity } from "./types/sql-plugin-types";
import { SqlSimpleParser } from "@funktechno/sqlsimpleparser";
import { ForeignKeyModel, PrimaryKeyModel, PropertyModel, TableModel } from "@funktechno/sqlsimpleparser/lib/types";
import { GetColumnQuantifiers, RemoveNameQuantifiers, getDbLabel, getMermaidDiagramDb } from "./utils/sharedUtils";
import { pluginVersion } from "./utils/constants";
declare const window: Customwindow;

/**
 * SQL Tools Plugin for importing diagrams from SQL DDL and exporting to SQL.
 * Version: <VERSION>
 */
Draw.loadPlugin(function(ui) {
    
    // export sql methods

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
    let buttonLabel = "tosql=To SQL";
    // vscode extension support
    if(!(theMenuExportAs && !window.VsCodeApi)) {
        buttonLabel = "tosql=Export As SQL";
    }
    // Extends Extras menu
    mxResources.parse(buttonLabel);

    const wndGenSQL = new mxWindow(mxResources.get("tosql"), divGenSQL, document.body.offsetWidth - 480, 140,
        320, 320, true, true);
    wndGenSQL.destroyOnClose = false;
    wndGenSQL.setMaximizable(false);
    wndGenSQL.setResizable(false);
    wndGenSQL.setClosable(true);

    function generateSql(type: "mysql" | "sqlserver" | "sqlite" | "postgres" | undefined) {

        // get diagram model
        const db = getMermaidDiagramDb(ui, type);
        // load parser
        const parser = new DbParser(type as string, db as unknown as DbDefinition);
        // generate sql
        let sql = parser.getSQLDataDefinition();
        sql = `/*\n\tGenerated in drawio\n\tDatabase: ${type}\n\tPlugin: sql\n\tVersion: ${pluginVersion}\n*/\n\n` + sql;
        sql = sql.trim();
        // update sql value in text area
        sqlInputGenSQL.value = sql;
        // TODO: use selection as well?
        // const modelSelected = ui.editor.graph.getSelectionModel();
    };

    mxUtils.br(divGenSQL);

    const resetBtnGenSQL = mxUtils.button(mxResources.get("reset"), function() {
        sqlInputGenSQL.value = sqlExportDefault;
    });

    resetBtnGenSQL.style.marginTop = "8px";
    resetBtnGenSQL.style.marginRight = "4px";
    resetBtnGenSQL.style.padding = "4px";
    divGenSQL.appendChild(resetBtnGenSQL);

    const btnGenSQL_mysql = mxUtils.button("MySQL", function() {
        generateSql("mysql");
    });

    btnGenSQL_mysql.style.marginTop = "8px";
    btnGenSQL_mysql.style.padding = "4px";
    divGenSQL.appendChild(btnGenSQL_mysql);

    const btnGenSQL_sqlserver = mxUtils.button("SQL Server", function() {
        generateSql("sqlserver");
    });

    btnGenSQL_sqlserver.style.marginTop = "8px";
    btnGenSQL_sqlserver.style.padding = "4px";
    divGenSQL.appendChild(btnGenSQL_sqlserver);

    const btnGenSQL_postgres = mxUtils.button("PostgreSQL", function() {
        generateSql("postgres");
    });

    btnGenSQL_postgres.style.marginTop = "8px";
    btnGenSQL_postgres.style.padding = "4px";
    divGenSQL.appendChild(btnGenSQL_postgres);

    const btnGenSQL_sqlite = mxUtils.button("Sqlite", function() {
        generateSql("sqlite");
    });

    btnGenSQL_sqlite.style.marginTop = "8px";
    btnGenSQL_sqlite.style.padding = "4px";
    divGenSQL.appendChild(btnGenSQL_sqlite);

    // Adds action
    ui.actions.addAction("tosql", function() {
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
    const divFromSQL = document.createElement("div");
    divFromSQL.style.userSelect = "none";
    divFromSQL.style.overflow = "hidden";
    divFromSQL.style.padding = "10px";
    divFromSQL.style.height = "100%";

    const sqlInputFromSQL = document.createElement("textarea");
    sqlInputFromSQL.style.height = "200px";
    sqlInputFromSQL.style.width = "100%";
    const defaultReset = `/*\n\tDrawio default value\n\tPlugin: sql\n\tVersion: ${pluginVersion}\n*/\n\nCREATE TABLE Persons\n(\n    PersonID int NOT NULL,\n    LastName constchar(255),\n    " +
    "FirstName constchar(255),\n    Address constchar(255),\n    City constchar(255),\n    Primary Key(PersonID)\n);\n\n" + 
    "CREATE TABLE Orders\n(\n    OrderID int NOT NULL PRIMARY KEY,\n    PersonID int NOT NULL,\n    FOREIGN KEY ([PersonID]) REFERENCES [Persons]([PersonID])" +
    "\n);`;

    sqlInputFromSQL.value = defaultReset;
    mxUtils.br(divFromSQL);
    divFromSQL.appendChild(sqlInputFromSQL);

    // Extends Extras menu
    mxResources.parse("fromSql=From SQL");

    const wndFromSQL = new mxWindow(mxResources.get("fromSql"), divFromSQL, document.body.offsetWidth - 480, 140,
        320, 320, true, true);
    wndFromSQL.destroyOnClose = false;
    wndFromSQL.setMaximizable(false);
    wndFromSQL.setResizable(false);
    wndFromSQL.setClosable(true);

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

    function parseSql(text: string, type?: "mysql" | "sqlite" | "postgres" | "sqlserver" | undefined) {
        // reset values
        cells = [];
        tableCell = null;
        rowCell = null;
        // load parser
        const parser = new SqlSimpleParser(type);
        

        const models = parser
            .feed(text)
            .WithoutEnds()
            .WithEnds()
            .ToModel();
        

        foreignKeyList = models.ForeignKeyList;
        primaryKeyList = models.PrimaryKeyList;
        tableList = models.TableList;
        exportedTables = tableList.length;

        //Create Table in UI
        CreateTableUI(type);
    };

    function CreateTableUI(type: "mysql" | "sqlite" | "postgres" | "sqlserver" | undefined) {
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

        wndFromSQL.setVisible(false);
    };

    mxUtils.br(divFromSQL);

    const resetBtnFromSQL = mxUtils.button(mxResources.get("reset"), function() {
        sqlInputFromSQL.value = defaultReset;
    });

    resetBtnFromSQL.style.marginTop = "8px";
    resetBtnFromSQL.style.marginRight = "4px";
    resetBtnFromSQL.style.padding = "4px";
    divFromSQL.appendChild(resetBtnFromSQL);

    const btnFromSQL_mysql = mxUtils.button("Insert MySQL", function() {
        parseSql(sqlInputFromSQL.value, "mysql");
    });

    btnFromSQL_mysql.style.marginTop = "8px";
    btnFromSQL_mysql.style.padding = "4px";
    divFromSQL.appendChild(btnFromSQL_mysql);

    const btnFromSQL_sqlserver = mxUtils.button("Insert SQL Server", function() {
        parseSql(sqlInputFromSQL.value, "sqlserver");
    });

    btnFromSQL_sqlserver.style.marginTop = "8px";
    btnFromSQL_sqlserver.style.padding = "4px";
    divFromSQL.appendChild(btnFromSQL_sqlserver);

    const btnFromSQL_postgres = mxUtils.button("Insert PostgreSQL", function() {
        parseSql(sqlInputFromSQL.value, "postgres");
    });

    btnFromSQL_postgres.style.marginTop = "8px";
    btnFromSQL_postgres.style.padding = "4px";
    divFromSQL.appendChild(btnFromSQL_postgres);

    const btnFromSQL_sqlite = mxUtils.button("Insert Sqlite", function() {
        parseSql(sqlInputFromSQL.value, "sqlite");
    });

    btnFromSQL_sqlite.style.marginTop = "8px";
    btnFromSQL_sqlite.style.padding = "4px";
    divFromSQL.appendChild(btnFromSQL_sqlite);

    // Adds action
    ui.actions.addAction("fromSql", function() {
        wndFromSQL.setVisible(!wndFromSQL.isVisible());

        if (wndFromSQL.isVisible()) {
            sqlInputFromSQL.focus();
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
            ui.menus.addMenuItems(menu, ["fromSql"], parent);
        };
    }
    if(theMenuExportAs && !window.VsCodeApi) {
        const oldMenuExportAs = theMenuExportAs.funct;

        theMenuExportAs.funct = function(...args) {
            const [menu, parent] = args;
            oldMenuExportAs.apply(this, args);
            ui.menus.addMenuItems(menu, ["tosql"], parent);
        };
    } else {
        // vscode file export sql menu
	    const menu = ui.menus.get("file");
        if(menu && menu.enabled) {
            const oldMenuExportAs = menu.funct;
            menu.funct = function(...args) {
                const [menu, parent] = args;
                oldMenuExportAs.apply(this, args);
                ui.menus.addMenuItems(menu, ["tosql"], parent);
            };
        }
    }
});