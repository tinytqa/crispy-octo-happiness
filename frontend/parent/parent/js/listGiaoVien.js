// Base URL (change this only in one place)
const baseUrl = "https://localhost:7241/api"; // Change this to your actual base API URL

$(document).ready(function () {

    // Function to fetch class names by parent ID
    async function fetchClassNamesByParent(parentId) {
        try {
            const response = await fetch(`${baseUrl}/Student/classnameByParent?parentId=${encodeURIComponent(parentId)}`);
            
            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg);
            }
    
            const data = await response.json();
    
            // Extract class names into a plain array of strings
            const classNames = data.map(item => item.className);
    
            console.log("Class Names:", classNames);
            return classNames;
        } catch (error) {
            console.error("Error fetching class names:", error.message);
            return [];
        }
    }

    // Call the function and handle the returned promise
    async function loadTeachersForParent(parentId) {
        const classNames = await fetchClassNamesByParent(parentId);

        if (classNames.length === 0) {
            $("#teacherList").append("<tr><td colspan='5'>Không có lớp nào cho phụ huynh này.</td></tr>");
            return;
        }

        // Clear the table before appending new data
        const tableBody = $("#teacherList");
        tableBody.empty();

        classNames.forEach(className => {
            fetch(`${baseUrl}/Teacher/showTeacherForParent?className=${encodeURIComponent(className)}`)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok.");
                return response.json();
            })
            .then(data => {
                if (data.length === 0) {
                    tableBody.append("<tr><td colspan='5'>Không có giáo viên nào cho lớp này.</td></tr>");
                    return;
                }

                data.forEach(teacher => {
                    const subjectNames = teacher.subjects.map(sub => sub.sjName).join(", ");
                    const row = `
                        <tr>
                            <td>${className}</td>
                            <td>${teacher.tId}</td>
                            <td>${teacher.tName}</td>
                            <td>${teacher.tPhone}</td>
                            <td>${subjectNames}</td>
                        </tr>`;
                    tableBody.append(row);
                });
            })
            .catch(error => {
                console.error("Fetch error:", error);
                tableBody.append("<tr><td colspan='4'>Đã xảy ra lỗi khi tải dữ liệu.</td></tr>");
            });
        });
    }

    // Call the function with a specific parent ID
    loadTeachersForParent(JSON.parse(localStorage.getItem("userInfo")).id);
});
