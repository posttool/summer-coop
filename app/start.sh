#!/usr/bin/env bash
if pgrep node > /dev/null
then
    echo restart
    forever restart 0
else
    DIR=/root/summer-coop/app
    echo start $DIR
    cd $DIR
    export NODE_ENV=production
    forever start server.js
    forever logs 0
fi