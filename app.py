from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import os
import json
import random
import hashlib
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'sarmasproject2026'

# ── FILE PATHS ──
USERS_FILE = 'users.json'
VISITS_FILE = 'visits.json'

# ── HELPER FUNCTIONS ──
def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=2)

def load_visits():
    if os.path.exists(VISITS_FILE):
        with open(VISITS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_visits(visits):
    with open(VISITS_FILE, 'w') as f:
        json.dump(visits, f, indent=2)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# ── AUTH ROUTES ──
@app.route('/')
def home():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('index.html', username=session['user'])

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    data = request.json
    email = data.get('email', '').lower().strip()
    password = data.get('password', '')

    users = load_users()

    if email not in users:
        return jsonify({'success': False, 'message': 'Email not found! Please sign up.'})

    if users[email]['password'] != hash_password(password):
        return jsonify({'success': False, 'message': 'Wrong password! Try again.'})

    session['user'] = users[email]['username']
    session['email'] = email

    # Log visit
    visit_time = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    visits = load_visits()
    visits.append({
        'username': users[email]['username'],
        'email': email,
        'time': visit_time,
        'course': 'Not selected yet'
    })
    save_visits(visits)
    return jsonify({'success': True, 'message': 'Login successful!'})

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'GET':
        return render_template('signup.html')

    data = request.json
    username = data.get('username', '').strip()
    email = data.get('email', '').lower().strip()
    password = data.get('password', '')

    if not username or not email or not password:
        return jsonify({'success': False, 'message': 'Please fill all fields!'})

    users = load_users()

    if email in users:
        return jsonify({'success': False, 'message': 'Email already exists! Please login.'})

    users[email] = {
        'username': username,
        'email': email,
        'password': hash_password(password),
        'created': datetime.now().strftime('%d/%m/%Y %H:%M:%S')
    }
    save_users(users)

    return jsonify({'success': True, 'message': 'Account created! Please login.'})

@app.route('/forgot', methods=['GET', 'POST'])
def forgot():
    if request.method == 'GET':
        return render_template('forgot.html')

    data = request.json
    action = data.get('action')

    if action == 'send_code':
        email = data.get('email', '').lower().strip()
        users = load_users()

        if email not in users:
            return jsonify({'success': False, 'message': 'Email not found!'})

        # Generate reset code
        code = str(random.randint(1000, 9999))
        session['reset_code'] = code
        session['reset_email'] = email

        return jsonify({'success': True, 'code': code, 'message': 'Reset code generated!'})

    if action == 'reset_password':
        code = data.get('code', '')
        new_password = data.get('password', '')

        if code != session.get('reset_code'):
            return jsonify({'success': False, 'message': 'Wrong code! Try again.'})

        email = session.get('reset_email')
        users = load_users()
        users[email]['password'] = hash_password(new_password)
        save_users(users)

        session.pop('reset_code', None)
        session.pop('reset_email', None)

        return jsonify({'success': True, 'message': 'Password reset successful!'})

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/update_course', methods=['POST'])
def update_course():
    data = request.json
    course = data.get('course', '')
    email = session.get('email', '')

    visits = load_visits()
    for visit in reversed(visits):
        if visit['email'] == email:
            visit['course'] = course
            break
    save_visits(visits)
    return jsonify({'success': True})

# ── ADMIN ROUTE ──
@app.route('/admin')
def admin():
    password = request.args.get('password', '')
    if password != 'Sarmasproject':
        return '<h1>Access Denied!</h1><p>Add ?password=Sarmasproject to URL</p>'

    users = load_users()
    visits = load_visits()

    return render_template('admin.html',
        users=users,
        visits=visits,
        total_users=len(users),
        total_visits=len(visits)
    )

# ── PUC ROUTE ──
@app.route('/analyze_puc', methods=['POST'])
def analyze_puc():
    data = request.json
    name = data['name']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    subjects = data['subjects']

    subject_marks_list = [float(v) for v in subjects.values()]
    total = sum(subject_marks_list)
    percentage = round((total / 500) * 100, 2)
    grade = get_grade(percentage)
    subject_pass = all(float(m) >= 35 for m in subjects.values())
    status = "PASS" if subject_pass else "FAIL"
    risk = predict_risk(attendance, study_hours, percentage)
    subject_names = list(subjects.keys())
    subject_marks = [float(v) for v in subjects.values()]
    weak_subjects = [s for s, m in subjects.items() if float(m) < 35]

    return jsonify({
        'name': name, 'total': total,
        'percentage': percentage, 'grade': grade,
        'status': status, 'risk': risk,
        'attendance': attendance, 'study_hours': study_hours,
        'subject_names': subject_names,
        'subject_marks': subject_marks,
        'weak_subjects': weak_subjects
    })

# ── BCA SINGLE SEM ROUTE ──
@app.route('/analyze_bca_single', methods=['POST'])
def analyze_bca_single():
    data = request.json
    name = data['name']
    roll = data['roll']
    college = data['college']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    semester = data['semester']
    subjects = data['subjects']

    subject_marks_list = [float(v) for v in subjects.values()]
    total = sum(subject_marks_list)
    percentage = round((total / 500) * 100, 2)
    subject_pass = all(float(m) >= 35 for m in subjects.values())
    status = "PASS" if subject_pass else "FAIL"
    risk = predict_risk(attendance, study_hours, percentage)
    subject_names = list(subjects.keys())
    subject_marks = [float(v) for v in subjects.values()]
    weak_subjects = [s for s, m in subjects.items() if float(m) < 35]
    cgpa = calculate_cgpa(subject_marks)
    subject_grades = {s: get_grade(float(m)) for s, m in subjects.items()}
    subject_points = {s: get_grade_points(float(m)) for s, m in subjects.items()}

    return jsonify({
        'name': name, 'roll': roll, 'college': college,
        'semester': semester, 'total': total,
        'percentage': percentage, 'status': status,
        'risk': risk, 'cgpa': cgpa,
        'subject_names': subject_names,
        'subject_marks': subject_marks,
        'subject_grades': subject_grades,
        'subject_points': subject_points,
        'weak_subjects': weak_subjects
    })

# ── BCA ALL SEMS ROUTE ──
@app.route('/analyze_bca_all', methods=['POST'])
def analyze_bca_all():
    data = request.json
    name = data['name']
    roll = data['roll']
    college = data['college']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    semesters = data['semesters']

    sem_results = []
    all_marks = []
    total_points = 0
    completed_sems = 0

    for sem_num, subjects in semesters.items():
        if any(float(v) > 0 for v in subjects.values()):
            marks_list = [float(v) for v in subjects.values()]
            total = sum(marks_list)
            percentage = round((total / 500) * 100, 2)
            cgpa = calculate_cgpa(marks_list)
            subject_pass = all(float(m) >= 35 for m in subjects.values())
            status = "PASS" if subject_pass else "FAIL"
            weak = [s for s, m in subjects.items() if float(m) < 35]
            all_marks.extend(marks_list)
            total_points += cgpa
            completed_sems += 1

            sem_results.append({
                'semester': sem_num, 'total': total,
                'percentage': percentage, 'cgpa': cgpa,
                'status': status, 'weak_subjects': weak,
                'subject_names': list(subjects.keys()),
                'subject_marks': marks_list
            })

    sgpa = round(total_points / completed_sems, 2) if completed_sems > 0 else 0
    overall_percentage = round((sum(all_marks) / (completed_sems * 500)) * 100, 2)
    risk = predict_risk(attendance, study_hours, overall_percentage)

    return jsonify({
        'name': name, 'roll': roll, 'college': college,
        'sem_results': sem_results, 'sgpa': sgpa,
        'overall_percentage': overall_percentage,
        'completed_sems': completed_sems, 'risk': risk
    })

# ── BBA SINGLE SEM ROUTE ──
@app.route('/analyze_bba_single', methods=['POST'])
def analyze_bba_single():
    data = request.json
    name = data['name']
    roll = data['roll']
    college = data['college']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    semester = data['semester']
    subjects = data['subjects']

    subject_marks_list = [float(v) for v in subjects.values()]
    total = sum(subject_marks_list)
    percentage = round((total / 500) * 100, 2)
    subject_pass = all(float(m) >= 35 for m in subjects.values())
    status = "PASS" if subject_pass else "FAIL"
    risk = predict_risk(attendance, study_hours, percentage)
    subject_names = list(subjects.keys())
    subject_marks = [float(v) for v in subjects.values()]
    weak_subjects = [s for s, m in subjects.items() if float(m) < 35]
    cgpa = calculate_cgpa(subject_marks)

    return jsonify({
        'name': name, 'roll': roll, 'college': college,
        'semester': semester, 'total': total,
        'percentage': percentage, 'status': status,
        'risk': risk, 'cgpa': cgpa,
        'subject_names': subject_names,
        'subject_marks': subject_marks,
        'weak_subjects': weak_subjects
    })

# ── BBA ALL SEMS ROUTE ──
@app.route('/analyze_bba_all', methods=['POST'])
def analyze_bba_all():
    data = request.json
    name = data['name']
    roll = data['roll']
    college = data['college']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    semesters = data['semesters']

    sem_results = []
    all_marks = []
    total_points = 0
    completed_sems = 0

    for sem_num, subjects in semesters.items():
        if any(float(v) > 0 for v in subjects.values()):
            marks_list = [float(v) for v in subjects.values()]
            total = sum(marks_list)
            percentage = round((total / 500) * 100, 2)
            cgpa = calculate_cgpa(marks_list)
            subject_pass = all(float(m) >= 35 for m in subjects.values())
            status = "PASS" if subject_pass else "FAIL"
            weak = [s for s, m in subjects.items() if float(m) < 35]
            all_marks.extend(marks_list)
            total_points += cgpa
            completed_sems += 1

            sem_results.append({
                'semester': sem_num, 'total': total,
                'percentage': percentage, 'cgpa': cgpa,
                'status': status, 'weak_subjects': weak,
                'subject_names': list(subjects.keys()),
                'subject_marks': marks_list
            })

    sgpa = round(total_points / completed_sems, 2) if completed_sems > 0 else 0
    overall_percentage = round((sum(all_marks) / (completed_sems * 500)) * 100, 2)
    risk = predict_risk(attendance, study_hours, overall_percentage)

    return jsonify({
        'name': name, 'roll': roll, 'college': college,
        'sem_results': sem_results, 'sgpa': sgpa,
        'overall_percentage': overall_percentage,
        'completed_sems': completed_sems, 'risk': risk
    })

# ── BCOM SINGLE SEM ROUTE ──
@app.route('/analyze_bcom_single', methods=['POST'])
def analyze_bcom_single():
    data = request.json
    name = data['name']
    roll = data['roll']
    college = data['college']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    semester = data['semester']
    subjects = data['subjects']

    subject_marks_list = [float(v) for v in subjects.values()]
    total = sum(subject_marks_list)
    percentage = round((total / 500) * 100, 2)
    subject_pass = all(float(m) >= 35 for m in subjects.values())
    status = "PASS" if subject_pass else "FAIL"
    risk = predict_risk(attendance, study_hours, percentage)
    subject_names = list(subjects.keys())
    subject_marks = [float(v) for v in subjects.values()]
    weak_subjects = [s for s, m in subjects.items() if float(m) < 35]
    cgpa = calculate_cgpa(subject_marks)

    return jsonify({
        'name': name, 'roll': roll, 'college': college,
        'semester': semester, 'total': total,
        'percentage': percentage, 'status': status,
        'risk': risk, 'cgpa': cgpa,
        'subject_names': subject_names,
        'subject_marks': subject_marks,
        'weak_subjects': weak_subjects
    })

# ── BCOM ALL SEMS ROUTE ──
@app.route('/analyze_bcom_all', methods=['POST'])
def analyze_bcom_all():
    data = request.json
    name = data['name']
    roll = data['roll']
    college = data['college']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    semesters = data['semesters']

    sem_results = []
    all_marks = []
    total_points = 0
    completed_sems = 0

    for sem_num, subjects in semesters.items():
        if any(float(v) > 0 for v in subjects.values()):
            marks_list = [float(v) for v in subjects.values()]
            total = sum(marks_list)
            percentage = round((total / 500) * 100, 2)
            cgpa = calculate_cgpa(marks_list)
            subject_pass = all(float(m) >= 35 for m in subjects.values())
            status = "PASS" if subject_pass else "FAIL"
            weak = [s for s, m in subjects.items() if float(m) < 35]
            all_marks.extend(marks_list)
            total_points += cgpa
            completed_sems += 1

            sem_results.append({
                'semester': sem_num, 'total': total,
                'percentage': percentage, 'cgpa': cgpa,
                'status': status, 'weak_subjects': weak,
                'subject_names': list(subjects.keys()),
                'subject_marks': marks_list
            })

    sgpa = round(total_points / completed_sems, 2) if completed_sems > 0 else 0
    overall_percentage = round((sum(all_marks) / (completed_sems * 500)) * 100, 2)
    risk = predict_risk(attendance, study_hours, overall_percentage)

    return jsonify({
        'name': name, 'roll': roll, 'college': college,
        'sem_results': sem_results, 'sgpa': sgpa,
        'overall_percentage': overall_percentage,
        'completed_sems': completed_sems, 'risk': risk
    })

# ── MCA SINGLE SEM ROUTE ──
@app.route('/analyze_mca_single', methods=['POST'])
def analyze_mca_single():
    data = request.json
    name = data['name']
    roll = data['roll']
    college = data['college']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    semester = data['semester']
    subjects = data['subjects']

    subject_marks_list = [float(v) for v in subjects.values()]
    total = sum(subject_marks_list)
    percentage = round((total / 500) * 100, 2)
    subject_pass = all(float(m) >= 35 for m in subjects.values())
    status = "PASS" if subject_pass else "FAIL"
    risk = predict_risk(attendance, study_hours, percentage)
    subject_names = list(subjects.keys())
    subject_marks = [float(v) for v in subjects.values()]
    weak_subjects = [s for s, m in subjects.items() if float(m) < 35]
    cgpa = calculate_cgpa(subject_marks)

    return jsonify({
        'name': name, 'roll': roll, 'college': college,
        'semester': semester, 'total': total,
        'percentage': percentage, 'status': status,
        'risk': risk, 'cgpa': cgpa,
        'subject_names': subject_names,
        'subject_marks': subject_marks,
        'weak_subjects': weak_subjects
    })

# ── MCA ALL SEMS ROUTE ──
@app.route('/analyze_mca_all', methods=['POST'])
def analyze_mca_all():
    data = request.json
    name = data['name']
    roll = data['roll']
    college = data['college']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    semesters = data['semesters']

    sem_results = []
    all_marks = []
    total_points = 0
    completed_sems = 0

    for sem_num, subjects in semesters.items():
        if any(float(v) > 0 for v in subjects.values()):
            marks_list = [float(v) for v in subjects.values()]
            total = sum(marks_list)
            percentage = round((total / 500) * 100, 2)
            cgpa = calculate_cgpa(marks_list)
            subject_pass = all(float(m) >= 35 for m in subjects.values())
            status = "PASS" if subject_pass else "FAIL"
            weak = [s for s, m in subjects.items() if float(m) < 35]
            all_marks.extend(marks_list)
            total_points += cgpa
            completed_sems += 1

            sem_results.append({
                'semester': sem_num, 'total': total,
                'percentage': percentage, 'cgpa': cgpa,
                'status': status, 'weak_subjects': weak,
                'subject_names': list(subjects.keys()),
                'subject_marks': marks_list
            })

    sgpa = round(total_points / completed_sems, 2) if completed_sems > 0 else 0
    overall_percentage = round((sum(all_marks) / (completed_sems * 500)) * 100, 2)
    risk = predict_risk(attendance, study_hours, overall_percentage)

    return jsonify({
        'name': name, 'roll': roll, 'college': college,
        'sem_results': sem_results, 'sgpa': sgpa,
        'overall_percentage': overall_percentage,
        'completed_sems': completed_sems, 'risk': risk
    })

# ── MBA SINGLE SEM ROUTE ──
@app.route('/analyze_mba_single', methods=['POST'])
def analyze_mba_single():
    data = request.json
    name = data['name']
    roll = data['roll']
    college = data['college']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    semester = data['semester']
    subjects = data['subjects']

    subject_marks_list = [float(v) for v in subjects.values()]
    total = sum(subject_marks_list)
    percentage = round((total / 500) * 100, 2)
    subject_pass = all(float(m) >= 35 for m in subjects.values())
    status = "PASS" if subject_pass else "FAIL"
    risk = predict_risk(attendance, study_hours, percentage)
    subject_names = list(subjects.keys())
    subject_marks = [float(v) for v in subjects.values()]
    weak_subjects = [s for s, m in subjects.items() if float(m) < 35]
    cgpa = calculate_cgpa(subject_marks)

    return jsonify({
        'name': name, 'roll': roll, 'college': college,
        'semester': semester, 'total': total,
        'percentage': percentage, 'status': status,
        'risk': risk, 'cgpa': cgpa,
        'subject_names': subject_names,
        'subject_marks': subject_marks,
        'weak_subjects': weak_subjects
    })

# ── MBA ALL SEMS ROUTE ──
@app.route('/analyze_mba_all', methods=['POST'])
def analyze_mba_all():
    data = request.json
    name = data['name']
    roll = data['roll']
    college = data['college']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    semesters = data['semesters']

    sem_results = []
    all_marks = []
    total_points = 0
    completed_sems = 0

    for sem_num, subjects in semesters.items():
        if any(float(v) > 0 for v in subjects.values()):
            marks_list = [float(v) for v in subjects.values()]
            total = sum(marks_list)
            percentage = round((total / 500) * 100, 2)
            cgpa = calculate_cgpa(marks_list)
            subject_pass = all(float(m) >= 35 for m in subjects.values())
            status = "PASS" if subject_pass else "FAIL"
            weak = [s for s, m in subjects.items() if float(m) < 35]
            all_marks.extend(marks_list)
            total_points += cgpa
            completed_sems += 1

            sem_results.append({
                'semester': sem_num, 'total': total,
                'percentage': percentage, 'cgpa': cgpa,
                'status': status, 'weak_subjects': weak,
                'subject_names': list(subjects.keys()),
                'subject_marks': marks_list
            })

    sgpa = round(total_points / completed_sems, 2) if completed_sems > 0 else 0
    overall_percentage = round((sum(all_marks) / (completed_sems * 500)) * 100, 2)
    risk = predict_risk(attendance, study_hours, overall_percentage)

    return jsonify({
        'name': name, 'roll': roll, 'college': college,
        'sem_results': sem_results, 'sgpa': sgpa,
        'overall_percentage': overall_percentage,
        'completed_sems': completed_sems, 'risk': risk
    })

def calculate_cgpa(marks_list):
    points = [get_grade_points(m) for m in marks_list]
    return round(sum(points) / len(points), 2)

def get_grade_points(marks):
    if marks >= 90: return 10
    elif marks >= 80: return 9
    elif marks >= 70: return 8
    elif marks >= 60: return 7
    elif marks >= 50: return 6
    elif marks >= 40: return 5
    elif marks >= 35: return 4
    else: return 0

def get_grade(pct):
    if pct >= 90: return 'O'
    elif pct >= 80: return 'A+'
    elif pct >= 70: return 'A'
    elif pct >= 60: return 'B+'
    elif pct >= 50: return 'B'
    elif pct >= 40: return 'C'
    elif pct >= 35: return 'D'
    else: return 'F'

def predict_risk(attendance, study_hours, percentage):
    if attendance < 50 or percentage < 35:
        return "HIGH RISK"
    elif attendance < 75 or study_hours < 2 or percentage < 50:
        return "MEDIUM RISK"
    else:
        return "LOW RISK"
        
   # ── BSC SINGLE SEM ROUTE ──
@app.route('/analyze_bsc_single', methods=['POST'])
def analyze_bsc_single():
    data = request.json
    name = data['name']
    roll = data['roll']
    college = data['college']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    semester = data['semester']
    subjects = data['subjects']

    subject_marks_list = [float(v) for v in subjects.values()]
    total = sum(subject_marks_list)
    percentage = round((total / 500) * 100, 2)
    subject_pass = all(float(m) >= 35 for m in subjects.values())
    status = "PASS" if subject_pass else "FAIL"
    risk = predict_risk(attendance, study_hours, percentage)
    subject_names = list(subjects.keys())
    subject_marks = [float(v) for v in subjects.values()]
    weak_subjects = [s for s, m in subjects.items() if float(m) < 35]
    cgpa = calculate_cgpa(subject_marks)

    return jsonify({
        'name': name, 'roll': roll, 'college': college,
        'semester': semester, 'total': total,
        'percentage': percentage, 'status': status,
        'risk': risk, 'cgpa': cgpa,
        'subject_names': subject_names,
        'subject_marks': subject_marks,
        'weak_subjects': weak_subjects
    })

# ── BSC ALL SEMS ROUTE ──
@app.route('/analyze_bsc_all', methods=['POST'])
def analyze_bsc_all():
    data = request.json
    name = data['name']
    roll = data['roll']
    college = data['college']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    semesters = data['semesters']

    sem_results = []
    all_marks = []
    total_points = 0
    completed_sems = 0

    for sem_num, subjects in semesters.items():
        if any(float(v) > 0 for v in subjects.values()):
            marks_list = [float(v) for v in subjects.values()]
            total = sum(marks_list)
            percentage = round((total / 500) * 100, 2)
            cgpa = calculate_cgpa(marks_list)
            subject_pass = all(float(m) >= 35 for m in subjects.values())
            status = "PASS" if subject_pass else "FAIL"
            weak = [s for s, m in subjects.items() if float(m) < 35]
            all_marks.extend(marks_list)
            total_points += cgpa
            completed_sems += 1

            sem_results.append({
                'semester': sem_num, 'total': total,
                'percentage': percentage, 'cgpa': cgpa,
                'status': status, 'weak_subjects': weak,
                'subject_names': list(subjects.keys()),
                'subject_marks': marks_list
            })

    sgpa = round(total_points / completed_sems, 2) if completed_sems > 0 else 0
    overall_percentage = round((sum(all_marks) / (completed_sems * 500)) * 100, 2)
    risk = predict_risk(attendance, study_hours, overall_percentage)

    return jsonify({
        'name': name, 'roll': roll, 'college': college,
        'sem_results': sem_results, 'sgpa': sgpa,
        'overall_percentage': overall_percentage,
        'completed_sems': completed_sems, 'risk': risk
    })
         
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)