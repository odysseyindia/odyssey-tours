#!/bin/bash

shopt -s nullglob


while IFS= read -r -d '' -u 9
do

echo " "
	f=$REPLY    
	echo $f
    number=$(echo "${f##*/}" | head -c 1)
	searchstring="-excursions-"
   	rest=${f#*$searchstring}
	file=$number'-'${rest}
 dir=$(echo "${f#*/}" | head -1 | sed 's:/[^/]*$::')
    new=$(echo "${dir}/${file}")
    echo 'new file='$new
  mv $f $new

done 9< <( find .  -name  "*-excursions-*" -type f -exec printf '%s\0' {} + )




   #dest="${dest}_$(basename "$src")"
   #log=$(basename "$dest" .cnf)
   #cp "$src"  "/tmp/Config/output/$dest"
   #grep SEARCH_STRING "/tmp/Config/output/$dest" > "/tmp/Config/output/$log"
