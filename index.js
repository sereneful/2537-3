const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []


const updatePaginationDiv = (currentPage, numPages) => {
    $('#pagination').empty();
  
    let startPage, endPage;
  
    if (currentPage <= 5) {
      startPage = 1;
      endPage = Math.min(startPage + 4, numPages);
    } else {
      startPage = currentPage - 2;
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
  
  

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
}


const setup = async () => {
  // test out poke api using axios here


  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;


  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
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

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
  })

  $('#typeFilter').on('change', function () {
    const selectedType = $(this).val();
    filterPokemons(selectedType);
  });

  const filterContainer = document.getElementById('filterContainer');
  filterContainer.innerHTML = generateCheckboxes(pokemonTypes);

  // Add event listener to checkboxes
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const selectedTypes = Array.from(checkboxes)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
      filterPokemons(selectedTypes);
    });
  });

}

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
      <div>
        <input type="checkbox" id="filter${type.value}" value="${type.value}">
        <label for="filter${type.value}">${type.label}</label>
      </div>
    `;
  };
  
  const generateCheckboxes = (types) => {
    const checkboxes = types.map((type) => generateCheckbox(type)).join('');
    return checkboxes;
  };

  const filterPokemons = (selectedTypes) => {
    const filteredPokemons = pokemons.filter((pokemon) => {
      // Check if the pokemon's type matches any of the selected types
      return pokemon.types.some((type) => selectedTypes.includes(type.type.name));
    });
  
    currentPage = 1;
    paginate(currentPage, PAGE_SIZE, filteredPokemons);
  
    const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);

    
  };
  


$(document).ready(setup)