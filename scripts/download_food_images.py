import json, urllib.request, urllib.parse, os, time

DISHES = {
    'paneer-tikka': ['Paneer tikka'],
    'chicken-biryani': ['Chicken biryani', 'Biryani'],
    'spring-rolls': ['Spring rolls'],
    'chicken-wings': ['Chicken wings', 'Chicken wing'],
    'french-fries': ['French fries'],
    'garlic-bread': ['Garlic bread'],
    'butter-chicken': ['Butter chicken'],
    'dal-makhani': ['Dal makhani'],
    'masala-dosa': ['Masala dosa'],
    'mojito': ['Mojito'],
    'soft-drink': ['Soft drink', 'Cola'],
    'butter-naan': ['Naan'],
    'tandoori-roti': ['Roti'],
    'gulab-jamun': ['Gulab jamun'],
}

os.makedirs('assets/food', exist_ok=True)
log = open('scripts/download.log', 'w')


def out(msg):
    print(msg)
    log.write(msg + '\n')
    log.flush()


for slug, titles in DISHES.items():
    if any(f.startswith(slug + '.') for f in os.listdir('assets/food')):
        out('SKIP ' + slug)
        continue
    done = False
    for title in titles:
        if done:
            break
        try:
            api = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + urllib.parse.quote(title.replace(' ', '_'))
            req = urllib.request.Request(api, headers={'User-Agent': 'TapslipDemo/1.0 (demo app; contact: dev@example.com)'})
            data = json.load(urllib.request.urlopen(req, timeout=20))
        except Exception as e:
            out('API_FAIL ' + slug + ' ' + repr(e))
            time.sleep(3)
            continue
        cands = []
        orig = (data.get('originalimage') or {}).get('source')
        thumb = (data.get('thumbnail') or {}).get('source')
        if orig and not orig.lower().endswith(('.svg', '.tif', '.tiff')):
            cands.append(orig)
        if thumb:
            cands.append(thumb)
        for src in cands:
            try:
                ext = os.path.splitext(urllib.parse.urlparse(src).path)[1].lower() or '.jpg'
                if ext not in ('.jpg', '.jpeg', '.png', '.webp'):
                    ext = '.jpg'
                path = 'assets/food/%s%s' % (slug, ext)
                r2 = urllib.request.Request(src, headers={'User-Agent': 'TapslipDemo/1.0 (demo app; contact: dev@example.com)'})
                with urllib.request.urlopen(r2, timeout=40) as resp, open(path, 'wb') as f:
                    f.write(resp.read())
                out('OK %s %d <- %s' % (path, os.path.getsize(path), src))
                done = True
                break
            except Exception as e:
                out('DL_FAIL ' + slug + ' ' + repr(e))
        time.sleep(2)

out('DONE')
