#!/bin/bash
echo "double ^C to quit; single to refresh"

runOnce ( )
{
	#trap runOnce 2
	# NO automatically done in app.js cat main.stylus | stylus > statics/main.css

	# if we crash immediately, don't keep restarting!
	startTime=`date +%s`
	
	# --dev sets app to include js old fashioned way, instead of inline
	# --debug works with node-inspector --debug-brk causes stop at first stmt
	# just do a node-inspector & somewhere.
	node app --dev     # no node-inspector
	#node --debug app  --dev   # debug, start immediately
	#node --debug-brk app --dev    # debug, breakpoint at first statement
	# debugger: run node-inspector& first then open in chrome
	
	if [ "$startTime" = `date +%s` ]
	then exit 1  # must have crashed immediately
	fi
	
	echo '|===|' `date +%T` "   Node return code is $?"
	echo
}


cd `dirname $0`
while true
do
	runOnce
	sleep 0.3  # hit ^C the second time during this
	
done
