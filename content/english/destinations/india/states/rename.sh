#!/bin/bash

# rename files that contain the substring "-excursions-" in the file name

shopt -s nullglob

while IFS= read -r -d '' -u 9
do
    echo " "
	f=$REPLY    
	echo $f
    number=$(echo "${f##*/}" | head -c 1)
	searchstring="-hotels-"
   	rest=${f#*$searchstring}
	file=$number'-'${rest}
    dir=$(echo "${f#*/}" | head -1 | sed 's:/[^/]*$::')
    new=$(echo "${dir}/${file}")
    echo $new
	mv $f $new
	#echo 'dir2='$(echo "${f#*/}" | awk -F'/' '{print $2}')

done 9< <( find .  -name  "*-hotels-*" -type f -exec printf '%s\0' {} + )
