#!/usr/bin/env python3
"""Make a transparent-background version of the white-on-black AiLIFE logo.

Alpha is taken from pixel brightness (black -> fully transparent, white -> opaque)
and every pixel is painted white, so anti-aliased edges stay smooth on any dark
background. Pure standard library (no Pillow needed).

Usage: python3 tools/make_transparent_logo.py assets/img/ailife-logo.png assets/img/ailife-logo-transparent.png
"""
import struct, sys, zlib

def read_png(path):
    d = open(path, "rb").read()
    assert d[:8] == b"\x89PNG\r\n\x1a\n"
    pos, idat = 8, b""
    while pos < len(d):
        n = struct.unpack(">I", d[pos:pos + 4])[0]; t = d[pos + 4:pos + 8]; body = d[pos + 8:pos + 8 + n]
        if t == b"IHDR":
            w, h, bd, ct, _, _, il = struct.unpack(">IIBBBBB", body)
            assert bd == 8 and il == 0 and ct in (2, 6), "expects 8-bit RGB/RGBA, non-interlaced"
            bpp = 4 if ct == 6 else 3
        elif t == b"IDAT":
            idat += body
        pos += 12 + n
    raw = zlib.decompress(idat); stride = w * bpp
    rows, prev = [], bytearray(stride)
    for y in range(h):
        f = raw[y * (stride + 1)]; line = bytearray(raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        for i in range(stride):
            a = line[i - bpp] if i >= bpp else 0; b = prev[i]; c = prev[i - bpp] if i >= bpp else 0
            if f == 1: line[i] = (line[i] + a) & 255
            elif f == 2: line[i] = (line[i] + b) & 255
            elif f == 3: line[i] = (line[i] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c; pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[i] = (line[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(line); prev = line
    return w, h, bpp, rows

def write_png(path, w, h, rows):
    raw = b"".join(b"\x00" + bytes(r) for r in rows)
    def chunk(t, body): return struct.pack(">I", len(body)) + t + body + struct.pack(">I", zlib.crc32(t + body) & 0xffffffff)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0)) \
        + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    open(path, "wb").write(png)

def main(src, dst):
    w, h, bpp, rows = read_png(src)
    out = []
    for r in rows:
        o = bytearray(w * 4)
        for x in range(w):
            R, G, B = r[x * bpp], r[x * bpp + 1], r[x * bpp + 2]
            A0 = r[x * bpp + 3] if bpp == 4 else 255
            lum = max(R, G, B)                      # white text -> 255, black bg -> 0
            o[x * 4:x * 4 + 4] = bytes((255, 255, 255, lum * A0 // 255))
        out.append(o)
    write_png(dst, w, h, out)
    print(f"wrote {dst} ({w}x{h})")

if __name__ == "__main__":
    main(*sys.argv[1:3])
