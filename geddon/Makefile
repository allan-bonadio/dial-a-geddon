#
#  Makefile -- compile geddon on linux
#
#  Created by Allan Bonadio on 11/4/13.
#  Copyright 2013-2014 Tactile Interactive. All rights reserved.
#

objects = citations.o days.o find_hit.o main.o tests.o dow.o gregor.o julian.o

geddon : $(objects)
	g++ $(objects) -o geddon
	cp geddon ../nsite

%.o : %.c
	gcc -c $(CFLAGS) $< -o $@

%.o : %.cpp
	g++ -c $(CFLAGS) $(CPPFLAGS) $< -o $@

dow.o gregor.o julian.o days.o main.o : sdncal.h
tests.o find_hit.o main.o days.o citations.o : geddon.h
citations.o : ../genCitations.h


.PHONY : clean
clean : 
	rm $(objects) geddon
	
