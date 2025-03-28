// Đợi cho HTML tải xong
document.addEventListener('DOMContentLoaded', function() {
    // Lấy các phần tử DOM cần tương tác
    const userAvatar = document.getElementById('user-avatar');
    const accountDropdown = document.getElementById('account-dropdown');
    const navItems = document.querySelectorAll('.nav-item');
    const contentFrame = document.getElementById('content-frame');
    const contentHeader = document.querySelector('.content-header');

    // Toggle dropdown khi click vào avatar
    if (userAvatar && accountDropdown) {
        userAvatar.addEventListener('click', function() {
            accountDropdown.classList.toggle('show');
        });

        // Ẩn dropdown khi click ra ngoài
        document.addEventListener('click', function(event) {
            if (!userAvatar.contains(event.target) && !accountDropdown.contains(event.target)) {
                accountDropdown.classList.remove('show');
            }
        });
    }

    // Xử lý khi click vào các mục menu
    if (navItems.length > 0 && contentFrame && contentHeader) {
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                // Loại bỏ active từ tất cả các mục
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Thêm active cho mục được click
                this.classList.add('active');
                
                // Lấy thông tin page và icon từ data attributes
                const page = this.getAttribute('data-page');
                
                // Cập nhật iframe source
                contentFrame.src = page;
                
                // Cập nhật tiêu đề và icon
                const iconElement = this.querySelector('i').cloneNode(true);
                const text = this.querySelector('span').textContent.trim();
                
                // Xóa nội dung cũ của content-header
                contentHeader.innerHTML = '';
                
                // Thêm icon và text mới
                contentHeader.appendChild(iconElement);
                contentHeader.appendChild(document.createTextNode(' ' + text));
            });
        });
    }

    // Lắng nghe thông điệp từ iframe - hệ thống chọn lớp học
    window.addEventListener('message', function(event) {
        if (event.data && event.data.action === 'selectClass') {
            // Tìm và kích hoạt tab nhập điểm
            const nhadiemNavItem = document.querySelector('.nav-item[data-page="nhapdiem.html"]');
            if (nhadiemNavItem) {
                // Trigger click event để chuyển tab
                nhadiemNavItem.click();
                
                // Lưu thông tin lớp được chọn để gửi đến iframe quản lý điểm số
                const selectedClass = event.data.className;
                
                // Gửi thông tin lớp được chọn đến iframe quản lý điểm số
                setTimeout(function() {
                    if (contentFrame && contentFrame.contentWindow) {
                        contentFrame.contentWindow.postMessage({
                            action: 'updateClassName',
                            className: selectedClass
                        }, '*');
                    }
                }, 500); // Đợi iframe load xong
            }
        }
    });
});

// Đây là hàm được gọi từ lophoc.html
function openClassDetails(className) {
    // Gửi thông tin lớp được chọn lên trang cha
    window.parent.postMessage({
        action: 'selectClass',
        className: className
    }, '*');
}
document.addEventListener('DOMContentLoaded', function() {
    // Lấy thông tin người dùng từ localStorage
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
        const user = JSON.parse(userInfo);

        // Hiển thị tên và vai trò lên giao diện
        document.querySelector('.user-name').textContent = user.name;
        document.querySelector('.user-role').textContent = user.role === "teacher" ? "Giáo viên" : user.role;
    } else {
        // Nếu chưa đăng nhập, hiển thị thông báo mặc định
        document.querySelector('.user-name').textContent = "Chưa đăng nhập";
        document.querySelector('.user-role').textContent = "";
    }
});
function logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userInfo');
    window.location.href = "../../../WebDes-V3.1/WebDes/login.html"; // Điều hướng về trang đăng nhập
    console.log(window.location.href);
console.log(window.location.pathname);
}
