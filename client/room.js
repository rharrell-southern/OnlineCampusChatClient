function hostSubscribe(method, roomId) {
    Session.set('roomId',roomId);
    Meteor.autosubscribe(function(){
        Meteor.subscribe("messages", Session.get('roomId'),function(){ 
            $('#'+method+'ChatModal #messageList ul').fadeIn('fast');
        });
    });
}
Template.RoomList.rooms = function (){
    var filter = {};
    if(Session.get('filterValue')) {
        var regExp = {}
        regExp['$regex'] = Session.get('filterValue')
        regExp['$options'] = 'i';
        filter[Session.get('filterName')] = regExp;
    }
    return Rooms.find(filter,{sort:{active:-1,unread:-1,moodleClass:1,userId:1}});
};
Template.RoomList.events = {
    'click ul li.room': function(event){
        var thisID = this._id;
        $('#ChatModal #messageList ul').fadeOut('fast',function(){
            Rooms.update({ _id:this._id},{$set: { host: getUser()}});
            if ($('#ChatModal').css('display') == 'none') {
                if ($('#hostChatModal').css('display') == 'block') {
                    $('#hostChatModal #messageList ul').fadeOut('fast',function(){
                        $('#hostChatModal').hide("slide", { direction: "left" }, 300, function(){
                            $('#ChatModal #messageList ul').hide();
                            $('#ChatModal').show("slide", { direction: "left" }, 500, function() {
                                hostSubscribe('',thisID);
                            });
                        });
                    });
                } else {
                    $('#ChatModal').show("slide", { direction: "left" }, 500,function(){    
                        hostSubscribe('',thisID);
                    });
                }
            } else {
                hostSubscribe('',thisID);
            }
            Meteor.flush();
            $('#ChatModal #messageList').scrollTop(9999999); 
            $('#ChatModal #input').focus();
        });
    }
}

Template.HostList.events = {
    'click ul li.host': function(event){
        var thisID = this._id;
        $('#hostChatModal #messageList ul').fadeOut('fast',function(){  
            if ($('#hostChatModal').css('display') == 'none') {
                if ($('#ChatModal').css('display') == 'block') {
                    $('#ChatModal #messageList ul').fadeOut('fast',function(){
                        $('#ChatModal').hide("slide", { direction: "left" }, 300,function(){
                            $('#hostChatModal #messageList ul').hide();
                            $('#hostChatModal').show("slide", { direction: "left" }, 500, function(){
                                hostSubscribe('host',thisID);
                            });
                        });
                    });
                } else {
                    $('#hostChatModal').show("slide", { direction: "left" }, 500,function(){
                        hostSubscribe('host',thisID);
                    });
                }
            } else {
                hostSubscribe('host',thisID);
            }
            Meteor.flush();
            $('#hostChatModal #messageList').scrollTop(9999999);
            $('#hostChatModal #input').focus();
        });
    }
}
Template.filterForm.events = {
    'keyup': function (event) {
        //event.preventDefault();
        var filterField = $('#fieldName').val();
        var filterValue = $('#fieldValue').val();
        Session.set('filterName', filterField);
        Session.set('filterValue',filterValue);
        $('#showHideInactive').html('Hide Inactive');
    },
    'submit': function (event) {
        event.preventDefault();
    }
}

Template.chatHeader.roomId = function() {
    return Session.get('roomId');
}

Template.HostChatInfo.roomId = function() {
    return Session.get('roomId');
}

Template.HostChatBody.subscribe = function() {
    Meteor.autosubscribe(function(){
        Meteor.subscribe("messages", Session.get('roomId'));
    });
}

Template.HostList.hosts = function (){
    return Hosts.find({},{sort:{host:1}});
};

Template.chatModal.events = {
    'click .close': function(event) {
        $('#chatModal').hide("slide", { direction: "left" }, 600);
        Rooms.update({ _id:Session.get('roomId')},{$set: { host: null}});
    }
}
Template.hostChatModal.events = {
    'click .close': function(event) {
        $('#hostChatModal').hide("slide", { direction: "left" }, 600);
    }
}