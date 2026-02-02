# Nepal Election 2026 - Candidate Scraper

Scripts to scrape candidate data from the Election Commission of Nepal website.

## Setup

1. Create a virtual environment:
```bash
cd scraper
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Install Playwright browsers:
```bash
playwright install chromium
```

## Usage

### Step 1: Scrape Candidates

```bash
python scrape_candidates.py
```

This will:
- Open a browser and navigate to https://result.election.gov.np/
- Navigate to the Representative House candidate list
- Scrape all 341 pages of candidates
- Save raw data to `candidates_raw.json`

**Note:** The script runs in visible browser mode by default for debugging. Once confirmed working, you can set `headless=True` in the script.

### Step 2: Translate to English

```bash
python translate_candidates.py
```

This will:
- Load `candidates_raw.json`
- Translate Nepali text to English (districts, parties, education)
- Transliterate Nepali names to Roman script
- Save processed data to `candidates.json`

### Step 3: Generate App Data

```bash
python generate_app_data.py
```

This will:
- Load `candidates.json`
- Generate `src/data/candidates-scraped.ts` for the Next.js app
- Generate `candidate_stats.json` with statistics

## Output Files

- `candidates_raw.json` - Raw scraped data in Nepali
- `candidates.json` - Processed data with English translations
- `translation_cache.json` - Cache of translations for reuse
- `candidate_stats.json` - Statistics about candidates
- `src/data/candidates-scraped.ts` - TypeScript file for the app

## Troubleshooting

If the scraper doesn't work as expected, check the debug files:
- `debug_homepage.png` - Screenshot of the homepage
- `debug_after_nav.png` - Screenshot after navigation
- `debug_page.html` - HTML content of the page

You may need to adjust the selectors in `scrape_candidates.py` based on the actual website structure.

## Data Structure

Each candidate has:
- `name` / `name_nepali` - Candidate name
- `party` / `party_nepali` - Political party
- `district` / `district_nepali` - District name
- `constituency` - Constituency number
- `age` - Candidate age
- `education` / `education_nepali` - Education level
