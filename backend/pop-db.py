from database import get_connection, init_db, generate_item_id


RFIDS = [
    "00-11-22-33",
    "11-22-33-44",
    "22-33-44-55",
    "33-44-55-66",
    "44-55-66-77",
    "55-66-77-88",
    "66-77-88-99",
    "77-88-99-00",
    "01-23-45-67",
    "23-45-67-89",
    "10-20-30-40",
    "12-24-36-48",
    "13-26-39-52",
    "14-28-42-56",
    "15-30-45-60",
    "16-32-48-64",
    "17-34-51-68",
    "18-36-54-72",
    "19-38-57-76",
    "20-40-60-80",
]


def import_debug_data():
    init_db()
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM historico")
    cursor.execute("DELETE FROM items")

    item_ids = []
    for idx, rfid in enumerate(RFIDS, start=1):
        item_id = generate_item_id(conn)
        pendente = 1 if idx % 5 == 0 else 0
        ativo = 0 if idx % 7 == 0 else 1
        estoque_inicial = 10 + idx
        cursor.execute(
            "INSERT INTO items (id, nome, valor, estoque, rfid, pendente, ativo) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                item_id,
                f"Item Debug {idx}",
                round(15 + idx * 1.75, 2),
                estoque_inicial,
                rfid,
                pendente,
                ativo,
            ),
        )
        item_ids.append(item_id)

    for idx in range(10):
        item_id = item_ids[idx]
        item = cursor.execute(
            "SELECT estoque FROM items WHERE id = ?", (item_id,)
        ).fetchone()
        estoque_atual = item["estoque"]

        if idx % 2 == 0:
            tipo = "add"
            quantidade = 4
            novo_estoque = estoque_atual + quantidade
        else:
            tipo = "sub"
            quantidade = 3
            novo_estoque = max(0, estoque_atual - quantidade)

        cursor.execute(
            "UPDATE items SET estoque = ? WHERE id = ?",
            (novo_estoque, item_id),
        )
        cursor.execute(
            "INSERT INTO historico (item_id, tipo, quantidade, data) "
            "VALUES (?, ?, ?, datetime('now', '-3 hours', ?))",
            (item_id, tipo, quantidade, f"-{idx} minutes"),
        )

    conn.commit()

    total_items = cursor.execute("SELECT COUNT(*) AS c FROM items").fetchone()["c"]
    total_hist = cursor.execute("SELECT COUNT(*) AS c FROM historico").fetchone()["c"]
    conn.close()

    print(f"Itens importados: {total_items}")
    print(f"Movimentacoes importadas: {total_hist}")


if __name__ == "__main__":
    import_debug_data()
