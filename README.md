# ForgeFit

ForgeFit is a modern static web app that creates a personalized 4-week home fitness and nutrition plan from a detailed questionnaire.

It is designed for users who want:

- Muscle gain, fat loss, recomposition, or general fitness
- Home workouts without a gym
- Calisthenics and dumbbell-friendly programming
- Office-life aware training guidance
- Printable PDF-style plans

## Features

- Detailed questionnaire for body stats, goals, schedule, food style, recovery, and office routine
- 4-week workout plan with weekly progression
- Region-aware food guidance
- Water intake, calories, protein, and BMI estimates
- Weekly body-status roadmap
- Office routine strategy for desk workers and commuters
- Doctor-consult warning for injury or health-risk responses
- Professional print layout for browser PDF export

## Tech

- HTML
- CSS
- Vanilla JavaScript

## Run locally

Open the project folder and start a local server:

```powershell
python -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173
```

## Print as PDF

1. Complete the questionnaire.
2. Generate the plan.
3. Click `Print / Save PDF`.
4. In the browser print dialog, enable background graphics for best quality.

## Project files

- `index.html` - app structure and questionnaire
- `styles.css` - visual design and print styling
- `script.js` - plan generation and dashboard rendering

## Notes

- ForgeFit provides a practical heuristic plan and is not a medical diagnosis tool.
- Users with pain, injuries, asthma, diabetes, heart issues, surgery history, or medication concerns should consult a doctor before following intense exercise or supplement advice.
