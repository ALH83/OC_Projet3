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

//Affichage de la page en mode édition si utilisateur connecté
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

        // Ajoute un écouteur d'événement sur le lien 'Modifier'
        btnEdit.addEventListener('click', function(event) {
            event.preventDefault() // Empêche la navigation
            afficherModale() // Affiche la modale
        })
    }
}

// Affichage de la modale
function afficherModale() {
    let modal = document.getElementById('maModale1')
    if (!modal) {
        modal = creerModale1(travauxData) // Crée la modale si elle n'existe pas déjà
    }
    modal.style.display = 'flex' // Affiche la modale
}

// Création de la modale affichage de la galerie photo
function creerModale1(travauxData) {
    const modal = document.createElement('div')
    const modal1 = document.createElement('div')
    modal1.id = 'maModale1'
    modal1.className = 'modaleGalerie'

    // Création du contenu de la modale
    const modalContent = document.createElement('div')
    modalContent.className = 'modal-content'
    modal1.appendChild(modalContent)

    // Ajout du bouton de fermeture
    const closeButton = document.createElement('span')
    closeButton.className = 'close'
    closeButton.innerHTML = '&times;'
    modalContent.appendChild(closeButton)

    // Ajout du titre 'Galerie photo'
    const modalText = document.createElement('p')
    modalText.textContent = 'Galerie photo'
    modalContent.appendChild(modalText)

    // Ajout de toutes les photos
    const gallery = document.createElement('div')
    gallery.className = 'modal-gallery'
    let i = 0
    while (i < travauxData.length) {
        const work = travauxData[i]
        const imgContainer = document.createElement('div')
        imgContainer.className = 'img-container'
        const img = document.createElement('img')
        const deleteBtn = document.createElement('button')
        img.src = work.imageUrl
        img.alt = work.title
        deleteBtn.className = 'delete-btn'
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can fa-sm"></i>'
        deleteBtn.setAttribute('aria-hidden', 'true')
        imgContainer.appendChild(img)
        imgContainer.appendChild(deleteBtn)
        gallery.appendChild(imgContainer)
        i++
    }
    modalContent.appendChild(gallery)

    //Ajout du boutton "Ajouter une photo "
    const addPhotoBtn = document.createElement('button')
    addPhotoBtn.className = 'addButton'
    addPhotoBtn.textContent = 'Ajouter une photo'
    addPhotoBtn.addEventListener('click', function() {
        modal1.style.display = 'none'
        creerModale2().style.display = 'flex'
    })
    modalContent.appendChild(addPhotoBtn)


    // Fermeture de la modale lorsque l'utilisateur clique sur (x)
    closeButton.onclick = function() {
        modal1.style.display = 'none'
    }

    // Fermeture de la modale lorsque l'utilisateur clique en dehors de celle-ci
    window.onclick = function(eventClose) {
        if (eventClose.target == modal1) {
            modal1.style.display = 'none'
        }
    }

    // Ajout de la modale au corps de la page
    modal.appendChild(modal1)
    document.body.appendChild(modal)
    return modal1
}


initialiserPage()
