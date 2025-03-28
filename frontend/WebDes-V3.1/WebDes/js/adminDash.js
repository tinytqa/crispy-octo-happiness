/**
 * File: main.js
 * Chứa tất cả các chức năng JavaScript cho hệ thống quản lý giáo dục
 */

// Đợi cho đến khi DOM được tải hoàn toàn
document.addEventListener('DOMContentLoaded', function() {
    // Khai báo các biến DOM cần thiết
    const iframe = document.getElementById('content-frame');
    const contentHeader = document.querySelector('.content-header');
    const menuItems = document.querySelectorAll('.nav-item');
    const userAvatar = document.getElementById('user-avatar');
    const accountDropdown = document.getElementById('account-dropdown');
    
    // ==============================================
    // CHỨC NĂNG ĐIỀU HƯỚNG MENU CHÍNH
    // ==============================================
    
    /**
     * Xử lý sự kiện click trên các mục menu
     * Cập nhật trạng thái active, cập nhật tiêu đề trang
     * và thay đổi nội dung iframe
     */
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Xóa trạng thái active từ tất cả các menu items
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Thêm trạng thái active cho item được click
            this.classList.add('active');
            
            // Lấy tên trang và icon
            const pageTitle = this.querySelector('span').textContent;
            const iconClass = this.querySelector('i').className;
            
            // Cập nhật tiêu đề trang và icon
            contentHeader.innerHTML = `<i class="${iconClass}"></i> ${pageTitle}`;
            
            // Cập nhật src của iframe để load trang mới
            const page = this.getAttribute('data-page');
            iframe.src = page;
        });
    });
    
    // ==============================================
    // CHỨC NĂNG DROPDOWN MENU TÀI KHOẢN
    // ==============================================
    
    /**
     * Xử lý hiển thị/ẩn dropdown khi click vào avatar
     */
    userAvatar.addEventListener('click', function(e) {
        accountDropdown.classList.toggle('show');
        e.stopPropagation(); // Ngăn không cho sự kiện lan ra document
    });
    
    /**
     * Ẩn dropdown khi click ra ngoài
     */
    document.addEventListener('click', function(e) {
        if (!userAvatar.contains(e.target) && !accountDropdown.contains(e.target)) {
            accountDropdown.classList.remove('show');
        }
    });
    
    // ==============================================
    // KHỞI TẠO BAN ĐẦU
    // ==============================================
    
    /**
     * Khởi tạo ban đầu - có thể thêm các chức năng khởi tạo khác ở đây
     * Ví dụ: kiểm tra phiên đăng nhập, cài đặt giao diện, v.v.
     */
    function init() {
        console.log('Ứng dụng quản lý giáo dục đã được khởi tạo');
        // Có thể thêm các chức năng khởi tạo khác ở đây
    }
    
    // Gọi hàm khởi tạo
    init();
});