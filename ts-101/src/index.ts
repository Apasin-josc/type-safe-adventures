/* 🦔 type basics 🦔 */

let age: number = 30
let firstName: string = "Omar"
let isFictional: boolean = true


let planet: string = "Earth"
let moons: number = 1
let isLarge: boolean = false


//when we give a value of null to a variable is intentional
//when we give a value of undefined that's more unintentional
let something: null
let anotherThing: undefined


/* 🦔 arrays & object literals 🦔 */

/**
 * arrays : type[]
 */

let names: string[] = ['Mario', 'Luigi', 'Peach']
let ages: number[] = [25, 28, 24]

names.push('Bowser')
ages.push(35)

/**
 * type inference with arrays
 * ts knows that fruits is type string[] & f is a string
 */

let fruits = ['apples', 'pears', 'bananas']
fruits.push('peaches')
const f = fruits[3]

let things = [1, true, 'hello']
const t = things[0]

/**
 * object literals
 */

let user: {firstName: string, age: number, id: number} = {
    firstName: 'omar',
    age: 28,
    id: 1
}

/**
 * type inference with object literals
 * ts knows that person has a name: string, age: number
 */

let person = {
    name: 'Luigi',
    age: 28
}

const personAge = person.age

/* 🦔 functions 🦔 */


/**
 * functions
 */

function addTwoNumbers(a, b){
    return a + b
}


/**
 * return type inference
 */