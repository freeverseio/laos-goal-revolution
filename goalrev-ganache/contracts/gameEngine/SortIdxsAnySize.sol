pragma solidity >= 0.6.3;

/**
 @title Minimal library to sort an arbitrary number Indices
 @author Freeverse.io, www.freeverse.io
*/

contract SortIdxsAnySize {
    
    function sortIdxs(uint256[] memory data, uint8[] memory idxs) public pure returns(uint8[] memory) {
       quickSort(data, idxs, int(0), int(data.length - 1));
       return idxs;
    }
    
    function quickSort(uint256[] memory arr, uint8[] memory idxs, int left, int right) public pure {
        int i = left;
        int j = right;
        if(i==j) return;
        uint pivot = arr[uint(left + (right - left) / 2)];
        while (i <= j) {
            while (arr[uint(i)] > pivot) i++;
            while (pivot > arr[uint(j)]) j--;
            if (i <= j) {
                (arr[uint(i)], arr[uint(j)]) = (arr[uint(j)], arr[uint(i)]);
                (idxs[uint(i)], idxs[uint(j)]) = (idxs[uint(j)], idxs[uint(i)]);
                i++;
                j--;
            }
        }
        if (left < j)
            quickSort(arr, idxs, left, j);
        if (i < right)
            quickSort(arr, idxs, i, right);
    }

}

