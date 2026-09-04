/**
 * CLASSES 101
 * a class in typescript is like a blue print for a object
 */


type Base = 'classic' | 'thick' | 'thin' | 'garlic'

interface HasFormatter {
    format(): string
}

abstract class MenuItem implements HasFormatter{
    constructor(private title: string, private price: number){}

    get details(): string {
        return `${this.title} - $ ${this.price}`
    }

    format() {
        return `this menu item is called ${this.title} and is $ ${this.price}`
    }
}
class Pizza extends MenuItem {
    //constructor
    constructor(title: string, price: number){
        super(title, price)
        //this.title = title
        //this.price = price
    }

    //properties of the pizza
    //access modifiers public | private
    //private title: string
    //private price: number
    private base: Base = 'classic'
    private toppings: string[] = []

    //methods over the pizza class
    addTopping(topping: string): void {
        this.toppings.push(topping)
    }

    removeTopping(topping: string): void{
        this.toppings = this.toppings.filter((t) => t !== topping)
    }

    selectBase(b: Base): void{
        this.base = b
    }
}

const pizza = new Pizza('mario special', 15)
pizza.selectBase('garlic')
pizza.addTopping('mushrooms')
pizza.addTopping('olives')


const pizzaOne = new Pizza('mario special', 15)
const pizzaTwo = new Pizza('luigi special', 10)

function addMushroomsToPizzas(pizzas: Pizza[]): void{
    for (const p of pizzas){
        p.addTopping('mushrooms')
    }
}

addMushroomsToPizzas([pizzaOne, pizzaTwo])
//console.log(pizzaOne)
//console.log(pizzaTwo)

function printMenuItem(item: MenuItem): void{
    console.log(item.details)
}

printMenuItem(pizzaOne)

function printFormatted(val: HasFormatter): void {
    console.log(val.format())
}

printFormatted(pizzaOne)