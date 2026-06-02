from flask import Flask
from database import init_db
from routes.get_routes import get_bp
from routes.post_routes import post_bp
from routes.put_routes import put_bp

app = Flask(__name__)
app.register_blueprint(get_bp)
app.register_blueprint(post_bp)
app.register_blueprint(put_bp)

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
