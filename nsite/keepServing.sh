#!/bin/bash
echo "double ^C to quit; single to refresh"

runOnce ( )
{
	#trap runOnce 2
	cat main.stylus | stylus > statics/main.css

	startTime=`date +%s`
	node --debug app  --dev
	#node --debug-brk app --dev
	if [ "$startTime" = `date +%s` ]
	then exit 1
	fi
	echo '|===|' `date +%T` "   Node return code is $?"
	echo
}


while true
do
	runOnce
	sleep 0.3  # hit ^C the second time during this
	
done
