


var message = 

fetch("http://34.122.217.188:5000/chat", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: "Hello from Chrome Extension" })
})
.then(response => response.json())
.then(data => console.log(data.response))
.catch(error => console.error("Error:", error));
