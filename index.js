#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

const repoName = process.argv[2];

if (!repoName) {
  console.log('Usage: create-github-repo-1 <repo-name>');
  process.exit(1);
}

try {
  // Create folder
  fs.mkdirSync(repoName, { recursive: true });
  process.chdir(repoName);

  // Init git
  execSync('git init', { stdio: 'inherit' });
  fs.writeFileSync('README.md', `# ${repoName}\n`);
  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "Initial commit"', { stdio: 'inherit' });

  // Create GitHub repo (requires gh CLI installed)
  execSync(
    `gh repo create ${repoName} --public --source=. --remote=origin --push`,
    { stdio: 'inherit' }
  );

  console.log(`\n✅ Repository '${repoName}' created successfully!`);
} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
