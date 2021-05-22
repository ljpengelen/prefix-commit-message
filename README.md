# Prefix Commit Message

This script is meant to be used as a [prepare-commit-msg Git hook](https://git-scm.com/docs/githooks#_prepare_commit_msg).
Each time you commit, it extracts the issue identifier or user-story identifier from the current branch name and prefixes your commit message with the extracted identifier.

It supports identifiers of the form `ABCD-1234` and `1234`, and will look for such identifiers right after the `/` in the name of the current branch.
If you're on the branch `feature/JIRA-874-cannot-log-in-on-macos`, for example, this hook will prefix each of your commit messages with `[ JIRA-874 ] `.

There are simpler shell scripts that achieve the same, but this solution works on Windows too.

This script can be used standalone or in combination with [Husky](https://github.com/typicode/husky) (version 6 and newer).
If you're using an older Husky, see (https://github.com/ljpengelen/prefix-commit-message/tree/v1.3.0).

## Installation

### Usage with Husky

First, install [Husky](https://github.com/typicode/husky) and this script:

```
npm install husky --save-dev
npm install prefix-commit-message --save-dev
```

Then, enable Git hooks via Husky:

```
npx husky install
```

Finally, set up the prepare-commit-msg hook:

```
npx husky add .husky/prepare-commit-msg "npx prefix-commit-message \$1"
```

## Custom prefix

If you don't like the square brackets around the identifier, you can supply a custom opening and closing symbol.
For example,

```
npx husky add .husky/prepare-commit-msg "npx prefix-commit-message \$1 '' ':'"
```

will result in the prefix `JIRA-874: `.
