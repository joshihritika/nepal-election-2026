"""
Simple scraper to test the Election Commission website
"""

import asyncio
import json
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

async def main():
    print("Starting scraper...")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        print("Navigating to election website...")
        await page.goto('https://result.election.gov.np/ElectionResultCentral2079.aspx', timeout=60000)
        await page.wait_for_load_state('networkidle')
        await asyncio.sleep(3)

        print("Taking screenshot...")
        await page.screenshot(path='scraper/page_screenshot.png')

        # Check for table
        table = await page.query_selector('#jQGridDemo')
        if table:
            print("Found jqGrid table!")
        else:
            print("No jqGrid table found")
            # Print page title
            title = await page.title()
            print(f"Page title: {title}")

        # Try to get table rows
        rows = await page.query_selector_all('#jQGridDemo tbody tr[role="row"]')
        print(f"Found {len(rows)} rows")

        candidates = []

        for i, row in enumerate(rows[:5]):  # Just first 5 for testing
            cells = await row.query_selector_all('td')
            print(f"\nRow {i+1} has {len(cells)} cells:")

            row_data = []
            for j, cell in enumerate(cells):
                text = await cell.text_content()
                text = text.strip() if text else ""
                aria = await cell.get_attribute('aria-describedby') or ""
                row_data.append(text)
                print(f"  Cell {j}: '{text[:50]}...' (aria: {aria})")

            if len(row_data) >= 6:
                candidates.append({
                    'sn': row_data[0] if len(row_data) > 0 else '',
                    'name_nepali': row_data[1] if len(row_data) > 1 else '',
                    'party_nepali': row_data[2] if len(row_data) > 2 else '',
                    'district_nepali': row_data[3] if len(row_data) > 3 else '',
                    'constituency': convert_nepali_numbers(row_data[4]) if len(row_data) > 4 else '',
                    'age': convert_nepali_numbers(row_data[5]) if len(row_data) > 5 else '',
                    'education_nepali': row_data[6] if len(row_data) > 6 else '',
                })

        print(f"\n\nSample candidates: {json.dumps(candidates, ensure_ascii=False, indent=2)}")

        # Get pagination info
        paging = await page.query_selector('.ui-paging-info, #sp_1_jQGridDemo')
        if paging:
            paging_text = await paging.text_content()
            print(f"\nPagination: {paging_text}")

        # Get total pages
        total_el = await page.query_selector('#sp_1_jQGridDemo')
        if total_el:
            total = await total_el.text_content()
            print(f"Total pages: {total}")

        await browser.close()
        print("\nDone!")

if __name__ == '__main__':
    asyncio.run(main())
