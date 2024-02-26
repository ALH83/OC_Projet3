//Récupération des catégories via l'API
fetch("http://localhost:5678/api/categories")
    .then(response => {
        // Vérifie si la requête a réussi
        if (!response.ok) {
            throw new Error('Erreur de communication ' + response.statusText);
        }
        return response.json()
    })
    .then(data => {
        const filtres = document.getElementById("filtres-menu")
        // Efface les filtres existants
        filtres.innerHTML = ''  
        
        // Crée une nouvelle liste pour les filtres
        const ul = document.createElement('ul')
        ul.className = 'filtres-liste'

        // Ajoute un élément de filtre 'Tous' avant les autres catégories
        const filtreTous = document.createElement('li')
        filtreTous.className = 'filtres-item'
        filtreTous.textContent = 'Tous'
        ul.appendChild(filtreTous)

        // Boucle sur chaque catégorie de la galerie
        let i = 0
        while (i < data.length) {
            const category = data[i] // Crée un élément "catégory" pour chaque travail
            const li = document.createElement('li') // Crée un nouvel élément de liste pour chaque travail
            li.className = 'filtres-item'
            li.textContent = category.name
            //Ajoute de chaque élément de liste à la liste
            ul.appendChild(li)
            i++
        }
        //Ajoute de la liste à la balise filtre
        filtres.appendChild(ul)
    })
        //Gestion de sortie en cas d'erreur
    .catch(error => {
        alert("Erreur : " + error);
    });

//Récupération des travaux via l'API
fetch("http://localhost:5678/api/works")
    .then(response => {
        // Vérifie si la requête a réussi
        if (!response.ok) {
            throw new Error('Erreur de communication ' + response.statusText);
        }
        return response.json()
    })
    // Traite les données reçues
    .then(data => {
        const gallery = document.querySelector(".gallery")
        // Efface le contenu actuel de la galerie
        gallery.innerHTML = ''
        // Boucle sur chaque travail de la galerie
        let i = 0
        while (i < data.length) {
            const work = data[i]
            // Crée un élément "figure" pour chaque travail
            const figure = document.createElement('figure')
            figure.className = '.gallery'
            figure.innerHTML = `
                <img src="${work.imageUrl}" alt="${work.title}">
                <figcaption>${work.title}</figcaption>
                `
             //Ajoute chaque travail à la gallerie
            gallery.appendChild(figure)
            i++
        }
    })
    //Gestion de sortie en cas d'erreur
    .catch(error => {
    alert("Erreur : " + error);
    });