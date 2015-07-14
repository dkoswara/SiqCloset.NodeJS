var frisby = require('frisby');
var baseUrl = 'http://localhost:3000';

frisby.globalSetup({
    timeout: 10000
});

frisby.create('Get Google')
    .get('https://www.google.com')
    .expectStatus(200)
    .toss();

frisby.create('Get non-existing site')
    .get('https://www.should-not-exist.com')
    .expectStatus(500)
    .toss();

frisby.create('Ping localhost')
    .get(baseUrl + '/ping')
    .expectStatus(200)
    .expectBodyContains('pong')
    .toss();

frisby.create('Login')
    .post(baseUrl + '/login', { username: 'demo',  password: 'christ_is_enough'})
    .after(function() {
        //TODO: change this method to persist cookie. feels like a hack.
        //from my reading, we should send access_token instead or session_id. I just don't understand how yet....
        var cookie = this.currentRequestFinished.res.headers['set-cookie'][0].split(';')[0];

        frisby.create('Ping localhost when authenticated')
            .get(baseUrl + '/pingAuth')
            .addHeader('Cookie', cookie)
            .expectStatus(200)
            .expectBodyContains('pongAuth')
            .toss();

        frisby.create('Create Customer Shipping Address')
            .post(baseUrl + '/excel/shipping-address', {batchNum: 190})
            .addHeader('Cookie', cookie)
            .expectStatus(200)
            .toss();

        frisby.create('Create Batch Invoice')
            .post(baseUrl + '/excel/batch-invoice', {batchNum: 190})
            .addHeader('Cookie', cookie)
            .expectStatus(200)
            .toss();

        var testParams = createTestParamsForShipmentInvoice();

        frisby.create('Create Shipment Invoice')
            .post(baseUrl + '/excel/shipment-invoice', {params: testParams})
            .addHeader('Cookie', cookie)
            .expectStatus(200)
            .toss();
    })
    .toss();

function createTestParamsForShipmentInvoice() {
    var boxOne = {
        boxNo: 1,
        trackingNumber: 'EZ12345678US',
        weight: '20.10',
        latestEstDeliveryDate: '05/03',
        shippingCost: 169.30
    };

    var boxTwo = {
        boxNo: 2,
        trackingNumber: 'EZ87654321US',
        weight: '30.20',
        latestEstDeliveryDate: '05/03',
        shippingCost: 156.86
    };

    var params = {
        batchNum: 193,
        shipmentDate: '04/25',
        boxes: [boxOne, boxTwo]
    };

    return params;
}
