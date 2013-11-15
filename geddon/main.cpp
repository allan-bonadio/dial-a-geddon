/*
 *  main -- top level for Geddon program
 *
 *  Created by Allan Bonadio on 5/24/11.
 *  Copyright 2011-2011  Tactile Interactive. All rights reserved.
 *
 */

#include "sdncal.hpp"
#include "geddon.h"
#include <math.h>
#include <time.h>
#include <assert.h>
#include <sys/resource.h>


static time_t tnow = time(NULL);
static struct tm* now = gmtime(&tnow);
int todaysDate = now->tm_mday;
int todaysMonth = now->tm_mon + 1;
int todaysYear = now->tm_year + 1900;

int hitCount;
const int hitListMaxMaxLen = 1e4;
////int hitListMaxLen = 1000;  // configurable by GET arg
long hitListMaxLen = 10;
const long refsListMaxLen (hitListMaxMaxLen / 2);

int realms = 3;


////////////////////////////////////////////// Refs Output

long refsListLen = 0;
int refsList[refsListMaxLen];

// returns false if already included, true if included new
bool includeRefNumber(int num) {
	// first look for it
	for (long i = 0; i < refsListLen; i++) {
		if (refsList[i] == num)
			return false;  // already listed
	}
	
	// not listed.  include it.
	if (refsListLen >= refsListMaxLen)
		printf("\"Too many refs %ld\n\"", refsListLen);
	else
		refsList[refsListLen++] = num;
	return true;
}

static class refVerse *refVerse_list = NULL;
static long refVerse_count = 0;

class refVerse {
public:
	refVerse *nextRefVerse;
	Number *number;  // includes sort order
	
	// constructor
	refVerse(Number *number) : number(number) {
		nextRefVerse = refVerse_list;
		refVerse_list = this;
		refVerse_count++;
	}
};



// we come here for each number reference
void panr(Number *numberObj) {
	// just make a sloppy linked list for now
	new refVerse(numberObj);
	
	//printf("[\"%s\", \"%s\"],\n", numberObj->description, numberObj->verse);
}

int verseOrder(const void *a, const void *b) {
	refVerse **aa = (refVerse **) a;
	refVerse **bb = (refVerse **) b;
	////printf("a=%ld b=%ld diff=%ld\n", (*aa)->number->sortOrder, (*bb)->number->sortOrder, (*aa)->number->sortOrder - (*bb)->number->sortOrder);////
	return (*aa)->number->sortOrder - (*bb)->number->sortOrder;
}


// print them all as part of json output
// for a given number, print out EVERY Number reference for it, in json.
// eg numberObj is "207", this prints that, plus every instance of "two hundred and seven" in the bible.
void printAllNumberRefs() {
	long i;
	for (i = 0; i < refsListLen; i++) {
		int num = refsList[i];
		//printf("\"%d\": [\n", num);
		lookupNumberRange(num, num, false, panr);
		//printf("0],\n\n");
	}
	
	// now make a linear list and sort it
	refVerse **linear = (refVerse **) malloc(sizeof(refVerse *) * refVerse_count);
	i = 0;
	for (refVerse *rv = refVerse_list; rv; rv = rv->nextRefVerse) {
		linear[i++] = rv;
	}
	qsort(linear, refVerse_count, sizeof(refVerse *), verseOrder);
	
	// now you can print them out
	for (i = 0; i < refVerse_count; i++) {
		Number *n = linear[i]->number;
		////printf("%09d\n", n->sortOrder);////
		printf("[%d, \"%s\", \"%s\"],\n", n->number, n->description, n->verse);
	}
}

////////////////////////////////////////////// Hit Output

Number *alphaObj;
Number *betaObj;
BiblicalDate *inceptionObj;
int omegaStart, omegaEnd;
int targetStart, targetEnd;
double deltaNum;
const char *matchEquation;

// set this as the callback for each hit
void (*printAHit)(Number *omega, int incep, int targ) = NULL;

typedef struct formulaWeHaveSeen {
	struct formulaWeHaveSeen *next;
	char formula[YSTR_LEN];
} formulaWeHaveSeen;

static formulaWeHaveSeen *formulasWeHaveSeen = NULL;
//formulaWeHaveSeen *formulasWeHaveSeen = null;

// return true if this is the first time we've seen this formula.
// If any of the numbers in it are new, then 
bool isUnique(char *formula, bool isNew) {
	if (! isNew) {
			// almost half expect to see this one
		for (formulaWeHaveSeen* it = formulasWeHaveSeen; it; it = it->next) {
			if (0 == strcmp(it->formula, formula))
				return false;  // tolja
		}
	}
	
	formulaWeHaveSeen *newOne = (formulaWeHaveSeen *) malloc(sizeof(formulaWeHaveSeen));
	strcpy(newOne->formula, formula);
	newOne->next = formulasWeHaveSeen;
	formulasWeHaveSeen = newOne;
	return true;
}

// the callback I use when a formula hit is found
void printEm(Number *omega, int incep, int targ) {
	char tbuf[YSTR_LEN];
	formatSdn(targ, tbuf);
	char ibuf[YSTR_LEN];
	formatSdn(incep, ibuf);
	char mbuf[YSTR_LEN];
	int smaller, larger;
	
	
	bool isNew = false;
	isNew |= includeRefNumber(alphaObj->number);
	isNew |= includeRefNumber(omega->number);
	smaller = larger = alphaObj->number;
	if (0 == strcmp("a+w+i=t", matchEquation)) {
		// add formula - sort to eliminate duplicates
		if (alphaObj->number < omega->number)
			larger = omega->number;
		else
			smaller = omega->number;
		sprintf(mbuf, "%d+%d+%d=%d", smaller,
				larger, incep, targ);
	}
	else if (0 == strcmp("a*b+w+i=t", matchEquation)) {
		// multiply formula
		isNew |= includeRefNumber(betaObj->number);
		if (alphaObj->number < betaObj->number)
			larger = betaObj->number;
		else
			smaller = betaObj->number;
		sprintf(mbuf, "%d*%d+%d+%d=%d", smaller, larger,
			   omega->number, incep, targ);
	}
	else {
		printf("\"error\": \"!!!! bad match equation\"");
		return;
	}
	
	if (! isUnique(mbuf, isNew))
		return;
	printf("{\"match\": \"%s\",\n", mbuf);

	// these each have 1 ref; that's the way it works
	printf("\"inception\": [%d, \"%s\", \"%s\", \"%s\"],\n", incep, ibuf, inceptionObj->description, inceptionObj->verse);
	printf("\"target\": [%d, \"%s\"],\n", targ, tbuf);

	
	// ok some explainations for date calculations:
	int gap = deltaNum + omega->number;
	printf("\"explain_gap\": %d,\n", gap);  // gap from inception to target
	
	int here = incep;
	int year, month, day, daze, next, eix = 0;
	char *explain_days[10];
	Ystr toStartOfNextYear, toYear1, to1582, in1582, toTargetYear, toTargetDate;
	SdnToJulian(here, &year, &month, &day);
	
	// starting from here= inception date to target date
	if (month != 1 || day != 1) {
		// how long to start of next year
		next = collectToSdn(year+1, 1, 1);
		////formatToSdn(next, nextBuf);
		snprintf(toStartOfNextYear, YSTR_LEN, "%d days to start of year %d", next - here, year + 1);
		explain_days[eix++] = toStartOfNextYear;
		here = next;
	}
	if (here < 1721424) {
		// how long to year 1
		daze = 1721424 - here;
		snprintf(toYear1, YSTR_LEN, "%d days to start of year 1 (%d years with %d leaps)", 
					daze, daze / 365, daze % 365);
		explain_days[eix++] = toYear1;
		here = 0;
	}
	if (here < 2298884) {// jan 1 1582
		// how long to julian-gregorian switchover in 1582 & past
		daze = 2298884 - here;
		snprintf(to1582, YSTR_LEN, "%d days to start of 1582 (%d years with %d leaps)", 
				daze, daze / 365, daze % 365);
		explain_days[eix++] = to1582;
		
		snprintf(in1582, YSTR_LEN, "355 days in year 1582");
		explain_days[eix++] = in1582;
		here = 2299239;  // jan 1 1583
	}
	// start of target year
	SdnToGregorian(targ, &year, &month, &day);
	next = collectToSdn(year, 1, 1);
	daze = next - here;
	snprintf(toTargetYear, YSTR_LEN, "%d days to start of %d (%d years with %d leaps)", 
				daze, year, daze / 365, daze % 365);
	explain_days[eix++] = toTargetYear;
	here = next;
	
	if (1 != month && 1 != day) {
		snprintf(toTargetDate, YSTR_LEN, "%d days to %s", targ - here, tbuf);
		explain_days[eix++] = toTargetDate;
	}
	
	// now make a json array of them howevermany
	printf("\"explain_days\": [");
	int i = 0;
	while (true) {
		printf("\"%s\"", explain_days[i]);
		i++;
		if (i >= eix)
			break;
		printf(", ");
	}
	printf("]\n");
	
	printf("},\n");
	
	
	hitCount++;
}



void setOneAjaxArg(const Ystr key, const Ystr value) {
	Ystr action;  // always 'justify' i guess
	
	if (0 == *key)
		return;
	if (strcasecmp("date", key) == 0)
		strcpy(phdDate, value);
	else if (strcasecmp("month", key) == 0)
		strcpy(phdMonth, value);
	else if (strcasecmp("year", key) == 0)
		strcpy(phdYear, value);
	else if (strcasecmp("phdSignOfYear", key) == 0)
		strcpy(phdSignOfYear, value);
	else if (strcasecmp("action", key) == 0)
		strcpy(action, value);
	else if (strcasecmp("limit", key) == 0) {
		hitListMaxLen = (int) strtol(value, NULL, 10);
		if (hitListMaxLen > hitListMaxMaxLen) hitListMaxLen = hitListMaxMaxLen;
		if (hitListMaxLen < 1) hitListMaxLen = 1;
	}
	else if (strcasecmp("realms", key) == 0) {
		// 2=addition formula only; 3 = add and multiply formulas
		realms = (int) strtol(value, NULL, 10);
	}
	else
		printf("unknown %s = %s\n", key, value);
}

void setAjaxArgs(const char *qs) {
	Ystr estr, kstr;

	// estr collects whatever we're parsing; p points to the exact char
	*estr = *kstr = 0;
	// from an ajax call eg action=justify&month=10&date=3
	char *p = estr;
	while (*qs) {
		switch (*qs) {
				
			case '&':
				*p = 0;
				setOneAjaxArg(kstr, estr);
				p = estr;
				*estr = 0;
				break;
				
			case '=':
				*p = 0;
				strcpy(kstr, estr);
				p = estr;
				break;
				
			case 0:
				break;
				
			default:
				*p++ = *qs;
				if (p - estr >= YSTR_LEN)
					exit(13);  // buffer overflows
		}
		qs++;
	}
	
	// last one
	*p = 0;
	setOneAjaxArg(kstr, estr);
	
	// ok now do something with it
}

// generation of all the combinations		
static void genAllHits() {
	Ystr  sstr, estr;
	formatSdn(targetStart, sstr);
	formatSdn(targetEnd, estr);
	printf("target dates %d=%s ... %d=%s is target date\n", targetStart, sstr, targetEnd, estr);////

	printAHit = printEm;
	lookupCallback = clarifyForRange;
	hitCount = 0;
	printf("<matches>{\"hits\":[\n");
	generateForAddFormula();  // a + w
	// whoa too many ?
	if (realms > 2)
		generateForMultFormula();  // a * b + w
	printf("0], \"refs\":[\n");
	printAllNumberRefs();
	printf("0]}</matches>\n");  // 0=easier than omitting the comma
	printf("total %d hits, %ld different numbers, %ld total refs\n", hitCount, refsListLen, refVerse_count);
}

static void usage(char* argv0) {
	printf("usage: %s 44bc-10-22    # justify armageddon on 22 of October 44 B.C.E.\n", argv0);
	printf("       %s 44-10-22    # justify armageddon on 22 of October 44 C.E. (87 years later)\n", argv0);
	printf("       %s justify 44 10 22 100 3    # justify armageddon on 22 of October 44, max 100 formulas\n", argv0);
	printf("       %s test p    # do test 'p' (see tests.cpp)\n", argv0);
	printf("bc = bce = before year 1   ad = ce = after year 1\n");
	exit(1);
}

int main (int argc, char * const argv[], char * const environment[]) {
	struct rusage startTime, endTime; // for benchmarking
	
	assert(sizeof(int) == 4);
	assert(sizeof(long) == 8);

	try {
		
#if 0
		// diagnostic - print the arguments in headers
		printf("x-Argc: %d\n", argc);  ////
		int a;
		for (a = 0; a < argc; a++)
			printf("x-Argv %d: `%s`\n", a, argv[a]);  ////
#endif
		
#if 0
		int e;
		for (e = 0; environment[e]; e++)
			printf("x-Env: %s\n", environment[e]);  ////
#endif
		
		getrusage(RUSAGE_SELF, &startTime);
		
		////int jj;
		////for (jj = 0; jj < 256; jj++) {
		////	printf("char '%c' (ox%x) iza space=%d, iza blank=%d\n", jj, jj, isspace(jj), isblank(jj));
		////}
		
		setupNumbers();  // required for normal & tests
		char *qs = getenv("QUERY_STRING");
		
		if (qs) {
			// must be from a web page or ajax request
			// HTTP headers
			printf("Content-Type: text/plain\n");
			printf("\n");

			printf("must be from a web page - query string is `%s`\n", qs);////
			printAHit = printEm;
			setAjaxArgs(qs);
			arbitrateStartEndDate(&targetStart, &targetEnd);
		
			genAllHits();
		}
		else {
			// command line date
			switch (argc) {
				case 2:
					printf("must be from the command line - argv1 is %s\n", argv[1]);////
					parseToSdn(argv[1], &targetStart, &targetEnd);
					
					genAllHits();
					break;
					
				case 3:
					printf("must be from the command line - do tests\n");////
					runTests(argv[2]);
					break;
				
				default:
					usage(argv[0]);
					exit(1);
			}
		}
	}
	catch (char* exc) {
		printf("Geddon • Exception: %s\n", exc);
		exit(19);
	}
	
	getrusage(RUSAGE_SELF, &endTime);
	double cpuTime;
	cpuTime = (endTime.ru_utime.tv_sec + endTime.ru_stime.tv_sec - startTime.ru_utime.tv_sec - startTime.ru_stime.tv_sec) + 
		1e-6 * (endTime.ru_utime.tv_usec + endTime.ru_stime.tv_usec - startTime.ru_utime.tv_usec - endTime.ru_stime.tv_sec);
	printf("totalcpu: %1.3f sec\n", cpuTime);

	return 0;
}
