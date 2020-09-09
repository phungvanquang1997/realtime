$(document).ready(function() {
    $('#action_menu_btn').click(function () {
        $('.action_menu').toggle();
    });

    var timeout;
    var socket = io.connect("http://localhost:3001");

    socket.on('connect', async () => {
        socket.emit('login', ({user_id: 1}));
    });

    socket.on('totalOnline', (total) => {
        console.log('tổng số người đang online: ' + total)
    });

    socket.on('userOnline', async (userId) => {

    });

    socket.on('userOffline', async (userId) => {

    });

    function timeoutFunction() {
        socket.emit("typing", {'room': $('#room').val(), 'type': false});
    }

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

    $('#chat-with-someone').keyup(() => {
       socket.emit('chatWithSomeone', {'sender': $('#username').val(), 'to': $('#chat-with-someone').val() });
    });

    socket.on('chat-with-someone', (data) => {
       if (data.sender && data.to === $('#username').val()) {
           socket.emit('join_room', data.sender);
       }
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
