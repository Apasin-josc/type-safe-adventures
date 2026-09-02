/**
 * CLASSES 101
 * a class in typescript is like a blue print for a object
 */


type Base = 'classic' | 'thick' | 'thin' | 'garlic'

class Pizza {
    //constructor
    constructor(title: string, price: number){
        this.title = title
        this.price = price
    }

    //properties of the pizza
    title: string
    price: number
    base: Base = 'classic'
    toppings: string[] = []

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