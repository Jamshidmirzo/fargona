import urllib.request
import urllib.parse
import re
import ssl
import sys
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

queries = {
    "museum_uvaysi": "Дом-музей Увайси Маргилан",
    "museum_hamza": "Дом-музей Хамзы Коканд",
    "museum_haziniy": "Мавзолей Хазиний Фергана",
    "museum_vohidov": "Парк и музей Эркин Вохидов Маргилан",
    "museum_zavqiy": "Дом музей Завкий Коканд",
    "expo_hall_1": "Традиционный узбекский двор мехмонхона Коканд",
    "expo_hall_2": "Узбекская старинная резная дверь",
    "expo_hall_3": "Узбекский национальный интерьер музей",
}

def search_ddg(query):
    print(f"Searching for {query}...")
    # duckduckgo html search
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query + " фото")
    req = urllib.request.Request(
        url, 
        data=None, 
        headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'
        }
    )
    try:
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
        # find image links in DDG HTML - usually something like src="//external-content.duckduckgo.com/iu/?u=..."
        matches = re.findall(r'src="//external-content\.duckduckgo\.com/iu/\?u=([^&]+)', html)
        if matches:
            for match in matches:
                img_url = urllib.parse.unquote(match)
                if img_url.startswith("http"):
                    return img_url
    except Exception as e:
        print(e)
    return None

os.makedirs("server/public/uploads", exist_ok=True)

for name, q in queries.items():
    img_url = search_ddg(q)
    if img_url:
        print(f"Found {img_url} for {name}")
        try:
            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            img_data = urllib.request.urlopen(req, context=ctx, timeout=10).read()
            with open(f"server/public/uploads/{name}.jpg", "wb") as f:
                f.write(img_data)
        except Exception as e:
            print(f"Failed to download {name}: {e}")
    else:
        print(f"No image found for {name}")
