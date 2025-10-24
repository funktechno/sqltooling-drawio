const package = require('../package.json');
const fs = require("fs");
const directoryPath = "./dist"; // Change this to your actual directory path

const files = fs.readdirSync(directoryPath);
console.log("Files in the directory:", files);

const oldText = "<VERSION>";
const version = package.version;

console.log("Updating to version " + version);

// Get current daytime in ISO format 2025-10-24
const timestamp = new Date().toISOString().split('T')[0];

files.forEach((file) => {
    const filePath = `${directoryPath}/${file}`;
    let content = fs.readFileSync(filePath, "utf8");
    let updated = false;
    while(content.includes(oldText)) {
        updated = true
        content = content.replace(oldText, version);
    }
    if(updated) {
        // content = content.replace(new RegExp(oldText, "g"), newText);
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`Replaced text in ${file}`);
    } 
    // Minified files won't have the placeholder in a readable format, so we them to first line
    // also check that the version is not already there
    const banner = `/**\n` +
                ` * File: ${file}\n` +
                ` * Version: ${version}\n` +
                ` * Generated: ${timestamp}\n` +
                ` */\n`;
    if(content.startsWith(banner)) {
        return;
    }
    content = banner + content
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Added banner to ${file}`);
});
