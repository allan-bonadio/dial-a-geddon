#!/bin/bash
echo "double ^C to quit; single to refresh"

runOnce ( )
{
	#trap runOnce 2

	# if we crash immediately, don't keep restarting!
	startTime=`date +%s`
	
	# --dev sets app to include js old fashioned way, instead of inline
	# --debug works with node-inspector --debug-brk causes stop at first stmt
	# just do a node-inspector & somewhere.
	node --debug app  --dev
	#node --debug-brk app --dev
	#node --debug-brk app 
	
	if [ "$startTime" = `date +%s` ]
	then exit 1
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
