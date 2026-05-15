name: Update gallery manifest

on:
  workflow_dispatch:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  build-manifest:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm i image-size

      - name: Generate gallery manifest
        env:
          B2_KEY_ID: ${{ secrets.B2_KEY_ID }}
          B2_APPLICATION_KEY: ${{ secrets.B2_APPLICATION_KEY }}
        run: node scripts/generate-gallery-manifest.mjs

      - name: Commit and push if changed
        run: |
          git config user.name "mattjno-bot"
          git config user.email "actions@users.noreply.github.com"
          git add public/gallery-manifest.json
          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            git commit -m "Update gallery manifest"
            git push
          fi
