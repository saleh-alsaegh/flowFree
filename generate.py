#!/usr/bin/env python3
"""Generate artistic profile-picture variations with the Gemini API.

Reads prompts from prompts.json, reference photos from ./refs/, and writes
PNG results to ./out/<style>/. Each variation is an independent API call so
the model samples a fresh interpretation every time.

Usage:
    python generate.py                   # all styles, 4 variations each
    python generate.py --style comic     # one style
    python generate.py --count 2         # fewer variations per style
    python generate.py --dry-run         # validate prompts and refs, no API calls
"""

from __future__ import annotations

import argparse
import datetime as dt
import io
import json
import os
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROMPTS_FILE = ROOT / "prompts.json"
REFS_DIR = ROOT / "refs"
OUT_DIR = ROOT / "out"

DEFAULT_MODEL = "gemini-3-pro-image"
DEFAULT_COUNT = 4
DEFAULT_SIZE = "1K"           # 1K, 2K or 4K
ASPECT_RATIO = "1:1"
REF_MAX_SIDE = 1536           # downscale refs so uploads stay small
REF_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_RETRIES = 3


def load_env_file() -> None:
    """Load a local .env file if python-dotenv is installed and the file exists."""
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    load_dotenv(env_path)


def load_prompts(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as fh:
        data = json.load(fh)
    for field in ("likeness", "framing", "rules", "styles"):
        if field not in data:
            sys.exit(f"prompts.json is missing the '{field}' field")
    if not data["styles"]:
        sys.exit("prompts.json has no styles")
    return data


def build_prompt(data: dict, style: dict) -> str:
    """Assemble the final prompt: likeness line first, then the style idea, then rules."""
    return "\n\n".join(
        [
            data["likeness"],
            f"STYLE — {style['name']}: {style['prompt']}",
            data["framing"],
            data["rules"],
        ]
    )


def load_reference_images(refs_dir: Path) -> list[tuple[str, bytes]]:
    """Return (filename, jpeg_bytes) for every reference photo, EXIF-rotated and downscaled."""
    from PIL import Image, ImageOps

    paths = sorted(p for p in refs_dir.iterdir() if p.suffix.lower() in REF_EXTENSIONS)
    refs: list[tuple[str, bytes]] = []
    for path in paths:
        with Image.open(path) as img:
            img = ImageOps.exif_transpose(img)
            img = img.convert("RGB")
            img.thumbnail((REF_MAX_SIDE, REF_MAX_SIDE))
            buf = io.BytesIO()
            img.save(buf, format="JPEG", quality=90)
        refs.append((path.name, buf.getvalue()))
    return refs


def make_client():
    from google import genai

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        sys.exit("GEMINI_API_KEY is not set. Export it or put it in a .env file.")
    return genai.Client(api_key=api_key)


def generate_one(client, model: str, prompt: str, refs: list[tuple[str, bytes]], size: str) -> list[bytes]:
    """Run one generate_content call and return the PNG bytes of every image part."""
    from google.genai import types

    parts = [types.Part.from_bytes(data=data, mime_type="image/jpeg") for _, data in refs]
    parts.append(types.Part.from_text(text=prompt))

    config = types.GenerateContentConfig(
        response_modalities=["IMAGE"],
        image_config=types.ImageConfig(aspect_ratio=ASPECT_RATIO, image_size=size),
    )

    last_error: Exception | None = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(model=model, contents=parts, config=config)
            break
        except Exception as exc:  # noqa: BLE001 - retry any transient API failure
            last_error = exc
            if attempt == MAX_RETRIES:
                raise
            wait = 2 ** attempt
            print(f"    attempt {attempt} failed ({exc.__class__.__name__}); retrying in {wait}s")
            time.sleep(wait)
    else:  # pragma: no cover - loop always breaks or raises
        raise RuntimeError(str(last_error))

    images: list[bytes] = []
    if response.candidates:
        for part in response.candidates[0].content.parts or []:
            inline = getattr(part, "inline_data", None)
            if inline and inline.data:
                images.append(_to_png(inline.data))
    if not images:
        reason = getattr(response.candidates[0], "finish_reason", None) if response.candidates else None
        raise RuntimeError(f"no image returned (finish_reason={reason})")
    return images


def _to_png(data: bytes) -> bytes:
    """Normalise whatever the API returned into PNG bytes."""
    from PIL import Image

    with Image.open(io.BytesIO(data)) as img:
        buf = io.BytesIO()
        img.save(buf, format="PNG")
    return buf.getvalue()


def run(args: argparse.Namespace) -> int:
    load_env_file()
    data = load_prompts(PROMPTS_FILE)

    styles = data["styles"]
    if args.style:
        wanted = set(args.style)
        known = {s["key"] for s in styles}
        missing = wanted - known
        if missing:
            sys.exit(f"unknown style(s): {', '.join(sorted(missing))}. Known: {', '.join(sorted(known))}")
        styles = [s for s in styles if s["key"] in wanted]

    if not REFS_DIR.is_dir():
        sys.exit(f"reference folder not found: {REFS_DIR}. Create it and add your photos.")
    refs = load_reference_images(REFS_DIR)
    if not refs:
        sys.exit(f"no reference photos in {REFS_DIR} (accepted: {', '.join(sorted(REF_EXTENSIONS))})")

    print(f"model      : {args.model}")
    print(f"image size : {args.size} at {ASPECT_RATIO}")
    print(f"references : {len(refs)} photo(s) from {REFS_DIR.relative_to(ROOT)}/")
    print(f"styles     : {', '.join(s['key'] for s in styles)}")
    print(f"variations : {args.count} per style")

    if args.dry_run:
        print("\n--dry-run: prompts that would be sent\n")
        for style in styles:
            print(f"=== {style['key']} ===\n{build_prompt(data, style)}\n")
        return 0

    client = make_client()
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    failures = 0

    for style in styles:
        prompt = build_prompt(data, style)
        out_dir = OUT_DIR / style["key"]
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / f"{stamp}_prompt.txt").write_text(prompt, encoding="utf-8")
        print(f"\n[{style['key']}] {style['name']}")

        for i in range(1, args.count + 1):
            print(f"  variation {i}/{args.count} ...", end="", flush=True)
            try:
                images = generate_one(client, args.model, prompt, refs, args.size)
            except Exception as exc:  # noqa: BLE001 - report and continue with the next variation
                failures += 1
                print(f" FAILED: {exc}")
                continue
            for j, png in enumerate(images):
                suffix = "" if len(images) == 1 else f"_{j + 1}"
                target = out_dir / f"{stamp}_v{i}{suffix}.png"
                target.write_bytes(png)
                print(f" saved {target.relative_to(ROOT)}")

    print(f"\ndone. {failures} failure(s). Output in {OUT_DIR.relative_to(ROOT)}/")
    return 1 if failures else 0


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--style", action="append", metavar="KEY",
                        help="style key from prompts.json; repeat for several (default: all)")
    parser.add_argument("--count", type=int, default=DEFAULT_COUNT, help=f"variations per style (default {DEFAULT_COUNT})")
    parser.add_argument("--model", default=os.environ.get("GEMINI_IMAGE_MODEL", DEFAULT_MODEL),
                        help=f"Gemini image model id (default {DEFAULT_MODEL}, or $GEMINI_IMAGE_MODEL)")
    parser.add_argument("--size", default=DEFAULT_SIZE, choices=["1K", "2K", "4K"], help=f"output resolution (default {DEFAULT_SIZE})")
    parser.add_argument("--dry-run", action="store_true", help="validate inputs and print prompts without calling the API")
    args = parser.parse_args(argv)
    if args.count < 1:
        parser.error("--count must be at least 1")
    return args


if __name__ == "__main__":
    sys.exit(run(parse_args()))
