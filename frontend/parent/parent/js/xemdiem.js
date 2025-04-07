document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user && user.role === "parent") {
        const parentId = user.id;

        // Gọi API để lấy danh sách học sinh của phụ huynh
        fetch(`https://localhost:7241/api/StudentGrade/by-parent?parentId=${parentId}`)
            .then(res => res.json())
            .then(data => {
                const studentSelect = document.getElementById("studentSelect");

                if (!data || data.length === 0) {
                    alert("Phụ huynh chưa có học sinh nào.");
                    return;
                }

                // Đổ danh sách học sinh vào combo box
                data.forEach(student => {
                    const option = document.createElement("option");
                    option.value = student.studentId;
                    option.text = student.studentName;
                    studentSelect.appendChild(option);
                });

                // Mặc định load bảng điểm của học sinh đầu tiên
                loadStudentGrades(data[0].studentId);

                // Gắn sự kiện onchange cho dropdown
                studentSelect.addEventListener("change", function () {
                    const selectedId = this.value;
                    loadStudentGrades(selectedId);
                });
            });

        function loadStudentGrades(studentId) {
            fetch(`https://localhost:7241/api/StudentGrade/by-student?studentId=${studentId}`)
                .then(res => res.json())
                .then(grades => {
                    const head = document.getElementById("table-head");
                    const body = document.getElementById("table-body");

                    if (grades.length === 0) {
                        head.innerHTML = "<tr><th>Không có dữ liệu</th></tr>";
                        body.innerHTML = "";
                        return;
                    }

                    const allComponents = [...new Set(grades.flatMap(d => d.components.map(c => c.gc_name)))];

                    // Tạo header
                    let headerRow = "<tr><th>Môn học</th>";
                    allComponents.forEach(comp => {
                        headerRow += `<th>${comp}</th>`;
                    });
                    headerRow += "<th>Tổng kết</th></tr>";
                    head.innerHTML = headerRow;

                    // Tạo các hàng dữ liệu
                    let rows = "";
                    grades.forEach(subject => {
                        let row = `<tr><td>${subject.subject}</td>`;
                        allComponents.forEach(comp => {
                            const found = subject.components.find(c => c.gc_name === comp);
                            row += `<td>${found ? found.stug_grade : "-"}</td>`;
                        });
                        row += `<td>${subject.finalGrade.toFixed(2)}</td></tr>`;
                        rows += row;
                    });
                    body.innerHTML = rows;

                    // Khởi tạo DataTables chỉ với thanh tìm kiếm
                    $('#grade-table').DataTable({
                        responsive: true,
                        searching: true,  // Bật chức năng tìm kiếm
                        paging: false,    // Ẩn phân trang
                        info: false,      // Ẩn thông tin hiển thị số dòng
                        language: {
                            search: "Tìm kiếm:" // Thay đổi từ tìm kiếm
                        }
                    });
                });
        }
    } else {
        alert("Không tìm thấy thông tin phụ huynh trong localStorage.");
    }
});
