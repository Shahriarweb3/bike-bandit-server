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


        // load single bike detail
        app.get('/motorbikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const bike = await bikesCollection.findOne(query);
            res.json(bike);
        })


        // GET specific Orders API by email
        app.get('/orders', async (req, res) => {
            let query = {}
            const email = req.query.email;
            if (email) {
                query = { email: email };
            }

            const cursor = await ordersCollection.find(query);
            const myOrder = await cursor.toArray();
            res.send(myOrder);
        })
        // UPDATE order status
        app.put('/orders', async (req, res) => {
            const order = req.body;
            const filter = { OrderStatus: "Approved" };
            const options = { upsert: true };
            const updateOrderStatus = {
                $set: { status: "Approved" }
            }
            const result = await ordersCollection.updateOne(filter, updateOrderStatus, options);
            res.json(result);
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

        // UPDATE order Status
        app.put('/orders', async (req, res) => {
            const orderStatus = req.body;
            console.log('put', orderStatus);
            const filter = { orderStatus: orderStatus };
            const updateDoc = { $set: { orderStatus: 'approved' } };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })


        // DELETE Orders API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        // DELETE product API
        app.delete('/motorbikes/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await bikesCollection.deleteOne(query);
            res.json(result);
        })

        // Make an admin API
        app.put('/users/admin', async (req, res) => {
            const admin = req.body;
            console.log('put', admin);
            const filter = { email: admin.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        // GET API to check if an user is admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // POST user rating API

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