Session.setDefault('editing_calevent', null);
Session.setDefault('showEditEvent', false);

Template.calendar.showEditEvent = function(){
	return Session.get('showEditEvent');
}

Template.editEvent.evt = function(){
	var calEvent = CalEvents.findOne({_id:Session.get('editing_calevent')});
	return calEvent;
}

var updateCalendar = function(){
	$('#calendar').fullCalendar( 'refetchEvents' );
}

Template.editEvent.events({
	'click .save':function(evt,tmpl){
		updateCalEvent(Session.get('editing_calevent'),tmpl.find('.title').value, tmpl.find('.assignee').value, tmpl.find('[name="completeStatus"] option:selected').value,);
		Session.set('editing_calevent',null);
		Session.set('showEditEvent',false);
		$('#EditEventModal').modal("hide");
	},
	'click .close':function(evt,tmpl){
		Session.set('editing_calevent',null);
		Session.set('showEditEvent',false);
		$('#EditEventModal').modal("hide");
	}	,
	'click .remove':function(evt,tmpl){
		removeCalEvent(Session.get('editing_calevent'));
		Session.set('editing_calevent',null);
		Session.set('showEditEvent',false);
		$('#EditEventModal').modal("hide");
	},
	'click .complete':function(evt,tmpl){
		completeCalEvent(Session.get('editing_calevent'), tmpl.find('.title').value, tmpl.find('[name="completeStatus"] option:selected').value,);
		Session.set('editing_calevent',null);
		Session.set('showEditEvent',false);
		$('#EditEventModal').modal("hide");
	}
})

Template.calendar.rendered = function(){
	$('#party-name').text(getCurrentPartyName()),
	$('#calendar').fullCalendar({
		header:{
			left: 'prev,next today',
			center: 'title',
			right: 'month,basicWeek,basicDay'
		},

		dayClick:function( date, allDay, jsEvent, view) {
			CalEvents.insert({title:'New Item',start:date,end:date,assignee:'Assignee',completeStatus:"Pending",party_id: getCurrentParty()});
			updateCalendar();
		},

		eventClick:function(calEvent,jsEvent,view){
			Session.set('editing_calevent',calEvent.id);
			Session.set('showEditEvent', true);
			$('#EditEventModal').modal("show");
		},
		eventDrop:function(calEvent){
			CalEvents.update(calEvent.id, {$set: {start:calEvent.start,end:calEvent.end}});
			updateCalendar();
		},
		events: function(start, end, callback) {

			var events = [];
			calEvents = CalEvents.find();
			calEvents.forEach(function(evt){
				if(evt.party_id === getCurrentParty()){
					events.push({	id:evt._id,title:evt.title,start:evt.start,end:evt.end,assignee:evt.assignee,completeStatus:evt.completeStatus});
				}
			})

			callback(events);
		},
		eventRender( event, element ) {
      element.find( '.fc-event-title' ).html(
        `<span>${ event.title }</span></br>
				 <span>Assignee: ${ event.assignee}</span></br>
         <span class="status-${ event.completeStatus }">${ event.completeStatus }</span>
        `
      );
    },
		editable:true
	});

	Tracker.autorun( () => {
		CalEvents.find().fetch();
		$( "#calendar" ).fullCalendar( 'refetchEvents' );
	});
}
var removeCalEvent = function(id,title){
	CalEvents.remove({_id:id});
	updateCalendar();
}

var updateCalEvent = function(id,title, assignee, completeStatus){
	CalEvents.update(id, {$set: {title:title}});
	CalEvents.update(id, {$set: {assignee:assignee}});
	CalEvents.update(id, {$set: {completeStatus:completeStatus}});
	updateCalendar();
}

function getCurrentParty() {
  return Session.get('currentParty');
}

function getCurrentPartyName() {
  return Session.get('currentPartyName');
}
