import threading
from flask import Flask
from flask_cors import CORS
from database import init_db
from routes.get_routes import get_bp
from routes.post_routes import post_bp
from routes.put_routes import put_bp
from threads.serial_worker import iniciar_escuta_serial

app = Flask(__name__)
CORS(app)
app.register_blueprint(get_bp)
app.register_blueprint(post_bp)
app.register_blueprint(put_bp)

if __name__ == "__main__":
    init_db()
    
    serial_thread = threading.Thread(target=iniciar_escuta_serial, daemon=True)
    serial_thread.start()
    
    app.run(host="0.0.0.0", port=5000, debug=True)
