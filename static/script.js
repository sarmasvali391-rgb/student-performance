function showCategory(category, btn) {

  // Hide sub menus first
  document.getElementById("degree-sub").style.display = "none";
  document.getElementById("pg-sub").style.display = "none";

  // Remove active class
  document.querySelectorAll(".course-btn").forEach(button => {
    button.classList.remove("active");
  });

  btn.classList.add("active");

  // Show PUC directly
  if(category === "school"){
    document.getElementById("puc-section").style.display = "block";
  }

  // Show Degree submenu
  if(category === "degree"){
    document.getElementById("degree-sub").style.display = "flex";
  }

  // Show PG submenu
  if(category === "pg"){
    document.getElementById("pg-sub").style.display = "flex";
  }
}

function showCourse(course, btn) {

  const sections = [
    "puc-section",
    "bca-section",
    "bba-section",
    "bcom-section",
    "bsc-section",
    "mca-section",
    "mba-section"
  ];

  // Hide all sections
  sections.forEach(id => {
    const sec = document.getElementById(id);
    if(sec){
      sec.style.display = "none";
    }
  });

  // Remove active buttons
  document.querySelectorAll(".sub-btn").forEach(button => {
    button.classList.remove("active");
  });

  btn.classList.add("active");

  // Show selected section
  const selected = document.getElementById(course + "-section");

  if(selected){
    selected.style.display = "block";
  }
}