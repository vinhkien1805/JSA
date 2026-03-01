from flask import Flask, Response
from flask_cors import CORS
import requests, time
from cachetools import TTLCache, cached

# minimal Flask proxy that forwards to the RapidAPI top‑100 movies API
app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

RAPIDAPI_HOST = "imdb-top-100-movies.p.rapidapi.com"
RAPIDAPI_KEY = "7ba35936d1msh0ebb7b5e711a5bbp133f62jsn01230fbc4489"  # hardcoded convenience key
BASE_URL = f"https://{RAPIDAPI_HOST}"

cache = TTLCache(maxsize=100, ttl=300)  # simple 5‑minute cache

@cached(cache)
def fetch(path):
    url = BASE_URL + path
    for _ in range(3):
        r = requests.get(url, headers={
            "x-rapidapi-host": RAPIDAPI_HOST,
            "x-rapidapi-key": RAPIDAPI_KEY,
        }, timeout=10)
        if r.status_code != 429:
            return r
        time.sleep(1)
    return r

@app.route("/")
def index():
    return app.send_static_file('index.html')

@app.route("/api/movies")
def movies():
    r = fetch("/")
    return Response(r.content, status=r.status_code, content_type="application/json")

@app.route("/api/movies/<id>")
def movie(id):
    r = fetch(f"/{id}")
    return Response(r.content, status=r.status_code, content_type="application/json")

if __name__ == "__main__":
    app.run(debug=True)
