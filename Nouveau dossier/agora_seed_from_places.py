import os
import time
import json
import hashlib
from typing import Dict, List, Optional, Any

import requests
from dotenv import load_dotenv
from tqdm import tqdm
from slugify import slugify

import cloudinary
import cloudinary.uploader

# -------------------------
# SETTINGS (SAFE DEFAULTS)
# -------------------------
CITIES = ["Casablanca, Morocco", "Marrakech, Morocco", "Agadir, Morocco", "Tangier, Morocco"]

# Edit to match your Prisma enum categories
MAIN_CATEGORIES = {
    "RESTAURANT": ["restaurant", "fine dining", "brasserie", "pizzeria", "sushi"],
    "CAFE": ["cafe", "coffee", "bakery", "patisserie"],
    "BAR": ["bar", "cocktail bar", "lounge"],
    "NIGHTCLUB": ["nightclub", "club", "dj club"],
    "SPA": ["spa", "hammam", "massage", "wellness"],
}

# Keep costs low & stable
MAX_VENUES_PER_CITY_PER_CATEGORY = 25     # reduce/increase
MAX_PHOTOS_PER_VENUE = 4                  # 1 cover + 3 gallery
MIN_RATING = 0.0                          # set 4.0 later
MIN_REVIEWS = 0                           # set 20 later
SLEEP_SEC = 0.2

# ---------------
# INIT
# ---------------
load_dotenv()
GOOGLE_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()
if not GOOGLE_KEY:
    raise SystemExit("Missing GOOGLE_PLACES_API_KEY in .env")

cloudinary.config(secure=True)
CLOUDINARY_FOLDER = os.getenv("CLOUDINARY_FOLDER", "agora/venues")

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "AGORA-seeder/1.0"})


def sha1(s: str) -> str:
    return hashlib.sha1(s.encode("utf-8")).hexdigest()[:10]


def places_text_search(query: str, pagetoken: Optional[str] = None) -> Dict[str, Any]:
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {"query": query, "key": GOOGLE_KEY}
    if pagetoken:
        params["pagetoken"] = pagetoken
    r = SESSION.get(url, params=params, timeout=30)
    time.sleep(SLEEP_SEC)
    r.raise_for_status()
    return r.json()


def place_details(place_id: str) -> Dict[str, Any]:
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    fields = ",".join([
        "place_id", "name", "formatted_address", "geometry/location",
        "formatted_phone_number", "international_phone_number",
        "website", "url", "rating", "user_ratings_total",
        "price_level", "types", "photos"
    ])
    r = SESSION.get(url, params={"place_id": place_id, "fields": fields, "key": GOOGLE_KEY}, timeout=30)
    time.sleep(SLEEP_SEC)
    r.raise_for_status()
    return r.json()


def places_photo_url(photo_ref: str, maxwidth: int = 1600) -> str:
    return (
        "https://maps.googleapis.com/maps/api/place/photo"
        f"?maxwidth={maxwidth}&photo_reference={photo_ref}&key={GOOGLE_KEY}"
    )


def upload_to_cloudinary(image_url: str, public_id_hint: str) -> Optional[str]:
    """
    Uploads remote image URL to Cloudinary and returns secure_url.
    """
    try:
        res = cloudinary.uploader.upload(
            image_url,
            folder=CLOUDINARY_FOLDER,
            public_id=public_id_hint[:120],
            overwrite=False,
            unique_filename=True,
            resource_type="image",
        )
        return res.get("secure_url")
    except Exception as e:
        # You can print(e) if you want debug
        return None


def collect_place_ids(city: str, keywords: List[str], cap: int) -> List[str]:
    """
    Collect unique place_ids for a city/category with a hard cap.
    """
    place_ids: List[str] = []
    cap_each_keyword = max(3, cap // max(1, len(keywords)))

    for kw in keywords:
        query = f"{kw} in {city}"
        data = places_text_search(query=query)

        if data.get("status") not in ("OK", "ZERO_RESULTS"):
            continue

        for it in data.get("results", []):
            pid = it.get("place_id")
            if pid and pid not in place_ids:
                place_ids.append(pid)
            if len(place_ids) >= cap:
                return place_ids

        token = data.get("next_page_token")
        while token and len(place_ids) < cap:
            time.sleep(2.0)  # token warm-up
            page = places_text_search(query=query, pagetoken=token)

            for it in page.get("results", []):
                pid = it.get("place_id")
                if pid and pid not in place_ids:
                    place_ids.append(pid)
                if len(place_ids) >= cap:
                    return place_ids

            token = page.get("next_page_token")

        if len(place_ids) >= cap_each_keyword * len(keywords):
            # already enough, move on
            pass

    return place_ids[:cap]


def build_record(city: str, main_category: str, det: Dict[str, Any],
                 cover_url: Optional[str], gallery_urls: List[str]) -> Optional[Dict[str, Any]]:
    if det.get("status") != "OK":
        return None
    r = det.get("result", {})
    name = (r.get("name") or "").strip()
    address = r.get("formatted_address")
    rating = float(r.get("rating") or 0.0)
    reviews = int(r.get("user_ratings_total") or 0)

    if not name or not address:
        return None
    if rating < MIN_RATING or reviews < MIN_REVIEWS:
        return None

    city_name = city.split(",")[0].strip()
    pid = r.get("place_id") or sha1(name + city_name)
    slug = f"{slugify(name + ' ' + city_name)}-{sha1(pid)}"

    loc = (r.get("geometry") or {}).get("location") or {}
    return {
        "name": name,
        "slug": slug,
        "mainCategory": main_category,
        "city": city_name,
        "address": address,
        "lat": loc.get("lat"),
        "lng": loc.get("lng"),
        "phone": r.get("international_phone_number") or r.get("formatted_phone_number"),
        "website": r.get("website"),
        "locationUrl": r.get("url"),
        "rating": rating,
        "numReviews": reviews,
        "priceLevel": r.get("price_level"),
        "coverImageUrl": cover_url,
        "galleryUrls": gallery_urls,
        "source": "google_places",
        "sourcePlaceId": pid,
        "sourceTypes": r.get("types") or [],
    }


def export_files(records: List[Dict[str, Any]], prefix: str = "agora_venues_with_photos"):
    import pandas as pd

    jsonl_path = f"{prefix}.jsonl"
    csv_path = f"{prefix}.csv"

    with open(jsonl_path, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    pd.DataFrame(records).to_csv(csv_path, index=False)
    print("✅ Exported:")
    print(" -", os.path.abspath(jsonl_path))
    print(" -", os.path.abspath(csv_path))


def main():
    print("RUNNING FROM:", os.getcwd())

    all_records: List[Dict[str, Any]] = []

    for city in CITIES:
        for main_cat, keywords in MAIN_CATEGORIES.items():
            place_ids = collect_place_ids(city, keywords, cap=MAX_VENUES_PER_CITY_PER_CATEGORY)

            for pid in tqdm(place_ids, desc=f"{city} / {main_cat}"):
                det = place_details(pid)
                r = det.get("result", {})
                photos = r.get("photos") or []
                refs = [p.get("photo_reference") for p in photos if p.get("photo_reference")]

                # ---- PHOTO EXTRACTION + CLOUDINARY UPLOAD ----
                cover_url = None
                gallery_urls: List[str] = []

                if refs:
                    # 1 cover + N gallery
                    cover_ref = refs[0]
                    gallery_refs = refs[1:MAX_PHOTOS_PER_VENUE]

                    cover_src = places_photo_url(cover_ref, 1600)
                    cover_url = upload_to_cloudinary(cover_src, f"{pid}-cover")

                    for i, ref in enumerate(gallery_refs):
                        src = places_photo_url(ref, 1600)
                        up = upload_to_cloudinary(src, f"{pid}-g{i+1}")
                        if up:
                            gallery_urls.append(up)

                rec = build_record(city, main_cat, det, cover_url, gallery_urls)
                if rec:
                    all_records.append(rec)

    # de-dup by slug
    by_slug = {r["slug"]: r for r in all_records}
    final = list(by_slug.values())

    print("TOTAL RECORDS:", len(final))
    export_files(final)


if __name__ == "__main__":
    main()
