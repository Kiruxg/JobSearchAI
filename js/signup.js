document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    
    try {
        await userAuth.signup(email, password, name);
        window.location.href = '/dashboard.html';
    } catch (error) {
        document.getElementById('error').textContent = error.message;
    }
}); 