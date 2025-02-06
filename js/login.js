document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        await userAuth.login(email, password);
        window.location.href = '/dashboard.html';
    } catch (error) {
        document.getElementById('error').textContent = error.message;
    }
}); 