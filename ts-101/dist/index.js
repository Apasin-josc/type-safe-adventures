"use strict";
/* 🦔 type basics 🦔 */
Object.defineProperty(exports, "__esModule", { value: true });
let age = 30;
let firstName = "Omar";
let isFictional = true;
let planet = "Earth";
let moons = 1;
let isLarge = false;
//when we give a value of null to a variable is intentional
//when we give a value of undefined that's more unintentional
let something;
let anotherThing;
/* 🦔 arrays & object literals 🦔 */
/**
 * arrays : type[]
 */
let names = ['Mario', 'Luigi', 'Peach'];
let ages = [25, 28, 24];
names.push('Bowser');
ages.push(35);
/**
 * type inference with arrays
 * ts knows that fruits is type string[] & f is a string
 */
let fruits = ['apples', 'pears', 'bananas'];
fruits.push('peaches');
const f = fruits[3];
let things = [1, true, 'hello'];
const t = things[0];
/**
 * object literals
 */
let user = {
    firstName: 'omar',
    age: 28,
    id: 1
};
/**
 * type inference with object literals
 * ts knows that person has a name: string, age: number
 */
let person = {
    name: 'Luigi',
    age: 28
};
const personAge = person.age;
/* 🦔 functions 🦔 */
/**
 * functions
 */
function addTwoNumbers(a, b) {
    return a + b;
}
//console.log(addTwoNumbers(30, 15))
const substractTwoNumbers = (a, b) => {
    return a - b;
};
//console.log(substractTwoNumbers(10, 5))
function addAllNumbers(items) {
    const total = items.reduce((a, c) => a + c, 0);
    //console.log(total)
}
//console.log(addAllNumbers([5,7,9,11,3,2,1]))
/**
 * return type inference
 * infering that result is of type string
 */
function formatGreeting(name, greeting) {
    return `${greeting}, ${name}`;
}
const result = formatGreeting("mario", "hello");
/* 🦔 any 🦔 */
/**
 * any type
 */
let anyAge;
let title;
anyAge = 30;
anyAge = 'thirty';
title = 25;
title = {
    hello: 'world'
};
/**
 * any type in arrays
 */
let anyThings = ['hello', true, 30, null];
anyThings.push(false);
/**
 * functions & any
 */
function addTogether(value) {
    return value + value;
}
const resultOne = addTogether('hello');
const resultTwo = addTogether(3);
//useful when migrating from js to ts
//because using any won't cause errors initially
/* 🦔 tupples 🦔 */
let personTup = ['mario', 30, true];
/**
 * tuples examples
 */
let hsla;
hsla = [200, '100%', '100%', 1];
let xy;
xy = [94.7, 20.1];
function useCoords() {
    //get coords
    const lat = 100;
    const long = 50;
    return [lat, long];
}
const [lat, long] = useCoords();
/**
 * named tuples
 */
let userTup;
userTup = ['mario', 30];
const authorOne = { name: 'mario', avatar: '/img/mario.png' };
const authorTwo = { name: 'yoshi', avatar: '/img/yoshi.png' };
const newPost = {
    title: 'my first post',
    body: 'something interesting',
    tags: ['gaming', 'tech'],
    created_at: new Date(),
    author: authorOne
};
/**
 * as function argument types
 */
function createPost(post) {
    console.log(`Created post ${post.title} by ${post.author.name}`);
}
createPost(newPost);
/**
 * with arrays
 */
let posts = [];
posts.push(newPost);
function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return [r, g, b];
}
const colorOne = getRandomColor();
const colorTwo = getRandomColor();
console.log(colorOne);
console.log(colorTwo);
const userOne = { name: 'mario', score: 75 };
function formatUser(user) {
    console.log(`${user.name} has a score of ${user.score}`);
}
formatUser(userOne);
/* 🦔 union types 🦔 */
let someId;
someId = 1;
someId = '2';
let email = null;
email = "omarscoppola97@gmail.com";
email = null;
let anotherId;
anotherId = 'asdasd123';
anotherId = 5;
/**
 * union type pitfall
 */
function swapIdType(id) {
    //can only use props and methods common to
    //both number and string  types
    //parseInt(id) --> not allowed
    return id;
}
function swapIdTypeGuard(id) {
    if (typeof id === 'string') {
        //can use string methods and properties
        return parseInt(id);
    }
    else {
        //can use number methods and properties
        return id.toString();
    }
}
const idOne = swapIdTypeGuard(1);
const idTwo = swapIdTypeGuard('2');
console.log(idOne);
console.log(idTwo);
function logDetails(value) {
    if (value.type === 'user') {
        console.log(value.email, value.username);
    }
    if (value.type === 'person') {
        console.log(value.firstname, value.age);
    }
}
const somethingReusable = { quantity: 50 };
function printQuantity(item) {
    console.log(`the quantity of the item is ${item.quantity}`);
}
const fruit = {
    name: 'mango',
    quantity: 50,
};
const vehicle = {
    type: 'car',
    quantity: 50,
};
const personReusable = {
    name: 'mario',
    age: 30,
};
printQuantity(fruit);
printQuantity(vehicle);
function multiplyTwoNumbers(first, second) {
    return first * second;
}
function squareNumber(num) {
    return num * num;
}
function joinTwoNumbers(numOne, numTwo) {
    return `${numOne}${numTwo}`;
}
let calcs = [];
calcs.push(multiplyTwoNumbers);
calcs.push(squareNumber);
const shapeOne = {
    name: 'square',
    calcArea(l) {
        return l * l;
    }
};
const shapeTwo = {
    name: 'circle',
    calcArea(r) {
        return Math.PI * r ^ 2;
    }
};
const userInterface = {
    id: 1,
    format() {
        return `This user has an id of ${this.id}`;
    }
};
const bill = {
    id: 2,
    amount: 50,
    server: 'mario',
    format() {
        return `bill with id ${this.id} has ${this.amount} to pay`;
    }
};
function printFormatted(val) {
    console.log(val.format());
}
printFormatted(userInterface);
printFormatted(bill);
function printBill(bill) {
    console.log(`server: ${bill.server}`);
    console.log(bill.format());
}
//printBill(userInterface)
printBill(bill);
const personOne = {
    id: 1,
    firstName: 'Mario'
};
const personTwo = {
    id: '1',
    firstName: 'Yoshi',
    email: 'yoshi@gmail.com'
};
const personThree = {
    email: 'peach@gmail.com'
};
function printUser(user) {
    console.log(`${user.id}, ${user.email}, ${user.firstName}`);
}
//printUser(personOne)
printUser(personTwo);
//printUser(personThree)
//# sourceMappingURL=index.js.map