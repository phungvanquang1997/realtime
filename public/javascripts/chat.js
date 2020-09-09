var currentUser = () => {
    return $('#user_id').val();
}

var toUser = () => {
    return $( "#users option:selected" ).val();
}

var createRoomName = (userId, toUserId) => {
    if (userId > toUserId) {
        return userId + '_' + toUserId;
    } else {
        return toUserId + '_' + userId;
    }
}

$(document).ready(function() {
    $('#action_menu_btn').click(function () {
        $('.action_menu').toggle();
    });

    var timeout;
    var socket = io.connect("http://localhost:3001");

    function timeoutFunction() {
        socket.emit("typing", {'room': $('#room').val(), 'type': false});
    }

    socket.on('connect', async () => {
        socket.emit('login', ({user_id: currentUser()}));
    });

    //create chat connection
    $('#user_selection').click(function () {
        let userId = 1;
        let toUserId = 2;
    })

    socket.on('joinToChat', (data) => {
        let userId = currentUser();
        //chung room là listen dc
        if (data.sender && data.to_user === userId) {
            socket.emit('join_room', data.room)
        }
    })

    let buildHTMLMessageSender = (message, isSender) => {
        if (!isSender) {
            var html = "<div class=\"d-flex justify-content-start mb-4\">\n" +
                "\t<div class=\"img_cont_msg\">\n" +
                "\t\t<img src=\"https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg\" class=\"rounded-circle user_img_msg\">\n" +
                "\t</div>\n" +
                "\t<div class=\"msg_cotainer\">\n" +
                message +
                "\t\t<span class=\"msg_time\">8:40 AM, Today</span>\n" +
                "\t</div>\n" +
                "</div>"
        } else {
            var html = "<div class=\"d-flex justify-content-end mb-4\">\n" +
                "\t<div class=\"msg_cotainer_send\">\n" +
                message +
                "\t\t<span class=\"msg_time_send\">8:55 AM, Today</span>\n" +
                "\t</div>\n" +
                "\t<div class=\"img_cont_msg\">\n" +
                "<img src=\"https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg\" class=\"rounded-circle user_img_msg\">\n" +
                "\t</div>\n" +
                "</div>"
        }
        return html;
    }

    //join 1 channel / room là một user_id
    $('#send_message').click(function () {
        let userId = currentUser();
        //chung room là listen dc
        let toUserId = toUser();
        let room = createRoomName(userId, toUserId);
        let message = $('#message').val();

        $('#chat_frame').append(buildHTMLMessageSender(message, true))

        socket.emit('createChatRoom', {'sender': userId, 'room': room, 'to_user': toUserId});
        socket.emit('sendMessage', {'sender': userId, 'room': room, 'message' : message})
    })

    socket.on('receiveMessage', (data) => {
        console.log(data);
        if (data.message) {
            let html = '<p>';
            html += data.message;
            html += '</p>';

            $('#show_messages').append(html);
            $('#chat_frame').append(buildHTMLMessageSender(data.message, false))
        }
    });
    ////

    $('#chat-with-someone').keyup(() => {
        socket.emit('chatWithSomeone', {'sender': $('#username').val(), 'to': $('#chat-with-someone').val() });
    });

    socket.on('chatWithSomeone', (data) => {
        if (data.sender && data.to === $('#username').val()) {
            socket.emit('join_room', data.sender);
        }
    });

    socket.on('totalOnline', (total) => {
        console.log('tổng số người đang online: ' + total)
    });

    socket.on('userOnline', async (userId) => {

    });

    socket.on('userOffline', async (userId) => {

    });

    $('#message').keyup(() => {
        socket.emit('typing', {'room': $('#room').val(), 'user': $('#username').val(), 'type': true})
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 2000);
    });


    $('#message1').keyup(() => {
        socket.emit('typing', {'room': $('#username').val(), 'user': $('#username').val(), 'type': true})
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 2000);
    });

    $('#room').keyup(() => {
        socket.emit('join_room', $('#room').val());
    })

    socket.on('display', (data) => {
        console.log(data);
        if (data.type) {
            $('.typing').removeClass('hidden').addClass('visible');
            //$('.typing').text(`${data.user} is typing...`)
        } else {
            $('.typing').removeClass('visible').addClass('hidden');
            //$('.typing').text("");
        }
    })

    socket.on('message', (data) => {
        console.log(data);
    })

    socket.on('error', function (err) {
        console.log(err);
    });
});
