// for each biblical book as we spell it, find the blueletter site bible book abbr
var bookToBlb = {
"Genesis": "Gen", "Exodus": "Exd", "Leviticus": "Lev", "Numbers": "Num",
 "Deuteronomy": "Deu", "Joshua": "Jos", "Judges": "Jdg", "Ruth": "Rth",
 "1 Samuel": "1Sa", "2 Samuel": "2Sa", "1 Kings": "1Ki", "2 Kings": "2Ki",
 "1 Chronicles": "1Ch", "2 Chronicles": "2Ch", "Ezra": "Ezr", "Nehemiah": "Neh",
 "Esther": "Est", "Job": "Job", "Psalms": "Psa", "Proverbs": "Pro",
 "Ecclesiastes": "Ecc", "Song of Solomon": "Sgs", "Isaiah": "Isa", "Jeremiah": "Jer",
 "Lamentations": "Lam", "Ezekiel": "Eze", "Daniel": "Dan", "Hosea": "Hsa",
 "Joel": "Joe", "Amos": "Amo", "Obadiah": "Oba", "Jonah": "Jon",
 "Micah": "Mic", "Nahum": "Nah", "Habakkuk": "Hab", "Zephaniah": "Zep",
 "Haggai": "Hag", "Zechariah": "Zec", "Malachi": "Mal",
 "Matthew": "Mat", "Mark": "Mar", "Luke": "Luk", "John": "Jhn",
 "Acts": "Act", "Romans": "Rom", "1 Corinthians": "1Cr", "2 Corinthians": "2Cr",
 "Galatians": "Gal", "Ephesians": "Eph", "Philippians": "Phl", "Colossians": "Col",
 "1 Thessalonians": "1Th", "2 Thessaolonians": "2Th", "1 Timothy": "1Ti", "2 Timothy": "2Ti",
 "Titus": "Tts", "Philemon": "Phm", "Hebrews": "Hbr", "James": "Jam",
 "1 Peter": "1Pe", "2 Peter": "2Pe", "1 John": "1Jo", "2 John": "2Jo",
 "3 John": "3Jo", "Jude": "Jud", "Revelation": "Rev"};

// numRefRef is an array fresh from the json
function Verse(numRefRef) {
	this.num = numRefRef[0];
	this.verseText = numRefRef[1];
	this.cite = numRefRef[2];  // common reference eg 'Matthew 6:6'
	// later: this.serial
	//numRefRef.verse = this;
}

Verse.listOfVerses = [];
Verse.sampLength = 40;

Verse.prototype.dispose = function() {
	this.numCentral = null;

	if (this.verseNode)
		this.verseNode.verse = null;
	this.verseNode = null;
}

Verse.disposeAll = function() {
	for (var serial = 0; serial < Verse.listOfVerses.length; serial++)
		Verse.listOfVerses[serial].dispose();
	Verse.listOfVerses = [];
}

Verse.prototype.crossLink = function cl() {
	this.verseNode = $('#v'+ this.serial)[0];
	this.verseNode.verse = this;
}

// gen HTML for this verse, just the essense text in the middle
// charsToShow = Verse.sampLength to elide the end or 99999 for all
Verse.prototype.format = function(charsToShow) {
	// split up by numbertags
	var pieces = this.verseText.split(/<(\d+)\|([\w ]+)>/);
	var formatted = '';
	var startSampAt = 0;
	var visibleChars = 0;
	for (p = 0; p < pieces.length; p += 3) {
		var prose = pieces[p];
		formatted += prose;
		visibleChars += prose.length;
		
		var digits = pieces[p+1];
		if (! digits) break;
		var words = pieces[p+2];
		if (! startSampAt && visibleChars > charsToShow)
			startSampAt = formatted.length - (visibleChars - charsToShow);
		
		// back to that number
		formatted += '<span class=numInVerse title='+ formatWithCommas(digits) +'>'+ words +'</span>';
	}
	
	
	if (startSampAt) {
		// it was long enough to have a samp elided part
		formatted = formatted.substr(0, startSampAt) +'<samp>'+ 
				formatted.substr(startSampAt) + '</samp>...';
	}
	else
		this.expandStart = true;  // we're expanded already
	return formatted;
}


// gen html for this verse in a num zone.  num=string for num itself. serial = 0, 1, ...
//Verse.prototype.genVerseHtml = function() {
	//html += 
	//return html;
//}


// gen html for a book+chapter+verse that's clickable
// cite is eg 'Numbers 3:39'
Verse.prototype.formatCitation = function formatCitation() {
	var m = this.cite.match(/^(.*) (\d+):(\d+)$/)
	if (m && bookToBlb[m[1]]) {
		// blue letter bible link
		var dest = "http://www.blueletterbible.org/Bible.cfm?";
		dest += 'b='+ bookToBlb[m[1]] + '&c='+ m[2] +'#'+ m[3];
		// b=Hbr&c=11&v=13#13
		return '<a class=cite href='+ dest +' target=the_bible>'+ 
			this.cite.replace(/ /g, '&nbsp;') +'</a>';
	}

	return '<a class=cite >'+ this.cite.replace(/ /g, '&nbsp;') +'</a>';
}




// generate the html for a given verse with its own title box around it 
Verse.prototype.genTitleBar = function gtb() {
	var num = this.num;
	var html = '';
	return '<div class=verseTitleBar>' + this.formatCitation(this.cite) +
				'<div class=verseTitleNum>'+ formatWithCommas(num) +
			'</div><br clear=both></div>';
}

// generate the html for a given verse with its own title box around it 
// this is for the num/verse scrolly
Verse.prototype.genVerseZone = function gvz() {
	var html = '<div id=v'+ this.serial +' class=verse  >\n';
	html += this.genTitleBar();
	html += '<div class=verseText>'+ this.format(Verse.sampLength) + '</div>';
	return html + '</div>\n';
}

// draw the verse in the conclusion
Verse.prototype.tableFormat = function(id) {
	var html = '';
	
	// don't think I need the ids but whatever
	html += "<tr id="+ id +" title='as selected'>";
	html += "<td style=vertical-align:top;text-align:right>"+ formatWithCommas(this.num);
	////return '<a class=cite >'+ this.cite.replace(/ /g, '&nbsp;') +'</a>';
	html += '<td> from '+ this.formatCitation();
	html += '<div class=verseText style=left-padding: 3em>'+ this.format(9999) +"</div>\n";
	return html;
}




// the one about to start expanding.  Multiple verses can continue expansion all at once.
Verse.verseToExpand = null;

// expose the rest of the verse (only the first line is shown initially)
Verse.prototype.isExpanded = function() {
	return !! this.expandStart;
////	if (! this.sampNode)
////		this.sampNode = this.verseNode.select('samp')[0];
////	return this.sampNode.style.display == 'inline';
}

Verse.charsPerMilliSec = 40 * 0.001;

Verse.prototype.expand = function() {
	if (this.expandStart)
		return;  // dont overwrite expandInt well never stop
	var self = this;
	// "type" it out slowly so they can watch
	this.expandStart = (new Date()).getTime() - 
				Verse.sampLength / Verse.charsPerMilliSec;
			//	this.verseNode.innerHTML.indexOf('<samp>') / Verse.charsPerMilliSec;
	console.log("starting expand of "+ this.cite);////
	this.expandInt = setInterval(function() {
		self.keepExpanding()
	}, 100);
	//this.sampNode.style.display = 'inline';
	// never collapses
}


Verse.prototype.keepExpanding = function() {
	var pos = ( (new Date()).getTime() - this.expandStart) * Verse.charsPerMilliSec;
	var newText = this.format(pos + Verse.sampLength);
	$('.verseText', this.verseNode).html(newText);
	////console.log("    expanding "+ this.cite +"  with: "+ pos +"  to: "+ newText);////

	if (newText.indexOf('</samp>') < 0) {
		clearInterval(this.expandInt);  // if we've gone past the </samp> tag, end it
		////console.log("    DONE expanding "+ this.cite +"  to: `"+ newText +"` total width "+ newText.length);////
	}
	
	
////	var html = this.verseNode.innerHTML.replace(/<samp>/, '');
////	if (html.substr(pos).search(/<\/samp>/) > 0) {
////		// while it's still in the middle, keep typing
////		this.verseNode.innerHTML = html.substr(0, pos) +'<samp>'+ html.substr(pos);
////	}
////	else {
////		// if we've gone past the </samp> tag, end it
////		clearInterval(this.expandInt);
////		this.verseNode.innerHTML = html.replace(/<\/samp>.../, '');
////	}
}

Verse.mouseOver = function(ev) {
	var myVerse = this.verse;
	Verse.verseToExpand = this.verse;
	if (myVerse.isExpanded())
		return;  // already expanded
		
	setTimeout(function() {
		// after all this time, if the user is still pointing at this one, show it
		if (Verse.verseToExpand === myVerse)
			myVerse.expand();
	}, 1000);
}

Verse.mouseOut = function(ev) {
	Verse.verseToExpand = null;
}


// user clicked one verse in one number zone.  select everything appropriate.
// this is the verse node clicked
// note this is a static method of Verse but called as an event handler with this= the verse clicked
Verse.prototype.select = function() {
	// go thru all our sibling verses and turn them off.  Immediate feedback.
	var numCentral = this.numCentral;
	if (numCentral.selectedVerse) {
		if (this == numCentral.selectedVerse)
			return;  // already selected
		$(numCentral.selectedVerse.verseNode).removeClass('selected');
	}

	this.expand();
	numCentral.selectedVerse = this;
	$(numCentral.selectedVerse.verseNode).addClass('selected');

	// ripple effects - listen this takes time so do it later
	var zone = this.verseNode;
	setTimeout(function() {
		//updateNumZoneSelection(zone);
		Conclusion.activate();
	}, 50);
}

// user clicked one verse in one number zone.  select everything appropriate.
// this is the verse node clicked
// note this is a static method of Verse but called as an event handler with this= the verse clicked
Verse.click = function(ev) {
	this.verse.select();
	ev.stopPropagation();
}

