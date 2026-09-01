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

function addTwoNumbers(a: number, b: number): number {
    return a + b
}

//console.log(addTwoNumbers(30, 15))

const substractTwoNumbers = (a: number, b: number): number => {
    return a - b
}

//console.log(substractTwoNumbers(10, 5))

function addAllNumbers(items:  number[]): void {
    const total = items.reduce((a,c) => a + c, 0)
    //console.log(total)
}

//console.log(addAllNumbers([5,7,9,11,3,2,1]))


/**
 * return type inference
 * infering that result is of type string
 */
function formatGreeting(name: string, greeting: string) {
    return `${greeting}, ${name}`
}

const result = formatGreeting("mario", "hello")


/* 🦔 any 🦔 */
/**
 * any type
 */
let anyAge: any
let title

anyAge = 30
anyAge = 'thirty'
title = 25
title = {
    hello: 'world'
}

/**
 * any type in arrays
 */
let anyThings: any[] = ['hello', true, 30, null]
anyThings.push(false)


/**
 * functions & any
 */
function addTogether(value: any): any{
    return value + value
}

const resultOne = addTogether('hello')
const resultTwo = addTogether(3)

//useful when migrating from js to ts
//because using any won't cause errors initially


/* 🦔 tupples 🦔 */

let personTup: [string, number, boolean] = ['mario', 30, true]


/**
 * tuples examples
 */
let hsla: [number, string, string, number]
hsla = [200, '100%', '100%', 1]

let xy: [number, number]
xy = [94.7, 20.1]

function useCoords(): [number, number]{
    //get coords
    const lat = 100
    const long = 50

    return [lat, long]
}

const [lat, long] = useCoords()

/**
 * named tuples
 */

let userTup: [name: string, age: number]
userTup = ['mario', 30]

/* 🦔 interfaces 🦔 */

/**
 * interfaces
 */
interface Author {
    name: string,
    avatar: string
}

const authorOne: Author = {name: 'mario', avatar: '/img/mario.png'}
const authorTwo: Author = {name: 'yoshi', avatar: '/img/yoshi.png'}

interface Post {
    title: string,
    body: string,
    tags: string[],
    created_at: Date,
    author: Author
}

const newPost: Post = {
    title: 'my first post',
    body: 'something interesting',
    tags: ['gaming', 'tech'],
    created_at: new Date(),
    author: authorOne
}

/**
 * as function argument types
 */

function createPost(post: Post): void {
    console.log(`Created post ${post.title} by ${post.author.name}`)
}

createPost(newPost)

/**
 * with arrays
 */
let posts: Post[] = []
posts.push(newPost)

/* 🦔 type aliases 🦔 */

/**
 * example 1 - tuple
 */

type Rgb = [number, number, number]

function getRandomColor(): Rgb {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)
    return [r,g,b]
}

const colorOne = getRandomColor()
const colorTwo = getRandomColor()
console.log(colorOne)
console.log(colorTwo)

/**
 * example 2 - object literal
 */

type User = {
    name: string,
    score: number
}

const userOne: User = { name: 'mario', score: 75}

function formatUser(user: User): void{
    console.log(`${user.name} has a score of ${user.score}`)
}

formatUser(userOne)


/* 🦔 union types 🦔 */

let someId: number | string

someId = 1
someId = '2'

let email: string | null = null
email = "omarscoppola97@gmail.com"
email = null

type Id = number | string
let anotherId: Id

anotherId = 'asdasd123'
anotherId = 5


/**
 * union type pitfall
 */
function swapIdType(id: Id): Id {
    //can only use props and methods common to
    //both number and string  types
    //parseInt(id) --> not allowed
    return id
}


/* 🦔 type guards 🦔 */

/**
 * type guards
 */
type IdGuard = number | string

function swapIdTypeGuard(id: Id){
    if (typeof id === 'string'){
        //can use string methods and properties
        return parseInt(id)
    } else{ 
        //can use number methods and properties
        return id.toString()
    }
}

const idOne = swapIdTypeGuard(1)
const idTwo = swapIdTypeGuard('2')

console.log(idOne)
console.log(idTwo)

/**
 * tagged interfaces
 */

interface UserGuard{
    type: 'user',
    username: string,
    email: string,
    id: Id
}

interface PersonGuard{
    type: 'person',
    firstname: string,
    age: string,
    id: Id
}

function logDetails(value: UserGuard | PersonGuard): void {
    if (value.type === 'user'){
        console.log(value.email, value.username)
    }

    if (value.type === 'person'){
        console.log(value.firstname, value.age)
    }
}

/**
 * reusable interfaces
 */


interface hasQuantity {
    quantity: number
}

const somethingReusable: hasQuantity = { quantity: 50}

function printQuantity(item: hasQuantity): void {
    console.log(`the quantity of the item is ${item.quantity}`);
}

const fruit = {
    name: 'mango',
    quantity: 50,
}

const vehicle = {
    type: 'car',
    quantity: 50,
}

const personReusable = {
    name: 'mario',
    age: 30,
}

printQuantity(fruit)
printQuantity(vehicle)
//error printQuantity(personReusable)

/**
 * function signatures
 */

type Calculator = (numOne: number, numTwo: number) => number

function multiplyTwoNumbers(first: number, second: number){
    return first * second
}

function squareNumber(num: number){
    return num * num
}

function joinTwoNumbers(numOne: number, numTwo: number){
    return `${numOne}${numTwo}`
}

let calcs: Calculator[] = []

calcs.push(multiplyTwoNumbers)
calcs.push(squareNumber)
//calcs.push(joinTwoNumbers)

/**
 * funciton signatures on interfaces
 */

interface HasArea {
    name: string
    calcArea: (a: number) => number
}

const shapeOne: HasArea = {
    name: 'square',
    calcArea(l: number) {
        return l * l
    }
}

const shapeTwo: HasArea = {
    name: 'circle',
    calcArea(r: number){
        return Math.PI * r^2
    }
}