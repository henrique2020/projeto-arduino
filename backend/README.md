# API RESTful de Estoque (Python + SQLite)

Aplicacao local para cadastro de itens e controle de movimentacao de estoque, com historico de entradas/saidas.

Formato de ID do item: `CHAR(4)` no padrao `AA00` (2 letras maiusculas + 2 numeros), gerado automaticamente.
Os itens possuem as flags booleanas `pendente` e `ativo` (armazenadas como `0/1` no SQLite).

## Tecnologias

- Python 3
- Flask
- SQLite
- PySerial (comunicacao com Arduino)

## Ambiente virtual (.venv)

Crie e ative o ambiente virtual antes de instalar as dependencias:

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

### Linux / macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## Instalação

Com o ambiente virtual ativado:

```bash
pip install -r requirements.txt
```

## Como rodar

```bash
python app.py
```

A API ficara disponivel em:

```text
http://localhost:5000
```

A thread de comunicacao serial inicia automaticamente junto com a API.

## Estrutura

- `app.py`: inicializacao da API, registro das rotas e thread serial
- `database.py`: conexao, migracao e criacao das tabelas (`items` e `historico`)
- `routes/get_routes.py`: endpoints GET
- `routes/post_routes.py`: endpoint POST (bloqueado - cadastro indireto)
- `routes/put_routes.py`: endpoints PUT
- `threads/serial_worker.py`: comunicacao serial com Arduino

## Documentacao

- [Rotas da API](./routes.md)
- [Comunicação Serial](./serial.md)
