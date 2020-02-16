var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function (app) {
    // Load index page
    app.get("/", function (req, res) {
        // db.Example.findAll({}).then(function (dbExamples) {
        // db.Article.find()
        db.Article.find({ saved: false })
            .sort({ date: -1 }).then(function (dbArticles) {
                res.render("second", { newsArticle: dbArticles });
            });
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
                result.summary = "Summary goes here";
                result.saved = false;
                result.date = new Date();

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
                // console.log(`render second page with dbArticle =  ${JSON.stringify(dbArticle)}`);

                var news = [];
                //{"_id":"5e4330a22aeae84b50e87e97","title":"FP: The good parts","link":"https://codingwithjs.rocks/blog/fp-the-good-parts","__v":0}
                console.log(`First Article: ${dbArticle[0].title}\n${dbArticle[0].link}`)
                var uData = { title: "Title 1", link: "http://somelink" };

                // if (r.length === 0) {
                //     uData = {
                //         name: dbArticle[0].name
                //     };
                // } else {
                //     for (var i = 0; i < r.length; i++) {
                //         console.log(`news name = ${JSON.stringify(dbArticle[0].SavedRestaurants[i].name)}`);
                //         news.push({ name: dbArticle[0].SavedRestaurants[i].name });
                //         console.log(`news[${i}] = ${news[i].name}`);
                //     }
                //     uData = {
                //         name: dbArticle[0].name,
                //         news: news
                //     };
                // }

                return res.render("second", { newsArticle: dbArticle });
            })
            .catch(function (err) {
                // If an error occurs, send the error back to the client
                res.json(err);
            });
    });

    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", function (req, res) {
        db.Article.findOne({ _id: req.params.id })
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