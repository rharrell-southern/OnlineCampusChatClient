document.title = 'Southern Online Campus - Support Chat';
var id = grabUrlVars('id',window.location.href);
var moodleClass = grabUrlVars('class',window.location.href);
var role = grabUrlVars('role',window.location.href);
var mac = grabUrlVars('mac',window.location.href);
var email = grabUrlVars('email',window.location.href);
var pop = new Audio("pop.wav");
var ring = new Audio("ring.wav");

Meteor.subscribe('rooms');
Meteor.subscribe('hosts');

function isTyping(typing) {
    var whoTyping = {};
    var current = Rooms.findOne({_id:Session.get('roomId')});
    if (current.typing) {
        whoTyping = { student: current.typing['student'], host: current.typing['host'] };
    } else {
        whoTyping = { student:false, host:false };
    }
    whoTyping[role] = typing;
    Rooms.update({_id:Session.get('roomId')},{ $set : { typing: whoTyping } });
}

function submitChat() {
    var roomId = Session.get('roomId');
    var content = $('#input').val();
    var d = new Date();
    var messagetime = d.getTime();
    var date = d.toDateString() + " " + d.toLocaleTimeString();
    if(content.length > 0)
    {
        Messages.insert({roomId: roomId , content: content, user: getUser(),role:role,messagetime:messagetime ,date:date,archived:null});
        if(role == 'host') {
            Rooms.update({_id:roomId},{$set: { unread:0 }});
        } else if (role == 'student') {
            var data = Rooms.findOne({_id:roomId});
            if(data) {
                var count = data.unread;
                count++;
                Rooms.update({_id:roomId},{$set:{unread:count}});
            }
        }
    }
    $('#input').val('');
    $('#input').focus();
}

function getUser(){
    if(role=='student'){
        return id;
    }
    else{
        return Meteor.user().name;
    }
}

function getStudent() {
    return id;
}

function playUnreadSound (roomId, unread) {
    if (!Session.get(roomId+'UnreadCount')) {
        Session.set(roomId+'UnreadCount', 0);
    }
    if (unread > Session.get(roomId+'UnreadCount')) {
        pop.play();
        Session.set(roomId+'UnreadCount', unread);
    }
}

Template.ChatBody.subscribe = function() {
    Meteor.autosubscribe(function(){
        Meteor.subscribe("messages", Session.get('roomId'));
    });
}

Template.MessageList.messages = function() {
    return Messages.find({},{sort:{messagetime:1}});
};

Template.AddMessage.events = {
    'submit': function (event) {
        event.preventDefault();
        submitChat();

    },
    'keypress':function(event){
        if (event.which == '13'){
            event.preventDefault();
            submitChat();
        }
        isTyping(true);
    },
    'keyup':function(event){
        Meteor.setTimeout(function(){
            isTyping(false);
        }, 3000);
    }

};

Template.auth.events = {
    'click #googleAuth': function (){
        alert("Clicked!")
        if(Meteor.user()) {
            var hostId = Hosts.findOne({email:Meteor.user().emails[0]});
            Meteor.logout(function (){
                Hosts.remove({_id:hostId._id});
            });
        } else {
            Meteor.loginWithGoogle(function(){
                var host = Hosts.findOne({email:Meteor.user().emails[0]});
                alert(Meteor.user().emails[0]);
                if(host === undefined) {
                    Hosts.insert({host:Meteor.user().name,email:Meteor.user().emails[0]});
                }
            });
        }
    },
    'click #showHideInactive' :function () {
        if ($('#showHideInactive').text() == "Hide Inactive") {
            $('li.false').css('display','none');
            $('#showHideInactive').text('Show Inactive');
        } else if ($('#showHideInactive').text() == "Show Inactive") {
            $('li.false').css('display','block');
            $('#showHideInactive').text('Hide Inactive');

        }
    },
    'click #archiveEmail': function (){
        Meteor.call('emailHistory', email, Session.get('roomId'), function(error, result){
            alert(result);
        });
    },
    'click #archiveHide': function (){
        if($('#css').html()) {
            $('#css').html('');
            $('#archiveHide').html('Hide Archived');
        } else {
            $('#css').html('<style>.archived { display:none !important; }</style>');
            $('#archiveHide').html('Show Archived');
        }
    }
};

Template.auth.isHost = function () {
    if(role == 'host') {
        return true;
    } else {
        return false;
    }
};

Template.StudentChatInfo.roomId = function() {
    return Session.get('roomId');
}
Meteor.startup(function(){
    if (role == "student") {
        var sip = null;
        Meteor.http.call("GET",'http://marr.southern.edu/apps/jsonip/',function(error, result){
            console.log(result);
            if (result.statusCode === 200) {
                sip = result.data.ip;
                Meteor.call('calculateMac',sip ,function(error, result){
                    if (result == mac) {
                        Meteor.call('roomExists',id,moodleClass);
                        Meteor.call('getRoomId',id,moodleClass,function(error,result){
                            Session.set('roomId',result);
                            Meteor.autosubscribe(function(){
                                Meteor.subscribe("messages", Session.get('roomId'));
                            });
                        });
                        Meteor.setInterval(function () {
                            Meteor.call('keepalive', Session.get('roomId'));
                        }, 5000);
                        var frag = Meteor.ui.render(function(){ return Template.Verified()});
                        $('#studentContent').html('');
                        $('#studentContent').append(frag);
                    } else {
                        var frag = Meteor.ui.render(function(){ return Template.notVerified()});
                        $('#studentContent').html('');
                        $('#studentContent').append(frag);
                    }
                });
            }
        });
    } else if (role == "host") {
        var query = Rooms.find();
        var handle = query.observe({
          added: function (item) {
            if(item.active == true) {
                ring.play();
            }
          },
          changed: function (item) {
            if(item.active == true) {
                ring.play();
            }
          }
});
    }
});