// Exécution de la récupération des données et de l'affichage
async function initialiserPage() {
    await fetchData() // Attend que les données soient récupérées avant de continuer
    afficherFiltres(categoriesData) // Affiche les filtres une fois les données récupérées
    afficherTravaux('Tous') // Affiche tous les travaux initialement
    modeEdition() // Configure la page en mode d'édition si l'utilisateur est connecté
}
// Récupération des données dans un tableau
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
    let modal = document.getElementById('modale1')
    // si la modale n'existe pas déjà n'existe pas déjà, renvoie vers la fonction creerModale1 pour la créer
    if (!modal) {
        modal = creerModale1(travauxData).style.display = 'flex'
    } else {
    // si la modale existe déjà, on l'affiche
        modal.style.display = 'flex'
    }
}

// Création de la modale affichage de la "galerie photo"
function creerModale1(travauxData) {
    const modal = document.createElement('div')
    modal.id = 'modale1'
    modal.className = 'modaleGalerie'

    // Création du contenu de la modale
    const modalContent = document.createElement('div')
    modalContent.className = 'modal-content'
    modal.appendChild(modalContent)

    // Ajout du bouton de fermeture
    const closeButton = document.createElement('span')
    closeButton.className = 'closeBtn'
    closeButton.innerHTML = '&times;'
    modalContent.appendChild(closeButton)

    // Ajout du titre 'Galerie photo'
    const modalText = document.createElement('p')
    modalText.textContent = 'Galerie photo'
    modalContent.appendChild(modalText)

    // Ajout de toutes les photos à partir des données déjà récupérées via l'API
    const gallery = document.createElement('div')
    gallery.className = 'modal-gallery'
    let i = 0
    while (i < travauxData.length) {
        const work = travauxData[i]
        // Ajout du container image
        const imgContainer = document.createElement('div')
        imgContainer.className = 'img-container'
        // Ajout des éléments images
        const img = document.createElement('img')
        img.src = work.imageUrl
        img.alt = work.title
        // Ajout du bouton pour supprimer les photos
        const deleteBtn = document.createElement('button')
        deleteBtn.className = 'delete-btn'
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can fa-sm"></i>'
        deleteBtn.setAttribute('aria-hidden', 'true')
        // Rattachement des éléments au DOM
        imgContainer.appendChild(img)
        imgContainer.appendChild(deleteBtn)
        gallery.appendChild(imgContainer)
        i++
    }
    modalContent.appendChild(gallery)

    //Ajout du boutton "Ajouter une photo"
    const addPhotoBtn = document.createElement('button')
    addPhotoBtn.className = 'addButton'
    addPhotoBtn.textContent = 'Ajouter une photo'
    //Ajout d'un écouteur d'événement pour basculer (au clic) vers la modale du formulaire d'import de photos
    addPhotoBtn.addEventListener('click', function() {
        //On cache la modale "Galerie photo"
        modal.style.display = 'none'
        creerModale2().style.display = 'flex'
    })
    modalContent.appendChild(addPhotoBtn)

    // Ajout de la modale au corps de la page
    document.body.appendChild(modal)
    return modal
}

// Création de la modale "ajout photos"
function creerModale2 () {
     // Vérifie si la modale existe déjà pour éviter d'en avoir plusieurs d'ouvertes à la fois
    let modal2 = document.getElementById('modale2')
    // Si la modale n'existe pas, on l'a crée
    if (!modal2) {
    modal2 = document.createElement('div')
    modal2.id = 'modale2'
    modal2.className = 'modaleFormulaire'

    // Création du contenu de la modale
    const modalContent = document.createElement('div')
    modalContent.className = 'modal-content'
    modal2.appendChild(modalContent)

    // Ajout du bouton "précédent"
    const prevButton = document.createElement('span')
    prevButton.className = 'prevBtn'
    prevButton.innerHTML = '&lt;'
    modalContent.appendChild(prevButton)

    // Ajout du bouton de fermeture
    const closeButton = document.createElement('span')
    closeButton.className = 'closeBtn'
    closeButton.innerHTML = '&times;'
    modalContent.appendChild(closeButton)

    // Ajout du titre 'Ajout photo'
    const modalText = document.createElement('p')
    modalText.textContent = 'Ajout photo'
    modalContent.appendChild(modalText)

    // Mise en place du formulaire depuis la fonction formulaireImportPhotos
    const form = formulaireImportPhotos()

    modalContent.appendChild(form)
    document.body.appendChild(modal2)

} else {
    // Si la modale existe déjà, on l'affiche
    modal2.style.display = 'flex'
}
return modal2
}

// Création du formulaire d'import photo pour la "modale2"
function formulaireImportPhotos () {
    // Création du formulaire
    const form = document.createElement('form')
    form.id = 'addPhotoForm'

    const addPhotoButton = document.createElement('button')
    addPhotoButton.className = 'ajoutPhoto'
    addPhotoButton.setAttribute('aria-label', 'Ajouter une photo')
    addPhotoButton.innerText = '+ Ajouter photo'
    addPhotoButton.addEventListener('click', (e) => {
        e.preventDefault() // Empêche toute action par défaut
        photoInput.click() // Déclenche le clic sur l'input de fichier
    })

    const photoInput = document.createElement('input')
    photoInput.type = 'file'
    photoInput.id = 'photo'
    photoInput.style.display = 'none' // Cache l'input pour ne pas le rendre visible directement
    photoInput.accept = 'image/png, image/jpeg' // Restreint les types de fichiers acceptés

    const photoLabel = document.createElement('label')
    photoLabel.className = 'photoLabelForm'    

    const photoLabelIcone = document.createElement('div')
    const photoLabelSvg = document.createElement('i')
    photoLabelIcone.className = 'icone'
    photoLabelSvg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="76" width="76" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#b9c5cc" d="M448 80c8.8 0 16 7.2 16 16V415.8l-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7C167 291.7 159.8 288 152 288s-15 3.7-19.5 10.1l-80 112L48 416.3l0-.3V96c0-8.8 7.2-16 16-16H448zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"/></svg>'
    photoLabelIcone.appendChild(photoLabelSvg)
    photoLabel.appendChild(photoLabelIcone)

    form.appendChild(photoInput)
    photoLabel.appendChild(addPhotoButton)
    const photoLabelInfo = document.createElement('div')
    photoLabelInfo.className = 'file-info'
    photoLabelInfo.innerText ='jpg, png : 4mo max'
    photoLabel.appendChild(photoLabelInfo)



    form.appendChild(photoLabel)

    // Zone de saisie de titre
    const titleInput = document.createElement('input')
    titleInput.type = 'text'
    titleInput.id = 'titleInput'
    titleInput.placeholder = ''
    const titleLabel = document.createElement('label')
    titleLabel.setAttribute('for', 'title')
    titleLabel.textContent = 'Titre'
    titleLabel.id = 'titleLabel'
    form.appendChild(titleLabel)
    form.appendChild(titleInput)

    // Zone de sélection de catégorie
    const categorySelect = document.createElement('select')
    categorySelect.id = 'categorySelect'
    const categoryLabel = document.createElement('label')
    categoryLabel.id = 'categoryLabel'
    categoryLabel.setAttribute('for', 'category')
    categoryLabel.textContent = 'Catégorie'
    // On affiche par défaut une catégorie "vide" qui est choisie dans l'affichage dans la zone de select
    const defaultOption = document.createElement('option')
    defaultOption.value = ''
    defaultOption.selected = true // On sélectionne cette option par défaut
    defaultOption.disabled = true // On ne permet pas à l'utilisateur de choisir cette option
    categorySelect.appendChild(defaultOption)
    let i = 0
    while (i < categoriesData.length) {
        const category = categoriesData[i]
        const option = document.createElement('option')
        option.value = category.name
        option.textContent = category.name
        categorySelect.appendChild(option)
        i++
    }
    form.appendChild(categoryLabel)
    form.appendChild(categorySelect)

    // Bouton de soumission
    const submitBtn = document.createElement('button')
    submitBtn.id = 'submitBtn'
    submitBtn.type = 'submit'
    submitBtn.textContent = 'Valider'
    submitBtn.disabled = true // Bouton désactivé par défaut
    form.appendChild(submitBtn)

    // Validation du formulaire
    form.addEventListener('input', () => {
        submitBtn.disabled = !photoInput.files.length || !titleInput.value.trim() || !categorySelect.value
        const isValid = photoInput.files.length && titleInput.value.trim() && categorySelect.value
        submitBtn.disabled = !isValid
        submitBtn.className = isValid ? 'submitBtnActive' : 'submitBtnInactive'
    })


    return form
}

// Gestionnaire d'événements qui concerne l'affichage et la navigation pour les modales
function gestionnaireEvenementModal() {
    // Fermeture de la modale lorsque l'utilisateur clique sur le bouton de fermeture ou en dehors de la modale
    window.onclick = function(event) {
        const modales = document.querySelectorAll('.modaleGalerie, .modaleFormulaire')  // Récupère toutes les modales
        modales.forEach(modal => {
            if (event.target.classList.contains('closeBtn') || event.target === modal) {
                closeAllModals() // Ferme toutes les modales
                clearForm() // Vide le formulaire
            }
        })

    // Gère le clic sur le bouton précédent dans la modale de formulaire
    const prevButtons = document.querySelectorAll('.modaleFormulaire .prevBtn')
    prevButtons.forEach(button => {
        button.onclick = function() {
                document.querySelector('.modaleGalerie').style.display = 'flex'
                document.querySelector('.modaleFormulaire').style.display = 'none'
            }
        })
    }
}

// Fermeture des modales
function closeAllModals() {
    document.querySelector('.modaleGalerie').style.display = 'none'
    document.querySelector('.modaleFormulaire').style.display = 'none'
}

initialiserPage().then(() => {
    gestionnaireEvenementModal() // Configure les gestionnaires après l'initialisation de la page
})
