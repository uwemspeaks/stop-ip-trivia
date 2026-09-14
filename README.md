# S.T.O.P IP Trivia

A public education quiz web app about intellectual property, copyright, online piracy and creators' rights — built for the Nigerian Copyright Commission's Special Taskforce Against Online Piracy (S.T.O.P.).

This is a **static website**. It needs no server, no database, and no build step. It runs entirely in the visitor's browser.

---

## 1. What's in this project

```
/index.html       The page structure (all screens: intro, quiz, result, error)
/style.css        All visual styling
/app.js           All quiz logic (loading questions, scoring, sharing)
/questions.json   The question bank — this is the only file non-developers need to edit
/README.md        This file
```

**`questions.json` is the single source of truth for quiz content.** `app.js` never contains hard-coded questions — it always reads them from this file. This is intentional: it means a future version can replace this file's source with a Google Sheet, without changing the app's code.

---

## 2. How the quiz works

1. When the page loads, `app.js` fetches `questions.json`.
2. If the file fails to load, or fewer than 10 valid questions are found, the user sees a clear error screen instead of a blank page.
3. When the user presses **Start Quiz**, the app randomly picks 10 questions from the bank and shuffles the order of the answer options for each one (the correct answer always moves with its text).
4. Each question shows its category, its difficulty, and a progress bar.
5. After the user picks an answer, all options lock, the correct answer is marked, and — if the user was wrong — their selected answer is marked too. A short explanation and a "Did You Know?" fact follow.
6. After 10 questions, the user sees their score, a percentage, and a short assessment message.
7. **Play Again** starts a fresh, freshly-shuffled quiz. **Share Result** uses the phone's native share sheet where available, or opens a WhatsApp message as a fallback.

No personal data is collected anywhere in this app. There is no login, no tracking script, and no cookie use.

---

## 3. Updating questions (for non-developers)

Open `questions.json` in any plain text editor (Notepad, VS Code, or even GitHub's own web editor — see Section 6). Each question looks like this:

```json
{
  "id": 23,
  "category": "Copyright",
  "difficulty": "Easy",
  "question": "Which of these is generally protected by copyright?",
  "options": [
    "An original song",
    "A bare idea",
    "A fact",
    "A mathematical formula"
  ],
  "answer": 0,
  "explanation": "Original creative works such as songs are protected by copyright.",
  "fact": "Copyright protects expression, not the underlying idea."
}
```

### How each field works

| Field | What it means |
|---|---|
| `id` | A unique number for the question. No two questions should share an `id`. |
| `category` | One short label, e.g. `Copyright`, `Music`, `Nigerian Copyright Law`. |
| `difficulty` | Must be exactly `Easy`, `Medium`, or `Hard`. |
| `question` | The question text shown to the user. |
| `options` | A list of possible answers. You can have as few as 2 or as many as fits well on a phone screen (4 is ideal). |
| `answer` | **The position of the correct answer, counting from 0.** `0` = the first option, `1` = the second, `2` = the third, `3` = the fourth. |
| `explanation` | Shown after the user answers — explains why the correct answer is correct. |
| `fact` | An extra "Did You Know?" fact shown alongside the explanation. |
| `verify` *(optional)* | Not shown to users. Use this to flag a question that still needs legal sign-off, e.g. `"verify": "Confirm against Copyright Act 2022 section on ISP liability."` |

### To add a question

Copy an existing `{ ... }` block, paste it at the end of the list (just before the final `]`), give it a new unique `id`, and fill in your own text. Make sure there's a comma after the previous question's closing `}`.

### To remove a question

Delete its entire `{ ... }` block, including the trailing comma if it's no longer the last item.

### To edit a question

Change the text inside the relevant field. Double-check the `answer` number still points at the correct option if you reorder or reword the options.

### Before publishing

- Run the file through a free online "JSON validator" if you're not confident about commas and brackets — a single missing comma will stop the whole quiz from loading.
- Any question touching Nigerian copyright law (or flagged with a `verify` note) should be checked by the S.T.O.P. legal team against the Nigerian Copyright Act 2022 before it goes live. This app does not give legal advice, and no absolute legal claims should be published without that review.
- Keep at least 10 valid questions in the file at all times — the app will show an error screen if there are fewer.

---

## 4. Deploying: GitHub setup

1. Go to [github.com](https://github.com) and sign in (or create a free account).
2. Click the **+** icon in the top right, then **New repository**.
3. Name it something like `stop-ip-trivia`. Set it to **Public** or **Private** as your team prefers. Do not check "Add a README" (we already have one).
4. Click **Create repository**.
5. On the new repository's page, click **uploading an existing file**.
6. Drag in all five files from this project: `index.html`, `style.css`, `app.js`, `questions.json`, `README.md`.
7. Scroll down and click **Commit changes**.

Your code is now on GitHub.

---

## 5. Deploying: Connecting to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in (you can sign in directly with your GitHub account).
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub** and authorise Netlify to access your repositories if prompted.
4. Select the `stop-ip-trivia` repository you created above.
5. Netlify will show build settings. This project needs no build step, so:
   - **Build command:** leave empty
   - **Publish directory:** leave as `/` (the root)
6. Click **Deploy site**.

Within a minute or two, Netlify will give you a live web address (something like `random-name-123.netlify.app`). Open it to confirm the quiz works.

You can rename this address, or connect a custom domain, from the site's **Domain settings** in Netlify at any time.

---

## 6. Updating the live quiz after launch

Because GitHub and Netlify are connected, **any change you push to GitHub automatically redeploys the live site** — usually within a minute.

The simplest way to update questions without installing anything:

1. Go to your repository on GitHub.
2. Click on `questions.json`.
3. Click the pencil (✏️) **Edit** icon.
4. Make your changes.
5. Scroll down and click **Commit changes**.
6. Netlify will automatically rebuild and publish the update. Refresh the live site after a minute to confirm.

---

## 7. Testing changes before publication

Before committing a questions.json change to the live repository:

1. Open `questions.json` in a JSON validator (search "JSON validator" — many free ones exist) to catch syntax mistakes.
2. If possible, open `index.html` locally in a browser first (double-click the file, or use a simple local server) to click through the quiz and confirm your new questions display and score correctly.
3. Confirm any legally sensitive question has been reviewed against the Nigerian Copyright Act 2022.
4. Only then commit the change on GitHub.

---

## 8. Recommended V2 improvements

These are intentionally **not** built into this first version, to keep it simple and fast to ship. Worth considering later:

- **Google Sheets integration** — let the team manage questions in a spreadsheet, with an approval step, automatically syncing to `questions.json`.
- **Category and difficulty selection** — let users choose a focus area before starting.
- **Daily question / Monthly S.T.O.P. IP Challenge** — a recurring engagement feature.
- **School and organisation competitions**, with basic leaderboards.
- **Badges or certificates** for high scorers, shareable on social media.
- **Analytics** (aggregate and privacy-respecting) to see which questions people struggle with most.
- **A dedicated "Nigerian Copyright Act learning mode"**, once the legal content has been fully reviewed and expanded.

None of these require rebuilding the current app — the architecture (a separate, swappable `questions.json`, and clearly separated app logic) was designed to support adding them later without a rewrite.
