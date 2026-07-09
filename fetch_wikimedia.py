import urllib.request
import urllib.parse
import json
import os
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

queries = {
    "museum_uvaysi": "Jahonotin Uvaysiy",
    "museum_hamza": "Hamza Hakimzade",
    "museum_haziniy": "Haziniy",
    "museum_vohidov": "Erkin Vohidov",
    "museum_zavqiy": "Zavqiy",
    "expo_hall_1": "Uzbekistan museum",
    "expo_hall_2": "Kokand palace interior",
    "expo_hall_3": "Islamic manuscript",
}

def search_wikimedia(query):
    print(f"Searching wikimedia for {query}...")
    url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=" + urllib.parse.quote(query) + "&gsrlimit=1&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Bot/1.0'})
    try:
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
        data = json.loads(html)
        pages = data.get('query', {}).get('pages', {})
        for page_id, page_info in pages.items():
            image_info = page_info.get('imageinfo', [])
            if image_info:
                return image_info[0].get('url')
    except Exception as e:
        print(f"Error for {query}: {e}")
    return None

os.makedirs("server/public/uploads", exist_ok=True)

for name, q in queries.items():
    img_url = search_wikimedia(q)
    if not img_url:
        print(f"No image found for {name} using main query, trying fallback...")
        # fallback generic
        img_url = search_wikimedia("Kokand")
        
    if img_url:
        print(f"Found {img_url} for {name}")
        try:
            req = urllib.request.Request(img_url, headers={'User-Agent': 'Bot/1.0'})
            img_data = urllib.request.urlopen(req, context=ctx, timeout=10).read()
            with open(f"server/public/uploads/{name}.jpg", "wb") as f:
                f.write(img_data)
        except Exception as e:
            print(f"Failed to download {name}: {e}")
    else:
        print(f"Still no image found for {name}")
