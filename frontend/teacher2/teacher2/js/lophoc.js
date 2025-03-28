document.addEventListener("DOMContentLoaded", function () {
    fetchClassList();
});

// Gọi API lấy danh sách lớp của giáo viên hiện tại
function fetchClassList() {
    console.log("Token:", localStorage.getItem("jwtToken"));
    var teacherid = JSON.parse( localStorage.getItem("userInfo")).id;

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
        console.log("Dữ liệu nhận được từ API:", data);
        renderClassList(data);
    })
    .catch(error => console.error("Lỗi khi tải danh sách lớp:", error));
}

// Hiển thị danh sách lớp
function renderClassList(classes) {
    const classGrid = document.querySelector(".class-grid");
    classGrid.innerHTML = "";


    if (classes.length === 0) {
        classGrid.innerHTML = "<p>Không có lớp nào.</p>";
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
                    <span class="info-label">Môn học:</span>
                    <span class="info-value">${classItem.subjectName}</span>
                </div>
                <button class="class-btn btn-primary" onclick="manageClass('${classItem.className}')">
                    <i class="fas fa-list-alt"></i> Quản lý điểm
                </button>
            </div>
        `;

        classGrid.appendChild(classCard);
    });
}


