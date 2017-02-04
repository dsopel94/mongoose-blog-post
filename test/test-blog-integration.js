const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);


function seedBlogPostData() {
	console.info('seeding blog post data');
	const seedData = [];

	for (let i=1; i<10; i++) {
		seedData.push(generateBlogData());
	}

return BlogPost.insertMany(seedData);
}	

function generateTitle() {
	const titles = [ 'Of Mice and Men', 'Moby Dick', 'Mona Lisa', 
						'Harry Potter', 'Fear and Loathing in Las Vegas']
   return titles[Math.floor(Math.random() * titles.length)];
}

function generateFirstName() {
	const firstName = ['J.K.', 'Dan', 'Mike']l

	return firstName[Math.floor(Math.random()* firstName.length)];
}	

function generateLastName() {
	const lastName = ['Brown', 'Rowling', 'Patterson']l

	return lastName[Math.floor(Math.random()* lastName.length)];
}	

function generatePost() {
	const posts = ['Apple', 'Orange', 'Banana', 'Kiwi'];

	return posts[Math.floor(Math.floor(Math.random() * posts.length)];
}

function generateBlogData() {
	return {
		title: generateTitle(),
		content: generateTitle(),
		author: { firstName: generateFirstName(),
				  lastName: generateLastName()
		}
	}
}

function tearDownDB() {
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
}

describe('Blog API resource', function() {

	before(function() {
		return runServer(TEST_DATABASE_URL)
	});

	beforeEach(function() {
		return seedBlogPostData();
	});

	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeServer
	})

	describe('GET endpoint', function() {
		it('should return all existing blog posts', function() {
			let res;
			return chai.request(app)
			.get('/posts')
			.then(function(_res) {
				res _res;
				res.should.have.status(200);
				res.body.should.have.length.of.at.least(1);
				return BlogPost.count();
			})
			.then(function(count) {
				res.body.should.have.length.of(count);
			})
		})
	})
})