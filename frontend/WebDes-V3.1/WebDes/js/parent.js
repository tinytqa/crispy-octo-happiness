const baseUrl = "https://localhost:7241/api/Parent";
let parentsData = [];

$(document).ready(function () {
    loadData();
});
function loadData() {
    $.ajax({
        url: `${baseUrl}/show`,
        method: 'GET',
        success: function (data) {
            parentsData = data;
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
    data.forEach((parent) => {
        // 🟢 Lấy danh sách tên học sinh (nếu có)
        let studentNames = parent.students && parent.students.length > 0
            ? parent.students.map(s => s.stuName).join(', ')
            : 'Không có học sinh'; // Trường hợp không có học sinh

        html += `
            <tr>
                <td>${parent.pId}</td>
                <td>${parent.pName}</td>
                <td>${parent.pPhone}</td>
                <td>${parent.pPassword}</td>
                <td>${studentNames}</td> <!-- Cập nhật cách hiển thị tên học sinh -->
                <td>
                    <button class="btn btn-warning btn-sm" onclick="openDialog('${parent.pId}')">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteParent('${parent.pId}')">Xóa</button>
                </td>
            </tr>
        `;
    });
    $('#parentList').html(html);
}

function addParent() {
    var parentId = $('#parentID').val().trim();
    var parentName = $('#parentName').val().trim();
    var parentPhone = $('#parentPhone').val().trim();
    var parentPassword = $('#parentPassword').val().trim();
    var studentIds = $('#selectedStudentsInput').val().split(',')
        .map(id => id.trim())
        .filter(id => id !== ''); // Lọc bỏ ID rỗng

    // Kiểm tra dữ liệu đầu vào
    if (!parentId || !parentName || !parentPhone || !parentPassword) {
        alert('Vui lòng nhập đầy đủ thông tin phụ huynh.');
        return;
    }

    if (studentIds.length === 0) {
        alert('Vui lòng chọn ít nhất một học sinh.');
        return;
    }

    // Tạo query string từ danh sách học sinh
    var studentIdsQuery = studentIds.map(id => `studentIds=${encodeURIComponent(id)}`).join('&');

    // Xây dựng URL
    var queryString = `id=${encodeURIComponent(parentId)}&name=${encodeURIComponent(parentName)}&phone=${encodeURIComponent(parentPhone)}&pw=${encodeURIComponent(parentPassword)}&${studentIdsQuery}`;

    console.log("🟢 Query String gửi lên API:", queryString);

    $.ajax({
        url: `${baseUrl}/insert?${queryString}`,
        method: 'POST',
        success: function (response) {
            alert('Thêm phụ huynh thành công!');
            loadData(); // Cập nhật danh sách phụ huynh
            // Load lại danh sách học sinh
            closeStudentList();
            $('#parentForm')[0].reset();
            hideAddForm();
        },
        error: function (xhr, status, error) {
            console.error("Lỗi khi thêm phụ huynh:", xhr.responseText);
            alert(`Lỗi khi thêm phụ huynh: ${xhr.responseText || error}`);
        }
    });
}
function showAddForm() {
    document.getElementById('addParentPopup').style.display = 'flex';
}
function hideAddForm() {
    document.getElementById('addParentPopup').style.display = 'none';
}

let selectedStudents = []; // Biến toàn cục, không bị reset mỗi lần mở danh sách
let selectedEditStudents = [];


function openDialog(parentId) {
    let parent = parentsData.find(p => p.pId === parentId);
    if (!parent) {
        alert("Không tìm thấy phụ huynh!");
        return;
    }

    $('#editParentId').val(parent.pId);
    $('#editParentName').val(parent.pName);
    $('#editParentPhone').val(parent.pPhone);
    $('#editParentPassword').val(parent.pPassword);

    // Cập nhật danh sách ID học sinh đã chọn
    selectedEditStudents = parent.students ? parent.students.map(s => s.stuId.toString()) : [];

    let studentNames = parent.students && parent.students.length > 0
        ? parent.students.map(s => s.stuName).join(', ')
        : '';
    $('#editselectedStudentsInput').val(studentNames);

    $('#editParentPopup').show();
}

function saveEditParent() {
    var parentId = $('#editParentId').val();
    var parentName = $('#editParentName').val();
    var parentPhone = $('#editParentPhone').val();
    var parentPassword = $('#editParentPassword').val();

    if (!parentId || !parentName || !parentPhone || !parentPassword) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
    }

    // Tạo query string
    var queryString = `id=${encodeURIComponent(parentId)}&` +
        `name=${encodeURIComponent(parentName)}&` +
        `phone=${encodeURIComponent(parentPhone)}&` +
        `pw=${encodeURIComponent(parentPassword)}`;

    // Thêm danh sách học sinh vào query string nếu có
    if (selectedEditStudents && selectedEditStudents.length > 0) {
        selectedEditStudents.forEach(stuId => {
            queryString += `&studentIds=${encodeURIComponent(stuId)}`;
        });
    }

    // Gửi request cập nhật
    $.ajax({
        url: `${baseUrl}/update?${queryString}`,
        method: 'POST',
        success: function (response) {
            alert('Cập nhật thông tin phụ huynh thành công!');
            $('#editParentPopup').hide();
            loadData();
        },
        error: function (error) {
            alert('Lỗi khi cập nhật thông tin phụ huynh.');
            console.error(error);
        }
    });
}


function hideEditForm() {
    document.getElementById('editParentPopup').style.display = 'none';
}
function deleteParent(parentId) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        $.ajax({
            url: `${baseUrl}/delete?id=${encodeURIComponent(parentId)}`,
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

function openStudentList(isEdit = false) {
    try {
        fetch('https://localhost:7241/api/Student/show')
            .then(response => response.json())
            .then(students => {
                const studentTableBody = document.querySelector('#studentTable tbody');
                studentTableBody.innerHTML = ''; // Xóa danh sách cũ

                let selectedList = isEdit 
                    ? (selectedEditStudents || []).map(String) 
                    : (selectedStudents || []).map(String);

                console.log("Danh sách ID học sinh đã chọn:", selectedList);

                // Lọc danh sách học sinh dựa vào trạng thái Edit
                let availableStudents = isEdit
                    ? students.filter(student => selectedList.includes(student.stuId.toString()) || !student.stuP)
                    : students.filter(student => !student.stuP); // Lọc học sinh chưa có phụ huynh

                availableStudents.forEach(student => {
                    const row = document.createElement('tr');

                    const selectCell = document.createElement('td');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = student.stuId.toString();

                    // ✅ Kiểm tra nếu học sinh đã được chọn trước đó
                    checkbox.checked = selectedList.includes(checkbox.value);

                    if (checkbox.checked) {
                        console.log(`✔️ Checked: Student ID = ${student.stuId}, Name = ${student.stuName}`);
                    }

                    checkbox.onchange = function () {
                        if (this.checked) {
                            if (!selectedList.includes(this.value)) {
                                selectedList.push(this.value);
                            }
                        } else {
                            let index = selectedList.indexOf(this.value);
                            if (index !== -1) {
                                selectedList.splice(index, 1);
                            }
                        }

                        let selectedNames = students
                            .filter(s => selectedList.includes(s.stuId.toString()))
                            .map(s => s.stuName)
                            .join(', ');

                        if (isEdit) {
                            selectedEditStudents = [...selectedList];
                            document.getElementById('editselectedStudentsInput').value = selectedNames;
                        } else {
                            selectedStudents = [...selectedList];
                            document.getElementById('selectedStudentsInput').value = selectedNames;
                        }

                        console.log("📌 Danh sách học sinh đã chọn:", selectedList);
                        console.log("📌 Tên học sinh hiển thị:", selectedNames);
                    };

                    selectCell.appendChild(checkbox);
                    row.appendChild(selectCell);

                    // Cột thông tin học sinh
                    //Ô Student ID
                    const idCell = document.createElement('td');
                    idCell.textContent = student.stuId;
                    row.appendChild(idCell);

                    // Ô Name
                    const nameCell = document.createElement('td');
                    nameCell.textContent = student.stuName;
                    row.appendChild(nameCell);

                    // Ô Grade
                    const gradeCell = document.createElement('td');
                    gradeCell.textContent = student.stuGradeLevel;
                    row.appendChild(gradeCell);

                    // Ô Date of Birth
                    const dobCell = document.createElement('td');
                    dobCell.textContent = student.stuDob;
                    row.appendChild(dobCell);

                    // Ô Class
                    const classCell = document.createElement('td');
                    classCell.textContent = student.className || 'N/A';
                    row.appendChild(classCell);

                    studentTableBody.appendChild(row);
                });

                document.getElementById('studentListPopup').style.display = 'flex';

                console.log("Danh sách học sinh hiển thị:", availableStudents);
            })
            .catch(error => console.error('Lỗi khi tải danh sách học sinh:', error));
    } catch (error) {
        console.error('Lỗi ngoài:', error);
    }
}

function closeStudentList() {
    document.getElementById('studentListPopup').style.display = 'none';
}

function filterStudentList() {
    let searchValue = document.getElementById("searchStudentInput").value.toLowerCase();
    let rows = document.querySelectorAll("#studentTable tbody tr");

    rows.forEach(row => {
        let studentName = row.cells[2].textContent.toLowerCase(); // Cột thứ 3 chứa tên học sinh
        if (studentName.includes(searchValue)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

function confirmSelectedStudents() {
    // Lưu danh sách ID học sinh đã chọn trước đó
    let previousSelected = [...selectedStudents];

    // Lấy tất cả checkbox đã được chọn
    const checkboxes = document.querySelectorAll("#studentTable tbody input[type='checkbox']:checked");

    // Cập nhật danh sách selectedStudents
    selectedStudents = Array.from(checkboxes).map(checkbox => checkbox.value);

    // Kiểm tra nếu không có học sinh nào được chọn
    if (selectedStudents.length === 0) {
        alert("❌ Vui lòng chọn ít nhất một học sinh!");
        return; // Dừng hàm, không đóng popup
    }

    // Hiển thị danh sách ID học sinh đã chọn vào textbox
    document.getElementById("selectedStudentsInput").value = selectedStudents.join(", ");

    console.log("✅ Danh sách ID học sinh đã chọn sau khi confirm:", selectedStudents);

    // Nếu có sự thay đổi, log ra console
    if (JSON.stringify(previousSelected) !== JSON.stringify(selectedStudents)) {
        console.log("🔄 Danh sách học sinh đã thay đổi!");
    }

    closeStudentList(); // Đóng dialog Select Students
}
