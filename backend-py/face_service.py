from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import pymongo
from deepface import DeepFace
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

mongo_uri = "mongodb+srv://imdb_user:imdb_user@cluster0.ftdjgax.mongodb.net/kada-final-project?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(mongo_uri)
db = client["kada-final-project"]
users_collection = db["users"]

attempt_counters = {}

@app.route("/face-verify", methods=["POST"])
def face_verify():
    try:
        data = request.json
        email = data["email"]
        webcam_base64 = data["webcam"]

        if email not in attempt_counters:
            attempt_counters[email] = 1
        else:
            attempt_counters[email] += 1

        print(f"\n[Attempt {attempt_counters[email]}] Face verification requested for: {email}")

        webcam_bytes = base64.b64decode(webcam_base64.split(',')[1])
        webcam_img = Image.open(io.BytesIO(webcam_bytes)).convert("RGB")
        webcam_np = cv2.cvtColor(np.array(webcam_img), cv2.COLOR_RGB2BGR)

        user_doc = users_collection.find_one({"email": email})
        if not user_doc or "image" not in user_doc:
            print("Reference image not found in database.")
            return jsonify({"verified": False, "reason": "User image not found"}), 400

        ref_img = Image.open(io.BytesIO(user_doc["image"])).convert("RGB")
        ref_img_np = cv2.cvtColor(np.array(ref_img), cv2.COLOR_RGB2BGR)

        result = DeepFace.verify(webcam_np, ref_img_np, model_name="ArcFace", detector_backend="retinaface", align=True, enforce_detection=False, anti_spoofing=True)

        print(f"Verification result: {result['verified']}, Distance: {result['distance']:.4f}")
        THRESHOLD = 0.45
        is_verified = result["distance"] <= THRESHOLD

        return jsonify({
            "verified": is_verified,
            "distance": result["distance"],
            "threshold": THRESHOLD,
            "attempt": attempt_counters[email]
        })

    except Exception as e:
        print(f"Error during verification: {e}")
        return jsonify({"verified": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, use_reloader=False)
