#!/usr/bin/env node

const childProcess = require("child_process");
const fs = require("fs");

const symbolicRef = childProcess.execSync("git symbolic-ref --short HEAD").toString().trim();
const match = symbolicRef.match(/[^/]*\/(([A-Z]*-)?[0-9]*).*/);

if (match) {
  const identifier = match[1];

  if (identifier) {
    const commitMessageFile = process.argv[2];
    const content = fs.readFileSync(commitMessageFile);
    const prefix = "[ " + identifier + " ] ";

    if (content.indexOf(prefix) === -1) {
      fs.writeFileSync(commitMessageFile, prefix + content);
    }
  }
}
