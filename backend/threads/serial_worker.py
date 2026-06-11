import time
import serial
import requests

# --- Configuração ---
PORTA_SERIAL = "COM3"
BAUD_RATE = 9600
API_BASE_URL = "http://localhost:5000"
TIMEOUT_SERIAL = 0.1
DELAY_BOOT_ARDUINO = 2
DELAY_LOOP = 0.1


# --- Resposta Serial ---
def enviar_resposta(ser, mensagem):
    try:
        ser.write(f"{mensagem}\n".encode("utf-8"))
    except Exception as e:
        print(f"[SERIAL] Erro ao enviar resposta: {e}")


# --- Processamento de Comandos Recebidos ---
def consulta(rfid, ser):
    """Consulta item por RFID na API e repassa o resultado pela serial."""
    try:
        resposta = requests.get(f"{API_BASE_URL}/item/{rfid}", timeout=5)
    except requests.RequestException as e:
        print(f"[SERIAL] Falha na conexão com a API: {e}")
        enviar_resposta(ser, "ERRO:API_OFFLINE")
        return

    status = resposta.status_code
    dados = resposta.json()

    if status == 200:
        if "nome" in dados and "estoque" in dados:
            enviar_resposta(ser, f"OK:{dados['nome']}:{dados['estoque']}")
        elif "mensagem" in dados and "pendente" in dados["mensagem"].lower():
            enviar_resposta(ser, f"PENDENTE:{dados['id']}")
        elif "mensagem" in dados and "desativado" in dados["mensagem"].lower():
            enviar_resposta(ser, f"DESATIVADO:{dados['id']}")
        else:
            enviar_resposta(ser, "ERRO:RESPOSTA_INESPERADA")

    elif status == 201:
        enviar_resposta(ser, f"NOVO:{dados['id']}")

    else:
        erro = dados.get("erro", "Erro desconhecido")
        print(f"[SERIAL] API retornou {status}: {erro}")
        enviar_resposta(ser, f"ERRO:{erro}")


def atualiza(rfid, operacao, quantidade_str, ser):
    """Envia movimentação de estoque para a API e repassa resultado pela serial."""
    tipo_mov = "add" if operacao == "A" else "sub"

    try:
        quantidade = int(quantidade_str)
    except ValueError:
        enviar_resposta(ser, "ERRO:QUANTIDADE_INVALIDA")
        return

    payload = {"tipo": tipo_mov, "quantidade": quantidade}

    try:
        resposta = requests.put(
            f"{API_BASE_URL}/estoque/{rfid}", json=payload, timeout=5
        )
    except requests.RequestException as e:
        print(f"[SERIAL] Falha na conexão com a API: {e}")
        enviar_resposta(ser, "ERRO:API_OFFLINE")
        return

    dados = resposta.json()

    if resposta.status_code == 200:
        enviar_resposta(ser, f"OK:{dados.get('mensagem', '')}")
    else:
        erro = dados.get("erro", "Erro desconhecido")
        print(f"[SERIAL] Erro ao movimentar estoque: {erro}")
        enviar_resposta(ser, f"ERRO:{erro}")


# --- Validação e Processamento de Comandos ---
def processar_comando_serial(linha, ser):
    """Interpreta o comando recebido e direciona ao handler adequado."""
    linha = linha.strip()
    if not linha:
        return

    partes = linha.split(":")
    comando = partes[0].strip().upper()

    if comando == "RFID" and len(partes) == 2:
        rfid = partes[1].strip()
        consulta(rfid, ser)

    elif comando in ("ADD", "SUB") and len(partes) == 3:
        # ADD:<RFID>:5 ou SUB:<RFID>:3
        rfid = partes[1].strip()
        quantidade_str = partes[3].strip()
        atualiza(rfid, comando, quantidade_str, ser)

    else:
        print(f"[SERIAL] Comando não reconhecido: {linha}")
        enviar_resposta(ser, "ERRO:COMANDO_INVALIDO")


# --- Ouvinte da Porta Serial ---
def iniciar_escuta_serial():
    """Loop em background: lê serial → API → resposta serial."""
    try:
        ser = serial.Serial(PORTA_SERIAL, BAUD_RATE, timeout=TIMEOUT_SERIAL)
        time.sleep(DELAY_BOOT_ARDUINO)
        print(
            f"[SERIAL] Escutando {PORTA_SERIAL} @ {BAUD_RATE}bps | "
            f"API: {API_BASE_URL}"
        )

        while True:
            if ser.in_waiting > 0:
                linha = ser.readline().decode("utf-8", errors="ignore").strip()
                if linha:
                    print(f"[SERIAL] << {linha}")
                    processar_comando_serial(linha, ser)
            time.sleep(DELAY_LOOP)

    except serial.SerialException as e:
        print(f"[SERIAL] Erro na porta {PORTA_SERIAL}: {e}")
    except Exception as e:
        print(f"[SERIAL] Erro inesperado: {e}")
