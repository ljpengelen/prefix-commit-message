import { expect } from 'chai';
import fs  from 'fs';
import os from 'os';
import path from 'path';
import { exec, execSync } from 'child_process';

const scriptFile = 'cli.js';
const commitMessageFile = 'commit-message.txt';
const commitMessage = 'Commit message';

const simulateBranch = (dir, branchName) => {
  fs.writeFileSync(path.join(dir, '.git', 'HEAD'), `ref: refs/heads/${branchName}\n`);
}

describe('prefix commit message hook', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "prefix-commit-message-test-"));

  before(() => {
    fs.copyFileSync(scriptFile, path.join(tmpDir, scriptFile));
    process.chdir(tmpDir);
  });

  beforeEach(() => {
    fs.writeFileSync(path.join(tmpDir, commitMessageFile), commitMessage);
  });

  after(() => {
    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true });
    } 
  });

  context('execution outside repository', () => {
    it('logs an error', done => {
      exec(`./${scriptFile} ${commitMessageFile}`, (error, _, stderr) => {
        expect(error).to.not.be.null;
        expect(stderr).to.equal('prefix-commit-message was unable to find the root of the Git repository.\n');
        done();
      });
    });

    it('does not modify commit file', done => {
      exec(`./${scriptFile} ${commitMessageFile}`, () => {
        const actualCommitMessage = fs.readFileSync(path.join(tmpDir, commitMessageFile), 'utf-8');
        expect(actualCommitMessage).to.equal(commitMessage);
        done();
      });
    });
  });

  context('execution inside repository', () => {
    before(() => {
      fs.mkdirSync(path.join(tmpDir, '.git'));
    });

    it('extracts ticket number of the form ABCD-1234', () => {
      simulateBranch(tmpDir, "feature/ABCD-1234-add-login-form");
      execSync(`./${scriptFile} ${commitMessageFile}`);
      const actualCommitMessage = fs.readFileSync(path.join(tmpDir, commitMessageFile), 'utf-8');
      expect(actualCommitMessage).to.equal(`[ ABCD-1234 ] ${commitMessage}`);
    });

    it('extracts ticket number of the form AB123CD-1234', () => {
      simulateBranch(tmpDir, "feature/AB123CD-1234-add-login-form");
      execSync(`./${scriptFile} ${commitMessageFile}`);
      const actualCommitMessage = fs.readFileSync(path.join(tmpDir, commitMessageFile), 'utf-8');
      expect(actualCommitMessage).to.equal(`[ AB123CD-1234 ] ${commitMessage}`);
    });

    it('extracts ticket number of the form 1234', () => {
      simulateBranch(tmpDir, "feature/1234-add-login-form");
      execSync(`./${scriptFile} ${commitMessageFile}`);
      const actualCommitMessage = fs.readFileSync(path.join(tmpDir, commitMessageFile), 'utf-8');
      expect(actualCommitMessage).to.equal(`[ 1234 ] ${commitMessage}`);
    });

    it('uses custom opening and closing symbols', () => {
      simulateBranch(tmpDir, "feature/ABCD-1234-add-login-form");
      execSync(`./${scriptFile} ${commitMessageFile} -o { -c }`);
      const actualCommitMessage = fs.readFileSync(path.join(tmpDir, commitMessageFile), 'utf-8');
      expect(actualCommitMessage).to.equal(`{ABCD-1234} ${commitMessage}`);
    });

    it('supports non-existing opening and closing symbols', () => {
      simulateBranch(tmpDir, "feature/ABCD-1234-add-login-form");
      execSync(`./${scriptFile} ${commitMessageFile} -o -c`);
      const actualCommitMessage = fs.readFileSync(path.join(tmpDir, commitMessageFile), 'utf-8');
      expect(actualCommitMessage).to.equal(`ABCD-1234 ${commitMessage}`);
    });

    it('excludes branches matching provided exclusion pattern', () => {
      simulateBranch(tmpDir, "feature/ABCD-1234-add-login-form");
      execSync(`./${scriptFile} ${commitMessageFile} -be feature`);
      const actualCommitMessage = fs.readFileSync(path.join(tmpDir, commitMessageFile), 'utf-8');
      expect(actualCommitMessage).to.equal(commitMessage);
    });

    it('includes branches matching provided inclusion pattern', () => {
      simulateBranch(tmpDir, "feature/ABCD-1234-add-login-form");
      execSync(`./${scriptFile} ${commitMessageFile} -bi feature`);
      const actualCommitMessage = fs.readFileSync(path.join(tmpDir, commitMessageFile), 'utf-8');
      expect(actualCommitMessage).to.equal(`[ ABCD-1234 ] ${commitMessage}`);
    });

    it('excludes branches not matching provided inclusion pattern', () => {
      simulateBranch(tmpDir, "feature/ABCD-1234-add-login-form");
      execSync(`./${scriptFile} ${commitMessageFile} -bi fix`);
      const actualCommitMessage = fs.readFileSync(path.join(tmpDir, commitMessageFile), 'utf-8');
      expect(actualCommitMessage).to.equal(commitMessage);
    });
  });
});
