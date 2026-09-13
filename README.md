# S.T.O.P IP Trivia V1

A lightweight, mobile-first intellectual property trivia application for the Special Taskforce Against Online Piracy (S.T.O.P).

## Files

- index.html: application interface
- style.css: visual design
- app.js: quiz logic
- questions.json: editable question bank

## Run locally

Use a simple local web server. For example:

python -m http.server 8000

Then open:

http://localhost:8000

Opening index.html directly may block loading questions.json because of browser security rules.

## Update questions

Edit questions.json and keep the same structure.

Each question needs:

- id
- category
- difficulty
- question
- options
- answer
- explanation
- fact

The answer field is zero-based:

0 = first option
1 = second option
2 = third option
3 = fourth option

Keep the question bank at 10 or more questions.

## GitHub + Netlify

1. Create a GitHub repository.
2. Upload index.html, style.css, app.js and questions.json.
3. In Netlify, import the GitHub repository.
4. Build command: leave blank.
5. Publish directory: /
6. Deploy.

Afterward, every push to the GitHub repository triggers a new Netlify deployment.

## Future V2

Recommended next steps:

- Google Sheets question management
- approval/status workflow
- daily question
- categories and difficulty filters
- usage analytics
- leaderboard
- S.T.O.P campaign-specific quizzes
- reviewed Nigerian Copyright Act question bank

## Content review

Legal questions should be reviewed and approved by the appropriate S.T.O.P/NCC personnel before publication. The app is an educational tool and does not provide legal advice.
