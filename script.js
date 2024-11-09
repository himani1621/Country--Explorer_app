document.addEventListener("DOMContentLoaded", function () {
    // DOM elements for various components in the app
    const countriesContainer = document.getElementById("countries");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-btn");
    const loadMoreButton = document.getElementById("load-more");
    const loadLessButton = document.getElementById("load-less");
    const regionFilter = document.getElementById("region-filter");
    const languageFilter = document.getElementById("language-filter");
    const suggestionsDropdown = document.getElementById("suggestions-dropdown");
    const messageContainer = document.getElementById("message-container");

    // API endpoint to fetch country data
    const API_URL = 'https://restcountries.com/v3.1/all';
    let allCountries = []; // Stores all fetched country data
    let displayedCountries = []; // Stores currently displayed countries
    let currentPage = 1; // Tracks the current page for pagination
    let pageSize = 12; // Number of countries displayed per page
    const favorites = JSON.parse(localStorage.getItem("favorites")) || []; // Load favorites from localStorage

    // Fetches country data from API and initializes the app
    async function fetchCountries() {
        try {
            const response = await fetch(API_URL);
            allCountries = await response.json();
            allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common)); // Sort countries alphabetically
            populateFilters(allCountries); // Populate dropdown filters with region and language options
            loadPage(1); // Load the first page of results
        } catch (error) {
            console.error('Error fetching countries:', error);
        }
    }

    // Populates region and language filters with unique values from fetched countries
    function populateFilters(countries) {
        const regions = [...new Set(countries.map(country => country.region).filter(Boolean))];
        const languages = [...new Set(countries.flatMap(country => Object.values(country.languages || {})))];

        // Populate region dropdown
        regions.forEach(region => {
            const option = document.createElement("option");
            option.value = region;
            option.textContent = region;
            regionFilter.appendChild(option);
        });

        // Populate language dropdown
        languages.forEach(language => {
            const option = document.createElement("option");
            option.value = language;
            option.textContent = language;
            languageFilter.appendChild(option);
        });
    }

    // Displays a set of country cards based on the filtered list
    function displayCountries(countries) {
        countriesContainer.innerHTML = ''; // Clear previous display
        countries.forEach(country => {
            const card = document.createElement('div');
            card.className = 'country-card';
            card.innerHTML = `
                <img src="${country.flags.png}" alt="${country.name.common} Flag">
                <h3>${country.name.common}</h3>
                <div class="heart-icon ${favorites.some(fav => fav.name.common === country.name.common) ? 'favorite' : ''}">♡</div>
            `;

            // Favorite/unfavorite functionality on heart icon click
            card.querySelector('.heart-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorites(country, e.target);
            });

            // Show country details on card click
            card.addEventListener('click', () => showCountryDetails(country));
            countriesContainer.appendChild(card);
        });
    }

    // Loads a page of country results based on current pagination settings
    function loadPage(page) {
        const start = (page - 1) * pageSize;
        const end = page * pageSize;
        const newCountries = allCountries.slice(0, end); // Slice for current page

        displayedCountries = newCountries;
        displayCountries(displayedCountries); // Display countries on the page
        currentPage = page;
        toggleLoadMoreButton();
        toggleLoadLessButton();
    }

    // Shows or hides the "Load More" button based on the number of countries left to show
    function toggleLoadMoreButton() {
        loadMoreButton.style.display = currentPage * pageSize < allCountries.length ? 'block' : 'none';
    }

    // Shows or hides the "Load Less" button based on the number of displayed countries
    function toggleLoadLessButton() {
        loadLessButton.style.display = displayedCountries.length > pageSize ? 'block' : 'none';
    }

    // Adds or removes a country from the favorites list and updates localStorage
    function toggleFavorites(country, heartIcon) {
        const isFavorite = favorites.some(fav => fav.name.common === country.name.common);

        if (isFavorite) {
            favorites.splice(favorites.findIndex(fav => fav.name.common === country.name.common), 1);
            heartIcon.classList.remove('favorite');
        } else {
            favorites.push(country);
            heartIcon.classList.add('favorite');
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    // Redirects to a details page for the selected country
    function showCountryDetails(country) {
        localStorage.setItem("selectedCountry", JSON.stringify(country));
        window.location.href = 'app.html';
    }

    // Filters the country list based on search, region, and language inputs
    function filterCountries() {
        const query = searchInput.value.toLowerCase();
        const region = regionFilter.value;
        const language = languageFilter.value;

        let filteredCountries = allCountries;

        // Filter by search query
        if (query) {
            filteredCountries = filteredCountries.filter(country =>
                country.name.common.toLowerCase().includes(query)
            );
            updateSuggestions(filteredCountries);
        } else {
            suggestionsDropdown.innerHTML = '';
            suggestionsDropdown.style.display = 'none';
        }

        // Filter by region
        if (region) {
            filteredCountries = filteredCountries.filter(country => country.region === region);
        }

        // Filter by language
        if (language) {
            filteredCountries = filteredCountries.filter(country =>
                country.languages && Object.values(country.languages).includes(language)
            );
        }

        // Sort filtered countries alphabetically
        filteredCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));

        // Display message if no countries match the filter criteria
        if (filteredCountries.length === 0) {
            messageContainer.textContent = "No countries found matching your criteria.";
        } else {
            messageContainer.textContent = "";
        }

        displayedCountries = filteredCountries.slice(0, pageSize);
        currentPage = 1;
        displayCountries(displayedCountries);
        toggleLoadMoreButton();
        toggleLoadLessButton();
    }

    // Updates the suggestions dropdown based on search input
    function updateSuggestions(filteredCountries) {
        suggestionsDropdown.innerHTML = '';
        if (filteredCountries.length > 0) {
            const suggestions = filteredCountries.slice(0, 5);
            suggestions.forEach(country => {
                const item = document.createElement('div');
                item.className = 'dropdown-item';
                item.textContent = country.name.common;
                item.addEventListener('click', () => {
                    searchInput.value = country.name.common;
                    suggestionsDropdown.innerHTML = '';
                    suggestionsDropdown.style.display = 'none';
                    filterCountries();
                });
                suggestionsDropdown.appendChild(item);
            });

            const viewAll = document.createElement('div');
            viewAll.className = 'dropdown-item';
            viewAll.textContent = 'View All';
            viewAll.addEventListener('click', () => {
                displayCountries(filteredCountries);
                suggestionsDropdown.innerHTML = '';
                suggestionsDropdown.style.display = 'none';
            });
            suggestionsDropdown.appendChild(viewAll);

            suggestionsDropdown.style.display = 'block';
        } else {
            suggestionsDropdown.style.display = 'none';
        }
    }

    // Hides suggestions dropdown when clicking outside of it
    document.addEventListener('click', (event) => {
        if (!suggestionsDropdown.contains(event.target) && event.target !== searchInput) {
            suggestionsDropdown.innerHTML = '';
            suggestionsDropdown.style.display = 'none';
        }
    });

    // Event listeners for filtering and pagination
    searchInput.addEventListener("input", filterCountries);
    searchButton.addEventListener("click", filterCountries);
    regionFilter.addEventListener("change", filterCountries);
    languageFilter.addEventListener("change", filterCountries);
    loadMoreButton.addEventListener("click", () => loadPage(currentPage + 1));
    loadLessButton.addEventListener("click", () => {
        if (displayedCountries.length > pageSize) {
            displayedCountries = displayedCountries.slice(0, displayedCountries.length - pageSize);
        } else {
            displayedCountries = displayedCountries.slice(0, pageSize);
        }

        currentPage = Math.ceil(displayedCountries.length / pageSize);
        displayCountries(displayedCountries);
        toggleLoadMoreButton();
        toggleLoadLessButton();
    });

    // Initialize by fetching countries
    fetchCountries();
});
