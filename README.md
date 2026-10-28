# Profile Picture Pipeline

A repeatable pipeline that turns a handful of reference photos into
AI-generated artistic profile pictures with the Gemini API. One strong idea
per image, square 1:1, head and shoulders, no props, no text.

Four styles are defined in `prompts.json`:

| key           | style                                                  |
|---------------|--------------------------------------------------------|
| `comic`       | graphic novel / bande dessinée, flat cel colours, halftone shadows |
| `charcoal`    | charcoal and sanguine chalk life study on toned paper, unfinished edges |
| `calligraphy` | beard and shadows dissolving into abstract thuluth/diwani strokes, one gold accent |
| `manga`       | seinen manga / anime key visual, clean linework, cel shading, no chibi |

Every style prompt is prefixed with the same likeness line so the model keeps
the real face from the reference photos.

## Setup

1. Python 3.10 or newer.
2. Install dependencies:

   ```bash
   python -m venv .venv
   source .venv/bin/activate        # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Get a Gemini API key from Google AI Studio and make it available either as
   an environment variable or in a `.env` file next to `generate.py`:

   ```bash
   export GEMINI_API_KEY="your-key"
   # or
   echo 'GEMINI_API_KEY=your-key' > .env
   ```

4. Put your reference photos in `./refs/` (`.jpg`, `.jpeg`, `.png`, `.webp`).
   Use clear, well-lit shots of your face only; avoid photos where other
   people's faces are visible or your face is cropped. 5 to 10 photos is
   plenty. Photos are rotated and downscaled to 1536px before upload, the
   originals are left untouched.

`out/`, `refs/` and `.env` are gitignored, so generated images, personal
photos and the key never end up in the repository.

## Run

```bash
python generate.py                      # all 4 styles, 4 variations each
python generate.py --style comic        # one style
python generate.py --style comic --style manga --count 2
python generate.py --size 2K            # 1K (default), 2K or 4K
python generate.py --dry-run            # check refs and print the prompts, no API calls
```

Results land in `out/<style>/<timestamp>_v<n>.png`, with the exact prompt
that produced them saved alongside as `<timestamp>_prompt.txt`.

## Model

The default model is `gemini-3-pro-image` (Nano Banana Pro). Override it with
`--model` or the `GEMINI_IMAGE_MODEL` environment variable, for example
`gemini-nano-banana-2.1` for a cheaper and faster run. Check the Gemini API
model list before switching, image model IDs rotate often.

## Tuning the prompts

Edit `prompts.json`:

- `likeness` is the shared first line. Keep it concrete and physical.
- `framing` and `rules` are appended to every style.
- Each entry in `styles` has a `key` (used for the CLI flag and the output
  folder), a `name`, and the `prompt` describing a single visual idea.

Add a new style by appending an object to `styles`; no code changes needed.

## Cost note

Each variation is one image-generation request. The default run is 16
requests (4 styles x 4 variations) at 1K, each sending all reference photos.
Use `--dry-run` and `--count 1` while iterating on prompts.
