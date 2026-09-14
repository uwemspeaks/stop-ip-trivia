/* ==========================================================================
   S.T.O.P IP TRIVIA — app.js

   Sections in this file:
   1. Config
   2. State
   3. DOM references
   4. Data loading
   5. Quiz logic (pure-ish helper functions)
   6. Rendering
   7. Event handlers
   8. Sharing
   9. Init
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* 1. CONFIG                                                              */
/* ---------------------------------------------------------------------- */

const CONFIG = {
  // The quiz always uses every valid question currently in questions.json —
  // there is no fixed "10" anywhere. Swap questions.json for a 15-question
  // bank and the app automatically becomes a 15-question quiz; swap in a
  // 40-question bank and it becomes a 40-question quiz. minQuestionsRequired
  // is only a floor below which the app refuses to run (see loadQuestions).
  questionsFile: "questions.json",
  minQuestionsRequired: 10,
};

/* ---------------------------------------------------------------------- */
/* 2. STATE                                                               */
/* ---------------------------------------------------------------------- */

const state = {
  allQuestions: [],
  quizQuestions: [], // the shuffled subset used for this attempt, each with shuffled options
  currentIndex: 0,
  score: 0,
  hasAnswered: false,
};

/* ---------------------------------------------------------------------- */
/* 3. DOM REFERENCES                                                      */
/* ---------------------------------------------------------------------- */

const dom = {
  screens: {
    intro: document.getElementById("screen-intro"),
    quiz: document.getElementById("screen-quiz"),
    result: document.getElementById("screen-result"),
    error: document.getElementById("screen-error"),
  },
  btnStart: document.getElementById("btn-start"),
  btnNext: document.getElementById("btn-next"),
  btnPlayAgain: document.getElementById("btn-play-again"),
  btnShare: document.getElementById("btn-share"),
  btnRetry: document.getElementById("btn-retry"),

  progressLabel: document.getElementById("quiz-progress-label"),
  progressFill: document.getElementById("progress-fill"),
  progressTrack: document.querySelector(".progress-track"),

  questionCategory: document.getElementById("question-category"),
  questionDifficulty: document.getElementById("question-difficulty"),
  questionText: document.getElementById("quiz-heading"),
  optionsList: document.getElementById("options-list"),

  feedbackPanel: document.getElementById("feedback-panel"),
  feedbackVerdict: document.getElementById("feedback-verdict"),
  feedbackExplanation: document.getElementById("feedback-explanation"),
  feedbackFact: document.getElementById("feedback-fact"),

  resultScore: document.getElementById("result-score"),
  resultPercent: document.getElementById("result-percent"),
  resultAssessment: document.getElementById("result-assessment"),

  errorMessage: document.getElementById("error-message"),
};

/* ---------------------------------------------------------------------- */
/* 4. DATA LOADING                                                        */
/* ---------------------------------------------------------------------- */

async function loadQuestions() {
  try {
    const response = await fetch(CONFIG.questionsFile, { cache: "no-cache" });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Question bank is empty or malformed.");
    }

    const validQuestions = data.filter(isValidQuestion);

    if (validQuestions.length < CONFIG.minQuestionsRequired) {
      showError(
        `Only ${validQuestions.length} valid question(s) are available, but ${CONFIG.minQuestionsRequired} are required to run the quiz. Please update questions.json.`
      );
      return;
    }

    state.allQuestions = validQuestions;
    updateQuestionCountDisplays(validQuestions.length);
    showScreen("intro");
  } catch (err) {
    console.error("Failed to load questions:", err);
    showError(
      "The question bank could not be loaded. Please check your connection and try again."
    );
  }
}

function isValidQuestion(q) {
  return (
    q &&
    typeof q.id !== "undefined" &&
    typeof q.question === "string" &&
    Array.isArray(q.options) &&
    q.options.length >= 2 &&
    typeof q.answer === "number" &&
    q.answer >= 0 &&
    q.answer < q.options.length &&
    typeof q.category === "string" &&
    typeof q.difficulty === "string"
  );
}

/* ---------------------------------------------------------------------- */
/* 5. QUIZ LOGIC                                                          */
/* ---------------------------------------------------------------------- */

function shuffleArray(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Builds the set of questions for a single quiz attempt:
 * - randomly selects up to `count` questions from the bank
 * - shuffles each question's options while tracking the new correct index
 */
function buildQuizQuestions(bank, count) {
  const chosen = shuffleArray(bank).slice(0, count);

  return chosen.map((q) => {
    const optionOrder = shuffleArray(q.options.map((_, i) => i));
    const shuffledOptions = optionOrder.map((originalIndex) => q.options[originalIndex]);
    const newAnswerIndex = optionOrder.indexOf(q.answer);

    return {
      id: q.id,
      category: q.category,
      difficulty: q.difficulty,
      question: q.question,
      options: shuffledOptions,
      answer: newAnswerIndex,
      explanation: q.explanation || "",
      fact: q.fact || "",
    };
  });
}

function getAssessment(score, total) {
  const ratio = score / total;
  if (ratio >= 0.9) return "Excellent IP knowledge.";
  if (ratio >= 0.7) return "Strong foundation.";
  if (ratio >= 0.4) return "Good start. Keep building.";
  return "Time for another round.";
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

/* ---------------------------------------------------------------------- */
/* 6. RENDERING                                                           */
/* ---------------------------------------------------------------------- */

function showScreen(name) {
  Object.entries(dom.screens).forEach(([key, el]) => {
    el.classList.toggle("is-hidden", key !== name);
  });
}

function showError(message) {
  dom.errorMessage.textContent = message;
  showScreen("error");
}

/**
 * Keeps every "X questions" mention on the intro screen in sync with
 * however many valid questions are actually in questions.json right now.
 */
function updateQuestionCountDisplays(count) {
  document.querySelectorAll(".js-question-count").forEach((el) => {
    el.textContent = String(count);
  });
}

function startQuiz() {
  // Every valid question in the bank is used in the quiz — the quiz
  // length always matches the intro screen's question count exactly.
  state.quizQuestions = buildQuizQuestions(state.allQuestions, state.allQuestions.length);
  state.currentIndex = 0;
  state.score = 0;

  showScreen("quiz");
  renderQuestion();
}

function renderQuestion() {
  const total = state.quizQuestions.length;
  const index = state.currentIndex;
  const q = state.quizQuestions[index];

  state.hasAnswered = false;

  // Progress
  dom.progressLabel.textContent = `Question ${index + 1} of ${total}`;
  const percent = Math.round((index / total) * 100);
  dom.progressFill.style.width = `${percent}%`;
  dom.progressTrack.setAttribute("aria-valuenow", String(percent));

  // Tags
  dom.questionCategory.textContent = q.category;
  dom.questionDifficulty.textContent = q.difficulty;

  // Question text
  dom.questionText.textContent = q.question;

  // Options
  dom.optionsList.innerHTML = "";
  q.options.forEach((optionText, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.setAttribute("data-index", String(i));

    const letterSpan = document.createElement("span");
    letterSpan.className = "option-letter";
    letterSpan.textContent = `${OPTION_LETTERS[i]}.`;

    const textSpan = document.createElement("span");
    textSpan.textContent = optionText;

    btn.appendChild(letterSpan);
    btn.appendChild(textSpan);
    btn.addEventListener("click", () => handleAnswer(i));

    dom.optionsList.appendChild(btn);
  });

  // Reset feedback panel
  dom.feedbackPanel.classList.add("is-hidden");
  dom.feedbackVerdict.className = "feedback-verdict";
}

function handleAnswer(selectedIndex) {
  if (state.hasAnswered) return;
  state.hasAnswered = true;

  const q = state.quizQuestions[state.currentIndex];
  const isCorrect = selectedIndex === q.answer;

  if (isCorrect) {
    state.score += 1;
  }

  // Disable all options and mark correct/incorrect
  const optionButtons = Array.from(dom.optionsList.querySelectorAll(".option-btn"));
  optionButtons.forEach((btn) => {
    const i = Number(btn.getAttribute("data-index"));
    btn.disabled = true;

    if (i === q.answer) {
      btn.classList.add("is-correct");
    } else if (i === selectedIndex) {
      btn.classList.add("is-incorrect");
    }
  });

  // Update progress bar to reflect this question as complete
  const total = state.quizQuestions.length;
  const percent = Math.round(((state.currentIndex + 1) / total) * 100);
  dom.progressFill.style.width = `${percent}%`;
  dom.progressTrack.setAttribute("aria-valuenow", String(percent));

  // Feedback
  dom.feedbackVerdict.textContent = isCorrect ? "Correct" : "Not Quite";
  dom.feedbackVerdict.classList.add(isCorrect ? "is-correct" : "is-incorrect");
  dom.feedbackExplanation.textContent = q.explanation;
  dom.feedbackFact.textContent = q.fact || "No additional fact for this question.";

  dom.feedbackPanel.classList.remove("is-hidden");
  dom.feedbackPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function goToNextQuestion() {
  const total = state.quizQuestions.length;

  if (state.currentIndex + 1 >= total) {
    renderResult();
    showScreen("result");
    return;
  }

  state.currentIndex += 1;
  renderQuestion();
}

function renderResult() {
  const total = state.quizQuestions.length;
  const score = state.score;
  const percent = Math.round((score / total) * 100);

  dom.resultScore.textContent = `${score}/${total}`;
  dom.resultPercent.textContent = `${percent}%`;
  dom.resultAssessment.textContent = getAssessment(score, total);
}

/* ---------------------------------------------------------------------- */
/* 7. EVENT HANDLERS                                                      */
/* ---------------------------------------------------------------------- */

dom.btnStart.addEventListener("click", startQuiz);
dom.btnNext.addEventListener("click", goToNextQuestion);
dom.btnPlayAgain.addEventListener("click", startQuiz);
dom.btnRetry.addEventListener("click", loadQuestions);
dom.btnShare.addEventListener("click", shareResult);

/* ---------------------------------------------------------------------- */
/* 8. SHARING                                                             */
/* ---------------------------------------------------------------------- */

function shareResult() {
  const total = state.quizQuestions.length;
  const score = state.score;
  const url = window.location.href;
  const message = `I scored ${score}/${total} on the S.T.O.P IP Trivia quiz! Test your intellectual property knowledge: ${url}`;

  if (navigator.share) {
    navigator
      .share({
        title: "S.T.O.P IP Trivia",
        text: message,
        url: url,
      })
      .catch(() => {
        /* User cancelled the share sheet — no action needed. */
      });
    return;
  }

  // Fallback: WhatsApp share link
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

/* ---------------------------------------------------------------------- */
/* 9. INIT                                                                */
/* ---------------------------------------------------------------------- */

loadQuestions();
