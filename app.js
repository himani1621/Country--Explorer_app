// Wait for the DOM to fully load before executing the code
document.addEventListener("DOMContentLoaded", function() {
    // Select the element to display country details
    const countryDetails = document.getElementById("country-details");
    
    // Retrieve the selected country from localStorage
    const country = JSON.parse(localStorage.getItem("selectedCountry"));
    
    // Retrieve the list of favorite countries from localStorage or initialize as empty
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // Check if a country was selected
    if (country) {
        // Display country details dynamically in the main section
        countryDetails.innerHTML = `
            <h2>${country.name.common}</h2>
            <img src="${country.flags.png}" alt="${country.name.common} Flag">
            <p><strong>Capital:</strong> ${country.capital}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <p><strong>Population:</strong> ${country.population}</p>
            <p><strong>Area:</strong> ${country.area} km²</p>
            <p><strong>Languages:</strong> ${Object.values(country.languages).join(", ")}</p>
            <button id="favorite-btn" class="${favorites.find(c => c.name.common === country.name.common) ? 'remove-favorite' : 'add-favorite'}">
                ${favorites.find(c => c.name.common === country.name.common) ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
        `;

        // Select the favorite button
        const favoriteBtn = document.getElementById("favorite-btn");
        
        // Add event listener to handle adding/removing favorites
        favoriteBtn.addEventListener("click", () => {
            const index = favorites.findIndex(c => c.name.common === country.name.common);
            if (index > -1) {
                // If country is already a favorite, remove it
                favorites.splice(index, 1); 
            } else {
                // If not a favorite and less than 5 favorites, add it
                if (favorites.length < 5) {
                    favorites.push(country); 
                } else {
                    // Alert if trying to add more than 5 favorites
                    alert("You can only have 5 favorites.");
                }
            }
            // Update the favorites in localStorage
            localStorage.setItem("favorites", JSON.stringify(favorites));

            // Update button text and styling based on the current state
            const isFavorite = favorites.find(c => c.name.common === country.name.common);
            favoriteBtn.innerText = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
            favoriteBtn.className = isFavorite ? 'remove-favorite' : 'add-favorite';
        });
    }
});

// Function to go back to the main page
window.goBack = function() {
    window.location.href = 'index.html';
};
