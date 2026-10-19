/**
 * classes in JS
 */

//reference type
var object1 = { value: 10 };
var object2 = object1;
var object3 = { value: 10 };

//context vs scope
const object4 = {
    a: function () {
        console.log(this);
    }
}

//instantiation
class Player {
    /*every time i create player the first thing that gets run is the constructor function
    and the constructor is going to create this properties*/
    constructor(name, type) {
        console.log('player', this);
        this.name = name;
        this.type = type;
    }

    introduce() {
        console.log(`hi i am ${name}, and im a ${type}`);
    }
}

class Wizard extends Player {
    //whenever you extend a class you want to use super so that we have essentially access to this
    constructor(name, type) {
        super(name, type);
        console.log('wizard', this);
    }
    play() {
        console.log(`weeeeee i',a a ${this.type}`);
    }
}

const wizzard1 = new Wizard('Shelly', 'healer');
const wizzard2 = new Wizard('Shawn', 'Dark Magic');