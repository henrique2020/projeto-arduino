# Rotas da API

Base URL: `http://localhost:5000`

---

## /item

### GET /item/<item_ref>

Consulta item por ID/RFID. A identificacao segue a regra:

- **4 caracteres**: interpreta como **ID** (`AA00`)
- **8+ caracteres**: interpreta como **RFID**

Regras de negocio:
- Se **nao existir** e a consulta for por RFID: cria item com `id + rfid`, `pendente=1` e retorna instruindo completar cadastro.
- Se existir e estiver **pendente**: retorna mensagem de pendencia com ID.
- Se existir e estiver **inativo**: retorna mensagem de item desativado com ID.
- Se existir e estiver **ativo**: retorna `nome`, `estoque`, `valor`.

#### Exemplo de chamada

```bash
curl http://localhost:5000/item/AB12
```

```bash
curl http://localhost:5000/item/RFID-001
```

#### Exemplo de saida (item ativo)

```json
{
  "nome": "Produto A",
  "estoque": 12,
  "valor": 29.9
}
```

#### Exemplo de saida (nao cadastrado por RFID)

```json
{
  "id": "AB12",
  "mensagem": "Complete o cadastro ID AB12"
}
```

#### Exemplo de saida (pendente)

```json
{
  "id": "AB12",
  "mensagem": "Item pendente de cadastro (ID AB12)"
}
```

#### Exemplo de saida (inativo)

```json
{
  "id": "AB12",
  "mensagem": "Item desativado (ID AB12)"
}
```

#### Exemplo de erro (404)

```json
{
  "erro": "Item nao encontrado"
}
```

### POST /item

Cadastro direto desativado.

#### Exemplo de erro (405)

```json
{
  "erro": "Cadastro direto desativado. Consulte GET /item/<RFID> para cadastro indireto."
}
```

### PUT /item/<item_ref>

Atualiza os dados de um item.

#### Exemplo de entrada

```json
{
  "nome": "Produto A Atualizado",
  "valor": 39.9,
  "pendente": false,
  "ativo": true
}
```

#### Exemplo de saida

```json
{
  "mensagem": "Item atualizado com sucesso"
}
```

---

## /estoque

### PUT /estoque/<item_ref>

Atualiza o estoque e grava a movimentacao no historico.

#### Exemplo de entrada (adicionar)

```json
{
  "tipo": "add",
  "quantidade": 5
}
```

#### Exemplo de entrada (subtrair)

```json
{
  "tipo": "sub",
  "quantidade": 3
}
```

#### Exemplo de saida

```json
{
  "mensagem": "Estoque atualizado. Novo estoque: 12"
}
```

#### Exemplo de erro (400)

```json
{
  "erro": "Estoque nao pode ficar negativo"
}
```

---

## /historico

### GET /historico

Retorna todo o historico de movimentacoes.

#### Exemplo de saida

```json
[
  {
    "id": 2,
    "item_id": "AB12",
    "nome": "Produto A",
    "tipo": "sub",
    "quantidade": 3,
    "data": "2026-05-20 10:23:14"
  }
]
```

### GET /historico/<item_ref>

Retorna o historico de um item especifico.
A identificacao segue a regra: **4 caracteres = ID** e **8+ caracteres = RFID**.

#### Exemplo de chamada

```bash
curl http://localhost:5000/historico/AB12
```

```bash
curl http://localhost:5000/historico/RFID-001
```

#### Exemplo de saida

```json
[
  {
    "id": 1,
    "item_id": "AB12",
    "nome": "Produto A",
    "tipo": "add",
    "quantidade": 5,
    "data": "2026-05-20 10:23:13"
  }
]
```

#### Exemplo de erro (404)

```json
{
  "erro": "Nenhum historico encontrado para este item"
}
```

---

## /pendentes

### GET /pendentes

Retorna itens pendentes (apenas `id` e `rfid`).

#### Exemplo de saida

```json
[
  {
    "id": "CD34",
    "rfid": "XYZ789"
  }
]
```
