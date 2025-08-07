#! /usr/bin/env bash

set -e
set -x

# Let the DB start
# 仮想環境内のPythonを使ってスクリプトを実行
/app/.venv/bin/python app/backend_pre_start.py

# Run migrations
# 仮想環境内のAlembicを使ってマイグレーションを実行
/app/.venv/bin/alembic upgrade head

# Create initial data in DB
# 仮想環境内のPythonを使ってスクリプトを実行
/app/.venv/bin/python app/initial_data.py