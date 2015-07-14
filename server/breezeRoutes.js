(function (exports) {
    'use strict';

    var breezeMongoDb = require('breeze-mongodb');
    var mongoDbService = require('./services/mongoDbService');

    exports.init = init;

    function init(app, mongoDbConnString){
        var breezeServiceName = '/breeze/SiqCloset';
        mongoDbService.getDb(mongoDbConnString).then(initRoutes);

        function initRoutes(db){
            app.get(breezeServiceName + '/:resourceName', function(req, res, next){
                var query = new breezeMongoDb.MongoQuery(req.query);

                //mongodb already stores the collection name in lower case
                //probably because I was using mongoose before breeze
                var collectionName = req.params.resourceName.toLowerCase();
                query.execute(db, collectionName, processResults(res, next))
            });

            app.post(breezeServiceName + '/SaveChanges', function(req, res, next){
                var saveHandler = new breezeMongoDb.MongoSaveHandler(db, req.body, processResults(res, next));
                saveHandler.save();
            });
        }

        // Return the query callback function
        // res is the HTTP response object
        // next is the Express HTTP pipeline callback
        function processResults(res, next) {
            // return a function to process the results of the query
            // here we simply compose a response with the query results as content
            return function(err, results) {
                if (err) {
                    next(err);
                } else {
                    res.setHeader("Content-Type:", "application/json");
                    res.send(results);
                }
            }
        }
    }

})(module.exports);