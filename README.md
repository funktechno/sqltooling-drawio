# SQL Tooling for Draw.io

Third-party plugins for SQL tooling in Draw.io. Contributions are welcome!

## Overview

This project provides plugins that extend Draw.io with SQL and NoSQL capabilities, allowing you to:
- Import/export SQL DDLs
- Import/export OpenAPI JSONs
- Generate TypeScript interfaces
- Work with various database schemas

## Installation

### Option 1: Direct Download

Download the plugin files directly:

- **[sql.js](https://raw.githubusercontent.com/funktechno/sqltooling-drawio/main/dist/sql.js)** - Import/export SQL DDLs
- **[nosql.js](https://raw.githubusercontent.com/funktechno/sqltooling-drawio/main/dist/nosql.js)** - Import/export OpenAPI JSONs
  - Alternative: [nosql.min.js](https://raw.githubusercontent.com/funktechno/sqltooling-drawio/main/dist/nosql.min.js) (minified version)
- **[nosql-ts.js](https://raw.githubusercontent.com/funktechno/sqltooling-drawio/main/dist/nosql-ts.js)** - Import/export TypeScript interfaces and OpenAPI JSONs
  - Alternative: [nosql-ts.min.js](https://raw.githubusercontent.com/funktechno/sqltooling-drawio/main/dist/nosql-ts.min.js) (minified version)
  - ⚠️ **Note**: Not VSCode compatible

### Option 2: Clone Repository

```bash
git clone --branch main git@github.com:funktechno/sqltooling-drawio.git
```

Then use the files from the `dist` folder.

### Option 3: VSCode Integration

For VSCode users with the [Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio) extension:

Add to your `settings.json`:

```json
{
  "hediet.vscode-drawio.plugins": [
    {
      "file": "path\\to\\sqltooling-drawio\\dist\\sql.js"
    },
    {
      "file": "path\\to\\sqltooling-drawio\\dist\\nosql.js"
    }
  ]
}
```

For more installation options, see [tam-drawio](https://github.com/ariel-bentu/tam-drawio).

## Features

### SQL Plugin (`sql.js`)
- Import SQL DDLs into Draw.io diagrams
- Export diagrams as SQL DDLs
- Database schema visualization

### NoSQL Plugin (`nosql.js`)
- Import/export OpenAPI JSON specifications
- Generate classes/interfaces in your preferred language using OpenAPI specs
- API documentation visualization

### TypeScript Plugin (`nosql-ts.js`)
- Import/export TypeScript interfaces
- Import/export OpenAPI JSONs
- Type-safe development workflows

## Examples

### SQL Import/Export
![SQL Import Menu](./assets/menu_from_sql.png)

### Export Options
![Export Menu](./assets/menu_export_as_to_sql.png)

## Development

### Prerequisites
- Node.js
- npm

### Setup
```bash
npm install
```

### Build Commands
- `npm run build:client:sql` - Update `dist/sql.js`
- `npm run build:client:nosql` - Update `dist/nosql.js`
- `npm run build:client:all` - Update all files in `dist/*`

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

See [LICENSE](LICENSE) file for details.