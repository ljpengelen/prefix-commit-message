#!/usr/bin/env node

const childProcess = require("child_process");
const fs = require("fs");

const scriptName = "prepare-commit-id";

let symbolicRef;
try {
  symbolicRef = childProcess.execSync("git symbolic-ref --short HEAD").toString().trim();
} catch (e) {
  console.error(scriptName + " doesn't work without Git.");
  process.exit(1);
}

const match = symbolicRef.match(/[^/]*\/(([A-Z]*-)?[0-9]*).*/);
if (!match) {
  process.exit();
}

const identifier = match[1];
if (!identifier) {
  process.exit();
}

const commitMessageFile = process.argv[2];
if (!commitMessageFile) {
  console.error(scriptName + " requires the name of the file containing the commit log message as first argument.");
  process.exit(1);
}

const content = fs.readFileSync(commitMessageFile);
const prefix = "[ " + identifier + " ] ";

if (content.indexOf(prefix) === -1) {
  fs.writeFileSync(commitMessageFile, prefix + content);
}
