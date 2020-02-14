var db = require("../models");
var axios = require("axios");

module.exports = function (app) {
    // Route for saving/updating an Article's associated Note
    app.post("/articles/:id", function (req, res) {
        db.Note.create(req.body).then(function (dbNote) {
            db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true }).then(function (dbArticle) {
                res.json(dbArticle);
            }).catch(function (err) {
                res.json(err);
            });
        });
    });
}