"""Compose a 4-photo Instagram post (1080x1350, 4:5 portrait).

Usage: python3 scripts/make_food_post.py <img1> <img2> <img3> <img4> <out.jpg>
img1: full plate (pork belly + veg rice)   img2: scallion tofu
img3: same plate, used for a close-up crop  img4: lion's head meatball
"""
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1080, 1350
BG = (247, 241, 233)
INK = (38, 28, 24)
RED = (196, 28, 36)
MUTED = (128, 110, 98)

FONT_DIR = "/usr/share/fonts"
SERIF_IT = f"{FONT_DIR}/truetype/crosextra/Caladea-BoldItalic.ttf"
SANS_MED = f"{FONT_DIR}/opentype/inter/Inter-Medium.otf"
SANS_SEMI = f"{FONT_DIR}/opentype/inter/Inter-SemiBold.otf"
CJK = f"{FONT_DIR}/truetype/wqy/wqy-zenhei.ttc"


def font(path, size):
    return ImageFont.truetype(path, size)


def cover(img, box, size):
    """Crop img to box (l, t, r, b), then fit to size keeping the aspect ratio of size."""
    tw, th = size
    l, t, r, b = box
    bw, bh = r - l, b - t
    target = tw / th
    if bw / bh > target:
        nw = bh * target
        cx = (l + r) / 2
        l, r = cx - nw / 2, cx + nw / 2
    else:
        nh = bw / target
        cy = (t + b) / 2
        t, b = cy - nh / 2, cy + nh / 2
    return img.crop((int(l), int(t), int(r), int(b))).resize(size, Image.LANCZOS)


def tracked(draw, xy, text, fnt, fill, tracking):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + tracking
    return x


def tracked_width(draw, text, fnt, tracking):
    return sum(draw.textlength(c, font=fnt) for c in text) + tracking * (len(text) - 1)


def tile(canvas, photo, pos, size, label, radius=22):
    tw, th = size
    # soft shadow
    shadow = Image.new("RGBA", (tw + 60, th + 60), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((30, 38, tw + 30, th + 38), radius, fill=(60, 30, 20, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(14))
    canvas.alpha_composite(shadow, (pos[0] - 30, pos[1] - 30))

    ph = photo.convert("RGBA")
    # bottom gradient for label legibility
    grad = Image.new("L", (1, th))
    for y in range(th):
        k = max(0, (y - th * 0.62) / (th * 0.38))
        grad.putpixel((0, y), int(170 * k ** 1.4))
    shade = Image.new("RGBA", (tw, th), (20, 10, 6, 0))
    shade.putalpha(grad.resize((tw, th)))
    ph.alpha_composite(shade)

    d = ImageDraw.Draw(ph)
    f = font(SANS_SEMI, 22)
    tracked(d, (26, th - 50), label.upper(), f, (255, 248, 240), 2.2)

    mask = Image.new("L", (tw, th), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, tw, th), radius, fill=255)
    canvas.paste(ph, pos, mask)


def main(p1, p2, p3, p4, out):
    canvas = Image.new("RGBA", (W, H), BG + (255,))
    d = ImageDraw.Draw(canvas)

    M, GAP = 48, 18
    top = 236
    tw = (W - 2 * M - GAP) // 2
    th = 482
    size = (tw, th)

    im1, im2, im3, im4 = (Image.open(p) for p in (p1, p2, p3, p4))
    photos = [
        (cover(im1, (0, 120, 960, 1120), size), "Pork Belly & Veg Rice"),
        (cover(im2, (60, 140, 920, 980), size), "Scallion Tofu"),
        (cover(im4, (40, 0, 940, 898), size), "Lion's Head"),
        (cover(im3, (430, 320, 905, 930), size), "Up Close"),
    ]
    for i, (ph, label) in enumerate(photos):
        x = M + (i % 2) * (tw + GAP)
        y = top + (i // 2) * (th + GAP)
        tile(canvas, ph, (x, y), size, label)

    # header
    kicker_f = font(SANS_SEMI, 21)
    kicker = "SHANGHAINESE  SUPPER"
    kw = tracked_width(d, kicker, kicker_f, 5)
    tracked(d, ((W - kw) / 2, 58), kicker, kicker_f, RED, 5)

    title_f = font(SERIF_IT, 82)
    title = "Red-Braised & Glazed"
    d.text((W / 2, 150), title, font=title_f, fill=INK, anchor="mm")

    # seal stamp, top-right
    seal = 74
    sx, sy = W - M - seal, 44
    d.rounded_rectangle((sx, sy, sx + seal, sy + seal), 10, fill=RED)
    cf = font(CJK, 26)
    d.text((sx + seal / 2, sy + seal / 2 - 15), "本帮", font=cf, fill=BG, anchor="mm")
    d.text((sx + seal / 2, sy + seal / 2 + 16), "风味", font=cf, fill=BG, anchor="mm")

    # footer
    fy = top + 2 * th + GAP + 46
    d.line((M, fy - 22, W - M, fy - 22), fill=(222, 210, 198), width=2)
    foot_f = font(SANS_MED, 22)
    foot = "BRAISED  ·  GLAZED  ·  GONE IN MINUTES"
    fw = tracked_width(d, foot, foot_f, 3.5)
    tracked(d, ((W - fw) / 2, fy), foot, foot_f, MUTED, 3.5)

    canvas.convert("RGB").save(out, quality=94, subsampling=0)


if __name__ == "__main__":
    if len(sys.argv) != 6:
        sys.exit(__doc__)
    main(*sys.argv[1:])
