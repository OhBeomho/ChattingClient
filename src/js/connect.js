// let url = "http://nodejs-chatting.herokuapp.com";
let url = "http://localhost:5000";
let socket;

export const connect = () => {
    socket = io(url, {
        forceNew: true,
        transports: ["websocket"]
    });

    return socket;
}