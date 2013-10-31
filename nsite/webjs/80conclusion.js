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
			Conclusion.display("<div class=error>You need a formula!  choose one above, right.</div>\n", false);
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

Conclusion.display = function cd(html, success) {
	with ($('#conclusionZone')[0]) {
		innerHTML = html;
		style.display = 'block';
		style.backgroundColor = success ? '#222' : '822';
	}
}

var ConclusionView = Backbone.View.extend({
	el: 'body',

	render: function ()
	{
		$(this.el).html("hello ConclusionView");
		return this;
	}
});


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



////
////function genResultsTemp() {
////
////var json = 'x-Argc: 2 x-Argument-to-Main 0: `./geddon.cgi` x-Argument-to-Main 1: `2014-1-1` must be from the command line - argv1 is 2014-1-1 cmdline/ 2456659=2014-1-1 ... 2456659=2014-1-1 is target date <matches>{"hits":[ {"match": "895+3600+2452164=2456659", "inception": [2452164, "2001-9-11", "9-11 attack", ""], "target": [2456659, "2014-1-1"], "explain_gap": 4495, "explain_days": ["112 days to start of year 2002", "4383 days to start of 2014 (12 years with 3 leaps)"] }, {"match": "36000+675000+1745659=2456659", "inception": [1745659, "67-5-10", "Martyrdom of Saint Paul", ""], "target": [2456659, "2014-1-1"], "explain_gap": 711000, "explain_days": ["236 days to start of year 68", "552989 days to start of 1582 (1515 years with 14 leaps)", "355 days in year 1582", "157420 days to start of 2014 (431 years with 105 leaps)"] }, {"match": "17*250+245+2452164=2456659", "inception": [2452164, "2001-9-11", "9-11 attack", ""], "target": [2456659, "2014-1-1"], "explain_gap": 4495, "explain_days": ["112 days to start of year 2002", "4383 days to start of 2014 (12 years with 3 leaps)"] }, {"match": "17*54400+180000+1351859=2456659", "inception": [1351859, "1012bc-3-10", "Founding of the Temple in Jerusalem", "Archbishop James Ussher"], "target": [2456659, "2014-1-1"], "explain_gap": 1104800, "explain_days": ["297 days to start of year -1011", "369268 days to start of year 1 (1011 years with 253 leaps)", "2298884 days to start of 1582 (6298 years with 114 leaps)", "355 days in year 1582", "157420 days to start of 2014 (431 years with 105 leaps)"] }, {"match": "17*54400+25000+1506859=2456659", "inception": [1506859, "588bc-7-22", "Destruction of Jerusalem by Babylon and the beginning of the Babylonian Captivity", "Archbishop James Ussher"], "target": [2456659, "2014-1-1"], "explain_gap": 949800, "explain_days": ["163 days to start of year -587", "214402 days to start of year 1 (587 years with 147 leaps)", "2298884 days to start of 1582 (6298 years with 114 leaps)", "355 days in year 1582", "157420 days to start of 2014 (431 years with 105 leaps)"] }, {"match": "17*40500+22273+1745886=2456659", "inception": [1745886, "67-12-23", "Martyrdom of Saint Paul", ""], "target": [2456659, "2014-1-1"], "explain_gap": 710773, "explain_days": ["9 days to start of year 68", "552989 days to start of 1582 (1515 years with 14 leaps)", "355 days in year 1582", "157420 days to start of 2014 (431 years with 105 leaps)"] }, {"match": "17*41500+5400+1745759=2456659", "inception": [1745759, "67-8-18", "Martyrdom of Saint Paul", ""], "target": [2456659, "2014-1-1"], "explain_gap": 710900, "explain_days": ["136 days to start of year 68", "552989 days to start of 1582 (1515 years with 14 leaps)", "355 days in year 1582", "157420 days to start of 2014 (431 years with 105 leaps)"] }, {"match": "17*53400+42000+1506859=2456659", "inception": [1506859, "588bc-7-22", "Destruction of Jerusalem by Babylon and the beginning of the Babylonian Captivity", "Archbishop James Ussher"], "target": [2456659, "2014-1-1"], "explain_gap": 949800, "explain_days": ["163 days to start of year -587", "214402 days to start of year 1 (587 years with 147 leaps)", "2298884 days to start of 1582 (6298 years with 114 leaps)", "355 days in year 1582", "157420 days to start of 2014 (431 years with 105 leaps)"] }, {"match": "17*64300+186400+1177159=2456659", "inception": [1177159, "1491bc-11-20", "The Exodus from Egypt", "Archbishop James Ussher"], "target": [2456659, "2014-1-1"], "explain_gap": 1279500, "explain_days": ["42 days to start of year -1490", "544223 days to start of year 1 (1491 years with 8 leaps)", "2298884 days to start of 1582 (6298 years with 114 leaps)", "355 days in year 1582", "157420 days to start of 2014 (431 years with 105 leaps)"] }, {"match": "17*64400+185000+1176859=2456659", "inception": [1176859, "1491bc-1-24", "The Exodus from Egypt", "Archbishop James Ussher"], "target": [2456659, "2014-1-1"], "explain_gap": 1279800, "explain_days": ["342 days to start of year -1490", "544223 days to start of year 1 (1491 years with 8 leaps)", "2298884 days to start of 1582 (6298 years with 114 leaps)", "355 days in year 1582", "157420 days to start of 2014 (431 years with 105 leaps)"] }, 0], "refs":[ [895, "And all the days of Mahalaleel were <895|eight hundred ninety and five> years: and he died.", "Genesis 5:17"], [17, "These are the generations of Jacob. Joseph, being <17|seventeen> years old, was feeding the flock with his brethren; and the lad was with the sons of Bilhah, and with the sons of Zilpah, his father`s wives: and Joseph brought unto his father their evil report.", "Genesis 37:2"], [17, "And Jacob lived in the land of Egypt <17|seventeen> years: so the whole age of Jacob was an <147|hundred forty and seven> years.", "Genesis 47:28"], [250, "Take thou also unto thee principal spices, of pure myrrh <500|five hundred> shekels, and of sweet cinnamon half so much, even <250|two hundred and fifty> shekels, and of sweet calamus <250|two hundred and fifty> shekels,", "Exodus 30:23"], [54400, "Those that were numbered of them, even of the tribe of Issachar, were <54400|fifty and four thousand and four hundred>.", "Numbers 1:29"], [40500, "Those that were numbered of them, even of the tribe of Ephraim, were <40500|forty thousand and five hundred>.", "Numbers 1:33"], [41500, "Those that were numbered of them, even of the tribe of Asher, were <41500|forty and one thousand and five hundred>.", "Numbers 1:41"], [53400, "Those that were numbered of them, even of the tribe of Naphtali, were <53400|fifty and three thousand and four hundred>.", "Numbers 1:43"], [54400, "And his host, and those that were numbered thereof, were <54400|fifty and four thousand and four hundred>.", "Numbers 2:6"], [186400, "All that were numbered in the camp of Judah were an <186400|hundred thousand and fourscore thousand and six thousand and four hundred>, throughout their armies. These shall first set forth.", "Numbers 2:9"], [40500, "And his host, and those that were numbered of them, were <40500|forty thousand and five hundred>.", "Numbers 2:19"], [41500, "And his host, and those that were numbered of them, were <41500|forty and one thousand and five hundred>.", "Numbers 2:28"], [53400, "And his host, and those that were numbered of them, were <53400|fifty and three thousand and four hundred>.", "Numbers 2:30"], [22273, "And all the firstborn males by the number of names, from a month old and upward, of those that were numbered of them, were <22273|twenty and two thousand two hundred and threescore and thirteen>.", "Numbers 3:43"], [250, "And they rose up before Moses, with certain of The children of Israel, <250|two hundred and fifty> princes of the assembly, famous in the congregation, men of renown:", "Numbers 16:2"], [250, "And take every man his censer, and put incense in them, and bring ye before the LORD every man his censer, <250|two hundred and fifty> censers; thou also, and Aaron, each of you his censer.", "Numbers 16:17"], [250, "And there came out a fire from the LORD, and consumed the <250|two hundred and fifty> men that offered incense.", "Numbers 16:35"], [250, "And the earth opened her mouth, and swallowed them up together with Korah, when that company died, what time the fire devoured <250|two hundred and fifty> men: and they became a sign.", "Numbers 26:10"], [40500, "These are the families of The children of Gad according to those that were numbered of them, <40500|forty thousand and five hundred>.", "Numbers 26:18"], [64300, "These are the families of Issachar according to those that were numbered of them, <64300|threescore and four thousand and three hundred>.", "Numbers 26:25"], [64400, "All the families of the Shuhamites, according to those that were numbered of them, were <64400|threescore and four thousand and four hundred>.", "Numbers 26:43"], [53400, "These are the families of the sons of Asher according to those that were numbered of them; who were <53400|fifty and three thousand and four hundred>.", "Numbers 26:47"], [675000, "And the booty, being the rest of the prey which the men of war had caught, was <675000|six hundred thousand and seventy thousand and five thousand> sheep,", "Numbers 31:32"], [36000, "And the beeves were <36000|thirty and six thousand>; of which the LORD`s tribute was <72|threescore and twelve>.", "Numbers 31:38"], [36000, "And <36000|thirty and six thousand> beeves,", "Numbers 31:44"], [42000, "Then said they unto him, Say now Shibboleth: and he said Sibboleth: for he could not frame to pronounce it right. Then they took him, and slew him at the passages of Jordan: and there fell at that time of the Ephraimites <42000|forty and two thousand>.", "Judges 12:6"], [25000, "And the LORD smote Benjamin before Israel: and The children of Israel destroyed of the Benjamites that day <25000|twenty and five thousand> and an <100|hundred> men: all these drew the sword.", "Judges 20:35"], [25000, "So that all which fell that day of Benjamin were <25000|twenty and five thousand> men that drew the sword; all these were men of valour.", "Judges 20:46"], [180000, "And when Rehoboam was come to Jerusalem, he assembled all the house of Judah, with the tribe of Benjamin, an <180000|hundred and fourscore thousand> chosen men, which were warriors, to fight against the house of Israel, to bring the kingdom again to Rehoboam the son of Solomon.", "1 Kings 12:21"], [17, "And Rehoboam the son of Solomon reigned in Judah. Rehoboam was <41|forty and one> years old when he began to reign, and he reigned <17|seventeen> years in Jerusalem, the city which the LORD did choose out of all the tribes of Israel, to put his name there. And his mother`s name was Naamah an Ammonitess.", "1 Kings 14:21"], [17, "In the <3|three> and twentieth year of Joash the son of Ahaziah king of Judah Jehoahaz the son of Jehu began to reign over Israel in Samaria, and reigned <17|seventeen> years.", "2 Kings 13:1"], [36000, "And with them, by their generations, after the house of their fathers, were bands of soldiers for war, <36000|six and thirty thousand> men: for they had many wives and sons.", "1 Chronicles 7:4"], [3600, "And Solomon told out <70000|threescore and ten thousand> men to bear burdens, and <80000|fourscore thousand> to hew in the mountain, and <3600|three thousand and six hundred> to oversee them.", "2 Chronicles 2:2"], [3600, "And he set <70000|threescore and ten thousand> of them to be bearers of burdens, and <80000|fourscore thousand> to be hewers in the mountain, and <3600|three thousand and six hundred> overseers to set the people a work.", "2 Chronicles 2:18"], [250, "And these were the chief of king Solomon`s officers, even <250|two hundred and fifty>, that bare rule over the people.", "2 Chronicles 8:10"], [180000, "And when Rehoboam was come to Jerusalem, he gathered of the house of Judah and Benjamin an <180000|hundred and fourscore thousand> chosen men, which were warriors, to fight against Israel, that he might bring the kingdom again to Rehoboam.", "2 Chronicles 11:1"], [17, "So king Rehoboam strengthened himself in Jerusalem, and reigned: for Rehoboam was <41|one and forty> years old when he began to reign, and he reigned <17|seventeen> years in Jerusalem, the city which the LORD had chosen out of all the tribes of Israel, to put his name there. And his mother`s name was Naamah an Ammonitess.", "2 Chronicles 12:13"], [180000, "And next him was Jehozabad, and with him an <180000|hundred and fourscore thousand> ready prepared for the war.", "2 Chronicles 17:18"], [5400, "All the vessels of gold and of silver were <5400|five thousand and four hundred>. All these did Sheshbazzar bring up with them of the captivity that were brought up from Babylon unto Jerusalem.", "Ezra 1:11"], [245, "Their horses were <736|seven hundred thirty and six>; their mules, <245|two hundred forty and five>;", "Ezra 2:66"], [245, "Beside their manservants and their maidservants, of whom there were <7337|seven thousand three hundred thirty and seven>: and they had <245|two hundred forty and five> singing men and singing women.", "Nehemiah 7:67"], [245, "Their horses, <736|seven hundred thirty and six>: their mules, <245|two hundred forty and five>:", "Nehemiah 7:68"], [185000, "Then the angel of the LORD went forth, and smote in the camp of the Assyrians a <185000|hundred and fourscore and five thousand>: and when they arose early in the morning, behold, they were all dead corpses.", "Isaiah 37:36"], [17, "And I bought the field of Hanameel my uncle`s son, that was in Anathoth, and weighed him the money, even <17|seventeen> shekels of silver.", "Jeremiah 32:9"], [25000, "Moreover, when ye shall divide by lot the land for inheritance, ye shall offer an oblation unto the LORD, an holy portion of the land: the length shall be the length of <25000|five and twenty thousand> reeds, and the breadth shall be <10000|ten thousand>. This shall be holy in all the borders thereof round about.", "Ezekiel 45:1"], [25000, "And of this measure shalt thou measure the length of <25000|five and twenty thousand>, and the breadth of <10000|ten thousand>: and in it shall be the sanctuary and the most holy place.", "Ezekiel 45:3"], [25000, "And the <25000|five and twenty thousand> of length, and the <10000|ten thousand> of breadth shall also the Levites, the ministers of the house, have for themselves, for a possession for <20|twenty> chambers.", "Ezekiel 45:5"], [25000, "And ye shall appoint the possession of the city <5000|five thousand> broad, and <25000|five and twenty thousand> long, over against the oblation of the holy portion: it shall be for the whole house of Israel.", "Ezekiel 45:6"], [25000, "And by the border of Judah, from the east side unto the west side, shall be the offering which ye shall offer of <25000|five and twenty thousand> reeds in breadth, and in length as <1|one> of the other parts, from the east side unto the west side: and the sanctuary shall be in the midst of it.", "Ezekiel 48:8"], [25000, "The oblation that ye shall offer unto the LORD shall be of <25000|five and twenty thousand> in length, and of <10000|ten thousand> in breadth.", "Ezekiel 48:9"], [25000, "And for them, even for the priests, shall be this holy oblation; toward the north <25000|five and twenty thousand> in length, and toward the west <10000|ten thousand> in breadth, and toward the east <10000|ten thousand> in breadth, and toward the south <25000|five and twenty thousand> in length: and the sanctuary of the LORD shall be in the midst thereof.", "Ezekiel 48:10"], [25000, "And over against the border of the priests the Levites shall have <25000|five and twenty thousand> in length, and <10000|ten thousand> in breadth: all the length shall be <25000|five and twenty thousand>, and the breadth <10000|ten thousand>.", "Ezekiel 48:13"], [25000, "And the <5000|five thousand>, that are left in the breadth over against the <25000|five and twenty thousand>, shall be a profane place for the city, for dwelling, and for suburbs: and the city shall be in the midst thereof.", "Ezekiel 48:15"], [250, "And the suburbs of the city shall be toward the north <250|two hundred and fifty>, and toward the south <250|two hundred and fifty>, and toward the east <250|two hundred and fifty>, and toward the west <250|two hundred and fifty>.", "Ezekiel 48:17"], [25000, "All the oblation shall be <25000|five and twenty thousand> by <25000|five and twenty thousand>: ye shall offer the holy oblation foursquare, with the possession of the city.", "Ezekiel 48:20"], [25000, "And the residue shall be for the prince, on the <1|one> side and on the other of the holy oblation, and of the possession of the city, over against the <25000|five and twenty thousand> of the oblation toward the east border, and westward over against the <25000|five and twenty thousand> toward the west border, over against the portions for the prince: and it shall be the holy oblation; and the sanctuary of the house shall be in the midst thereof.", "Ezekiel 48:21"], [17, "Number of The Perfection of Spiritual Order", "Biblical Numerology"], 0]}</matches> total 10 hits, 20 different numbers, 57 total refs totalcpu: 0.007 sec';
////
////	genResults(json);
////}

