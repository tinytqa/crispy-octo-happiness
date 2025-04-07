const baseUrl = "https://localhost:7241/api";

$(document).ready(function () {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (!user || user.role !== "parent") {
        alert("Parent information not found!");
        return;
    }

    const parentId = user.id;

    // 1. Lấy danh sách học sinh theo phụ huynh
    fetch(`${baseUrl}/Student/by-parent?parentId=${parentId}`)
        .then(res => res.json())
        .then(students => {
            if (!students || students.length === 0) {
                alert("No student was assigned for this parent.");
                return;
            }

            // Đổ dữ liệu vào combo box có sẵn
            const studentSelect = $("#studentSelect");
            studentSelect.empty().append('<option value="">-- Choose student --</option>');
            students.forEach(s => {
                studentSelect.append(`<option value="${s.classId}" data-student-id="${s.studentId}">${s.studentName}</option>`);
            });

            // Khi chọn học sinh -> Load giáo viên dạy lớp tương ứng
            studentSelect.on("change", function () {
                const classId = $(this).val();

                if (!classId) {
                    $("#teacherList").empty();
                    return;
                }

                loadTeachersByClass(classId);
            });
        })
        .catch(err => {
            console.error("Error when getting teacher list: ", err);
        });

    // 2. Hàm gọi API lấy giáo viên theo classId
    function loadTeachersByClass(classId) {
        const tableBody = $("#teacherList");
        tableBody.empty();

        fetch(`${baseUrl}/Teacher/showTeacherForParent?classId=${encodeURIComponent(classId)}`)
            .then(res => res.json())
            .then(data => {
                if (!data || data.length === 0) {
                    tableBody.append("<tr><td colspan='4'>No teachers were assigned for this student's class.</td></tr>");
                    return;
                }

                const rows = data.map(teacher => {
                    const subjectNames = teacher.subjects.map(sub => sub.sjName).join(", ");
                    return `
                        <tr>
                            <td>${classId}</td>
                            <td>${teacher.tName}</td>
                            <td>${teacher.tPhone}</td>
                            <td>${subjectNames}</td>
                        </tr>`;
                });

                tableBody.html(rows.join(""));

                $('#teacherTable').DataTable({
                    destroy: true,
                    paging: false,
                    info: false,
                    lengthChange: false,
                    searching: true,
                    language: {
                        search: "Search:",
                        emptyTable: "No data found"
                    }
                });
            })
            .catch(err => {
                console.error("Error when loading teacher list:", err);
                tableBody.append("<tr><td colspan='4'>Error when loading data.</td></tr>");
            });
    }

});
