#!/usr/bin/env python3
"""Square avatar (e.g. for the GitHub organization) from the rectangular AiLIFE logo.

The white-on-black logo is scaled (bilinear) to a fraction of the square's width
and centred on a solid or gradient background. Standard library only.

Usage: python3 tools/make_square_avatar.py SRC.png OUT.png [size] [logo_fraction] [bg]
  bg: "black" (default) or "navy" (UH mainBlue-90 -> 80 diagonal gradient)
"""
import sys, zlib, struct
sys.path.insert(0, __import__("os").path.dirname(__file__))
from make_transparent_logo import read_png, write_png

def main(src, dst, size=1000, frac=0.78, bg="black"):
    size, frac = int(size), float(frac)
    w, h, bpp, rows = read_png(src)
    tw = int(size * frac); th = round(h * tw / w)
    ox, oy = (size - tw) // 2, (size - th) // 2
    def bgc(x, y):
        if bg == "navy":
            t = (x + y) / (2 * size)
            a, b = (0x00, 0x19, 0x29), (0x00, 0x31, 0x52)
            return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))
        return (0, 0, 0)
    def lum(px, py):  # brightness of the source logo at integer pixel
        r = rows[py]; i = px * bpp
        return max(r[i], r[i + 1], r[i + 2])
    out = []
    for y in range(size):
        line = bytearray(size * 4)
        for x in range(size):
            R, G, B = bgc(x, y); A = 0
            if ox <= x < ox + tw and oy <= y < oy + th:
                sx = (x - ox + .5) * w / tw - .5; sy = (y - oy + .5) * h / th - .5
                x0, y0 = max(0, int(sx)), max(0, int(sy)); x1, y1 = min(w - 1, x0 + 1), min(h - 1, y0 + 1)
                fx, fy = sx - x0, sy - y0
                A = (lum(x0, y0) * (1 - fx) + lum(x1, y0) * fx) * (1 - fy) + (lum(x0, y1) * (1 - fx) + lum(x1, y1) * fx) * fy
            a = A / 255
            line[x * 4:x * 4 + 4] = bytes((round(R + (255 - R) * a), round(G + (255 - G) * a), round(B + (255 - B) * a), 255))
        out.append(line)
    write_png(dst, size, size, out)
    print(f"wrote {dst} ({size}x{size}, logo {tw}x{th}, bg {bg})")

if __name__ == "__main__":
    main(*sys.argv[1:])
