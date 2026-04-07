from PIL import Image
import os

# Abrir la imagen del escudo
img_path = '/home/z/my-project/public/escudo.jpg'
img = Image.open(img_path)

# Convertir a RGBA si no lo está
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Crear múltiples tamaños para el icono
sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
icons = []

for size in sizes:
    resized = img.resize(size, Image.Resampling.LANCZOS)
    icons.append(resized)

# Guardar como archivo .ico
icon_path = '/home/z/my-project/public/grupo-lisea-icon.ico'
icons[0].save(
    icon_path,
    format='ICO',
    sizes=sizes,
    append_images=icons[1:]
)

print(f"✓ Icono creado: {icon_path}")

# También crear un PNG de alta calidad para usar como icono alternativo
png_path = '/home/z/my-project/public/grupo-lisea-icon.png'
img_resized = img.resize((256, 256), Image.Resampling.LANCZOS)
img_resized.save(png_path, 'PNG')
print(f"✓ PNG creado: {png_path}")

print("\nArchivos generados:")
print("1. grupo-lisea-icon.ico - Para carpetas de Windows")
print("2. grupo-lisea-icon.png - Para uso general")
