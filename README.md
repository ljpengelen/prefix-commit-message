# Prefix Commit Message

This script is meant to be used with [Husky](https://github.com/typicode/husky) (versions 1-4) as a [prepare-commit-msg Git hook](https://git-scm.com/docs/githooks#_prepare_commit_msg).
Each time you commit, it extracts the issue identifier or user-story identifier from the current branch name and prefixes your commit message with the extracted identifier.

It supports identifiers of the form `ABCD-1234` and `1234`, and will look for such identifiers right after the `/` in the name of the current branch.
If you're on the branch `feature/JIRA-874-cannot-log-in-on-macos`, for example, this hook will prefix each of your commit messages with `[ JIRA-874 ] `.

There are simpler shell scripts that achieve the same, but this solution works on Windows too.

## Installation

> :warning: These installation instructions only work with Husky versions before 5.

First, install [Husky](https://github.com/typicode/husky):

```
npm install husky@^4.3.8 --save-dev
```

Then, install this hook:

```
npm install prefix-commit-message --save-dev
```

Finally, add the following to `package.json`:

```
"husky": {
    "hooks": {
      "prepare-commit-msg": "prefix-commit-message"
    }
  }
```

## Custom prefix

If you don't like the square brackets around the identifier, you can supply a custom opening and closing symbol.
For example,

```
"husky": {
    "hooks": {
      "prepare-commit-msg": "prefix-commit-message '' ':'"
    }
  }
```

will result in the prefix `JIRA-874: `.
