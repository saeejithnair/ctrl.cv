# ctrl.cv

## Setup
```bash
conda create -n ctrl_cv python=3.11 -y
conda activate ctrl_cv
pip install flask requests python-dotenv flask-cors
npm install react react-dom react-scripts axios
npm start
```

## Pre-deployment setup
Add any ENV vars used in app.py (e.g. GITHUB_TOKEN, BACKEND_PORT, CORS_ORIGINS) to heroku config
```bash
heroku config:set BACKEND_PORT=5000
```

Add any ENV vars used in App.js (e.g. REACT_APP_API_BASE_URL) to netlify config (web dashboard)

## To Deploy
```bash
git push heroku main
npm run build
netlify deploy --prod
```
