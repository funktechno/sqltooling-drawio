# SQL Tooling for Draw.io

Third-party plugins for SQL tooling in Draw.io. Contributions are welcome!

## Overview

This project provides plugins that extend Draw.io with SQL and NoSQL capabilities, allowing you to:
- Import/export SQL DDLs
- Import/export OpenAPI JSONs
- Generate TypeScript interfaces
- Work with various database schemas

## Download

### Option 1: Direct Download

Download the plugin files directly from the [releases page](https://github.com/funktechno/sqltooling-drawio/releases) or use the direct links below:

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

## Installation

### VSCode Integration

For VSCode users with the [Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio) extension:

1. Download the plugin files from the [Download](#download) section above
2. Add to your `settings.json`:

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

### Desktop App Integration

It's easiest to setup in the Draw.io Desktop to use the plugin. Follow these steps:

#### Prerequisites
- Download and install [Node.js](https://nodejs.org/)

#### Setup Steps

1. **Clone or Download Draw.io Desktop**
   - **Option A (Git Clone)**: `git clone --recursive https://github.com/jgraph/drawio-desktop.git` (1 GB clone)
   - **Option B (Download ZIP)**: Download from [dev.zip](https://github.com/jgraph/drawio-desktop/archive/refs/heads/dev.zip) and unzip
   - ⚠️ **Note**: Don't download precompiled from Releases as you can't modify the plugins

2. **Install Dependencies**
   - Open command line (PowerShell, Command Prompt, Bash, Terminal)
   - Navigate to the drawio-desktop folder: `cd <path>/drawio-desktop`
   - Run: `npm install`

3. **Update SQL Plugin**
   - Update `drawio/src/main/webapp/plugins/sql.js` with changes from [this branch](https://raw.githubusercontent.com/funktechno/sqltooling-drawio/main/dist/sql.js)

4. **Run Application**
   - Execute: `npm start`

5. **Add Plugin**
   - In the running application, go to **Extras** → **Plugins** → **Add**
   - Select `sql` plugin
   - Close application and reopen
   - Plugin is now installed and ready to use

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