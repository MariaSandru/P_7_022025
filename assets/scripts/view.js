import { recipes } from "./data/recipes.js"
import { cardTemplate } from "./function/cardTemplate.js"
import Dropdown from "./filters/Dropdown.js"

export class View {
    constructor() {
        this.selectedIngredientsList = []
        this.selectedApplianceList = []
        this.selectedUstensilsList = []

        /**
         * afficher les recettes
         */
        this.displayRecipes(recipes, this.createCardRecipe)

        /**
         * afficher les filtres
         */
        this.getDropDowns()

        /**
         * barre de recherche
         */
        this.searchInputIndex()
    }

    /**
     * créer carte de recette
     * @param recipe
     * @returns {*}
     */
    createCardRecipe(recipe) {
        return cardTemplate(recipe)
    }

    /**
     * créer les dropdowns
     */
    getDropDowns() {
        this.dropdownIngredient = new Dropdown("Ingredients", (type, selectedText, isRemoving) => {
            this.updateSelectedItems(type, selectedText, isRemoving)
        })
        this.dropdownIngredient.createDropDown(this)

        this.dropdownAppliance = new Dropdown("Appareil", (type, selectedText, isRemoving) => {
            this.updateSelectedItems(type, selectedText, isRemoving)
        })
        this.dropdownAppliance.createDropDown(this)

        this.dropdownUstensil = new Dropdown("Ustensils", (type, selectedText, isRemoving) => {
            this.updateSelectedItems(type, selectedText, isRemoving)
        })
        this.dropdownUstensil.createDropDown(this)
    }

    /**
     * fonctionne pour mettre a jour les item sélectionner
     * @param type
     * @param selectedText
     * @param isRemoving
     */
    updateSelectedItems(type, selectedText, isRemoving = false) {
        if (!isRemoving) {
            switch (type) {
                case "Ingredients":
                    this.selectedIngredientsList.push(selectedText)
                    break
                case "Appliances":
                    this.selectedApplianceList.push(selectedText)
                    break
                case "Ustensils":
                    this.selectedUstensilsList.push(selectedText)
                    break
            }
        } else {
            switch (type) {
                case "Ingredients":
                    this.selectedIngredientsList = this.selectedIngredientsList.filter((text) => text !== selectedText)
                    break
                case "Appliances":
                    this.selectedApplianceList = this.selectedApplianceList.filter((text) => text !== selectedText)
                    break
                case "Ustensils":
                    this.selectedUstensilsList = this.selectedUstensilsList.filter((text) => text !== selectedText)
                    break
            }
        }

        console.log('Ingredients List:', this.selectedIngredientsList)
        console.log('Appareil List:', this.selectedApplianceList)
        console.log('Ustensils List:', this.selectedUstensilsList)

        // lancer vers la fonction qui s'occupe des filtres
        this.filterRecipes()
    }

    /**
     * Afficher les recettes
     * @param recipes
     * @param createCardRecipe
     */
    displayRecipes(recipes, createCardRecipe) {
        const recipesContainer = document.getElementById("recipe-container")

        // afficher un message si y a 0 recettes
        if (recipes.length === 0) {
            recipesContainer.innerHTML =
                `
                    <div class="noRecipeMessage">
                        <img class="imgNoRecipe" src="assets/img/svg/noResult.svg" alt="image qui affiche aucun résultats">
                        <p class="message">Aucune recette  correspondante à la recherche.</p>
                    </div>
                `
        } else {
            // vider l'HTML
            recipesContainer.innerHTML = ""

            // boucle recettes
            recipes.forEach(recipe => {
                const recipeElement = createCardRecipe(recipe)
                recipesContainer.appendChild(recipeElement)
            })
        }

        this.showNumberRecipes(recipes)
    }

    /**
     * Function pour filtrer les recettes
     */
    filterRecipes() {
        let filteredRecipes = recipes

        filteredRecipes = this.filteredByIngredients(filteredRecipes)
        filteredRecipes = this.filteredByAppliance(filteredRecipes)
        filteredRecipes = this.filteredByUstensils(filteredRecipes)
        filteredRecipes = this.filteredBySearchInput(filteredRecipes)

        // updated les dropdowns
        this.updateDropdowns(filteredRecipes)

        // afficher les recettes filtrées
        this.displayRecipes(filteredRecipes, this.createCardRecipe)
    }

    /**
     * Function qui gere la mise a jour des dropdown
     * @param filteredRecipes
     */
    updateDropdowns(filteredRecipes) {
        // Créer un nouveau set depuis les recettes filtrer
        const ingredients = new Set()
        const appliances = new Set()
        const utensils = new Set()

        filteredRecipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => ingredients.add(ing.ingredient))
            appliances.add(recipe.appliance)
            recipe.ustensils.forEach(ust => utensils.add(ust))
        })

        // Updater chaque dropdown avec des items unique
        this.dropdownIngredient.updateItems(Array.from(ingredients))
        this.dropdownAppliance.updateItems(Array.from(appliances))
        this.dropdownUstensil.updateItems(Array.from(utensils))
    }

    /**
     * Function qui filtre par Ingredients
     * @param filteredRecipes
     * @returns {*}
     */
    filteredByIngredients(filteredRecipes) {
        if (this.selectedIngredientsList.length > 0) {
            return filteredRecipes.filter(recipe =>
                this.selectedIngredientsList.every(ingredient =>
                    recipe.ingredients.some(recIng => recIng.ingredient.includes(ingredient))
                )
            )
        }
        return filteredRecipes
    }

    /**
     * Function qui filtre par Appliance
     * @param filteredRecipes
     * @returns {*}
     */
    filteredByAppliance(filteredRecipes) {
        // je filtre par appareil
        if (this.selectedApplianceList.length > 0) {
            filteredRecipes = filteredRecipes.filter(recipe =>
                this.selectedApplianceList.includes(recipe.appliance)
            )
        }

        return filteredRecipes
    }

    /**
     * Function qui filtre par ustensils
     * @param filteredRecipes
     * @returns {*}
     */
    filteredByUstensils(filteredRecipes) {
        // je filtre par ustensiles
        if (this.selectedUstensilsList.length > 0) {
            filteredRecipes = filteredRecipes.filter(recipe =>
                this.selectedUstensilsList.every(ustensil =>
                    recipe.ustensils.includes(ustensil)
                )
            )
        }

        return filteredRecipes
    }

    /**
     * Function qui filtre les recettes depuis la barre de recherche
     * @param filteredRecipes
     * @returns {*}
     */
    filteredBySearchInput(filteredRecipes) {
        // je filtre dans l'input apres 3 caractères
        const searchQuery = this.searchQuery?.toLowerCase() || ""
        if (searchQuery.length >= 3) {
            filteredRecipes = filteredRecipes.filter(recipe =>
                recipe.name.toLowerCase().includes(searchQuery) ||
                
                recipe.ingredients.some(ingredient => ingredient.ingredient.toLowerCase().includes(searchQuery)) )
        }

        return filteredRecipes
    }

    /**
     * afficher le nombre de recettes
     * @param recipes
     */
    showNumberRecipes(recipes) {
        const numberDiv = document.querySelector('.numberFound')

        if (numberDiv) {
            numberDiv.textContent = `${recipes.length} Recettes`
        }
    }

    /**
     * Function qui gère la barre de recherche avec une longeur de 3 caractere
     */
    searchInputIndex() {
        const searchInputIndex = document.querySelector('.searchBar__input')

        const clearButton = document.createElement('span')
        clearButton.className = 'clear-button'
        clearButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`
        clearButton.style.display = 'none'

        // append le bouton clear
        searchInputIndex.parentNode.appendChild(clearButton)

        searchInputIndex.addEventListener('input', (event) => {
            const inputValue = event.target.value

            // afficher ou cacher le bouton apres 3 caractères
            if (inputValue.length >= 3) {
                this.searchQuery = inputValue.replace(/\s/g, ""); // Supprime tous les espaces
                clearButton.style.display = 'inline'
            } else {
                this.searchQuery = ""
                clearButton.style.display = 'none'
            }

            // filter recipes based on input
            this.filterRecipes()
        })

        // vider quand y a un clique
        clearButton.addEventListener('click', () => {
            searchInputIndex.value = ''
            this.searchQuery = ""
            clearButton.style.display = 'none'
            this.filterRecipes()
        })
    }
}