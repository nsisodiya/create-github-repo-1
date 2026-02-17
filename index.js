#!/usr/bin/env node

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const repoName = process.argv[2];
const visibilityArg = process.argv[3];

const visibility = visibilityArg === '--public' ? '--public' : '--private';

const VALID_REPO_NAME = /^[A-Za-z0-9._-]+$/;

function fail(message) {
  console.error(`\nError: ${message}`);
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `Command failed (${result.status}): ${command} ${args.join(' ')}`
    );
  }
}

function ensureCommandAvailable(command, args = ['--version']) {
  const result = spawnSync(command, args, { stdio: 'ignore' });
  if (result.error || result.status !== 0) {
    fail(`Missing required command \`${command}\`. Install it and retry.`);
  }
}

function ensureGhAuthenticated() {
  const result = spawnSync('gh', ['auth', 'status'], { stdio: 'ignore' });
  if (result.error || result.status !== 0) {
    fail('GitHub CLI is not authenticated. Run `gh auth login` first.');
  }
}

if (!repoName) {
  console.log('Usage: create-github-repo-1 <repo-name> [--private|--public]');
  process.exit(1);
}

if (!VALID_REPO_NAME.test(repoName)) {
  fail('Invalid repo name. Use letters, numbers, ".", "_" or "-".');
}

if (
  visibilityArg &&
  visibilityArg !== '--public' &&
  visibilityArg !== '--private'
) {
  fail('Visibility flag must be `--private` or `--public`.');
}

ensureCommandAvailable('git');
ensureCommandAvailable('gh');
ensureGhAuthenticated();

const repoPath = path.resolve(process.cwd(), repoName);
const originalCwd = process.cwd();

try {
  if (fs.existsSync(repoPath)) {
    const existingFiles = fs.readdirSync(repoPath);
    if (existingFiles.length > 0) {
      fail(`Target folder already exists and is not empty: ${repoPath}`);
    }
  } else {
    fs.mkdirSync(repoPath, { recursive: true });
  }

  process.chdir(repoName);

  // Initialize repository on main branch.
  run('git', ['init', '-b', 'main']);
  fs.writeFileSync('README.md', `# ${repoName}\n`);
  run('npx', ['gitignore', 'node']);
  run('git', ['add', '.']);
  run('git', ['commit', '-m', 'Initial commit']);

  // Create private GitHub repo by default, then push main.
  run('gh', [
    'repo',
    'create',
    repoName,
    visibility,
    '--source=.',
    '--remote=origin',
    '--push'
  ]);

  // Open editor if available.
  try {
    run('code', ['.']);
  } catch {
    console.warn('\nWarning: Could not run `code .`.');
  }

  // Open GitHub Desktop if available.
  try {
    run('github', ['.']);
  } catch {
    console.warn('\nWarning: Could not run `github .`.');
  }

  console.log(`\nRepository '${repoName}' created successfully.`);
} catch (error) {
  console.error('\nError:', error.message);
  process.exit(1);
} finally {
  process.chdir(originalCwd);
}
