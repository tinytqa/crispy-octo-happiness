const baseUrl = "https://localhost:7241/api/Teacher";
teachersData = [];
// Load danh sách giáo viên khi trang được tải

$(document).ready(function () {
    loadData();
    loadSubjects();
});
function loadData() {
    
    $.ajax({
        url: `${baseUrl}/showTeacherwithSubject`,
        method: 'GET',
        success: function (data) {
            teachersData = data;
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
    data.forEach((teacher) => {
        // Chuyển danh sách subjects thành chuỗi tên môn học
        let subjects = teacher.subjects.length > 0 
            ? teacher.subjects.map(s => s.sjName).join(', ')  // Lấy tên môn học
            : 'N/A';

        html += `
            <tr>
                <td>${teacher.tId}</td>
                <td>${teacher.tName}</td>
                <td>${teacher.tPhone}</td>
                <td>${teacher.tPassword}</td>
                <td>${subjects}</td> 
                <td>
                    <button class="btn btn-warning btn-sm" onclick="openEditForm('${teacher.tId}')">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTeacher('${teacher.tId}')">Xóa</button>
                </td>
            </tr>
        `;
    });
    $('#teacherList').html(html);
}
function addTeacher() {
    var teacherId = $('#teacherID').val();
    var teacherName = $('#teacherName').val();
    var teacherPhone = $('#teacherNumber').val();
    var teacherPassword = $('#teacherPassword').val();

    // Lấy danh sách môn học từ form "Thêm giáo viên" thay vì "Chỉnh sửa"
    var selectedSubjects = [];
    $('input[name="subjectList"]:checked').each(function () { 
        selectedSubjects.push($(this).val()); 
    });

    if (!teacherId || !teacherName || !teacherPhone || !teacherPassword || selectedSubjects.length === 0) {
        alert('Vui lòng điền đầy đủ thông tin và chọn ít nhất một môn học.');
        return;
    }

    var subjectsQuery = selectedSubjects.join(',');

    $.ajax({
        url: `${baseUrl}/insert?id=${encodeURIComponent(teacherId)}&name=${encodeURIComponent(teacherName)}&phone=${encodeURIComponent(teacherPhone)}&pw=${encodeURIComponent(teacherPassword)}&subjects=${encodeURIComponent(subjectsQuery)}`,
        method: 'POST',
        success: function (response) {
            alert('Thêm giáo viên thành công!');
            loadData();
            $('#teacherForm')[0].reset();
            hideAddForm();
        },
        error: function (error) {
            alert('Lỗi khi thêm giáo viên.');
            console.error(error);
        }
    });
}

async function showAddForm() {
    const subjects = await loadSubjects();
    renderSubjects(subjects, 'subjectsContainer', [], "subjectList");
    console.log("✅ Môn học trong form Add:", subjects);

    document.getElementById('addTeacherPopup').style.display = 'flex';
}

// Hiển thị form chỉnh sửa giáo viên

async function openEditForm(teacherId) {
    let teacher = teachersData.find(t => t.tId == teacherId);
    if (!teacher) return alert('❌ Không tìm thấy giáo viên!');

    $('#editTeacherId').val(teacher.tId);
    $('#editTeacherName').val(teacher.tName);
    $('#editTeacherPhone').val(teacher.tPhone);
    $('#editTeacherPassword').val(teacher.tPassword);
    $('#editSubjectsList').empty();

    try {
        // Gọi API để lấy danh sách môn học của giáo viên
        const selectedSubjects = await fetchData(`https://localhost:7241/api/TeacherSubject/GetSubjectsByTeacher?teacherId=${teacherId}`);
        console.log("📢 API trả về:", selectedSubjects);

        if (!Array.isArray(selectedSubjects) || selectedSubjects.length === 0) {
            console.error("❌ Không có dữ liệu môn học!");
            return;
        }

        // Lấy danh sách ID môn học đã chọn (sửa lỗi key)
        const selectedSubjectIds = selectedSubjects.map(s => String(s.tsSjId));

        console.log("✅ Môn học đã chọn:", selectedSubjects);
        console.log("✅ ID môn học đã chọn:", selectedSubjectIds);

        // Gọi API để lấy danh sách tất cả môn học
        const subjects = await loadSubjects();
        console.log("✅ Danh sách tất cả môn học:", subjects);

        // Hiển thị danh sách môn học với checkbox
        renderSubjects(subjects, 'editSubjectsList', selectedSubjectIds, "editSubjectList");

        document.getElementById('editTeacherPopup').style.display = 'flex';
    } catch (error) {
        console.error("❌ Lỗi khi gọi API:", error);
    }
}


function saveEditTeacher() {
    var teacherId = $('#editTeacherId').val();
    var teacherName = $('#editTeacherName').val();
    var teacherPhone = $('#editTeacherPhone').val();
    var teacherPassword = $('#editTeacherPassword').val();

    // Lấy danh sách môn học đã chọn
    var selectedSubjects = [];
    $('input[name="editSubjectList"]:checked').each(function () { 
        selectedSubjects.push($(this).val()); 
    });

    if (!teacherId || !teacherName || !teacherPhone || !teacherPassword || selectedSubjects.length === 0) {
        alert('Vui lòng điền đầy đủ thông tin và chọn ít nhất một môn học.');
        return;
    }

    var subjectsQuery = selectedSubjects.join(',');

    // Tạo URL với Query String
    var requestUrl = `${baseUrl}/update?id=${encodeURIComponent(teacherId)}&name=${encodeURIComponent(teacherName)}&phone=${encodeURIComponent(teacherPhone)}&pw=${encodeURIComponent(teacherPassword)}&subjects=${encodeURIComponent(subjectsQuery)}`;

    $.ajax({
        url: requestUrl,
        method: 'POST',
        success: function (response) {
            alert('Cập nhật thành công!');
            loadData();
            hideEditForm();
        },
        error: function (xhr, status, error) {
            alert(`Lỗi khi cập nhật giáo viên: ${xhr.responseText}`);
            console.error(error);
        }
    });
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        return Array.isArray(data) ? data : []; // Đảm bảo trả về mảng hợp lệ
    } catch (error) {
        console.error(`❌ Lỗi khi fetch ${url}:`, error);
        return [];
    }
}
// Load danh sách môn học
async function loadSubjects() {
    return await fetchData('https://localhost:7241/api/Subject/show');
}

// Hiển thị danh sách môn học với checkbox
function renderSubjects(subjects, containerId, selectedSubjectIds = [], checkboxName = "subjectList") {
    const container = document.getElementById(containerId);
    if (!container) return console.error(`❌ Không tìm thấy phần tử: ${containerId}`);

    container.innerHTML = ''; // Xóa nội dung cũ

    const fragment = document.createDocumentFragment(); // Tạo fragment để giảm thao tác DOM

    subjects.forEach(({ sjId, sjName }) => {
        if (!sjId || !sjName) return console.warn("⚠️ Bỏ qua môn học do thiếu dữ liệu:", { sjId, sjName });

        const div = document.createElement("div");
        div.classList.add("subject-item");

        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = checkboxName;
        input.value = sjId;
        input.id = `subject-${sjId}`;
        if (selectedSubjectIds.includes(String(sjId))) {
            input.checked = true;
        }

        const label = document.createElement("label");
        label.htmlFor = `subject-${sjId}`;
        label.textContent = sjName;

        div.appendChild(input);
        div.appendChild(label);
        fragment.appendChild(div);
    });

    container.appendChild(fragment); // Chỉ thao tác DOM 1 lần
    console.count("🔥 renderSubjects() được gọi");
}

function hideEditForm() {
    document.getElementById('editTeacherPopup').style.display = 'none';
}

function deleteTeacher(teacherId) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        $.ajax({
            url: `${baseUrl}/delete?id=${encodeURIComponent(teacherId)}`,
            method: 'delete',
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

// Ẩn/Hiện mật khẩu trong form
function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const icon = passwordInput.nextElementSibling.querySelector('i');

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.className = "fas fa-eye-slash";
    } else {
        passwordInput.type = "password";
        icon.className = "fas fa-eye";
    }
}

// Ẩn/Hiện mật khẩu trong bảng
function togglePasswordVisibilityInTable(teacherId, password) {
    const passwordSpan = document.getElementById(`pwd-${teacherId}`);
    const icon = document.getElementById(`eye-${teacherId}`);

    if (passwordSpan.dataset.hidden === "true" || !passwordSpan.dataset.hidden) {
        passwordSpan.textContent = password;
        passwordSpan.dataset.hidden = "false";
        icon.className = "fas fa-eye-slash";
    } else {
        passwordSpan.textContent = maskPassword(password);
        passwordSpan.dataset.hidden = "true";
        icon.className = "fas fa-eye";
    }
}

// Ẩn mật khẩu với dấu *
function maskPassword(password) {
    if (!password) return "";
    return "*".repeat(password.length);
}