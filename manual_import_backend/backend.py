from flask import Flask, request, jsonify, send_file
from flask_restful import Resource, Api
from pymongo import MongoClient
from cryptography.fernet import Fernet
import base64
from auto_fill_pdf import *
import os
from dotenv import load_dotenv

# load_dotenv()
# MONGO_URI = os.getenv("MONGO_URI")
# Setup Flask and MongoDB
app = Flask(__name__)
api = Api(app)
MONGO_URI = (r"mongodb+srv://richard:<password>@hacksontest.mongocluster.cosmos.azure.com/?tls=true&authMechanism"
             r"=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000")
client = MongoClient(MONGO_URI)
db = client.jobcoachhelper
collection = db.user_data

# Sample Key. We can replace the key in Production
key = base64.urlsafe_b64encode(os.urandom(32))
fernet = Fernet(key)

example_document_1 = {
    "form_type": "I-9",
    "ssn": "123-45-6789",
    "form_info": {
        "last_name": "Doe",
        "first_name": "John",
        "middle_initial": "",
        "other_last_names_used": "",
        "ssn": "123-45-6789",
        "date_of_birth": "01-01-1990",
        "address_street_number_and_name": "123 Main St",
        "apt_number": "100",
        "city": "Anytown",
        "state": "AnyState",
        "zip": "12345",
        "email": "12345@hotmail.com",
        "phone": "123-456-7890",
        "immigration_status": "1",
        "PR_number": "",
        "exp_date": "01/01/2030",
        "A_number": "A12345678",
        "I_94": "012345678A1",
        "passport_number_country": "EA1234567_China"
    }
}

example_document_2 = {
    "form_type": "self_identification_of_disability",
    "ssn": "123-45-6789",
    "form_info": {
        "name": "John Doe",
        "ssn": "123-45-6789",
        "date_of_birth": "01-01-1990",
        "code": "12",
     }
}


def encrypt_ssn(ssn):
    return fernet.encrypt(ssn.encode()).decode()


def decrypt_ssn(token):
    return fernet.decrypt(token.encode()).decode()


# Find user by SSN
def find_user_by_ssn(ssn):
    for record in collection.find():
        try:
            if decrypt_ssn(record["encrypted_ssn"]) == ssn:
                return record
        except:
            continue
    return None


class InformationInsert(Resource):
    def post(self):
        data = request.json
        ssn = data.get("ssn")
        form_type = data.get("form_type")
        form_info = data.get("form_info")

        if not ssn or form_info or form_type:
            return {"error": "SSN and Form Data are required."}, 400

        if form_type not in ["I-9", "self_identification_of_disability"]:
            return {"error": "Form type currently not supported."}, 400

        encrypted_ssn = encrypt_ssn(ssn)
        field = "i9_form" if form_type == "I-9" else "self_identification"
        existing = find_user_by_ssn(ssn)
        if existing:
            collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {field: form_info}}
            )
        else:
            collection.insert_one({
                "encrypted_ssn": encrypted_ssn,
                field: form_info
            })
        response = {
            "status": "success",
            "message": f"{form_type} Form Saved successfully."
        }
        return jsonify(response), 201


class GetForm(Resource):
    def get(self):
        ssn = request.args.get("ssn")
        form_type = request.args.get("form_type")

        if not ssn or form_type:
            return {"error": "SSN and Form Type required"}, 400

        if form_type not in ["I-9", "self_identification_of_disability"]:
            return {"error": "Form type currently not supported."}, 400

        field = "i9_form" if form_type == "I-9" else "self_identification"
        record = find_user_by_ssn(ssn)
        if record and field in record:
            response = {
                "status": "success",
                "message": "Find Data successfully",
                field: record[field]
            }
            return jsonify(response), 200
        return {"error": f"{form_type} Form data not found for given SSN"}, 404


class DocumentFill(Resource):
    def post(self):
        ssn = request.json.get('ssn')
        form_type = request.args.get("form_type")

        if not ssn or form_type:
            return {"error": "SSN and Form Type required"}, 400

        if form_type not in ["I-9", "self_identification_of_disability"]:
            return {"error": "Form type currently not supported."}, 400

        record = find_user_by_ssn(ssn)
        field = "i9_form" if form_type == "I-9" else "self_identification"

        if not record or field not in record:
            return {"error": "Supported form not found."}, 404

        if field == "i9_form":
            path = fill_i9_pdf(record["i9_form"])
            return send_file(path, as_attachment=True)
        else:
            path = fill_sf_256_pdf(record["self_identification"])
            return send_file(path, as_attachment=True)


api.add_resource(InformationInsert, '/forms/information-insert')
api.add_resource(GetForm, '/forms/content-confirmation')
api.add_resource(DocumentFill, '/forms/document-fill')


if __name__ == '__main__':
    app.run(debug=True)