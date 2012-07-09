Meteor.publish('messages', function (id) {

	this.onStop(function(){
		Fiber(function(){
			if (Rooms.findOne({_id:id})) {
				Rooms.update({ _id:id},{$set: { host: null }});
			}
		}).run();
	});

    return Messages.find({roomId:id});
});
Meteor.publish('privateMessages',function(id) {
	Fiber(function(){
    	return Messages.find({roomId:id});
	}).run();
});
Meteor.publish('rooms',function(){
    return Rooms.find({});
});
Meteor.publish('roles',function(){
    return Roles.find();
});
Meteor.publish('connections',function(){
    return Connections.find();
});
Meteor.publish('hosts',function(){
    return Hosts.find();
});