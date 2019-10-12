const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 12,
    __v: 0
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }

  // let blogObject = new Blog(initialBlogs[0])
  // await blogObject.save()

  // blogObject = new Blog(initialBlogs[1])
  // await blogObject.save()

  // blogObject = new Blog(initialBlogs[2])
  // await blogObject.save()

  // blogObject = new Blog(initialBlogs[3])
  // await blogObject.save()

  // blogObject = new Blog(initialBlogs[4])
  // await blogObject.save()

  // blogObject = new Blog(initialBlogs[5])
  // await blogObject.save()
})


test('there are five blogs', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body.length).toBe(6)
})

test('the id property exists', async () => {
  const response = await api.get('/api/blogs')

  const ids = response.body.map(r => r.id)
  console.log(ids)

  expect(response.body.map(r => r.id)).toBeDefined()
})

test('HTTP POST request to /api/blogs url successful', async () => {
  const newBlog = {
    title: 'This is a jest test',
    author: 'Josh Turan',
    url: 'http://www.testurl.com',
    likes: 100,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)


  const response = await api.get('/api/blogs')

  const ids = response.body.map(r => r.id)
  expect(ids.length).toBe(initialBlogs.length + 1)

  const titles = response.body.map(r => r.title)
  expect(titles).toContain('This is a jest test')
})

test('if likes property is missing default to 0', async () => {
  const newBlog = {
    title: 'This is a jest test',
    author: 'Josh Turan',
    url: 'http://www.testurl.com',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const lastBlog = response.body[response.body.length - 1]
  console.log(lastBlog)

  expect(lastBlog.likes).toEqual(0)
})

test('Blog without title is not added', async () => {
  const newBlog = {
    author: 'Josh Turan',
    url: 'www.testurl.com',
    likes: 100
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  // const response = await api.get('/api/blogs')
  // expect(response.body.length).toBe(initialBlogs.length)
})

test('Blog without url is not added', async () => {
  const newBlog = {
    title: 'This is a test',
    author: 'Josh Turan',
    likes: 100
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  // const response = await api.get('/api/blogs')
  // expect(response.body.length).toBe(initialBlogs.length)
})


describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: 'root', password: 'sekret' })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb

    const newUser = {
      username: 'root',
      name: 'root',
      password: 'sekret'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
})


afterAll(() => {
  mongoose.connection.close()
})