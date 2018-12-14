function findDifferenceBetweenTwoArrays(arr1, arr2) {
    // Find and return difference between two arrays
    // ([1, 2, 3], [1]) >>> [2,3]
    // ([1, 2, 3, 6], [1, 3, 6]) >>> [2]
    // ([1, 2, 3], [4, 5, 6]) >>> [1,2,3,4,5,6]
    let leftDif = arr1.filter(i => arr2.indexOf(i) === -1);
    let rightDif = arr2.filter(i => arr1.indexOf(i) === -1);
    return leftDif.concat(rightDif);
}

/*
 console.log(findDifferenceBetweenTwoArrays([1, 2, 3], [4, 5, 6]) + " -- [1,2,3,4,5,6]");
 console.log(findDifferenceBetweenTwoArrays([1, 2, 3], [1]) + " -- [2, 3]");
 console.log(findDifferenceBetweenTwoArrays([1, 2, 3, 6], [1, 3, 6]) + " -- [2]");
 */