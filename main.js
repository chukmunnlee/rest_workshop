// Load the required libraries
const uuid = require('uuid')
const cors = require('cors');
const morgan = require('morgan');

const express = require('express');

// Load the 'database'
/*
{"URL":"http://www.just-eat.co.uk/restaurants-atthai-ss9/menu","_id":{"$oid":"55f14312c7447c3da7051b27"},"address":"376 Rayleigh Road","address line 2":"Essex","name":"@ Thai","outcode":"SS9","postcode":"5PT","rating":5.5,"type_of_food":"Thai"},
*/
const db = require('./data/restaurant.js')

const PORT = parseInt(process.env.PORT) || 3000

// Create an instance of the application
const app = express()

// Log all incoming requests
app.use(morgan('combined'))

// CORS enable
app.use(cors());

// List restaurants by city
app.get('/api/restaurants', 
	(req, resp) => {
		const limit = parseInt(req.query.limit) || 20
		const offset = parseInt(req.query.offset) || 0

		if ((limit < 0) || (offset < 0)) 
			return resp.status(400).type('application/json')
				.json({ error: 'invalid offset or query' })

		resp.status(200).type('application/json')
			.json(
				db.slice(offset, offset + limit)
					.map(v => {
						return ({
							name: v.name,
							type_of_food: v.type_of_food,
							url: `/api/restaurant/${v._id.$oid}`
						})
					})
			)
	}
);

// Find a restaurant by id
app.get('/api/restaurant/:id',
	(req, resp) => {
		const id = req.params.id;
		const result = db.find(v => v._id.$oid == id)

		if (!result)
			return resp.status(404).type('application/json')
				.json({ error: `invalid id: ${id}` })

		resp.status(200).type('application/json')
			.json(result)
	}
)

// Adding a new restaurant
app.post('/api/restaurant',
	express.json(),
	(req, resp) => {
		const id = uuid().toString().replace(/-/g, '')
		const data = req.body;
		data['_id'] = { $oid: id }
		db.push(data)
		resp.status(201).type('application/json')
			.json({ id })
	}
)

// Handle error
app.use((req, resp) => {
	resp.status(404).type('application/json')
		.json({ error: `invalid request: ${req.originalUrl}` })
})

// Start the application
app.listen(PORT, () => {
	console.info(`Application started on port ${PORT} at ${new Date()}`)
})
