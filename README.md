# Automation exercise
This is a Pipeline Pattern for get Tasks from Trello board to Todoist as an exercise.

# Requirements
- NodeJs (tested in 18.17.0)
- A Todoist Account

# How to run and build

1. Clone this project with ``git clone https://github.com/Bokkoa/puppeteer-automation-exercise.git``

2. Install dependencies with ``npm install``
3. Copy .env.example and rename it as .env
4. Fill the next .env variables

| Variable        | Description | Example |
| -------------   | ------------- | ------------- |
| HEADLESS_MODE   | If its true, hiddes the puppeteer browser instance | true
| TODOIST_PASSWORD | Credential for todoist login | password123 | 
| TODOIST_ACCOUNT | Credential for todoist login | example@example.com |


5. Run in dev mode with ``npm run dev``
6. To run as prod run ``npm run build`` then you can use ``npm start``
