# CI/CD Workflows

This document explains the CI/CD workflows set up for the UPSC AI Mentor application, the required secrets, and how to run builds locally.

## GitHub Actions Workflows

The UPSC AI Mentor application uses several GitHub Actions workflows for continuous integration and delivery:

### 1. CI Workflow (`ci.yml`)

This workflow runs linting, testing, and preview builds whenever code is pushed to the repository or a pull request is made.

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - name: Install dependencies
        run: pnpm install
      - name: Run linting
        run: pnpm lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - name: Install dependencies
        run: pnpm install
      - name: Run tests
        run: pnpm test

  preview-build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_API_KEY }}
      - name: Install dependencies
        run: pnpm install
      - name: Create preview build
        run: pnpm build:preview
```

### 2. Embedding Ingestion Workflow (`ingest-embeddings.yml`)

This workflow is triggered whenever content files are pushed to the `content/` directory or manually dispatched. It processes the content, generates embeddings, and stores them in Supabase.

```yaml
name: Ingest Embeddings

on:
  push:
    paths:
      - 'content/**'
  workflow_dispatch:
    inputs:
      content_path:
        description: 'Path to content files'
        required: false
        default: 'content/'

jobs:
  ingest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - name: Install dependencies
        run: pnpm install
      - name: Run ingestion script
        run: pnpm ingest:content
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          CONTENT_PATH: ${{ github.event.inputs.content_path || 'content/' }}
```

### 3. Video Rendering Workflow (`render-video.yml`)

This workflow generates educational videos using Remotion, Manim, and other tools, then uploads the result to Supabase.

```yaml
name: Render Video

on:
  workflow_dispatch:
    inputs:
      script_path:
        description: 'Path to video script JSON'
        required: true
      output_name:
        description: 'Output video filename'
        required: true
      resolution:
        description: 'Video resolution (e.g., 1080p, 720p)'
        required: false
        default: '720p'

jobs:
  render:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'
      - name: Install FFmpeg
        run: sudo apt-get update && sudo apt-get install -y ffmpeg
      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install manim pydub
      - name: Install dependencies
        run: pnpm install
      - name: Render video
        run: pnpm render:video
        env:
          SCRIPT_PATH: ${{ github.event.inputs.script_path }}
          OUTPUT_NAME: ${{ github.event.inputs.output_name }}
          RESOLUTION: ${{ github.event.inputs.resolution }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          HUGGINGFACE_API_KEY: ${{ secrets.HUGGINGFACE_API_KEY }}
      - name: Upload video to Supabase
        run: pnpm upload:video
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          VIDEO_PATH: ${{ github.event.inputs.output_name }}
```

### 4. EAS Build Workflow (`eas-build.yml`)

This workflow builds Android AAB and APK files using EAS and uploads them to GitHub Releases and the Supabase builds bucket.

```yaml
name: EAS Build

on:
  release:
    types: [created]
  workflow_dispatch:
    inputs:
      profile:
        description: 'Build profile (preview, production)'
        required: false
        default: 'preview'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_API_KEY }}
      - name: Install dependencies
        run: pnpm install
      - name: Setup EAS
        run: pnpm setup:eas
      - name: Build app
        run: pnpm build:app
        env:
          PROFILE: ${{ github.event.inputs.profile || 'production' }}
      - name: Upload to GitHub Release
        if: github.event_name == 'release'
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          upload_url: ${{ github.event.release.upload_url }}
          asset_path: ./builds/app-release.aab
          asset_name: app-release.aab
          asset_content_type: application/octet-stream
      - name: Upload to Supabase
        run: pnpm upload:build
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Required Secrets

The following secrets need to be set up in your GitHub repository:

| Secret Name | Description |
|-------------|-------------|
| `SUPABASE_URL` | URL of your Supabase project |
| `SUPABASE_ANON_KEY` | Anon key for Supabase public operations |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for Supabase admin operations |
| `OPENAI_API_KEY` | API key for OpenAI services (embeddings) |
| `KIMI_API_KEY` | API key for Kimi K2 LLM |
| `HUGGINGFACE_API_KEY` | API key for Hugging Face models |
| `EXPO_API_KEY` | API key for Expo/EAS services |
| `PLAY_SERVICE_ACCOUNT_JSON` | JSON credentials for Google Play Store |
| `REVENUECAT_SECRET_API_KEY` | Secret API key for RevenueCat |
| `EXPO_PUBLIC_REVENUECAT_API_KEY` | Public API key for RevenueCat |
| `GOOGLE_ADS_API_KEY` | API key for Google Ads |
| `META_ADS_ACCESS_TOKEN` | Access token for Meta Ads |

## Running Builds Locally

To run builds locally, you need to have the following tools installed:

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- Python 3.10 or higher
- FFmpeg
- Expo CLI and EAS CLI

### Install dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
pip install manim pydub
```

### Set up environment variables

Create a `.env` file in the root directory with the required environment variables (see `.env.example` for reference).

### Run local development server

```bash
# Start the development server
pnpm dev

# Start mobile app development
pnpm mobile:dev
```

### Build the mobile app locally

```bash
# Preview build
pnpm build:preview

# Production build
pnpm build:production
```

### Run content ingestion

```bash
# Ingest content and generate embeddings
pnpm ingest:content
```

### Render a video

```bash
# Render a video from a script
pnpm render:video --script=path/to/script.json --output=video_name
```

### Create a local build

```bash
# Create a local Android build
pnpm build:android-local
```

## Troubleshooting

If you encounter issues with the CI/CD workflows, check the following:

1. Ensure all required secrets are set up correctly in your GitHub repository
2. Verify that your Supabase project is configured with the pgvector extension
3. Check that your EAS account has the necessary permissions and quota
4. Make sure your local environment has all the required dependencies installed
