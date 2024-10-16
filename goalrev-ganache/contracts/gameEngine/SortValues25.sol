pragma solidity >= 0.6.3;

/**
 @title Minimal library to sort a set of 25 values
 @author Freeverse.io, www.freeverse.io
*/

contract SortValues25 {
    
    function sort25(uint256[25] memory data) public pure returns(uint256[25] memory) {
       quickSort25(data, int(0), int(24));
       return data;
    }
    
    function quickSort25(uint256[25] memory arr, int left, int right) public pure {
        int i = left;
        int j = right;
        if(i==j) return;
        uint pivot = arr[uint(left + (right - left) / 2)];
        while (i <= j) {
            while (arr[uint(i)] > pivot) i++;
            while (pivot > arr[uint(j)]) j--;
            if (i <= j) {
                (arr[uint(i)], arr[uint(j)]) = (arr[uint(j)], arr[uint(i)]);
                i++;
                j--;
            }
        }
        if (left < j)
            quickSort25(arr, left, j);
        if (i < right)
            quickSort25(arr, i, right);
    }

}

