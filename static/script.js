// ── CHARTS ──
let pucBarChart = null, pucRadarChart = null;
let bcaBarChart = null, bcaRadarChart = null;
let bcaAllBarChart = null, bcaAllRadarChart = null;

// ── BCA SUBJECTS ──
const bcaSubjects = {
  'Semester 1': ['Computer Fundamentals', 'Mathematics', 'English', 'Programming in C', 'Digital Electronics'],
  'Semester 2': ['Data Structures', 'DBMS', 'Operating Systems', 'Mathematics 2', 'Communication Skills'],
  'Semester 3': ['Java Programming', 'Computer Networks', 'Software Engineering', 'Statistics', 'Web Technology'],
  'Semester 4': ['Python Programming', 'Advanced Java', 'Computer Graphics', 'Microprocessor', 'Elective 1'],
  'Semester 5': ['Artificial Intelligence', 'Mobile Computing', 'Cloud Computing', 'Data Mining', 'Elective 2'],
  'Semester 6': ['Machine Learning', 'Cyber Security', 'Project Work', 'Elective 3', 'Internship']
};

// ── COURSE SELECTION ──
function showCourse(course) {
  document.getElementById('puc-section').style.display = course === 'puc' ? 'block' : 'none';
  document.getElementById('bca-section').style.display = course === 'bca' ? 'block' : 'none';
  document.querySelectorAll('.course-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  if (course === 'bca') {
    loadBCASingleSubjects();
    loadBCAAllSubjects();
  }
}

// ── BCA MODE SELECTION ──
function showBCAMode(mode) {
  document.getElementById('bca_single_mode').style.display = mode === 'single' ? 'block' : 'none';
  document.getElementById('bca_all_mode').style.display = mode === 'all' ? 'block' : 'none';
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

// ── LOAD BCA SINGLE SUBJECTS ──
function loadBCASingleSubjects() {
  const sem = document.getElementById('bca_semester').value;
  const subjects = bcaSubjects[sem];
  let html = '';
  subjects.forEach(sub => {
    const id = sub.replace(/\s+/g, '_').toLowerCase();
    html += `
      <div class="form-group">
        <label>${sub}</label>
        <input type="number" id="bca_single_${id}" placeholder="e.g. 75">
      </div>`;
  });
  document.getElementById('bca_single_subjects').innerHTML = html;
}

// ── LOAD BCA ALL SUBJECTS ──
function loadBCAAllSubjects() {
  let html = '';
  Object.entries(bcaSubjects).forEach(([sem, subjects]) => {
    html += `<h3>📖 ${sem}</h3>`;
    subjects.forEach(sub => {
      const id = sub.replace(/\s+/g, '_').toLowerCase();
      html += `
        <div class="form-group">
          <label>${sub}</label>
          <input type="number" id="bca_all_${sem.replace(/\s+/g, '_')}_${id}" placeholder="e.g. 75">
        </div>`;
    });
  });
  document.getElementById('bca_all_subjects').innerHTML = html;
}

// ── UPDATE SUBJECTS WHEN SEM CHANGES ──
document.addEventListener('DOMContentLoaded', function() {
  const semSelect = document.getElementById('bca_semester');
  if (semSelect) {
    semSelect.addEventListener('change', loadBCASingleSubjects);
  }
});

// ── ANALYZE PUC ──
async function analyzePUC() {
  const name = document.getElementById('puc_name').value;
  const attendance = document.getElementById('puc_attendance').value;
  const study_hours = document.getElementById('puc_study_hours').value;

  if (!name || !attendance || !study_hours) {
    alert('Please fill all fields!');
    return;
  }

  const payload = {
    name: name,
    attendance: attendance,
    study_hours: study_hours,
    gender: document.getElementById('puc_gender').value,
    subjects: {
      Mathematics: document.getElementById('puc_math').value || 0,
      Science: document.getElementById('puc_science').value || 0,
      English: document.getElementById('puc_english').value || 0,
      Kannada: document.getElementById('puc_kannada').value || 0,
      Social: document.getElementById('puc_social').value || 0
    }
  };

  try {
    const response = await fetch('/analyze_puc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    document.getElementById('puc_results').style.display = 'block';
    document.getElementById('puc_res_name').textContent = data.name;
    document.getElementById('puc_res_total').textContent = data.total + ' / 500';
    document.getElementById('puc_res_pct').textContent = data.percentage + '%';
    document.getElementById('puc_res_grade').textContent = data.grade;
    document.getElementById('puc_res_status').textContent = data.status.includes('PASS') ? '✅ PASS' : '❌ FAIL';
    document.getElementById('puc_res_risk').textContent = getRiskEmoji(data.risk);
    document.getElementById('puc_res_weak').textContent = data.weak_subjects.length > 0 ? data.weak_subjects.join(', ') : 'None ✅';

    document.getElementById('puc_results').scrollIntoView({ behavior: 'smooth' });

    if (pucBarChart) pucBarChart.destroy();
    if (pucRadarChart) pucRadarChart.destroy();

    pucBarChart = new Chart(document.getElementById('puc_barChart'), {
      type: 'bar',
      data: {
        labels: data.subject_names,
        datasets: [{
          label: 'Marks out of 100',
          data: data.subject_marks,
          backgroundColor: ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#9c27b0'],
          borderRadius: 6
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    pucRadarChart = new Chart(document.getElementById('puc_radarChart'), {
      type: 'radar',
      data: {
        labels: data.subject_names,
        datasets: [{
          label: 'Marks',
          data: data.subject_marks,
          backgroundColor: 'rgba(26,115,232,0.2)',
          borderColor: '#1a73e8',
          pointBackgroundColor: '#1a73e8',
          borderWidth: 2
        }]
      },
      options: { responsive: true, scales: { r: { beginAtZero: true, max: 100 } } }
    });

  } catch (error) {
    alert('Error! Make sure python app.py is running!');
  }
}

// ── ANALYZE BCA SINGLE ──
async function analyzeBCASingle() {
  const name = document.getElementById('bca_name').value;
  const roll = document.getElementById('bca_roll').value;
  const college = document.getElementById('bca_college').value;
  const attendance = document.getElementById('bca_attendance').value;
  const study_hours = document.getElementById('bca_study_hours').value;
  const semester = document.getElementById('bca_semester').value;

  if (!name || !attendance || !study_hours) {
    alert('Please fill all fields!');
    return;
  }

  const subjects = {};
  bcaSubjects[semester].forEach(sub => {
    const id = sub.replace(/\s+/g, '_').toLowerCase();
    subjects[sub] = document.getElementById('bca_single_' + id)?.value || 0;
  });

  const payload = {
    name, roll, college, attendance, study_hours,
    gender: document.getElementById('bca_gender').value,
    semester, subjects
  };

  try {
    const response = await fetch('/analyze_bca_single', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    document.getElementById('bca_single_results').style.display = 'block';
    document.getElementById('bca_res_name').textContent = data.name;
    document.getElementById('bca_res_total').textContent = data.total + ' / 500';
    document.getElementById('bca_res_pct').textContent = data.percentage + '%';
    document.getElementById('bca_res_cgpa').textContent = data.cgpa;
    document.getElementById('bca_res_status').textContent = data.status.includes('PASS') ? '✅ PASS' : '❌ FAIL';
    document.getElementById('bca_res_risk').textContent = getRiskEmoji(data.risk);
    document.getElementById('bca_res_weak').textContent = data.weak_subjects.length > 0 ? data.weak_subjects.join(', ') : 'None ✅';

    document.getElementById('bca_single_results').scrollIntoView({ behavior: 'smooth' });

    if (bcaBarChart) bcaBarChart.destroy();
    if (bcaRadarChart) bcaRadarChart.destroy();

    bcaBarChart = new Chart(document.getElementById('bca_barChart'), {
      type: 'bar',
      data: {
        labels: data.subject_names,
        datasets: [{
          label: 'Marks out of 100',
          data: data.subject_marks,
          backgroundColor: ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#9c27b0'],
          borderRadius: 6
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    bcaRadarChart = new Chart(document.getElementById('bca_radarChart'), {
      type: 'radar',
      data: {
        labels: data.subject_names,
        datasets: [{
          label: 'Marks',
          data: data.subject_marks,
          backgroundColor: 'rgba(26,115,232,0.2)',
          borderColor: '#1a73e8',
          pointBackgroundColor: '#1a73e8',
          borderWidth: 2
        }]
      },
      options: { responsive: true, scales: { r: { beginAtZero: true, max: 100 } } }
    });

  } catch (error) {
    alert('Error! Make sure python app.py is running!');
  }
}

// ── ANALYZE BCA ALL ──
async function analyzeBCAAll() {
  const name = document.getElementById('bca_name').value;
  const roll = document.getElementById('bca_roll').value;
  const college = document.getElementById('bca_college').value;
  const attendance = document.getElementById('bca_attendance').value;
  const study_hours = document.getElementById('bca_study_hours').value;

  if (!name || !attendance || !study_hours) {
    alert('Please fill all fields!');
    return;
  }

  const semesters = {};
  Object.entries(bcaSubjects).forEach(([sem, subjects]) => {
    semesters[sem] = {};
    subjects.forEach(sub => {
      const id = sub.replace(/\s+/g, '_').toLowerCase();
      semesters[sem][sub] = document.getElementById('bca_all_' + sem.replace(/\s+/g, '_') + '_' + id)?.value || 0;
    });
  });

  const payload = {
    name, roll, college, attendance, study_hours,
    gender: document.getElementById('bca_gender').value,
    semesters
  };

  try {
    const response = await fetch('/analyze_bca_all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    document.getElementById('bca_all_results').style.display = 'block';
    document.getElementById('bca_all_res_name').textContent = data.name;
    document.getElementById('bca_all_sgpa').textContent = data.sgpa;
    document.getElementById('bca_all_pct').textContent = data.overall_percentage + '%';
    document.getElementById('bca_all_sems').textContent = data.completed_sems + ' / 6';
    document.getElementById('bca_all_risk').textContent = getRiskEmoji(data.risk);

    // Semester cards
    let semHtml = '<div class="sem-cards">';
    data.sem_results.forEach(sem => {
      semHtml += `
        <div class="sem-card">
          <h3>${sem.semester}</h3>
          <p>Total: ${sem.total} / 500</p>
          <p>Percentage: ${sem.percentage}%</p>
          <p>CGPA: ${sem.cgpa}</p>
          <p>Status: ${sem.status.includes('PASS') ? '✅ PASS' : '❌ FAIL'}</p>
          ${sem.weak_subjects.length > 0 ? '<p>Weak: ' + sem.weak_subjects.join(', ') + '</p>' : '<p>No weak subjects ✅</p>'}
        </div>`;
    });
    semHtml += '</div>';
    document.getElementById('bca_sem_cards').innerHTML = semHtml;

    document.getElementById('bca_all_results').scrollIntoView({ behavior: 'smooth' });

    if (bcaAllBarChart) bcaAllBarChart.destroy();
    if (bcaAllRadarChart) bcaAllRadarChart.destroy();

    // CGPA per sem bar chart
    bcaAllBarChart = new Chart(document.getElementById('bca_all_barChart'), {
      type: 'bar',
      data: {
        labels: data.sem_results.map(s => s.semester),
        datasets: [{
          label: 'CGPA',
          data: data.sem_results.map(s => s.cgpa),
          backgroundColor: ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#9c27b0', '#00acc1'],
          borderRadius: 6
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true, max: 10 } } }
    });

    // Overall percentage radar
    bcaAllRadarChart = new Chart(document.getElementById('bca_all_radarChart'), {
      type: 'radar',
      data: {
        labels: data.sem_results.map(s => s.semester),
        datasets: [{
          label: 'Percentage',
          data: data.sem_results.map(s => s.percentage),
          backgroundColor: 'rgba(26,115,232,0.2)',
          borderColor: '#1a73e8',
          pointBackgroundColor: '#1a73e8',
          borderWidth: 2
        }]
      },
      options: { responsive: true, scales: { r: { beginAtZero: true, max: 100 } } }
    });

  } catch (error) {
    alert('Error! Make sure python app.py is running!');
  }
}

// ── RISK EMOJI ──
function getRiskEmoji(risk) {
  if (risk.includes('HIGH')) return '🔴 HIGH RISK';
  if (risk.includes('MEDIUM')) return '🟡 MEDIUM RISK';
  return '🟢 LOW RISK';
}

// ── PUC PDF ──
function savePUCPDF() {
  const name = document.getElementById('puc_res_name').textContent;
  const status = document.getElementById('puc_res_status').textContent;
  const risk = document.getElementById('puc_res_risk').textContent;

  const printContents = `
    <html>
    <head>
      <title>PUC Report - ${name}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
        .header { background: #000; color: white; padding: 20px; text-align: center; margin-bottom: 30px; border-radius: 10px; }
        h1 { margin: 0; font-size: 1.5rem; }
        h2 { color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 8px; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td, th { border: 1px solid #ddd; padding: 12px 16px; text-align: left; }
        th { background: #1a73e8; color: white; }
        tr:nth-child(even) { background: #f5f5f5; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        .footer { text-align: center; color: #999; font-size: 0.8rem; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header"><h1>📊 PUC Performance Report</h1></div>
      <h2>Student Details</h2>
      <table>
        <tr><th>Field</th><th>Details</th></tr>
        <tr><td>Student Name</td><td>${name}</td></tr>
        <tr><td>Total Marks</td><td>${document.getElementById('puc_res_total').textContent}</td></tr>
        <tr><td>Percentage</td><td>${document.getElementById('puc_res_pct').textContent}</td></tr>
        <tr><td>Grade</td><td>${document.getElementById('puc_res_grade').textContent}</td></tr>
        <tr><td>Status</td><td class="${status.includes('PASS') ? 'pass' : 'fail'}">${status}</td></tr>
        <tr><td>Risk Level</td><td>${risk}</td></tr>
        <tr><td>Weak Subjects</td><td>${document.getElementById('puc_res_weak').textContent}</td></tr>
      </table>
      <h2>Subject Marks</h2>
      <table>
        <tr><th>Subject</th><th>Marks (out of 100)</th><th>Status</th></tr>
        <tr><td>Mathematics</td><td>${document.getElementById('puc_math').value}</td><td class="${document.getElementById('puc_math').value >= 35 ? 'pass' : 'fail'}">${document.getElementById('puc_math').value >= 35 ? '✅ PASS' : '❌ FAIL'}</td></tr>
        <tr><td>Science</td><td>${document.getElementById('puc_science').value}</td><td class="${document.getElementById('puc_science').value >= 35 ? 'pass' : 'fail'}">${document.getElementById('puc_science').value >= 35 ? '✅ PASS' : '❌ FAIL'}</td></tr>
        <tr><td>English</td><td>${document.getElementById('puc_english').value}</td><td class="${document.getElementById('puc_english').value >= 35 ? 'pass' : 'fail'}">${document.getElementById('puc_english').value >= 35 ? '✅ PASS' : '❌ FAIL'}</td></tr>
        <tr><td>Kannada</td><td>${document.getElementById('puc_kannada').value}</td><td class="${document.getElementById('puc_kannada').value >= 35 ? 'pass' : 'fail'}">${document.getElementById('puc_kannada').value >= 35 ? '✅ PASS' : '❌ FAIL'}</td></tr>
        <tr><td>Social Science</td><td>${document.getElementById('puc_social').value}</td><td class="${document.getElementById('puc_social').value >= 35 ? 'pass' : 'fail'}">${document.getElementById('puc_social').value >= 35 ? '✅ PASS' : '❌ FAIL'}</td></tr>
      </table>
      <div class="footer"><p>Generated by Student Performance Analysis System | ${new Date().toLocaleDateString()}</p></div>
    </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(printContents);
  w.document.close();
  setTimeout(() => { w.print(); }, 500);
}

// ── BCA SINGLE PDF ──
function saveBCASinglePDF() {
  const name = document.getElementById('bca_res_name').textContent;
  const status = document.getElementById('bca_res_status').textContent;
  const risk = document.getElementById('bca_res_risk').textContent;
  const semester = document.getElementById('bca_semester').value;
  const subjects = bcaSubjects[semester];

  let subjectRows = '';
  subjects.forEach(sub => {
    const id = sub.replace(/\s+/g, '_').toLowerCase();
    const marks = document.getElementById('bca_single_' + id)?.value || 0;
    subjectRows += `<tr>
      <td>${sub}</td>
      <td>${marks}</td>
      <td class="${marks >= 35 ? 'pass' : 'fail'}">${marks >= 35 ? '✅ PASS' : '❌ FAIL'}</td>
    </tr>`;
  });

  const printContents = `
    <html>
    <head>
      <title>BCA Report - ${name}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
        .header { background: #000; color: white; padding: 20px; text-align: center; margin-bottom: 30px; border-radius: 10px; }
        h1 { margin: 0; font-size: 1.5rem; }
        h2 { color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 8px; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td, th { border: 1px solid #ddd; padding: 12px 16px; text-align: left; }
        th { background: #1a73e8; color: white; }
        tr:nth-child(even) { background: #f5f5f5; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        .footer { text-align: center; color: #999; font-size: 0.8rem; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header"><h1>🎓 BCA Performance Report - ${semester}</h1></div>
      <h2>Student Details</h2>
      <table>
        <tr><th>Field</th><th>Details</th></tr>
        <tr><td>Student Name</td><td>${name}</td></tr>
        <tr><td>Roll Number</td><td>${document.getElementById('bca_roll').value}</td></tr>
        <tr><td>College</td><td>${document.getElementById('bca_college').value}</td></tr>
        <tr><td>Semester</td><td>${semester}</td></tr>
        <tr><td>Total Marks</td><td>${document.getElementById('bca_res_total').textContent}</td></tr>
        <tr><td>Percentage</td><td>${document.getElementById('bca_res_pct').textContent}</td></tr>
        <tr><td>CGPA</td><td>${document.getElementById('bca_res_cgpa').textContent}</td></tr>
        <tr><td>Status</td><td class="${status.includes('PASS') ? 'pass' : 'fail'}">${status}</td></tr>
        <tr><td>Risk Level</td><td>${risk}</td></tr>
        <tr><td>Weak Subjects</td><td>${document.getElementById('bca_res_weak').textContent}</td></tr>
      </table>
      <h2>Subject Marks</h2>
      <table>
        <tr><th>Subject</th><th>Marks (out of 100)</th><th>Status</th></tr>
        ${subjectRows}
      </table>
      <div class="footer"><p>Generated by Student Performance Analysis System | ${new Date().toLocaleDateString()}</p></div>
    </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(printContents);
  w.document.close();
  setTimeout(() => { w.print(); }, 500);
}

// ── BCA ALL PDF ──
function saveBCAAllPDF() {
  const name = document.getElementById('bca_all_res_name').textContent;

  const printContents = `
    <html>
    <head>
      <title>BCA Report - ${name}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
        .header { background: #000; color: white; padding: 20px; text-align: center; margin-bottom: 30px; border-radius: 10px; }
        h1 { margin: 0; font-size: 1.5rem; }
        h2 { color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 8px; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td, th { border: 1px solid #ddd; padding: 12px 16px; text-align: left; }
        th { background: #1a73e8; color: white; }
        tr:nth-child(even) { background: #f5f5f5; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        .footer { text-align: center; color: #999; font-size: 0.8rem; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header"><h1>🎓 BCA Performance Report - ${semester}</h1></div>
      <h2>Student Details</h2>
      <table>
        <tr><th>Field</th><th>Details</th></tr>
        <tr><td>Student Name</td><td>${name}</td></tr>
        <tr><td>Roll Number</td><td>${document.getElementById('bca_roll').value}</td></tr>
        <tr><td>College</td><td>${document.getElementById('bca_college').value}</td></tr>
        <tr><td>Semester</td><td>${semester}</td></tr>
        <tr><td>Total Marks</td><td>${document.getElementById('bca_res_total').textContent}</td></tr>
        <tr><td>Percentage</td><td>${document.getElementById('bca_res_pct').textContent}</td></tr>
        <tr><td>CGPA</td><td>${document.getElementById('bca_res_cgpa').textContent}</td></tr>
        <tr><td>Status</td><td class="${status.includes('PASS') ? 'pass' : 'fail'}">${status}</td></tr>
        <tr><td>Risk Level</td><td>${risk}</td></tr>
        <tr><td>Weak Subjects</td><td>${document.getElementById('bca_res_weak').textContent}</td></tr>
      </table>
      <h2>Subject Marks</h2>
      <table>
        <tr><th>Subject</th><th>Marks (out of 100)</th><th>Status</th></tr>
        ${subjectRows}
      </table>
      <div class="footer"><p>Generated by Student Performance Analysis System | ${new Date().toLocaleDateString()}</p></div>
    </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(printContents);
  w.document.close();
  setTimeout(() => { w.print(); }, 500);
}

// ── BCA ALL PDF ──
function saveBCAAllPDF() {
  const name = document.getElementById('bca_all_res_name').textContent;

  const printContents = `
    <html>
    <head>
      <title>BCA All Sems Report - ${name}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
        .header { background: #000; color: white; padding: 20px; text-align: center; margin-bottom: 30px; border-radius: 10px; }
        h1 { margin: 0; font-size: 1.5rem; }
        h2 { color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 8px; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td, th { border: 1px solid #ddd; padding: 12px 16px; text-align: left; }
        th { background: #1a73e8; color: white; }
        tr:nth-child(even) { background: #f5f5f5; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        .footer { text-align: center; color: #999; font-size: 0.8rem; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header"><h1>🎓 BCA All Semesters Report</h1></div>
      <h2>Student Details</h2>
      <table>
        <tr><th>Field</th><th>Details</th></tr>
        <tr><td>Student Name</td><td>${name}</td></tr>
        <tr><td>Roll Number</td><td>${document.getElementById('bca_roll').value}</td></tr>
        <tr><td>College</td><td>${document.getElementById('bca_college').value}</td></tr>
        <tr><td>SGPA</td><td>${document.getElementById('bca_all_sgpa').textContent}</td></tr>
        <tr><td>Overall Percentage</td><td>${document.getElementById('bca_all_pct').textContent}</td></tr>
        <tr><td>Completed Semesters</td><td>${document.getElementById('bca_all_sems').textContent}</td></tr>
        <tr><td>Risk Level</td><td>${document.getElementById('bca_all_risk').textContent}</td></tr>
      </table>
      <h2>Semester wise Results</h2>
      <table>
        <tr><th>Semester</th><th>Total</th><th>Percentage</th><th>CGPA</th><th>Status</th></tr>
        ${getSemRows()}
      </table>
      <div class="footer"><p>Generated by Student Performance Analysis System | ${new Date().toLocaleDateString()}</p></div>
    </body></html>`;

  const w = window.open('', '_blank');
  w.document.write(printContents);
  w.document.close();
  setTimeout(() => { w.print(); }, 500);
}

function getSemRows() {
  const cards = document.querySelectorAll('.sem-card');
  let rows = '';
  cards.forEach(card => {
    const lines = card.querySelectorAll('p');
    const h3 = card.querySelector('h3').textContent;
    const total = lines[0].textContent.replace('Total: ', '');
    const pct = lines[1].textContent.replace('Percentage: ', '');
    const cgpa = lines[2].textContent.replace('CGPA: ', '');
    const status = lines[3].textContent.replace('Status: ', '');
    rows += `<tr>
      <td>${h3}</td>
      <td>${total}</td>
      <td>${pct}</td>
      <td>${cgpa}</td>
      <td class="${status.includes('PASS') ? 'pass' : 'fail'}">${status}</td>
    </tr>`;
  });
  return rows;
}