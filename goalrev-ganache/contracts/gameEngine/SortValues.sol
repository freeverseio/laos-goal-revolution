pragma solidity >= 0.6.3;

/**
 @title Minimal library to sort a set of 14 values
 @author Freeverse.io, www.freeverse.io
*/

contract SortValues {
    
    function sort14(uint8[14] memory data) public pure returns(uint8[14] memory) {
       quickSort14(data, int(0), int(13));
       return data;
    }
    
    function quickSort14(uint8[14] memory arr, int left, int right) public pure {
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
            quickSort14(arr, left, j);
        if (i < right)
            quickSort14(arr, i, right);
    }

}

