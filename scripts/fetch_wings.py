"""Fetch a chicken wings food photo for assets/food/chicken-wings.jpg.

The original download script's article titles have no free page image (the
Buffalo wings infobox image is non-free), and plain 'Chicken' pageimages give
live chickens — so search Wikimedia Commons for real dish photos instead.
"""
import json
import time
import urllib.parse
import urllib.request

QUERIES = [
    'buffalo wings chicken',
    'chicken wings dish',
    'fried chicken wings',
]

HEADERS = {'User-Agent': 'TapslipDev/1.0 (food image assets)'}
DST = 'assets/food/chicken-wings.jpg'


def search_commons(query):
    url = (
        'https://commons.wikimedia.org/w/api.php?action=query&generator=search'
        '&gsrsearch='
        + urllib.parse.quote('filetype:bitmap ' + query)
        + '&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url%7Cmime&iiurlwidth=1280&format=json'
    )
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.load(resp)
    urls = []
    for page in data.get('query', {}).get('pages', {}).values():
        infos = page.get('imageinfo') or []
        if not infos:
            continue
        info = infos[0]
        mime = info.get('mime', '')
        if mime not in ('image/jpeg', 'image/png'):
            continue
        url = info.get('thumburl') or info.get('url')
        print(' ', page.get('title'), '->', url)
        if url:
            urls.append(url)
    return urls


def main():
    for query in QUERIES:
        print('query:', query)
        urls = search_commons(query)
        if urls:
            req = urllib.request.Request(urls[0], headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as resp, open(DST, 'wb') as out:
                out.write(resp.read())
            print('saved', DST, 'from', urls[0])
            return
        time.sleep(1.5)
    raise SystemExit('NO_IMAGE_FOUND')


if __name__ == '__main__':
    main()
