import sqlite3
import os
import random
import string

DB_PATH = os.path.join(os.path.dirname(__file__), "estoque.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def is_valid_item_id(item_id):
    if not isinstance(item_id, str):
        return False
    if len(item_id) != 4:
        return False
    return item_id[:2].isalpha() and item_id[:2].isupper() and item_id[2:].isdigit()


def normalize_item_id(item_id):
    if isinstance(item_id, str):
        return item_id.upper()
    return item_id


def normalize_bool_flag(value, default=None):
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, int):
        if value in (0, 1):
            return value
        raise ValueError("Flag booleana invalida: use true/false ou 1/0")
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in ("true", "1", "sim", "yes"):
            return 1
        if lowered in ("false", "0", "nao", "não", "no"):
            return 0
    if value is None and default is not None:
        return default
    raise ValueError("Flag booleana invalida: use true/false ou 1/0")


def generate_item_id(conn):
    used_rows = conn.execute("SELECT id FROM items").fetchall()
    used_ids = {row["id"] for row in used_rows}
    free_ids = []

    for first_letter in string.ascii_uppercase:
        for second_letter in string.ascii_uppercase:
            prefix = f"{first_letter}{second_letter}"
            for number in range(100):
                candidate = f"{prefix}{number:02d}"
                if candidate not in used_ids:
                    free_ids.append(candidate)

    if free_ids:
        return random.choice(free_ids)

    raise RuntimeError("Nao ha IDs disponiveis para cadastro")


def resolve_item_reference(conn, item_ref):
    if not isinstance(item_ref, str) or not item_ref.strip():
        raise ValueError("Referencia do item invalida")

    ref = item_ref.strip()
    ref_len = len(ref)
    if ref_len == 4:
        normalized_id = normalize_item_id(ref)
        if not is_valid_item_id(normalized_id):
            raise ValueError("ID invalido. Use o formato AA00")
        row = conn.execute(
            "SELECT id, rfid FROM items WHERE id = ? LIMIT 1", (normalized_id,)
        ).fetchone()
        return row

    if ref_len >= 8:
        row = conn.execute(
            "SELECT id, rfid FROM items WHERE rfid = ? COLLATE NOCASE LIMIT 1",
            (ref,),
        ).fetchone()
        return row

    raise ValueError("Referencia invalida. Use ID com 4 caracteres ou RFID com 8+ caracteres")


def _table_exists(cursor, table_name):
    row = cursor.execute(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?",
        (table_name,),
    ).fetchone()
    return row is not None


def _create_tables_with_text_id(cursor):
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY
                CHECK(length(id) = 4 AND id GLOB '[A-Z][A-Z][0-9][0-9]'),
            nome TEXT,
            valor REAL,
            estoque INTEGER DEFAULT 0,
            rfid TEXT NOT NULL UNIQUE,
            pendente INTEGER NOT NULL DEFAULT 1 CHECK (pendente IN (0, 1)),
            ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1))
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS historico (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT NOT NULL,
            tipo TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            data TIMESTAMP DEFAULT (datetime('now', '-3 hours')),
            FOREIGN KEY (item_id) REFERENCES items(id)
        )
        """
    )


def _migrate_integer_id_to_text(conn, cursor):
    cursor.execute(
        """
        CREATE TABLE items_new (
            id TEXT PRIMARY KEY
                CHECK(length(id) = 4 AND id GLOB '[A-Z][A-Z][0-9][0-9]'),
            nome TEXT,
            valor REAL,
            estoque INTEGER DEFAULT 0,
            rfid TEXT NOT NULL UNIQUE,
            pendente INTEGER NOT NULL DEFAULT 1 CHECK (pendente IN (0, 1)),
            ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1))
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE historico_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id TEXT NOT NULL,
            tipo TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            data TIMESTAMP DEFAULT (datetime('now', '-3 hours')),
            FOREIGN KEY (item_id) REFERENCES items_new(id)
        )
        """
    )

    id_map = {}
    items = cursor.execute(
        "SELECT id, nome, valor, estoque, rfid, status FROM items"
    ).fetchall()
    for item in items:
        new_id = generate_item_id(conn)
        id_map[item["id"]] = new_id
        pendente = 1 if item["status"] == "pendente" else 0
        cursor.execute(
            "INSERT INTO items_new (id, nome, valor, estoque, rfid, pendente, ativo) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (new_id, item["nome"], item["valor"], item["estoque"], item["rfid"], pendente, 1),
        )

    historico = cursor.execute(
        "SELECT id, item_id, tipo, quantidade, data FROM historico"
    ).fetchall()
    for mov in historico:
        mapped_item_id = id_map.get(mov["item_id"])
        if mapped_item_id is None:
            raise RuntimeError("Historico contem item inexistente durante migracao")
        cursor.execute(
            "INSERT INTO historico_new (id, item_id, tipo, quantidade, data) "
            "VALUES (?, ?, ?, ?, ?)",
            (mov["id"], mapped_item_id, mov["tipo"], mov["quantidade"], mov["data"]),
        )

    cursor.execute("DROP TABLE historico")
    cursor.execute("DROP TABLE items")
    cursor.execute("ALTER TABLE items_new RENAME TO items")
    cursor.execute("ALTER TABLE historico_new RENAME TO historico")


def _migrate_items_flags(cursor):
    columns = cursor.execute("PRAGMA table_info(items)").fetchall()
    column_names = [col["name"] for col in columns]

    has_status = "status" in column_names
    has_pendente = "pendente" in column_names
    has_ativo = "ativo" in column_names

    if has_pendente and has_ativo and not has_status:
        return

    cursor.execute(
        """
        CREATE TABLE items_new (
            id TEXT PRIMARY KEY
                CHECK(length(id) = 4 AND id GLOB '[A-Z][A-Z][0-9][0-9]'),
            nome TEXT,
            valor REAL,
            estoque INTEGER DEFAULT 0,
            rfid TEXT NOT NULL UNIQUE,
            pendente INTEGER NOT NULL DEFAULT 1 CHECK (pendente IN (0, 1)),
            ativo INTEGER NOT NULL DEFAULT 1 CHECK (ativo IN (0, 1))
        )
        """
    )

    select_fields = ["id", "nome", "valor", "estoque", "rfid"]
    if has_status:
        select_fields.append("status")
    if has_pendente:
        select_fields.append("pendente")
    if has_ativo:
        select_fields.append("ativo")

    items = cursor.execute(
        f"SELECT {', '.join(select_fields)} FROM items"
    ).fetchall()
    for item in items:
        if has_pendente:
            pendente = normalize_bool_flag(item["pendente"], default=1)
        elif has_status:
            pendente = 1 if item["status"] == "pendente" else 0
        else:
            pendente = 1

        ativo = normalize_bool_flag(item["ativo"], default=1) if has_ativo else 1

        cursor.execute(
            "INSERT INTO items_new (id, nome, valor, estoque, rfid, pendente, ativo) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                item["id"],
                item["nome"],
                item["valor"],
                item["estoque"],
                item["rfid"],
                pendente,
                ativo,
            ),
        )

    cursor.execute("DROP TABLE items")
    cursor.execute("ALTER TABLE items_new RENAME TO items")


def _ensure_indexes(cursor):
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_items_rfid_nocase "
        "ON items(rfid COLLATE NOCASE)"
    )


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    has_items = _table_exists(cursor, "items")
    has_historico = _table_exists(cursor, "historico")

    if not has_items and not has_historico:
        _create_tables_with_text_id(cursor)
    else:
        item_columns = cursor.execute("PRAGMA table_info(items)").fetchall()
        id_column = next((col for col in item_columns if col["name"] == "id"), None)
        if id_column is None:
            raise RuntimeError("Tabela items invalida: coluna id nao encontrada")
        if id_column["type"].upper() != "TEXT":
            _migrate_integer_id_to_text(conn, cursor)
        conn.execute("PRAGMA foreign_keys = OFF")
        _migrate_items_flags(cursor)
        conn.execute("PRAGMA foreign_keys = ON")

    _ensure_indexes(cursor)
    conn.commit()
    conn.close()
