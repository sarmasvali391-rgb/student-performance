from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

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
        'name': name,
        'total': total,
        'percentage': percentage,
        'grade': grade,
        'status': status,
        'risk': risk,
        'attendance': attendance,
        'study_hours': study_hours,
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
        'name': name,
        'roll': roll,
        'college': college,
        'semester': semester,
        'total': total,
        'percentage': percentage,
        'status': status,
        'risk': risk,
        'cgpa': cgpa,
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
                'semester': sem_num,
                'total': total,
                'percentage': percentage,
                'cgpa': cgpa,
                'status': status,
                'weak_subjects': weak,
                'subject_names': list(subjects.keys()),
                'subject_marks': marks_list
            })

    # SGPA = overall percentage from sem1 to last sem
    sgpa = round(total_points / completed_sems, 2) if completed_sems > 0 else 0
    overall_percentage = round((sum(all_marks) / (completed_sems * 500)) * 100, 2)
    risk = predict_risk(attendance, study_hours, overall_percentage)

    return jsonify({
        'name': name,
        'roll': roll,
        'college': college,
        'sem_results': sem_results,
        'sgpa': sgpa,
        'overall_percentage': overall_percentage,
        'completed_sems': completed_sems,
        'risk': risk
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
    subject_grades = {s: get_grade(float(m)) for s, m in subjects.items()}
    subject_points = {s: get_grade_points(float(m)) for s, m in subjects.items()}

    return jsonify({
        'name': name,
        'roll': roll,
        'college': college,
        'semester': semester,
        'total': total,
        'percentage': percentage,
        'status': status,
        'risk': risk,
        'cgpa': cgpa,
        'subject_names': subject_names,
        'subject_marks': subject_marks,
        'subject_grades': subject_grades,
        'subject_points': subject_points,
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
                'semester': sem_num,
                'total': total,
                'percentage': percentage,
                'cgpa': cgpa,
                'status': status,
                'weak_subjects': weak,
                'subject_names': list(subjects.keys()),
                'subject_marks': marks_list
            })

    sgpa = round(total_points / completed_sems, 2) if completed_sems > 0 else 0
    overall_percentage = round((sum(all_marks) / (completed_sems * 500)) * 100, 2)
    risk = predict_risk(attendance, study_hours, overall_percentage)

    return jsonify({
        'name': name,
        'roll': roll,
        'college': college,
        'sem_results': sem_results,
        'sgpa': sgpa,
        'overall_percentage': overall_percentage,
        'completed_sems': completed_sems,
        'risk': risk
    })
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)