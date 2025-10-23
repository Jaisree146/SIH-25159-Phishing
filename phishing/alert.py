from flask import Flask, request, jsonify
import sqlite3
from datetime import datetime

app = Flask(__name__)

DB_PATH = "alerts.db"

# --- Database setup ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT NOT NULL,
                    details TEXT,
                    timestamp TEXT NOT NULL
                )''')
    conn.commit()
    conn.close()

# --- Save to DB ---
def save_alert(url, details=None):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT INTO alerts (url, details, timestamp) VALUES (?, ?, ?)",
        (url, details, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

# --- API endpoint ---
@app.route("/alert", methods=["POST"])
def alert():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    url = data.get("blocked_url") or data.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    details = data.get("details")

    # Save to database
    save_alert(url, str(details) if details else None)

    return jsonify({"status": "stored", "url": url})

# --- Start server ---
if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=4356, debug=True)
