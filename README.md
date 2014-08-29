dial-a-geddon
=============

a utility for those predicting the end of the world.  long story.

still under development, in particular the geddon program, which has some copyright issues.

how to start it up:
dev: ./keepServing.sh
production: i guess    node app.js &

To set test args in Xcode, Product > Scheme > Edit Scheme...

Overview
========

Two main parts: JS browser webapp in nsite, and C++ program that does the calculation in geddon.

geddon
======

direct ajax server; gets its arguments through QUERY_STRING with a GET request.
Most of the args are just year, month, day of user's target date.
Returns json enveloped in "<matches> ... </matches>" with debug/perf info code, so you can't just do a direct json parse.
You can also run it from the command line, either with a date argument or with test codes.

nsite
=====

Nodejs site served by app.js.  For debugging, it inserts <script> tags for each included JS file.
For production, inserts them directly into the html for better download speed.
CSS comes from .style file; runs thru stylus before upload.  

the server preloads each file it must respond with, including all images and what not.


