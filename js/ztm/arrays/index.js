/**
 * arrays
 * lookup O(1)
 * push O(1)
 * insert O(n)
 * delete O(n)
 */

const strings = ['a', 'b', 'c', 'd']

strings[0]                      //['a']
strings.push('e')               //['a', 'b', 'c', 'd', 'e']
strings.pop()                   //['a', 'b', 'c', 'd']
strings.unshift('x')            //['x', 'a', 'b', 'c', 'd']
strings.splice(2, 0, 'alien')   //['x', 'a', 'alien', 'b', 'c', 'd']



