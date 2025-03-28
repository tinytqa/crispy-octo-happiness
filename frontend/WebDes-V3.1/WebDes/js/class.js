const baseUrl = "https://localhost:7241/api/Class";
let classesData = [];
// Load danh sách giáo viên khi trang được tải

$(document).ready(function () {
    loadData();
});
function loadData() {
    $.ajax({
        url: `${baseUrl}/show`,
        method: 'GET',
        success: function (data) {
            classesData = data;
            renderTable(data);
        },
        error: function (error) {
            alert('Lỗi khi tải dữ liệu');
            console.error(error);
        }
    });
}
function renderTable(data) {
    let html = '';
    data.forEach((Sclass) => {
        html += `
            <tr>
                <td>${Sclass.cId}</td>
                <td>${Sclass.cName}</td>
                <td>${Sclass.teacherName}</td>
                <td>
                    <button class="btn btn-info btn-sm" onclick="viewStudents('${Sclass.cId}', '${Sclass.cName}')">Xem học sinh</button>
                    <button class="btn btn-warning btn-sm" onclick="openEditForm('${Sclass.cId}')">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteStudent('${Sclass.cId}')">Xóa</button>
                </td>
            </tr>
        `;
    });
    $('#classList').html(html);
}
async function viewStudents(classId, className) {
    try {
        let response = await fetch(`https://localhost:7241/api/Class/students?classId=${classId}`);
        
        if (!response.ok) {
            throw new Error(await response.text());
        }

        let students = await response.json();
        let html = '';

        if (students.length === 0) {
            html = `<tr><td colspan="3">Không có học sinh nào</td></tr>`;
        } else {
            students.forEach(student => {
                html += `
                    <tr>
                        <td>${student.stuId}</td>
                        <td>${student.stuName}</td>
                        <td>${student.stuDob}</td>
                    </tr>
                `;
            });
        }

        document.getElementById('studentList').innerHTML = html;
        document.getElementById('classTitle').innerText = `Danh sách học sinh - ${className}`;
        document.getElementById('studentListPopup').style.display = 'flex';
    } catch (error) {
        console.error("Lỗi khi tải danh sách học sinh:", error);
        alert(error.message);
    }
}

function hideStudentList() {
    document.getElementById('studentListPopup').style.display = 'none';
}

function addClass() {
    var classId = $('#classID').val();
    var className = $('#className').val();
    var classTeacher = $('#cbTeacher').val();

    // Kiểm tra thông tin đầu vào
    if (!classId || !className || !classTeacher) {
        alert('Vui lòng điền đầy đủ thông tin lớp học.');
        return;
    }

    // Tạo URL query string
    var queryString = `id=${encodeURIComponent(classId)}&name=${encodeURIComponent(className)}&tId=${encodeURIComponent(classTeacher)}`;

    // Gửi request POST với query string
    $.ajax({
        url: `${baseUrl}/insert?${queryString}`,
        method: 'POST',
        success: function (response) {
            alert('Thêm lớp học thành công!');
            loadData(); // Load lại danh sách sau khi thêm
            $('#classForm')[0].reset(); // Reset form nhập liệu
            hideAddForm(); // Ẩn popup thêm lớp học
        },
        error: function (error) {
            alert('Lỗi khi thêm lớp học.');
            console.error(error);
        }
    });
}
function showAddForm() {
    document.getElementById('addClassPopup').style.display = 'flex';
    loadTeachers('cbTeacher');
}
function hideAddForm() {
    document.getElementById('addClassPopup').style.display = 'none';
}
function saveEdit() {
    var classId = $('#editClassId').val();
    var className = $('#editClassName').val();
    var teacher = $('#editcbTeacher').val();

    if (!classId || !className || !teacher) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
    }

    console.log("Sending request:", {
        id: classId,
        name: className,
        tID: teacher
    });

    $.ajax({
        url: `${baseUrl}/update?id=${encodeURIComponent(classId)}&name=${encodeURIComponent(className)}&tID=${encodeURIComponent(teacher)}`,
        method: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        success: function (response) {
            alert('Cập nhật thành công!');
            loadData();
            hideEditForm();
        },
        error: function (error) {
            console.error("Error:", error);
            alert('Lỗi khi cập nhật lớp học: ' + error.responseText);
        }
    });
}
async function openEditForm(classId) {
    let classItem = classesData.find(c => c.cId == classId);

    if (!classItem) {
        alert('Không tìm thấy lớp học!');
        return;
    }

    $('#editClassId').val(classItem.cId);
    $('#editClassName').val(classItem.cName);

    // Chờ load danh sách giáo viên trước khi gán giá trị
    await loadTeachers('editcbTeacher');
    $('#editcbTeacher').val(classItem.ctId);

    document.getElementById('editClassPopup').style.display = 'flex';
}
function hideEditForm() {
    document.getElementById('editClassPopup').style.display = 'none';
}
function deleteStudent(classId) {

    if (confirm('Bạn có chắc muốn xóa?')) {
        $.ajax({
            url: `${baseUrl}/delete?id=${encodeURIComponent(classId)}`,
            method: 'DELETE',
            success: function (response) {
                loadData();
                alert('Xóa thành công!');
            },
            error: function (error) {
                alert('Lỗi khi xóa dữ liệu');
                console.error(error);
            }
        });
    }
}
async function loadTeachers(selectId) {
    try {
        const response = await fetch('https://localhost:7241/api/Teacher/showTeacherwithSubject');
        const classes = await response.json();
        const select = document.getElementById(selectId);

        if (!select) {
            console.error(`Không tìm thấy phần tử select với id: ${selectId}`);
            return;
        }

        select.innerHTML = '<option value="">Select Teacher</option>'; // Reset danh sách

        classes.forEach(t => {
            const option = document.createElement('option');
            option.value = t.tId;
            option.textContent = t.tName;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Lỗi khi load Teacher:', error);
    }
}


