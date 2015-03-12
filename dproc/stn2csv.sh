gawk -v FIELDWIDTHS='1 2 6 1 1 2 2 1 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 1 12 6 8 9 4 6 2 2 3 1 12 1 1 8 1 8 50' -v OFS=',' '{ $1=$1 ""; print }' 'WIM_S_Card.txt'
