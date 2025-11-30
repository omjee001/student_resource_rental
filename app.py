from flask import Flask, request, session, jsonify, send_from_directory, abort
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson.objectid import ObjectId
import bcrypt
import os
from werkzeug.utils import secure_filename
import certifi
from datetime import datetime, timezone, timedelta

# Create Flask app and configure to serve built frontend from ./dist
app = Flask(__name__, static_folder="dist", static_url_path="")

# Configuration from environment with safe defaults
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "change-me")
app.config["UPLOAD_FOLDER"] = os.environ.get("UPLOAD_FOLDER", "static/uploads")
app.config["ALLOWED_EXTENSIONS"] = {"png", "jpg", "jpeg", "gif"}

# Database configuration (SAFE VERSION — NO PASSWORD in code)
mongo_uri = os.environ.get("MONGO_URI")
if not mongo_uri:
    raise RuntimeError(
        "ERROR: MONGO_URI environment variable is missing.\n"
        "Set MONGO_URI in a .env file instead of hardcoding it."
    )

app.config["MONGO_URI"] = mongo_uri
mongo = PyMongo(app, tlsCAFile=certifi.where())

# Enable CORS
cors_origins = os.environ.get("CORS_ORIGINS", "*")
if cors_origins == "*":
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
else:
    origins_list = [o.strip() for o in cors_origins.split(",")]
    CORS(app, resources={r"/api/*": {"origins": origins_list}}, supports_credentials=True)

# Collections
users = mongo.db.Student
resources = mongo.db.resources
requests_collection = mongo.db.requests

# (🔽 Everything below stays the same — unchanged)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in app.config["ALLOWED_EXTENSIONS"]


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


# Session info helper
@app.get("/api/me")
def me():
    if "email" not in session:
        return jsonify({"authenticated": False}), 401
    return jsonify({
        "authenticated": True,
        "email": session.get("email"),
        "name": session.get("name", "")
    })


@app.post("/api/register")
def api_register():
    data = request.get_json(silent=True) or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    password = data.get("password", "")

    if not name or not email or not phone or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    users.insert_one({"name": name, "email": email, "phone": phone, "password": hashed})
    return jsonify({"ok": True}), 201


@app.post("/api/login")
def api_login():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = users.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    session["email"] = email
    session["name"] = user.get("name", "")
    return jsonify({"ok": True, "name": session["name"]})


@app.post("/api/logout")
def api_logout():
    session.clear()
    return jsonify({"ok": True})


@app.get("/api/resources")
def api_resources():
    # Public listing: return all resources, excluding logged-in user's own resources
    query = {}
    if "email" in session:
        # Exclude resources owned by the logged-in user
        query["owner_email"] = {"$ne": session["email"]}
    
    docs = list(resources.find(query))
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return jsonify({"resources": docs})


# Create a new resource (supports optional image upload)
@app.post("/api/resources")
def api_create_resource():
    if "email" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    title = request.form.get("title", "").strip()
    description = request.form.get("description", "").strip()
    category = request.form.get("category", "").strip()
    price = request.form.get("price", "").strip()
    owner_email = session["email"]

    if not title or not description or not category or not price:
        return jsonify({"error": "Missing required fields"}), 400

    image_filename = None
    image_file = request.files.get("image")
    if image_file and allowed_file(image_file.filename):
        filename = secure_filename(image_file.filename)
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        image_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        image_file.save(image_path)
        image_filename = filename

    doc = {
        "title": title,
        "description": description,
        "category": category,
        "price": price,
        "owner_email": owner_email,
        "image": image_filename,
    }
    inserted = resources.insert_one(doc)
    doc["id"] = str(inserted.inserted_id)
    return jsonify({"resource": doc}), 201


# Seed a sample resource for the logged-in user (no image required)
@app.post("/api/resources/seed")
def api_seed_resource():
    if "email" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    sample = {
        "title": "Sample Notebook",
        "description": "A5 ruled notebook for test purposes",
        "category": "stationery",
        "price": "1.00",
        "owner_email": session["email"],
        "image": None,
    }
    inserted = resources.insert_one(sample)
    sample["id"] = str(inserted.inserted_id)
    return jsonify({"resource": sample}), 201


# Get my resources (logged in user's resources)
@app.get("/api/my-resources")
def api_my_resources():
    if "email" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    docs = list(resources.find({"owner_email": session["email"]}))
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return jsonify({"resources": docs})


# Get my requests (requests I made)
@app.get("/api/my-requests")
def api_my_requests():
    if "email" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    docs = list(requests_collection.find({"borrower_email": session["email"]}))
    for d in docs:
        d["id"] = str(d.pop("_id"))
        if "resource_id" in d:
            d["resource_id"] = str(d["resource_id"])
    return jsonify({"requests": docs})


# Get incoming requests (requests for my resources)
@app.get("/api/incoming-requests")
def api_incoming_requests():
    if "email" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    docs = list(requests_collection.find({"owner_email": session["email"]}))
    for d in docs:
        d["id"] = str(d.pop("_id"))
        if "resource_id" in d:
            d["resource_id"] = str(d["resource_id"])
    return jsonify({"requests": docs})


# Update request status (approve/reject)
@app.post("/api/requests/<request_id>/<action>")
def api_update_request(request_id, action):
    if "email" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        req = requests_collection.find_one({"_id": ObjectId(request_id)})
        if not req:
            return jsonify({"error": "Request not found"}), 404
        
        if req["owner_email"] != session["email"]:
            return jsonify({"error": "Unauthorized"}), 403
        
        if action == "approve":
            now_iso = datetime.now(timezone.utc).isoformat()
            requests_collection.update_one(
                {"_id": ObjectId(request_id)},
                {"$set": {"status": "Approved", "approved_at": now_iso}}
            )
        elif action == "reject":
            requests_collection.update_one({"_id": ObjectId(request_id)}, {"$set": {"status": "Rejected"}})
        else:
            return jsonify({"error": "Invalid action"}), 400
        
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Borrower marks a request as returned; server computes total due
@app.post("/api/requests/<request_id>/return")
def api_return_request(request_id):
    if "email" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        req = requests_collection.find_one({"_id": ObjectId(request_id)})
        if not req:
            return jsonify({"error": "Request not found"}), 404

        if req.get("borrower_email") != session["email"]:
            return jsonify({"error": "Unauthorized"}), 403

        if req.get("status") != "Approved":
            return jsonify({"error": "Only approved requests can be returned"}), 400

        resource = resources.find_one({"_id": ObjectId(req["resource_id"])}) if ObjectId.is_valid(req.get("resource_id", "")) else None
        daily_price = 0.0
        if resource:
            try:
                daily_price = float(resource.get("price", 0))
            except Exception:
                daily_price = 0.0

        approved_at_iso = req.get("approved_at")
        approved_at = None
        if approved_at_iso:
            try:
                approved_at = datetime.fromisoformat(approved_at_iso.replace("Z", "+00:00"))
            except Exception:
                approved_at = None

        now = datetime.now(timezone.utc)
        if not approved_at:
            approved_at = now

        delta: timedelta = now - approved_at
        days = delta.days + (1 if delta.seconds > 0 or delta.microseconds > 0 else 0)
        days = max(1, days)
        total_due = round(daily_price * days, 2)

        requests_collection.update_one(
            {"_id": ObjectId(request_id)},
            {"$set": {"status": "Returned", "returned_at": now.isoformat(), "days": days, "total_due": total_due}}
        )

        return jsonify({"ok": True, "days": days, "total_due": total_due, "payment_methods": ["Cash", "UPI"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Incoming pending requests count for notification badge
@app.get("/api/incoming-requests/count")
def api_incoming_requests_count():
    if "email" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    count = requests_collection.count_documents({"owner_email": session["email"], "status": "Pending"})
    return jsonify({"count": count})


# Create a borrow request
@app.post("/api/requests")
def api_create_request():
    if "email" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json(silent=True) or {}
    resource_id = data.get("resource_id", "").strip()
    
    if not resource_id:
        return jsonify({"error": "Missing resource_id"}), 400
    
    try:
        resource = resources.find_one({"_id": ObjectId(resource_id)})
        if not resource:
            return jsonify({"error": "Resource not found"}), 404
        
        if resource["owner_email"] == session["email"]:
            return jsonify({"error": "Cannot request your own resource"}), 400
        
        # Check if there is an ACTIVE request (Pending or Approved)
        existing = requests_collection.find_one({
            "resource_id": resource_id,
            "borrower_email": session["email"],
            "status": {"$in": ["Pending", "Approved"]},
        })
        if existing:
            return jsonify({"error": "You already have an active request for this resource"}), 409
        
        requests_collection.insert_one({
            "resource_id": resource_id,
            "resource_title": resource["title"],
            "owner_email": resource["owner_email"],
            "borrower_email": session["email"],
            "status": "Pending"
        })
        return jsonify({"ok": True}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# Clear all resources and related requests for the logged-in user
@app.post("/api/resources/clear")
def api_clear_my_resources():
    if "email" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    owner_email = session["email"]
    # delete resources owned by user
    res_delete = resources.delete_many({"owner_email": owner_email})
    # delete requests where user is owner or borrower (cleanup)
    req_owner_delete = requests_collection.delete_many({"owner_email": owner_email})
    req_borrower_delete = requests_collection.delete_many({"borrower_email": owner_email})

    return jsonify({
        "ok": True,
        "deleted": {
            "resources": res_delete.deleted_count,
            "requests_as_owner": req_owner_delete.deleted_count,
            "requests_as_borrower": req_borrower_delete.deleted_count,
        },
    })


# Serve uploaded images
@app.get("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# Serve React SPA from dist for all non-API routes
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    # Never capture API routes
    if path.startswith("api/"):
        abort(404)
    # Serve static file if it exists, otherwise return index.html (SPA fallback)
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=os.environ.get("FLASK_DEBUG", "1") == "1")
