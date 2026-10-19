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



class MyArray {
    constructor() {
        this.length = 0;
        this.data = {};
    }

    get(index) {
        return this.data[index];
    }

    push(item) {
        this.data[this.length] = item;
        this.length++;
        return this.length;
    }

    pop() {
        const lastItem = this.data[this.length - 1];
        delete this.data[this.length - 1];
        this.length--;
        return lastItem;
    }

    delete(index) {
        const item = this.data[index];
        this.shiftItems(indexindex);
        return item;
    }

    shiftItems(index) {
        for (let i = index; i < this.length - 1; i++) {
            this.data[i] = this.data[i + 1];
        }
        delete this.data[this.length - 1];
        this.length--;
    }
}

const newArray = new MyArray();
newArray.push('hi');
newArray.push('you');
newArray.push('!');
newArray.pop()
console.log(newArray);