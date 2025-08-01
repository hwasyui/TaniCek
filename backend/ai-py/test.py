import cv2
from deepface import DeepFace
import numpy as np
import pymongo
import bson
from PIL import Image
import io

# MongoDB Connection
mongo_uri = "mongodb+srv://imdb_user:imdb_user@cluster0.ftdjgax.mongodb.net/kada-final-project?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(mongo_uri)
db = client["kada-final-project"]
users_collection = db["users"]

# Fetch user image from MongoDB
user_email = "angel@gmail.com"  # TODO: set this based on input
user_doc = users_collection.find_one({"email": user_email})

if not user_doc or "image" not in user_doc or not user_doc["image"]:
    print("Error: Reference image not found for user.")
    exit()

# Convert BSON binary image to OpenCV format
image_binary = user_doc["image"]
pil_image = Image.open(io.BytesIO(image_binary))
reference_img_np = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

# Haar Cascade face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Open webcam
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

print("Press 'q' to quit.")

max_attempts = 30
attempts = 0
recognized = False
verify_count = 0
verify_threshold = 3
distance_threshold = 0.4

def perform_login():
    global recognized
    recognized = True
    print("✅ Face recognized. Logging in...")
    # TODO: implement actual login logic here

    cap.release()
    cv2.destroyAllWindows()

def prompt_password_login():
    print(f"❌ Face not recognized after {max_attempts} attempts. Switching to password login...")
    # TODO: implement password login fallback

while True:
    ret, frame = cap.read()
    if not ret:
        print("Error: Failed to capture image.")
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    face_recognized = False
    for (x, y, w, h) in faces:
        face_region = frame[y:y+h, x:x+w]

        try:
            result = DeepFace.verify(face_region, reference_img_np, enforce_detection=False)
            if result["verified"] and result["distance"] < distance_threshold:
                verify_count += 1
                print(f"✔️ Face recognized {verify_count}/{verify_threshold} times")
                if verify_count >= verify_threshold:
                    face_recognized = True
                    break
            else:
                verify_count = 0
        except Exception as e:
            print(f"Verification error: {e}")

        cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)

        if face_recognized:
            break

    cv2.imshow('Face Login', frame)

    if not face_recognized:
        attempts += 1
        if attempts >= max_attempts:
            prompt_password_login()
            break

    if face_recognized:
        perform_login()
        break

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()