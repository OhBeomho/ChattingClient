let url = "http://nodejs-chatting.herokuapp.com";
let socket;

export const connect = () => {
    socket = io(url, {
        forceNew: true,
        transports: ["websocket"]
    });

    return socket;
}