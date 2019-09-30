const dummy = (blogs) => {
  return 1
}


const totalLikes = (blogs) => {

  if (blogs.length === 0) {
    return 0
  } else if (blogs.length === 1) {
    return blogs[0].likes
  } else {
    let sum = 0
    blogs.forEach(blog => {
      sum += blog.likes
    })
    return sum
  }
}


const favoriteBlog = (blogs) => {
  if (blogs.length > 1) {
    const likes = blogs.map(blog => blog.likes)
    const mostLikes = Math.max(...likes)
    return blogs.find(blog => blog.likes === mostLikes)
  }
}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}

