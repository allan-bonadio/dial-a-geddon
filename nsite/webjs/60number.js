
// will stick commas in any big number anywhere in this text
function formatWithCommas(num) {
	return String(num).replace(/(\d\d)(\d\d\d)\b/g, '$1,$2').replace(/(\d)(\d\d\d,)/g, '$1,$2');
}



// just the numbers.  as numbers.  Look em up in NumCentral.numIndex.
var sortedListOfNums = null;

// a class of number manager objects.  Each has alist of all the verses that have this number.
var NumCentral = function NumCentral(num) {
	this.num = num;
	this.verses = [];  // list of Verse objects this has
	this.formulas = [];  // formulas that use this number
	
	if (NumCentral.numIndex[num])
		console.error('duplicate nums '+ num);
	NumCentral.numIndex[num] = this;
}

NumCentral.prototype.dispose = function d() {
	this.num = null;
	this.numZoneNode.numCent = null;
	this.numZoneNode = null;
	
	for (var v = 0; v < this.verses.length; v++) {
		ver = this.verses[v];
		ver.dispose();
		this.verses[v] = null;
	}
	this.verses = null;
}

NumCentral.disposeAll = function() {
	for (num in NumCentral.numIndex) {
	
		var numCent = NumCentral.numIndex[num];
		if (numCent.numZoneNode)
			numCent.numZoneNode.numCent = null;
		numCent.numZoneNode = null;
		numCent.formulas = null;
		for (var v = 0; v < numCent.verses.length; v++) {
			numCent.verses[v] = null;
		}
	}
	NumCentral.numIndex = null;
	sortedListOfNums = null;
}

// this is a hash of of the numCentrals by num num.
// keys are strings of the nums.  Values are arrays of verses.
NumCentral.numIndex = {};


// for a given number (int or str) gimme the NumCentral for it, or create new if none
NumCentral.getNumCentral = function nv(n) {
	if (! NumCentral.numIndex[n])
		NumCentral.numIndex[n] = new NumCentral(n);
	return NumCentral.numIndex[n];
}

NumCentral.newVerse = function nv(numRef, serial) {
	nc = NumCentral.getNumCentral(numRef.num);
	
	var v = new Verse(numRef);
	nc.addVerse(v);
	v.serial = serial;
	Verse.listOfVerses[serial] = v;
	return v;
}

// i don't need this do i NumCentral.prototype.constructor = NumCentral;

////NumCentral.xdispose = function dd() {
////{
////	
////	for (var n = 0; n < NumCentral.numIndex.length; n++) {
////		NumCentral.numIndex[n].dispose();
////		delete NumCentral.numIndex[n];
////	}
////	//delete NumCentral.numIndex;
////	//delete listOfNumRefs;
////}


// attach this num and this verse
NumCentral.prototype.addVerse = function av(verseObj) {
	this.verses.push(verseObj);
	verseObj.numCentral = this;
}


// generate the html for a given number zone in the zone system
function genNumZone(num, numRefList) {
	var withCommas = formatWithCommas(num);
	var html = '<div id=n'+ num +' class=nZone  ><small>choose a verse with &nbsp; <big> '+ withCommas +'</big></small>\n';
	var serial;
	
	for (serial = 0; serial < numRefList.length; serial++) {
		var nr = numRefList[serial];
		var verse = NumCentral.newVerse(nr, serial);
		html += verse.genVerseHtml();
	}

	html += '</div>\n';
	return html;
}

// take the json coming in and fill in the Results scrolly box
NumCentral.genNumsContent = function gnc(listOfNumRefs) {
	var html = '';
	
	// construct all verses and the NumCentral.numIndex
	Verse.listOfVerses = [];
	NumCentral.numIndex = {};
	for (var r = 0; r < listOfNumRefs.length; r++) {
		var num = listOfNumRefs[r][0];
		var nc = NumCentral.getNumCentral(num);
		nc.addVerse(NumCentral.newVerse(listOfNumRefs[r], r));
	}

	// do we need this anymore?
	sortedListOfNums = [];
	for (var num in NumCentral.numIndex)
		sortedListOfNums.push(Number(num));
	sortedListOfNums.sort(function(a, b) { return a-b}); 

	
	// old, obsolete
	if (window.orderByNum) {
		// organize by nums
		for (var i = 0; i < sortedListOfNums.length; i++) {
			var num = sortedListOfNums[i];
			html += genNumZone(num, NumCentral.numIndex[num]);
			NumCentral.numIndex[num].num = num;  // useful later
		}
	}
	
	// draw ALL of the verses, in downloaded order
	window.orderAsReturned = true;
	if (window.orderAsReturned) {
		for (var s = 0; s < Verse.listOfVerses.length; s++) {
			var v = Verse.listOfVerses[s];
			html += v.genVerseZone();

		}
	}
	
	
	return html;
}


// go thru all numbers.  Attach event handlers to verses.  
NumCentral.crossLink = function() {
	for (var n = 0; n < sortedListOfNums.length; n++) {
		var num = sortedListOfNums[n];
		var numCent = NumCentral.getNumCentral(num);
		//var numZoneNode = $('n'+ num);
		//numCent.numZoneNode = numZoneNode;
		//numZoneNode.numCent = numCent;
		numCent.formulas = [];
		
		// go thru each verse node, hook it up
		for (var v = 0; v < numCent.verses.length; v++)
			numCent.verses[v].crossLink();

			////verseNode.observe('click', Verse.click);
			////verseNode.observe('mouseover', Verse.mouseOver);
			////verseNode.observe('mouseout', Verse.mouseOut);
		////}
		
	}


}

// called when a formula is selected, to make verses visible/invisible
NumCentral.activateRelevantVerses = function arv() {
	// nums present in formula
	var alpha = Number(Formula.selected.alpha);
	var beta = Number(Formula.selected.beta || 0);
	var omega = Number(Formula.selected.omega);
	
	// all the verses
	for (var s = 0; s < Verse.listOfVerses.length; s++) {
		var verse = Verse.listOfVerses[s];
		var $n = $(verse.verseNode);
		if (verse.num == alpha || verse.num == beta || verse.num == omega)
			$n.show();
		else
			$n.hide();
	}
	
	NumCentral.getNumCentral(alpha).selectAnyVerse();
	if (beta)
		NumCentral.getNumCentral(beta).selectAnyVerse();
	NumCentral.getNumCentral(omega).selectAnyVerse();
}

// make sure some verse in this num is selected.  for user model where there's always one thing selected.
NumCentral.prototype.selectAnyVerse = function sav() {
	if (this.selected)
		return;
	
	this.verses[0].select();
}



var NumbersView = Backbone.View.extend({
	el: '#numbersScrolly',

	events: {
		"click #numbersScrolly .verse": "clickVerse",
	},
	
	clickVerse: function(ev) {
		var node = ev.currentTarget;
		if (node.verse.verseNode != node)
			console.log("verse and verse node not attached");
		node.verse.select();
	},
	
	render: function () {
		$(this.el).html("hello NumbersView");
		return this;
	}
});

var numbersView = new NumbersView();


