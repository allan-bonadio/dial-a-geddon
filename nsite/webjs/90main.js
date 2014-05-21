/////////////////////////////////////////////////// Justification model

// the data that comes back: formulas and verses that fit into them
var Justification = Backbone.Model.extend({
	defaults: {
		hits: [],
		refs: []
	},
	
	urlRoot: 'geddon',
	
	sync: function(method, model, options) {
		var params = {
					action: 'justify', 
					limit: $('#formulasLimit').val(), 
					year: options.year, month: options.month, date: options.date
				};
		var th = this;
		$.get(this.urlRoot, params, 'text/plain')
			.done(function(text, textStatus, jqXHR) {
				////console.log(transport.status + text);
				var a = text.split('<matches>');
				if (a.length > 1) {
					console.log("trimmed start");
					var b = a[1].split('</matches>');
					if (b.length > 1) {
						console.info("got it successfully");
						//if ($('cutItOut').checked)
						genResults(b[0], options);
						return;
					}
				}

				// if the length you get is NaN, often that means the geddon program isnt there
				console.error("bad returned data of length %d, status %s", text.length, textStatus);
				
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				////returnedJson = null;
				console.error("xhr failure:"+ jqXHR.status + jqXHR.statusText);
		
			});
	},

	
	
});

var justification = new Justification();

/////////////////////////////////////////////////// Input panel

var InputView = Backbone.View.extend({
	el: '#inputs',
	events: {
		"click #justify": "justify"
	},
	
	// called when human clicks Scriptures button
	justify: function() {
		justification.fetch({year: $('#year').val(), month: $('#month').val(), date: $('#date').val()});
	},

	render: function()
	{
		return this;
	}
});

var inputView = new InputView();


////////////////////////////////////////////////// stars sliding

var StarSlidingPos = 0, StarSlidingInterval = 0;

function startStarSliding() {
	StarSlidingInterval = setInterval(function() {
		StarSlidingPos++;
		if (StarSlidingPos >= 7000)
			StarSlidingPos -= 7000;
		document.body.style.backgroundPosition = StarSlidingPos + 'px '+ StarSlidingPos + 'px';
	}, 100);
}

function endStarSliding() {
	if (StarSlidingInterval)
		clearInterval(StarSlidingInterval);
	StarSlidingInterval = 0;
}




///////////////////////////////////////////////////// preferences

// set any cookie to any value with the usual expiration.
// this is where we keep preferences
function setCookie(name, value) {
	var ex = new Date();
	ex.setYear(ex.getFullYear() + 1);
	document.cookie = name +'='+ value +'; expire=' + ex.toUTCString();
}

//  set the global font size to fs /10 ems
function setFontSize(fs) {
	$(document.body).css('font-size', (fs*0.1) + 'em');
	$('#fontSizeSelect span').css('background-color', '')
	$('#fontSizeSelect span#fs' + fs).css('background-color', '#666')
	
	setCookie("geddonFontSize", fs);
}

// effect changes in the cutitout checkbox
function pickUpStars() {
		console.log("cut it out; "+ $('#cutItOut')[0].checked);
		if ($('#cutItOut')[0].checked)
			endStarSliding();
		else
			startStarSliding();
}

// pick up the prefs on startup from the cookies, copy to the prefs panel etc
// called on page startup
function pickUpPrefs() {
	var f = document.cookie.match(/^.*geddonFormulasLimit=(\d+);.*$/);
	$('#formulasLimit').val(f ? f[1] : 30);
	
	$('#cutItOut').attr('checked', document.cookie.indexOf('geddonCutItOut=true') >= 0);
	pickUpStars();
	
	var m = document.cookie.match(/geddonFontSize=(\d+)/);
	setFontSize(m ? m[1] : 16);
}

// sets up the user actions for prefs panel
jQuery(function() {
 	$('#prefsFog, #prefsPanelOK').click(function() {
		$('#prefsFog').hide();
 	});
 	$('#prefsButton').click(function() {
		$('#prefsFog').show();
 	});
 	$('#prefsPanel').click(function(ev) {
		ev.stopPropagation();  // or else clicks submit!
 	});
 	$('#cutItOut').change(function() {
 		setCookie("geddonCutItOut", $("#cutItOut")[0].checked);
		pickUpStars();
 	});
 });
 

///////////////////////////////////////////////////// startup

$(document).ready(function ()
{
	var NavigationRouter = Backbone.Router.extend({

		routes: {
			"*actions": "startup"
		},
		
		// 'create' the page by putting current page number in the title
		startup: function sp(targetDate)
		{
			// set the default target to be like 6 months in the future or so
			var now = new Date();
			var then = new Date(now.getTime() + 2e10);
			$('#year').val(then.getFullYear());
			$('#month').val(then.getMonth()+1);
			$('#date').val(then.getDate());
			////inputView.dateChange();
			
			pickUpPrefs();
		  
			////$('#innerBody').append('nav showpage<br>');
			
		},
		
	});

	var navigationRouter = new NavigationRouter;
	Backbone.history.start({root: '/'});
});

