var currentUser = () => {
    return $('#user_id').val();
}

var toUser = () => {
    return $("#to_user_id").val();
}

var fixedHeight = () => {
    return 100000;
}

var createRoomName = (userId, toUserId) => {
    if (userId > toUserId) {
        return userId + '_' + toUserId;
    } else {
        return toUserId + '_' + userId;
    }
}

var getRoom =  () => {
    return createRoomName(currentUser(), toUser());
}

var clearMessage = () => {
    $('#message').val('');
}

var buildHTMLMessageSender = (message, isSender) => {
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
            "\t<div class=\"msg_cotainer_send\">" +
            message +
            "<span class=\"msg_time_send\">9:10 AM, Today</span>\n" +
            "\t</div>\n" +
            "\t<div class=\"img_cont_msg\">\n" +
            "\t\t<img src=\"https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg\" class=\"rounded-circle user_img_msg\">\n" +
            "\t</div>\n" +
            "</div>"
    }
    return html;
}

var buildUserOnline = (userId, userName) => {
    return "<li class=\"delegate\" value='" + userId + "'>\n" +
        "<div class=\"d-flex bd-highlight\">\n" +
        "<div class=\"img_cont\">\n" +
        "<img src=\"https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg\" class=\"rounded-circle user_img\">\n" +
        "<span class=\"online_icon\"></span>\n" +
        "</div>\n" +
        "<div class=\"user_info\">\n" +
        "<span>" +
        userName +
        "</span>\n" +
        "<p id='user_" + userId + "'>" + userName + " is online</p>" +
        "<input class='hidden' id='name_of_" + userId + "' value='" + userName + "'>" +
        "</div>\n" +
        "</div>\n" +
        "</li>"
}

var addUserOnline = (userId, userName) => {
    if (userId !== currentUser()) {
        $('#user_list').append(buildUserOnline(userId, userName))
    }
}

$(document).ready(function() {
    $('#action_menu_btn').click(function () {
        $('.action_menu').toggle();
    });

    var timeout;
    var socket = io({transports: ['websocket'], upgrade: false});

    function timeoutFunction() {
        socket.emit("typing", {'room': getRoom(), 'type': false});
    }

    function makeUserId(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    socket.on('connect', async () => {
        let userId = makeUserId(5)
        let userName = $('#user_name').val();
        $('#user_id').val(userId)
       // $('#user_name').val(userName)

        socket.emit('login', ({user_id: userId, user_name: userName}))
    });

    socket.on('joinToChat', (data) => {
        let userId = currentUser();
        //chung room là listen dc
        if (data.sender && data.to_user === userId) {
            socket.emit('join_room', data.room)
        }
    })

    $('#user_list').on('click', '.delegate', function () {
        let toUserId = ($(this)).attr('value');
        let toUserName = $('#name_of_' + toUserId).val();
        $(this).find('.text-danger').remove();
        $('#to_user_name').html(toUserName)
        $('#to_user_id').val(toUserId)
        $('#user_list li').removeClass('active')
        $(this).addClass('active')
        $('#window').removeClass('hidden').addClass('visiable')

    })


    //join 1 channel / room là một user_id
    $('#send_message').on('click', function () {
        let userId = currentUser();
        //chung room là listen dc
        let toUserId = toUser();
        let room = createRoomName(userId, toUserId);
        let message = $('#message').val();

        $('#chat_frame').append(buildHTMLMessageSender(message, true))

        socket.emit('createChatRoom', {'sender': userId, 'room': room, 'to_user': toUserId});
        socket.emit('sendMessage', {'sender': userId, 'room': room, 'message' : message})
        clearMessage();
        $('#chat_frame').scrollTop(fixedHeight());
    })

    var input = $('#message')[0];
    input.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            $('#send_message').click();
        }
    });

    socket.on('receiveMessage', (data) => {
        console.log(data);
        if (data.message) {
            $('#user_list li').each(function()  {
                let userId = $(this).attr('value');
                if (userId == data.sender) {
                    if ($(this).find('.text-danger').length === 0) {
                        $(this).find('.user_info').append('<p class="text-danger bold font-12">Bạn có một thông báo mới</p>')
                    }
                }
            });

            $('#chat_frame').append(buildHTMLMessageSender(data.message, false))
            //$('#chat_frame').scrollTop(fixedHeight());
        }
    });
    ////


    socket.on('totalOnline', (total) => {
        console.log('tổng số người đang online: ' + total)
        $('#total').html(total)
    });

    socket.on('userOnline',  (usersOnline) => {
        console.log(usersOnline);
        usersOnline.forEach(function (user) {
            addUserOnline(user.user_id, user.user_name)
        })
    });

    socket.on('userOffline', async (user) => {
        console.log(user);
        $('#user_' + user.user_id).html("<p class='text-warning'>" + user.user_name + ' is offline' + "</p>")
    });

    $('#message').keyup(() => {
        let userId = currentUser();
        //chung room là listen dc
        let toUserId = toUser();
        let room = createRoomName(userId, toUserId);
        let userName = $('#user_name').val();
        socket.emit('typing', {'room': room, 'user_name': userName, 'type': true})
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 2000);
    });


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
