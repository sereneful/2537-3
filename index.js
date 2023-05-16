// Global variables.
const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []
let numPages = 1;
let filteredPokemons = [];

// Function that updates pagination.
const updatePaginationDiv = (currentPage, numPages) => {
    $('#pagination').empty();
  
    let startPage, endPage;

    if (currentPage <= 5) {
      startPage = Math.max(1, currentPage - 2);
      endPage = Math.min(startPage + 4, numPages);
    } else if (currentPage === numPages) {
      startPage = Math.max(1, numPages - 4);
      endPage = numPages;
    } else if (currentPage === numPages - 1) {
      startPage = Math.max(1, numPages - 5);
      endPage = numPages;
    } else {
      startPage = Math.max(1, currentPage - 2);
      endPage = Math.min(startPage + 4, numPages);
    }
  
  
    if (currentPage > 1) {
      $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage - 1}">
          Previous
        </button>
      `);
    }
  
    for (let i = startPage; i <= endPage; i++) {
      $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons ${i === currentPage ? 'active' : ''}" value="${i}">
          ${i}
        </button>
      `);
    }
  
    if (currentPage < numPages) {
      $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="${currentPage + 1}">
          Next
        </button>
      `);
    }
  };

  // Function that displays number of pokemon.
  const displayPokemonCount = () => {
    const filteredCount = filteredPokemons.length;
    const totalCount = filteredCount > 0 ? filteredCount : pokemons.length;
    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(start + PAGE_SIZE - 1, totalCount);
  
    let displayCount = totalCount;
  
    if (filteredPokemons.length > 0 && filteredCount !== totalCount) {
      displayCount = filteredCount;
    }
  
    $('#pokemonCount').text(`Displaying 10 Pokemon ${start}-${end} of ${displayCount} Pokémon cards.`);
  };
  
  //Function for pagination.
  const paginate = async (currentPage, PAGE_SIZE, selectedPokemons) => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
  
    const selected_pokemons = selectedPokemons.slice(start, end);
  
    $('#pokeCards').empty();
  
    const totalCards = selected_pokemons.length;
    const numRows = Math.ceil(totalCards / 5);
    const numCols = Math.ceil(totalCards / numRows);
  
    for (let i = 0; i < numRows; i++) {
      const row = $('<div class="row">');
  
      for (let j = 0; j < numCols; j++) {
        const cardIndex = i * numCols + j;
        if (cardIndex >= totalCards) break;
  
        const pokemon = selected_pokemons[cardIndex];
        const res = await axios.get(pokemon.url);
        const types = res.data.types.map((type) => type.type.name);
  
        const pokeCard = $(`
          <div class="col-${12 / numCols} pokeCard card" pokeName=${res.data.name}>
            <h3>${res.data.name.toUpperCase()}</h3> 
            <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
              More
            </button>
          </div>
        `);
  
        row.append(pokeCard);
      }
  
      $('#pokeCards').append(row);
    }
  
    const totalCount = selectedPokemons.length;
    $('#pokemonCount').text(`Displaying ${start + 1}-${Math.min(end, totalCount)} of ${totalCount} Pokémon cards.`);
  
    displayPokemonCount();
  };

  //Function to filter the pokemon.
  const filterPokemons = async (selectedTypes) => {
    if (selectedTypes.length === 0) {
      filteredPokemons = pokemons;
    } else {
      filteredPokemons = [];
      for (const pokemon of pokemons) {
        const res = await axios.get(pokemon.url);
        const types = res.data.types.map((type) => type.type.name);
        filteredPokemons.push({ ...pokemon, types, id: res.data.id });
      }
  
      filteredPokemons = filteredPokemons.filter((pokemon) =>
        selectedTypes.every((type) => pokemon.types.includes(type))
      );
    }
  
    filteredPokemons.sort((a, b) => a.id - b.id);
  
    const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);
    paginate(currentPage, PAGE_SIZE, filteredPokemons);
    displayPokemonCount();
  };

  // Setup function when page is loaded.
const setup = async () => {

  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  const totalCount = response.data.count;
  $('#totalPokemonCount').text(`Total Pokémon: ${totalCount}`);

  $('#typeFilter').on('change', function () {
    const selectedType = $(this).val();
    const selectedTypes = selectedType ? [selectedType] : [];
    filterPokemons(selectedTypes);
    displayPokemonCount();
  });

  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)

  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  const filterContainer = document.getElementById('filterContainer');
  filterContainer.innerHTML = generateCheckboxes(pokemonTypes);


  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const selectedTypes = Array.from(checkboxes)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
      filterPokemons(selectedTypes);
      displayPokemonCount();
    });
  });

  $('body').on('click', '.numberedButtons', async function (e) {
    currentPage = Number(e.target.value);
    const selectedType = $('#typeFilter').val();
    const selectedTypes = selectedType ? [selectedType] : [];
    await filterPokemons(selectedTypes);

    numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
  
    $('#pokeCards').empty();
  
    paginate(currentPage, PAGE_SIZE, filteredPokemons);
    updatePaginationDiv(currentPage, numPages);
    displayPokemonCount();
  });

}

// Function for displaying pokemon types as checkbox
const pokemonTypes = [
    { value: 'normal', label: 'Normal' },
    { value: 'fighting', label: 'Fighting' },
    { value: 'flying', label: 'Flying' },
    { value: 'poison', label: 'Poison' },
    { value: 'ground', label: 'Ground' },
    { value: 'rock', label: 'Rock' },
    { value: 'bug', label: 'Bug' },
    { value: 'ghost', label: 'Ghost' },
    { value: 'steel', label: 'Steel' },
    { value: 'fire', label: 'Fire' },
    { value: 'water', label: 'Water' },
    { value: 'grass', label: 'Grass' },
    { value: 'electric', label: 'Electric' },
    { value: 'psychic', label: 'Psychic' },
    { value: 'ice', label: 'Ice' },
    { value: 'dragon', label: 'Dragon' },
    { value: 'dark', label: 'Dark' },
    { value: 'fairy', label: 'Fairy' },
  ];
  
  const generateCheckbox = (type) => {
    return `
      <div class="checkbox-item">
        <input type="checkbox" id="filter${type.value}" name="filterType" value="${type.value}">
        <label for="filter${type.value}">${type.label}</label>
      </div>
    `;
  };

// Generates Checkboxes.
const generateCheckboxes = (types) => {
  const checkboxes = types.map((type) => generateCheckbox(type)).join('');
  return `<div class="checkbox-container">${checkboxes}</div>`;
};

// Sets up document when loaded.
$(document).ready(setup)