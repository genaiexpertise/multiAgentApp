from flask import Flask, jsonify, request, abort, redirect, url_for
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from uuid import uuid4
from threading import Thread
from crews import TechnologyResearchCrew
from log_manager import append_event, outputs, outputs_lock, Event
from datetime import datetime
import json
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.secret_key = 'your_secret_key'  # Set a secret key for session management

login_manager = LoginManager()
login_manager.init_app(app)

# In-memory "database" for storing users
users = {}

# User class for Flask-Login
class User(UserMixin):
    def __init__(self, id, username, password):
        self.id = id
        self.username = username
        self.password = password

    def get_id(self):
        return self.id

# Add a test user (In real apps, use a proper database)
users['admin'] = User(id='1', username='admin', password=generate_password_hash('admin', method='scrypt'))

# Load user callback for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    for user in users.values():
        if user.get_id() == user_id:
            return user
    return None

# Simple login route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        abort(400, description="Missing username or password.")

    user = users.get(username)
    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify({"message": "Logged in successfully!"}), 200
    else:
        abort(401, description="Invalid credentials.")

# Simple logout route
@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully!"}), 200

# Protect multi-agent routes with login
@login_required
def kickoff_crew(input_id, technologies: list[str], businessareas: list[str]):
    print(f"Running crew for {input_id} with technologies {technologies} and businessareas {businessareas}")

    results = None
    try:
        company_research_crew = TechnologyResearchCrew(input_id)
        company_research_crew.setup_crew(technologies, businessareas)
        results = company_research_crew.kickoff()

        print(f"CREW COMPLETE: {results}")

    except Exception as e:
        print(f"CREW FAILED: {str(e)}")
        append_event(input_id, f"CREW FAILED: {str(e)}")
        with outputs_lock:
            outputs[input_id].status = 'ERROR'
            outputs[input_id].result = str(e)

    with outputs_lock:
        outputs[input_id].status = 'COMPLETE'
        outputs[input_id].result = results
        outputs[input_id].events.append(Event(timestamp=datetime.now(), data="Crew complete"))

@app.route('/api/multiagent', methods=['POST'])
@login_required
def run_crew():
    data = request.json
    if not data or 'technologies' not in data or 'businessareas' not in data:
        abort(400, description="Invalid request with missing data.")

    input_id = str(uuid4())
    technologies = data['technologies']
    businessareas = data['businessareas']
    
    thread = Thread(target=kickoff_crew, args=(input_id, technologies, businessareas))
    thread.start()

    return jsonify({"input_id": input_id}), 200

@app.route('/api/multiagent/<input_id>', methods=['GET'])
@login_required
def get_status(input_id):
    with outputs_lock:
        output = outputs.get(input_id)
        if output is None:
            abort(404, description="Output not found")

    try:
        result_json = json.loads(output.result)
    except json.JSONDecodeError:
        result_json = output.result

    return jsonify({
        "input_id": input_id,
        "status": output.status,
        "result": result_json,
        "events": [{"timestamp": event.timestamp.isoformat(), "data": event.data} for event in output.events]
    })

if __name__ == '__main__':
    app.run(debug=True, port=3001)
