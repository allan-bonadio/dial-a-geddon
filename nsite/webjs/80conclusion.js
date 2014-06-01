// a choice of a formula and verses and stuff to fill in the numbers.
// only one is displayed at a time in the conclusion zone, but some also as tooltips
function Conclusion(formula) {
	this.alphaVerse = this.betaVerse = this.omegaVerse = null;
	this.formula = formula;
}

// so what you do is create one, set the numbers, and call the draw() method to gen html
Conclusion.prototype = {

	dispose: function d() {
		delete this.formula;
		if (this.alphaVerse) {this.alphaVerse.dispose(); delete this.alphaVerse; }
		if (this.betaVerse) {this.betaVerse.dispose(); delete this.betaVerse; }
		if (this.omegaVerse) {this.omegaVerse.dispose(); delete this.omegaVerse; }
	},
	
	draw: function d() {
		var html = '<div class=conclusion>\n';
		html += this.formula.formatConclusion(this);
		return html + '</div>\n';
	},
	
	// display this one as the chosen conclusion
	// or, display directions to human to fix it
	activate: function() {
		var errors = '';
		
		if (! this.formula) {
			// should never happen.  We don't draw till user clicks on formula!
			Conclusion.display("<div class=error>You need a formula!  choose one above, right.</div>\n");
		}
		else {
			Conclusion.display(this.draw(), true);
			
			// ok now they exist... we can... i dunno
		}
	},

};

// call this when any verse or formula selection changes, to change the conclusion accordingly
Conclusion.activate = function ca() {
	if (Formula.selected) {
		var form = Formula.selected;
		var con = new Conclusion(form);
		
		// find all the selcted verses, according to the dom.  Fill in conclusion's num fields
		$('#numbersScrolly .verse.selected').each(function(v, verseNode) {
			var verse = verseNode.verse;
			if (verse.numCentral.num == form.alpha && ! con.alphaVerse)
				con.alphaVerse = verse;
			else if (form.beta && verse.numCentral.num == form.beta && ! con.betaVerse)
				con.betaVerse = verse;
			else if (verse.numCentral.num == form.omega && ! con.omegaVerse)
				con.omegaVerse = verse;
			// else this selected verse is irrelevant to this conclusion
		});
	}
	
	// ok now try to acitvate it with or without whatever it's got
	con.activate();
}

// squirt some html into the conclusion area, and make it visible
Conclusion.display = function cd(html, success) {
	($('#conclusionZone').html(html).css('display', 'block').css('background-color', success ? '#222' : '#822');
////	with ($('#conclusionZone')[0]) {
////		innerHTML = html;
////		style.display = 'block';
////		style.backgroundColor = success ? '#222' : '822';
////	}
}


///////////////////////////////////////////////// Generation, top level

// unhook all this stuff so the GC can untangle it
function disposeResults() {
	// must keep a solid sense of what obj is owned by what, so each is disposed of once.
	Verse.disposeAll();
	NumCentral.disposeAll();
	Formula.disposeAll();
}

// take the json coming in and fill in the Results scrolly boxes, ready for clicking.
// json=text returned from geddon
function genResults(returnedJson, optionsWithDate) {
	disposeResults();

	if (!returnedJson) {
		 $('#formulasScrolly').html("<span style='color: red;'>sorry, no results, try again.</span>");
		 $('#numbersScrolly').html("<span style='color: red;'>sorry, no results, try again.</span>");
	}
	else {
		var tree;
		try {
			if (JSON)
				tree = JSON.parse(returnedJson);
			else
				tree = new Function('{return '+ returnedJson +'}')();
		} catch (e) {
			console.error("error: malformed return text, starts with `%s...`", returnedJson.substr(0, 50));
		}
		
		tree.hits.pop();  // the zero on the end
		tree.refs.pop();
		//for (num in NumCentral.numIndex)
		//	NumCentral.numIndex[num].pop();  // get rid of endoflist zero
		if (! tree.hits.length) {
			 $('#numbersScrolly').html('');
			 $('#formulasScrolly').html("Sorry, we can't find a reasonable justification for this date.");
		}
		else {
			try {
				 $('#numbersScrolly').html(NumCentral.genNumsContent(tree.refs));
				 $('#formulasScrolly').html(Formula.genFormulaContent(tree.hits));
				NumCentral.crossLink();
				Formula.crossLink();
				crossLinkVerify();
	
				// select the first one as the default
				Formula.select(listOfFormulas[0]);
			} catch (e) {
				console.error("Error while loading: "+ e.message);
				if (e.sourceURL) console.error("      file "+ e.sourceURL);
				if (e.line) console.error("      line "+ e.line);
				if (e.stack) console.error(e.stack);
				console.dir(e);
			}
		}

	}
	
	
	;
	
	$('#resultsFor').html(formatADate(optionsWithDate.year, optionsWithDate.month, optionsWithDate.date));
	$('#resultsTitle').show();
	$('#resultsWrapper').show();
	

	scrollTo(0, $('#resultsTitle')[0].offsetTop);
}

// ok is this right or a great big mess?  just to verify
function crossLinkVerify() {
	for (var n = 0; n < sortedListOfNums.length; n++) {
		var num = sortedListOfNums[n];
		var numCent = NumCentral.getNumCentral(num);
		for (var f = 0; f < numCent.formulas.length; f++) {
			if (-1 == numCent.formulas[f].equation.indexOf(numCent.num))
				console.log("Number "+ numCent.num +" iznt in formula "+ numCent.formulas[f].equation);
		}
	}
}

