
// demo-scripts.js
// Run with: node demo-scripts.js <command>

const URL = 'http://localhost:3000/api/auth/signup';

async function triggerRateLimit() {
    console.log("Sending requests to trigger rate limiting...");

    for (let i = 0; i < 15; i++) {
        try {
            const res = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            const data = await res.json().catch(() => null);

            console.log(`Request ${i + 1}: Status ${res.status}`);

            if (res.status === 429) {
                console.log("Rate limit triggered! 429 Too Many Requests received.");
                console.log("Server Response:", data);
                break;
            }

            if (data) {
                console.log("Server Response:", data);
            }

        } catch (error) {
            console.error(`Request ${i + 1} failed:`, error.message);
            break;
        }
    }
}

async function bypassClientValidation() {
    console.log("Sending raw HTTP POST bypassing the frontend...");

    const maliciousPayload = {
        name: "A",
        email: "invalid-email",
        password: "",
        terms: false
    };

    try {
        const res = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(maliciousPayload)
        });

        const data = await res.json().catch(() => null);

        console.log(`Server Status: ${res.status}`);
        console.log("Server Response:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("Request failed:", error.message);
    }
}

const command = process.argv[2];

if (command === 'rate-limit') {
    triggerRateLimit();
} else if (command === 'bypass') {
    bypassClientValidation();
} else {
    console.log("Usage: node demo-scripts.js <rate-limit|bypass>");
}
