from flask import Blueprint, jsonify
from database import get_connection, resolve_item_reference, generate_item_id

get_bp = Blueprint("get_routes", __name__)


@get_bp.route("/historico", methods=["GET"])
def get_historico():
    conn = get_connection()
    rows = conn.execute(
        "SELECT h.id, h.item_id, i.nome, h.tipo, h.quantidade, h.data "
        "FROM historico h LEFT JOIN items i ON h.item_id = i.id "
        "ORDER BY h.data DESC"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@get_bp.route("/historico/<item_ref>", methods=["GET"])
def get_historico_item(item_ref):
    conn = get_connection()
    try:
        item = resolve_item_reference(conn, item_ref)
    except ValueError as e:
        conn.close()
        return jsonify({"erro": str(e)}), 400
    if not item:
        conn.close()
        return jsonify({"erro": "Item não encontrado"}), 404

    rows = conn.execute(
        "SELECT h.id, h.item_id, i.nome, h.tipo, h.quantidade, h.data "
        "FROM historico h LEFT JOIN items i ON h.item_id = i.id "
        "WHERE h.item_id = ? ORDER BY h.data DESC",
        (item["id"],),
    ).fetchall()
    conn.close()
    if not rows:
        return jsonify({"erro": "Nenhum histórico encontrado para este item"}), 404
    return jsonify([dict(r) for r in rows])


@get_bp.route("/item/<item_ref>", methods=["GET"])
def get_item(item_ref):
    conn = get_connection()
    normalized_ref = item_ref.strip() if isinstance(item_ref, str) else ""
    try:
        item = resolve_item_reference(conn, item_ref)
    except ValueError as e:
        conn.close()
        return jsonify({"erro": str(e)}), 400

    if not item and len(normalized_ref) >= 8:
        item_id = generate_item_id(conn)
        conn.execute(
            "INSERT INTO items (id, rfid, pendente, ativo) VALUES (?, ?, 1, 1)",
            (item_id, normalized_ref),
        )
        conn.commit()
        conn.close()
        return jsonify(
            {
                "id": item_id,
                "mensagem": f"Complete o cadastro ID {item_id}",
            }
        ), 201

    if not item:
        conn.close()
        return jsonify({"erro": "Item não encontrado"}), 404

    row = conn.execute(
        "SELECT id, nome, valor, estoque, rfid, pendente, ativo FROM items WHERE id = ?",
        (item["id"],),
    ).fetchone()
    if not row:
        conn.close()
        return jsonify({"erro": "Item não encontrado"}), 404

    item_id = row["id"]
    if row["pendente"] == 1:
        conn.close()
        return jsonify(
            {
                "id": item_id,
                "mensagem": f"Item pendente de cadastro (ID {item_id})",
            }
        )

    if row["ativo"] == 0:
        conn.close()
        return jsonify(
            {
                "id": item_id,
                "mensagem": f"Item desativado (ID {item_id})",
            }
        )

    response = {
        "nome": row["nome"],
        "estoque": row["estoque"],
        "valor": row["valor"],
    }
    conn.close()
    return jsonify(response)


@get_bp.route("/itens", methods=["GET"])
def get_itens():
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, nome, valor, estoque, rfid, pendente, ativo FROM items WHERE pendente = 0"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@get_bp.route("/pendentes", methods=["GET"])
def get_pendentes():
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, rfid FROM items WHERE pendente = 1"
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])
