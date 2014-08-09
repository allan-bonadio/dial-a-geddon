#!/usr/bin/php
<?
//
// Capture Numbers -- create dataset of biblical number citations
//
// for tests of the geddon program, see test.cpp
// to run, just run it!  no args; generates genCitations.h and then does self test.

global $book, $bix, $chapter_verse, $originalVerse, $morphingVerse;

$lineToWatch = "$$$$";  // for debugging
global $maxLines;
$maxLines = 1000;  // testing
$maxLines = 99999;  // all

# fun to watch numbers being understood by rewriting
$rewriteTrace = false;
//$rewriteTrace = true;  ////

// simulate version of Dec 2012; compare with *Dec2012.*  Both should have a few extras but that's it
$olderGC = true;
$olderGC = false;

// we don't make citations for numbers this big or smaller
global $numsTooSmall;
$numsTooSmall = $olderGC ? 1 : 2;


$jamesF = fopen('JamesFiltered.txt', 'r');
//$jamesD = fopen('jd.txt', 'w');  // diff for verifying digitization
$jamesD = fopen('JamesDigitized.txt', 'w');  // diff for verifying digitization

global $genCitations, $olderGC;
//$genCitations = fopen('gc.h', 'w');  // actual C++ source
$genCitations = fopen('genCitations.h', 'w');  // actual C++ source

// convert wordy numbers eg 'twenty' into tokens like '#20#'
// must pass both cardinal ('three') and ordinal ('third') as input
// also -fold eg 'twentyfold' into like '#20#fold'
// the Ord can also be an alternate phrasing
function digitize($wordCard, $wordOrd, $number) {
	global $book, $bix, $chapter_verse, $originalVerse, $morphingVerse;
	
	// case insensitive, compile regex
	// avoid a zillion entries for 'second', etc
	if (number < 10 || ! $wordOrd)
		$morphingVerse = preg_replace("@\\b($wordCard)(fold|)\\b@iS", "#$number#$2", $morphingVerse);
	else
		$morphingVerse = preg_replace("@\\b($wordCard|$wordOrd)(fold|)\\b@iS", "#$number#$2", $morphingVerse);
}

// after a match like /#(number)# (and) #(number)#/, add em together to get #total#
function addNumbersCallback($match) {
	$total = ((int) $match[1]) + ((int) $match[3]);
	////var_dump('matches 1 & 3 and then total:', $match, $total);////
	return '#' . $total . '#';
}

// parse & compute a wordy number between 1 and 999.  This might be the whole number or might just be a segment of thousands
function threeDigitNumbers($str) {
	global $lineToWatch;
	// nobody says 'forty and two hundred' so we can turn 'two hundred' into 200.
	// not so for thousands
	if (strpos($str, $lineToWatch) !== false)////
		echo "\nP ". $str . "\n";
	
	// multiply in 'hundreds'
	$str = preg_replace('=(\\d)# #100#=', '${1}00#', $str);
	if (strpos($str, $lineToWatch) !== false)////
		echo "\nQ ". $str . "\n";

	// now do additions but only with the word 'and', so 'forty and two thousand' => 42 thousand.  Twice to get eg "100 and 40 and 4"
	$str = preg_replace_callback('=#(\\d+)# (and) #(\\d+)#=i', 'addNumbersCallback', $str);
	$str = preg_replace_callback('=#(\\d+)# (and) #(\\d+)#=i', 'addNumbersCallback', $str);

	if (strpos($str, $lineToWatch) !== false)////
		echo "\nR ". $str . "\n";
	
	return $str;
}

function dumpNumAndPrevNums($num)
{////
	////global $prevNums;
	
	echo "\n$$reference\n";
	echo (1 != $num) . "= 1!=num\n";
	echo empty($prevNums[$num]) . "=empty(prevNums[num])\n";
	echo strpos($line, ' thousands') . "=strpos(' thousands', line)\n";
	echo "$line\n";
	echo (1 != $num && empty($prevNums[$num]))."=1 != num && empty(prevNums[$num])\n";
	echo (!(strpos($line, ' thousands')))."=!(strpos(' thousands', line))\n";
	echo (!(1000 == $num))."=!(1000 == num)\n";
	echo (!(1000 == $num && strpos($line, ' thousands')))."=!(1000 == num && strpos(' thousands', line))\n";
	echo (((1 != $num && empty($prevNums[$num]) && 
		!(1000 == $num && strpos($line, ' thousands')))))."=(1 != $num && empty(prevNums[$num]) && 
		!(1000 == $num && strpos(' thousands', line)))\n";
	echo "=\n";
}


// looks like a good one for the genCitations file... a few last checks
function listCiteCandidate($angledVerse, &$prevNums, $num, $wordyNumber) {
	global $genCitations, $olderGC;
	global $book, $bix, $chapter_verse, $originalVerse, $morphingVerse;
	global $numsTooSmall;
	
	// And every one that was in distress, and every one that was in debt, and every one that was discontented
	// c'mon ignore the word 'one' unless it's been rolled into a larger number.
	// same for 2 and a few more
	if ($num <= $numsTooSmall)
		return;
	if (! empty($prevNums[$num]))
		return;  // already did this one in this verse
	
	// and make you all captains of thousands, and captains of hundreds
	// ok those dont count either
	if (1000000 == $num && 'millions' == $wordyNumber && !$olderGC) {
		echo "Hey ok to skip millions '$wordyNumber': $angledVerse\n";
		return;
	}
	if (1000 == $num && 'thousands' == $wordyNumber) {
		echo "Hey ok to skip thousands '$wordyNumber': $angledVerse\n";
		return;
	}
	if (100 == $num && 'hundreds' == $wordyNumber && !$olderGC) {
		echo "Hey ok to skip hundreds '$wordyNumber': $angledVerse\n";
		return;
	}

	preg_match('/(\d\d\d):(\d\d\d)/', $chapter_verse, $cv);
	$chapter = intval($cv[1]);
	$verse = intval($cv[2]);
	echo "list(chapter, verse): list($chapter, $verse)\n";
	$reference = "$book $chapter:$verse";

	////var_dump("    The match:", $match);////
	if ($olderGC)
		fprintf($genCitations, 
				"\tNumber(%d, \"%s\", \"%s\"),\n",
				$num,   // the Number
				$originalVerse,
				$reference);  // should look like "Ezra 8:23"
	else
		fprintf($genCitations, 
				"\tNumber(%d, %d, \"%s\", \"%s\"),\n",
				$num,   // the Number
				($bix * 1000 + $chapter) * 1000 + $verse,
				$angledVerse,
				$reference);  // should look like "Ezra 8:23"
	$prevNums[$num] = 1;
}

// generate a citation for the verse with no changes to text
function rewriteVerbatim() {
	global $genCitations, $olderGC;
	global $book, $bix, $chapter_verse, $originalVerse, $morphingVerse;
	////echo "starting rewriteVerbatim with `$morphingVerse`\n";////

	// now go back and find all numbers (now enclosed by #s).  one match per hit in this line



	//if (preg_match('/^Hebrews/', $chapter_verse)) echo "A hebrewew: \n";


	if (preg_match_all('/#(\d+)#/', $morphingVerse, $matches, PREG_SET_ORDER)) {
		//if (preg_match('/^Hebrews/', $chapter_verse)) echo "A hebrewew wif numbers: \n";////
		// there's one or more numbers in this verse
		//echo "starting rewriteVerbatim got numz in  `$morphingVerse`\n";////
		$vnum = preg_replace('/0*(\d+?):0*(\d+?)/', '$1:$2', $chapter_verse);
		$reference = "$book $vnum";
		////var_dump("The ref, vnum, line bd:", $reference, $vnum, $lineBreakdown);////
		
		$prevNums = array();
		foreach ($matches as $match) {
			$num = (int) $match[1];
			
			// too many ones, as in "... that every one that findeth me shall slay me ..."
			// lots of verses have same number twice - don't list it again!
			// oh and '...of the thousands of Israel...' ignore those
			if (false && 1000 == $num) {////
				//// dump something
			}////
			
			if (1 != $num && empty($prevNums[$num]) && 
					!(1000 == $num && strpos($originalVerse, ' thousands'))) {
				//var_dump("    The match & num:", $match, $num);////
				fprintf($genCitations, 
					"\tNumber(%d, \"%s\", \"%s\"),\n",
					$num,   // the Number
					$originalVerse, // should be original biblical text of verse with wordy numbers
					$reference);  // should look like "Ezra 8:23"

				$prevNums[$num] = 1;
			}
		}
	}

}



function rewriteWithAngleBrackets() {
	global $genCitations, $olderGC;
	global $book, $bix, $chapter_verse, $originalVerse, $morphingVerse;
	
	echo "rewriteWithAngleBrackets: book=$book,bix=$bix,chapter_verse=$chapter_verse,originalVerse=$originalVerse,$morphingVerse\n";

////	if (preg_match_all('/#(\d+)#/', $morphingVerse, $matches, PREG_SET_ORDER)) {
////		// there's one or more numbers in this verse
////		$vnum = preg_replace('/0*(\d+?):0*(\d+?)/', '$1:$2', $chapter_verse);
////		$reference = $book .' '. $vnum;
////		////var_dump("The ref, vnum, line bd:", $reference, $vnum, $lineBreakdown);////
////		
////		$prevNums = array();
////
////	}

	$angledVerse = '';
	$originalMeal = $originalVerse;
	$morphingMeal = $morphingVerse;
	
	$segs = explode('#', $morphingVerse);
	$proseSegs = array();
	$numberSegs = array();
	$wordyNumbers = array();
	$numberNums = array();

	// if the same num appears multiple times in same verse, only list it once in citations file	
	$prevNums = array();

	// construct the verse with magic <number> tags.  
	// There's always N wordy numbers and N+1 segments of prose in between.
	// always an even number of # therefore an odd number of segs and iterations
	$prose = true;
	$lastProse = '';
	$num = 'none';
	foreach ($segs as $seg) {
		if ($prose) {
			// surrounding text: iterations 0, 2, 4, 6
			// only interesting after the first number has been gotten
			if ($num != 'none') {
				if ($seg)
					list($wordyNumber, $originalMeal) = explode($seg, $originalMeal);
				else {
					$wordyNumber = $originalMeal;
					$originalMeal = '';
				}
				$wordyNumbers[] = $wordyNumber;
				$numNumbers[] = $num;
				$angledVerse .= "<$num|$wordyNumber>";
			}
			else {
				// iteration zero piece of prose in the beginning.
				$originalMeal = str_replace($seg, '', $originalMeal);
			}
			$angledVerse .= $seg;
			
			$proseSegs[] = $seg;
		}
		else {
			// number
			$num = (int) $seg;

		}
		$prose = ! $prose;
	}
	//var_dump("proseSegs, wordyNumbers, numNumbers, textOut:", $proseSegs, $wordyNumbers, $numNumbers, $angledVerse);////


	// create citation records for each num in this verse, using rewritten verse
	$prose = true;
	foreach ($numNumbers as $ix => $num) {
		// number
		// maybe, add to candidates
		listCiteCandidate($angledVerse, $prevNums, $numNumbers[$ix], $wordyNumbers[$ix]);
	}
}


// numbers that are difficult or impossible, we punt on
$skipThese = array(
////	// must be listed as in james digitized; eg '1 Corinthians004:036'
////	  // supposed to be one number: WTF?!?!?!
////	  // an hundred thousand and fifty and one thousand and four hundred and fifty
////	"Numbers002:016" => 1,
////	
////	// Thou art our sister, be thou the mother of thousands of millions, 
////	"Genesis024:060" => 1,
////	
////	// to be rulers of thousands, and rulers of hundreds, rulers of fifties...
////	// those doesn't count
////	"Exodus018:021" => 1,
////	"Exodus018:025" => 1,
////	"Exodus020:006" => 1,
////	"Exodus034:007" => 1,
////	"Numbers001:016" => 1,
////	"Numbers010:004" => 1,
////	"Numbers010:036" => 1,
////	"Numbers 31:14" => 1,
////	"Numbers 31:52" => 1,
////	"Numbers 31:54" => 1,
////	"Deuteronomy 1:15" => 1,
);

// find individual number words and convert them into eg #60#
function rewriteAtoms() {
	digitize('one', 'first', 1);
	digitize('two', 'second', 2);
	digitize('three', 'third', 3);
	digitize('four', 'fourth', 4);
	digitize('five', 'fifth', 5);
	digitize('six', 'sixth', 6);
	digitize('seven', 'seventh', 7);
	digitize('eight', 'eighth', 8);
	digitize('nine', 'ninth', 9);
	
	digitize('ten', 'tenth', 10);
	digitize('eleven', 'eleventh', 11);
	digitize('twelve', 'twelfth', 12);
	digitize('thirteen', 'thirteenth', 13);
	digitize('fourteen', 'fourteenth', 14);
	digitize('fifteen', 'fifteenth', 15);
	digitize('sixteen', 'sixteenth', 16);
	digitize('seventeen', 'seventeenth', 17);
	digitize('eighteen', 'eighteenth', 18);
	digitize('ninteen', 'nineteenth', 19);
	
	digitize('twenty', 'twentieth', 20);
	digitize('thirty', 'thirtieth', 30);
	digitize('forty', 'fortieth', 40);
	digitize('fifty', 'fiftieth', 50);
	digitize('sixty', 'sixtieth', 60);
	digitize('seventy', 'seventieth', 70);
	digitize('eighty', 'eightieth', 80);
	digitize('ninety', 'nintieth', 90);
	
	digitize('twoscore', NULL, 40);
	digitize('threescore', NULL, 60);
	digitize('fourscore', NULL, 80);
	
	digitize('hundreds', 'an hundred', 100);
	digitize('hundred', 'hundredth', 100);
	digitize('thousand', 'thousandth', 1000);
	digitize('thousands', NULL, 1000);	
	if (! $olderGC)
		digitize('million', 'millions', 1000000);  // ignored anyway cuz generic
}

# sometimes like 'three hundred and sixteen', other times 'three hundred sixteen'
# and sometimes 'sixteen and three hundred' see 1Kings005:015
$n = 0;
$bix = 0; $book = '';
// each $line is a verse
while ($line = fgets($jamesF)) {
	// syntax of line is like 
	// pick apart into book, chapter:verse, and actual text of verse
	global $book, $bix, $chapter_verse, $originalVerse, $morphingVerse;
	global $genCitations, $olderGC;
	
	// skip blank or other lines
	if (preg_match('/([a-zA-Z0-9 ]+)(\d\d\d:\d\d\d) (.*)$/', $line, $lineBreakdown)) {
		$prevBook = $book;
		list($z, $book, $chapter_verse, $originalVerse) = $lineBreakdown;
		if ($prevBook != $book)
			$bix++;  // book index, genesis=1
		
		if (empty($skipThese[$book . $chapter_verse])) {
	
		
			$morphingVerse = $originalVerse;  // actual verse text
			if ($rewriteTrace) echo "rewriteTrace [$book,$chapter_verse] raw `$morphingVerse`\n";
		
			// find individual number words and convert them into eg #60#
			rewriteAtoms();
		
			if ($rewriteTrace) echo "      with atoms `$morphingVerse`\n";
			if (strpos($morphingVerse, $lineToWatch) !== false)////
				echo "\n JJ" . $morphingVerse . "\n";
			if (strpos($morphingVerse, '#') !== false) {
				// lines with numbers in them
				
				// some tough test cases:
				// addition before multiplication for "forty and two thousand" so its 42000 not 2040	
				// #3# #100# -> #300# whether 3 is 1 or 2 digits
				// #40# and #2# #1000# #3# #100# and #60# => 42360
				
				if (strpos($morphingVerse, $lineToWatch) !== false)////
					echo "\nAA ". $morphingVerse . "\n";
			
			
				$linePieces = explode('#1000#', $morphingVerse);
				$newPieces = array();
				foreach ($linePieces as $piece)
					$newPieces[] = threeDigitNumbers($piece);
				$morphingVerse = implode('#1000#', $newPieces);
				if ($rewriteTrace) echo "  3 digit pieces `$morphingVerse`\n";
			
				// now you can multiply by the thousands
				$morphingVerse = preg_replace('=(\\d)# #1000#=', '${1}000#', $morphingVerse);
				$morphingVerse = preg_replace('=(\\d)# #1000#=', '${1}000#', $morphingVerse);
				if (strpos($morphingVerse, $lineToWatch) !== false)////
					echo "\nAAA ". $morphingVerse . "\n";
				if ($rewriteTrace) echo "  with thousands `$morphingVerse`\n";
			
				// add the thousands segments
				$morphingVerse = preg_replace_callback('=#(\\d+)# (and |)#(\\d+)#=i', 'addNumbersCallback', $morphingVerse);
				////$morphingVerse = preg_replace_callback('=#(\\d+)# (and |)#(\\d+)#=i', 'addNumbersCallback', $morphingVerse);
				if ($rewriteTrace) echo " thou segs added `$morphingVerse`\n";
			
				if (strpos($morphingVerse, $lineToWatch) !== false)////
					echo "\nY ". $morphingVerse . "\n";
			
				// once more for the tough cases like this:
				// all the days of Mahalaleel were #890# and #5# years
				$morphingVerse = preg_replace_callback('=#(\\d+)# (and |)#(\\d+)#=i', 'addNumbersCallback', $morphingVerse);
				if ($rewriteTrace) echo "     tough cases `$morphingVerse`\n";
			
				if (strpos($morphingVerse, $lineToWatch) !== false)////
					echo "\nZ ". $morphingVerse . "\n";
			
				rewriteWithAngleBrackets();
				//rewriteVerbatim();
			}
		}
		
		
		// james digitized must have every verse
		fputs($jamesD, $book . $chapter_verse .' '. $morphingVerse . "\n");
		
		// there's a few thousand of these in the whole bible 
		// but you can shorten it with maxLines
		global $maxLines;
		$n++;
		////echo "if ($n > $maxLines) break;\n";
		if ($n > $maxLines) break;
	}
}

fclose($jamesF);
fclose($jamesD);
fclose($genCitations);


//////////////////////////////////////////////// Tests for Number Construction

// now some testing of the results
function checkANumber($shouldBe, $textIgnored, $reference, $invert = false) {
	// grep with no magic chars
	$output = `grep 'Number[(]$shouldBe, ".*", "$reference"[)]' genCitations.h | wc -l`;
	if ((1 != $output) ^ $invert)
		echo "Error at $reference, should ". ($invert ? " not " : "") ."be an occurrence of $shouldBe\n";
	else 
		echo "Test on $reference succeeded.\n";
}

// The whole congregation together was forty and two thousand three hundred and threescore
checkANumber(42360, "", "Ezra 2:64");

// And all the days of Mahalaleel were eight hundred ninety and five years: and he died.
checkANumber(895, "", "Genesis 5:17");

// And all the days of Jared were nine hundred sixty and two years: and he died.
checkANumber(962, "", "Genesis 5:20");

// And all the days of Lamech were seven hundred seventy and seven years: and he died.
checkANumber(777, "", "Genesis 5:31");

// Six days shall work be done, but on the seventh day there shall be to you an holy day, a sabbath of rest to the LORD: whosoever doeth work therein shall be put to death.
checkANumber(6, "", "Exodus 35:2");

// And he made fifty loops upon the uttermost edge of the curtain in the coupling, and fifty loops made he upon the edge of the curtain which coupleth the second.
checkANumber(50, "", "Exodus 36:17");

// And their meat offering shall be of flour mingled with oil, three tenth deals unto every bullock of the thirteen bullocks, two tenth deals to each ram of the two rams,
checkANumber(13, "", "Numbers 29:14");

// And their meat offering shall be of flour mingled with oil, three tenth deals unto every bullock of the thirteen bullocks, two tenth deals to each ram of the two rams,
checkANumber(12, "", "Numbers 29:14");

// The nineteenth to Mallothi, he, his sons, and his brethren, were twelve:
checkANumber(12, "", "1 Chronicles 25:26");

// And the king said unto Esther the queen, The Jews have slain and destroyed five hundred men in Shushan the palace, and the ten sons of Haman; what have they done in the rest of the king's provinces? now what is thy petition? and it shall be granted thee: or what is thy request further? and it shall be done.
checkANumber(500, "", "Esther 9:12");

// And the king said unto Esther the queen, The Jews have slain and destroyed five hundred men in Shushan the palace, and the ten sons of Haman; what have they done in the rest of the king's provinces? now what is thy petition? and it shall be granted thee: or what is thy request further? and it shall be done.
checkANumber(10, "", "Esther 9:12");

// Yet gleaning grapes shall be left in it, as the shaking of an olive tree, two or three berries in the top of the uppermost bough, four or five in the outmost fruitful branches thereof, saith the LORD God of Israel.
checkANumber(2, "", "Isaiah 17:6");

// Yet gleaning grapes shall be left in it, as the shaking of an olive tree, two or three berries in the top of the uppermost bough, four or five in the outmost fruitful branches thereof, saith the LORD God of Israel.
checkANumber(3, "", "Isaiah 17:6");

// Yet gleaning grapes shall be left in it, as the shaking of an olive tree, two or three berries in the top of the uppermost bough, four or five in the outmost fruitful branches thereof, saith the LORD God of Israel.
checkANumber(4, "", "Isaiah 17:6");

// Yet gleaning grapes shall be left in it, as the shaking of an olive tree, two or three berries in the top of the uppermost bough, four or five in the outmost fruitful branches thereof, saith the LORD God of Israel.
checkANumber(5, "", "Isaiah 17:6");

// But other fell into good ground, and brought forth fruit, some an hundredfold, some sixtyfold, some thirtyfold.
checkANumber(100, "", "Matthew 13:8");

// But other fell into good ground, and brought forth fruit, some an hundredfold, some sixtyfold, some thirtyfold.
checkANumber(60, "", "Matthew 13:8");

// But other fell into good ground, and brought forth fruit, some an hundredfold, some sixtyfold, some thirtyfold.
checkANumber(30, "", "Matthew 13:8");

// What man of you, having an hundred sheep, if he lose one of them, doth not leave the ninety and nine in the wilderness, and go after that which is lost, until he find it?
checkANumber(99, "", "Luke 15:4");

// Simon Peter went up, and drew the net to land full of great fishes, an hundred and fifty and three: and for all there were so many, yet was not the net broken.
checkANumber(153, "", "John 21:11");

// And this I say, that the covenant, that was confirmed before of God in Christ, the law, which was four hundred and thirty years after, cannot disannul, that it should make the promise of none effect.
checkANumber(430, "", "Galatians 3:17");

// And I heard the number of them which were sealed: and there were sealed an hundred and forty and four thousand of all the tribes of The children of Israel.
checkANumber(144000, "", "Revelation 7:4");

// And the number of the army of the horsemen were two hundred thousand thousand: and I heard the number of them.
checkANumber(200000000, "", "Revelation 9:16");

// And I will give power unto my two witnesses, and they shall prophesy a thousand two hundred and threescore days, clothed in sackcloth.
checkANumber(1260, "", "Revelation 11:3");

// more that come out wrong
checkANumber(108100, "All that were numbered of the camp of Ephraim were an hundred thousand and eight thousand and an hundred, throughout their armies. And they shall go forward in the third rank.", "Numbers 2:24");
checkANumber(62700, "And his host, and those that were numbered of them, were threescore and two thousand and seven hundred.", "Numbers 2:26");
checkANumber(41500, "And his host, and those that were numbered of them, were forty and one thousand and five hundred.", "Numbers 2:28");
checkANumber(53400, "And his host, and those that were numbered of them, were fifty and three thousand and four hundred.", "Numbers 2:30");
checkANumber(157600, "All they that were numbered in the camp of Dan were an hundred thousand and fifty and seven thousand and six hundred. They shall go hindmost with their standards.", "Numbers 2:31");
checkANumber(603550, "These are those which were numbered of The children of Israel by the house of their fathers: all those that were numbered of the camps throughout their hosts were six hundred thousand and three thousand and five hundred and fifty.", "Numbers 2:32");
checkANumber(7500, "Those that were numbered of them, according to the number of all the males, from a month old and upward, even those that were numbered of them were seven thousand and five hundred.", "Numbers 3:22");
checkANumber(8600, "In the number of all the males, from a month old and upward, were eight thousand and six hundred, keeping the charge of the sanctuary.", "Numbers 3:28");
checkANumber(6200, "And those that were numbered of them, according to the number of all the males, from a month old and upward, were six thousand and two hundred.", "Numbers 3:34");
checkANumber(22000, "All that were numbered of the Levites, which Moses and Aaron numbered at the commandment of the LORD, throughout their families, all the males from a month old and upward, were twenty and two thousand.", "Numbers 3:39");
checkANumber(22273, "And all the firstborn males by the number of names, from a month old and upward, of those that were numbered of them, were twenty and two thousand two hundred and threescore and thirteen.", "Numbers 3:43");
checkANumber(273, "And for those that are to be redeemed of the two hundred and threescore and thirteen of the firstborn of The children of Israel, which are more than the Levites;", "Numbers 3:46");
checkANumber(100, "Moreover thou shalt provide out of all the people able men, such as fear God, men of truth, hating covetousness; and place such over them, to be rulers of thousands, and rulers of hundreds, rulers of fifties, and rulers of tens:
", "Exodus 18:21");
checkANumber(100, "Exodus018:025 And Moses chose able men out of all Israel, and made them heads over the people, rulers of thousands, rulers of hundreds, rulers of fifties, and rulers of tens.
", "Exodus 18:25");


// should NOT happen
checkANumber(1000, "", "Exodus 99:99", true);
checkANumber(100, "Moreover thou shalt provide out of all the people able men, such as fear God, men of truth, hating covetousness; and place such over them, to be rulers of thousands, and rulers of hundreds, rulers of fifties, and rulers of tens:
", "Exodus 18:21");
checkANumber(1000, "", "Exodus 18:21", true);

checkANumber(1000, "", "Exodus 18:25", true);

checkANumber(100, "So there were delivered out of the thousands of Israel, a thousand of every tribe, twelve thousand armed for war.", "Numbers 31:5", true);


