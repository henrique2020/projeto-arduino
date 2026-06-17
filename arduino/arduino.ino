#include <SPI.h>
#include <MFRC522.h>
#include <LiquidCrystal.h>
#include <Keypad.h>

#define SS_PIN 10
#define RST_PIN 255

MFRC522 rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;

// LCD 16x2
const int rs = 6, en = 7, d4 = 5, d5 = 4, d6 = 3, d7 = 2;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

// Teclado matricial 4x4
const byte ROWS = 4;
const byte COLS = 4;

char hexaKeys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};

byte rowPins[ROWS] = {8, 9, A0, A1};
byte colPins[COLS] = {A2, A3, A4, A5};

Keypad teclado = Keypad(makeKeymap(hexaKeys), rowPins, colPins, ROWS, COLS);

// ====== ESTADOS DO SISTEMA ======
enum Estado {
  AGUARDANDO_RFID,      // Tela "Aproxime a TAG" - aceita apenas RFID
  EXIBINDO_MENSAGEM,    // Mostra mensagem temporária (3s) - não aceita nada
  EXIBINDO_ITEM,        // Mostra info do item - aceita teclas A, B ou *
  DIGITANDO_QTD         // Usuário digitando quantidade - aceita 0-9, * ou #
};

Estado estadoAtual = AGUARDANDO_RFID;

// ====== DADOS DO ITEM ATUAL ======
String itemId = "";
String itemNome = "";
String itemQtd = "";

// ====== CONTROLE DE OPERAÇÃO ======
String operacao = "";       // "ADD" ou "SUB"
String qtdDigitada = "";    // Dígitos informados pelo usuário

// ====== CONTROLE DE TEMPO (mensagem temporária) ======
unsigned long tempoMensagem = 0;
const unsigned long DURACAO_MENSAGEM = 3000; // 3 segundos

// ====== BUFFER SERIAL ======
String serialBuffer = "";

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();
  lcd.begin(16, 2);

  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }

  mostrarTelaInicial();
}

void loop() {
  // Processa dados da serial (sempre, independente do estado)
  lerSerial();

  // Verifica timeout de mensagem temporária
  if (estadoAtual == EXIBINDO_MENSAGEM) {
    if (millis() - tempoMensagem >= DURACAO_MENSAGEM) {
      mostrarTelaInicial();
    }
    return; // Não processa mais nada durante exibição de mensagem
  }

  // Lê RFID apenas no estado AGUARDANDO_RFID
  if (estadoAtual == AGUARDANDO_RFID) {
    lerRFID();
  }

  // Lê teclado apenas nos estados EXIBINDO_ITEM ou DIGITANDO_QTD
  if (estadoAtual == EXIBINDO_ITEM || estadoAtual == DIGITANDO_QTD) {
    lerTeclado();
  }
}

// ====== TELA INICIAL ======
void mostrarTelaInicial() {
  estadoAtual = AGUARDANDO_RFID;
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Aproxime a TAG");
  // Limpa dados residuais
  itemId = "";
  itemNome = "";
  itemQtd = "";
  operacao = "";
  qtdDigitada = "";
}

// ====== LEITURA SERIAL ======
void lerSerial() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\n') {
      serialBuffer.trim();
      if (serialBuffer.length() > 0) {
        processarMensagemSerial(serialBuffer);
      }
      serialBuffer = "";
    } else {
      serialBuffer += c;
    }
  }
}

void processarMensagemSerial(String msg) {
  int separador = msg.indexOf(':');
  if (separador == -1) return; // Mensagem sem tag, ignorar

  String tag = msg.substring(0, separador);
  String conteudo = msg.substring(separador + 1);

  if (tag == "MENSAGEM") {
    // Caso 1: Exibe mensagem temporária no LCD
    exibirMensagemTemporaria(conteudo);
  }
  else if (tag == "ID") {
    // Caso 2: Formato ID:{id};NOME:{nome};QTD:{qtd}
    // A mensagem completa é: ID:{id};NOME:{nome};QTD:{qtd}
    // Precisamos parsear a partir da msg original
    parsearInfoItem(msg);
  }
}

void exibirMensagemTemporaria(String mensagem) {
  estadoAtual = EXIBINDO_MENSAGEM;
  tempoMensagem = millis();
  lcd.clear();
  lcd.setCursor(0, 0);
  // Se a mensagem cabe em uma linha
  if (mensagem.length() <= 16) {
    lcd.print(mensagem);
  } else {
    // Primeira linha: primeiros 16 caracteres
    lcd.print(mensagem.substring(0, 16));
    // Segunda linha: próximos 16 caracteres
    lcd.setCursor(0, 1);
    lcd.print(mensagem.substring(16, min((int)mensagem.length(), 32)));
  }
}

void parsearInfoItem(String msg) {
  // Formato esperado: ID:{id};NOME:{nome};QTD:{qtd}
  // Exemplo: ID:0001;NOME:Resistor 10k;QTD:150

  int posId = msg.indexOf("ID:");
  int posNome = msg.indexOf(";NOME:");
  int posQtd = msg.indexOf(";QTD:");

  if (posId == -1 || posNome == -1 || posQtd == -1) return;

  itemId = msg.substring(posId + 3, posNome);
  itemNome = msg.substring(posNome + 6, posQtd);
  itemQtd = msg.substring(posQtd + 5);

  // Limpa operação anterior
  operacao = "";
  qtdDigitada = "";

  // Muda estado e exibe info do item
  estadoAtual = EXIBINDO_ITEM;
  exibirInfoItem();
}

void exibirInfoItem() {
  lcd.clear();

  // Linha 1: Nome (até completar 16 chars)
  lcd.setCursor(0, 0);
  String linha1 = itemNome;
  // Limita ao tamanho da linha (16 caracteres)
  if (linha1.length() > 16) {
    linha1 = linha1.substring(0, 16);
  }
  lcd.print(linha1);

  // Linha 2: Quantidade
  lcd.setCursor(0, 1);
  lcd.print("QTD:");
  lcd.print(itemQtd);
}

// ====== LEITURA RFID ======
void lerRFID() {
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  // Envia UID pela serial com tag RFID:
  Serial.print("RFID:");
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) Serial.print("0");
    Serial.print(rfid.uid.uidByte[i], HEX);
    if (i < rfid.uid.size - 1) {
      Serial.print("-");
    }
  }
  Serial.println();

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// ====== LEITURA TECLADO ======
void lerTeclado() {
  char tecla = teclado.getKey();
  if (!tecla) return;

  if (estadoAtual == EXIBINDO_ITEM) {
    // Neste estado, só aceita A, B ou *
    if (tecla == 'A') {
      operacao = "ADD";
      qtdDigitada = "";
      estadoAtual = DIGITANDO_QTD;
      atualizarLinha2Operacao();
    }
    else if (tecla == 'B') {
      operacao = "SUB";
      qtdDigitada = "";
      estadoAtual = DIGITANDO_QTD;
      atualizarLinha2Operacao();
    }
    else if (tecla == '*') {
      cancelarOperacao();
    }
    // Qualquer outra tecla: ignorar
  }
  else if (estadoAtual == DIGITANDO_QTD) {
    if (qtdDigitada.length() == 0) {
      // Primeiro dígito: aceita apenas numérico ou * para cancelar
      if (tecla >= '0' && tecla <= '9') {
        qtdDigitada += tecla;
        atualizarLinha2Operacao();
      }
      else if (tecla == '*') {
        cancelarOperacao();
      }
      // Qualquer outra tecla: ignorar
    }
    else {
      // Já tem pelo menos um dígito: aceita numérico, * ou #
      if (tecla >= '0' && tecla <= '9') {
        qtdDigitada += tecla;
        atualizarLinha2Operacao();
      }
      else if (tecla == '*') {
        cancelarOperacao();
      }
      else if (tecla == '#') {
        confirmarOperacao();
      }
      // Qualquer outra tecla: ignorar
    }
  }
}

void atualizarLinha2Operacao() {
  // Linha 2: {qtdEstoque} {ADD/SUB}:{qtdDigitada}
  lcd.setCursor(0, 1);
  lcd.print("                "); // Limpa linha 2
  lcd.setCursor(0, 1);

  String linha2 = "QTD:" + itemQtd + " " + operacao + ":" + qtdDigitada;
  if (linha2.length() > 16) {
    linha2 = linha2.substring(0, 16);
  }
  lcd.print(linha2);
}

void cancelarOperacao() {
  estadoAtual = EXIBINDO_MENSAGEM;
  tempoMensagem = millis();
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Cancelado!");
  // Após 3 segundos, volta para tela inicial (controlado no loop)
}

void confirmarOperacao() {
  // Envia pela serial: {ADD/SUB}:{id}:{qtd}
  Serial.print(operacao);
  Serial.print(":");
  Serial.print(itemId);
  Serial.print(":");
  Serial.println(qtdDigitada);

  // Aguarda resposta da serial (MENSAGEM:...)
  // O sistema vai processar quando chegar via lerSerial()
  // Enquanto isso, mostra feedback de envio
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Enviando...");

  // Muda para um estado que não aceita entrada
  // mas permite receber serial
  estadoAtual = EXIBINDO_MENSAGEM;
  tempoMensagem = millis();
}
