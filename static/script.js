let barChart = null;
let radarChart = null;

async function analyzeStudent() {

  const name = document.getElementById('name').value;
  const attendance = document.getElementById('attendance').value;
  const study_hours = document.getElementById('study_hours').value;
  const gender = document.getElementById('gender').value;

  // Check all fields are filled
  if (!name || !attendance || !study_hours) {
    alert('Please fill all fields!');
    return;
  }

  const payload = {
    name: name,
    attendance: attendance,
    study_hours: study_hours,
    gender: gender,
    subjects: {
      Mathematics: document.getElementById('math').value || 0,
      Science: document.getElementById('science').value || 0,
      English: document.getElementById('english').value || 0,
      Kannada: document.getElementById('kannada').value || 0,
      Social: document.getElementById('social').value || 0
    }
  };

  const response = await fetch('/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  // Show results section
  document.getElementById('results').style.display = 'block';

  // Fill result cards
  document.getElementById('res_name').textContent = data.name;
  document.getElementById('res_total').textContent = data.total + ' / 500';
  document.getElementById('res_pct').textContent = data.percentage + '%';
  document.getElementById('res_grade').textContent = data.grade;
  document.getElementById('res_status').textContent = data.status;
  document.getElementById('res_risk').textContent = data.risk;
  document.getElementById('res_weak').textContent =
    data.weak_subjects.length > 0 ? data.weak_subjects.join(', ') : 'None ✅';

  // Scroll to results
  document.getElementById('results').scrollIntoView({ behavior: 'smooth' });

  // Destroy old charts if exist
  if (barChart) barChart.destroy();
  if (radarChart) radarChart.destroy();

  // Bar Chart - Subject Marks
  barChart = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: data.subject_names,
      datasets: [{
        label: 'Marks out of 100',
        data: data.subject_marks,
        backgroundColor: [
          '#1a73e8',
          '#34a853',
          '#fbbc04',
          '#ea4335',
          '#9c27b0'
        ],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });

  // Radar Chart - Subject Performance
  radarChart = new Chart(document.getElementById('pieChart'), {
    type: 'radar',
    data: {
      labels: data.subject_names,
      datasets: [{
        label: 'Marks',
        data: data.subject_marks,
        backgroundColor: 'rgba(26, 115, 232, 0.2)',
        borderColor: '#1a73e8',
        pointBackgroundColor: '#1a73e8',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}
function savePDF() {
  const results = document.getElementById('results');
  const name = document.getElementById('res_name').textContent;
  
  // Open print dialog
  const printContents = `
    <html>
    <head>
      <title>Student Report - ${name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; }
        h1 { color: #1a73e8; text-align: center; }
        h2 { color: #333; border-bottom: 2px solid #1a73e8; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td, th { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #1a73e8; color: white; }
        tr:nth-child(even) { background: #f5f5f5; }
        .pass { color: green; font-weight: bold; font-size: 1.2rem; }
        .fail { color: red; font-weight: bold; font-size: 1.2rem; }
        .header { background: #000; color: white; padding: 20px; text-align: center; margin-bottom: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Student Performance Report</h1>
      </div>

      <h2>Student Details</h2>
      <table>
        <tr><th>Field</th><th>Details</th></tr>
        <tr><td>Student Name</td><td>${document.getElementById('res_name').textContent}</td></tr>
        <tr><td>Total Marks</td><td>${document.getElementById('res_total').textContent}</td></tr>
        <tr><td>Percentage</td><td>${document.getElementById('res_pct').textContent}</td></tr>
        <tr><td>Grade</td><td>${document.getElementById('res_grade').textContent}</td></tr>
        <tr><td>Status</td><td class="${document.getElementById('res_status').textContent.includes('PASS') ? 'pass' : 'fail'}">${document.getElementById('res_status').textContent}</td></tr>
        <tr><td>Risk Level</td><td>${document.getElementById('res_risk').textContent}</td></tr>
        <tr><td>Weak Subjects</td><td>${document.getElementById('res_weak').textContent}</td></tr>
      </table>

      <h2>Subject Marks</h2>
      <table>
        <tr><th>Subject</th><th>Marks (out of 100)</th><th>Status</th></tr>
        ${getSubjectRows()}
      </table>

    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContents);
  printWindow.document.close();
  printWindow.print();
}

function getSubjectRows() {
  const subjects = {
    'Mathematics': document.getElementById('math').value,
    'Science': document.getElementById('science').value,
    'English': document.getElementById('english').value,
    'Kannada': document.getElementById('kannada').value,
    'Social Science': document.getElementById('social').value
  };

  let rows = '';
  for (const [subject, marks] of Object.entries(subjects)) {
    const status = marks >= 35 ? '✅ Pass' : '❌ Fail';
    const color = marks >= 35 ? 'green' : 'red';
    rows += `<tr>
      <td>${subject}</td>
      <td>${marks}</td>
      <td style="color:${color}; font-weight:bold">${status}</td>
    </tr>`;
  }
  return rows;
}