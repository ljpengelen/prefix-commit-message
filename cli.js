#!/usr/bin/env node

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const scriptName = "prefix-commit-message";

const pathToHead = folder => path.resolve(path.join(folder, ".git", "HEAD"));
const pathToParentFolder = folder => path.resolve(path.join(folder, ".."));
const isRepositoryRoot = folder => fs.existsSync(pathToHead(folder));

let repositoryRoot = __dirname;
while (!isRepositoryRoot(repositoryRoot) && fs.existsSync(repositoryRoot)) {
  repositoryRoot = pathToParentFolder(repositoryRoot);
}

if (!fs.existsSync(repositoryRoot)) {
  console.error(`${scriptName} was unable to find the root of the Git repository.`);
  process.exit(1);
}

const head = fs.readFileSync(pathToHead(repositoryRoot)).toString();
const branchNameMatch = head.match(/^ref: refs\/heads\/(.*)/);
if (!branchNameMatch) {
  process.exit();
}

const branchName = branchNameMatch[1];
if (!branchName) {
  process.exit();
}

const identifierMatch = branchName.match(/[^/]*\/(([A-Z]*-)?[0-9]*).*/);
if (!identifierMatch) {
  process.exit();
}

const identifier = identifierMatch[1];
if (!identifier) {
  process.exit();
}

const commitMessageFile = process.argv[2];
if (!commitMessageFile) {
  console.error(`${scriptName} requires the name of the file containing the commit log message as first argument.`);
  process.exit(1);
}

const pathToCommitMessageFile = path.resolve(path.join(repositoryRoot, commitMessageFile));
if (!fs.existsSync(pathToCommitMessageFile)) {
  console.error(`${pathToCommitMessageFile} is not a file.`)
  process.exit(1);
}

let opening = "[ ";
if (process.argv[3] !== undefined) {
  opening = process.argv[3];
}

let closing = " ]";
if (process.argv[4] !== undefined) {
  closing = process.argv[4];
}
const prefix = opening + identifier + closing + " ";

const content = fs.readFileSync(pathToCommitMessageFile);
if (content.indexOf(prefix) === -1) {
  fs.writeFileSync(pathToCommitMessageFile, prefix + content);
}
