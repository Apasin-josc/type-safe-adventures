class Solution {
    /**
     * @param {number[]} nums
     * @return {boolean}
     */
    hasDuplicate(nums: number[]): boolean {
        let seen_numbers = new Set()

        for(const num of nums){
            if(seen_numbers.has(num)) return true
            seen_numbers.add(num)
        }
        return false
    }
}

//node --watch dsa/arrays_and_hashing/contains_duplicate.ts
const s = new Solution()
console.log(s.hasDuplicate([1,2,3,3]))   // true
console.log(s.hasDuplicate([1,2,3]))     // false