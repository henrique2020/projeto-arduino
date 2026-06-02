from flask import Blueprint, request, jsonify
from database import (
    get_connection,
    normalize_bool_flag,
    resolve_item_reference,
)

put_bp = Blueprint("put_routes", __name__)


@put_bp.route("/item/<item_ref>", methods=["PUT"])
def put_item(item_ref):
    data = request.get_json()
    if not data:
        return jsonify({"erro": "Corpo da requisição vazio"}), 400

    conn = get_connection()
    try:
        item = resolve_item_reference(conn, item_ref)
    except ValueError as e:
        conn.close()
        return jsonify({"erro": str(e)}), 400
    if not item:
        conn.close()
        return jsonify({"erro": "Item não encontrado"}), 404

    campos = []
    valores = []
    for campo in ("nome", "valor", "estoque", "rfid", "pendente", "ativo"):
        if campo in data:
            valor = data[campo]
            if campo in ("pendente", "ativo"):
                try:
                    valor = normalize_bool_flag(valor)
                except ValueError as e:
                    conn.close()
                    return jsonify({"erro": str(e)}), 400
            campos.append(f"{campo} = ?")
            valores.append(valor)

    if not campos:
        conn.close()
        return jsonify({"erro": "Nenhum campo para atualizar"}), 400

    valores.append(item["id"])
    conn.execute(f"UPDATE items SET {', '.join(campos)} WHERE id = ?", valores)
    conn.commit()
    conn.close()
    return jsonify({"mensagem": "Item atualizado com sucesso"})


@put_bp.route("/estoque/<item_ref>", methods=["PUT"])
def put_estoque(item_ref):
    data = request.get_json()
    if not data or "tipo" not in data or "quantidade" not in data:
        return jsonify({"erro": "Campos 'tipo' (add/sub) e 'quantidade' são obrigatórios"}), 400

    tipo = data["tipo"]
    quantidade = int(data["quantidade"])

    if tipo not in ("add", "sub"):
        return jsonify({"erro": "Campo 'tipo' deve ser 'add' ou 'sub'"}), 400
    if quantidade <= 0:
        return jsonify({"erro": "Quantidade deve ser maior que zero"}), 400

    conn = get_connection()
    try:
        item_ref_row = resolve_item_reference(conn, item_ref)
    except ValueError as e:
        conn.close()
        return jsonify({"erro": str(e)}), 400
    if not item_ref_row:
        conn.close()
        return jsonify({"erro": "Item não encontrado"}), 404

    item = conn.execute(
        "SELECT id, estoque FROM items WHERE id = ?", (item_ref_row["id"],)
    ).fetchone()
    if not item:
        conn.close()
        return jsonify({"erro": "Item não encontrado"}), 404

    novo_estoque = item["estoque"] + quantidade if tipo == "add" else item["estoque"] - quantidade
    if novo_estoque < 0:
        conn.close()
        return jsonify({"erro": "Estoque não pode ficar negativo"}), 400

    conn.execute("UPDATE items SET estoque = ? WHERE id = ?", (novo_estoque, item["id"]))
    conn.execute(
        "INSERT INTO historico (item_id, tipo, quantidade, data) "
        "VALUES (?, ?, ?, datetime('now', '-3 hours'))",
        (item["id"], tipo, quantidade),
    )
    conn.commit()
    conn.close()
    return jsonify({"mensagem": f"Estoque atualizado. Novo estoque: {novo_estoque}"})
