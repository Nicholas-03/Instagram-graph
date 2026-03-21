const ADDRESS = 'http://127.0.0.1:3000'

const input = document.getElementById('jobInput')
const button = document.getElementById('sendBtn')

async function sendJob(username) {
	const response = await fetch(`${ADDRESS}/job`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: username
		})
	});

	if (!response.ok) {
		throw new Error(`HTTP error: ${response.status}`);
	}

	const data = await response.json();
	console.log(data)
	return data;
}

button.addEventListener('click', () => {
    sendJob(input.value)
  });