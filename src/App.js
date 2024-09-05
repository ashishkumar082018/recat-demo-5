import React, { useState, useEffect, useCallback } from "react";
import MoviesList from "./components/MoviesList";
import "./App.css";

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [retryTimer, setRetryTimer] = useState(null);
  const [newMovie, setNewMovie] = useState({
    id: null,
    title: "",
    openingText: "",
    releaseDate: "",
  });

  const fetchMoviesHandler = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://swapi.dev/api/films/");
      if (!response.ok) {
        throw new Error("Something went wrong ...Retrying");
      }
      const data = await response.json();
      const transformedMovies = data.results.map((movieData) => {
        return {
          id: movieData.episode_id,
          title: movieData.title,
          openingText: movieData.opening_crawl,
          releaseDate: movieData.release_date,
        };
      });
      setMovies(transformedMovies);
      setRetrying(false); // Stop retrying if successful
    } catch (error) {
      setError(error.message || "Something went wrong ...Retrying");
      console.log(error);
      setRetrying(true); // Continue retrying if there was an error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMoviesHandler();
  }, [fetchMoviesHandler]);

  useEffect(() => {
    if (retrying) {
      const timerId = setInterval(() => {
        fetchMoviesHandler();
      }, 5000); // Retry every 5 seconds
      setRetryTimer(timerId);
      // Cleanup function to clear interval
      return () => {
        clearInterval(timerId);
      };
    } else {
      // Cleanup function to clear interval when retrying is stopped
      clearInterval(retryTimer);
    }
  }, [retrying]);

  const cancelRetrying = () => {
    setRetrying(false);
    setError("Retrying canceled by user");
  };

  let content = <p>Found no movies</p>;

  if (error) {
    content = (
      <div>
        <p>{error}</p>
        {retrying && <button onClick={cancelRetrying}>Cancel Retrying</button>}
      </div>
    );
  } else if (isLoading) {
    content = <p>Loading...</p>;
  } else if (movies.length > 0) {
    content = <MoviesList movies={movies} />;
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewMovie((prev) => ({ ...prev, id: Math.random().toString() }));
    setNewMovie((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddMovie = () => {
    console.log(newMovie);
    setNewMovie({ title: "", openingText: "", releaseDate: "" });
    setMovies((prev) => [...prev, newMovie]);
  };

  return (
    <React.Fragment>
      <section>
        <h2>Add New Movie</h2>
        <form>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newMovie.title}
              onChange={handleFormChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="openingText">Opening Text</label>
            <textarea
              id="openingText"
              name="openingText"
              value={newMovie.openingText}
              onChange={handleFormChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="releaseDate">Release Date</label>
            <input
              type="date"
              id="releaseDate"
              name="releaseDate"
              value={newMovie.releaseDate}
              onChange={handleFormChange}
            />
          </div>
          <button type="button" onClick={handleAddMovie}>
            Add Movie
          </button>
        </form>
      </section>
      <section>
        <button onClick={fetchMoviesHandler} disabled={retrying}>
          {retrying ? "Retrying..." : "Fetch Movies"}
        </button>
      </section>
      <section>{content}</section>
    </React.Fragment>
  );
}

export default App;
