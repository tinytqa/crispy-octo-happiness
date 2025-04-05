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
        // Gọi API để tải điểm học sinh
        loadStudentGrades(classId, subjectSelector.val());
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
    // $("#save-grades-btn").on("click", async function () {
    //     const subjectId = $("#subject-selector").val();
    //     const rows = document.querySelectorAll(".grade-table tbody tr");
    
    //     if (!subjectId) {
    //         alert("Vui lòng chọn môn học.");
    //         return;
    //     }
    
    //     for (const row of rows) {
    //         const studentId = row.children[1].textContent.trim();
    //         const inputs = row.querySelectorAll(".grade-input");
    
    //         const gradeValues = Array.from(inputs).map(input => parseFloat(input.value));
    
    //         // Mặc định bạn có 3 cột điểm: 15 phút, giữa kỳ, cuối kỳ
    //         const gradeComponents = [
    //             { gcId: "GC15", grade: gradeValues[0] },
    //             { gcId: "GCMID", grade: gradeValues[1] },
    //             { gcId: "GCFINAL", grade: gradeValues[2] }
    //         ];
    
    //         for (const component of gradeComponents) {
    //             await saveStudentGrade(studentId, component.gcId, subjectId, component.grade);
    //         }
    //     }
    
    //     alert("Lưu điểm thành công!");
    // });
    
});
// async function saveStudentGrade(studentId, gcId, subjectId, grade) {
//     try {
//         const response = await fetch(`https://localhost:7241/api/studentgrade/insert?sID=${studentId}&gcID=${gcId}&subjectID=${subjectId}&grade=${grade}`, {
//             method: "POST",
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             console.error(`Lỗi lưu điểm cho ${studentId} - ${gcId}:`, errorText);
//         } else {
//             console.log(`Lưu điểm thành công cho ${studentId} - ${gcId}`);
//         }
//     } catch (err) {
//         console.error(`Lỗi gọi API lưu điểm:`, err);
//     }
// }

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


// Hàm để load điểm học sinh và hiển thị ra bảng điểm
async function loadStudentGrades(classId, subjectId) {
    try {
        const token = localStorage.getItem("jwtToken");

        // Gọi API để lấy điểm học sinh
        const response = await fetch(`https://localhost:7241/api/grades?classId=${classId}&subjectId=${subjectId}`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        // Kiểm tra nếu không có dữ liệu hoặc có lỗi
        if (!response.ok) {
            console.error("Lỗi khi lấy dữ liệu điểm:", response.statusText);
            return;
        }

        const studentGrades = await response.json();
        
        // Hiển thị điểm học sinh ở bảng tổng hợp
        showGradesInTable(studentGrades);
        showGradesInDetailTable(studentGrades);

    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
    }
}

// Hàm hiển thị điểm học sinh ở bảng tổng hợp
function showGradesInTable(grades) {
    const tbody = document.querySelector('.grade-table tbody');
    tbody.innerHTML = ''; // Xóa dữ liệu cũ

    grades.forEach((grade, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${grade.stu_id}</td>
            <td>${grade.stu_name}</td>
            <td>${grade.gc_name === "15 mins" ? grade.stug_grade : ''}</td>
            <td>${grade.gc_name === "Giữa kỳ" ? grade.stug_grade : ''}</td>
            <td>${grade.gc_name === "Cuối kỳ" ? grade.stug_grade : ''}</td>
            <td>${calculateAverageGrade(grade.stug_grade, grade.gc_weight)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Hàm hiển thị điểm chi tiết
function showGradesInDetailTable(grades) {
    const tbody = document.querySelector('.detailed-table tbody');
    tbody.innerHTML = ''; // Xóa dữ liệu cũ

    grades.forEach((grade, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${grade.stu_id}</td>
            <td>${grade.stu_name}</td>
            <td>${grade.gc_name === "15 mins" ? grade.stug_grade : ''}</td>
            <td>${grade.gc_name === "Giữa kỳ" ? grade.stug_grade : ''}</td>
            <td>${grade.gc_name === "Cuối kỳ" ? grade.stug_grade : ''}</td>
            <td>${calculateAverageGrade(grade.stug_grade, grade.gc_weight)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Hàm tính điểm trung bình
function calculateAverageGrade(grade, weight) {
    return (grade * weight) / 100;
}

// Lắng nghe sự kiện chọn lớp và môn học
document.getElementById("class-selector").addEventListener("change", function () {
    const classId = this.value;
    const subjectId = document.getElementById("subject-selector").value;
    loadStudentGrades(classId, subjectId);
});

document.getElementById("subject-selector").addEventListener("change", function () {
    const subjectId = this.value;
    const classId = document.getElementById("class-selector").value;
    loadStudentGrades(classId, subjectId);
});
