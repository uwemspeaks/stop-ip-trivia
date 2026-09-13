let questionBank = [];
let quizQuestions = [];
let currentIndex = 0;
let score = 0;
let answered = false;

const $ = (id) => document.getElementById(id);

const screens = {
  start: $("start-screen"),
  quiz: $("quiz-screen"),
  result: $("result-screen")
};

function showScreen(screen) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screen.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadQuestions() {
  try {
    const response = await fetch("questions.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Question bank could not be loaded.");
    questionBank = await response.json();
    if (!Array.isArray(questionBank) || questionBank.length < 10) {
      throw new Error("At least 10 questions are required.");
    }
    $("start-btn").disabled = false;
  } catch (error) {
    console.error(error);
    $("start-btn").textContent = "Question bank unavailable";
    $("start-btn").disabled = true;
    alert("The quiz could not load its question bank. Please refresh the page.");
  }
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startQuiz() {
  quizQuestions = shuffle(questionBank).slice(0, 10);
  currentIndex = 0;
  score = 0;
  showScreen(screens.quiz);
  renderQuestion();
}

function renderQuestion() {
  const q = quizQuestions[currentIndex];
  answered = false;

  $("category-label").textContent = q.category;
  $("difficulty-label").textContent = q.difficulty;
  $("question-count").textContent = `Question ${currentIndex + 1} of ${quizQuestions.length}`;
  $("score-mini").textContent = `Score: ${score}`;
  $("question-text").textContent = q.question;
  $("progress-bar").style.width = `${((currentIndex) / quizQuestions.length) * 100}%`;

  $("feedback").classList.add("hidden");
  $("next-btn").classList.add("hidden");
  $("options").innerHTML = "";

  shuffle(q.options.map((text, index) => ({ text, index }))).forEach(option => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.type = "button";
    button.textContent = option.text;
    button.addEventListener("click", () => answerQuestion(option.index, button));
    $("options").appendChild(button);
  });
}

function answerQuestion(selectedIndex, selectedButton) {
  if (answered) return;
  answered = true;

  const q = quizQuestions[currentIndex];
  const buttons = [...document.querySelectorAll(".option-btn")];

  buttons.forEach(btn => btn.disabled = true);

  if (selectedIndex === q.answer) {
    score++;
    selectedButton.classList.add("correct");
    $("feedback-title").textContent = "✓ Correct";
  } else {
    selectedButton.classList.add("incorrect");
    $("feedback-title").textContent = "✕ Not quite";
    const correctText = q.options[q.answer];
    buttons.find(btn => btn.textContent === correctText)?.classList.add("correct");
  }

  $("score-mini").textContent = `Score: ${score}`;
  $("explanation").textContent = q.explanation;
  $("fact").textContent = q.fact;
  $("feedback").classList.remove("hidden");
  $("next-btn").classList.remove("hidden");
  $("progress-bar").style.width = `${((currentIndex + 1) / quizQuestions.length) * 100}%`;
}

function nextQuestion() {
  if (currentIndex < quizQuestions.length - 1) {
    currentIndex++;
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  const total = quizQuestions.length;
  const percent = Math.round((score / total) * 100);

  $("final-score").textContent = `${score}/${total}`;
  $("final-percent").textContent = `${percent}%`;

  let message = "Keep learning.";
  if (percent >= 90) message = "Excellent IP knowledge.";
  else if (percent >= 70) message = "Strong foundation.";
  else if (percent >= 50) message = "Good start. Keep building.";
  else message = "Time for another round.";

  $("result-message").textContent = message;
  $("result-detail").textContent =
    `You answered ${score} out of ${total} questions correctly. Every question is an opportunity to learn more about intellectual property and responsible digital use.`;

  showScreen(screens.result);
}

async function shareResult() {
  const text = `I scored ${score}/${quizQuestions.length} on S.T.O.P IP Trivia. How well do you know intellectual property?`;

  if (navigator.share) {
    try {
      await navigator.share({ title: "S.T.O.P IP Trivia", text, url: window.location.href });
      return;
    } catch (_) {}
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + window.location.href)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

$("start-btn").addEventListener("click", startQuiz);
$("next-btn").addEventListener("click", nextQuestion);
$("retry-btn").addEventListener("click", startQuiz);
$("share-btn").addEventListener("click", shareResult);

loadQuestions();
