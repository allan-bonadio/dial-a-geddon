/*
 *  tests.cpp
 *  geddon
 *
 *  Created by Allan Bonadio on 5/24/11.
 *  Copyright 2011-2014 Tactile Interactive. All rights reserved.
 *
 */
// for tests of citation generation, see grabCitations.php

#include "geddon.h"

/////////////////////////////////////////////////////////////////// asserts

static void assertEqual(int a, int b, const char *exprText, const char *msg) {
	if (a == b)
		return;
	
	printf("Assertion Failed '%s' %s, actually %2d != %2d\n", exprText, msg, a, b);
}

static void assertSame(const char* a, const char* b) {
	if (0 == strcmp(a, b))
		return;
	
	printf("Assertion Failed '%s' = '%s'\n", a, b);
}

/////////////////////////////////////////////////////////////////// low level

// testing collectToSdn()
static void testCollect(void) {
	
	assertEqual(collectToSdn(-4713, 1, 2), 1., 
				"collectToSdn(-4713, 1, 2) == 1", 
				"SDN 1 is Jan 2, 4713 BC");
	
	assertEqual(collectToSdn(1990, 1, 1), 2447893., 
				"collectToSdn(1990, 5, 1) == 2447893", 
				"SDN 2447893 is January 1, 1990.");
    
	assertEqual(collectToSdn(2999, 1, 1), 2816423, 
				"collectToSdn(2999, 1, 1) == 2816423", 
				"SDN 2816423 is Jan 1, 2999 AD");
	
	assertEqual(collectToSdn(1582, 1, 1), 2298884, 
				"collectToSdn(1582, 1, 1) == 2298884", 
				"SDN 2298884 is Jan 1, 1582 AD");
	
	assertEqual(collectToSdn(1582, 10, 5), 2299161, 
				"collectToSdn(1582, 10, 5) == 2299161", 
				"SDN 2299161 is Oct 5, 1582 AD");
	
	assertEqual(collectToSdn(1582, 10, 15), 2299161, 
				"collectToSdn(1582, 10, 15) == 2299161", 
				"SDN 2299161 is Oct 15, 1582 AD");
	
	assertEqual(collectToSdn(1583, 1, 1), 2299239, 
				"collectToSdn(1583, 1, 1) == 2299239", 
				"SDN 2299239 is Jan 1, 1583 AD");
}

// testing parseToSdn()
static void testParse(void) {//// 	assertEqual\(start = parseToSdn\("([-0-9]*)", &end\)

	int start, end;
	
	parseToSdn("2999-1-1", &start, &end);assertEqual(start, 2816423, 
				"parseToSdn(2999-1-1) == 2816423", 
				"SDN 2816423 is January 1, 2999");
	assertEqual(start, end, 
				"start==end", 
				"SDN 2816423 is January 1, 2999");
    
	parseToSdn("1970-1-1", &start, &end);assertEqual(start, 2440588, 
				"parseToSdn(1970-1-1) == 2440588", 
				"SDN 2440588 is January 1, 1970.");
	assertEqual(start, end, 
				"start==end", 
				"SDN 2440588 is January 1, 1970.");
    
	parseToSdn("1582-1-1", &start, &end);assertEqual(start, 2298884, 
													  "parseToSdn(1582-1-1) == 2298884", 
													  "SDN 2298884 is January 1, 1582.");
	assertEqual(start, end, 
				"start==end", 
				"SDN 2298884 is January 1, 1582.");
	
	parseToSdn("1-1-1", &start, &end);assertEqual(start, 1721424, 
												  "parseToSdn(1-1-1) == 1721424", 
												  "SDN 1721424 is January 1, year 1");
	assertEqual(start, end, 
				"start==end", 
				"1 1 1");
	
	parseToSdn("1bc-1-1", &start, &end);assertEqual(start, 1721058, 
												  "parseToSdn(1-1-1) == 1721058", 
												  "SDN 1721058 is January 1, year 1");
	assertEqual(start, end, 
				"start==end", 
				"1bc 1 1");
	
	// if first parts are blank, refers to today
	int earlyThisYear = collectToSdn(todaysYear, 2, 2);
	parseToSdn("-2-2", &start, &end);assertEqual(start, earlyThisYear, 
				"parseToSdn(-2-2) == earlyThisYear", 
				"first component blank means this year");
	assertEqual(start, end, 
				"start==end", 
				"first component blank means this year");

	int earlyThisMonth = collectToSdn(todaysYear, todaysMonth, 7);
	parseToSdn("--7", &start, &end);assertEqual(start, earlyThisMonth, 
				"parseToSdn(--7) == earlyThisMonth", 
				"first two components blank means this month");
	assertEqual(start, end, 
				"start==end", 
				"first two components blank means this month");
	
	// if last parts are blank, means All month or All year
	parseToSdn("1970-1-", &start, &end);assertEqual(start, 2440588, 
				"parseToSdn(1970-1-) starts with 2440588", 
				"SDN 2440588 at January 1, 1970.");
	assertEqual(end, 2440618, 
				"ends with 2440618", 
				"SDN 2440618 at January 31, 1970.");

	parseToSdn("1970--", &start, &end);assertEqual(start, 2440588, 
				"parseToSdn(1970--) starts with 2440588", 
				"SDN 2440588 at January 1, 1970.");
	assertEqual(end, 2440952, 
				"ends with 2440952", 
				"SDN 2440952 at Dec 31, 1970.");
}

// testing formatSdn()
static void testFormat(void) {
	char buf[30];
	
	formatSdn(2816423, buf);
	assertSame(buf, "2999-1-1");
	
	formatSdn(2440588, buf);
	assertSame(buf, "1970-1-1");
	
	formatSdn(2298884, buf);
	assertSame(buf, "1582-1-1");
}

static void testMilleniumOffsetting(void) {
	int y, lastSdn = 256406;
	printf("Check the last column printed; should be 365 or 366 depending on year.\n");
	printf("Check esp: 366 every 4 years, and for gregorian: 365 every 100 years, 366 every 400 years.\n");
	printf("gregorian:\n");
	for (y = -4010; y < -2990; y++) {
		int sdn = collectToSdn(y, 1, 1);
		printf("year %d jan1 is %d, %d days\n", y, sdn, sdn-lastSdn);
		lastSdn = sdn;
	}
	printf("\njulian:\n");
	for (y = 990; y < 1310; y++) {
		int sdn = collectToSdn(y, 1, 1);
		printf("year %d jan1 is %d, %d days\n", y, sdn, sdn-lastSdn);
		lastSdn = sdn;
	}
	printf("\ngregorian:\n");
	for (y = 1690; y < 2111; y++) {
		int sdn = collectToSdn(y, 1, 1);
		// count of days from jan1 last year to jan1 this year = ndays in last year
		printf("year %d jan1 is %d, %d days\n", (y-1), sdn, sdn-lastSdn);
		lastSdn = sdn;
	}
	exit(0);
}

///////////////////////////////////////////// lookupNumberRange() & 

// testing smallNumberIndex[] and largeNumberIndex[]; really just listing them all out.
// huge output.  What was i thinking.
static void testBibleNumberIndex(void) {
	printf("sometimes these don't line up cuz the number of digits in the references\n");
	printf("print all small integers (<%d) and which citations they have\n", HIGHEST_BIBLE_SMALL);
	for (int i = 0; i < HIGHEST_BIBLE_SMALL; i++) {
		if (smallNumberIndex[i]) {
			Number *n = smallNumberIndex[i];
			printf("%6d: %12s=%s\n", n->number, n->verse, n->description);
			for (n = (Number *) n->nextSame; n; n = (Number *) n->nextSame)
				printf("        %12s=%s\n", n->verse, n->description);
		}
	}
	printf("print all large integers and which citations they have\n");
	for (long i = 0; i < HIGHEST_BIBLE_HUNDRED; i++) {
		if (largeNumberIndex[i]) {
			printf("%6ld\n", i*100);
			for (Number *n = largeNumberIndex[i]; n; n = (Number *) n->nextSame)
				printf("  %6d: %12s=%s\n", n->number, n->verse, n->description);
		}
	}
}

static void tbnlHandler(Number *n) {
	printf("%6d: %12s=%s\n", n->number, n->verse, n->description);
}

static void lnr(int nStart, int nEnd) {
	//omegaStart = nStart;
	//omegaEnd = nEnd;
	lookupNumberRange(nStart, nEnd, false, tbnlHandler);
}

// tests lookupNumberRange().  
// still generates a lot of output
static void testBibleNumberLookup(void) {
	lookupCallback = tbnlHandler;
	
	printf("Look thru these citations.\nLots of citations for 5:\n");
	lnr(5, 5);
	printf("\nLots of citations for 122:\n");
	lnr(122, 122);
	printf("\nLots of citations for 7337:\n");
	lnr(7337, 7337);
	printf("\nLots of citations for 7338:\n");
	lnr(7338, 7338);
	
	printf("\nLots of citations for the range 100 thru 200:\n");
	lnr(100, 200);
	
	printf("\nLots of citations for the range 2000 thru 3000:\n");
	printf("2000, 3000, \n");
	lnr(2000, 3000);
}


///////////////////////////////////////////// 

// test generateFor{Add,Mult}Formula()
static void testGFAD(void) {
	// i'm really at a loss on how to test this
	// you give it a simple input and it generates gobs of info. how do I check that?
	// maybe with an output file.  How about jimmying up the data?  yeah.
	// mock data
	bibleNumbers = testBibleNumbers;
	inceptionDates = testInceptionDates;
	
	setupNumbers();

	/* this test needs:
	 - more test cases!  more with large and huge numbers!
	 - test also generateForMult()
	 - maybe output file and compare against reference.  easier that way.
	 */
	lookupCallback = tbnlHandler;
	
	int sdate, edate;
	parseToSdn("1-1-12", &sdate, &edate);
	for (int tdate = sdate; tdate < sdate+1; tdate++) {
		Ystr hh;
		formatSdn(tdate, hh);

		printf("\n\n----------------------Target Date: %s\n", hh);
		targetStart = targetEnd = tdate;
		generateForAddFormula();
	}
}

///////////////////////////////////////////// 

void runTests(const char *test_name) {
	printf("starting the %c test.  Generally, silence means success.\n", test_name[0]);

	switch (test_name[0]) {
		case 'p': testParse(); break;
		case 'c': testCollect(); break;
		case 'f': testFormat(); break;
		case 'm': testMilleniumOffsetting(); break;
		case 'i': testBibleNumberIndex(); break;
		case 'l': testBibleNumberLookup(); break;
		case 'g': testGFAD(); break;
		default: printf("No such test %s\n", test_name); break;
	}

	printf("done with the %c test\n", test_name[0]);
}



