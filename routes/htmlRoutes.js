var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function (app) {
    // Load index page
    app.get("/", function (req, res) {
        // db.Example.findAll({}).then(function (dbExamples) {
        res.render("index");
        // });
    });

    // A GET route for scraping the echoJS website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with axios
        axios.get("http://www.echojs.com/").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            $("article h2").each(function (i, element) {
                // Save an empty result object
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this)
                    .children("a")
                    .text();
                result.link = $(this)
                    .children("a")
                    .attr("href");

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        // If an error occurred, log it
                        console.log(err);
                    });
            });

            // Send a message to the client
            res.send("Scrape Complete");
        });
    });

    // Route for getting all Articles from the db
    app.get("/articles", function (req, res) {
        db.Article.find({})
            .then(function (dbArticle) {
                // If all Users are successfully found, send them back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurs, send the error back to the client
                res.json(err);
            });
    });

    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", function (req, res) {
        db.Article.findONe({ _id: req.params.id })
            // Specify that we want to populate the retrieved libraries with any associated books
            .populate("note")
            .then(function (dbArticle) {
                // If any Libraries are found, send them to the client with any associated Books
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurs, send it back to the client
                res.json(err);
            });

    });

    // Render 404 page for any unmatched routes
    app.get("*", function (req, res) {
        res.render("404");
    });
}