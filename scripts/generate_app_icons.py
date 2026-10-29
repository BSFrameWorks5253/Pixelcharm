import os
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD_DIR = os.path.join(ROOT_DIR, "build")
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")

os.makedirs(BUILD_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

def create_pixelcharm_icon(size=512):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Background Squircle with Dark Indigo Obsidian fill
    radius = int(size * 0.22)
    draw.rounded_rectangle([(8, 8), (size - 8, size - 8)], radius=radius, fill=(16, 14, 28, 255), outline=(0, 245, 255, 180), width=int(size * 0.025))

    # 2. Gradient Accent Arc
    draw.rounded_rectangle([(int(size * 0.08), int(size * 0.08)), (int(size * 0.92), int(size * 0.92))], radius=int(radius * 0.8), outline=(236, 72, 153, 160), width=int(size * 0.015))

    # 3. Draw Monogram 'PC'
    # Try system fonts
    font = None
    for font_name in ["arialbd.ttf", "segoeuib.ttf", "consola.ttf", "tahoma.ttf"]:
        try:
            font = ImageFont.truetype(font_name, int(size * 0.44))
            break
        except Exception:
            pass

    if font is None:
        font = ImageFont.load_default()

    text = "Pc"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    text_x = (size - text_w) // 2
    text_y = (size - text_h) // 2 - int(size * 0.03)

    # Glow / Drop Shadow
    draw.text((text_x + 3, text_y + 3), text, font=font, fill=(0, 200, 255, 120))
    draw.text((text_x, text_y), text, font=font, fill=(255, 255, 255, 255))

    return img

if __name__ == "__main__":
    icon_img = create_pixelcharm_icon(512)
    
    # Save PNG
    png_path = os.path.join(BUILD_DIR, "icon.png")
    icon_img.save(png_path, "PNG")
    public_png_path = os.path.join(PUBLIC_DIR, "icon.png")
    icon_img.save(public_png_path, "PNG")

    # Save Multi-size ICO
    ico_path = os.path.join(BUILD_DIR, "icon.ico")
    icon_img.save(ico_path, format="ICO", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print(f"Generated icon assets successfully: {ico_path}, {png_path}")
