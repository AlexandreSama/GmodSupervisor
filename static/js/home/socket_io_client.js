const socket = io("http://92.131.75.207:3005");

socket.on('playerArrest', (data) => {
    console.log(data)
})
socket.on('playerChangeName', (data) => {
    console.log(data)
})
socket.on('playerGetSalary', (data) => {
    console.log(data)
})
socket.on('playerPickMoney', (data) => {
    console.log(data)
})

console.log(location)