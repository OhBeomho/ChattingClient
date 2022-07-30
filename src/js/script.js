import {
    connect
} from "./connect.js";

let myName = "";
let userList = [];
const messageList = document.getElementById("messageList");
const userListElement = document.getElementById("userList");

// 메시지 추가
function addChat(name, message, time) {
    const messageElementDOM = `<span class="pe-1 mw-75 d-flex flex-column align-items-center">
        <img class="rounded-pill" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" width="50" alt="Profile">
        <span id="name">${name}</span>
    </span>
    <span class="p-2 d-flex align-items-center">
        <span class="p-2 align-middle text-break chat-bubble ${name == myName ? "bg-primary" : "bg-secondary"} text-white" style="white-space: pre-wrap;">${message}</span>
    </span>
    <span class="ms-1 text-secondary small">
        ${time}
    </span>
    `;
    const messageElement = document.createElement("div");
    messageElement.classList.add("d-flex", "p-2", "align-items-end");
    messageElement.innerHTML = messageElementDOM;
    messageList.appendChild(messageElement);
    document.getElementById("messageListContainer").scrollTop = messageList.scrollHeight;
}

// 사용자 추가
function addUser(name) {
    const userElementDOM = `<span class="pe-1 mw-75 d-flex align-items-center">
        <img class="rounded-pill pe-1" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" width="50" alt="Profile">
        <span class="${name === myName ? "text-primary" : ""}" id="name">${name}</span>
    </span>
    `;
    const userElement = document.createElement("div");
    userElement.classList.add("list-group-item");
    userElement.id = name;
    userElement.innerHTML = userElementDOM;

    if (name !== myName) {
        userListElement.appendChild(userElement);
    } else {
        userListElement.prepend(userElement);
    }
}

// 사용자 제거
function removeUser(name) {
    document.querySelector("#userList #" + name).remove();
    userList = userList.slice(userList.indexOf(name), userList.indexOf(name) + 1);
}

// 서버 메시지 추가
function serverMessage(message) {
    const serverMessageElement = document.createElement("div");
    serverMessageElement.classList.add("text-secondary");
    serverMessageElement.innerText = message;
    messageList.appendChild(serverMessageElement);
    messageList.scrollTop = messageList.scrollHeight;
}

// 메시지 전송
function send(socket, message, channel) {
    if (message == "") {
        return;
    };

    socket.emit(channel, {
        name: myName,
        message
    });
}

window.onload = () => {
    const socket = connect();
    const inputMessage = document.getElementById("inputMessage");
    const inputName = document.getElementById("inputName");

    // 사용자명 중복검사 결과
    socket.on("name", message => {
        if (message === "EXISTS") {
            document.getElementById("error").innerText = "이미 존재하는 사용자명입니다.\n다른 이름으로 시도해 주세요.";
        } else if (message === "SUCCESS") {
            myName = inputName.value;
            inputName.value = "";

            document.getElementById("chatting").classList.remove("d-none");
            document.getElementById("chatting").classList.add("d-flex");
            document.getElementById("username").classList.add("d-none");

            enterChat();
        }
    });
    // 채팅 채널, 서버 채널 열기
    const enterChat = () => {
        document.getElementById("error").innerText = "";

        socket.on("chatting", data => {
            const {
                name,
                message,
                time
            } = data;
            addChat(name, message, time);
        });
        socket.on("server", data => {
            if (data.message === "JOIN") {
                addUser(data.name);
                userList.push(data.name);
                serverMessage(data.name + "님이 들어왔습니다.\n");

                document.getElementById("online").innerText = "온라인: " + userList.length;
            } else if (data.message === "LEAVE") {
                removeUser(data.name);
                serverMessage(data.name + "님이 나갔습니다.\n");
            } else if (data.message === "OLD_USERS") {
                userList = data.userList;

                for (let i = 0; i < userList.length; i++) {
                    addUser(userList[i]);
                }
            }

            document.getElementById("online").innerText = "온라인: " + userList.length;
        });
    }

    // 메시지 전송
    inputMessage.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            send(socket, inputMessage.value, "chatting");
            inputMessage.value = "";
            event.preventDefault();
        }
    });
    document.getElementById("sendButton").addEventListener("click", () => {
        send(socket, inputMessage.value, "chatting");
        inputMessage.value = "";
    });
    // 입력된 사용자명을 서버에 보내서 중복검사
    document.getElementById("enterButton").addEventListener("click", () => {
        send(socket, inputName.value, "name");
    });
}