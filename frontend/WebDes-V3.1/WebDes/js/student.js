const baseUrl = "https://localhost:7241/api/Student";

// Load danh sách giáo viên khi trang được tải
let studentsData = [];

$(document).ready(function () {
    loadData();
    document.getElementById('showAddFormButton').addEventListener('click', showAddForm);
    document.querySelector('.close-btn').addEventListener('click', hideAddForm);
    
});
function loadData() {
    $.ajax({
        url: `${baseUrl}/show`,
        method: 'GET',
        success: function (data) {
            studentsData = data;
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
    data.forEach((student) => {
        let formattedDob = formatDateForInput(student.stuDob); // Định dạng lại ngày sinh

        html += `
        <tr> 
            <td>${student.stuId}</td>
            <td>${student.stuName}</td>
            <td>${student.stuGradeLevel}</td>
            <td>${student.className}</td>
            <td>${formattedDob}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="openEditForm('${student.stuId}')">Sửa</button>
                <button class="btn btn-danger btn-sm" onclick="deleteStudent('${student.stuId}')">Xóa</button>
            </td>
        </tr>
        `;
    });
    $('#studentList').html(html);
}

function addStudent() {
    var studentId = $('#studentID').val();
    var studentName = $('#studentName').val();
    var studentClass = $('#cbClass').val();
    var gradeLevel = $('#grade').val();
    var dob = $('#dob').val();

    // Kiểm tra thông tin đầu vào
    if (!studentId || !studentName || !gradeLevel || !dob || !studentClass) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
    }

    // Tạo URL query string
    var queryString = `id=${encodeURIComponent(studentId)}&name=${encodeURIComponent(studentName)}&grade=${encodeURIComponent(gradeLevel)}&dob=${encodeURIComponent(dob)}&cID=${encodeURIComponent(studentClass)}`;

    // Gửi request POST với query string
    $.ajax({
        url: `${baseUrl}/insert?${queryString}`, // Đảm bảo URL đúng
        method: 'POST',
        success: function (response) {
            alert('Thêm học sinh thành công!');
            loadData(); // Load lại danh sách sau khi thêm
            $('#studentForm')[0].reset(); // Reset form nhập liệu
            hideAddForm(); // Ẩn popup thêm học sinh
        },
        error: function (error) {
            alert('Lỗi khi thêm học sinh.');
            console.error(error);
        }
    });
}
function showAddForm() {
    document.getElementById('addStudentPopup').style.display = 'flex';

    loadClasses('cbClass');
}

function hideAddForm() {
    document.getElementById('addStudentPopup').style.display = 'none';
}

function saveEdit() {
    var studentId = $('#editStudentId').val();
    var studentName = $('#editStudentName').val();
    var gradeLevel = $('#editGradeLevel').val();
    var dob = $('#editDob').val();
    var studentClass = $('#editClass').val(); // Lấy giá trị class

    if (!studentId || !studentName || !gradeLevel || !dob || !studentClass) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
    }

    // Tạo query string bao gồm class
    var queryString = `id=${encodeURIComponent(studentId)}&name=${encodeURIComponent(studentName)}&grade=${encodeURIComponent(gradeLevel)}&dob=${encodeURIComponent(dob)}&cID=${encodeURIComponent(studentClass)}`;

    // Gửi request cập nhật
    $.ajax({
        url: `${baseUrl}/update?${queryString}`,
        method: 'POST', 
        success: function (response) {
            alert('Cập nhật thông tin thành công!');
            hideEditForm();
            loadData(); 
        },
        error: function (error) {
            alert('Lỗi khi cập nhật thông tin.');
            console.error(error);
        }
    });
}
async function openEditForm(studentId) {
    let student = studentsData.find(s => s.stuId == studentId);

    if (!student) {
        alert('Không tìm thấy học sinh!');
        return;
    }

    $('#editStudentId').val(student.stuId);
    $('#editStudentName').val(student.stuName);
    $('#editGradeLevel').val(student.stuGradeLevel);

    let formattedDob = formatDateForInput(student.stuDob);
    $('#editDob').val(formattedDob);

    // Hiển thị form trước
    document.getElementById('editStudentPopup').style.display = 'flex';

    // Load danh sách lớp và đảm bảo hiển thị đúng lớp
    await loadClasses('editClass');

    // Chọn đúng lớp dựa theo ID của lớp
    $('#editClass').val(student.classId);
    console.log(student.classId);
}

function hideEditForm() {
    document.getElementById('editStudentPopup').style.display = 'none';
}

function deleteStudent(studentId) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        $.ajax({
            url: `${baseUrl}/delete?id=${encodeURIComponent(studentId)}`,
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
function formatDateForInput(dateString) {
    if (!dateString) return '';

    let date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        console.warn("Lỗi chuyển đổi ngày:", dateString);
        return '';
    }

    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear();

    return `${year}-${month}-${day}`; // Chuyển thành YYYY-MM-DD để tương thích với <input type="date">
}








