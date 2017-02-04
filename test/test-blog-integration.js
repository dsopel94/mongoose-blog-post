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
						'Harry Potter', 'Fear and Loathing in Las Vegas'];
   return titles[Math.floor(Math.random() * titles.length)];
}

function generateFirstName() {
	const firstName = ['J.K.', 'Dan', 'Mike'];

	return firstName[Math.floor(Math.random()* firstName.length)];
}	

function generateLastName() {
	const lastName = ['Brown', 'Rowling', 'Patterson'];

	return lastName[Math.floor(Math.random()* lastName.length)];
}	

function generatePost() {
	const posts = ['Apple', 'Orange', 'Banana', 'Kiwi'];

	return posts[Math.floor(Math.random() * posts.length)];
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
		return closeServer();
	})

	function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
	}

	describe('GET endpoint', function() {
		it('should return all existing blog posts', function() {
			let res;
			return chai.request(app)
			.get('/posts')
			.then(function(_res) {
				res = _res;
				res.should.have.status(200);
				res.body.should.have.length.of.at.least(1);
				return BlogPost.count();
			})
			.then(function(count) {
				res.body.should.have.length.of(count);
			})
		})
	})

	describe('POST endpoint', function() {

		it('should add a new blog post', function() {
			const newPost = generateBlogData();

			return chai.request(app)
			.post('/posts')
			.send(newPost)
			.then(function(res) {
				res.should.have.status(201);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.include.keys(
					'id','title','content','author','created');
				res.body.title.should.equal(newPost.title);
				res.body.id.should.not.be.null;
				res.body.content.should.equal(newPost.content);
				//res.body.author.firstName.should.equal(newPost.author.firstName);
				return BlogPost.findById(res.body.id);
			})

			.then(function(post) {
				post.title.should.equal(newPost.title);
				console.log(post.title)
				post.content.should.equal(newPost.content);
				post.author.firstName.should.equal(newPost.author.firstName);
				post.author.lastName.should.equal(newPost.author.lastName);
			});
		});
	});

			describe('PUT endpoint', function() {
				it('should update fields you sent over', function() {
					const updateData = {
						title: "adsfrgtrgdfs",
						content: "New coherent blog post"
					};

					return BlogPost
					.findOne()
					.exec()
					.then(function(post){
						updateData.id = post.id;
						
						return chai.request(app)
						.put(`/posts/${post.id}`) 
						.send(updateData);
					})
					.then(function(res) {
						res.should.have.status(201);

						return BlogPost.findById(updateData.id).exec();
					})
					.then(function(post) {
						post.title.should.equal(updateData.title)
						post.content.should.equal(updateData.content);
					});
				});
			});

	describe("DELETE endpoint", function() {
		it(' should delete a blog post by ID', function() {

			let post;

			return BlogPost
			.findOne()
			.exec()
			.then(function(_post) {
				post = _post;
				return chai.request(app).delete(`/posts/${post.id}`);
			})
			.then(function(res) {
				res.should.have.status(204);
				return BlogPost.findById(post.id).exec();
			})
			then(function(_post) {
				should.not.exist(_post)
			});
		});
	});
});