// ======= НАСТРОЙКА: укажи backend URL =======
const API_URL = "https://bilim-ai-backend-zavo.onrender.com/api/chat";

// ======= SCORE =======
let score = Number(localStorage.getItem("score") || 0);

function renderScore(){
  const v = document.getElementById("scoreValue");
  if (v) v.textContent = String(score);
}
function addScore(delta){
  score += delta;
  localStorage.setItem("score", String(score));
  renderScore();
}

// ======= Elements =======
const langKz = document.getElementById("langKz");
const langRu = document.getElementById("langRu");
const langPill = document.getElementById("langPill");

const chipsEl = document.getElementById("chips");
const chatBox = document.getElementById("chatBox");
const messageEl = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

const roleEl = document.getElementById("role");
const subjectEl = document.getElementById("subject");
const modeEl = document.getElementById("mode");

const showTipsBtn = document.getElementById("showTips");
const clearChatBtn = document.getElementById("clearChat");

const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastText = document.getElementById("toastText");

// ======= i18n =======
const T = {
  ru: {
    subtitle: "Учебный помощник · Понятно · Красиво · Быстро",
    showTips: "Подсказки",
    clear: "Очистить",
    settingsTitle: "Настройки",
    status: "Online",
    role: "Роль",
    subject: "Предмет",
    mode: "Режим",
    modeExplain: "Түсіндіру (объяснить)",
    modeCheck: "Тексеру (проверить)",
    notice: "Совет: укажи класс, тему и что именно нужно — так ответ будет точнее.",
    promptsTitle: "Готовые промпты",
    promptsTag: "нажми чтобы вставить",
    chatTitle: "Чат",
    chatSub: "Напиши вопрос — отвечу по шагам. Если нужно, задам уточняющий вопрос.",
    hintTag: "Enter — отправить",
    inputPh: "Напиши вопрос… (пример: 7 класс, уравнения, объясни шагами)",
    send: "Отправить",
    helper: "Ответы могут ошибаться. Важное — перепроверь.",
    tipToastTitle: "Подсказка",
    tipToastText: "Пример: «8 класс, физика. Объясни законы Ньютона и реши 1 задачу»",
    cleared: "Чат очищен. Напиши новый вопрос.",
    aiErrorPrefix: "Ошибка: "
  },
  kz: {
    subtitle: "Оқу көмекшісі · Түсінікті · Әдемі · Жылдам",
    showTips: "Көмек",
    clear: "Тазалау",
    settingsTitle: "Баптаулар",
    status: "Online",
    role: "Рөл",
    subject: "Пән",
    mode: "Режим",
    modeExplain: "Түсіндіру",
    modeCheck: "Тексеру",
    notice: "Кеңес: сыныпты, тақырыпты және не керек екенін жаз — жауап дәлірек болады.",
    promptsTitle: "Дайын промпттар",
    promptsTag: "бассаң енгізіледі",
    chatTitle: "Чат",
    chatSub: "Сұрақ қой — қадамдап түсіндіремін. Қажет болса нақтылаймын.",
    hintTag: "Enter — жіберу",
    inputPh: "Сұрақ жаз… (мысал: 7-сынып, теңдеулер, қадамдап түсіндір)",
    send: "Жіберу",
    helper: "Жауап қате болуы мүмкін. Міндетті түрде тексер.",
    tipToastTitle: "Кеңес",
    tipToastText: "Мысал: «8-сынып, физика. Ньютон заңдарын түсіндір және 1 есеп шығар»",
    cleared: "Чат тазаланды. Жаңа сұрақ жаз.",
    aiErrorPrefix: "Қате: "
  }
};

// ======= Prompts =======
const PROMPTS = {
  ru: [
    { title: "Объясни тему", text: "7 класс, математика: объясни тему «линейные уравнения» с примерами." },
    { title: "Реши по шагам", text: "Реши по шагам: 2(3x-5)=4x+6. Объясни каждое действие." },
    { title: "Проверь решение", text: "Проверь моё решение и найди ошибки: (вставь решение ниже)" },
    { title: "Сделай конспект", text: "Сделай короткий конспект по теме и 5 вопросов для самопроверки." }
  ],
  kz: [
    { title: "Тақырыпты түсіндір", text: "7-сынып, математика: «сызықтық теңдеу» тақырыбын мысалмен түсіндір." },
    { title: "Қадамдап шығар", text: "Қадамдап шығар: 2(3x-5)=4x+6. Әр қадамды түсіндір." },
    { title: "Шешімді тексер", text: "Менің шешімімді тексеріп, қателерді көрсет: (төменге шешімімді жазамын)" },
    { title: "Қысқа конспект", text: "Тақырып бойынша қысқа конспект және өзімді тексеруге 5 сұрақ құрастыр." }
  ]
};

// ======= UI helpers =======
function setText(id, value){
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function toastShow(title, text, ms=2600){
  if (!toast || !toastTitle || !toastText) return;
  toastTitle.textContent = title;
  toastText.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastShow._t);
  toastShow._t = setTimeout(()=>toast.classList.remove("show"), ms);
}

function addMsg(text, who="ai"){
  if (!chatBox) return;
  const row = document.createElement("div");
  row.className = `msg msg--${who}`;
  const b = document.createElement("div");
  b.className = "msg__bubble";
  b.textContent = text;
  row.appendChild(b);
  chatBox.appendChild(row);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function renderPrompts(lang){
  if (!chipsEl) return;
  chipsEl.innerHTML = "";
  (PROMPTS[lang] || []).forEach(p => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `<p class="chip__title"></p><p class="chip__text"></p>`;
    chip.querySelector(".chip__title").textContent = p.title;
    chip.querySelector(".chip__text").textContent = p.text;

    chip.addEventListener("click", () => {
      if (!messageEl) return;
      messageEl.value = p.text;
      messageEl.focus();
      toastShow(T[lang].tipToastTitle, T[lang].promptsTag, 1600);
    });

    chipsEl.appendChild(chip);
  });
}

// ======= Academic integrity choice logic =======
function isLikelyReadyEssayRequest(userText){
  const t = (userText || "").toLowerCase();

  const essayWords = [
    "эссе","сочинение","реферат","доклад","презентация","конспект",
    "мәтін","шығарма","insha","essay"
  ];

  const readyWords = [
    "готов", "полностью", "целиком", "напиши", "написать", "сразу текст",
    "дай текст", "полный текст",
    "жазып бер", "жазып берші", "дайын", "толық", "көшіріп", "көшіріп алу",
    "копировать"
  ];

  const hasEssay = essayWords.some(w => t.includes(w));
  const wantsReady = readyWords.some(w => t.includes(w));

  return hasEssay && wantsReady;
}

function attachIntegrityChoiceUnderLastAiMessage(){
  if (!chatBox) return;

  const aiBubbles = chatBox.querySelectorAll(".msg--ai .msg__bubble");
  const lastBubble = aiBubbles[aiBubbles.length - 1];
  if (!lastBubble) return;

  // prevent duplicates
  if (lastBubble.querySelector(".choice")) return;

  const wrap = document.createElement("div");
  wrap.className = "choice";
  wrap.innerHTML = `
    <div class="choice__title">Таңдау жаса: ЖИ-ді қалай қолданасың?</div>
    <div class="choice__grid">
      <button class="choice__btn" type="button" data-opt="A">
        <b>A)</b> ЖИ-ге дайын эссе жазғызып, көшіріп алу
      </button>
      <button class="choice__btn" type="button" data-opt="B">
        <b>Ә)</b> ЖИ-ден эссенің жоспарын сұрап, мәтінді өзі жазу
      </button>
    </div>
    <div class="choice__result" style="display:none"></div>
  `;

  const result = wrap.querySelector(".choice__result");
  const buttons = wrap.querySelectorAll(".choice__btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const opt = btn.getAttribute("data-opt");
      buttons.forEach(b => b.disabled = true);

      result.style.display = "block";
      if (opt === "A"){
        result.className = "choice__result choice__result--red";
        result.textContent = "Қызыл аймақ: Академиялық адалдық бұзылды, ұпай шегеріледі!";
        addScore(-2);
      } else {
        result.className = "choice__result choice__result--green";
        result.textContent = "Жасыл аймақ: Керемет! Сен ЖИ-ді ассистент ретінде қолдандың";
        addScore(+2);
      }
    });
  });

  lastBubble.appendChild(wrap);
}

// ======= Language apply =======
function applyLang(lang){
  document.documentElement.lang = (lang === "kz") ? "kk" : "ru";
  localStorage.setItem("lang", lang);

  if (langKz) langKz.classList.toggle("active", lang === "kz");
  if (langRu) langRu.classList.toggle("active", lang === "ru");
  if (langPill) langPill.style.transform = (lang === "kz") ? "translateX(0px)" : "translateX(48px)";

  setText("subtitle", T[lang].subtitle);
  if (showTipsBtn) showTipsBtn.textContent = T[lang].showTips;
  if (clearChatBtn) clearChatBtn.textContent = T[lang].clear;

  setText("settingsTitle", T[lang].settingsTitle);
  setText("statusText", T[lang].status);
  setText("roleLabel", T[lang].role);
  setText("subjectLabel", T[lang].subject);
  setText("modeLabel", T[lang].mode);

  setText("modeExplainOpt", T[lang].modeExplain);
  setText("modeCheckOpt", T[lang].modeCheck);

  const notice = document.getElementById("noticeText");
  if (notice) notice.textContent = T[lang].notice;

  setText("promptsTitle", T[lang].promptsTitle);
  setText("promptsTag", T[lang].promptsTag);

  setText("chatTitle", T[lang].chatTitle);
  setText("chatSub", T[lang].chatSub);
  setText("hintTag", T[lang].hintTag);

  if (messageEl) messageEl.placeholder = T[lang].inputPh;
  if (sendBtn) sendBtn.textContent = T[lang].send;
  setText("helperText", T[lang].helper);

  renderScore();
  renderPrompts(lang);
}

// ======= Send message =======
async function send(){
  const msg = (messageEl?.value || "").trim();
  if (!msg) return;

  addMsg(msg, "user");
  messageEl.value = "";
  messageEl.focus();

  sendBtn.disabled = true;

  const lang = localStorage.getItem("lang") || "ru";

  try{
    const r = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        role: roleEl?.value || "",
        subject: subjectEl?.value || "",
        mode: modeEl?.value || "",
        message: msg
      })
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || "Request failed");

    addMsg(data.answer || "…", "ai");

    // IMPORTANT: show choice only when user asked for ready essay/text
    if (isLikelyReadyEssayRequest(msg)) {
      attachIntegrityChoiceUnderLastAiMessage();
    }
  }catch(e){
    addMsg(T[lang].aiErrorPrefix + (e.message || e), "ai");
  }finally{
    sendBtn.disabled = false;
  }
}

// ======= Events =======
langKz?.addEventListener("click", () => applyLang("kz"));
langRu?.addEventListener("click", () => applyLang("ru"));

showTipsBtn?.addEventListener("click", () => {
  const lang = localStorage.getItem("lang") || "ru";
  toastShow(T[lang].tipToastTitle, T[lang].tipToastText, 3200);
});

clearChatBtn?.addEventListener("click", () => {
  const lang = localStorage.getItem("lang") || "ru";
  if (chatBox) chatBox.innerHTML = "";
  addMsg(T[lang].cleared, "ai");
});

sendBtn?.addEventListener("click", send);

messageEl?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    send();
  }
});

// ======= Boot =======
(function init(){
  const saved = localStorage.getItem("lang");
  const lang = (saved === "kz" || saved === "ru") ? saved : "ru";
  applyLang(lang);

  if (lang === "ru"){
    addMsg("Привет! Напиши класс/тему и что нужно: объяснить или проверить.", "ai");
  } else {
    addMsg("Сәлем! Сынып/тақырып және не керек екенін жаз: түсіндіру ме, тексеру ме.", "ai");
  }
})();
