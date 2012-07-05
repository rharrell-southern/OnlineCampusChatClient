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
            var transport = nodemailer.createTransport("SMTP", {
                host: "smtp.southern.edu", // hostname
                //secureConnection: true, // use SSL
                port: 587, // port for secure SMTP
                auth: emailUserInfo,
                debug: false
            });

            var mailOptions = {
                from: "rharrell@southern.edu",
                to: email,
                subject: "Online Campus Suport - Chat Transcript",
                generateTextFromHTML: true,
                html: chatTranscript
            }
            
            transport.sendMail(mailOptions, function(error,result){
                if (error) {
                    console.log("Error emailing! \n" + error);
                } else {
                    console.log('Email response successfull!  Response was: ' + result +'\nEmail to: ' + email + '\nEmail text: \n' + chatTranscript);
                }
            });
            return "Email Sending..."
    }
});

var generateHTMLChat = function(roomId) {
    var html = '<html><head><style>';
        html += '#messageList { width:650px; font-family:Geneva,sans-serif; font-size:13px; }';
        html += '#messageList table { margin: 0px; width:650px; }';
        html += '#messageList td { border-bottom:1px solid #CCC; padding:6px; }';
        html += '#messageList em { font-size:75%; }'
        html += '#messageList td.host strong, #messageList td.host em { color: #29642a; }';
        html += '#messageList td.student strong, #messageList td.student em { color: #0040D0; }';
    html += '</style></head><body><div id="messageList"><table width="650" cellpadding="6" halign="center" style="margin:0px;width:650px;">';
    var messages = Messages.find({roomId:roomId});
    messages.forEach(function(message) {
        if (message.content) {
            html += '<tr><td class="' + message.role + '" style="border-bottom:1px solid #CCC;padding:4px;">';
            if (message.role == 'host') {
                html += '<span style="color: #29642a;">';
            } else {
                html += '<span style="color: #0040D0;">';
            }
            html += '<strong>' + message.user + '</strong> <em>(' + message.timestamp + ')</em></span>: ' + message.content + '</td></tr>';
        }
    });

    html += '</table></div></body></html>';

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