import { recipes } from "./recipes.js"

/**
 * Récupérer la liste unique des ingrédients
 * @returns {any[]}
 */
export function getIngredients() {
    const ingredientsSet = new Set()

    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
            ingredientsSet.add(ingredient.ingredient)
        })
    })

    return Array.from(ingredientsSet)
}

/**
 * Récupérer la liste unique des appareils
 * @returns {any[]}
 */
export function getAppareil() {
    const appareilSet = new Set()

    recipes.forEach(recipe => {
        appareilSet.add(recipe.appliance)
    })

    return Array.from(appareilSet)
}
/**
 * récupérer les ustensiles
 * @returns {any[]}
 */
export function getUstensils() {
    const ustensilsSet = new Set()

    recipes.forEach(recipe => {
        recipe.ustensils.forEach(ustensil => {
            ustensilsSet.add(ustensil)
        })
    })

    return Array.from(ustensilsSet)  // Convertit l'ensemble en tableau
}

/**
 * récupérer la liste selon le type
 * @param type
 * @returns {*[]}
 */
export function getItemsList(type) {
    let itemsList = []
    if (type === "Ingredients") {
        itemsList = getIngredients()
    } else if (type === "Appareil") {
        itemsList = getAppareil()
    } else if (type === "Ustensils") {
        itemsList = getUstensils()
    }
    return itemsList
}