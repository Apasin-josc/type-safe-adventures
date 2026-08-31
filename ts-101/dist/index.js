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
//# sourceMappingURL=index.js.map