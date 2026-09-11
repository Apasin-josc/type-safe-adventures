//javascript runs from top to bottom
//alert('hello world')
//variables are written in camelCase

let age = 28
const name = "Jose Omar"
/* console.log(`${name} is ${age} years old`) */

/**
 * JavaScript Data Types
 * numer, string, boolean, null, undefined, object, symbol
 */
/* ---strings--- */
console.log('hello, world')

//string concatenation
let firstName = 'Jose'
let lastName = 'Coppola'
console.log(firstName + ' ' + lastName)
console.log(`${firstName} ${lastName}`)

//string length
console.log(lastName.length)

//string methods
console.log(lastName.toUpperCase())
console.log(lastName.toLowerCase())
console.log(lastName.indexOf('a'))

let email = 'omarscoppola97@gmail.com'
//let result = email.lastIndexOf('p')
//let result = email.slice(0, 5)
//let result = email.substr(0, 10)
//let result = email.replace('@', '#')
//console.log(result)

/* ---numbers--- */
let radius = 10
const pi = 3.14
console.log(`${radius}, ${pi}`);

//order of operation - B I D M A S -- Brackets, Indexes, Division, Multiplication, Addition, Substraction
//math operators +, -, *, /, **, %

let likes = 10
likes += 1
likes++
likes--
likes += 2
console.log(likes);

// NaN - not a number -- calculations that doesn't make any sense
//console.log(5 * 'hello')

/* ---arrays--- */
let ninjas = ['omar', 'rex', 'salsa']
console.log(ninjas)

let ages = [28, 27, 1.8]
console.log(ages)

//array methods
//let result = ninjas.join(',')
//let result = ninjas.indexOf('salsa')
//let result = ninjas.concat(['galaxia', 'samuela'])
//let result = ninjas.push('bella')
//let result = ninjas.pop()
//console.log(result);

/* ---null & undefined --- */
let age_example = null
console.log(age_example, age_example + 3, `the age is ${age_example}`);

/* ---booleans--- */
console.log(true, false);
let bool_email = 'omarscoppola97@gmail.com'
let names = ['bowser', 'yoshi', 'dk']
//let result_bool = bool_email.includes('@')
//let result_bool = names.include('bowser')


/*
let age = 25

loose comparison
console.log(age == 25)
console.log(age == '25')

strict comparison
console.log(age === 25)
console.log(age === '25')
*/

/* ---type conversion--- */
let score = '100'
score = Number(score)
console.log(score + 1)
console.log(typeof score)
//let result = String(50)
let result = Boolean(50) //positive numbers are truthy, negative numbers are falsy
console.log(result, typeof result)


/**
 * switch brakes
 * const
 */

const grade = 'A'

switch(grade){
    case 'A':
        console.log('you got an A!');
    
    case 'B':
        console.log('you got an B!');
    
    default:
        console.log('not a valid grade');
}