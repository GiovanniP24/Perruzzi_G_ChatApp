// imports will always go at the top
import ChatMsg from './components/ChatMessage.js';

const socket = io();

// utility functions for socket
function setUserID({ sID }) {
    // save our unique ID generated by Socket on the server side - this is how we track individual connections to the chat service
    vm.socketID = sID;
}

function showNewMessage({ message }) {
    // debugger;
    vm.messages.push(message);
}

function handleUserTyping(user) {
    console.log('somebody is typing something');
}

const { createApp } = Vue

const vm = createApp({
    data() {
        return {
            socketID: '',
            message: '',
            messages: [],
            nickname: ''
        }
    },

    methods: {
        dispatchMessage() {
            socket.emit('chat_message', {
                content: this.message,
                name: this.nickname || 'anonymous',
                id: this.socketID
            })

            this.message = "";
        },

        catchTextFocus() {
            const user = { name: this.nickname || 'anonymous' };
            socket.emit('user_typing', user);
            this.handleUserTyping(user);
        },

        handleUserTyping(user) {
            const popup = document.createElement('div');
            popup.textContent = `${user.name} is typing something...`;
            popup.classList.add('popup');
            document.body.appendChild(popup);
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 2000);
        }
    },

    components: {
        newmsg: ChatMsg
    }

}).mount('#app')

const disconnectedElement = document.getElementById('disconnected');
socket.on('user_disconnect', (data) => {
    console.log(`User ${data.sID} has disconnected.`);
    disconnectedElement.style.display = 'block';
});

socket.on('connect', () => {
    console.log(`Connected: ${socket.id}`);
    disconnectedElement.style.display = 'none';
});

socket.on('connect_error', (err) => {
    console.error(`Connection error: ${err.message}`);
    disconnectedElement.style.display = 'block';
});

socket.addEventListener('connected', setUserID);
socket.addEventListener('new_message', showNewMessage);
socket.addEventListener('typing', handleUserTyping);