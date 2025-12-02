const login = async () => {
  try {
    console.log('Testing login to http://localhost:3000/api/auth/login...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@portal.com', password: 'admin123' })
    });
    
    console.log('Status:', response.status);
    if (response.ok) {
        const data = await response.json();
        console.log('Login Successful!');
        console.log('Token received:', !!data.access_token);
    } else {
        const text = await response.text();
        console.log('Login Failed:', text);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
login();
