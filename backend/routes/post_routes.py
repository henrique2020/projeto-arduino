from flask import Blueprint, jsonify

post_bp = Blueprint("post_routes", __name__)


@post_bp.route("/item", methods=["POST"])
def post_item():
    return jsonify(
        {
            "erro": (
                "Cadastro direto desativado. Consulte GET /item/<RFID> "
                "para cadastro indireto."
            )
        }
    ), 405
