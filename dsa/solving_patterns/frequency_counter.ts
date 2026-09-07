/**
 * naive solution
 * @param arr1 
 * @param arr2 
 * @returns boolean
 */

function same(arr1: number[], arr2: number[]): boolean{
    if (arr1.length !== arr2.length){
        return false
    }

    for(let i: number = 0; i < arr1.length; i++){
        let correctIndex = arr2.indexOf(arr1[i] ** 2)
        if (correctIndex === -1){
            return false
        }
        arr2.splice(correctIndex, 1)
    }
    return true
}


console.log(same([1,2,3], [1,4,9]))

