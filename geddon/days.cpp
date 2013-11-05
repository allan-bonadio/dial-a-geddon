/*
 *  days -- routines for parsing, formatting and messing with SDNs and strings
 *
 *  Created by Allan Bonadio on 8/24/12.
 *  Copyright 2012-2014 Tactile Interactive. All rights reserved.
 *
 */

#include "sdncal.hpp"
#include "geddon.h"
#include <ctype.h>


////////////////////////////////////////////// Y strings
// string buffers YSTR_LEN long.  easier this way.

// copy this string, up to count chars or null char or 31 chars, whichever comes first
// eliminate irreleveant chars like spaces
void strYcpy(char* dest, const char* src, long count) {
	const char *p;
    char *q;
	for (p = src, q = dest; *p && p < src+31 && p < src+count; p++) {
		if (! isspace(*p))
			*q++ = toascii(*p);
	}
	*q = 0;
}

////////////////////////////////////////////// Seq Day Number conversions

#define FOURMILLENIA_JULIAN   ((365*3+366)*1000)
// gregorian reducing the number of leap years in four centuries from 100 to 97
#define FOURMILLENIA_GREGORIAN   ((365*4000 + 970)

// given 3 ints
// return a SDN serial day number = 'julian day count'
// or SDN_ERROR if syntax error
int collectToSdn(int year, int month, int date) {
	// The Gregorian calendar was not instituted until October 15, 1582 
	// (or October 5, 1582 in the Julian calendar).
	int sdn = 0;
	
	if (year < 1582)
		// extend this down past 10k BCE
		if (year < -8400)
			sdn = JulianToSdn(year + 8000, month, date) - FOURMILLENIA_JULIAN*2;
		else if (year < -4400)
			sdn = JulianToSdn(year + 4000, month, date) - FOURMILLENIA_JULIAN;
		else
			sdn = JulianToSdn(year, month, date);
		else if (year > 1582) {
			// hmmmm... doesn't seem to have an upper bound
			sdn = GregorianToSdn(year, month, date);
		}
		else {
			// the year 1582 itself
			if (month < 10)
				sdn = JulianToSdn(year, month, date);
			else if (month > 10)
				sdn = GregorianToSdn(year, month, date);
			else if (date < 10)  // split diff
				sdn = JulianToSdn(year, month, date);
			else
				sdn = GregorianToSdn(year, month, date);
		}
	if (0 == sdn)
		throw "date string implausibly long";
	return sdn;
}

////////////////////////////////////////////// our date parsing

Ystr phdSignOfYear, phdYear, phdMonth, phdDate;

// parse str and fill string buffers phdYear, phdMonth and phdDate
static void breakUpHyphenatedDate(const Ystr str) {
	*phdYear = *phdMonth = *phdDate = 0;
	
	char* firstHyphen = strchr(str, '-');
	if (firstHyphen) {
		if (firstHyphen-str > 31)
			throw "date string implausibly long";
		strYcpy(phdYear, str, firstHyphen-str);
		
		char* secondHyphen = strchr(firstHyphen + 1, '-');
		
		if (secondHyphen) {
			// phdYear, phdMonth and phdDate
            strYcpy(phdMonth, (firstHyphen+1), (secondHyphen-firstHyphen) - 1);
			strYcpy(phdDate, secondHyphen+1);
		}
		else {
			// just phdYear and phdMonth
			strYcpy(phdMonth, firstHyphen+1);
		}
		
		
	}
	else {
		// no hyphens at all - just a phdYear
		strYcpy(phdYear, str);
	}
	
}


// given globals phdYear,phdDate,phdMonth,phdSignOfYear, decide on a start and end date (for the target probably)
void arbitrateStartEndDate(int* startSdn, int* endSdn) {
	// BC or BCE makes phdYear negative
	int yearNum, endYearNum;
	if (!*phdYear) {
		endYearNum = yearNum = todaysYear;
	}
	else {
		char* yearStrEnd;
		endYearNum = yearNum = (int) strtol(phdYear, &yearStrEnd, 10);
		if (0 == strcasecmp(yearStrEnd, "bc") || 0 == strcasecmp(yearStrEnd, "bce") || 0 == strcasecmp(phdSignOfYear, "bce"))
			yearNum = endYearNum = - yearNum;
		else if (0 == *yearStrEnd || 0 == strcasecmp(yearStrEnd, "ad") || 0 == strcasecmp(yearStrEnd, "ce"))
			;  // cool
		else
			throw "cannot understand phdYear";
	}
	
	int monthNum, endMonthNum;
	if (! *phdMonth) {
		if (yearNum == todaysYear)
			endMonthNum = monthNum = todaysMonth;  // '--26' means 26th of this phdMonth
		else {
			// '1857' means from jan 1 to dec 31 that phdYear
			monthNum = 1;
			endMonthNum = 0;  // see below will be incremented
			endYearNum++;
			if (0 == endYearNum)
				endYearNum = 1;
		}
	}
	else {
		char* monthStrEnd;
		endMonthNum = monthNum = (int) strtol(phdMonth, &monthStrEnd, 10);
		if (*monthStrEnd)
			throw "cannot understand month";
	}
	
	char* dateStrEnd;
	int dateNum, endDateNum;
	if (! *phdDate) {
		if (yearNum == todaysYear && monthNum == todaysMonth)
			endDateNum = dateNum = todaysDate;
		else {
			dateNum = 1;
			endDateNum = 1;  // last day of month = 1 day of next month, minus 1
			endMonthNum += 1;
		}
	}
	else {
		endDateNum = dateNum = (int) strtol(phdDate, &dateStrEnd, 10);
		if (*dateStrEnd)
			throw "cannot understand date";
	}
	
	int sdn = collectToSdn(yearNum, monthNum, dateNum);
	if (endSdn) {
		// if the caller wants the ending date of the range
		if (yearNum != endYearNum || monthNum != endMonthNum || dateNum != endDateNum)
			*endSdn = collectToSdn(endYearNum, endMonthNum, endDateNum) - 1;
		else
			*endSdn = sdn;
	}
	*startSdn = sdn;
}


// given a string to a date, anywhere from 5000bce or so, up to 3000ce, in phdYear-month-date format
// where phdYear can have the suffix 'bce' or 'bc' to mean Before Common Era
// and month is 1-12 and date is 1-31.  sorry I like phdYear-month-day format.
// return a int 'julian day count' or negative integer for error for both start and end date.
// If start==end, it was a specific day, if not its like 2022-07 => 2022-07-01 thru 2022-07-31
void parseToSdn(const char* str, int* startSdn, int* endSdn) {
	//// totally terrified of a buffer overflow
	/// use global s char phdYear[YSTR_LEN], month[YSTR_LEN], day[YSTR_LEN];
	
	breakUpHyphenatedDate(str);
	arbitrateStartEndDate(startSdn, endSdn);
}


// given a sequential date number, format so a human can read.
// eg '1990-12-25' for AD and '4004bc-11-16' for bc
// adjust between gregorian/julian based on date itself.
void formatSdn(int sdni, char* out) {
	//long sdni = sdn + 0.5;
	int year, month, day, ybias;
	
	// offset early dates by 4k, 8k or 12k years to bring them up above 4700 bc so my calendar routines will work
	ybias = 0;
	if (sdni < - FOURMILLENIA_JULIAN + 80000) {
		sdni += 2* FOURMILLENIA_JULIAN;
		ybias -= 8000;
	}
	if (sdni < 40000) {
		sdni += FOURMILLENIA_JULIAN;
		ybias -= 4000;
	}
	
	if (sdni < 2299161)
		SdnToJulian(sdni, &year, &month, &day);
	else
		SdnToGregorian(sdni, &year, &month, &day);
	year += ybias;
	
	const char *sign = "";
	if (year < 0) {
		year = -year;
		sign = "bc";
	}
	snprintf(out, 20, "%d%s-%d-%d", year, sign, month, day);
}


