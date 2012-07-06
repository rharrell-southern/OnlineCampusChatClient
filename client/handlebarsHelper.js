Handlebars.registerHelper('isLoggedIn',function(){
    return Meteor.user() || role == 'student';
})
Handlebars.registerHelper('hasUnread',function(roomId){
  Meteor.flush();
  var rooms = Rooms.findOne({_id:roomId})
  if(rooms) {
      var unread = rooms.unread
      if (unread > 0) {
          var html = "<em><strong>(" + unread + ")</strong></em>";
      }
      return html;
  }
});

Handlebars.registerHelper('hostsOnline',function(){
  return Hosts.findOne({});
});

Handlebars.registerHelper('scrollDown',function(){
  Meteor.setTimeout(function(){
    Meteor.flush();
    $('#messageList').scrollTop(9999999);
    return true;
  },50);
});

Handlebars.registerHelper('hasHost',function(roomId) {
  var room = Rooms.findOne({_id:roomId});
  if (room) {
    return room.host;
  } else {
    return false;
  }
});
Handlebars.registerHelper('HostIsTyping',function(roomId) {
  var room = Rooms.findOne({_id:roomId});
  if (room) {
    return room.typing['host'];
  } else {
    return false;
  }
});
Handlebars.registerHelper('StudentIsTyping',function(roomId) {
  var room = Rooms.findOne({_id:roomId});
  if (room) {
    return room.typing['student'];
  } else {
    return false;
  }
});

Handlebars.registerHelper('studentUserId', function(roomId) {
  var room = Rooms.findOne({_id:roomId});
  if (room) {
    return room.userId;
  } else {
    return false;
  }
});

Handlebars.registerHelper('studentMoodleClass',function(roomId) {
  var room = Rooms.findOne({_id:roomId});
  if (room) {
    return room.moodleClass;
  } else {
    return false;
  }
});