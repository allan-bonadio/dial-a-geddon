// tests for verse.js code in dag

var bookToBlbExpected = "Genesis|Gen\n\
Exodus|Exd\n\
Leviticus|Lev\n\
Numbers|Num\n\
Deuteronomy|Deu\n\
Joshua|Jos\n\
Judges|Jdg\n\
Ruth|Rth\n\
1 Samuel|1Sa\n\
2 Samuel|2Sa\n\
1 Kings|1Ki\n\
2 Kings|2Ki\n\
1 Chronicles|1Ch\n\
2 Chronicles|2Ch\n\
Ezra|Ezr\n\
Nehemiah|Neh\n\
Esther|Est\n\
Job|Job\n\
Psalms|Psa\n\
Proverbs|Pro\n\
Ecclesiastes|Ecc\n\
Song of Solomon|Sgs\n\
Isaiah|Isa\n\
Jeremiah|Jer\n\
Lamentations|Lam\n\
Ezekiel|Eze\n\
Daniel|Dan\n\
Hosea|Hsa\n\
Joel|Joe\n\
Amos|Amo\n\
Obadiah|Oba\n\
Jonah|Jon\n\
Micah|Mic\n\
Nahum|Nah\n\
Habakkuk|Hab\n\
Zephaniah|Zep\n\
Haggai|Hag\n\
Zechariah|Zec\n\
Malachi|Mal\n\
Matthew|Mat\n\
Mark|Mar\n\
Luke|Luk\n\
John|Jhn\n\
Acts|Act\n\
Romans|Rom\n\
1 Corinthians|1Cr\n\
2 Corinthians|2Cr\n\
Galatians|Gal\n\
Ephesians|Eph\n\
Philippians|Phl\n\
Colossians|Col\n\
1 Thessalonians|1Th\n\
2 Thessaolonians|2Th\n\
1 Timothy|1Ti\n\
2 Timothy|2Ti\n\
Titus|Tts\n\
Philemon|Phm\n\
Hebrews|Hbr\n\
James|Jam\n\
1 Peter|1Pe\n\
2 Peter|2Pe\n\
1 John|1Jo\n\
2 John|2Jo\n\
3 John|3Jo\n\
Jude|Jud\n\
Revelation|Rev\n\
";



describe("bookToBlb table", function() {

	it("has correct contents", function() {
		var str = '';
		for (ix in bookToBlb)
			str += ix + '|' + bookToBlb[ix] +'\n';

		expect(str).toBe(bookToBlbExpected);
	});
});


describe("Verse object", function() {

	it("constructor works", function() {
	var verse = new Verse([123, "Holy moley", "Allan 3:4"]);
		expect(verse.num).toBe(123);
		expect(verse.verseText).toBe("Holy moley");
		expect(verse.cite).toBe("Allan 3:4");
	});

	it("formats correctly", function() {
		// one number
		var verse = new Verse([123, 
			"And Aaron was an <123|hundred and twenty and three> years old when he died in mount Hor.", "Numbers 33:39"]);
		expect(verse.format()).toBe('And Aaron was an <span class=numInVerse title=123>hundred and twenty and three</span> years old when he died in mount Hor.');

		// one number, elided
		expect(verse.format(20)).toBe('And Aaron was an <span class=numInVerse title=123>hundred and twenty and three</span> years old when he died in mount Hor.');

		// two numbers
		verse = new Verse([6, "These <6|six> cities shall be a refuge, both for The children of Israel, and for the stranger, and for the sojourner among them: that every <1|one> that killeth any person unawares may flee thither.", "Numbers 35:15"]);
		expect(verse.format()).toBe('These <span class=numInVerse title=6>six</span> cities shall be a refuge, both for The children of Israel, and for the stranger, and for the sojourner among them: that every <span class=numInVerse title=1>one</span> that killeth any person unawares may flee thither.', "Numbers 35:15");

	});

	it("genTitleBar, genVerseZone and tableFormat work correctly", function() {
		var verse = new Verse([123, 
			"And Aaron was an <123|hundred and twenty and three> years old when he died in mount Hor.", "Numbers 33:39"]);

		expect(verse.genTitleBar()).toBe('<div class=verseTitleBar><a class=cite href=http://www.blueletterbible.org/Bible.cfm?b=Num&c=33#39 target=the_bible>Numbers&nbsp;33:39</a><div class=verseTitleNum>123</div><br clear=both></div>');

		verse.serial=998877;
		expect(verse.genVerseZone()).toBe('<div id=v998877 class=verse  >\n<div class=verseTitleBar><a class=cite href=http://www.blueletterbible.org/Bible.cfm?b=Num&c=33#39 target=the_bible>Numbers&nbsp;33:39</a><div class=verseTitleNum>123</div><br clear=both></div><div class=verseText>And Aaron was an <span class=numInVerse title=123>hundred and twenty and three</span> years old when he died in mount Hor.</div></div>\n');

		expect(verse.tableFormat('jackInTheBeanstalk')).toBe("<tr id=jackInTheBeanstalk title='as selected'><td style=vertical-align:top;text-align:right>123<td> from <a class=cite href=http://www.blueletterbible.org/Bible.cfm?b=Num&c=33#39 target=the_bible>Numbers&nbsp;33:39</a><div class=verseText style=left-padding: 3em>And Aaron was an <span class=numInVerse title=123>hundred and twenty and three</span> years old when he died in mount Hor.</div>\n");
	});


	it("expanding works correctly", function() {
		$('body').append(
		var verse = new Verse([123, 
			"When the LORD thy God shall bring thee into the land whither thou goest to possess it, and hath cast out many nations before thee, the Hittites, and the Girgashites, and the Amorites, and the Canaanites, and the Perizzites, and the Hivites, and the Jebusites, <7|seven> nations greater and mightier than thou;", "Deuteronomy 7:1"]);

	});


});

