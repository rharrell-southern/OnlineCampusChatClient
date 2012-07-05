Meteor.publish('messages', function (id) {

	this.onStop(function(){
		Fiber(function(){
			Rooms.update({ _id:id},{$set: { host: null }});
		}).run();
	})

    return Messages.find({roomId:id});
})
Meteor.publish('rooms',function(){
    return Rooms.find({});
})
Meteor.publish('roles',function(){
    return Roles.find();
})
Meteor.publish('connections',function(){
    return Connections.find();
})
Meteor.publish('hosts',function(){
    return Hosts.find();
})