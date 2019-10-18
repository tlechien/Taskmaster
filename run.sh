#!/bin/zsh
# while [ $(cat .state) = "0" ]
# do
#     sleep 0.5
# done
# kill -cont $1
PID=$1
sleep 2
kill -cont $PID;
