document.addEventListener("DOMContentLoaded", function () {
    fetchClassList();
});

// Gọi API lấy danh sách lớp của giáo viên hiện tại
function fetchClassList() {
    console.log("Token:", localStorage.getItem("jwtToken"));
    var teacherid = JSON.parse(localStorage.getItem("userInfo")).id;

    // fetch("https://localhost:7241/api/TeacherSubjectClass/getClassesByTeacher1?teacherId=" + teacherid, {
    //     headers: {
    //         "Authorization": "Bearer " + localStorage.getItem("jwtToken") // Truyền token để xác thực giáo viên
    //     }
    // })
    fetch("https://localhost:7241/api/TeacherSubjectClass/getClassesByTeacher", {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("jwtToken") // Truyền token để xác thực giáo viên
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log("Data recieved from API:", data);
            renderClassList(data);
        })
        .catch(error => console.error("Error when loading classes list:", error));
}

// Hiển thị danh sách lớp
function renderClassList(classes) {
    const classGrid = document.querySelector(".class-grid");
    classGrid.innerHTML = "";


    if (classes.length === 0) {
        classGrid.innerHTML = "<p>There are no classes.</p>";
        return;
    }

    classes.forEach(classItem => {
        const classCard = document.createElement("div");
        classCard.classList.add("class-card");

        classCard.innerHTML = `
            <div class="class-header">
                <span class="class-name">${classItem.className}</span>
                <i class="fas fa-users"></i>
            </div>
            <div class="class-content">
                <div class="info-row">
                    <span class="info-label">Subject:</span>
                    <span class="info-value">${classItem.subjectName}</span>
                </div>
                <button class="class-btn btn-primary" onclick="manageClass('${classItem.classId}', '${classItem.className}')">
                    <i class="fas fa-list-alt"></i> Grade Management
                </button>

            </div>
        `;

        classGrid.appendChild(classCard);
    });
}
function manageClass(classId, className) {
    localStorage.setItem("selectedClassId", classId);
    localStorage.setItem("selectedClassName", className);
    window.location.href = "nhapdiem.html";
}



