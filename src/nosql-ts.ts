import {
  DbDefinition,
  DbRelationshipDefinition,
} from "@funktechno/little-mermaid-2-the-sql/lib/src/types";
import {
  DatabaseModelResult,
  TableAttribute,
  TableEntity,
} from "./types/sql-plugin-types";
import {
  DatabaseModel,
  ForeignKeyModel,
  PrimaryKeyModel,
  PropertyModel,
  TableModel,
} from "@funktechno/sqlsimpleparser/lib/types";
import { JSONSchema4, JSONSchema4TypeName } from "json-schema";
import {
  convertCoreTypesToJsonSchema,
  convertOpenApiToCoreTypes,
  jsonSchemaDocumentToOpenApi,
} from "core-types-json-schema";
import {
  JsonSchemaDocumentToOpenApiOptions,
  PartialOpenApiSchema,
} from "openapi-json-schema";
import { convertTypeScriptToCoreTypes } from "core-types-ts/dist/lib/ts-to-core-types";
import { convertCoreTypesToTypeScript } from "core-types-ts";
import {
  CreateTableUI,
  GetColumnQuantifiers,
  RemoveNameQuantifiers,
  dbTypeEnds,
  getDbLabel,
  getMermaidDiagramDb,
} from "./utils/sharedUtils";
import { pluginVersion } from "./utils/constants";
import {
  ConvertOpenApiToDatabaseModel,
  dbToOpenApi,
  GeneratePropertyModel,
} from "./utils/nosqlUtils";
import { defaultReset, defaultResetOpenApi } from "./utils/constants-nosql";

declare const window: Customwindow;

/**
 * SQL Tools Plugin for importing and exporting typescript interfaces.
 * Version: <VERSION>
 */
Draw.loadPlugin(function (ui) {
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
  if (!(theMenuExportAs && !window.VsCodeApi)) {
    buttonLabel = "tonosql=Export As NoSQL";
  }
  // Extends Extras menu
  mxResources.parse(buttonLabel);

  const wndGenSQL = new mxWindow(
    mxResources.get("tonosql"),
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

  function generateNoSql(type: "ts" | "openapi" | undefined) {
    // get diagram model
    const db = getMermaidDiagramDb(ui, type);
    const openapi = dbToOpenApi(db);
    let result = "";
    if (type == "ts") {
      const { data: doc } = convertOpenApiToCoreTypes(openapi);
      const { data: sourceCode } = convertCoreTypesToTypeScript(doc);
      result =
        `/*\n\tGenerated in drawio\n\tDatabase: ${type}\n\tPlugin: nosql\n\tVersion: ${pluginVersion}\n*/\n\n` +
        result;
      result += sourceCode;
    } else if (type == "openapi") {
      result = JSON.stringify(openapi, null, 2);
    }
    sqlInputGenSQL.value = result;
  }

  mxUtils.br(divGenSQL);

  const resetBtnGenSQL = mxUtils.button(mxResources.get("reset"), function () {
    sqlInputGenSQL.value = sqlExportDefault;
  });

  resetBtnGenSQL.style.marginTop = "8px";
  resetBtnGenSQL.style.marginRight = "4px";
  resetBtnGenSQL.style.padding = "4px";
  divGenSQL.appendChild(resetBtnGenSQL);

  let btnGenSQL_ts = mxUtils.button("TS", function () {
    generateNoSql("ts");
  });

  btnGenSQL_ts.style.marginTop = "8px";
  btnGenSQL_ts.style.padding = "4px";
  divGenSQL.appendChild(btnGenSQL_ts);

  btnGenSQL_ts = mxUtils.button("OpenAPI", function () {
    generateNoSql("openapi");
  });

  btnGenSQL_ts.style.marginTop = "8px";
  btnGenSQL_ts.style.padding = "4px";
  divGenSQL.appendChild(btnGenSQL_ts);

  // Adds action
  ui.actions.addAction("tonosql", function () {
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
  const divFromNOSQL = document.createElement("div");
  divFromNOSQL.style.userSelect = "none";
  divFromNOSQL.style.overflow = "hidden";
  divFromNOSQL.style.padding = "10px";
  divFromNOSQL.style.height = "100%";

  const sqlInputFromNOSQL = document.createElement("textarea");
  sqlInputFromNOSQL.style.height = "200px";
  sqlInputFromNOSQL.style.width = "100%";

  sqlInputFromNOSQL.value = defaultReset;
  mxUtils.br(divFromNOSQL);
  divFromNOSQL.appendChild(sqlInputFromNOSQL);

  // const graph = ui.editor.graph;

  // Extends Extras menu
  mxResources.parse("fromNoSql=From NoSQL");

  const wndFromNOSQL = new mxWindow(
    mxResources.get("fromNoSql"),
    divFromNOSQL,
    document.body.offsetWidth - 480,
    140,
    320,
    320,
    true,
    true
  );
  wndFromNOSQL.destroyOnClose = false;
  wndFromNOSQL.setMaximizable(false);
  wndFromNOSQL.setResizable(false);
  wndFromNOSQL.setClosable(true);

  function parseFromInput(text: string, type?: "ts" | "openapi" | undefined) {
    // reset values
    cells = [];
    tableCell = null;
    rowCell = null;
    try {
      let openApi: PartialOpenApiSchema | null = null;
      const openApiOptions: JsonSchemaDocumentToOpenApiOptions = {
        title: "nosql default options",
        version: pluginVersion,
      };
      if (type == "openapi") {
        // should already be a json, but going to serialize to openapi for validation
        const data = JSON.parse(text);
        const { data: doc } = convertOpenApiToCoreTypes(data);
        const { data: jsonSchema } = convertCoreTypesToJsonSchema(doc);
        // was losing format option, just going to check if exception thrown here
        jsonSchemaDocumentToOpenApi(jsonSchema, openApiOptions);
        openApi = data;
      } else if (type == "ts") {
        // serialize typescript classes to openapi spec
        const { data: doc } = convertTypeScriptToCoreTypes(text);
        const { data: jsonSchema } = convertCoreTypesToJsonSchema(doc);
        openApi = jsonSchemaDocumentToOpenApi(jsonSchema, openApiOptions);
      }
      const schemas = openApi?.components?.schemas;
      if (schemas) {
        const models = ConvertOpenApiToDatabaseModel(schemas);
        foreignKeyList = models.ForeignKeyList;
        primaryKeyList = models.PrimaryKeyList;
        tableList = models.TableList;
        exportedTables = tableList.length;
        const createTableResult = CreateTableUI(
          ui,
          wndFromNOSQL,
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
    } catch (error) {
      console.log(`unable to serialize the response:${type}`);
      console.log(error);
    }
  }

  mxUtils.br(divFromNOSQL);

  const resetBtnFromNOSQL = mxUtils.button(
    mxResources.get("Reset TS"),
    function () {
      sqlInputFromNOSQL.value = defaultReset;
    }
  );

  resetBtnFromNOSQL.style.marginTop = "8px";
  resetBtnFromNOSQL.style.marginRight = "4px";
  resetBtnFromNOSQL.style.padding = "4px";
  divFromNOSQL.appendChild(resetBtnFromNOSQL);

  const resetOpenAPIBtnFromNOSQL = mxUtils.button("Reset OpenAPI", function () {
    sqlInputFromNOSQL.value = defaultResetOpenApi;
  });

  resetOpenAPIBtnFromNOSQL.style.marginTop = "8px";
  resetOpenAPIBtnFromNOSQL.style.marginRight = "4px";
  resetOpenAPIBtnFromNOSQL.style.padding = "4px";
  divFromNOSQL.appendChild(resetOpenAPIBtnFromNOSQL);

  const btnFromNOSQL_ts = mxUtils.button("Insert TS", function () {
    parseFromInput(sqlInputFromNOSQL.value, "ts");
  });

  btnFromNOSQL_ts.style.marginTop = "8px";
  btnFromNOSQL_ts.style.padding = "4px";
  divFromNOSQL.appendChild(btnFromNOSQL_ts);

  const btnFromNOSQL_OpenAPI = mxUtils.button("Insert OpenAPI", function () {
    parseFromInput(sqlInputFromNOSQL.value, "openapi");
  });

  btnFromNOSQL_OpenAPI.style.marginTop = "8px";
  btnFromNOSQL_OpenAPI.style.padding = "4px";
  divFromNOSQL.appendChild(btnFromNOSQL_OpenAPI);

  // Adds action
  ui.actions.addAction("fromNoSql", function () {
    wndFromNOSQL.setVisible(!wndFromNOSQL.isVisible());

    if (wndFromNOSQL.isVisible()) {
      sqlInputFromNOSQL.focus();
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
      ui.menus.addMenuItems(menu, ["fromNoSql"], parent);
    };
  }
  if (theMenuExportAs && !window.VsCodeApi) {
    const oldMenuExportAs = theMenuExportAs.funct;

    theMenuExportAs.funct = function (...args) {
      const [menu, parent] = args;
      oldMenuExportAs.apply(this, args);
      ui.menus.addMenuItems(menu, ["tonosql"], parent);
    };
  } else {
    // vscode file export sql menu
    const menu = ui.menus.get("file");
    if (menu && menu.enabled) {
      const oldMenuExportAs = menu.funct;
      menu.funct = function (...args) {
        const [menu, parent] = args;
        oldMenuExportAs.apply(this, args);
        ui.menus.addMenuItems(menu, ["tonosql"], parent);
      };
    }
  }
});
