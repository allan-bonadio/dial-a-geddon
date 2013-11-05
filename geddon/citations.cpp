/*
 *  Citations -- Bible and other references for Dial-A-Geddon website
 *
 *  Created by Allan Bonadio on 5/1/11.
 *  Copyright 2011-2014 Tactile Interactive. All rights reserved.
 *
 */
//
// Citations -- Bible and other references for Dial-A-Geddon website
//
// Copyright (C) 2011-2011 Tactile Interactive Software Inc.
// All Rights Reserved
//

#include "geddon.h"




Number productionBibleNumbers[] = {
	// biblical numerology
// too much Number(1, "Number of Unity", "Biblical Numerology"),
// too much Number(2, "Number of Division", "Biblical Numerology"),
// too much Number(3, "Number of Completion", "Biblical Numerology"),
// too much Number(4, "Number of Creation", "Biblical Numerology"),
// too much Number(5, "Number of Grace", "Biblical Numerology"),
// too much Number(6, "Number of Man", "Biblical Numerology"),
// too much Number(7, "Number of Spiritual Perfection", "Biblical Numerology"),
// too much Number(8, "Number of New Beginnings", "Biblical Numerology"),
// too much Number(9, "Number of Judgement", "Biblical Numerology"),
// too much Number(10, "Number of Perfection of Divine Order", "Biblical Numerology"),
// too much Number(11, "Number of Disintegration", "Biblical Numerology"),
// too much Number(12, "Number of Governmental Perfection", "Biblical Numerology"),
	////Number(13, "Famines recorded in the Scriptures", "Gen 12:10 26:1, 41:54, Ruth 1:1, 2 Sa 21:1, 1 Kg 18:1, 2 Kg 4:38 7:4 25:3, Nehe 5:3, Jerem 14:1, Luke 15:14, Acts 11:28"),

	////Number(14, "Double Number of Spiritual Perfection", "Biblical Numerology"),
	//Number(15, "Cubits of Depth Noah's Ark was lifted", "Genesis 7:20"),
	Number(17, 100000000, "Number of The Perfection of Spiritual Order", "Biblical Numerology"),
	//Number(17, 100000000, "Blessings of those who are dead and risen in Christ", "Romans 8:35-39"),
	//Number(20, 100000000, "Years Jacob waited to get possession of his wives and property", "Genesis 21:38,41"),
	//Number(22, 100000000, "Years Ahab ruled as king of Israel", "1 Kings 16:29"),
	//Number(24, 100000000, "Number of Heavenly Elders", "Revelation 4"),
	Number(25, 100000000, "Number of Lots of Grace", "Biblical Numerology"),
	//Number(30, 100000000, "Age of Jesus at the start of his Ministry", "Luke 3:23"),
	//Number(30, 100000000, "Age of King David at the start of his Rule", "2 Samuel 5:4"),
	Number(40, 100000000, "Number of Probation, Trial and Chastisement", "Biblical Numerology"),
	//Number(40, 100000000, "Years Israelites wandered in the desert", "Deut. 8:2-5"),
	//Number(40, 100000000, "Days and Nights Moses was on the Mount", "Exodus 24:18"),


	//Number(42, 100000000, "Months duration of the Antichrist", "Revelation 11:2, 13:5"),
	Number(50, 100000000, "Number of Jubilee", "Biblical Numerology"),
	//Number(51, 100000000, "Number of Books in the Old + New Testaments", "Bible"),
	//Number(65, 100000000, "Years it takes for Ephraim to be broken", "Isaiah 7:8)"),
	//Number(70, 100000000, "Nations that Populated the Earth", "Genesis 10"),
	Number(40, 100000000, "Number of Probation or Trial", "Biblical Numerology"),


	// here's the real thing: 4000 someodd citations, gotten by script conversion from the KJV itself
	#include "../genCitations.h"

	Number(0, 100000000, "", "")  // end of list
};

// use these for testing
Number testBibleNumbers[] = {
	Number(3, 100000000, "Number Three", "ref 3"),
	Number(8, 100000000, "Number Eight", "ref 8"),
	Number(11, 100000000, "Number Eleven", "ref 11"),
Number(0, 100000000, "", "")  // end of list
};

// the table of bible numbers we use as a source in the geddon binary.
// Change this to the test set for certain tests.
Number *bibleNumbers = productionBibleNumbers;

// we always iterate over; no index needed
BiblicalDate productionInceptionDates[] = {
	BiblicalDate("2001-09-11", "9-11 attack"),

	BiblicalDate("1-1-1", "traditional Incarnation of Jesus"),
	//	BiblicalDate("6174bce", "Arab Anno Mundi"),
	BiblicalDate("3761bce-10-07", "Anno Mundi epoch (start of Hebrew calendar)"),
	BiblicalDate("3760bce-10-07", "Jewish Date of Creation"),
	//	BiblicalDate("3751bce", "Seder Olam Rabbah (Jose ben Halafta) Date of Creation"),
	//BiblicalDate("4339bce", "Seder Olam Zutta Date of Creation"),
	BiblicalDate("4004BC-10-23", "Date of Creation", "Archbishop James Ussher"),

	BiblicalDate("2348 BC", "Noah's Flood", "Archbishop James Ussher"),
	BiblicalDate("1921 BC", "God's call to Abraham", "Archbishop James Ussher"),
	BiblicalDate("1491 BC", "The Exodus from Egypt", "Archbishop James Ussher"),
	BiblicalDate("1012 BC", "Founding of the Temple in Jerusalem", "Archbishop James Ussher"),
	BiblicalDate("588 BC", "Destruction of Jerusalem by Babylon and the beginning of the Babylonian Captivity", "Archbishop James Ussher"),
	BiblicalDate("4 BC", "Birth of Jesus", "Archbishop James Ussher"),

BiblicalDate("1503-12-21", "Birth of Nostradamus", "Patrice Guinard"),
BiblicalDate("1566-7-2", "Death of Nostradamus", "Patrice Guinard"),
BiblicalDate("1555-3-1", "Beginning of fulfillment of Prophecies", "Nostradamus"),
BiblicalDate("3797-11-9", "Beginning of fulfillment of Prophecies", "Nostradamus"),
BiblicalDate("1555-5-4", "First volume of Prophecies published", "Nostradamus"),
//BiblicalDate("1557", "Second volume of Prophecies published", "Nostradamus"),
BiblicalDate("1558-6-27", "Third volume of Prophecies published", "Nostradamus"),




BiblicalDate("67", "Martyrdom of Saint Paul", ""),
BiblicalDate("1274-3-7", "Martyrdom of Saint Thomas Aquinas", ""),
BiblicalDate("869-2-14", "Martyrdom of Saint Cyril", ""),
BiblicalDate("460-3-17", "Martyrdom of Saint Patrick", ""),

BiblicalDate("18-7-20", "Martyrdom of Saint Joseph, husband of Mary", ""),
BiblicalDate("655-9-16", "Martyrdom of Saint Martin I", ""),
BiblicalDate("4bc-5-31", "Visitation of Mary with Elizabeth", "Luke 1:39–56"),
BiblicalDate("4bc-6-24", "Nativity of St. John the Baptist", "Luke 1:5-25"),

BiblicalDate("1619-7-22", "Martyrdom of Saint Lawrence of Brindisi", ""),
BiblicalDate("40-7-2", "Virgin Mary appears to James the Apostle", "Iberian local tradition"),
BiblicalDate("258-8-10", "Martyrdom of Saint Lawrence of Rome", ""),
BiblicalDate("1000-12-25", "Coronation of Saint Stephen I of Hungary", ""),
BiblicalDate("1581-4-24", "Birth of Saint Vincent de Paul", ""),

BiblicalDate("1210-4-16", "Saint Francis of Assisi founds Franciscan Order", ""),
BiblicalDate("1456-10-23", "Martyrdom of Saint John of Capistrano", ""),
BiblicalDate("270-3-15", "Birth of Saint Nicholas", ""),
BiblicalDate("1531-12-12", "Juan Diego vision of Our Lady of Guadalupe", ""),
BiblicalDate("34-12-26", "Martyrdom of Saint Stephen", "Acts of the Apostles 6"),
BiblicalDate("1431-5-30", "Martyrdom of Saint Joan of Arc", ""),



	// too much 	BiblicalDate("5592 BC", "Creation according to Clement of Alexandria"),
	// too much 	BiblicalDate("5501 BC", "Creation according to Julius Africanus"),
	// too much 	BiblicalDate("5228 BC", "Creation according to Eusebius"),
	// too much 	BiblicalDate("5199 BC", "Creation according to Jerome"),
	// too much 	BiblicalDate("5500 BC", "Creation according to Hippolytus of Rome"),
	// too much 	BiblicalDate("5529 BC", "Creation according to Theophilus of Antioch"),
	// too much 	BiblicalDate("5469 BC", "Creation according to Sulpicius Severus"),
	// too much 	BiblicalDate("5336 BC", "Creation v Isidore of Seville"),
	// too much 	BiblicalDate("5493 BC", "Creation according to Panodorus of Alexandria"),
	// too much 	BiblicalDate("5493 BC", "Creation according to Maximus the Confessor"),
	// too much 	BiblicalDate("5492 BC", "Creation according to George Syncellus"),
	// too much 	BiblicalDate("5500 BC", "Creation according to Gregory of Tours"),
	// too much 
	// too much 
	// too much 	BiblicalDate("5509 BC-09-01", "Creation according to The Byzantine calendar"),
	// too much 	BiblicalDate("5199 BC", "Creation according to María de Ágreda"),
	// too much 	BiblicalDate("5493 BC", "Creation as revealed in the Book of Aksum"),
	// too much 	BiblicalDate("5493 BC", "Creation according to the early Ethiopian Church"),
	// too much 
	// too much 	BiblicalDate("3952 BC-03-18", "Creation according to 'De Temporibus' by Bede, 703ce"),



	/*
	 more dates of creation
	 
	 using the Masoretic from the 10th century - 18th century include: Marianus Scotus (4192 BC), Maimonides (4058 BC), Henri Spondanus (4051 BC), Benedict Pereira (4021 BC), Louis Cappel (4005 BC), James Ussher (4004 BC), Augustin Calmet (4002 BC), Isaac Newton (4000 BC), Johannes Kepler (April 27, 3977 BC) [based on his book Mysterium], Petavius (3984 BC), Theodore Bibliander (3980 BC), Christen Sørensen Longomontanus (3966 BC), Melanchthon (3964 BC), Martin Luther (3961 BC), John Lightfoot (3960 BC), Cornelius Cornelii a Lapide (3951 BC) Joseph Justus Scaliger (3949 BC), Christoph Helvig (3947 BC), Gerardus Mercator (3928 BC), Matthieu Brouard (3927 BC), Benito Arias Montano (3849 BC), Andreas Helwig (3836 BC), David Gans (3761 BC), Gershom ben Judah (3754 BC) and Yom-Tov Lipmann Heller (3616 BC)
	 
	 The Chronicon of Eusebius (early 4th century) dated creation to 5228 BC while Jerome (c. 380, Constantinople) dated Creation to 5199 BC.[72][73] Earlier editions of the Roman Martyrology for Christmas Day used this date,[74] as did the Irish Annals of the Four Masters.[75]
	 
	 Alfonso X of Castile commissioned the Alfonsine tables, from which the date of the creation has been calculated to be either 6984 BC or 6484 BC.
	 
	 -----------------------------------------------  ussher: 
	 23 October 4004 BC
	 
	 Using them, he would have concluded that the equinox occurred on Tuesday October 25, only one day earlier than the traditional day of its creation, on the fourth day of Creation week, Wednesday, along with the Sun, Moon, and stars (Genesis 1:16). Modern equations place the autumnal equinox of 4004 BC on Sunday October 23.[citation needed]
	 Ussher stated his time of Creation (nightfall preceding October 23) on the first page of Annales in Latin and on the first page of its English translation Annals of the World (1658). The following English quote is based on both, with a serious error in the 1658 English version corrected by referring to the Latin version (calendar → period).
	 In the beginning God created Heaven and Earth, Gen. 1, v. 1. Which beginning of time, according to our Chronologie, fell upon the entrance of the night preceding the twenty third day of Octob[er] in the year of the Julian [Period] 710. The year before Christ 4004. The Julian Period 710.
	 
	 
	 
	 
	 Ussher's history of the Earth
	 
	 Ussher's chronology provides the following dates for key events in the Biblical history of the world:[5]
	 4004 BC - Creation
	 2349-2348 BC - Noah's Flood
	 1921 BC - God's call to Abraham
	 1491 BC - The Exodus from Egypt
	 1012 BC - Founding of the Temple in Jerusalem
	 588 BC - Destruction of Jerusalem by Babylon and the beginning of the Babylonian Captivity
	 4 BC - Birth of Jesus
	 
	 
	 ----------------------------------------------- Lightfoot
	 
	 Heaven and earth, center and circumference, were created together in the same instant; and clouds full of water … were created in the same instant with them, ver. 2 [of Genesis, chapter 1]. … Twelve hours did the heavens thus move in darkness; and then God commanded, and there appeared, light to this upper horizon,—namely, to that where Eden should be planted.[15]
	 
	 Ver. 26 [of Genesis, chapter 1].—Man created by the Trinity about the third hour of the day, or nine of the clock in the morning.[16]
	 
	 Thus Lightfoot's instant of Creation was nightfall, the beginning of the first twelve hours of darkness of the first day of Creation. His "nine of the clock in the morning" referred to the creation of man.
	 
	 That Lightfoot's day of Creation occurred during 3929 BC can be deduced from the last page of the "Prolegomena" of The Harmony of the Four Evangelists, among themselves, and with the Old Testament (1644). The quoted year of 1644 must be subtracted from 5573, not 5572, to obtain 3929 BC, during which year 1 of the world began at the (autumnal) equinox.
	 
	 And now, he that desireth to know the year of the world, which is now passing over us,—this year, 1644,—will find it to be 5572 years just finished since the creation; and the year 5573 of the world's age, now newly begun, this September, at equinox.[17]
	 
	 The only date for the equinox given by Lightfoot was in a 'private' undated sermon entitled "The Sabbath Hallowed":
	 
	 That the world was made at equinox, all grant,—but differ at which, whether about the eleventh of March, or twelfth of September; to me in September, without all doubt.[18]
	 
	 September 12 in the Julian calendar is only applicable near 1644, not 3929 BC. Apparently Lightfoot did not realize that the excessive length of the average Julian year would substantially shift the date of the equinox in a year millennia earlier. If Lightfoot had attempted to calculate the autumnal equinox of 3929 BC, he, like Ussher, would have used the Rudolphine Tables, which placed the equinox on October 25, versus October 22 using modern equations.
	 */
	// about 5500 bc - based on Septuagint
	// differnece = 1466, or 
	// about 4000 bc - based on Masoretic

	BiblicalDate("7654bce-3-2", ""),  // end of list
};

// we always iterate over; no index needed
BiblicalDate testInceptionDates[] = {
	BiblicalDate("1-1-1", "one one one"),
	BiblicalDate("2-2-2", "two two two"),


	BiblicalDate("7654bce-3-2", ""),  // end of list
};

BiblicalDate *inceptionDates = productionInceptionDates;

int inceptionDateCount;

