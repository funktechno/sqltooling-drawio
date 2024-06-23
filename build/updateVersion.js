const package = require('../package.json');
const fs = require("fs");
const directoryPath = "./dist"; // Change this to your actual directory path

const files = fs.readdirSync(directoryPath);
console.log("Files in the directory:", files);

const oldText = "<VERSION>";
const newText = package.VERSION;

console.log("Updating to version " + package.version);

files.forEach((file) => {
    const filePath = `${directoryPath}/${file}`;
    let content = fs.readFileSync(filePath, "utf8");
    while(content.includes(oldText)) {
        content = content.replace(oldText, package.version);
    }
    // content = content.replace(new RegExp(oldText, "g"), newText);
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Replaced text in ${file}`);
});
