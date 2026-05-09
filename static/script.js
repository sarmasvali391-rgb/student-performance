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