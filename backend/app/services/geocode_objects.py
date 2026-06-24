from __future__ import annotations

import time
from dataclasses import dataclass

import httpx

from app.core.db import SessionLocal
from app.models import Object


USER_AGENT = "OPU-Checklist/1.0 (geocoder)"
GEOCODER_URL = "https://nominatim.openstreetmap.org/search"
ASTANA_BOUNDS = {
    "min_lat": 50.95,
    "max_lat": 51.30,
    "min_lng": 71.25,
    "max_lng": 71.60,
}


@dataclass
class GeoResult:
    lat: float
    lng: float
    display_name: str


SPECIAL_QUERIES = {
    "БЦ Арман, архив": [
        "БЦ Арман, Астана",
        "БЦ Арман Бейсекбаева, Астана",
    ],
    "БЦ Арман, региональная администрация": [
        "БЦ Арман, Астана",
        "БЦ Арман Бейсекбаева, Астана",
    ],
    "БЦ Арман, отдел кадров": [
        "БЦ Арман, Астана",
        "БЦ Арман Бейсекбаева, Астана",
    ],
}


def in_astana_bounds(lat: float, lng: float) -> bool:
    return (
        ASTANA_BOUNDS["min_lat"] <= lat <= ASTANA_BOUNDS["max_lat"]
        and ASTANA_BOUNDS["min_lng"] <= lng <= ASTANA_BOUNDS["max_lng"]
    )


def build_variants(address: str, city: str) -> list[str]:
    base = address.strip()
    variants = [
        f"{base}, {city}",
        f"{base} {city}",
        f"{base}, {city}, Kazakhstan",
    ]

    if base.startswith("ул. "):
        tail = base[4:].strip()
        variants.extend(
            [
                f"улица {tail}, {city}",
                f"{tail}, {city}",
            ]
        )
    elif base.startswith("пр. "):
        tail = base[4:].strip()
        variants.extend(
            [
                f"проспект {tail}, {city}",
                f"{tail}, {city}",
            ]
        )

    if base in SPECIAL_QUERIES:
        variants.extend(SPECIAL_QUERIES[base])

    seen: set[str] = set()
    unique_variants: list[str] = []
    for item in variants:
        normalized = item.strip()
        if normalized and normalized not in seen:
            unique_variants.append(normalized)
            seen.add(normalized)
    return unique_variants


def query_geocoder(client: httpx.Client, query: str) -> GeoResult | None:
    response = client.get(
        GEOCODER_URL,
        params={
            "format": "jsonv2",
            "limit": 1,
            "countrycodes": "kz",
            "q": query,
        },
    )
    response.raise_for_status()
    payload = response.json()
    if not payload:
        return None
    first = payload[0]
    lat = float(first["lat"])
    lng = float(first["lon"])
    if not in_astana_bounds(lat, lng):
        return None
    return GeoResult(lat=lat, lng=lng, display_name=first.get("display_name", ""))


def geocode_objects() -> dict[str, int]:
    db = SessionLocal()
    try:
        objects = db.query(Object).order_by(Object.id.asc()).all()
        updated = 0
        missing = 0

        with httpx.Client(
            headers={"User-Agent": USER_AGENT, "Accept-Language": "ru"},
            timeout=30.0,
        ) as client:
            for obj in objects:
                result: GeoResult | None = None
                variants = build_variants(obj.address or obj.name, obj.city or "Астана")
                for variant in variants:
                    try:
                        result = query_geocoder(client, variant)
                    except httpx.HTTPStatusError as exc:
                        print(f"HTTP_FAIL | {obj.id} | {obj.name} | {exc.response.status_code}")
                        break
                    if result:
                        obj.latitude = result.lat
                        obj.longitude = result.lng
                        updated += 1
                        print(
                            f"UPDATED | {obj.id} | {obj.name} | "
                            f"{result.lat:.6f},{result.lng:.6f} | {variant} | {result.display_name}"
                        )
                        break
                    time.sleep(1.1)
                if not result:
                    obj.latitude = None
                    obj.longitude = None
                    missing += 1
                    print(f"MISS    | {obj.id} | {obj.name}")

        db.commit()
        return {"updated": updated, "missing": missing}
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print(geocode_objects())
