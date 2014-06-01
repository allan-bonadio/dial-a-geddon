// format a date to human form (2 Jan 2012).
// someday make this preferenceable
function formatADate(year, month, date) {
	var mo = [0, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];


	////return date +" "+ mo +" "+ year;
	return mo +" "+ date +", "+ year;
}

// convert our terse internal date format (2012-01-02) to human form (2 Jan 2012)
function formatHumanDate(internalDate) {
	var pieces = internalDate.split('-');
	return formatADate(pieces[0], pieces[1], pieces[2]) ;
}


// inceptions and targets
function PivotalDate(raw) {
	this.isoDate = raw[1];
	if (raw.length > 2) {
		this.significance = raw[2];
		this.cite = raw[3];
	}
	else {
		this.significance = 'Armageddon';
		this.cite = '';
	}
}

PivotalDate.prototype = {
	formatDate: function() {
		return formatHumanDate(this.isoDate);
	},

	formatCitation: function() {
		return '<span class=cite >'+ this.cite +'</span>';
		////return '<span class=cite >'+ this.cite.replace(/ /g, '&nbsp;') +'</span>';

	},

	divFormat: function(klass, helpText) {
		return '<div class='+ klass +' title="'+ helpText +'">' + 
					this.formatDate() +' = '+ this.significance +' &nbsp; '+
					this.formatCitation() +'</div>\n';
	},

	// special generator for conclusion; similar to formula but different stuff
	tableFormat: function(klass, helpText) {
		var html = '';
		html += '<tr class='+ klass +' title="'+ helpText +'">';
		html += '<td class=tableDate>' + this.formatDate();
		html += '<td class=conclusionVerse> is '+ this.significance +' &nbsp; '+
					this.formatCitation() +'\n';
		return html;
	}
}

//////////////////////////////////////// formulas

// organized list of Formula objects
var listOfFormulas = [];

// generate HTML for a number instance to appear in a formula zone, with all the right classes and stuff.
// Just the number itself, no verses or anything.
function genNumInstance(num) {
	return '<span class="in'+ num +' inum">'+ formatWithCommas(num) +'</span>';
}

var addPat = /^(\d+)\+(\d+)\+(\d+)=(\d+)$/;
var multPat = /^(\d+)\*(\d+)\+(\d+)\+(\d+)=(\d+)$/;

// generate a real formula object from the json result data
function Formula(formRes, serial) {
	//// maybe today this.raw = formRes;  //// take this out someday
	this.serial = serial;
	this.equation = formRes.match;
	this.explain_gap = formRes.explain_gap;
	this.explain_days = formRes.explain_days;
	this.inception = new PivotalDate(formRes.inception);
	this.target = new PivotalDate(formRes.target);

	// take textual formula apart into its numbers
	var pieces = this.equation.match(multPat);
	if (pieces) {
		// the multiply formula
		this.alpha = pieces[1];
		this.beta = pieces[2];
		this.omega = pieces[3];
		//// proleptic julian this.inception = pieces[4];
		//// proleptic julian this.target = pieces[5];
	}
	else {
		// the add formula
		pieces = this.equation.match(addPat);
		this.alpha = pieces[1];
		this.beta = null;
		this.omega = pieces[2];
		//// proleptic julian this.inception = pieces[3];
		//// proleptic julian this.target = pieces[4];
	}
}

Formula.disposeAll = function() {
	for (var f = 0; f < listOfFormulas.length; f++) {
		var formula = listOfFormulas[f];
		if (formula && !formula.dispose) console.log("a formula without a dispose!!");////
		if (formula && formula.dispose)  // ?  we need this?!?!?
			formula.dispose();
	}
	listOfFormulas = [];
}

Formula.selected = null;

Formula.prototype = {
	constructor: Formula,
	
	// get rid of loops so it can be gc'ed
	dispose: function() {
		this.alpha = this.beta = this.omega = null;
		this.raw = this.inception = this.target = null;
		if (this.formZoneNode) this.formZoneNode.formula = null;
		this.formZoneNode = null;;
	},
	
	// generate first line of formula element, with formula itself
	genFormulaLine: function() {
		html = '<div class=formula>';
		html += this.inception.formatDate();
		html += ' + '+ genNumInstance(this.alpha);
		if (this.beta)
			html += ' * '+ genNumInstance(this.beta);
		html += ' + '+ genNumInstance(this.omega);
		return html + ' = '+ this.target.formatDate() +'</div>\n';  // user chosen date, as date
	},
	
	// generate first line of formula element, with formula itself
	genInceptionLine: function gil() {
		return this.inception.divFormat('inception', "This is the starting date for your calculation.")
		////return '<div class=inception title=>' + 
			////		this.inception.formatDate() +' = '+ this.inception.significance +' &nbsp; '+
				////	this.inception.formatCitation() +'</div>\n';
	},
	
	
	// generate line displaying target
	genTargetLine: function() {
		return this.target.divFormat('target', "This is the date God chose for Armageddon.")
		////return "<div class=target title='This is the date you chose for Armageddon.' >"+ this.target.formatDate() +" = Armageddon</div>\n";
	},
	
	// given a formula, set some important vars and generate the html for its formula zone
	genFormZone: function(expl, nums) {
		//var id = 'f' + form.match.replace(/[+=*]/, '_');
		////var raw = this.raw;
		
		var html = '<div id=f'+ this.serial +' class=formulaZone >\n';
		html += this.genFormulaLine();
		html += this.genInceptionLine();
		html += this.genTargetLine();
		html += '</div>\n';
		return html;
	
	},
	
		
	// show/hide the formula zones based on what nums and verses are selected.
	// And tweak whatever else you need to.
	// call when num & verse selections change
	hiliteNums: function() {
		for (num in NumCentral.numIndex) {
			var cent = NumCentral.numIndex[num];
			var niNodes = this.formZoneNode.select('.in' + num);  // onlyone?
			for (var v = 0; v < cent.verses.length; v++) {
				var node = cent.verses[v].verseNode;
				if (cent.selected)
					node.addClass('selected');
				else
					node.removeClass('selected');
	
			}
		}
	},

	// generate several lines explaining  how date gap works
	genSummaryBox: function ges(conclusion) {
		var html = '';
	
		var hoverTip = "'These are the numbers in your resulting formula, and where they come from.\nYou can change which verses and numbers are referenced, below.'";
		html += "<div class='reckoningBox prognosticationBox' title="+ hoverTip +" >\n";

		html += "<big><div class=reckoningTitle>Prognostication</div>";
		html += "Armageddon will begin on "+ this.target.formatDate() +' according to this formula:\n';

		html += this.genFormulaLine();
		html += '</div></big>\n';
		return html;
	},

	// generate several lines explaining  how date gap works
	genVerseReckoning: function ges(conclusion) {
		var html = '';
	
		var hoverTip = "'These are the numbers in your resulting formula, and where they come from.\nYou can change which verses and numbers are referenced, below.'";
		html += "<div class='reckoningBox versesReckoning' title="+ hoverTip +" >\n";

		html += "<div class=reckoningTitle>Reckoning of Verses</div>";

		// the following are in the table so the cols line up
		html += '<table>\n';
		html += this.inception.tableFormat('inception', 'This is the starting date for your calculation.');
	
		// the three numbers.
		html += conclusion.alphaVerse.tableFormat('conAlpha');
		if (this.beta)
			html += conclusion.betaVerse.tableFormat('conBeta');
		html += conclusion.omegaVerse.tableFormat('conOmega');

		////this.raw.target[2] = 'Armageddon';
		////this.raw.target[3] = 'your choice';
		html += this.target.tableFormat('target', 'This is the date you chose for Armageddon. \nScroll up and click Justify to change it');
		
		// to the end
		html += '</table></div>\n';
		return html;
	},

	// generate several lines explaining  how date gap works
	genDateReckoning: function ges() {
		var html = '';
	
		// explanation part off to the right
		var hoverTip = "'There are "+ this.explain_gap +
			" days between your starting date and Armageddon.  \nThis shows you how that number is reckoned.'";
		html += "<div class='reckoningBox daysReckoning' title="+ hoverTip +" >\n";

		html += "<div class=reckoningTitle>Reckoning of Days</div>";
		html += "<table style=font-size:100% >\n";

		html += '<td> <td>starting at '+ this.inception.formatDate() +'\n';

		// munge each line to be a table row
		for (var e = 0; e < this.explain_days.length; e++) {
			var eText = this.explain_days[e].replace(/ \(/, '<br>(');  // not always, but some are too long
			html += eText.replace(/^(\d+) (.*)$/, '<tr><td>$1<td>$2\n');
		}

		html += '<tr><td style="border-top: solid 1px; padding-top: 4px;">'+ this.explain_gap;
		html += '<td> is the number of days<br>to ' + this.target.formatDate();
	
		html = formatWithCommas(html);
	
		html += "</table></div>\n";
	
		// add commas to numbers - just the first on each line, don't do it to years!
		// ok don't do it to 4 digit numbers
		//html = html.replace(/(\d\d)(\d\d\d)\b/g, '$1,$2').replace(/(\d)(\d\d\d,)/g, '$1,$2');

		return formatWithCommas(html);
	},

	
	////// special generator for conclusion; similar to formula but different stuff
	////Formula.prototype.formatConclusionDate = function(raw, klass, helpText) {
	////	var html = '';
	////	html += '<tr class='+ klass +' title="'+ helpText +'">';
	////	html += '<td style=vertical-align:top;text-align:right;width:6em;>' + formatHumanDate(raw[1]);
	////	html += '<td class=conclusionVerse> is '+ raw[2] +' &nbsp; '+
	////	
	////	
	////		return '<a class=cite >'+ cite.replace(/ /g, '&nbsp;') +'</a>';
	////
	////
	////
	////
	////				formatCitation(raw[3]) +'\n';
	////	return html;
	////}

	
	// special generator for conclusion; similar to formula but different stuff
	formatConclusion: function(conclusion) {
		var html = '';
	
		html += this.genSummaryBox();
		html += this.genDateReckoning()
		html += this.genVerseReckoning(conclusion)
	

		return html;
	}

}

Formula.genFormulaContent = function(hits) {
	var html = '';
	for (var f = 0; f < hits.length; f++) {
		var form = listOfFormulas[f] = new Formula(hits[f], f);
		html += form.genFormZone(true, false);
	}
	
	return html;
}
	
	
Formula.crossLink = function() {
	// go thru all formulas
	var formNodes = $('#formulasScrolly .formulaZone');
	console.assert(formNodes.length == listOfFormulas.length, "form lengths unequal");
	for (var f = 0; f < listOfFormulas.length; f++) {
		var formula = listOfFormulas[f];
		var formZoneNode = formNodes[f];
		formula.formZoneNode = formZoneNode;
		formZoneNode.formula = formula;
		
		//$(formZoneNode).observe('click', Formula.click);
		
		// many-to-many relationship between numbers and the formulas that use them
		
		var halves = formula.equation.split(/=/);
		var terms = halves[0].split(/[+]/);
		var factors = terms[0].split(/[*]/);
		
		// cross connect a NumCentral and a formula 
		function register(num) {
			var nc = NumCentral.getNumCentral(num);
			formula.numCents.push(nc);
			nc.formulas.push(formula);
			return nc;
		}
		
		formula.numCents = [];

		// omit the inception and termination numbers; the dates are heavy but the numbers not found in the bible
		var alphaCent = register(factors[0]);
		var betaCent = null;
		if (factors.length > 1)
			betaCent = register(factors[1]);
		var omegaCent = register(terms[1]);
	}

	formulasView = new FormulasView();
}

	
// obsolete?  Now we show all formulas, and only the verses that go with the selected formula.
// show/hide the formula zones based on what nums and verses are selected.
// And tweak whatever else you need to.
// call when num & verse selections change
Formula.showRelevantFormulas = function() {
	// for each formula
	for (var f = 0; f < listOfFormulas.length; f++) {
		var formula = listOfFormulas[f];
		//console.log("Formula: "+ formula.equation);////

		// figure out if the formula has 
		for (var n = 0; ; n++) {
			// at least one selected number
			if (n >= formula.numCents.length) {
				$(formula.formZoneNode).hide();  // no
				break;
			}
			//console.log("   numref "+ formula.numCents[n].num);////
			//console.log("       id "+ formula.numCents[n].numZoneNode.id);////
			//console.log("       cl "+ formula.numCents[n].numZoneNode.className);////
			if (formula.numCents[n].selected) {
				$(formula.formZoneNode).show();  // yes
				
				// great now since this one is showing, hilite all occurrences of selected nums
				formula.hiliteNums(formula);
				break;
			}
		
		}
	}
}

// select given formula
Formula.select = function fs(formula) {
	// realy the only things that indicate selectedness are the class and this variable here.
	
	// remove previous selection.  should always be one except right after Justify setting ini selection
	if (Formula.selected && Formula.selected.formZoneNode) {
		$(Formula.selected.formZoneNode).removeClass('selected');
	}
	
	Formula.selected = formula;
	$(formula.formZoneNode).addClass('selected');
	
	NumCentral.activateRelevantVerses();
	
	// and now that this is changed, the conclusion is also changed
	Conclusion.activate();
}


var FormulasView = Backbone.View.extend({
	el: '#formulasScrolly',

	events: {
		"click .formulaZone": "clickFormula",
	},

	render: function () {
		$(this.el).html("hello FormulasView");
		return this;
	},
	
	clickFormula: function(ev) {
		var node = ev.currentTarget;
		if (node.formula.formZoneNode != node)
			console.log("formula and formula node not attached");
		Formula.select(node.formula);
	}
});

var formulasView;
