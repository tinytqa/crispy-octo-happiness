const baseUrl = "https://localhost:7241/api/TeacherSubjectClass";
// Hiển thị form thêm phân công
async function showAddAssignmentForm() {
    try {
        await Promise.all([
            loadTeachers('teacherSelect'),
            loadClasses('classSelect')
        ]);
        const subjects = await loadSubjects();

        document.getElementById('formTitle').textContent = 'Thêm Phân Công Mới';
        document.getElementById('assignmentId').value = '';
        document.getElementById('teacherSelect').value = '';
        document.getElementById('classSelect').value = '';

        renderSubjects(subjects, 'subjectsSelect', []);

        document.getElementById('submitAssignmentButton').textContent = 'Lưu Phân Công';
        document.getElementById('assignmentPopup').style.display = 'flex';
    } catch (error) {
        console.error("Lỗi khi hiển thị form phân công:", error);
    }
}

// Ẩn form phân công
function hideAssignmentForm() {
    document.getElementById('assignmentPopup').style.display = 'none';
}
async function loadTeachers(selectId) {
    try {
        const response = await fetch('https://localhost:7241/api/Teacher/show');
        const teachers = await response.json();
        const select = document.getElementById(selectId);

        if (!select) {
            console.error(`Không tìm thấy phần tử select với id: ${selectId}`);
            return;
        }

        select.innerHTML = '<option value="">Select Teacher</option>'; // Reset danh sách

        teachers.forEach(t => {
            const option = document.createElement('option');
            option.value = t.tId;
            option.textContent = t.tName;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Lỗi khi load Teacher:', error);
    }
}
async function loadClasses(selectId) {
    try {
        const response = await fetch('https://localhost:7241/api/Class/show');
        const classes = await response.json();
        const select = document.getElementById(selectId);

        if (!select) {
            console.error(`Không tìm thấy phần tử select với id: ${selectId}`);
            return;
        }

        select.innerHTML = '<option value="">Select Class</option>'; // Reset danh sách

        classes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.cId;  // Đảm bảo value là ClassId
            option.textContent = c.cName;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Lỗi khi load Class:', error);
    }
}
async function loadSubjects() {
    try {
        const response = await fetch('https://localhost:7241/api/Subject/show');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const subjects = await response.json();
        if (!subjects || !Array.isArray(subjects)) {
            throw new Error('Invalid subjects data');
        }

        return subjects;

    } catch (error) {
        console.error('Lỗi khi load Subjects:', error);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
}

document.getElementById("teacherSelect").addEventListener("change", async function () {
    let teacherId = this.value; // Lấy ID của giáo viên được chọn
    if (!teacherId) return;

    try {
        let response = await fetch(`https://localhost:7241/api/TeacherSubject/GetSubjectsByTeacher?teacherId=${teacherId}`);
        if (!response.ok) throw new Error("Lỗi khi lấy môn học của giáo viên!");

        let subjects = await response.json();
        renderSubjects(subjects, "subjectsSelect");
    } catch (error) {
        console.error(error);
    }
});

function renderSubjects(subjects, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Không tìm thấy phần tử có ID: ${containerId}!`);
        return;
    }

    container.innerHTML = ''; // Xóa nội dung cũ

    subjects.forEach(subject => {
        if (!subject.tsId || !subject.tsSjId || !subject.sjName) {
            console.warn("Dữ liệu môn học không hợp lệ:", subject);
            return;
        }

        let div = document.createElement('div');
        div.classList.add('subject-item');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = "subjectList";
        checkbox.dataset.teachersubjectid = subject.tsId; // Chỉnh lại đúng key
        checkbox.dataset.subjectid = subject.tsSjId; // Chỉnh lại đúng key

        let label = document.createElement('label');
        label.textContent = subject.sjName; // Chỉnh lại đúng key
        checkbox.id = `subject_${subject.tsSjId}`;
        label.setAttribute('for', `subject_${subject.tsSjId}`);

        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
}
function addAssignment() {
    let teacherId = $("#teacherSelect").val();
    let classId = $("#classSelect").val();
    let checkedSubjects = $("input[name='subjectList']:checked");

    if (!teacherId || !classId || checkedSubjects.length === 0) {
        alert("Vui lòng chọn đầy đủ thông tin!"); // Hiển thị thông báo
        return;
    }

    let requests = []; // Lưu danh sách request

    checkedSubjects.each(function () {
        let teacherSubjectId = $(this).data("teachersubjectid");

        let url = `${baseUrl}/insert?tsID=${encodeURIComponent(teacherSubjectId)}&classID=${encodeURIComponent(classId)}`;

        let request = $.ajax({
            url: url,
            type: "POST",
            success: function (response) {
                console.log("Thêm phân công thành công:", response);
            },
            error: function (xhr, status, error) {
                console.error("Lỗi khi lưu phân công:", xhr.responseText);
            }
        });

        requests.push(request); // Thêm request vào danh sách
    });

    // Khi tất cả request hoàn thành
    $.when.apply($, requests).done(function () {
        alert("Thêm phân công thành công!");
        location.reload(); // Reload trang để cập nhật danh sách
    }).fail(function () {
        alert("Có lỗi xảy ra khi thêm phân công!");
    });
}

function loadAssignments() {
    $.ajax({
        url: `${baseUrl}/show`,
        method: 'GET',
        success: function (data) {
            assignmentData = data;
            renderAssignments(data);
        },
        error: function (error) {
            alert('Lỗi khi tải danh sách phân công');
            console.error(error);
        }
    });
}
function renderAssignments(data) {
    let html = '';
    data.forEach((assignment) => {
        html += `
        <tr> 
            <td>${assignment.teacherName}</td>
            <td>${assignment.className}</td>
            <td>${assignment.subjectName}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteAssignment('${assignment.tscId}')">Xóa</button>
            </td>
        </tr>
        `;
    });
    $('#assignmentList').html(html);
}
$(document).ready(function () {
    loadAssignments();

});
function deleteAssignment(assignmentId) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        $.ajax({
            url: `${baseUrl}/delete?id=${encodeURIComponent(assignmentId)}`,
            method: 'DELETE',
            success: function (response) {
                loadAssignments();
                alert('Xóa thành công!');
            },
            error: function (error) {
                alert('Lỗi khi xóa dữ liệu');
                console.error(error);
            }
        });
    }
}


