/*
 *  find_hit.cpp
 *  geddon
 *
 *  Created by Allan Bonadio on 8/26/12.
 *  Copyright 2012-2014 Tactile Interactive. All rights reserved.
 *
 */

#include "geddon.h"

static void (*calcDeltaProc)(void);

// ok so we have an omega that falls within the omega range, but we still need to find a specific target and inception date, within their ranges, that'll work.  In the most general case, it's a guess along a range, but more probably it's constrained to one.  
void clarifyForRange(Number *omega) {
	// given  /end of inception, calculate two ends of the target range; print any that are good
	(*calcDeltaProc)();  // I don't think we have to do this
	
	int abw =  deltaNum + omega->number;
	int targ, incep;
	
	targ = abw + inceptionObj->startDate;
	if (targ >= targetStart && targ <= targetEnd)
		(*printAHit)(omega, inceptionObj->startDate, targ);
	else {
		incep = targetStart - abw;
		if (incep >= inceptionObj->startDate && incep <= inceptionObj->endDate)
			(*printAHit)(omega, incep, targetStart);
	}
	
	targ = abw + inceptionObj->endDate;
	if (inceptionObj->endDate > inceptionObj->startDate && targ >= targetStart && targ <= targetEnd)
		(*printAHit)(omega, inceptionObj->endDate, targ);
	else {
		incep = targetEnd - abw;
		if (targetEnd > targetStart && incep >= inceptionObj->startDate && incep <= inceptionObj->endDate)
			(*printAHit)(omega, incep, targetEnd);
	}
}


////////////////////////////////////////////// Notables


Notable::Notable(const Notable&z) {
	description = z.description;
	verse = z.verse;
	credibility = z.credibility;
	nextSame = NULL;  // not the next; it's different
}

Notable::Notable(const char *desc, const char *ver, int cred)
: description(desc), verse(ver), credibility(cred), nextSame(NULL) {
}


//////////////////////////////////////////////////////////////////// Numbers

Number::Number(const Number&z) 
: Notable(z.description, z.verse, z.credibility), number(z.number), sortOrder(z.sortOrder) {
}

Number::Number(int val, int sortOrder, const char *desc, const char *ver, int cred)
: Notable(desc, ver, cred), number(val), sortOrder(sortOrder) {
}


Number *smallNumberIndex[HIGHEST_BIBLE_SMALL];
Number *largeNumberIndex[HIGHEST_BIBLE_HUNDRED];
Number *hugeNumberIndex;

// the actual table ends with a zero number.  Is counted by setupNumbers() and this is set.
int bibleNumberCount;

// do once upon program startup to prepare.
// Actually constructs largeNumberIndex[] and smallNumberIndex[]
void setupNumbers(void) {
	for (int i = 0; i < HIGHEST_BIBLE_SMALL; i++)
		smallNumberIndex[i] = NULL;
	for (int i = 0; i < HIGHEST_BIBLE_HUNDRED; i++)
		largeNumberIndex[i] = NULL;
	hugeNumberIndex = NULL;
	
	// for all bible numbers, string up the objects (citations.cpp and genCitations.cpp) into the proper kind of number index we want
	for (bibleNumberCount = 0;; bibleNumberCount++) {
		Number *num = bibleNumbers + bibleNumberCount;
		if (num->number == 0) break;
		
		if (num->number >= HIGHEST_BIBLE_LARGE) {
			// just toss it right here.  single linked list
			num->nextSame = hugeNumberIndex;
			hugeNumberIndex = num;
			////printf("A huge number: %d\n", num->number);
		}
		else if (num->number >= HIGHEST_BIBLE_SMALL) {
			// insert in head of linked list for big numbers
			int c = num->number / 100;
			num->nextSame = largeNumberIndex[c];
			largeNumberIndex[c] = num;
		}
		else {
			// insert in head of linked list for little number
			num->nextSame = smallNumberIndex[num->number];
			smallNumberIndex[num->number] = num;
		}
	}
	
#if 0
	// dump out ALL the number refs, just for a look.
	printf("\n    smallNumberIndex:\n");
	for (int n = 0; n < HIGHEST_BIBLE_SMALL; n++) {
		for (Number *num = smallNumberIndex[n]; num; num = (Number *) num->nextSame)
			printf("%d: %s: %s\n", num->number, num->verse, num->description);
	}
	printf("\n\n   largeNumberIndex:\n");
	for (int nn = 0; nn < HIGHEST_BIBLE_HUNDRED; nn++)	{
		for (Number *num = largeNumberIndex[nn]; num; num = (Number *) num->nextSame)
			printf("%d: %s: %s\n", num->number, num->verse, num->description);
	}
	printf("\n\n   hugeNumberIndex:\n");
	for (Number *num = hugeNumberIndex; num; num = (Number *) num->nextSame)
		printf("%d: %s: %s\n", num->number, num->verse, num->description);
	
	
#endif

	// just need to set inceptionDateCount
	for (inceptionDateCount = 0; ; inceptionDateCount++)
		if (inceptionDates[inceptionDateCount].startDate == -1074140 && 
			inceptionDates[inceptionDateCount].endDate == -1074140)
			break;
}


lookupCallbackType lookupCallback = clarifyForRange;
int lookupStart;
int lookupEnd;
bool lookupUnique, lookupContinue;

static void lookupRunCallback(Number *num) {
	lookupCallback(num);
	if (lookupUnique)
		lookupContinue = false;
}

// given this pair of numbers n, a range, possibly zero width, look it up and call the callback once for each instance
static void lookupSmallNumberRange(void) {
	// throughout the whole range
	for (long n = lookupStart; n <= MIN(lookupEnd, HIGHEST_BIBLE_SMALL-1) && lookupContinue; n++) {
		// checkout this number, and print if it occurs in bible
		for (Number *num = smallNumberIndex[n]; num && lookupContinue; num = (Number *) num->nextSame)
			lookupRunCallback(num);
	}
}
// given this pair of numbers n, a range, possibly zero width, look it up and call the callback once for each instance
static void lookupLargeNumberRange(void) {
	// throughout the whole range, by 100s, but only 'large' territory
	int lStart = MAX(lookupStart, HIGHEST_BIBLE_SMALL) / 100;
	int lEnd = MIN(lookupEnd + 99, HIGHEST_BIBLE_LARGE) / 100;
	for (long nn = lStart;
			nn <= lEnd; nn++) {
		// in this case, each linked list has different numbers, all within that century so we have to filter for exact matches
		for (Number *num = largeNumberIndex[nn]; num && lookupContinue; num = (Number *) num->nextSame)
			if (num->number >= lookupStart && num->number <= lookupEnd)
				lookupRunCallback(num);
	}
}

static void lookupHugeNumberRange(void) {
	// just a list, search whole list for exact matches
	for (Number *num = hugeNumberIndex; num && lookupContinue; num = (Number *) num->nextSame)
		if (num->number >= lookupStart && num->number <= lookupEnd)
			lookupRunCallback(num);
}

// given this pair of numbers over a range, possibly zero width, for omega, 
// look it up in the numbers list and call the callback:
// unique true: once for each integer  unique false: once for each ref for each integer
void lookupNumberRange(int nStart, int nEnd, bool unique, lookupCallbackType callback) {
	if (nEnd < nStart)
		throw "nEnd < nStart";
	if (nEnd < 1)
		return;  // no answers, out of range
	
	// all done thru globals
	if (callback)
			lookupCallback = callback;  // might already be set
	lookupStart = nStart;
	lookupEnd = nEnd;
	lookupUnique = unique;
	lookupContinue = true;
	
	// only lookup what might be true - possibly looking up in all 3 tables.
	// Note these are NOT EQUIVALENT relations!
	// pay attention to lookupStart & lookupEnd
	if (lookupStart < HIGHEST_BIBLE_SMALL)
		lookupSmallNumberRange();
	if (lookupEnd >= HIGHEST_BIBLE_LARGE)
		lookupHugeNumberRange();
	if (lookupStart < HIGHEST_BIBLE_LARGE && lookupEnd >= HIGHEST_BIBLE_SMALL)
		lookupLargeNumberRange();				
};

void lookupOmegaRange() {
	lookupNumberRange(omegaStart, omegaEnd, true);
};

////////////////////////////////////////////// Dates
// used mostly for inception

BiblicalDate::BiblicalDate(const Ystr dateStr, const char *desc, const char *reference)
: Notable(desc, reference)
{
	parseToSdn(dateStr, &startDate, &endDate);
}



////////////////////////////////////////////// Main

static void (*(loopLevels[9]))(int);

// try different values of alpha
static void loopForAlpha(int llevel) {
	llevel++;
	for (int ai = 0; ai < bibleNumberCount && hitCount < hitListMaxLen; ai++) {
		alphaObj = &bibleNumbers[ai];
		////printf("%d = alpha, %s\n", alphaObj->number, alphaObj->description);
		(*loopLevels[llevel])(llevel);
	}
}

// try different values of beta
static void loopForBeta(int llevel) {
	llevel++;
	for (int bi = 0; bi < bibleNumberCount && hitCount < hitListMaxLen; bi++) {
		betaObj = &bibleNumbers[bi];
		////printf("  %d = beta, %s\n", betaObj->number, betaObj->description);
		(*loopLevels[llevel])(llevel);
	}
}


// always the last (tightest inside, highest index) in the loop levels
static void loopForInception(int llevel) {
	(*calcDeltaProc)();
	for (int ii = 0; ii < inceptionDateCount && hitCount < hitListMaxLen; ii++) {
		inceptionObj = inceptionDates + ii;
		
		// given that the startdate is a range, and so is the target date, 
		// find the absolute minimum and maximum that omega could possibly be
		int fStart = targetStart - inceptionObj->endDate - deltaNum;
		int fEnd = targetEnd - inceptionObj->startDate - deltaNum;
		
		// cut out implausible numbers while converting to ints
		omegaStart = MAX(0, fStart);
		omegaEnd = MAX(0, fEnd);
		
		lookupOmegaRange();
	}
}

// always alpha, beta and inception
void generate3LoopLevels(void) {
	alphaObj = betaObj = NULL;
	loopLevels[0] = loopForAlpha;
	loopLevels[1] = loopForBeta;
	loopLevels[2] = loopForInception;
	loopLevels[3] = NULL;
	(*loopLevels[0])(0);
}

// always alpha and inception
void generate2LoopLevels(void) {
	alphaObj = betaObj = NULL;
	loopLevels[0] = loopForAlpha;
	loopLevels[1] = loopForInception;
	loopLevels[2] = NULL;
	(*loopLevels[0])(0);
}

// one of these for each formula
// this one is for Alpha times Beta plus Omega formula
static void MultFormulacalcDelta(void) {
	deltaNum = (double) alphaObj->number * (double) betaObj->number;
}


// do it!  given a target date or range, find some numbers that add (& multiply) up to it
// for target = inception + alpha * beta + omega
void generateForMultFormula(void) {
	matchEquation = "a*b+w+i=t";
	calcDeltaProc = MultFormulacalcDelta;
	generate3LoopLevels();
}

static void AddFormulacalcDelta(void) {
	deltaNum = (double) alphaObj->number;
}

// for target = inception + alpha + omega
void generateForAddFormula(void) {
	matchEquation = "a+w+i=t";
	calcDeltaProc = AddFormulacalcDelta;
	generate2LoopLevels();
}



