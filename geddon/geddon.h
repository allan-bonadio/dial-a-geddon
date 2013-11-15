/*
 *  geddon.h
 *  geddon
 *
 *  Created by Allan Bonadio on 5/29/11.
 *  Copyright 2011-2014 Tactile Interactive. All rights reserved.
 *
 */

#include <stdio.h>

#include <stdlib.h>
#include <string.h>

///////////////////////////////////////// Y strings: char[YSTR_LEN]
// a string long enough for all citations (1 corinthians 999:999) and lots of other useful strings,
// but not a whole verse.
#define YSTR_LEN  64
typedef char Ystr[YSTR_LEN];
extern void strYcpy(char* dest, const char* src, long count = (YSTR_LEN-1));


///////////////////////////////////////// low level

extern void parseToSdn(const char* str, int* startSdn = NULL, int* endSdn = NULL);
extern int collectToSdn(int year, int month, int date);
extern void formatSdn(int sdn, char* out);

class Notable;
class Number;
class BiblicalDate;

class Notable {
public:
	// what it is according to bible.  or wherever.  eg "number of the beast"
	const char *description;
	
	// book, chapter and verse.  eg "Matthew 6:6" or other source
	const char *verse;
	
	// who cares about this?  
	// 100 = round numbers like 0 or 1.
	// 80 = familiar biblical numbers like 666.  
	// 30 = tedious boring numbers like 'number of followers of Shem'.
	int credibility;
	
	// linked list of Numbers that have same value (or close depending on rules)
	Notable *nextSame;
	
	// constructor
	Notable(const char *desc, const char *ver = "", int cred = 30);
	
	// copy constructor
	Notable(const Notable&z);
};



class Number: public Notable {
public:
	// number in question.  eg 666.
	int number;
	
	int sortOrder;

	// constructor
	Number(int val, int sortOrder, const char *desc, const char *ver = "", int cred = 30);
	
	// copy constructor
	Number(const Number&z);
};


// after Methusala's age , numbers get more sparse so we do them by 100s.
// biggest is like 2e8.  'HIGHEST' is really highest+1 as it's the number of table entries
#define HIGHEST_BIBLE_SMALL 1000
extern Number *smallNumberIndex[HIGHEST_BIBLE_SMALL];
#define HIGHEST_BIBLE_HUNDRED 4001
#define HIGHEST_BIBLE_LARGE (HIGHEST_BIBLE_HUNDRED * 100)
extern Number *largeNumberIndex[HIGHEST_BIBLE_HUNDRED];  // lowest ten are unused as small table does those
extern Number *hugeNumberIndex;

extern void setupNumbers(void);

extern Number *bibleNumbers;  // set to either prod or test
extern int bibleNumberCount;
extern Number testBibleNumbers[];

// finds number in numbers index & list
typedef void (*lookupCallbackType)(Number* num);
extern lookupCallbackType lookupCallback;
extern void lookupNumberRange(int nStart, int nEnd, bool unique, lookupCallbackType callback = NULL);
extern void clarifyForRange(Number *omega);

class BiblicalDate : public Notable {
public:
	int startDate;
	int endDate;
	BiblicalDate(const char *date, const char *desc, const char *reference = "");
};


extern BiblicalDate *inceptionDates;  // set to either prod or test
extern int inceptionDateCount;
extern BiblicalDate testInceptionDates[];


extern int hitCount;
extern long hitListMaxLen;


extern int todaysDate, todaysMonth, todaysYear;
extern Ystr phdSignOfYear, phdYear, phdMonth, phdDate;
extern void arbitrateStartEndDate(int* startSdn, int* endSdn);


#define MIN(a, b) ((a) < (b) ? (a) : (b))
#define MAX(a, b) ((a) < (b) ? (b) : (a))


extern Number *alpha;
extern Number *alphaObj;
extern Number *beta;
extern Number *betaObj;
extern BiblicalDate *inception;
extern BiblicalDate *inceptionObj;

extern int omegaStart, omegaEnd;
extern double deltaNum;
extern const char *matchEquation;

extern int targetStart, targetEnd;

extern void generateForAddFormula(void);
extern void generateForMultFormula(void);

extern void runTests(const char *test_name);

// what to do when the finding stuff finds a hit
extern void (*printAHit)(Number *omega, int incep, int targ);

// these mirror C defines in sndcal.h without the "C"

/* Gregorian calendar conversions. */
extern "C" void SdnToGregorian(int sdn, int *pYear, int *pMonth, int *pDay);
extern "C" int GregorianToSdn(int year, int month, int day);

/* Julian calendar conversions. */
extern "C" void SdnToJulian(int sdn, int *pYear, int *pMonth, int *pDay);
extern "C" int JulianToSdn(int year, int month, int day);


