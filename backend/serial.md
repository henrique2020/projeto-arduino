# Comunicação Serial

A API inicia uma thread em background que escuta a porta serial e redireciona os comandos para os endpoints HTTP internos. Toda resposta da API e repassada de volta pela porta serial.

## Configuração

As constantes estao definidas no topo de `threads/serial_worker.py`:

| Parametro        | Valor padrao              | Descricao                 |
| ---------------- | ------------------------- | ------------------------- |
| `PORTA_SERIAL` | `COM3`                  | Porta COM do Arduino      |
| `BAUD_RATE`    | `9600`                  | Velocidade da comunicacao |
| `API_BASE_URL` | `http://localhost:5000` | URL base da API           |

## Comandos aceitos

### RFID (Visualizar item)

Consulta um item pelo RFID. Se o item nao existir no banco, a API cria automaticamente com `pendente=1` e retorna o ID gerado.

#### Formato de entrada

```text
RFID:<RFID>
```

#### Exemplo

```text
RFID:00-11-22-33
```

#### Respostas possiveis

| Resposta                | Significado                                 |
| ----------------------- | ------------------------------------------- |
| `OK:<nome>:<estoque>` | Item ativo e cadastrado                     |
| `PENDENTE:<id>`       | Item existe mas cadastro nao foi concluido  |
| `DESATIVADO:<id>`     | Item desativado                             |
| `NOVO:<id>`           | RFID não existia, foi criado como pendente |
| `ERRO:<detalhe>`      | Falha na operacao                           |

#### Exemplos de resposta

```text
OK:Produto A:12
PENDENTE:AB12
DESATIVADO:CD34
NOVO:EF56
ERRO:API_OFFLINE
```

---

### ADD/SUB (Atualizar estoque)

Envia uma movimentacao de estoque (entrada ou saida) para a API.

#### Formato de entrada

```text
ADD:<RFID>:<QUANTIDADE>
SUB:<RFID>:<QUANTIDADE>
```

#### Exemplos

```text
ADD:00-11-22-33:5
SUB:11-22-33-44:3
```

#### Respostas possiveis

| Resposta           | Significado                         |
| ------------------ | ----------------------------------- |
| `OK:<mensagem>`  | Movimentacao registrada com sucesso |
| `ERRO:<detalhe>` | Falha na operacao                   |

#### Exemplos de resposta

```text
OK:Estoque atualizado. Novo estoque: 17
ERRO:Estoque não pode ficar negativo
ERRO:Item não encontrado
ERRO:API_OFFLINE
```

---

## Fluxo

```text
Arduino (Serial) --> serial_worker --> API HTTP --> serial_worker --> Arduino (Serial)
```

1. Arduino envia comando pela porta serial
2. `serial_worker` interpreta e faz requisicao HTTP para a API local
3. API processa e retorna JSON
4. `serial_worker` converte o JSON em mensagem simplificada
5. Resposta e enviada de volta ao Arduino pela serial

## Erros

Caso a API esteja offline ou haja falha de comunicacao, o Arduino recebe:

```text
ERRO:API_OFFLINE
```

Caso o comando enviado nao seja reconhecido:

```text
ERRO:COMANDO_INVALIDO
```
