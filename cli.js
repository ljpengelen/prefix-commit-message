#!/usr/bin/env node

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const scriptName = "prefix-commit-message";

function customSymbol(value) {
  if (!value) return "";
  if (value.startsWith("-")) return "";

  return value;
}

const configuration = {
  opening: "[ ",
  closing: " ]",
  includeBranchPattern: null,
  excludeBranchPattern: null,
  customBranchMatchPattern: null
};

const args = process.argv.slice(3);
for (let i = 1; i <= args.length; ++i) {
  let previous = args[i - 1];
  let current = args[i];
  if (previous === "-o") {
    configuration.opening = customSymbol(current);
  }
  if (previous === "-c") {
    configuration.closing = customSymbol(current);
  }
  if (previous === "-bi") {
    configuration.includeBranchPattern = current;
  }
  if (previous === "-be") {
    configuration.excludeBranchPattern = current;
  }

  if (previous === "-br") {
    configuration.customBranchMatchPattern = current;
  }
}

const pathToHead = folder => path.resolve(path.join(folder, ".git", "HEAD"));
const pathToParentFolder = folder => path.resolve(path.join(folder, ".."));
const isRepositoryRoot = folder => fs.existsSync(pathToHead(folder));

let repositoryRoot = process.cwd();
while (!isRepositoryRoot(repositoryRoot)) {
  const parent = pathToParentFolder(repositoryRoot);
  if (parent == repositoryRoot) {
    console.error(`${scriptName} was unable to find the root of the Git repository.`);
    process.exit(1);
  }
  repositoryRoot = parent;
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

const identifierMatch = branchName.match(configuration.customBranchMatchPattern ? new RegExp(configuration.customBranchMatchPattern.replaceAll(/^\/|\/$/g, '')): /[^/]*\/(([a-zA-Z0-9]*-)?[0-9]+).*/);
if (!identifierMatch) {
  process.exit();
}

const identifier = identifierMatch[1];
if (!identifier) {
  process.exit();
}

if (configuration.includeBranchPattern && !branchName.match(configuration.includeBranchPattern)) {
  process.exit();
}

if (configuration.excludeBranchPattern && branchName.match(configuration.excludeBranchPattern)) {
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

const prefix = configuration.opening + identifier + configuration.closing + " ";

const content = fs.readFileSync(pathToCommitMessageFile);
if (content.indexOf(prefix) === -1) {
  fs.writeFileSync(pathToCommitMessageFile, prefix + content);
}

