const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()

const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ayoaw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('connected successfully');
        const database = client.db('motorbikes_collection');
        const bikesCollection = database.collection('motorBikes');
        const ordersCollection = database.collection('orders');
        const ratingCollection = database.collection('ratings');
        const usersCollection = database.collection('users');

        // load data on UI from database
        app.get('/motorBikes', async (req, res) => {
            const cursor = bikesCollection.find({});
            const bikes = await cursor.toArray();
            res.send(bikes);
        })
        // GET all orders API
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const allOrders = await cursor.toArray();
            res.send(allOrders);

        })

        // load single bike detail
        app.get('/motorbikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bike = await bikesCollection.findOne(query);
            res.json(bike);
        })


        // GET specific Orders API by email
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const myOrders = await cursor.toArray();
            res.send(myOrders);

        })


        //    Add a new product to database and load on UI
        app.post('/motorbikes', async (req, res) => {
            const newBike = req.body;
            const result = await bikesCollection.insertOne(newBike);
            res.json(result)
        })

        // Add Orders API
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })

        // DELETE Orders API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })
        // POST user rating

        app.post('/rating', async (req, res) => {
            const rating = req.body;
            const result = await ratingCollection.insertOne(rating);
            res.json(result)
        })

        app.get('/rating', async (req, res) => {
            const cursor = ratingCollection.find({});
            const ratings = await cursor.toArray();
            res.send(ratings);

        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);
app.get('/', async (req, res) => {

    res.send('hello bike bandit');
})

app.listen(port, () => {
    console.log(`listening :${port}`)
})