class Solution {
    /**
     * @param {number[]} nums
     * @return {boolean}
     */
    hasDuplicate(nums: number[]): boolean {
        let numberSet = new Set<number>();
        for(let num of nums){
            if(numberSet.has(num)){
                return true
            }
            numberSet.add(num)
        }
        return false
    }
}

//node --watch dsa/arrays_and_hashing/contains_duplicate.ts
const s = new Solution()
console.log(s.hasDuplicate([1,2,3,3]))   // true
console.log(s.hasDuplicate([1,2,3]))     // false