"""
Normalise the client's category photographs into the storefront asset folder.

The supplied files are inconsistent: mixed dimensions (392px to 500px), mixed
aspect ratios, and backgrounds that range from pure white to light grey. Dropped
in as-is they render at wildly different visual sizes inside the same 80px tile,
and the grey-backed ones show as a visible square on the white tile.

Each is therefore:
  1. trimmed of its uniform border, so the product itself sets the framing
  2. padded back to a SQUARE on white, so nothing is cropped and every product
     occupies the same proportion of its tile
  3. capped at 400px and saved as WebP under the category slug

Source files in categories-pic/ are never modified.

USAGE
-----
    ..ackendenv\Scripts\python.exe scripts/build-category-images.py

Requires Pillow, which is already installed in the backend virtualenv. Re-run
it after adding a file to categories-pic/ and MAPPING below; then add the slug
to BY_SLUG in lib/category-images.ts.
"""
import io
import os
from PIL import Image, ImageChops

SRC = r'C:\Users\AWCD\Desktop\Project\client\Engmart\Client\categories-pic'
DST = r'C:\Users\AWCD\Desktop\Project\client\Engmart\Client\frontend\public\categories'

# Source filename -> category slug. Taken from the client's own naming, which
# is authoritative: CAM-SWITCH is the blue ON-OFF-ON unit and CHANGEOVER-OPAS
# is the Opas 1-0-2, which is the opposite of what the products look like at a
# glance. Both were opened and checked before this mapping was written.
MAPPING = {
    '13A-DUPLEX-MUL-HWDPMFSN2USB-HIMEL.jpeg': 'wiring-devices',
    'ACB-ABB.jpeg':                           'acb',
    'CAM-SWITCH.jpeg':                        'cam-switches',
    'CHANGEOVER-OPAS.jpeg':                   'changeover-switches',
    'CONSUMER-BOX-FULL-PLASTIC-HIMEL.jpeg':   'distribution-boards',
    'Current-Transformer.jpeg':               'current-transformers',
    'DIGITAL-PANEL-TENSE.jpeg':               'panel-meters',
    'FUSES-GEAR-ABB.jpeg':                    'fuses',
    'INDICATOR-LIGHT.jpeg':                   'pilot-lamps',
    'INDUSTRIAL-SOCKET-CNC.jpeg':             'plugs-sockets',
    'MCBS-DP.jpeg':                           'mcb',
    'MCCBS-TP.jpeg':                          'mccb',
    'Magnetic-Contactors-3-Pole-CHINT.jpeg':  'contactors',
    'POWER-CAPACITOR-AAB.jpeg':               'capacitors',
    'PROTECTION-RELAY.jpeg':                  'protection-relays',
    'PUSH-BUTTON.jpeg':                       'push-buttons',
    'RCCBS-ELCB-ABB.jpeg':                    'rccb',
    'VPDS.jpeg':                              'vfd',
}

#: Maximum output edge.
#:
#: These render in a 64-80px tile, so even at 2x device pixel ratio 160px is
#: enough; 400 leaves headroom without paying for pixels nobody sees. Sources
#: are never UPSCALED past their own resolution -- enlarging a 159x236 photo to
#: 500px only adds blur and bytes.
MAX_EDGE = 400
#: Fraction of the trimmed size added as breathing room, so products do not
#: touch the tile edge.
PAD = 0.06
#: WebP quality. Visually lossless at this size; PNG was the wrong choice for
#: photographs and inflated 391 KB of JPEG sources into 2.1 MB.
QUALITY = 82


def trim_border(img):
    """
    Crop the uniform background border away.

    The background colour is sampled from the top-left pixel rather than
    assumed to be white — several of these arrive on #f5f5f5 or #fafafa, and
    assuming white would leave the grey margin in place on exactly the images
    that need it removed most.
    """
    bg_colour = img.getpixel((0, 0))
    background = Image.new(img.mode, img.size, bg_colour)
    diff = ImageChops.difference(img, background).convert('L')
    # A small threshold, because JPEG compression leaves noise in flat areas —
    # without it getbbox() finds "content" in the background and trims nothing.
    mask = diff.point(lambda p: 255 if p > 12 else 0)
    box = mask.getbbox()
    return img.crop(box) if box else img


def process(src_path, slug):
    img = Image.open(src_path).convert('RGB')
    original = img.size

    img = trim_border(img)
    w, h = img.size

    # Square canvas on white. Padding rather than cropping: these are whole
    # products, and cropping a wide item like the distribution box to a square
    # would cut its ends off.
    side = int(max(w, h) * (1 + PAD * 2))
    canvas = Image.new('RGB', (side, side), (255, 255, 255))
    canvas.paste(img, ((side - w) // 2, (side - h) // 2))

    # Never enlarge beyond what the source actually contains.
    edge = min(MAX_EDGE, side)
    out = canvas.resize((edge, edge), Image.LANCZOS)

    dst_path = os.path.join(DST, f'{slug}.webp')
    out.save(dst_path, 'WEBP', quality=QUALITY, method=6)
    return original, os.path.getsize(src_path), os.path.getsize(dst_path)


os.makedirs(DST, exist_ok=True)
present = set(os.listdir(SRC))
missing = [f for f in MAPPING if f not in present]
extra = [f for f in present if f not in MAPPING and f.lower().endswith(('.jpeg', '.jpg', '.png'))]

if missing:
    print('MISSING source files:', missing)
if extra:
    print('UNMAPPED source files:', extra)

total_in = total_out = 0
print(f'{"slug":24} {"source size":>12} {"->":^4} {"output":>9}')
for filename, slug in sorted(MAPPING.items(), key=lambda kv: kv[1]):
    path = os.path.join(SRC, filename)
    if not os.path.exists(path):
        continue
    dims, size_in, size_out = process(path, slug)
    total_in += size_in
    total_out += size_out
    print(f'{slug:24} {dims[0]:>5}x{dims[1]:<6} {"->":^4} {size_in//1024:>4} KB -> {size_out // 1024:>4} KB')

print(f'\n{len(MAPPING) - len(missing)} images written to public/categories/')
print(f'total: {total_in // 1024} KB in -> {total_out // 1024} KB out')
