document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();

    if (!username) {
        document.getElementById('error').innerText = 'Моля, въведете име.';
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        const result = await response.json();

        if (result.success) {
            window.location.href = result.redirectURL;
        } else {
            document.getElementById('error').innerText = result.message;
        }
    } catch (error) {
        document.getElementById('error').innerText = 'Грешка при влизане.';
    }
});
