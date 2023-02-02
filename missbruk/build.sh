#!/bin/bash
# Creates a zip of relevant files 
# and chooses manifest based on argument 

case $1 in 
    firefox)
        cp manifest_v2.json manifest.json
        ;;
    chrome)
        cp manifest_v3.json manifest.json
        ;;
    *)
        echo "Invalid argument"
        exit
        ;;
esac

zip -r missbruk.zip manifest.json scripts/ icons/

rm manifest.json
