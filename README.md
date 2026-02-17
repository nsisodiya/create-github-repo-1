# create-github-repo-1

A CLI to bootstrap a GitHub repository from local folder creation to first push.

## What it does

- Creates a local folder and initializes git on `main`
- Adds `README.md`, `.gitignore`, and `.github/workflows/publish.yml`
- Creates GitHub repo with `gh repo create`
- Defaults to private repo creation
- Pushes initial commit to `main`
- Runs `code .`
- Runs `github .` (required)

## Usage

```bash
create-github-repo-1 <repo-name> [--private|--public]
```

Examples:

```bash
create-github-repo-1 my-new-repo
create-github-repo-1 my-public-repo --public
```

## Prerequisites

- `git` installed
- `gh` (GitHub CLI) installed and authenticated (`gh auth login`)
- `code` command available from VS Code
- `github` command available

## Auto publish on push to main

The generated workflow publishes to npm on every push to `main` if both conditions are true:

- `package.json` exists in the repository
- repository secret `NPM_TOKEN` is configured

Set the secret:

1. Open repo settings on GitHub
2. Go to Secrets and variables -> Actions
3. Add secret `NPM_TOKEN`
