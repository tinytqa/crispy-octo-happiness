const baseUrl = "https://localhost:7241/api/Subject";

subjectsData = []
$(document).ready(function () {
    loadData();
});
function loadData() {
    $.ajax({
        url: `${baseUrl}/show`,
        method: 'GET',
        success: function (data) {
            subjectsData = data;
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
    data.forEach((subject) => {
        html += `
        <tr> 
            <td>${subject.sjId}</td>
            <td>${subject.sjName}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteSubject('${subject.sjId}')">Xóa</button>
            </td>
        </tr>
        `;
    });
    $('#subjectList').html(html);
}


function addSubject() {
    var subjectId = $('#sbID').val();
    var subjectName = $('#sbName').val();

    // Kiểm tra thông tin đầu vào
    if (!subjectId || !subjectName) {
        alert('Vui lòng điền đầy đủ thông tin.');
        return;
    }

    // Tạo URL query string
    var queryString = `id=${encodeURIComponent(subjectId)}&name=${encodeURIComponent(subjectName)}`;

    // Gửi request POST để thêm môn học
    $.ajax({
        url: `${baseUrl}/insert?${queryString}`, 
        method: 'POST',
        success: function (response) {
            alert('Thêm môn học thành công!');
            loadData(); // Load lại danh sách môn học
            $('#subjectForm')[0].reset(); // Reset form nhập liệu
            hideAddForm(); // Ẩn popup thêm môn học
        },
        error: function (error) {
            alert('Lỗi khi thêm môn học.');
            console.error(error);
        }
    });
}

function showAddForm() {
    document.getElementById('addSubjectPopup').style.display = 'flex';
}

function hideAddForm() {
    document.getElementById('addSubjectPopup').style.display = 'none';
}




function deleteSubject(subjectId) {
    if (confirm('Bạn có chắc muốn xóa môn học này?')) {
        $.ajax({
            url: `${baseUrl}/delete?id=${encodeURIComponent(subjectId)}`,
            method: 'DELETE',
            success: function (response) {
                alert('Xóa thành công!');
                loadData();
            },
            error: function (error) {
                alert('Lỗi khi xóa môn học');
                console.error(error);
            }
        });
    }
}







