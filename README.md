# Multi-user TODO App (Django + JavaScript)

This project is a simple multi-user TODO list web app:
- Users can register and log in
- Each user has their own TODOs
- Each TODO has a due date and can be marked complete
- A daily "morning reminder" management command emails (prints to console by default) each user their TODOs due today

## Requirements

- Python 3.9+
- pip

## Setup

From the project directory:

```bash
cd "/Users/cicige/Documents/17356/To-do-app"

python3 -m venv .venv
source .venv/bin/activate

pip install django djangorestframework
python manage.py migrate
```

## Run the app

```bash
python manage.py runserver 127.0.0.1:8000
```

Open:
- `http://127.0.0.1:8000/`
- `http://127.0.0.1:8000/login/`
- `http://127.0.0.1:8000/register/`

## API endpoints (token auth)

All API endpoints are under `/api/` and require an auth token:
- `POST /api/auth/register/` (username, email, password)
- `POST /api/auth/login/` (username, password)
- `GET /api/todos/` (list current user's todos)
- `POST /api/todos/` (create todo: title, due_date)
- `GET /api/todos/today/` (todos due today, not completed)
- `PATCH /api/todos/<id>/` (update: supports `completed`)
- `DELETE /api/todos/<id>/` (delete)

Authentication header:
- `Authorization: Token <token>`

## Daily morning reminder

Uses Django's console email backend by default (so emails show up in the server terminal).

Run for today:

```bash
python manage.py send_daily_reminders
```

Run for a specific date (YYYY-MM-DD):

```bash
python manage.py send_daily_reminders --date 2026-03-19
```

## Notes

- Tokens are stored using DRF's `rest_framework.authtoken` app.
- If you prefer real emails instead of console output, replace `EMAIL_BACKEND` in `config/settings.py`.

## Approved Contributions

This section is updated automatically after pull requests are merged.
- qianxuege 2026-03-24 made a small change
- orangebelly 2026-03-24 scarlett change
