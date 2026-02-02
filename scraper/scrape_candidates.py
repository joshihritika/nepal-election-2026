"""
Nepal Election 2082 - Candidate Data Scraper
Scrapes candidate information from https://result.election.gov.np/
"""

import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

NEPALI_DIGITS = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
}

def convert_nepali_numbers(text):
    if not text:
        return text
    for n, e in NEPALI_DIGITS.items():
        text = text.replace(n, e)
    return text

def clean_text(text):
    if not text:
        return ""
    return text.strip().replace('\n', ' ').replace('\t', ' ').strip()

async def scrape_all_candidates(headless=True):
    """Scrape all candidates from the election website"""

    candidates = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=headless)
        page = await browser.new_page()

        print("Navigating to election website...")
        await page.goto('https://result.election.gov.np/ElectionResultCentral2079.aspx', timeout=60000)
        await page.wait_for_load_state('networkidle')
        await asyncio.sleep(3)

        # Wait for table
        await page.wait_for_selector('#jQGridDemo', timeout=15000)
        print("Found candidate table!")

        # Get total pages
        total_pages_el = await page.query_selector('#sp_1_jQGridDemoPager')
        total_pages = 341  # default
        if total_pages_el:
            total_text = await total_pages_el.text_content()
            total_pages = int(total_text) if total_text.isdigit() else 341
            print(f"Total pages: {total_pages}")

        page_num = 1

        while page_num <= total_pages:
            # Wait for rows to load
            await asyncio.sleep(0.5)
            rows = await page.query_selector_all('#jQGridDemo tbody tr[role="row"]')

            page_count = 0
            for row in rows:
                try:
                    cells = await row.query_selector_all('td')
                    if len(cells) < 15:
                        continue

                    candidate = {
                        'id': '',
                        'name_nepali': '',
                        'party_nepali': '',
                        'district_nepali': '',
                        'province_nepali': '',
                        'constituency': '',
                        'gender_nepali': '',
                        'education': '',
                        'dob': '',
                        'father_name': '',
                        'address': '',
                        'votes': '',
                        'rank': '',
                        'elected': False
                    }

                    for cell in cells:
                        text = clean_text(await cell.text_content())
                        aria = await cell.get_attribute('aria-describedby') or ''

                        if 'CandidateID' in aria:
                            candidate['id'] = text
                        elif 'CandidateName' in aria:
                            candidate['name_nepali'] = text
                        elif 'PoliticalPartyName' in aria:
                            candidate['party_nepali'] = text
                        elif 'DistrictName' in aria:
                            candidate['district_nepali'] = text
                        elif 'StateName' in aria:
                            candidate['province_nepali'] = text
                        elif 'SCConstID' in aria:
                            candidate['constituency'] = convert_nepali_numbers(text)
                        elif 'Gender' in aria:
                            candidate['gender_nepali'] = text
                        elif 'QUALIFICATION' in aria:
                            candidate['education'] = text
                        elif 'DOB' in aria:
                            candidate['dob'] = text
                        elif 'FATHER_NAME' in aria:
                            candidate['father_name'] = text
                        elif 'ADDRESS' in aria:
                            candidate['address'] = text
                        elif 'TotalVoteReceived' in aria:
                            candidate['votes'] = convert_nepali_numbers(text)
                        elif 'Rank' in aria:
                            candidate['rank'] = text
                        elif 'Remarks' in aria:
                            candidate['elected'] = 'Elected' in text

                    if candidate['name_nepali']:
                        candidates.append(candidate)
                        page_count += 1

                except Exception as e:
                    continue

            print(f"\rPage {page_num}/{total_pages}: +{page_count} (Total: {len(candidates)})", end="", flush=True)

            # Check if next button is disabled
            next_btn = await page.query_selector('#next_jQGridDemoPager')
            if not next_btn:
                print("\nNo next button found")
                break

            btn_class = await next_btn.get_attribute('class') or ''
            if 'ui-state-disabled' in btn_class:
                print("\nReached last page")
                break

            # Click next
            try:
                await next_btn.click()
                await asyncio.sleep(0.8)
            except Exception as e:
                print(f"\nError clicking next: {e}")
                break

            page_num += 1

            # Save every 50 pages
            if page_num % 50 == 0:
                save_candidates(candidates, 'candidates_partial.json')

        await browser.close()

    print(f"\n\nTotal: {len(candidates)} candidates")
    return candidates


def save_candidates(candidates, filename='candidates_raw.json'):
    """Save candidates to JSON"""
    output_path = Path('scraper') / filename
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(candidates, f, ensure_ascii=False, indent=2)
    print(f"\nSaved to {output_path}")


async def main():
    print("=" * 50)
    print("Nepal Election 2082 - Candidate Scraper")
    print("=" * 50)

    candidates = await scrape_all_candidates(headless=True)

    if candidates:
        save_candidates(candidates)
        print(f"\nDone! {len(candidates)} candidates scraped.")
    else:
        print("No candidates found.")


if __name__ == '__main__':
    asyncio.run(main())
