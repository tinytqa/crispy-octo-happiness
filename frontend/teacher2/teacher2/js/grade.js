document.addEventListener('DOMContentLoaded', async function () {
    console.log("Trang đã load xong!");

    const classSelector = $("#class-selector");
    const subjectSelector = $("#subject-selector");
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const token = localStorage.getItem("jwtToken");

    if (!userInfo || userInfo.role !== "teacher" || !token) {
        console.error("Người dùng không phải giáo viên hoặc chưa đăng nhập.");
        alert("Bạn chưa đăng nhập hoặc không có quyền truy cập.");
        return;
    }

    // Tải danh sách lớp và bind sự kiện sau khi có dữ liệu
    await loadClasses('class-selector', token);

    // Gán sự kiện khi chọn lớp -> load môn học tương ứng
    classSelector.on("change", function () {
        const classId = $(this).val();
        console.log("Lớp được chọn:", classId);
        loadSubjectsByClassAndTeacher(classId, userInfo.id);
        loadStudentsByClass(classId);
    });

    // Gọi sự kiện thay đổi để load môn học của lớp đầu tiên
    classSelector.trigger("change");

    // Xử lý tìm kiếm học sinh
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchValue = this.value.toLowerCase();
            const rows = document.querySelectorAll('.grade-table tbody tr');

            rows.forEach(row => {
                const studentName = row.children[2].textContent.toLowerCase();
                const studentId = row.children[1].textContent.toLowerCase();
                row.style.display = (studentName.includes(searchValue) || studentId.includes(searchValue)) ? '' : 'none';
            });
        });
    }
});

async function loadClasses(selectId, token) {
    try {
        const response = await fetch("https://localhost:7241/api/TeacherSubjectClass/getClassesByTeacher", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            console.error("Lỗi khi lấy danh sách lớp:", response.statusText);
            alert("Không thể tải danh sách lớp.");
            return;
        }

        const classes = await response.json();
        console.log("Danh sách lớp:", classes);

        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = '';
        classes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.classId;
            option.textContent = c.className;
            select.appendChild(option);
        });

        // Load học sinh lớp đầu tiên nếu có
        // if (classes.length > 0) {
        //     loadStudentsByClass(classes[0].classId);
        // }

    } catch (error) {
        console.error("Lỗi khi load lớp:", error);
    }
}

function loadSubjectsByClassAndTeacher(classId, teacherId) {
    if (!classId || !teacherId) {
        console.error("Thiếu classId hoặc teacherId.");
        return;
    }

    const apiUrl = `https://localhost:7241/api/TeacherSubjectClass/get-subjects?classId=${classId}&teacherId=${teacherId}`;
    console.log("Gọi API:", apiUrl);

    $.ajax({
        url: apiUrl,
        method: "GET",
        success: function (subjects) {
            console.log("Danh sách môn học:", subjects);
            const subjectSelector = $("#subject-selector");
            subjectSelector.empty();

            if (subjects.length === 0) {
                subjectSelector.append(`<option value="">Không có môn học</option>`);
            } else {
                subjects.forEach(subject => {
                    subjectSelector.append(`<option value="${subject.subjectId}">${subject.subjectName}</option>`);
                });
            }
        },
        error: function (xhr) {
            console.error("Lỗi khi load môn học:", xhr.status, xhr.responseText);
        }
    });
}


async function loadStudentsByClass(classId) {
    try {
        const response = await fetch(`https://localhost:7241/api/Class/students?classId=${classId}`);
        console.log(response);
        const students = await response.json();
        const tbody = document.querySelector('.grade-table tbody');

        if (!tbody) {
            console.error('Không tìm thấy tbody của bảng điểm.');
            return;
        }

        tbody.innerHTML = ''; // Xóa dữ liệu cũ

        students.forEach((student, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${student.stuId}</td>
                <td>${student.stuName}</td>
              
                <td><input type="text" class="grade-input" value="0"></td>
                <td><input type="text" class="grade-input" value="0"></td>
                <td><input type="text" class="grade-input" value="0"></td>
                <td>0</td>
            `;

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Lỗi khi load danh sách học sinh:', error);
    }
}


