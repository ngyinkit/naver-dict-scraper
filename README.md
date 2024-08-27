# Web scraper to export words from any Naver dictionary wordlist

## About
Naver dictionary itself provides no export button for its wordlists. Therefore language learners who want to export their wordlists would either have to manually transfer long lists of words to their flashcard sets, or use pre-existing wordlists which are not curated for their learning needs. While people with technical background may have created existing scripts to scrape these wordlists, they are still not user-friendly for those without technical knowledge. Hence I created this chrome extension as a side project hoping that it can be a user-friendly way to export wordlists from Naver dictionary.

## How to install
1. Git clone this repository or download the code as a zip folder and then unzip it
2. Go to the extensions tab on google chrome (chrome://extensions/)
3. Enable "Developer mode" on the top right of the tab
4. Press on "Load unpacked" that appears on top left corner
5. Browse for the folder of the extension and select it

## Usage guide
- This extension will scrape your entire wordbook. You cannot opt to scrape only a part of it unless you use filtering.
- If you are trying to scrape Naver's TOPIK wordlists, you will have to add them to a wordbook first
- After clicking on the export button, do not touch your computer (else the popup will disappear and the output will not be shown)
- The output will be shown on the popup after the scraping is done
- This extension is mainly useful for exporting to Quizle/Knowt

### Note:
- The separator between word and definition is %
- The separator between words is @
- This extension is not customisable