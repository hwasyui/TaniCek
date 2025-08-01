from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
from deepface import DeepFace
from PIL import Image
import numpy as np
import pymongo
import cv2
import io

app = FastAPI()

# Connect to MongoDB
client = pymongo.MongoClient("mongodb+srv://imdb_user:imdb_user@cluster0.ftdjgax.mongodb.net/kada-final-project")
db = client["kada-final-project"]
users_collection = db["users"]

@app.post("/verify-face")
async def verify_face(email: str = Form(...), file: UploadFile = Form(...)):
    user_doc = users_collection.find_one({"email": email})
    if not user_doc or "image" not in user_doc or not user_doc["image"]:
        return JSONResponse(status_code=404, content={"error": "Reference image not found"})

    # Load reference image from MongoDB
    ref_binary = user_doc["image"]
    ref_pil = Image.open(io.BytesIO(ref_binary)).convert("RGB")
    reference_img_np = cv2.cvtColor(np.array(ref_pil), cv2.COLOR_RGB2BGR)

    # Read uploaded image
    upload_bytes = await file.read()
    try:
        pil_uploaded = Image.open(io.BytesIO(upload_bytes)).convert("RGB")
        webcam_np = cv2.cvtColor(np.array(pil_uploaded), cv2.COLOR_RGB2BGR)
    except:
        return JSONResponse(status_code=400, content={"error": "Invalid image format"})

    try:
        result = DeepFace.verify(webcam_np, reference_img_np, enforce_detection=False)
        return {
            "verified": result["verified"],
            "distance": result["distance"]
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
