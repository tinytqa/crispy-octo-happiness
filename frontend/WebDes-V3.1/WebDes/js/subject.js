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
                <button class="btn btn-danger btn-sm" onclick="deleteSubject('${subject.sjId}')">Delete</button>
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
        alert('Please insert all information.');
        return;
    }

    // Tạo URL query string
    var queryString = `id=${encodeURIComponent(subjectId)}&name=${encodeURIComponent(subjectName)}`;

    // Gửi request POST để thêm môn học
    $.ajax({
        url: `${baseUrl}/insert?${queryString}`, 
        method: 'POST',
        success: function (response) {
            alert('New subject added succesfully!');
            loadData(); // Load lại danh sách môn học
            $('#subjectForm')[0].reset(); // Reset form nhập liệu
            hideAddForm(); // Ẩn popup thêm môn học
        },
        error: function (error) {
            alert('Error when adding new subject!');
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
    if (confirm('Confirming delete this subject?')) {
        $.ajax({
            url: `${baseUrl}/delete?id=${encodeURIComponent(subjectId)}`,
            method: 'DELETE',
            success: function (response) {
                alert('Subject deleted successfully!');
                loadData();
            },
            error: function (error) {
                alert('Error when delete subject!');
                console.error(error);
            }
        });
    }
}







