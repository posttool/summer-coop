#!/usr/bin/env bash
if pgrep node > /dev/null
then
    echo restart
    forever restart 0
else
    DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
    export NODE_ENV=production
    echo start $DIR
    cd $DIR
    forever start server.js
    forever logs 0
fi