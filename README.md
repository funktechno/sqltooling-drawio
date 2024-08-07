# sqltooling-drawio
* 3rd party plugins for sql tooling in drawio
* contributions welcome

## Getting Started
* see https://github.com/ariel-bentu/tam-drawio for multiple install options
* download plugin file
    * [sql.js](https://raw.githubusercontent.com/funktechno/sqltooling-drawio/main/dist/sql.js) - import/export SQL DLLS
    * [nosql.js](https://raw.githubusercontent.com/funktechno/sqltooling-drawio/main/dist/nosql.js) - import/export openapi jsons
      * or [nosql.min.js](https://raw.githubusercontent.com/funktechno/sqltooling-drawio/main/dist/nosql.min.js)
      * you can then use the openapi.json spec to generate classes/interfaces in the language of your choosing
    * [nosql-ts.js](https://raw.githubusercontent.com/funktechno/sqltooling-drawio/main/dist/nosql-ts.js) - import/export typescript interfaces and openapi jsons (NOT vscode compatible)
      * or [nosql-ts.min.js](https://raw.githubusercontent.com/funktechno/sqltooling-drawio/main/dist/nosql-ts.min.js)
    * or clone project `git clone --branch main git@github.com:funktechno/sqltooling-drawio.git` and check `dist folder`
* vscode [Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)
    * settings.json
    ```json
    "hediet.vscode-drawio.plugins": [
    {
      "file": "xxx\\sqltooling-drawio\\dist\\sql.js"
    },
    {
      "file": "xxx\\sqltooling-drawio\\dist\\nosql.js"
    },
    ```

## Examples
* ![menu_from_sql](./assets/menu_from_sql.png)
* ![menu_from_sql](./assets/menu_export_as_to_sql.png)

## Development
* `npm install`
* `npm build:client` to update `dist/sql.js`
* `npm build:client:nosql` to update `dist/nosql.js`