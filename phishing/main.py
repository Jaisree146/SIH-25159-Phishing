from flask import Flask, request, jsonify
from flask_cors import CORS
from pysafebrowsing import SafeBrowsing

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


sb = SafeBrowsing(API_KEY)

# --- Local blacklist (can extend to file/db later) ---
LOCAL_BLACKLIST = {
    "anniversary-floating-lang-pete.trycloudflare.com",
    "https://choices-reel-merchant-evaluated.trycloudflare.com",
    "https://tomatoes-analysis-joint-earl.trycloudflare.com/"
    # add more domains here if needed
}

@app.route("/check", methods=["POST"])
def check_url():
    data = request.get_json(silent=True)
    url = (data or {}).get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    # Ignore URLs that are not HTTP/HTTPS
    if not url.startswith(("http://", "https://")):
        return jsonify({"safe": True, "details": {"note": "Non-HTTP URL"}})

    # --- Step 1: Local blacklist override ---
    for bad_domain in LOCAL_BLACKLIST:
        if bad_domain in url:
            return jsonify({
                "safe": False,
                "details": {
                    "source": "local_blacklist",
                    "reason": f"Matched local blacklist domain: {bad_domain}"
                }
            })

    # --- Step 2: Fallback to Google Safe Browsing API ---
    try:
        result = sb.lookup_urls([url])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    info = result.get(url)
    is_safe = not (info and info.get("malicious", False))

    return jsonify({"safe": is_safe, "details": info or {"source": "google_safebrowsing"}})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

