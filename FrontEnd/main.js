// Exécution de la récupération des données et de l'affichage
async function initialiserPage() {
    await fetchData() // Attend que les données soient récupérées avant de continuer
    afficherFiltres(categoriesData) // Affiche les filtres une fois les données récupérées
    afficherTravaux('Tous') // Affiche tous les travaux initialement
    modeEdition() // Configure la page en mode d'édition si l'utilisateur est connecté
}

let categoriesData = []
let travauxData = []

// Fonction asynchrone pour récupérer les données de l'API en utilisant Promise.all
async function fetchData() {
    try {
        // Création des requêtes sans les envoyer immédiatement
        const categoriesPromise = fetch("http://localhost:5678/api/categories")
        const travauxPromise = fetch("http://localhost:5678/api/works")

        // Utilisation de Promise.all pour attendre que les 2 promesses soient résolues
        const [responseCategories, responseTravaux] = await Promise.all([categoriesPromise, travauxPromise])

        // Vérifie puis transforme les réponses en JSON
        if (!responseCategories.ok) {
            throw new Error('Erreur de communication ' + responseCategories.statusText)
        }
        categoriesData = await responseCategories.json()

        if (!responseTravaux.ok) {
            throw new Error('Erreur de communication ' + responseTravaux.statusText)
        }
        travauxData = await responseTravaux.json()
    }
    catch (error) {
        alert("Erreur : " + error)
    }
}


//Affichage des filtres de catégories en fonction des données reçues de l'API
function afficherFiltres() {
    const filtres = document.getElementById("filtresMenu")
    // Efface les filtres existants
    filtres.innerHTML = ''  
    // Ajoute un élément de filtre 'Tous' avant les autres filtres
        const btnTous = document.createElement('button')
        btnTous.className = 'filtresItem'
        btnTous.textContent = 'Tous'
        // Ajoute un écouteur d'evenement, au clic on affiche tous les travaux via la fonction filtrerTravaux
        btnTous.addEventListener('click', () => afficherTravaux('Tous'))
        // Ajoute le filtre "Tous" à la liste des filtres
        filtres.appendChild(btnTous)
    // Ajoute les autres bouttons de filtres après le filtre "Tous"
        // Utilisation d'un Set pour les catégories uniques
        let categorySet = new Set()
        // Boucle sur chaque catégorie de la galerie
        let i = 0
        while (i < categoriesData.length) {
            const category = categoriesData[i] // On récupère chaque catégorie
                if (!categorySet.has(category.name)) { //on vérifie que la catégorie n'ait pas déjà été ajoutée
                    categorySet.add(category.name)     // on ajoute la catégorie à la liste des filtres si elle n'existe pas
                    const btnCategorie = document.createElement('button') // Nouvelle catégorie unique = nouveau bouton crée
                    btnCategorie.className = 'filtresItem'
                    btnCategorie.textContent = category.name
                    // Ajoute un écouteur d'evenement, au clic on affiche les travaux filtrés par catégorie via la fonction filtrerTravaux
                    btnCategorie.addEventListener('click', () => afficherTravaux(category.name))
                    // Ajoute le filtre (boutton) d'une catégorie donnée à la liste des filtres
                    filtres.appendChild(btnCategorie)
                }
            i++
        }
}


//Affichage des travaux en fonction des données reçues de l'API
function afficherTravaux(categoryName) {
    const gallery = document.querySelector(".gallery")
    // Efface le contenu actuel de la galerie
    gallery.innerHTML = ''
    // On détermine quelle liste doit être utilisée, soit la liste complète 'Tous' soit une liste filtrée d'une catégorie spécifiée
    const travaux = (categoryName === 'Tous') ? travauxData : travauxData.filter(work => work.category.name === categoryName)
    // Boucle sur chaque travail filtré pour l'afficher dans la galerie
       let i = 0
       while (i < travaux.length) {
           const work = travaux[i]  // On récupère chaque travail
           const figure = document.createElement('figure') // Crée un élément html "figure"
           figure.className = '.gallery'
           figure.innerHTML = `
               <img src="${work.imageUrl}" alt="${work.title}">
               <figcaption>${work.title}</figcaption>
               `
           gallery.appendChild(figure)  //Ajoute chaque élément figure à la gallerie
           i++
       }
}

function modeEdition() {
    const filtres = document.getElementById("filtresMenu")
    const lienLog = document.querySelector('.log')
    const titreMesprojets = document.querySelector('.mesProjets h2')

    if (localStorage.getItem('sessionToken')) {
        // Utilisateur est connecté = mode édition
        filtres.style.display = 'none' // Cache les filtres
        lienLog.innerHTML = "logout" //change le nom 'login' par 'logout'
        lienLog.href = '#'

        // Création du bandeau noir
        const bandeau = document.createElement('div')
        bandeau.id = 'bandeauEdition'
        bandeau.textContent = 'Mode édition'

        // Création de l'élément icône
        const iconeModifier = document.createElement('i')
        iconeModifier.className = 'fa-regular fa-pen-to-square'
        iconeModifier.setAttribute('aria-hidden', 'true')

        // Création de l'élément lien "Modifier"
        const btnEdit = document.createElement('a')
        btnEdit.href = ''
        btnEdit.textContent = ' modifier'
        btnEdit.className = 'edit-link'

        // Insère le bandeau au début du body
        document.body.insertAdjacentElement('afterbegin', bandeau)

        // Décale le reste du contenu pour ne pas être caché par le bandeau
        document.body.style.paddingTop = bandeau.offsetHeight + 'px'

        // Insère l'icône et le lien juste après le h2
        titreMesprojets.insertAdjacentElement('afterend', btnEdit)
        btnEdit.insertAdjacentElement('afterbegin', iconeModifier)

        // Ajoute un écouteur d'événement sur le lien 'logout'
        lienLog.addEventListener('click', () => {
            localStorage.removeItem('sessionToken') //on supprime le token de connexion
            window.location.reload() //on recharge la page
        })
    }
}

initialiserPage()
