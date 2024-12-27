exports.getPost = (req,res, next) => {
    res.status(200).json({
        posts: [{title: 'First Post', content: 'This is the first post!'}]
    });
};

exports.createPost = (req, res, next) => {
    //suppose we get title and content from the body
    const {title, content} = req.body;
    //create post in db
    res.status(201).json({
        message: "Post created successfully!",
        post: {id: new Date().toISOString(), title: title, content: content}
    })
}
