awk -v FIELDWIDTHS='1 2 6 1 1 4 2 1 1 1 1 1 1 1 2 1 1 1 1 1 1 1 60 8 8 9 4 6 4 4 3 1 12 1 2 8 50' -v OFS=',' '                                           
    { $1=$1 ""; print }                                                                                                                               
' 'WIM_S_Card.txt'
