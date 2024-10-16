pragma solidity >= 0.6.3;

/**
 @title Minimal library to sort a set of 8 Indices
 @author Freeverse.io, www.freeverse.io
*/

contract SortIdxs {
    
    uint256 constant private N_IDXS = 8;
    
    function sortIdxs(uint256[N_IDXS] memory data, uint8[N_IDXS] memory idxs) public pure returns(uint8[N_IDXS] memory) {
       quickSort(data, idxs, int(0), int(N_IDXS - 1));
       return idxs;
    }
    
    function quickSort(uint256[N_IDXS] memory arr, uint8[N_IDXS] memory idxs, int left, int right) public pure {
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

