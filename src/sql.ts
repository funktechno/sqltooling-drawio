import { DbParser } from "@funktechno/little-mermaid-2-the-sql/lib/src/generate-sql-ddl";
import {
  DbDefinition,
} from "@funktechno/little-mermaid-2-the-sql/lib/src/types";
import { SqlSimpleParser } from "@funktechno/sqlsimpleparser";
import {
  ForeignKeyModel,
  PrimaryKeyModel,
  TableModel,
} from "@funktechno/sqlsimpleparser/lib/types";
import {
  CreateTableUI,
  getMermaidDiagramDb,
} from "./utils/sharedUtils";
import { pluginVersion } from "./utils/constants";
declare const window: Customwindow;

/**
 * SQL Tools Plugin for importing diagrams from SQL DDL and exporting to SQL.
 * Version: <VERSION>
 */
Draw.loadPlugin(function (ui) {
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
  if (!(theMenuExportAs && !window.VsCodeApi)) {
    buttonLabel = "tosql=Export As SQL";
  }
  // Extends Extras menu
  mxResources.parse(buttonLabel);

  const wndGenSQL = new mxWindow(
    mxResources.get("tosql"),
    divGenSQL,
    document.body.offsetWidth - 480,
    140,
    320,
    320,
    true,
    true
  );
  wndGenSQL.destroyOnClose = false;
  wndGenSQL.setMaximizable(false);
  wndGenSQL.setResizable(false);
  wndGenSQL.setClosable(true);

  function generateSql(
    type: "mysql" | "sqlserver" | "sqlite" | "postgres" | undefined
  ) {
    // get diagram model
    const db = getMermaidDiagramDb(ui, type);
    // load parser
    const parser = new DbParser(type as string, db as unknown as DbDefinition);
    // generate sql
    let sql = parser.getSQLDataDefinition();
    sql =
      `/*\n\tGenerated in drawio\n\tDatabase: ${type}\n\tPlugin: sql\n\tVersion: ${pluginVersion}\n*/\n\n` +
      sql;
    sql = sql.trim();
    // update sql value in text area
    sqlInputGenSQL.value = sql;
    // TODO: use selection as well?
    // const modelSelected = ui.editor.graph.getSelectionModel();
  }

  mxUtils.br(divGenSQL);

  const resetBtnGenSQL = mxUtils.button(mxResources.get("reset"), function () {
    sqlInputGenSQL.value = sqlExportDefault;
  });

  resetBtnGenSQL.style.marginTop = "8px";
  resetBtnGenSQL.style.marginRight = "4px";
  resetBtnGenSQL.style.padding = "4px";
  divGenSQL.appendChild(resetBtnGenSQL);

  const btnGenSQL_mysql = mxUtils.button("MySQL", function () {
    generateSql("mysql");
  });

  btnGenSQL_mysql.style.marginTop = "8px";
  btnGenSQL_mysql.style.padding = "4px";
  divGenSQL.appendChild(btnGenSQL_mysql);

  const btnGenSQL_sqlserver = mxUtils.button("SQL Server", function () {
    generateSql("sqlserver");
  });

  btnGenSQL_sqlserver.style.marginTop = "8px";
  btnGenSQL_sqlserver.style.padding = "4px";
  divGenSQL.appendChild(btnGenSQL_sqlserver);

  const btnGenSQL_postgres = mxUtils.button("PostgreSQL", function () {
    generateSql("postgres");
  });

  btnGenSQL_postgres.style.marginTop = "8px";
  btnGenSQL_postgres.style.padding = "4px";
  divGenSQL.appendChild(btnGenSQL_postgres);

  const btnGenSQL_sqlite = mxUtils.button("Sqlite", function () {
    generateSql("sqlite");
  });

  btnGenSQL_sqlite.style.marginTop = "8px";
  btnGenSQL_sqlite.style.padding = "4px";
  divGenSQL.appendChild(btnGenSQL_sqlite);

  // Adds action
  ui.actions.addAction("tosql", function () {
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
  let tableCell: mxCell | null = null;
  let rowCell: mxCell | null = null;
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
  
  // Sample SQL templates for different database types
  const sampleTemplates = {
    mysql: `/*\n\tMySQL Sample\n\tPlugin: sql\n\tVersion: ${pluginVersion}\n*/\n\nCREATE TABLE Persons (\n    PersonID INT NOT NULL AUTO_INCREMENT,\n    LastName VARCHAR(255),\n    FirstName VARCHAR(255),\n    Address VARCHAR(255),\n    City VARCHAR(255),\n    PRIMARY KEY (PersonID)\n);\n\nCREATE TABLE Orders (\n    OrderID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,\n    PersonID INT NOT NULL,\n    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)\n);`,
    
    postgres: `/*\n\tPostgreSQL Sample\n\tPlugin: sql\n\tVersion: ${pluginVersion}\n*/\n\nCREATE TABLE Persons (\n    PersonID SERIAL PRIMARY KEY,\n    LastName VARCHAR(255),\n    FirstName VARCHAR(255),\n    Address VARCHAR(255),\n    City VARCHAR(255)\n);\n\nCREATE TABLE Orders (\n    OrderID SERIAL PRIMARY KEY,\n    PersonID INTEGER NOT NULL,\n    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)\n);`,
    
    sqlserver: `/*\n\tSQL Server Sample\n\tPlugin: sql\n\tVersion: ${pluginVersion}\n*/\n\nCREATE TABLE Persons (\n    PersonID INT IDENTITY(1,1) PRIMARY KEY,\n    LastName NVARCHAR(255),\n    FirstName NVARCHAR(255),\n    Address NVARCHAR(255),\n    City NVARCHAR(255)\n);\n\nCREATE TABLE Orders (\n    OrderID INT IDENTITY(1,1) PRIMARY KEY,\n    PersonID INT NOT NULL,\n    OrderDate DATETIME2 DEFAULT GETDATE(),\n    FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)\n);`,
    
    sqlite: `/*\n\tSQLite Sample\n\tPlugin: sql\n\tVersion: ${pluginVersion}\n*/\n\nCREATE TABLE Persons (\n    PersonID INTEGER PRIMARY KEY AUTOINCREMENT,\n    LastName TEXT,\n    FirstName TEXT,\n    Address TEXT,\n    City TEXT\n);\n\nCREATE TABLE Orders (\n    OrderID INTEGER PRIMARY KEY AUTOINCREMENT,\n    PersonID INTEGER NOT NULL,\n    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)\n);`
  };

  // Database type dropdown
  const dbTypeSelect = document.createElement("select");
  dbTypeSelect.style.marginTop = "8px";
  dbTypeSelect.style.marginRight = "8px";
  dbTypeSelect.style.padding = "4px";
  
  const dbTypes = [
    { value: "mysql", label: "MySQL" },
    { value: "postgres", label: "PostgreSQL" },
    { value: "sqlserver", label: "SQL Server" },
    { value: "sqlite", label: "SQLite" }
  ];
  
  dbTypes.forEach(dbType => {
    const option = document.createElement("option");
    option.value = dbType.value;
    option.textContent = dbType.label;
    dbTypeSelect.appendChild(option);
  });
  
  // Set default to MySQL
  dbTypeSelect.value = "mysql";
  
  // Function to update SQL input based on selected database type
  function updateSampleSQL() {
    const selectedType = dbTypeSelect.value as keyof typeof sampleTemplates;
    sqlInputFromSQL.value = sampleTemplates[selectedType];
  }
  
  // Add event listener to dropdown to update sample SQL when selection changes
  dbTypeSelect.addEventListener("change", updateSampleSQL);
  
  // Initialize with MySQL sample
  sqlInputFromSQL.value = sampleTemplates.mysql;
  mxUtils.br(divFromSQL);
  divFromSQL.appendChild(sqlInputFromSQL);
  
  // Add dropdown to UI
  mxUtils.br(divFromSQL);
  divFromSQL.appendChild(dbTypeSelect);

  // Extends Extras menu
  mxResources.parse("fromSql=From SQL");

  const wndFromSQL = new mxWindow(
    mxResources.get("fromSql"),
    divFromSQL,
    document.body.offsetWidth - 480,
    140,
    320,
    320,
    true,
    true
  );
  wndFromSQL.destroyOnClose = false;
  wndFromSQL.setMaximizable(false);
  wndFromSQL.setResizable(false);
  wndFromSQL.setClosable(true);

  function parseSql(
    text: string,
    type?: "mysql" | "sqlite" | "postgres" | "sqlserver" | undefined
  ) {
    // reset values
    cells = [];
    tableCell = null;
    rowCell = null;
    // load parser
    const parser = new SqlSimpleParser(type);

    const models = parser.feed(text).WithoutEnds().WithEnds().ToModel();

    foreignKeyList = models.ForeignKeyList;
    primaryKeyList = models.PrimaryKeyList;
    tableList = models.TableList;
    exportedTables = tableList.length;

    //Create Table in UI
    const createTableResult = CreateTableUI(
      ui,
      wndFromSQL,
      tableList,
      cells,
      rowCell,
      tableCell,
      foreignKeyList,
      dx,
      type
    );
    if (createTableResult) {
      cells = createTableResult.cells;
      dx = createTableResult.dx;
      tableCell = createTableResult.tableCell;
      rowCell = createTableResult.rowCell;
    }
  }

  mxUtils.br(divFromSQL);

  const resetBtnFromSQL = mxUtils.button(mxResources.get("reset"), function () {
    updateSampleSQL();
  });

  resetBtnFromSQL.style.marginTop = "8px";
  resetBtnFromSQL.style.marginRight = "4px";
  resetBtnFromSQL.style.padding = "4px";
  divFromSQL.appendChild(resetBtnFromSQL);

  const btnFromSQL_insert = mxUtils.button("Insert", function () {
    const selectedType = dbTypeSelect.value as "mysql" | "sqlite" | "postgres" | "sqlserver" | undefined;
    parseSql(sqlInputFromSQL.value, selectedType);
  });

  btnFromSQL_insert.style.marginTop = "8px";
  btnFromSQL_insert.style.padding = "4px";
  divFromSQL.appendChild(btnFromSQL_insert);

  // Adds action
  ui.actions.addAction("fromSql", function () {
    wndFromSQL.setVisible(!wndFromSQL.isVisible());

    if (wndFromSQL.isVisible()) {
      sqlInputFromSQL.focus();
    }
  });
  // end import diagrams from sql text methods

  // finalize menu buttons
  const theMenu = ui.menus.get("insert");
  if (theMenu) {
    const oldMenu = theMenu.funct;
    theMenu.funct = function (...args) {
      const [menu, parent] = args;
      oldMenu.apply(this, args);
      ui.menus.addMenuItems(menu, ["fromSql"], parent);
    };
  }
  if (theMenuExportAs && !window.VsCodeApi) {
    const oldMenuExportAs = theMenuExportAs.funct;

    theMenuExportAs.funct = function (...args) {
      const [menu, parent] = args;
      oldMenuExportAs.apply(this, args);
      ui.menus.addMenuItems(menu, ["tosql"], parent);
    };
  } else {
    // vscode file export sql menu
    const menu = ui.menus.get("file");
    if (menu && menu.enabled) {
      const oldMenuExportAs = menu.funct;
      menu.funct = function (...args) {
        const [menu, parent] = args;
        oldMenuExportAs.apply(this, args);
        ui.menus.addMenuItems(menu, ["tosql"], parent);
      };
    }
  }
});
