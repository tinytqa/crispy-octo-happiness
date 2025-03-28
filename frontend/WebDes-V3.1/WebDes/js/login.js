var baseurl = "https://localhost:7241/api/Login/";

document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const loginForm = document.getElementById('loginForm');
    const phoneInput = document.getElementById('phone');
    const phoneField = document.getElementById('phoneField');
    const phoneError = document.getElementById('phoneError');
    const passwordField = document.getElementById('passwordField');
    const passwordError = document.getElementById('passwordError');
    const successMessage = document.getElementById('successMessage');

    togglePassword.addEventListener('click', function() {
        if (password.type === "password") {
            password.type = "text";
            togglePassword.className = "toggle-password eye-icon-closed";
        } else {
            password.type = "password";
            togglePassword.className = "toggle-password eye-icon-open";
        }
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;

        // Validate phone number and password fields
        if (!phoneInput.value.trim()) {
            phoneField.classList.add('error');
            phoneError.classList.add('visible');
            isValid = false;
        } else {
            phoneField.classList.remove('error');
            phoneError.classList.remove('visible');
        }

        if (!password.value.trim()) {
            passwordField.classList.add('error');
            passwordError.classList.add('visible');
            isValid = false;
        } else {
            passwordField.classList.remove('error');
            passwordError.classList.remove('visible');
        }

        if (isValid) {
            loginButton.classList.add('loading');
            loginButton.innerHTML = '<span class="login-icon"></span> Đang đăng nhập...';

            // Get phone and password values
            const phone = phoneInput.value.trim();
            const pass = password.value.trim();
            const role = document.getElementById('role').value; // Get the selected role

            // Determine the login URL based on the selected role
            let loginUrl = '';
            if (role === 'admin') {
                loginUrl = baseurl + 'loginAdmin?email=' + encodeURIComponent(phone) + '&password=' + encodeURIComponent(pass);
            } else if (role === 'parent') {
                loginUrl = baseurl + 'loginParent?email=' + encodeURIComponent(phone) + '&password=' + encodeURIComponent(pass);
            } else if (role === 'teacher') {
                loginUrl = baseurl + 'loginTeacher?email=' + encodeURIComponent(phone) + '&password=' + encodeURIComponent(pass);
            }

            // Send GET request to the back-end
            fetch(loginUrl, {
                method: 'GET',  // Use GET as the controller expects query parameters
                headers: {
                    'Content-Type': 'application/json'  // Optional, not needed for GET requests
                }
            })
            .then(response => response.json())
            .then(data => {
                loginButton.classList.remove('loading');
                loginButton.innerHTML = '<span class="login-icon"></span> Đăng nhập';
            
                if (data.token) {
                    // Lưu token vào localStorage
                    localStorage.setItem('jwtToken', data.token);
            
                    // Lưu thông tin người dùng vào localStorage
                    localStorage.setItem('userInfo', JSON.stringify({
                        id: data.teacher.id,
                        name: data.teacher.name,
                        phone: data.teacher.phone,
                        role: role // Giá trị role lấy từ select box
                    }));
            
                    // Hiển thị thông báo thành công
                    successMessage.classList.add('visible');
            
                    // Chuyển hướng đến trang dashboard
                    setTimeout(function() {
                        if (role === "admin") {
                            window.location.href = "adminDash.html";
                        } else if (role === "teacher") {
                            window.location.href = "/teacher2/teacher2/teacherTab.html";
                        } else if (role === "parent") {
                            window.location.href = "/parent/parent/parentTab.html";
                        }
                    }, 1000);
                } else {
                    alert('Đăng nhập thất bại: ' + data.msg);
                }
            })
            
            .catch(error => {
                loginButton.classList.remove('loading');
                loginButton.innerHTML = '<span class="login-icon"></span> Đăng nhập';
                alert('Lỗi kết nối: ' + error.message);
            });
        }
    });

    phoneInput.addEventListener('input', function() {
        if (this.value.trim()) {
            phoneField.classList.remove('error');
            phoneError.classList.remove('visible');
        }
    });

    password.addEventListener('input', function() {
        if (this.value.trim()) {
            passwordField.classList.remove('error');
            passwordError.classList.remove('visible');
        }
    });

    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            if (!this.value.trim() && this.required) {
                this.parentElement.classList.add('error');
                if (this.id === 'phone') {
                    phoneError.classList.add('visible');
                } else if (this.id === 'password') {
                    passwordError.classList.add('visible');
                }
            }
        });
    });
});
