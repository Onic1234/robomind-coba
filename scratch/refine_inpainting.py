from PIL import Image, ImageDraw, ImageFilter
import cv2
import numpy as np

# Load source image
img_path = r'C:\Users\Acer\.gemini\antigravity-ide\brain\2ca8608e-2bca-48b5-ba55-0da34bae6ffa\.user_uploaded\media_1789912076858.png'
img_bgr = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)

# Create inpainting mask (255 for areas to remove, 0 elsewhere)
mask = np.zeros(img_bgr.shape[:2], dtype=np.uint8)

# 1. Top-Right Girl & Thought Bubble
mask[0:82, 785:865] = 255

# 2. Red Ribbon on right cliff
mask[165:202, 850:888] = 255

# 3. Top-Left Purple Dots
cv2.circle(mask, (173, 147), 15, 255, -1)
cv2.circle(mask, (262, 212), 15, 255, -1)

# 4. Top-Left Blue Stick Figure
mask[200:248, 145:175] = 255

# 5. Black Stick Figure Guards
mask[15:52, 515:538] = 255    # Guard Top Center
mask[385:425, 212:235] = 255  # Guard Upper Left
mask[525:568, 672:698] = 255  # Guard Mid Right
mask[700:745, 200:225] = 255  # Guard Lower Left
mask[755:798, 502:530] = 255  # Guard Lower Center

# Apply Telea inpainting algorithm for seamless texture reconstruction
dst = cv2.inpaint(img_bgr, mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)

# Save result
cv2.imwrite('scratch/cleaned_map_telea.png', dst)
print("Telea inpainting completed successfully!")
