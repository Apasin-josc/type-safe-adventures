/**
 * given 2 sorted arrays, merge them in order into a single array
 * arr1 = [0, 3, 4, 31], arr2 = [4, 6, 30]
 * ans = [0, 3, 4, 4, 6, 30, 31]
 */

function mergeSortedArrays(arr1, arr2) {
    const ans = [];
    let i = 0;
    let j = 0;

    while (i < arr1.length && j < arr2.length) {
        if (arr1[i] <= arr2[j]) {
            ans.push(arr1[i]);
            i++;
        } else {
            ans.push(arr2[j])
            j++;
        }
    }

    while (i < arr1.length) {
        ans.push(arr1[i]);
        i++;
    }

    while (j < arr2.length) {
        ans.push(arr2[j]);
        j++;
    }

    return ans
}


console.log(mergeSortedArrays([0, 3, 4, 31], [4, 6, 30]));