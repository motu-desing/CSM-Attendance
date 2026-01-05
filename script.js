document.addEventListener("DOMContentLoaded", () => {
  // Simple login (frontend only)
  const LOGIN_USER = "venky";
  const LOGIN_PASS = "venky@123";

  const loginSection = document.getElementById("loginSection");
  const dashboardSection = document.getElementById("dashboardSection");
  const loginUserInput = document.getElementById("loginUser");
  const loginPassInput = document.getElementById("loginPass");
  const loginError = document.getElementById("loginError");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const todayBadge = document.getElementById("todayBadge");
  const userBadge = document.getElementById("userBadge");
  const studentTableBody = document.getElementById("studentTableBody");
  const summaryText = document.getElementById("summaryText");
  const resetTodayBtn = document.getElementById("resetTodayBtn");

  // Demo student list (edit this as you need)
  const students = [
    "G.vignesh",
    "G.Sri Varshan",
    "P.sushant",
    "R.surendra",
    "S.venkat",
    "SK.Salman",
    "D.Govardhan Chakravarthi"
  ];

  function getTodayKey() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function formatTodayDisplay() {
    const d = new Date();
    return d.toDateString();
  }

  function loadAttendanceData() {
    const raw = localStorage.getItem("attendanceData");
    if (!raw) return {};
    try {
      return JSON.parse(raw) || {};
    } catch {
      return {};
    }
  }

  function saveAttendanceData(data) {
    localStorage.setItem("attendanceData", JSON.stringify(data));
  }

  function getStatsForStudent(attendanceData, studentName) {
    let totalDays = 0;
    let presentDays = 0;

    Object.keys(attendanceData).forEach((dateKey) => {
      const dayRecord = attendanceData[dateKey];
      if (dayRecord[studentName]) {
        totalDays++;
        if (dayRecord[studentName] === "present") {
          presentDays++;
        }
      }
    });

    const percentage = totalDays === 0 ? 0 : (presentDays / totalDays) * 100;
    return { totalDays, presentDays, percentage };
  }

  function markToday(studentName, status) {
    const today = getTodayKey();
    const data = loadAttendanceData();
    if (!data[today]) {
      data[today] = {};
    }
    // One record per student per day
    data[today][studentName] = status;
    saveAttendanceData(data);
    renderTable();
  }

  function resetToday() {
    const today = getTodayKey();
    const data = loadAttendanceData();
    if (data[today]) {
      delete data[today];
      saveAttendanceData(data);
    }
    renderTable();
  }

  function renderTable() {
    const today = getTodayKey();
    const data = loadAttendanceData();
    const todayRecords = data[today] || {};

    if (students.length === 0) {
      studentTableBody.innerHTML =
        `<tr><td colspan="7" class="no-data">No students configured.</td></tr>`;
      summaryText.textContent = "No students available.";
      return;
    }

    studentTableBody.innerHTML = "";
    let totalMarked = 0;
    let totalPresent = 0;

    students.forEach((name, index) => {
      const todayStatus = todayRecords[name] || "not-marked";
      if (todayStatus !== "not-marked") {
        totalMarked++;
        if (todayStatus === "present") totalPresent++;
      }

      const stats = getStatsForStudent(data, name);

      const tr = document.createElement("tr");

      let statusClass = "status-not-marked";
      let statusText = "Not marked";
      if (todayStatus === "present") {
        statusClass = "status-present";
        statusText = "Present";
      } else if (todayStatus === "absent") {
        statusClass = "status-absent";
        statusText = "Absent";
      }

      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${name}</td>
        <td>
          <span class="status-pill ${statusClass}">${statusText}</span>
        </td>
        <td>
          <button class="btn-primary btn-small present-btn" data-name="${name}" data-status="present">Present</button>
          <button class="btn-outline btn-small absent-btn" data-name="${name}" data-status="absent">Absent</button>
        </td>
        <td>${stats.totalDays}</td>
        <td>${stats.presentDays}</td>
        <td>${stats.percentage.toFixed(2)}%</td>
      `;
      studentTableBody.appendChild(tr);
    });

    if (totalMarked === 0) {
      summaryText.textContent =
        "No attendance marked yet for today. Click Present/Absent to mark.";
    } else {
      const percentToday = (totalPresent / totalMarked) * 100;
      summaryText.innerHTML = `
        Students marked today: <span>${totalMarked}/${students.length}</span> |
        Present today: <span>${totalPresent}</span> |
        Today's overall: <span>${percentToday.toFixed(2)}%</span>
      `;
    }

    // Attach click handlers for present/absent buttons
    document.querySelectorAll(".present-btn, .absent-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const n = btn.getAttribute("data-name");
        const s = btn.getAttribute("data-status");
        markToday(n, s);
      });
    });
  }

  function showDashboard(username) {
    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    todayBadge.textContent = "Today: " + formatTodayDisplay();
    userBadge.textContent = "Logged in as: " + username;
    renderTable();
  }

  function logout() {
    dashboardSection.classList.add("hidden");
    loginSection.classList.remove("hidden");
    loginPassInput.value = "";
    loginUserInput.value = "";
    loginError.textContent = "";
  }

  // Login button
  loginBtn.addEventListener("click", () => {
    const u = loginUserInput.value.trim();
    const p = loginPassInput.value.trim();
    if (u === LOGIN_USER && p === LOGIN_PASS) {
      showDashboard(u);
    } else {
      loginError.textContent = "Invalid username or password.";
    }
  });

  // Enter key on password
  loginPassInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") loginBtn.click();
  });

  logoutBtn.addEventListener("click", logout);

  resetTodayBtn.addEventListener("click", () => {
    if (confirm("Reset today's attendance for all students?")) {
      resetToday();
    }
  });
});
