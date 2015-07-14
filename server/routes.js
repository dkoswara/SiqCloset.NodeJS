(function(routes) {
    var routesAuth = require('./routesAuth');
    var mail = require('./services/mailService');
    var excelService = require('./services/excelService');

    routes.init = configureRoutes;

    function configureRoutes(app){

        app.get('/', function(req, res){
            res.render('index', {
                user: req.user || null,
                request: req
            });
        });

        //START BAD HACK FOR ANGULAR-BUSY
        //app.get('/angular-busy.html', function(req, res){
        //   res.render('bower_components/angular-busy/angular-busy.html');
        //});
        //END BAD HACK FOR ANGULAR-BUSY

        app.get('/ping', function(req, res){
            res.end('pong');
        });

        app.get('/pingAuth', routesAuth.isAuthenticated, routesAuth.isAuthorized, function(req, res){
            res.end('pongAuth');
        });

        app.post('/email/shipment-tracking', routesAuth.isAuthenticated, routesAuth.isAuthorized, function(req, res){
            mail.sendShipmentTracking(req.body).then(success).catch(fail);

            function success(results){
                res.status(200).end(results);
            }

            function fail(results){
                res.status(500).end(results.message);
            }
        });

        app.post('/email/shipment-schedule', routesAuth.isAuthenticated, routesAuth.isAuthorized, function(req, res){
            excelService.getShipmentScheduleHtml(req.body).then(function(htmlText){
                mail.sendShipmentSchedule(req.body.targetDate, htmlText).then(success).catch(fail);

                function success(results){
                    res.status(200).end(htmlText);
                }

                function fail(results){
                    res.status(500).end(results.message);
                }
            });
        });

        app.get('/excel/missing-customers', function(req, res) {
            excelService.getMissingCustomers(req.query.batchNum).then(success).catch(fail);

            function success(results) {
                res.json(results);
            }

            function fail(results) {
                res.status(500).end(results.message);
            }
        });

        app.post('/excel/shipping-address', routesAuth.isAuthenticated, routesAuth.isAuthorized, function(req, res) {
            excelService.buildCustomerShippingAddress(req.body.batchNum).then(success).catch(fail);

            function success(results) {
                res.status(200).end(results);
            }

            function fail(results) {
                res.status(500).end(results.message);
            }
        });

        app.post('/excel/batch-invoice', routesAuth.isAuthenticated, routesAuth.isAuthorized, function(req, res) {
            excelService.buildBatchInvoice(req.body.batchNum).then(success).catch(fail);

            function success(results) {
                res.status(200).end(results);
            }

            function fail(results) {
                res.status(500).end(results.message);
            }
        });

        app.post('/excel/shipment-invoice', routesAuth.isAuthenticated, routesAuth.isAuthorized, function(req, res) {
            excelService.buildShipmentInvoice(req.body.params).then(success).catch(fail);

            function success(results) {
                res.status(200).end(results);
            }

            function fail(results) {
                res.status(500).end(results.message);
            }
        });

        app.post('/login', routesAuth.authenticate());

        app.get('/auth/google', routesAuth.googleOAuth());

        app.get('/auth/google/callback', routesAuth.googleOAuthCallback());

        app.get('/logout', routesAuth.logout);
    }
})(module.exports);