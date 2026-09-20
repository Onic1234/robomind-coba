from PIL import Image, ImageDraw

img_path = r'C:\Users\Acer\.gemini\antigravity-ide\brain\2ca8608e-2bca-48b5-ba55-0da34bae6ffa\.user_uploaded\media_1789912076858.png'
img = Image.open(img_path).convert("RGBA")
draw = ImageDraw.Draw(img)

# White platform surface color
PLATFORM_WHITE = (252, 252, 254, 255)
WALL_PURPLE = (185, 183, 222, 255)
OUTLINE_BLACK = (0, 0, 0, 255)

# 1. Top-Right Girl & Thought Bubble (X: 785..865, Y: 0..85)
draw.rectangle([785, 0, 865, 85], fill=PLATFORM_WHITE)
# Draw back platform top edge outline if needed
draw.line([785, 85, 865, 85], fill=OUTLINE_BLACK, width=2)

# 2. Red Ribbon on right cliff (X: 850..888, Y: 165..202)
draw.rectangle([850, 165, 888, 202], fill=PLATFORM_WHITE)

# 3. Top-Left Purple Dots
draw.ellipse([155, 132, 190, 165], fill=PLATFORM_WHITE)
draw.ellipse([245, 198, 280, 230], fill=PLATFORM_WHITE)

# 4. Top-Left Blue Stick Figure
draw.rectangle([140, 198, 178, 248], fill=PLATFORM_WHITE)

# 5. Black Stick Figure Guards
draw.rectangle([512, 12, 540, 55], fill=PLATFORM_WHITE)   # Guard Top Center
draw.rectangle([210, 382, 238, 428], fill=PLATFORM_WHITE) # Guard Upper Left
draw.rectangle([670, 520, 700, 570], fill=PLATFORM_WHITE) # Guard Mid Right
draw.rectangle([198, 698, 228, 748], fill=PLATFORM_WHITE) # Guard Lower Left
draw.rectangle([500, 752, 532, 800], fill=PLATFORM_WHITE) # Guard Lower Center

img.save('scratch/cleaned_map.png')
print("Successfully saved cleaned_map.png!")
