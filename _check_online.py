import urllib.request, re
url = "https://avery524888.github.io/amy-learning/?t=5"
with urllib.request.urlopen(url, timeout=30) as r:
    t = r.read().decode('utf-8', errors='replace')
print('len', len(t))
print('data:image', t.count('data:image'))
print('images/', t.count('images/'))
print('DRAW_SCENES', t.count('const DRAW_SCENES'))
m = re.findall(r'name:"([^"]+)"', t)
print('names count', len(m))
print(m[:30])
print('---first 500 chars---')
print(t[:500])
