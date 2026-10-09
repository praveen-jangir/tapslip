import os, re, urllib.request

LOG = 'scripts/download.log'
WIDTHS = [1280, 960, 500]
UA = {'User-Agent': 'TapslipDemo/1.0 (demo app; contact: dev@example.com)'}

entries = {}
with open(LOG) as f:
    for line in f:
        m = re.match(r'OK (\S+) (\d+) <- (\S+)', line.strip())
        if m:
            entries[m.group(1)] = (int(m.group(2)), m.group(3))

for path, (size, url) in sorted(entries.items()):
    if size >= 100000:
        print('KEEP', path, size)
        continue
    if '/thumb/' not in url:
        print('NO_THUMB_URL', path)
        continue
    base = url.split('?')[0]
    m = re.search(r'/(\d+)px-', base)
    if not m:
        print('NO_WIDTH', path)
        continue
    ok = False
    for w in WIDTHS:
        cand = base[:m.start(1)] + str(w) + base[m.end(1):]
        try:
            req = urllib.request.Request(cand, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as resp, open(path, 'wb') as f:
                f.write(resp.read())
            print('UPGRADED', path, os.path.getsize(path), '<-', cand)
            ok = True
            break
        except Exception as e:
            print('TRY_FAIL', path, w, repr(e))
    if not ok:
        print('STILL_SMALL', path)

print('DOWNLOAD_DONE')
