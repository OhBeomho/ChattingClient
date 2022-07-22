const options = {
    "forceNew": true
}
const url = "http://nodejs-anonymous-chatting.herokuapp.com"
let socket

export const connect = () => {
    socket = io(url, options)
    return socket
}