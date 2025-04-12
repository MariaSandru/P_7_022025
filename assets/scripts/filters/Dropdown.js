import {getItemsList} from "../data/getData.js"

export default class Dropdown {
    constructor(type, callback) {
        this.callback = callback
        this.selectedItem = []
        this.type = type
        this.handleOutsideClick = this.handleOutsideClick.bind(this)
    }

    /**
     * créer le dropdown
     * @param viewInstance
     */
    createDropDown(viewInstance) {
        // récup la div
        const filtersContainer = document.querySelector(".filters")

        // créer un early return
        if (!filtersContainer) return

        // créer un bouton select
        const select = document.createElement("div")
        select.className = "dropdown"

        // créer le dropdown avec une option
        select.innerHTML = `<div class="type">
                                ${this.type}
                                <i class="fa-solid fa-chevron-down"></i>
                            </div>`

        // récupérer la liste des éléments dans un tableau
        const itemsList = getItemsList(this.type)

        // créer une div cachée
        this.hiddenList = document.createElement("div")
        this.hiddenList.className = "hiddenList"

        // créer une ul
        const ulGroupe = document.createElement("ul")

        // boucle pour afficher les items
        this.showItems(itemsList, ulGroupe)

        // append le dropdown à la div
        filtersContainer.appendChild(select).appendChild(this.hiddenList)

        // toggle l'affichage du dropdown
        const typeDiv = select.querySelector(".type")
        typeDiv.addEventListener("click", () => {
            this.toggle()
        })

        // sélectionner la div pour afficher les LI sélectionner
        const selectionDisplay = document.querySelector('.selectionDisplay')

        // créer un itemFilterSelectedDiv conteneur pour tous les items sélectionnés
        this.itemFilterSelectedDiv = document.createElement('div')
        this.itemFilterSelectedDiv.className = 'itemFilterSelectedDiv'
        selectionDisplay.appendChild(this.itemFilterSelectedDiv)

        // rajouter un champ de recherche
        this.createSearchInput(ulGroupe)

        // rajouter un click sur le LI
        this.hiddenList.addEventListener("click", (event) => {
            if (event.target.tagName === 'LI') {
                this.selectItem(event, this.itemFilterSelectedDiv)
            }
        })

    }

/**
     * Créer un champ de recherche
     * @param ulGroupe
     */
createSearchInput(ulGroupe) {
    // créer et configurer le conteneur de recherche
    const searchContainer = this.createSearchContainer()

    // créer l'input de recherche et le bouton de suppression
    const searchInput = this.createSearchInputField(searchContainer)
    const clearButton = this.createClearButton(searchContainer, searchInput)

    // insérer la div de recherche avant les ul
    this.hiddenList.insertBefore(searchContainer, ulGroupe)

    // configurer les événements d'interaction
    this.addSearchInputEvents(searchInput, clearButton, ulGroupe)
    this.addClearButtonEvent(clearButton, searchInput)
}

/**
 * créer le conteneur de recherche et le retourne
 * @returns {HTMLDivElement}
 */
createSearchContainer() {
    const searchContainer = document.createElement('div')
    const searchFlex = document.createElement('div')

    searchContainer.className = 'searchContainer'
    searchFlex.className = 'searchFlex'
    searchContainer.appendChild(searchFlex)

    return searchContainer
}

/**
 * créer l'input de recherche et l'ajoute au conteneur
 * @param searchContainer
 * @returns {HTMLInputElement}
 */
createSearchInputField(searchContainer) {
    const searchInput = document.createElement('input')
    searchInput.className = 'search-input'
    searchInput.placeholder = `Rechercher ${this.type.toLowerCase()}`
    searchContainer.querySelector('.searchFlex').appendChild(searchInput)

    return searchInput
}

 /**
     * créer le bouton de suppression (X) et l'ajoute au conteneur
     * @param searchContainer
     * @param searchInput
     * @returns {HTMLSpanElement}
     */
 createClearButton(searchContainer, searchInput) {
    const clearButton = document.createElement('span')
    clearButton.className = 'clear-button'
    clearButton.innerHTML = `<i class="fa-solid fa-xmark"></i>`
    clearButton.style.display = 'none'  // Initialement caché

    searchContainer.querySelector('.searchFlex').appendChild(clearButton)

    // Affiche le bouton X quand l'input n'est pas vide
    searchInput.addEventListener('input', () => {
        clearButton.style.display = searchInput.value.length > 0 ? 'inline' : 'none'
    })

    return clearButton
}

/**
 * ajoute l'événement d'écoute à l'input de recherche pour filtrer la liste
 * @param searchInput
 * @param clearButton
 * @param ulGroupe
 */
addSearchInputEvents(searchInput, clearButton, ulGroupe) {
    this.filterItemsList(searchInput, ulGroupe)
}

/**
 * Ajoute l'événement de suppression au bouton clearButton
 * @param clearButton
 * @param searchInput
 */
addClearButtonEvent(clearButton, searchInput) {
    clearButton.addEventListener('click', () => {
        searchInput.value = ''
        clearButton.style.display = 'none'

        // Afficher tous les items après avoir effacé le champ
        this.hiddenList.querySelectorAll("li").forEach(item => {
            item.style.display = "block"
        })
    })
}

/**
 * Boucle pour afficher les items
 * @param itemsList
 * @param ulGroupe
 */
showItems(itemsList, ulGroupe) {
    // boucle pour afficher en liste
    itemsList.forEach(item => {
        const listItem = document.createElement("li")
        listItem.textContent = item
        this.hiddenList.appendChild(ulGroupe).appendChild(listItem)
    })
}

/**
 * Toggle la class 'show'
 */
toggle() {
    // toggle l'affichage
    this.hiddenList.classList.toggle('show')

    // rotation de la fleche
    const arrow = this.hiddenList.parentElement.querySelector('.fa-chevron-down')
    arrow.classList.toggle('rotate')

    if (this.hiddenList.classList.contains('show')) {
        document.addEventListener('click', this.handleOutsideClick)
    } else {
        document.removeEventListener('click', this.handleOutsideClick)
    }
}

/**
 * Function pour cliquer en dehors des Dropdown
 * @param event
 */
handleOutsideClick(event) {
    if (!this.hiddenList.contains(event.target) && !this.hiddenList.parentElement.contains(event.target)) {
        this.toggle()
    }
}

/**
 * Sélectionner l'item
 * @param event
 * @param selectionDisplay
 */
selectItem(event, selectionDisplay) {
    // masqué l'élément sélectionner
    const selectedLi = event.target
    selectedLi.classList.add('hidden')

    this.toggle()

    // récupérer le text event
    const selectedText = event.target.textContent

    // vérifier si l'item a déjà été sélectionné
    if (this.selectedItem.includes(selectedText)) {return}

    // push l'historique
    this.selectedItem.push(selectedText)

    // callback
    this.callback(this.type, selectedText)

    // mettre a jour l'item sélectionner
    this.updateItemsList(this.itemFilterSelectedDiv)
}

/**
 * Mettre a jour la list des items
 * @param itemFilterSelectedDiv
 */
updateItemsList(itemFilterSelectedDiv) {
    // vider l'affichage
    itemFilterSelectedDiv.innerHTML = ''

    // vérifier si des items sont sélectionnés
    if (this.selectedItem.length === 0) {
        // masquer le conteneur si aucun élément n'est sélectionné
        itemFilterSelectedDiv.style.display = 'none'
    } else {
        // afficher le conteneur et ajouter les éléments sélectionnés
        itemFilterSelectedDiv.style.display = 'flex'

        // boucle pour rajouter chaque item avec un bouton pour supprimer
        this.selectedItem.forEach((itemText) => {
            const itemDiv = document.createElement('div')
            const itemName = document.createElement('div')
            const xMark = document.createElement('div')
            xMark.innerHTML = `<i class="fa-solid fa-xmark"></i>`

            itemDiv.className = 'selectedItem'
            itemName.textContent = itemText
            xMark.className = 'xMark'

            // supprimer l'élément au clic
            xMark.addEventListener('click', () => {
                this.removeItem(itemText, itemFilterSelectedDiv)
            })

            // ajouter l'item et le xMark dans itemFilterSelectedDiv
            itemFilterSelectedDiv.appendChild(itemDiv).appendChild(itemName)
            itemFilterSelectedDiv.appendChild(itemDiv).appendChild(xMark)
        })
    }
}

/**
 * Supprimer l'item et le remettre dans la liste
 * @param itemText
 * @param selectionDisplay
 */
removeItem(itemText, selectionDisplay) {
    // retirer l'élément de la liste ul>li
    this.selectedItem = this.selectedItem.filter(item => item !== itemText)

    // trouver le li qui correspondant dans le dropdown
    const allItems = Array.from(this.hiddenList.querySelectorAll('li'))
    const itemLi = allItems.find(li => li.textContent === itemText)

    // si on trouve l'élément, le réafficher dans la liste
    if (itemLi) {
        itemLi.classList.remove('hidden')
    }

    // mettre a jour l'item list
    this.updateItemsList(selectionDisplay)

    // appeler le callback
    this.callback(this.type, itemText, true)
}


/**
 * fonction pour filtrer les items
 * @param searchInput
 * @param ulGroupe
 */
filterItemsList(searchInput, ulGroupe) {
    // ajouter un addEventListener sur l'input spécifique à cette instance
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase()

        // commencer le filtering après 3 caractères
        if (query.length < 3) {
            ulGroupe.querySelectorAll("li").forEach(item => {
                item.style.display = "block"
            })
            return
        }

        ulGroupe.querySelectorAll("li").forEach(item => {
            const itemText = item.textContent.toLowerCase()
            if (itemText.includes(query)) {
                item.style.display = "block"
            } else {
                item.style.display = "none"
            }
        })
    })
}

/**
 * Updater les items dans le Dropdown
 * @param newItems
 */
updateItems(newItems) {
    // vider les items en cours
    this.hiddenList.innerHTML = ""

    // créer un nouveau ul
    const ulGroupe = document.createElement("ul")

    // afficher les items en cachant les items sélectionnées
    this.showItems(newItems.filter(item => !this.selectedItem.includes(item)), ulGroupe)

    // append la liste updater
    this.hiddenList.appendChild(ulGroupe)

    // recréer la barre de recherche
    this.createSearchInput(ulGroupe)
}
}

