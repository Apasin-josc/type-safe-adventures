/**
 * create a function that reverses a string
 * 'hi my name is omar' should be 'ramo si eman ym ih'
 */

function reverse(str) {
    if (!str || str.length < 2 || typeof str !== 'string') return 'enter a valid string';
    let arr = []
    for (let i = str.length; i >= 0; i--) {
        arr.push(str[i]);
    }
    //return arr.toString();
    return arr.join('');
}


function reverse2(str) {
    return str.split('').reverse().join('')
}

const reverse3 = str => str.split('').reverse().join('')


console.log(reverse('hi my name is omar'));
console.log(reverse2('hi my name is omar'));
console.log(reverse3('hi my name is omar'));