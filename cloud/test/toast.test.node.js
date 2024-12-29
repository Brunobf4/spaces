import { JSDOM } from "jsdom";
import createToast from "../../client/toast.js";

// Configura o jsdom
const { window } = new JSDOM("<!DOCTYPE html><html><body></body></html>");
global.document = window.document;
global.window = window;

// Função para testar o createToast
function testCreateToast() {
  // Limpa os toasts antes do teste
  const existingToasts = document.querySelectorAll("div");
  existingToasts.forEach((toast) => toast.remove());

  // Chama a função createToast
  createToast("Teste de sucesso!", "success");

  // Verifica se o toast foi criado
  const toast = document.querySelector("div");
  if (!toast) {
    console.error("Teste falhou: O toast não foi criado.");
    return;
  }

  // Verifica o conteúdo do toast
  if (toast.textContent !== "Teste de sucesso!") {
    console.error("Teste falhou: O texto do toast está incorreto.");
    return;
  }

  // Verifica a classe do toast
  if (!toast.classList.contains("bg-green-500")) {
    console.error("Teste falhou: A classe do toast está incorreta.");
    return;
  }

  console.log("Teste de sucesso: O toast foi criado corretamente.");
}

// Executa o teste
testCreateToast();
