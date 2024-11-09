// Wait for the DOM to fully load before executing the code
document.addEventListener("DOMContentLoaded", function() {
    // Select the unordered list to display favorite countries
    const favoritesList = document.getElementById("favorites-list");
    
    // Retrieve the list of favorite countries from localStorage or initialize as empty
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    // Function to display favorite countries in the list
    function displayFavorites() {
        favoritesList.innerHTML = ''; 
        if (favorites.length > 0) { 
            favorites.forEach(country => {
                // Create a list item for each favorite country
                const listItem = document.createElement('li');
                listItem.className = 'favorite-item'; 
                listItem.innerHTML = `
                    <span onclick="viewCountryDetails('${country.name.common}')">${country.name.common}</span>
                    <button onclick="removeFromFavorites('${country.name.common}')">Delete</button>
                `; // Display country name and delete button
                favoritesList.appendChild(listItem); 
            });
        } else {
            // Display a message if there are no favorites
            favoritesList.innerHTML = '<p style="color:white;">No items in Your Favourite.</p>';
        }
    }

    // Call the function to display favorites on page load
    displayFavorites();

    // Function to remove a country from favorites
    window.removeFromFavorites = function(countryName) {
        const index = favorites.findIndex(fav => fav.name.common === countryName); 
        if (index !== -1) { 
            favorites.splice(index, 1); 
            localStorage.setItem("favorites", JSON.stringify(favorites)); 
            displayFavorites(); 
        }
    };

    // Function to navigate back to the countries page
    window.goBack = function() {
        window.location.href = 'index.html'; 
    };

    // Function to view details of the selected country
    window.viewCountryDetails = function(countryName) {
        const countryDetails = favorites.find(fav => fav.name.common === countryName); 
        localStorage.setItem("selectedCountry", JSON.stringify(countryDetails)); 
        window.location.href = 'app.html'; 
    };
});
