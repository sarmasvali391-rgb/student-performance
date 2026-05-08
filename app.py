from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json

    name = data['name']
    attendance = float(data['attendance'])
    study_hours = float(data['study_hours'])
    gender = data['gender']
    subjects = data['subjects']

    # Calculate total and percentage out of 500
    subject_marks_list = [float(v) for v in subjects.values()]
    total = sum(subject_marks_list)
    percentage = round((total / 500) * 100, 2)

    # Grade
    grade = get_grade(percentage)

    # Pass/Fail — every subject must be 35 or above
    subject_pass = all(float(m) >= 35 for m in subjects.values())
    if subject_pass:
        status = "PASS ✅"
    else:
        status = "FAIL ❌"

    # Risk prediction
    risk = predict_risk(attendance, study_hours, percentage)

    # Weak subjects below 35
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

def get_grade(pct):
    if pct >= 90: return 'A+'
    elif pct >= 80: return 'A'
    elif pct >= 70: return 'B'
    elif pct >= 60: return 'C'
    elif pct >= 50: return 'D'
    elif pct >= 35: return 'E'
    else: return 'F'

def predict_risk(attendance, study_hours, percentage):
    if attendance < 50 or percentage < 35:
        return "HIGH RISK 🔴"
    elif attendance < 75 or study_hours < 2 or percentage < 50:
        return "MEDIUM RISK 🟡"
    else:
        return "LOW RISK 🟢"

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)