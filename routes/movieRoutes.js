const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { check, validationResult } = require("express-validator");

// Middleware to validate query parameters
const validateQueryParams = [
  check("page").optional().isInt().toInt(),
  check("perPage").optional().isInt().toInt(),
  check("title").optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

router.use("/api/movies/", (req, res, next) => {
  next();
});

// /api/movies
router
  .route("/")
  .get(validateQueryParams,async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 10;
      const title = req.query.title || null;

      const movies = await db.getAllMovies(page, perPage, title);
      res.status(200).json(movies);
    } catch (err) {
      console.error("Error fetching movies:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  })
  .post(async (req, res) => {
    try {
      const newMovie = await db.addNewMovie(req.body);
      res.status(201).json(newMovie);
    } catch (err) {
      console.error("Error adding new movie:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


// /api/movies
router
  .route("/search")
  .get((req, res) => {
    try {
      res.status(200).render("findMoviesForm");
    } catch (err) {
      console.error("Error fetching movies:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  })
  .post(validateQueryParams, async (req, res) => {
    try {
      console.log(req.body);
      const page = parseInt(req.body.page) || 1;
      const perPage = parseInt(req.body.perPage) || 10;
      const title = req.body.title || null;

      const movies = await db.getAllMovies(page, perPage, title);
      console.log(movies);
      res.status(200).render("Working in Progress!!");
    } catch (err) {
      console.error("Error fetching movies:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


// /api/movies/:id
router
  .route("/:id")
  .get(async (req, res) => {
    try {
      const movie = await db.getMovieById(req.params.id);
      if (movie) {
        res.status(200).json(movie);
      } else {
        res.status(404).json({ error: "Movie not found" });
      }
    } catch (err) {
      console.error("Error fetching movie by ID:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  })
  .put(async (req, res) => {
    try {
      const updatedMovie = await db.updateMovieById(req.body, req.params.id);
      if (updatedMovie) {
        res.status(200).json(updatedMovie);
      } else {
        res.status(404).json({ error: "Movie not found" });
      }
    } catch (err) {
      console.error("Error updating movie by ID:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  })
  .delete(async (req, res) => {
    try {
      const deletedMovie = await db.deleteMovieById(req.params.id);
      if (deletedMovie) {
        res.status(200).json({ message: "Movie deleted successfully" });
      } else {
        res.status(404).json({ error: "Movie not found" });
      }
    } catch (err) {
      console.error("Error deleting movie by ID:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

module.exports = router;