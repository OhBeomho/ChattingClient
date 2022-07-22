import {
    connect
} from "./connect.js"

let my_name = ""
const message_list = document.querySelector("#message_list")

function addChat(name, message, time) {
    const message_span_html = `<span class="p-2 d-flex flex-column align-items-center">
        <img class="rounded-pill flex-grow-1" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" width="50" alt="Profile">
        <span class="p-1" id="name">${name}</span>
    </span>
    <span class="p-2 align-middle chat-bubble ${name == my_name ? "bg-primary" : "bg-secondary"} text-white">
        ${message}
    </span>
    <span class="ms-1 text-secondary small">
         ${time}
    </span>`
    const message_span = document.createElement("span")
    message_span.classList.add("list-group-item", "d-flex", "p-2", "align-items-center")
    message_span.innerHTML = message_span_html
    message_list.appendChild(message_span)
    document.querySelector("#chatting_container").scrollTop = message_list.scrollHeight
}

function send(socket, message, channel) {
    if (message == "") {
        return
    }

    socket.emit(channel, {
        name: my_name,
        message
    })
}

window.onload = () => {
    const socket = connect()
    if (socket.connected) console.log("Connected")
    const input_message = document.querySelector("#input_message")
    const input_name = document.querySelector("#input_name")

    socket.on("name", message => {
        if (message == "EXISTS") {
            alert("이미 존재하는 사용자명입니다.\n다른 이름으로 시도해 주세요.")
        } else if (message == "SUCCESS") {
            my_name = input_name.value
            input_name.value = ""

            document.querySelector("#chatting").classList.remove("d-none")
            document.querySelector("#chatting").classList.add("d-flex")
            document.querySelector("#username").classList.add("d-none")

            socket.on("chatting", data => {
                const {
                    name,
                    message,
                    time
                } = data
                addChat(name, message, time)
            })
            socket.on("server", message => {
                const server_message_span = document.createElement("span")
                server_message_span.classList.add("list-group-item", "text-secondary")
                server_message_span.innerText = message
                message_list.appendChild(server_message_span)
            })
        }
    })

    input_message.addEventListener("keydown", event => {
        if (event.key == "Enter" && !event.shiftKey) {
            send(socket, input_message.value, "chatting")
            input_message.value = ""
            event.preventDefault()
        }
    })
    document.querySelector("#btn_send").addEventListener("click", () => {
        send(socket, input_message.value, "chatting")
        input_message.value = ""
    })
    document.querySelector("#btn_enter").addEventListener("click", () => {
        send(socket, input_name.value, "name")
    })
}