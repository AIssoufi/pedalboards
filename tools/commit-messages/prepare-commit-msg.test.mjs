import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, before, describe, it } from 'node:test';

const HOOK_SCRIPT = fileURLToPath(new URL('./prepare-commit-msg.mjs', import.meta.url));
const MESSAGE_FILE_NAME = 'COMMIT_EDITMSG';

// Environment of git without the variables of a calling hook, which would point to this repository
const gitEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith('GIT_')),
);

describe('prepare-commit-msg hook', () => {
  let repository;
  let messageFile;

  const git = (...args) => {
    const options = { cwd: repository, env: gitEnvironment, encoding: 'utf8' };
    const result = spawnSync('git', args, options);
    assert.equal(result.status, 0, result.stderr);
  };

  const runHook = ({ message, source }) => {
    writeFileSync(messageFile, message);
    const args = [HOOK_SCRIPT, messageFile, ...(source === undefined ? [] : [source])];
    const result = spawnSync(process.execPath, args, {
      cwd: repository,
      env: gitEnvironment,
      encoding: 'utf8',
    });

    return { ...result, message: readFileSync(messageFile, 'utf8') };
  };

  before(() => {
    repository = mkdtempSync(join(tmpdir(), 'prepare-commit-msg-'));
    messageFile = join(repository, MESSAGE_FILE_NAME);
    git('init', '--quiet', '--initial-branch', 'PEDAL-12');
  });

  after(() => {
    rmSync(repository, { recursive: true, force: true });
  });

  it('adds the reference of the ticket branch', () => {
    const { status, message } = runHook({ message: 'feat: add a pedal\n', source: 'message' });

    assert.equal(status, 0);
    assert.equal(message, 'feat: add a pedal\n\nRefs: PEDAL-12\n');
  });

  it('adds the reference when git gives no source, for the editor', () => {
    const { message } = runHook({ message: '\n# Please enter the commit message.\n' });

    assert.equal(message, '\n\nRefs: PEDAL-12\n\n# Please enter the commit message.\n');
  });

  it('leaves a message that has a reference as it is', () => {
    const { message } = runHook({ message: 'feat: x\n\nRefs: PEDAL-3\n', source: 'message' });

    assert.equal(message, 'feat: x\n\nRefs: PEDAL-3\n');
  });

  it('leaves a merge commit as it is', () => {
    const { message } = runHook({ message: "Merge branch 'master'\n", source: 'merge' });

    assert.equal(message, "Merge branch 'master'\n");
  });

  it('leaves the message as it is on a detached HEAD, such as during a rebase', () => {
    const author = ['-c', 'user.name=Test', '-c', 'user.email=test@example.com'];
    git(...author, '-c', 'core.hooksPath=/dev/null', 'commit', '--quiet', '--allow-empty',
      '--message', 'chore: start');
    git('checkout', '--quiet', '--detach');

    const { status, message } = runHook({ message: 'feat: add a pedal\n', source: 'message' });

    assert.equal(status, 0);
    assert.equal(message, 'feat: add a pedal\n');
  });

  it('warns without failing the commit when the message file cannot be read', () => {
    const args = [HOOK_SCRIPT, join(repository, 'missing-file')];
    const options = { cwd: repository, env: gitEnvironment, encoding: 'utf8' };
    const { status, stderr } = spawnSync(process.execPath, args, options);

    assert.equal(status, 0);
    assert.match(stderr, /^prepare-commit-msg: the ticket reference was not added \(ENOENT/);
  });
});
