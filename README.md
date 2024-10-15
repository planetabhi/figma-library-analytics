# Figma Library Analytics
For the enterprise plan only :/

### Installation

```bash
npm i figma-library-analytics
```

Create a `.env`

```bash
FIGMA_ACCESS_TOKEN=your_figma_access_token
FILE_KEY=your_figma_file_key
START_DATE=YYYY-MM-DD
END_DATE=YYYY-MM-DD
```

### Usage

As a module

```typescript
import { libraryAnalytics } from 'figma-library-analytics';

async function runAnalytics() {
  try {
    await libraryAnalytics();
    console.log('Reports generated successfully!');
  } catch (error) {
    console.error('Error generating reports:', error);
  }
}

runAnalytics();
```

As a CLI tool

```bash
figma-library-analytics
```

### Output

Generated in the `output` directory
1. `actions_by_component.csv` — Actions (detachments and insertions) grouped by component.
2. `actions_by_team.csv` — Actions grouped by team.
3. `usages_by_component.csv` — Component usage statistics.
4. `usages_by_file.csv` — Component usage grouped by file.
