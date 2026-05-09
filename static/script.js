let barChart = null;
let radarChart = null;

async function analyzeStudent() {

  const name = document.getElementById('name').value;
  const attendance = document.getElementById('attendance').value;
  const study_hours = document.getElementById('study_hours').value;
  const gender = document.getElementById('gender').value;

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

  try {
    const response = await fetch('/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Show results
    document.getElementById('results').style.display = 'block';

    // Fill cards
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

    // Destroy old charts
    if (barChart) barChart.destroy();
    if (radarChart) radarChart.destroy();

    // Bar Chart
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

    // Radar Chart
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

  } catch (error) {
    alert('Error! Make sure python app.py is running!');
    console.error(error);
  }
}

function savePDF() {
  const name = document.getElementById('res_name').textContent;
  const status = document.getElementById('res_status').textContent;
  const risk = document.getElementById('res_risk').textContent;

  const printContents = `
    <html>
    <head>
      <title>Student Report - ${name}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
        .header { background: #000; color: white; padding: 20px; text-align: center; margin-bottom: 30px; border-radius: 10px; }
        .header h1 { margin: 0; font-size: 1.5rem; }
        h2 { color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 8px; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        td, th { border: 1px solid #ddd; padding: 12px 16px; text-align: left; }
        th { background: #1a73e8; color: white; font-size: 1rem; }
        tr:nth-child(even) { background: #f5f5f5; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        .footer { text-align: center; color: #999; font-size: 0.8rem; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; }
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
        <tr><td>Status</td><td class="${status.includes('PASS') ? 'pass' : 'fail'}">${status.includes('PASS') ? '✅ PASS' : '❌ FAIL'}</td></tr>
        <tr><td>Risk Level</td><td>${risk.includes('HIGH') ? '🔴 HIGH RISK' : risk.includes('MEDIUM') ? '🟡 MEDIUM RISK' : '🟢 LOW RISK'}</td></tr>
        <tr><td>Weak Subjects</td><td>${document.getElementById('res_weak').textContent}</td></tr>
      </table>
      <h2>Subject Marks</h2>
      <table>
        <tr><th>Subject</th><th>Marks (out of 100)</th><th>Status</th></tr>
        <tr><td>Mathematics</td><td>${document.getElementById('math').value}</td><td class="${document.getElementById('math').value >= 35 ? 'pass' : 'fail'}">${document.getElementById('math').value >= 35 ? '✅ PASS' : '❌ FAIL'}</td></tr>
        <tr><td>Science</td><td>${document.getElementById('science').value}</td><td class="${document.getElementById('science').value >= 35 ? 'pass' : 'fail'}">${document.getElementById('science').value >= 35 ? '✅ PASS' : '❌ FAIL'}</td></tr>
        <tr><td>English</td><td>${document.getElementById('english').value}</td><td class="${document.getElementById('english').value >= 35 ? 'pass' : 'fail'}">${document.getElementById('english').value >= 35 ? '✅ PASS' : '❌ FAIL'}</td></tr>
        <tr><td>Kannada</td><td>${document.getElementById('kannada').value}</td><td class="${document.getElementById('kannada').value >= 35 ? 'pass' : 'fail'}">${document.getElementById('kannada').value >= 35 ? '✅ PASS' : '❌ FAIL'}</td></tr>
        <tr><td>Social Science</td><td>${document.getElementById('social').value}</td><td class="${document.getElementById('social').value >= 35 ? 'pass' : 'fail'}">${document.getElementById('social').value >= 35 ? '✅ PASS' : '❌ FAIL'}</td></tr>
      </table>
      <div class="footer">
        <p>Generated by Student Performance Analysis System | ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContents);
  printWindow.document.close();
  setTimeout(() => { printWindow.print(); }, 500);
}