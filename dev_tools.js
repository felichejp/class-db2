fetch('http://localhost:3000/api/ways/points', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ wayId: 123456789 })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));