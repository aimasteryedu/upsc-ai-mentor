# Cost Control Guidelines

This document provides guidelines and configuration options to control the costs associated with running the UPSC AI Mentor application, particularly regarding AI service usage, rendering resources, and infrastructure costs.

## AI Service Usage Control

### OpenAI API (Embeddings)

The application uses OpenAI's `text-embedding-3-large` model for generating embeddings. To control costs:

1. **Batch Processing**: Content is processed in batches with rate limiting
2. **Caching**: Embeddings are cached to avoid regenerating for unchanged content
3. **Configuration Options**:

```js
// packages/config/src/ai.ts
export const embeddingConfig = {
  // Reduce batch size to lower concurrent API calls
  batchSize: process.env.NODE_ENV === 'production' ? 100 : 10,
  
  // Rate limit requests (tokens per minute)
  rateLimit: process.env.NODE_ENV === 'production' ? 150000 : 15000,
  
  // Enable/disable embeddings generation
  enabled: process.env.ENABLE_EMBEDDINGS === 'true',
  
  // Cache duration in days
  cacheDuration: 30
};
```

### Kimi K2 (Reasoning)

The application uses Kimi K2 for content generation. To control costs:

1. **Prompt Optimization**: Prompts are carefully crafted to minimize token usage
2. **Output Caching**: Generated content is cached based on input parameters
3. **Configuration Options**:

```js
// packages/config/src/ai.ts
export const kimiConfig = {
  // Enable/disable Kimi K2 features
  enabled: process.env.ENABLE_KIMI === 'true',
  
  // Control model temperature (lower = more deterministic, less tokens)
  temperature: 0.7,
  
  // Maximum tokens per request
  maxTokens: 2048,
  
  // Cache duration in hours
  cacheDuration: 24
};
```

### Hugging Face Models

The application uses Hugging Face models for speech and image generation. To control costs:

1. **Local Inference**: When possible, models run locally to avoid API calls
2. **Low-Resolution Previews**: Generate low-res previews before final renders
3. **Configuration Options**:

```js
// packages/config/src/ai.ts
export const huggingfaceConfig = {
  // Enable/disable Hugging Face features
  enabled: process.env.ENABLE_HUGGINGFACE === 'true',
  
  // Use local models when available
  preferLocal: true,
  
  // Quality settings (lower = faster, cheaper)
  quality: process.env.NODE_ENV === 'production' ? 'high' : 'medium',
  
  // Limit concurrent requests
  maxConcurrentRequests: 5
};
```

## Rendering Resource Control

### Video Rendering

Video rendering can be resource-intensive. To control costs:

1. **Resolution Control**: Generate videos in lower resolutions when appropriate
2. **Frame Rate Control**: Use lower frame rates for less complex animations
3. **CPU Rendering Fallback**: Fall back to CPU rendering when GPU is unavailable
4. **Configuration Options**:

```js
// packages/config/src/rendering.ts
export const videoConfig = {
  // Enable/disable video rendering
  enabled: process.env.ENABLE_VIDEO_RENDERING === 'true',
  
  // Default resolution (can be overridden per request)
  defaultResolution: process.env.NODE_ENV === 'production' ? '720p' : '480p',
  
  // Frame rate options
  defaultFps: process.env.NODE_ENV === 'production' ? 30 : 24,
  
  // Use GPU acceleration when available
  useGpu: true,
  
  // Maximum concurrent renders
  maxConcurrentRenders: process.env.NODE_ENV === 'production' ? 3 : 1
};
```

### Remotion Rendering

For Remotion-specific rendering controls:

```js
// packages/config/src/remotion.ts
export const remotionConfig = {
  // Enable/disable Remotion
  enabled: process.env.ENABLE_REMOTION === 'true',
  
  // Composition settings
  composition: {
    width: process.env.NODE_ENV === 'production' ? 1280 : 854,
    height: process.env.NODE_ENV === 'production' ? 720 : 480,
    fps: process.env.NODE_ENV === 'production' ? 30 : 24
  },
  
  // Rendering settings
  rendering: {
    quality: process.env.NODE_ENV === 'production' ? 95 : 80,
    concurrency: process.env.NODE_ENV === 'production' ? 4 : 2
  }
};
```

### Manim Rendering

For Manim-specific rendering controls:

```python
# scripts/config/manim_config.py
def get_manim_config():
    production = os.environ.get('NODE_ENV') == 'production'
    
    return {
        "quality": "medium_quality" if production else "low_quality",
        "preview": not production,
        "disable_caching": not production,
        "pixel_width": 1280 if production else 854,
        "pixel_height": 720 if production else 480,
        "frame_rate": 30 if production else 15
    }
```

## Infrastructure Cost Control

### Supabase

To control Supabase costs:

1. **Connection Pooling**: Use connection pooling for database access
2. **Storage Limits**: Implement storage quotas per user
3. **Database Indexes**: Optimize queries with proper indexes
4. **Configuration Options**:

```js
// packages/config/src/supabase.ts
export const supabaseConfig = {
  // Set maximum storage per user (in MB)
  maxUserStorageMB: 200,
  
  // Enable/disable realtime features (higher cost)
  enableRealtime: process.env.ENABLE_REALTIME === 'true',
  
  // Data retention policies (in days)
  retentionPolicies: {
    logs: 30,
    tempFiles: 7,
    deletedContent: 30
  },
  
  // Database pool settings
  poolSettings: {
    maxConnections: 20,
    connectionTimeoutMs: 10000
  }
};
```

### GitHub Actions

To control GitHub Actions costs:

1. **Workflow Timeouts**: Set reasonable timeouts for workflows
2. **Self-Hosted Runners**: Use self-hosted runners for intensive tasks
3. **Caching**: Use caching to speed up builds
4. **Configuration Options**:

```yaml
# .github/workflows/render-video.yml (excerpt)
jobs:
  render:
    runs-on: ${{ fromJSON(secrets.USE_SELF_HOSTED_RUNNER) && 'self-hosted' || 'ubuntu-latest' }}
    timeout-minutes: 60
    steps:
      # Use caching for node_modules
      - uses: actions/cache@v3
        with:
          path: '**/node_modules'
          key: ${{ runner.os }}-modules-${{ hashFiles('**/pnpm-lock.yaml') }}
```

## Runtime Feature Toggles

You can use environment variables to enable/disable costly features:

| Variable | Description | Default |
|----------|-------------|---------|
| `ENABLE_EMBEDDINGS` | Enable/disable embeddings generation | `true` |
| `ENABLE_KIMI` | Enable/disable Kimi K2 features | `true` |
| `ENABLE_HUGGINGFACE` | Enable/disable Hugging Face features | `true` |
| `ENABLE_VIDEO_RENDERING` | Enable/disable video rendering | `true` |
| `ENABLE_REMOTION` | Enable/disable Remotion | `true` |
| `ENABLE_REALTIME` | Enable/disable Supabase realtime features | `false` in dev, `true` in prod |
| `USE_SELF_HOSTED_RUNNER` | Use self-hosted GitHub runner | `false` |
| `RENDER_QUALITY` | Rendering quality (low, medium, high) | `medium` in dev, `high` in prod |

## Usage Monitoring

Set up monitoring to track usage and costs:

1. **API Call Logging**: Log all external API calls with metadata
2. **Storage Monitoring**: Track storage usage per user
3. **Rendering Time Tracking**: Monitor rendering times and resource usage
4. **Cost Dashboards**: Create dashboards to visualize costs over time

```js
// packages/core/src/utils/logging.ts
export const logApiCall = async (service, endpoint, tokenCount, success) => {
  await supabase.from('api_logs').insert({
    service,
    endpoint,
    token_count: tokenCount,
    success,
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
};
```

## Development Mode

In development mode, the application automatically:

1. Uses lower quality settings for rendering
2. Reduces batch sizes for API calls
3. Disables certain high-cost features
4. Uses caching more aggressively

To run in development mode:

```bash
# Run in development mode (default)
pnpm dev

# Run in production mode
NODE_ENV=production pnpm start
```

## Emergency Cost Control

In case of unexpected cost spikes, you can quickly disable costly features:

```bash
# Disable all AI features
pnpm disable:ai

# Disable all rendering features
pnpm disable:rendering

# Disable all features except core functionality
pnpm disable:all-except-core
```

These commands update the environment variables in the deployed application.
