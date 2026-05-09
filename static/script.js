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
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const name = document.getElementById('res_name').textContent;
  const total = document.getElementById('res_total').textContent;
  const percentage = document.getElementById('res_pct').textContent;
  const grade = document.getElementById('res_grade').textContent;
  const status = document.getElementById('res_status').textContent;
  const risk = document.getElementById('res_risk').textContent;
  const weak = document.getElementById('res_weak').textContent;

  // Header
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Performance Report', 105, 18, { align: 'center' });

  // Student Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Student Details', 14, 45);

  doc.setDrawColor(26, 115, 232);
  doc.setLineWidth(0.5);
  doc.line(14, 47, 196, 47);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const details = [
    ['Student Name', name],
    ['Total Marks', total],
    ['Percentage', percentage],
    ['Grade', grade],
    ['Status', status],
    ['Risk Level', risk],
    ['Weak Subjects', weak]
  ];

  let y = 55;
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label + ':', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(value, 80, y);
    y += 10;
  });

  // Subject Marks Table
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Subject Marks', 14, y);
  y += 5;
  doc.setDrawColor(26, 115, 232);
  doc.line(14, y, 196, y);
  y += 8;

  // Table header
  doc.setFillColor(26, 115, 232);
  doc.rect(14, y - 5, 182, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('Subject', 20, y);
  doc.text('Marks', 100, y);
  doc.text('Status', 150, y);
  y += 8;

  const subjects = {
    'Mathematics': document.getElementById('math').value,
    'Science': document.getElementById('science').value,
    'English': document.getElementById('english').value,
    'Kannada': document.getElementById('kannada').value,
    'Social Science': document.getElementById('social').value
  };

  let isEven = false;
  for (const [subject, marks] of Object.entries(subjects)) {
    if (isEven) {
      doc.setFillColor(240, 245, 255);
      doc.rect(14, y - 5, 182, 10, 'F');
    }
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(subject, 20, y);
    doc.text(marks.toString(), 100, y);

    if (parseInt(marks) >= 35) {
      doc.setTextColor(0, 150, 0);
      doc.text('PASS', 150, y);
    } else {
      doc.setTextColor(200, 0, 0);
      doc.text('FAIL', 150, y);
    }
    y += 10;
    isEven = !isEven;
  }

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text('Generated by Student Performance Analysis System', 105, 285, { align: 'center' });

  // Save directly!
  doc.save('Student_Report_' + name + '.pdf');
}