//Récupération des catégories via l'API
fetch("http://localhost:5678/api/categories")
        // Vérifie si la requête a réussi ou non
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur de communication ' + response.statusText)
        }
        return response.json()
    })
    .then(data => {
        const filtres = document.getElementById("filtresMenu")
        // Efface les filtres existants
        filtres.innerHTML = ''  
        // Ajoute un élément de filtre 'Tous' avant les autres filtres
            const btnTous = document.createElement('button')
            btnTous.className = 'filtresItem'
            btnTous.textContent = 'Tous'
            // Ajoute un écouteur d'evenement, au clic on affiche tous les travaux via la fonction filtrerTravaux
            btnTous.addEventListener('click', () => filtrerTravaux('Tous'))
            // Ajoute le filtre "Tous" à la liste des filtres
            filtres.appendChild(btnTous)
        // Ajoute les autres bouttons de filtres après le filtre "Tous"
            // Utilisation d'un Set pour les catégories uniques
            let categorySet = new Set()
            // Boucle sur chaque catégorie de la galerie
            let i = 0
            while (i < data.length) {
                const category = data[i] // On récupère chaque catégorie
                    if (!categorySet.has(category.name)) { //on vérifie que la catégorie n'ait pas déjà été ajoutée
                        categorySet.add(category.name)     // on ajoute la catégorie à la liste des filtres si elle n'existe pas
                        const btnCategorie = document.createElement('button') // Nouvelle catégorie unique = nouveau bouton crée
                        btnCategorie.className = 'filtresItem'
                        btnCategorie.textContent = category.name
                        // Ajoute un écouteur d'evenement, au clic on affiche les travaux filtrés par catégorie via la fonction filtrerTravaux
                        btnCategorie.addEventListener('click', () => filtrerTravaux(category.name))
                        // Ajoute le filtre (boutton) d'une catégorie donnée à la liste des filtres
                        filtres.appendChild(btnCategorie)
                    }
                i++
            }
    })
    //Gestion de sortie en cas d'erreur
    .catch(error => {
        alert("Erreur : " + error)
    })

//Récupération de tous les travaux via l'API
function filtrerTravaux(categoryName) {
    fetch("http://localhost:5678/api/works")
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur de communication ' + response.statusText)
            }
            return response.json()
        })
        .then(data => {
            const gallery = document.querySelector(".gallery")
             // Efface le contenu actuel de la galerie
            gallery.innerHTML = ''
            // On détermine quelle liste doit être utilisée, soit la liste complète 'Tous' soit une liste filtrée d'une catégorie spécifiée
            const Travaux = (categoryName === 'Tous') ? data : data.filter(work => work.category.name === categoryName)
            // Boucle sur chaque travail filtré pour l'afficher dans la galerie
                let i = 0
                while (i < Travaux.length) {
                    const work = Travaux[i]  // On récupère chaque travail
                    const figure = document.createElement('figure') // Crée un élément html "figure"
                    figure.className = '.gallery'
                    figure.innerHTML = `
                        <img src="${work.imageUrl}" alt="${work.title}">
                        <figcaption>${work.title}</figcaption>
                        `
                    gallery.appendChild(figure)  //Ajoute chaque élément figure à la gallerie
                    i++
                }
            })

        .catch(error => {
            alert("Erreur : " + error)
        })
}

// Affiche par défault l'ensemble des travaux
filtrerTravaux('Tous')