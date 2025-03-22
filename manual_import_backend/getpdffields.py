from pdfrw import PdfReader

# Load the PDF
template_pdf = "sf256.pdf"

# Read the template PDF
reader = PdfReader(template_pdf)

ANNOT_KEY = '/Annots'
ANNOT_FIELD_KEY = '/T'
ANNOT_VAL_KEY = '/V'
ANNOT_RECT_KEY = '/Rect'

# Print field names
field_names = []
for page in reader.pages:
    annotations = page.get(ANNOT_KEY)
    if annotations:
        for annotation in annotations:
            key = annotation.get(ANNOT_FIELD_KEY)
            if key:
                field_name = key[1:-1]
                field_names.append(field_name)

# Optionally, save the field names to a file
with open("sf256_field_names.txt", "w") as f:
    for name in field_names:
        f.write(f"{name}\n")