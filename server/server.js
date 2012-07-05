var require = __meteor_bootstrap__.require,
    nodemailer = require('nodemailer');

Meteor.methods({
    'roomExists': function (name, moodleClass){
        var roomsResult = Rooms.findOne({userId:name, moodleClass:moodleClass});
        var whoTyping = { student:false, host:false };
        if (!roomsResult) {
            Fiber(function(){
                Rooms.insert({userId:name,moodleClass:moodleClass,active:true,unread:0,host:null,typing:whoTyping},function(error,result){  
                    var d = new Date();
                    var date = d.toDateString() + " " + d.toLocaleTimeString();  
                    Messages.insert({roomId: result , content: 'Thank you for accessing Southern Adventist University Online Campus Support, someone will be with you shortly.  You may begin by entering any questions here and our support staff will see them when they join you.', user: 'Online Support',role:'welcome',timestamp:date});
                });
            }).run();
        } else {
            Fiber(function(){
                Rooms.update({_id:roomsResult._id},{$set: {active:true}});
            }).run();
        }

    },
    'getRoomId': function(name,moodleClass){
        var roomsResults = Rooms.findOne({userId:name, moodleClass:moodleClass});
        return roomsResults._id;
    },
    'getUserInfo': function(roomId){
        return Rooms.findOne({_id: roomId});
    },
    'keepalive': function (roomId) {
        if (!Connections.findOne(roomId)) {
            Fiber(function(){
                Connections.insert({roomId:roomId});
            }).run();
        }
        Fiber(function(){
            Connections.update({roomId:roomId}, {$set: {last_active: (new Date()).getTime()}});
        }).run();
    },
    'hostCount': function () {
        return Hosts.find({}).count();
    },
    'calculateMac':function(params) {
        var mac = MD5(params + sersec);
        return mac;
    },
    'emailHistory': function (email,roomId) {
        var chatTranscript = generateHTMLChat(roomId);
            var transport = nodemailer.createTransport("sendmail", {
                path: "/usr/local/bin/sendmail",
                args: ["-f online@southern.edu"]
            });

            var mailOptions = {
                from: "online@southern.edu",
                to: email,
                subject: "Online Campus Suport - Chat Transcript",
                generateTextFromHTML: true,
                html: chatTranscript
            }
            console.log(mailOptions);
            console.log(chatTranscript);
            
            transport.sendMail(mailOptions);
    }
});

var generateHTMLChat = function(roomId) {
    var html = '<div id="emailBody"><ul style="list-style:none;margin:0px;padding:0px;width:650px;">';
    var messages = Messages.find({roomId:roomId,archived:null});
    for(message in messages) {
        html += '<li class="' + message.role + '" style="border-bottom:1px solid #CCC;padding:4px;">';
        if (message.role == 'host') {
            html += '<span style="color: #29642a;">';
        }
        html += '<strong>' + message.user + '</strong> <em>(' + message.timestamp + ')</em></span>: ' + message.content + '</li>';
    }

    html += '</ul></div>';

    return html;
}

Meteor.startup(function(){
    Meteor.setInterval(function () {
        var now = (new Date()).getTime();
        var deadConnections = Connections.find({last_active: {$lt: (now - 7 * 1000)}});
        deadConnections.forEach(function (connection) {
            Fiber(function(){
                Rooms.update({_id:connection.roomId},{$set: {active:false}});
            }).run();
        })
        var liveConnections = Connections.find({last_active: {$gt: (now - 7 * 1000)}});
        liveConnections.forEach(function (connection) {
            Fiber(function(){
                Rooms.update({_id:connection.roomId},{$set: {active:true}});
            }).run();
        })
    },5000);
});