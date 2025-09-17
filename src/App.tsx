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

type NavSection = 'game' | 'howToPlay' | 'about' | 'support';

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
  const [activeSection, setActiveSection] = useState<NavSection>('game');

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

  const renderHowToPlay = () => (
    <div className="section-content">
      <h2>How to Play</h2>
      <div className="instructions">
        <h3>Objective</h3>
        <p>Read the Pokemon card's flavor text and guess which Pokemon it belongs to!</p>

        <h3>Scoring</h3>
        <ul>
          <li>Start each round with 4 points</li>
          <li>Each lifeline used costs 1 point</li>
          <li>Correct answers earn you the remaining points</li>
        </ul>

        <h3>Lifelines</h3>
        <ul>
          <li><strong>Reveal Set:</strong> Shows which Pokemon TCG set the card is from</li>
          <li><strong>Reveal Stage:</strong> Shows the evolution stage (Basic, Stage 1, Stage 2, etc.)</li>
          <li><strong>Reveal Attack:</strong> Shows one of the Pokemon's attacks or abilities</li>
        </ul>

        <h3>Example</h3>
        <p>You see the flavor text: "It sleeps 18 hours a day. Even when awake, it doesn't move much. It's very lazy."</p>
        <p>If you're unsure, you could use the "Reveal Stage" lifeline to learn it's a "Basic" Pokemon, then guess "Snorlax"!</p>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="section-content">
      <h2>About</h2>
      <div className="about-content">
        <p>Pokemon Trading Card Game - Flavor Text Challenge is a fun game that tests your knowledge of Pokemon through their card descriptions.</p>

        <h3>What are Flavor Texts?</h3>
        <p>Flavor texts are the descriptive passages on Pokemon cards that provide background information about each Pokemon. They often describe the Pokemon's behavior, habitat, or unique characteristics.</p>

        <h3>Features</h3>
        <ul>
          <li>Random Pokemon cards from various TCG sets</li>
          <li>Strategic lifeline system for hints</li>
          <li>Point-based scoring system</li>
          <li>Full card reveals after each guess</li>
        </ul>

        <p>Perfect for Pokemon fans who want to test their knowledge beyond just the Pokemon's appearance!</p>

        <h3>Inspiration</h3>
        <p>This project was inspired by the <a href="https://www.youtube.com/@UncommonEnergyPodcast" target="_blank" rel="noopener noreferrer">Uncommon Energy Podcast</a> and their discussions about Pokemon TCG. This is a personal project and is not affiliated with or endorsed by the podcast.</p>

      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="section-content">
      <h2>Buy Me a Coffee</h2>
      <div className="support-content">
        <p>If you enjoy this game and would like to support its development, you can send a tip through:</p>

        <div className="support-links">
          <a
            href="https://paypal.me/harokevin0"
            target="_blank"
            rel="noopener noreferrer"
            className="support-link paypal"
          >
            PayPal
          </a>
          <a
            href="https://github.com/sponsors/harokevin"
            target="_blank"
            rel="noopener noreferrer"
            className="support-link github"
          >
            GitHub Sponsors
          </a>
        </div>

        <p>Your support helps keep this project running and motivates further development!</p>
        <p>Thank you for playing and for any support you provide! 🙏</p>
      </div>
    </div>
  );

  return (
    <div className="app">
      <nav className="side-nav">
        <div className="nav-header">
          <h3>Navigation</h3>
        </div>
        <ul className="nav-menu">
          <li>
            <button
              className={`nav-item ${activeSection === 'game' ? 'active' : ''}`}
              onClick={() => setActiveSection('game')}
            >
              Play Game
            </button>
          </li>
          <li>
            <button
              className={`nav-item ${activeSection === 'howToPlay' ? 'active' : ''}`}
              onClick={() => setActiveSection('howToPlay')}
            >
              How to Play
            </button>
          </li>
          <li>
            <button
              className={`nav-item ${activeSection === 'about' ? 'active' : ''}`}
              onClick={() => setActiveSection('about')}
            >
              About
            </button>
          </li>
          <li>
            <button
              className={`nav-item ${activeSection === 'support' ? 'active' : ''}`}
              onClick={() => setActiveSection('support')}
            >
              Buy Me a Coffee
            </button>
          </li>
          <li>
            <a
              href="https://github.com/harokevin/GuessThatFlavorText"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-item external-link"
            >
              GitHub Project
            </a>
          </li>
        </ul>
      </nav>

      <div className="main-content">
        <header className="game-header">
          <h1 className="game-title">Pokemon Trading Card Game - Flavor Text Challenge</h1>
          {activeSection === 'game' && <div className="score-display">Score: {gameState.score}</div>}
        </header>

        <main className="game-main">
          {activeSection === 'game' && (
            <>
              {loading ? (
          <div className="loading">
            <div className="pokeball-spinner"></div>
            <p>Loading new Pokemon card...</p>
          </div>
        ) : gameState.currentCard ? (
          <div className="game-content">
            <div className="flavor-text-section">
              <h2>Pokemon Card Flavor Text:</h2>
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
                  placeholder="Which Pokemon is this?"
                  className="guess-input"
                  onKeyPress={(e) => e.key === 'Enter' && submitGuess()}
                />
                <button onClick={submitGuess} className="submit-btn">
                  Guess Pokemon
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
                <div className="error">Failed to load Pokemon card. Please try again.</div>
              )}
            </>
          )}

          {activeSection === 'howToPlay' && renderHowToPlay()}
          {activeSection === 'about' && renderAbout()}
          {activeSection === 'support' && renderSupport()}
        </main>
      </div>
    </div>
  );
}

export default App
