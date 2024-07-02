# ctrl.cv

## Setup
```bash
conda create -n ctrl_cv python=3.11 -y
conda activate ctrl_cv
pip install flask requests python-dotenv flask-cors
npm install react react-dom react-scripts axios
npm start
```

## To Deploy
```bash
git push heroku main
npm run build
netlify deploy --prod
```
