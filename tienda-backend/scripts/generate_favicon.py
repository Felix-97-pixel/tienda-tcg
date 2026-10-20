import os
import zlib
import struct
import math

def render_pixel(x, y, w, h):
    # Normalized coordinates (-1 to 1)
    nx = (x - w / 2.0) / (w / 2.0)
    ny = (y - h / 2.0) / (h / 2.0)
    
    # Outer squircle mask: x^4 + y^4 <= 1.0 (with slight inset)
    dist4 = (nx**4 + ny**4)**0.25
    if dist4 > 0.95:
        return (0, 0, 0, 0) # Transparent background
    
    # Border stroke
    if dist4 > 0.82:
        # Red to amber gradient border
        t = (nx + ny + 2.0) / 4.0
        r = int(239 + (249 - 239) * t)
        g = int(68 + (115 - 68) * t)
        b = int(68 + (22 - 68) * t)
        return (r, g, b, 255)
    
    # Inner background: dark slate obsidian
    # Check if inside card area (central rect, w*0.7, h*0.8)
    card_w = w * 0.72
    card_h = h * 0.80
    cx = (w - card_w) / 2.0
    cy = (h - card_h) / 2.0
    
    in_card = (cx <= x <= cx + card_w) and (cy <= y <= cy + card_h)
    
    if in_card:
        # Check if inside "T" letter
        # Top bar: y from cy + card_h*0.14 to cy + card_h*0.38, x from cx + card_w*0.15 to cx + card_w*0.85
        # Stem: y from cy + card_h*0.38 to cy + card_h*0.86, x from cx + card_w*0.38 to cx + card_w*0.62
        top_bar = (cy + card_h * 0.12 <= y <= cy + card_h * 0.36) and (cx + card_w * 0.14 <= x <= cx + card_w * 0.86)
        stem = (cy + card_h * 0.36 < y <= cy + card_h * 0.88) and (cx + card_w * 0.36 <= x <= cx + card_w * 0.64)
        
        # Holographic star in top right corner
        star_x = cx + card_w * 0.82
        star_y = cy + card_h * 0.18
        is_star = ((abs(x - star_x) <= 1 and abs(y - star_y) <= 2) or (abs(x - star_x) <= 2 and abs(y - star_y) <= 1))
        
        if is_star:
            return (254, 240, 138, 255) # Gold sparkle
        
        if top_bar or stem:
            return (255, 255, 255, 255) # White bold T
        
        # Card body: vibrant fiery red gradient
        card_t = ((x - cx) + (y - cy)) / (card_w + card_h)
        cr = int(220 + (249 - 220) * card_t)
        cg = int(38 + (115 - 38) * card_t)
        cb = int(38 + (22 - 38) * card_t)
        return (cr, cg, cb, 255)
    
    # Outer dark obsidian
    return (15, 19, 30, 255)

def make_png(size):
    raw_data = bytearray()
    for y in range(size):
        raw_data.append(0) # filter None
        for x in range(size):
            r, g, b, a = render_pixel(x, y, size, size)
            raw_data.extend([r, g, b, a])
    
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw_data), 9))
    png += chunk(b'IEND', b'')
    return png

def make_ico(sizes=[16, 32, 48]):
    pngs = [make_png(s) for s in sizes]
    
    # ICO Header: reserved (2), type (2), image count (2)
    ico_header = struct.pack('<HHH', 0, 1, len(sizes))
    
    # Directory entries: 16 bytes each
    offset = 6 + 16 * len(sizes)
    entries = bytearray()
    for s, png in zip(sizes, pngs):
        width = s if s < 256 else 0
        height = s if s < 256 else 0
        entries += struct.pack('<BBBBHHII', width, height, 0, 0, 1, 32, len(png), offset)
        offset += len(png)
        
    return bytes(ico_header + entries + b''.join(pngs))

if __name__ == '__main__':
    ico_bytes = make_ico([16, 32, 48])
    png32_bytes = make_png(32)
    png64_bytes = make_png(64)
    
    paths = [
        'tienda-front/src/app/favicon.ico',
        'tienda-front/public/favicon.ico',
    ]
    for p in paths:
        with open(p, 'wb') as f:
            f.write(ico_bytes)
        print(f'Wrote ICO to {p} ({len(ico_bytes)} bytes)')
        
    with open('tienda-front/src/app/icon.png', 'wb') as f:
        f.write(png32_bytes)
    print('Wrote icon.png (32x32)')
    
    with open('tienda-front/src/app/apple-icon.png', 'wb') as f:
        f.write(png64_bytes)
    print('Wrote apple-icon.png (64x64)')
