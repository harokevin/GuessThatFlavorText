import { useState, useEffect } from 'react'
import './App.css'

interface PokemonCard {
  attacks_abilities: Array<{
    name: string;
    type: string;
  }>;
  card_name: string;
  flavor_text: string;
  image_urls: {
    large: string;
    small: string;
  };
  set_name: string;
  stage: string;
  type: string;
}

interface GameState {
  score: number;
  currentCard: PokemonCard | null;
  guess: string;
  usedLifelines: {
    set: boolean;
    stage: boolean;
    attack: boolean;
  };
  gameStatus: 'playing' | 'correct' | 'wrong';
  showCard: boolean;
}

function App() {
  const [gameState, setGameState] = useState<GameState>({
    score: 4,
    currentCard: null,
    guess: '',
    usedLifelines: { set: false, stage: false, attack: false },
    gameStatus: 'playing',
    showCard: false
  });

  const [loading, setLoading] = useState(false);

  const fetchNewCard = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://9jjjfskz4g.execute-api.us-west-2.amazonaws.com/dev/');
      const card: PokemonCard = await response.json();
      setGameState(prev => ({
        ...prev,
        currentCard: card,
        guess: '',
        usedLifelines: { set: false, stage: false, attack: false },
        gameStatus: 'playing',
        showCard: false
      }));
    } catch (error) {
      console.error('Failed to fetch card:', error);
    } finally {
      setLoading(false);
    }
  };

  const activateLifeline = (type: 'set' | 'stage' | 'attack') => {
    if (gameState.usedLifelines[type] || gameState.score <= 0) return;

    setGameState(prev => ({
      ...prev,
      score: prev.score - 1,
      usedLifelines: { ...prev.usedLifelines, [type]: true }
    }));
  };

  const submitGuess = () => {
    if (!gameState.currentCard || !gameState.guess.trim()) return;

    const isCorrect = gameState.guess.toLowerCase().trim() === gameState.currentCard.card_name.toLowerCase();

    if (isCorrect) {
      const lifelinesUsed = Object.values(gameState.usedLifelines).filter(Boolean).length;
      const pointsEarned = 4 - lifelinesUsed;

      setGameState(prev => ({
        ...prev,
        score: prev.score + pointsEarned,
        gameStatus: 'correct',
        showCard: true
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'wrong',
        showCard: true
      }));
    }
  };

  const nextRound = () => {
    setGameState(prev => ({
      ...prev,
      score: 4
    }));
    fetchNewCard();
  };

  useEffect(() => {
    fetchNewCard();
  }, []);

  const getRandomAttack = () => {
    if (!gameState.currentCard?.attacks_abilities?.length) return "No attacks available";
    const attacks = gameState.currentCard.attacks_abilities.filter(a => a.name !== "No attacks or abilities");
    return attacks.length > 0 ? attacks[0].name : "No attacks available";
  };

  return (
    <div className="app">
      <header className="game-header">
        <h1 className="game-title">Guess That Flavor Text</h1>
        <div className="score-display">Score: {gameState.score}</div>
      </header>

      <main className="game-main">
        {loading ? (
          <div className="loading">
            <div className="pokeball-spinner"></div>
            <p>Loading new card...</p>
          </div>
        ) : gameState.currentCard ? (
          <div className="game-content">
            <div className="flavor-text-section">
              <h2>Flavor Text:</h2>
              <div className="flavor-text">
                "{gameState.currentCard.flavor_text}"
              </div>
            </div>

            <div className="lifelines-section">
              <h3>Lifelines (1 point each):</h3>
              <div className="lifelines">
                {gameState.gameStatus === 'playing' ? (
                  <>
                    <button
                      className={`lifeline ${gameState.usedLifelines.set ? 'used' : ''}`}
                      onClick={() => activateLifeline('set')}
                      disabled={gameState.usedLifelines.set || gameState.score <= 0}
                    >
                      {gameState.usedLifelines.set ? `Set: ${gameState.currentCard.set_name}` : 'Reveal Set'}
                    </button>
                    <button
                      className={`lifeline ${gameState.usedLifelines.stage ? 'used' : ''}`}
                      onClick={() => activateLifeline('stage')}
                      disabled={gameState.usedLifelines.stage || gameState.score <= 0}
                    >
                      {gameState.usedLifelines.stage ? `Stage: ${gameState.currentCard.stage}` : 'Reveal Stage'}
                    </button>
                    <button
                      className={`lifeline ${gameState.usedLifelines.attack ? 'used' : ''}`}
                      onClick={() => activateLifeline('attack')}
                      disabled={gameState.usedLifelines.attack || gameState.score <= 0}
                    >
                      {gameState.usedLifelines.attack ? `Attack: ${getRandomAttack()}` : 'Reveal Attack'}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="lifeline used" disabled={true}>
                      Set: {gameState.currentCard.set_name}
                    </button>
                    <button className="lifeline used" disabled={true}>
                      Stage: {gameState.currentCard.stage}
                    </button>
                    <button className="lifeline used" disabled={true}>
                      Attack: {getRandomAttack()}
                    </button>
                  </>
                )}
              </div>
            </div>

            {gameState.gameStatus === 'playing' && (
              <div className="guess-section">
                <input
                  type="text"
                  value={gameState.guess}
                  onChange={(e) => setGameState(prev => ({ ...prev, guess: e.target.value }))}
                  placeholder="Enter your guess..."
                  className="guess-input"
                  onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                />
                <button onClick={submitGuess} className="submit-btn">
                  Submit Guess
                </button>
              </div>
            )}

            {gameState.gameStatus !== 'playing' && (
              <div className="result-section">
                <div className={`result ${gameState.gameStatus}`}>
                  {gameState.gameStatus === 'correct' ? (
                    <>
                      <h3>🎉 Correct!</h3>
                      <p>The answer was: <strong>{gameState.currentCard.card_name}</strong></p>
                      <p>Points earned: {4 - Object.values(gameState.usedLifelines).filter(Boolean).length}</p>
                    </>
                  ) : (
                    <>
                      <h3>❌ Wrong!</h3>
                      <p>The correct answer was: <strong>{gameState.currentCard.card_name}</strong></p>
                    </>
                  )}
                </div>

                {gameState.showCard && (
                  <div className="card-reveal">
                    <img
                      src={gameState.currentCard.image_urls.large}
                      alt={gameState.currentCard.card_name}
                      className="card-image"
                    />
                  </div>
                )}

                <button onClick={nextRound} className="next-round-btn">
                  Next Round
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="error">Failed to load card. Please try again.</div>
        )}
      </main>
    </div>
  );
}

export default App
