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
		////"change #year, #month, #date": "dateChange",
		"click #justify": "justify"
	},
	
////	// change of date by user
////	dateChange: function dateChange() {
////		var da = $('#date').val();
////		if (Number(da) != da)
////			da = '';
////		
////		var mo = $('#month').val();
////		if (Number(mo) != mo)
////			mo = da = '';
////		else {
////			mo =  mo < 3 ? Number(mo) + 10 : Number(mo) - 2;
////			////mo = $('#month').item(mo).innerHTML;
////		}
	
		//// this is just wrong $('resultsFor').innerHTML = da +' '+ mo +' '+ Math.round($('year').value);
////	},

	// called when human clicks Justify button
	justify: function() {
		justification.fetch({year: $('#year').val(), month: $('#month').val(), date: $('#date').val()});
		
		//for now...justification.fetch({year: $('#year').val(), month: $('#month').val(), date: $('#date').val()})

		////genResultsTemp();
	},

	render: function()
	{
		return this;
	}
});

var inputView = new InputView();





///////////////////////////////////////////////////// preferences

// set any cookie to any value with the usual expiration.
// this is where we keep preferences
function setCookie(name, value) {
	var ex = new Date();
	ex.setYear(ex.getFullYear() + 1);
	document.cookie = name +'='+ value +'; expire=' + ex.toUTCString();
}

//  set the global font size to fs pixels
function setFontSize(fs) {
	$(document.body).css('font-size', fs + 'px');
	$('#fontSizeSelect span').css('background-color', '')
	$('#fontSizeSelect span#fs' + fs).css('background-color', '#666')
	
	setCookie("geddonFontSize", fs);
}

// pick up the prefs on startup from the cookies, copy to the prefs panel etc
// called on page startup
function pickUpPrefs() {
	var f = document.cookie.match(/^.*geddonFormulasLimit=(\d+);.*$/);
	$('#formulasLimit').value = f ? f[1] : 30;
	
	$('#cutItOut').attr('checked', document.cookie.indexOf('geddonCutItOut=true') >= 0);
	
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

