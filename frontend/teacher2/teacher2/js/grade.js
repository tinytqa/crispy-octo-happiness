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
        setTimeout(() => {
            const newSubjectId = subjectSelector.val();
            if (newSubjectId) {
                showGrades(classId, newSubjectId);
            }
        }, 500);
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
let gradesData = [];



// async function showGrades(classId, subjectId) {
//     try {
//         const token = localStorage.getItem("jwtToken");

//         // Lấy danh sách học sinh
//         const studentsResponse = await fetch(`https://localhost:7241/api/Class/students?classId=${classId}`);
//         const students = await studentsResponse.json();

//         // Lấy danh sách điểm
//         const gradesResponse = await fetch(`https://localhost:7241/api/StudentGrade/grades?classId=${classId}&subjectId=${subjectId}`, {
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });

//         const gradesData = await gradesResponse.json();

//         const overallTbody = document.querySelector("#overall-tab tbody");
//         const detailTbody = document.querySelector("#detail-tab tbody");
//         overallTbody.innerHTML = "";
//         detailTbody.innerHTML = "";

//         students.forEach((student, index) => {
//             const stt = index + 1;
//             const { stuId, stuName } = student;

//             // Tìm thông tin điểm nếu có
//             const gradeInfo = gradesData.find(g => g.stu_id === stuId);

//             // Mặc định hiển thị input text cho những học sinh chưa có điểm
//             let d15 = "", mid = "", final = "", finalGrade = 0;

//             if (gradeInfo) {
//                 d15 = gradeInfo.grades.find(g => g.gc_name.toLowerCase().includes("15"))?.stug_grade ?? "";
//                 mid = gradeInfo.grades.find(g => g.gc_name.toLowerCase().includes("mid"))?.stug_grade ?? "";
//                 final = gradeInfo.grades.find(g => g.gc_name.toLowerCase().includes("final"))?.stug_grade ?? "";
//                 finalGrade = gradeInfo.finalGrade ?? 0;
//             }

//             // ======= Bảng Tổng Quan =======
//             const rowOverall = `
//                 <tr>
//                     <td>${stt}</td>
//                     <td>${stuId}</td>
//                     <td>${stuName}</td>
//                     <td>${d15 !== "" ? d15 : '<input type="number" class="grade-input-overall" data-type="15 minutes" data-stuid="${stuId}" '}</td>
//                     <td>${mid !== "" ? mid : '<input type="number" class="grade-input-overall" data-type="Midterm" data-stuid="${stuId}" '}</td>
//                     <td>${final !== "" ? final : '<input type="number" class="grade-input-overall" data-type="Final" data-stuid="${stuId}" '}</td>
//                     <td>${finalGrade ? finalGrade.toFixed(2) : "-"}</td>
//                 </tr>
//             `;
//             overallTbody.insertAdjacentHTML("beforeend", rowOverall);

//             // ======= Bảng Chi Tiết =======
//             const rowDetail = `
//                 <tr>
//                     <td>${stt}</td>
//                     <td>${stuId}</td>
//                     <td>${stuName}</td>
//                     <td><input type="number" step="0.1" class="grade-input" data-type="15 minutes" data-stuid="${stuId}" value="${d15}" placeholder="Nhập điểm"></td>
//                     <td><input type="number" step="0.1" class="grade-input" data-type="Midterm" data-stuid="${stuId}" value="${mid}" placeholder="Nhập điểm"></td>
//                     <td><input type="number" step="0.1" class="grade-input" data-type="Final" data-stuid="${stuId}" value="${final}" placeholder="Nhập điểm"></td>
//                     <td>${finalGrade ? finalGrade.toFixed(2) : "-"}</td>
//                 </tr>
//             `;
//             detailTbody.insertAdjacentHTML("beforeend", rowDetail);

//             // Thêm sự kiện cho input trong bảng tổng quan để đồng bộ với bảng chi tiết
//             if (d15 === "" || mid === "" || final === "") {
//                 const overallRow = overallTbody.children[overallTbody.children.length - 1];
//                 const detailRow = detailTbody.children[detailTbody.children.length - 1];
                
//                 const overallInputs = overallRow.querySelectorAll('.grade-input-overall');
//                 const detailInputs = detailRow.querySelectorAll('.grade-input');
                
//                 overallInputs.forEach((input, idx) => {
//                     input.addEventListener('input', (e) => {
//                         detailInputs[idx].value = e.target.value;
//                     });
//                 });
                
//                 detailInputs.forEach((input, idx) => {
//                     input.addEventListener('input', (e) => {
//                         if (overallInputs[idx]) {
//                             overallInputs[idx].value = e.target.value;
//                         }
//                     });
//                 });
//             }
//         });

//     } catch (error) {
//         console.error(error);
//         alert("Lỗi khi tải dữ liệu điểm hoặc học sinh.");
//     }
// }

// async function saveStudentGrade() {
//     const subjectId = $("#subject-selector").val();
//     const classId = $("#class-selector").val();

//     if (!subjectId || !classId) {
//         alert("Vui lòng chọn lớp và môn học.");
//         return;
//     }

//     const token = localStorage.getItem("jwtToken");

//     // Lấy danh sách component để ánh xạ gc_name -> gcId
//     let componentMap = {}; // ví dụ: { "15 minutes": "Literature_15" }
//     try {
//         const res = await fetch(`https://localhost:7241/api/GradeComponent/by-subject?subjectId=${subjectId}`, {
//             headers: {
//                 "Authorization": "Bearer " + token
//             }
//         });
         
//         const components = await res.json();
//         components.forEach(comp => {
//             componentMap[comp.gcName] = comp.gcId;
//         });
//     } catch (error) {
//         console.error("Lỗi lấy grade components:", error);
//         alert("Không thể tải thành phần điểm.");
//         return;
//     }

//     // Duyệt qua từng ô điểm để gom dữ liệu
//     const rows = document.querySelectorAll("#detail-tab .grade-input[data-stuid]");

//     const gradeMap = {};
//     rows.forEach(input => {
//         const studentId = input.getAttribute("data-stuid");
//         const type = input.getAttribute("data-type"); // "15 minutes", "Final", "Midterm"
//         const grade = parseFloat(input.value);

//         if (!gradeMap[studentId]) {
//             gradeMap[studentId] = {};
//         }

//         if (!isNaN(grade)) {
//             gradeMap[studentId][type] = grade;
//         }
//     });

//     // Gửi điểm
//     for (const studentId in gradeMap) {
//         const grades = gradeMap[studentId];
//         for (const gcName in grades) {
//             const grade = grades[gcName];
//             const gcId = componentMap[gcName];

//             if (!gcId) {
//                 console.warn(`Không tìm thấy gcId cho "${gcName}", bỏ qua.`);
//                 continue;
//             }

//             try {
//                 const response = await fetch(`https://localhost:7241/api/studentgrade/insert?sID=${studentId}&gcID=${gcId}&subjectID=${subjectId}&grade=${grade}`, {
//                     method: "POST",
//                     headers: {
//                         "Authorization": "Bearer " + token
//                     }
//                 });

//                 if (!response.ok) {
//                     const errText = await response.text();
//                     console.error(`Lỗi lưu điểm ${gcName} cho ${studentId}:`, errText);
//                 } else {
//                     console.log(`Đã lưu điểm ${gcName} cho ${studentId}`);
//                 }
//             } catch (err) {
//                 console.error(`Lỗi gọi API lưu điểm cho ${studentId} (${gcName}):`, err);
//             }
//         }
//     }

//     alert("Lưu điểm thành công!");
// }
async function showGrades(classId, subjectId) {
    try {
        const token = localStorage.getItem("jwtToken");

        // Lấy danh sách học sinh
        const studentsResponse = await fetch(`https://localhost:7241/api/Class/students?classId=${classId}`);
        const students = await studentsResponse.json();

        // Lấy danh sách điểm
        const gradesResponse = await fetch(`https://localhost:7241/api/StudentGrade/grades?classId=${classId}&subjectId=${subjectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        let gradesData = await gradesResponse.json();

        // Kiểm tra xem gradesData có phải là mảng không
        if (!Array.isArray(gradesData)) {
            console.warn("Dữ liệu trả về không phải là mảng, đặt lại thành []");
            gradesData = [];
        }

        const overallTbody = document.querySelector("#overall-tab tbody");
        const detailTbody = document.querySelector("#detail-tab tbody");
        overallTbody.innerHTML = "";
        detailTbody.innerHTML = "";

        students.forEach((student, index) => {
            const stt = index + 1;
            const { stuId, stuName } = student;

            // Tìm thông tin điểm nếu có
            const gradeInfo = gradesData.find(g => g.stu_id === stuId);

            // Mặc định hiển thị input text cho những học sinh chưa có điểm
            let d15 = "", mid = "", final = "", finalGrade = 0;

            if (gradeInfo) {
                d15 = gradeInfo.grades.find(g => g.gc_name.toLowerCase().includes("15"))?.stug_grade ?? "";
                mid = gradeInfo.grades.find(g => g.gc_name.toLowerCase().includes("mid"))?.stug_grade ?? "";
                final = gradeInfo.grades.find(g => g.gc_name.toLowerCase().includes("final"))?.stug_grade ?? "";
                finalGrade = gradeInfo.finalGrade ?? 0;
            }

            // ======= Bảng Tổng Quan =======
            const rowOverall = `
                <tr>
                    <td>${stt}</td>
                    <td>${stuId}</td>
                    <td>${stuName}</td>
                    <td>${d15 !== "" ? d15 : '<input type="number" class="grade-input-overall" data-type="15 minutes" data-stuid="${stuId}" '}</td>
                    <td>${mid !== "" ? mid : '<input type="number" class="grade-input-overall" data-type="Midterm" data-stuid="${stuId}" '}</td>
                    <td>${final !== "" ? final : '<input type="number" class="grade-input-overall" data-type="Final" data-stuid="${stuId}" '}</td>
                    <td>${finalGrade ? finalGrade.toFixed(2) : "-"}</td>
                </tr>
            `;
            overallTbody.insertAdjacentHTML("beforeend", rowOverall);

            // ======= Bảng Chi Tiết =======
            const rowDetail = `
                <tr>
                    <td>${stt}</td>
                    <td>${stuId}</td>
                    <td>${stuName}</td>
                    <td><input type="number" step="0.1" class="grade-input" data-type="15 minutes" data-stuid="${stuId}" value="${d15}" placeholder="Nhập điểm"></td>
                    <td><input type="number" step="0.1" class="grade-input" data-type="Midterm" data-stuid="${stuId}" value="${mid}" placeholder="Nhập điểm"></td>
                    <td><input type="number" step="0.1" class="grade-input" data-type="Final" data-stuid="${stuId}" value="${final}" placeholder="Nhập điểm"></td>
                    <td>${finalGrade ? finalGrade.toFixed(2) : "-"}</td>
                </tr>
            `;
            detailTbody.insertAdjacentHTML("beforeend", rowDetail);

            // Thêm sự kiện cho input trong bảng tổng quan để đồng bộ với bảng chi tiết
            if (d15 === "" || mid === "" || final === "") {
                const overallRow = overallTbody.children[overallTbody.children.length - 1];
                const detailRow = detailTbody.children[detailTbody.children.length - 1];
                
                const overallInputs = overallRow.querySelectorAll('.grade-input-overall');
                const detailInputs = detailRow.querySelectorAll('.grade-input');
                
                overallInputs.forEach((input, idx) => {
                    input.addEventListener('input', (e) => {
                        detailInputs[idx].value = e.target.value;
                    });
                });
                
                detailInputs.forEach((input, idx) => {
                    input.addEventListener('input', (e) => {
                        if (overallInputs[idx]) {
                            overallInputs[idx].value = e.target.value;
                        }
                    });
                });
            }
        });

    } catch (error) {
        console.error(error);
        alert("Lỗi khi tải dữ liệu điểm hoặc học sinh.");
    }
}

async function saveStudentGrade() {
    const subjectId = $("#subject-selector").val();
    const classId = $("#class-selector").val();

    if (!subjectId || !classId) {
        alert("Vui lòng chọn lớp và môn học.");
        return;
    }

    const token = localStorage.getItem("jwtToken");

    // Lấy danh sách component để ánh xạ gc_name -> gcId
    let componentMap = {}; // ví dụ: { "15 minutes": "Literature_15" }
    try {
        const res = await fetch(`https://localhost:7241/api/GradeComponent/by-subject?subjectId=${subjectId}`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const components = await res.json();
        components.forEach(comp => {
            componentMap[comp.gcName] = comp.gcId;
        });
    } catch (error) {
        console.error("Lỗi lấy grade components:", error);
        alert("Không thể tải thành phần điểm.");
        return;
    }

    // Duyệt qua từng ô điểm để gom dữ liệu
    const rows = document.querySelectorAll("#detail-tab .grade-input[data-stuid]");

    const gradeMap = {};
    rows.forEach(input => {
        const studentId = input.getAttribute("data-stuid");
        const type = input.getAttribute("data-type"); // "15 minutes", "Final", "Midterm"
        const grade = parseFloat(input.value);

        if (!gradeMap[studentId]) {
            gradeMap[studentId] = {};
        }

        if (!isNaN(grade)) {
            gradeMap[studentId][type] = grade;
        }
    });

    // Gửi điểm
    for (const studentId in gradeMap) {
        const grades = gradeMap[studentId];
        for (const gcName in grades) {
            const grade = grades[gcName];
            const gcId = componentMap[gcName];

            if (!gcId) {
                console.warn(`Không tìm thấy gcId cho "${gcName}", bỏ qua.`);
                continue;
            }

            // Kiểm tra điểm hiện tại của học sinh và loại điểm (GC)
            const existingGrade = await getExistingGrade(studentId, gcId, subjectId, token);
            if (existingGrade !== grade) {
                // Chỉ gửi điểm nếu điểm khác với điểm hiện tại
                try {
                    const response = await fetch(`https://localhost:7241/api/studentgrade/insert?sID=${studentId}&gcID=${gcId}&subjectID=${subjectId}&grade=${grade}`, {
                        method: "POST",
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    });

                    if (!response.ok) {
                        const errText = await response.text();
                        console.error(`Lỗi lưu điểm ${gcName} cho ${studentId}:`, errText);
                    } else {
                        console.log(`Đã lưu điểm ${gcName} cho ${studentId}`);
                    }
                } catch (err) {
                    console.error(`Lỗi gọi API lưu điểm cho ${studentId} (${gcName}):`, err);
                }
            } else {
                console.log(`Điểm ${gcName} cho học sinh ${studentId} không thay đổi, bỏ qua.`);
            }
        }
    }

    alert("Lưu điểm thành công!");
}

// Hàm kiểm tra điểm đã tồn tại trong cơ sở dữ liệu
function getExistingGrade(studentId, componentName) {
    if (!Array.isArray(gradesData)) return null;

    const studentGrade = gradesData.find(g => g.stu_id === studentId);
    if (!studentGrade) return null;

    const component = studentGrade.components.find(c => c.component_name === componentName);
    return component ? component.grade : null;
}
