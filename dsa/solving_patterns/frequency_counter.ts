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


function same_frequency(arr1: number[], arr2: number[]): boolean{
    
    const arr1_freq = new Map<number, number>()
    arr1.forEach(element => {
           if(!arr1_freq.has(element)){
                arr1_freq.set(element, 1)
           }else {
                arr1_freq.set(element, arr1_freq.get(element)! + 1)
           }
    });

    return true
}