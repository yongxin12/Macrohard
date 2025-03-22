from pdfrw import PdfReader, PdfWriter, PageMerge
from pdfrw import PdfDict

I9_TEMPLATE = 'i-9_template.pdf'
I9_OUTPUT = 'i-9_filled.pdf'
SF_TEMPLATE = 'sf256.pdf'
SF_OUTPUT = 'sf256_filled.pdf'

ANNOT_KEY = '/Annots'
ANNOT_FIELD_KEY = '/T'
ANNOT_VAL_KEY = '/V'
ANNOT_RECT_KEY = '/Rect'

field_map_i9 = {
    "last_name": r"Last Name \(Family Name\)",
    "first_name": r"First Name Given Name",
    "middle_initial": r"Employee Middle Initial \(if any\)",
    "other_last_names_used": r"Employee Other Last Names Used \(if any\)",
    "ssn": r"US Social Security Number",
    "date_of_birth": r"Date of Birth mmddyyyy",
    "address_street_number_and_name": r'Address Street Number and Name',
    "apt_number": r"Apt Number \(if any\)",
    "city": r"City or Town",
    "state": "State",
    "zip": r"ZIP Code",
    "email": r"Employees E-mail Address",
    "phone": r"Telephone Number",
    "immigration_status": 'CB',
    "PR_number": r"3 A lawful permanent resident Enter USCIS or ANumber",
    "exp_date": r"Exp Date mmddyyyy",
    "A_number": r"USCIS ANumber",
    "I_94": r"Form I94 Admission Number",
    "passport_country": r"Foreign Passport Number and Country of IssuanceRow1"
}

field_map_df256 = {
    "name": r"Name Last First Middle Initial",
    "date_of_birth": r"Date of Birth MMYYYY",
    "ssn": r"Social Security Number",
    "code": "Code",
}
def fill_i9_pdf(form_data, output_path=I9_OUTPUT):
    template_pdf = PdfReader(I9_TEMPLATE)

    for page in template_pdf.pages:
        annotations = page.get(ANNOT_KEY)
        if annotations:
            for annotation in annotations:
                key = annotation.get(ANNOT_FIELD_KEY)
                if key:
                    field_name = key[1:-1]
                    for json_key, pdf_field in field_map_i9.items():
                        if 'CB_' in field_name and json_key == 'immigration_status' and json_key in form_data:
                            field_status = field_name.str.split('_')[1]
                            if field_status == form_data[json_key]:
                                annotation.update(PdfDict(V="/Yes", AS="/Yes"))
                            else:
                                annotation.update(PdfDict(V="/Off", AS="/Off"))
                        elif field_name == pdf_field and json_key in form_data:
                            annotation.update(PdfDict(V='{}'.format(form_data[json_key])))
    PdfWriter().write(output_path, template_pdf)
    return output_path


def fill_sf_256_pdf(form_data, output_path=SF_OUTPUT):
    template_pdf = PdfReader(SF_TEMPLATE)
    for page in template_pdf.pages:
        annotations = page.get(ANNOT_KEY)
        if annotations:
            for annotation in annotations:
                key = annotation.get(ANNOT_FIELD_KEY)
                if key:
                    field_name = key[1:-1]
                    for json_key, pdf_field in field_map_df256.items():
                        if field_name == pdf_field and json_key in form_data:
                            annotation.update(PdfDict(V='{}'.format(form_data[json_key])))
    PdfWriter().write(output_path, template_pdf)
    return output_path