const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://bloglist:${password}@cluster0-fs5mi.mongodb.net/bloglist?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

const Blog = mongoose.model('Blog', blogSchema)


const blog = new Blog({
  title: 'The Most Important Skill Nobody Taught You',
  author: 'Zat Rana',
  url: 'https://medium.com/personal-growth/the-most-important-skill-nobody-taught-you-9b162377ab77',
  likes: 294000,
})


Blog.find({}).then(result => {
  result.forEach(blog => {
    console.log(blog)
  })
  mongoose.connection.close()
})