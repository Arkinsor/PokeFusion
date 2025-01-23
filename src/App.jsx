import { useState, useEffect } from 'react';
import './App.css';
const LoadingScreen = ( {loadingImage, loadingName }) => (
  <div className="loading-screen">
     <h1>Pokémon Fusion!</h1>
    <h2>Getting A Fresh Pokemon Right Away!!</h2>
    {loadingImage ? (
      <img
        src={loadingImage}
        alt="Random Pokémon"
        style={{ width: '250px', height: '250px' }}
      />
    ) : (
      <p>Loading Pokémon image...</p>
    )}
    {loadingName ? (
      <p className="loadname" >{loadingName}</p>
    ) : (
      <p>Loading Pokémon Name...</p>
    )}
  </div>
);
const App = () => {
  const [pokemonNames, setPokemonNames] = useState(['', '']);
  const [pokemonData, setPokemonData] = useState([]);
  const [hybridPokemon, setHybridPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingImage, setLoadingImage] = useState(null);
  const [loadingName, setLoadingName] = useState('');

  useEffect(() => {
    fetchRandomPokemonImage(); // Fetch a random Pokémon image on load
  }, []);
  const fetchRandomPokemonImage = async () => {
    try {
      const totalPokemon = 1010; // Total Pokémon in PokeAPI
      const randomId = Math.floor(Math.random() * totalPokemon) + 1;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch random Pokémon image');
      }
      const data = await response.json();
      setLoadingImage(data.sprites.front_default);
      setLoadingName(data.name);
    } catch (error) {
      console.error('Error fetching random Pokémon image:', error);
    }
  };

  const fetchPokemonData = async (name) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      if (!response.ok) {
        throw new Error(`Pokémon ${name} not found!`);
      }
      const data = await response.json();
      return {
        name: data.name,
        sprite: data.sprites.front_default,
        typeList: data.types.map((typeInfo) => typeInfo.type.name).join(', '),
      };
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const handlePokemonSearch = async () => {
    if (!pokemonNames[0] || !pokemonNames[1]) {
      alert('Please enter both Pokémon names!');
      return;
    }

    setLoading(true);
    setError(null);
    setHybridPokemon(null);
    setPokemonData([]);
    await fetchRandomPokemonImage(); // Fetch a new random Pokémon image for loading

    try {
      const data = [];
      for (let i = 0; i < 2; i++) {
        const pokemon = await fetchPokemonData(pokemonNames[i]);
        if (pokemon) {
          data.push(pokemon);
        } else {
          setLoading(false);
          return;
        }
      }

      setPokemonData(data);

      const textPrompt = `Create a new Pokémon hybrid that is a mixture of ${pokemonNames[0]} and ${pokemonNames[1]}. It should have ${data[0].typeList} and ${data[1].typeList} types. Provide only the following details, no extra commentary, and do not include any closing statements or questions:
Name:
Type:
Signature Move:
Habitat:
Weakness:
Return the response in a point-by-point format only.`;

      const imagePrompt = `(Should RESEMBLE ANIMALS AND POKEMON CREATURES)Generate a new pokemon imagining what would happen with two different Species Pokemons mated  simple Pokémon creature with normal number of arms and legs ( Pokemon anatomy to be used as refrence ) that combines the features of ${pokemonNames[0]} and ${pokemonNames[1]}. Use elements from their appearances: 
- For ${pokemonNames[0]}, focus on its ${data[0].typeList} features, like color, shape, and texture.
- For ${pokemonNames[1]}, include elements of its ${data[1].typeList} features, emphasizing its signature traits.
The Pokemon should look like a classic anime Pokemon animal yet recognizable as a blend of both. Render just one Pokémon character in a simple pose, with a high level of detail in the background that matches its habitat. The blending of the features must use these rules
1. pokemons having wings would give either  wings or color types to the hybrid
2. pokemons having fins and would give either just color and types or find and water type powers to the hybrid`;

      // Make API calls for text and image generation
      const [textResponse, imageResponse] = await Promise.all([
        fetch('http://localhost:5000/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: textPrompt }),
        }),
        fetch('http://localhost:5000/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: imagePrompt }),
        }),
      ]);

      if (!textResponse.ok || !imageResponse.ok) {
        throw new Error('Failed to generate Pokémon hybrid');
      }

      const textResult = await textResponse.json();
      const imageResult = await imageResponse.json();

      setHybridPokemon({
        ...textResult,
        image: imageResult.image, // Assuming imageResult contains an `image` URL
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomPokemon = async () => {
    try {
      const totalPokemon = 1010;
      const id1 = Math.floor(Math.random() * totalPokemon) + 1;
      let id2 = Math.floor(Math.random() * totalPokemon) + 1;

      while (id1 === id2) {
        id2 = Math.floor(Math.random() * totalPokemon) + 1;
      }

      const randomPokemonNames = await Promise.all(
        [id1, id2].map(async (id) => {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          const data = await response.json();
          return data.name;
        })
      );

      setPokemonNames(randomPokemonNames);
    } catch (error) {
      console.error('Error fetching random Pokémon names:', error.message);
    }
  };

  if (loading) {
    return <LoadingScreen loadingImage={loadingImage} loadingName={loadingName}/>;

  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokémon Fusion!</h1>
      </header>

      <main>
        <div className="pokemon-inputs">
          <div>
            <input
              type="text"
              placeholder="eg. Pikachu"
              value={pokemonNames[0]}
              onChange={(e) => setPokemonNames([e.target.value, pokemonNames[1]])}
            />
            <input
              type="text"
              placeholder="eg. Bulbasaur"
              value={pokemonNames[1]}
              onChange={(e) => setPokemonNames([pokemonNames[0], e.target.value])}
            />
          </div>
          <div>
            <button onClick={handlePokemonSearch} disabled={loading}>
              Generate Hybrid
            </button>
            <button onClick={handleRandomPokemon} disabled={loading}>
              Choose at Random
            </button>
          </div>
        </div>

        {error && <p className="error">Error: {error}</p>}

        {pokemonData.length === 2 && (
          <div className="pokemon-display">
            {pokemonData.map((pokemon, index) => (
              <div key={index} className="pokemon-card">
                <h2>{pokemon.name}</h2>
                <img src={pokemon.sprite} alt={pokemon.name} />
                <p>Type: {pokemon.typeList}</p>
              </div>
            ))}
          </div>
        )}

        {hybridPokemon && (
          <div className="hybrid-display">
            <h2>Hybrid Pokémon</h2>
            {hybridPokemon.image && (
              <img
                src={hybridPokemon.image}
                alt="Hybrid Pokémon"
                style={{ width: '200px', height: '200px' }}
              />
            )}
            <div className="pokemon-info">
              <h3>Details:</h3>
              {hybridPokemon.description &&
                hybridPokemon.description.split('\n').map((point, index) => (
                  <p key={index}>{point}</p>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
