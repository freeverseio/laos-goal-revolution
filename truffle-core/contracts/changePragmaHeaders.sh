rm -rf tmp;
mkdir -p tmp;
rm -rf tmp2;
mkdir -p tmp2;

firstLine="pragma solidity >= 0.6.3;"
for f in *sol; 
do
    echo ${f};
    tail -n +2 "${f}" > "tmp/${f}"
    echo ${firstLine} | cat - "tmp/${f}" > "tmp2/${f}"
done
