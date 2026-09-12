# Category product photographs

Drop the client-supplied category shots here. They replace the emoji icons on
the homepage grid, the navbar Categories dropdown and /categories.

## These are GENERATED — do not edit by hand

The originals live in `../../../categories-pic/` as the client supplied them.
This folder holds the processed output of:

    ..ackendenv\Scripts\python.exe scripts/build-category-images.py

which trims each photo's background border, squares it on white so every
product fills its tile equally, caps it at 400px and writes WebP. That took
391 KB of mixed-size JPEGs down to 118 KB.

To change an image: replace the source in `categories-pic/`, re-run the script.

## Naming

The filename is the key — `lib/category-images.ts` maps category slugs to
these names, so a rename there must match a rename here.

| Filename                    | Category shown on            | Photo supplied              |
|-----------------------------|------------------------------|-----------------------------|
| `mcb.webp`                   | MCBs                         | DZ47Z-63 2-pole breaker     |
| `mccb.webp`                  | MCCBs                        | Schneider NSX100F           |
| `acb.webp`                   | ACBs                         | ABB SACE Emax 2             |
| `rccb.webp`                  | RCCBs & ELCBs                | ABB F204 B 4-pole           |
| `fuses.webp`                 | HRC Fuses / Fuse Gear        | ABB fuse holder             |
| `contactors.webp`            | Contactors                   | CHINT NC1-0910              |
| `cam-switches.webp`          | Cam & Selector Switches      | Opas 1-0-2 cam switch       |
| `changeover-switches.webp`   | Changeover Switches          | Blue ON-OFF-ON switch       |
| `push-buttons.webp`          | Push Buttons                 | Schneider red push button   |
| `protection-relays.webp`     | Protection Relays / Relays   | Tense voltage monitor relay |
| `panel-meters.webp`          | Panel Meters                 | Tense EM-07K multimeter     |
| `current-transformers.webp`  | Current Transformers         | Blue CT                     |
| `vfd.webp`                   | VFDs                         | CHINT NVF7                  |
| `capacitors.webp`            | Power Capacitors             | ABB power capacitor         |
| `wiring-devices.webp`        | Wiring Devices / Sockets     | Himel wall socket + switch  |
| `plugs-sockets.webp`         | Industrial Plugs & Sockets   | Blue industrial plug/socket |
| `distribution-boards.webp`   | Distribution Boards          | Himel distribution box      |
| `pilot-lamps.webp`           | Pilot Lamps / Indicators     | Green/red/yellow lamps      |

## Image requirements

- **Square**, roughly 500x500. They render at 64-80px, so anything larger is
  wasted bytes on every page load.
- **White or transparent background.** They are drawn with `object-contain` on
  a white tile, so a coloured or photographic background shows as a visible
  block behind the product.
- **PNG.** Use transparency where the product is cut out.

## Adding a category later

1. Save `public/categories/<category-slug>.webp`
2. Add one line to `BY_SLUG` in `lib/category-images.ts`

The slug is the one in the URL: `/categories/mcb` -> `mcb`.

## Overriding from the admin panel

Admin -> Categories -> edit -> upload an image. An uploaded image takes
precedence over the file here, so the client can swap any photo without a code
change or a deploy.
