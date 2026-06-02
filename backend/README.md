# API RESTful de Estoque (Python + SQLite)

Aplicacao local para cadastro de itens e controle de movimentacao de estoque, com historico de entradas/saidas.

Formato de ID do item: `CHAR(4)` no padrao `AA00` (2 letras maiusculas + 2 numeros), gerado automaticamente.
Os itens possuem as flags booleanas `pendente` e `ativo` (armazenadas como `0/1` no SQLite).

## Tecnologias

- Python 3
- Flask
- SQLite

## Como rodar

1. Instale as dependencias:

```bash
pip install -r requirements.txt
```

2. Inicie a API:

```bash
python app.py
```

3. A API ficara disponivel em:

```text
http://localhost:5000
```

## Estrutura basica

- `app.py`: inicializacao da API e registro das rotas
- `database.py`: conexao e criacao das tabelas (`items` e `historico`)
- `routes/get_routes.py`: endpoints GET
- `routes/post_routes.py`: endpoint POST
- `routes/put_routes.py`: endpoints PUT

## [Rotas](./routes.md "routes.md")
