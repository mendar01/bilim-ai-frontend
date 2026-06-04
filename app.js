const BACKEND_URL = "https://bilim-ai-backend-zavo.onrender.com"; // <-- поменяй!

const chat = document.getElementById("chat");
const sendBtn = document.getElementById("send");
const messageEl = document.getElementById("message");
const agreeEl = document.getElementById("agree");
const roleEl = document.getElementById("role");
const subjectEl = document.getElementById("subject");
const modeEl = document.getElementById("mode");
const statusEl = document.getElementById("status");

function addMsg(text, who) {
  const div = document.createElement("div");
  div.className = "msg " + who;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function canSend(text) {
  if (!agreeEl.checked) {
    addMsg("Алдымен ережелермен келіс: чекбоксты белгіле.", "bot");
    return false;
  }
  const t = text.toLowerCase();
  const bad = ["дайын жауап", "толық шығарып бер", "орындап бер", "емтихан жауап", "бақылау жауап"];
  if (bad.some((x) => t.includes(x))) {
    addMsg("Мен дайын жауапты толық бермеймін. Бірақ қадамдап түсіндіріп, бағыт көрсетемін. Шартыңды/өз қадамыңды жібер.", "bot");
    return false;
  }
  return true;
}

async function send() {
  const text = messageEl.value.trim();
  if (!text) return;
  if (!canSend(text)) return;

  addMsg(text, "user");
  messageEl.value = "";
  sendBtn.disabled = true;
  statusEl.textContent = "API: жауап күтілуде...";

  try {
    const r = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: roleEl.value,
        subject: subjectEl.value,
        mode: modeEl.value,
        message: text
      })
    });

    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "API error");

    addMsg(data.answer, "bot");
    statusEl.textContent = "API: gemini OK";
  } catch (e) {
    addMsg("Қате: " + e.message, "bot");
    statusEl.textContent = "API: қате";
  } finally {
    sendBtn.disabled = false;
  }
}

sendBtn.addEventListener("click", send);
messageEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});
