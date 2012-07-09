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
Template.HostList.hosts = function (){
    return Hosts.find({},{sort:{host:1}});
};
Template.RoomList.events = {
    'click ul li.room': function(event){
        Session.set('roomId',this._id)
        Meteor.autosubscribe(function(){
            Meteor.subscribe("messages", Session.get('roomId'));
        })
        Rooms.update({ _id:this._id},{$set: { host: getUser()}});
        if ($('#chatModal').css('display') == 'none') {
            $('#chatModal').show("slide", { direction: "left" }, 500,function(){
                Meteor.flush();
                $('#messageList').scrollTop(9999999);
                $('#input').focus();
            })
        }
        Meteor.flush();
        $('#messageList').scrollTop(9999999);
    }
}

Template.HostList.events = {
    'click ul li.host': function(event){
        Session.set('roomId',this._id)
        Meteor.autosubscribe(function(){
            Meteor.subscribe("messages", Session.get('roomId'));
        })
        if ($('#chatModal').css('display') == 'none') {
            $('#chatModal').show("slide", { direction: "left" }, 500,function(){
                Meteor.flush();
                $('#messageList').scrollTop(9999999);
                $('#input').focus();
            })
        }
        Meteor.flush();
        $('#messageList').scrollTop(9999999);
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

Template.chatModal.events = {
    'click .close': function(event) {
        $('#chatModal').hide("slide", { direction: "left" }, 600);
        Rooms.update({ _id:Session.get('roomId')},{$set: { host: null}});
    }
}