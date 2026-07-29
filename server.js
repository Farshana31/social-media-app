const express = require('express');
const cors = require('cors');

const app = express();
const path = require('path');

// Serve static files from the root directory
app.use(express.static(__dirname));

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.use(cors());
app.use(express.json());

// Users database with professional mock data
let users = {
    "1": { 
        id: "1", 
        name: "Alex", 
        bio: "Software Engineer 💻", 
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" 
    }
};

let posts = [
    {
        id: "post-1",
        userId: "1",
        userName: "Alex",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        content: "Hello World! My first post on this awesome platform. #coding",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
        likes: 5,
        likedBy: [],
        comments: [
            { id: "c1", userName: "Sarah", text: "Awesome project mate!" }
        ],
        createdAt: new Date()
    }
];

// API Routes
app.get('/api/user/:id', function(req, res) {
    const user = users[req.params.id];
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
});

app.get('/api/posts', function(req, res) {
    res.json(posts);
});

app.post('/api/posts', function(req, res) {
    const userId = req.body.userId;
    const content = req.body.content;
    const image = req.body.image;
    
    const user = users[userId];
    if (!user) return res.status(400).json({ error: "Invalid User" });
    if (!content) return res.status(400).json({ error: "Content is required" });

    const newPost = {
        id: 'post-' + Date.now(),
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: content,
        image: image || null,
        likes: 0,
        likedBy: [],
        comments: [],
        createdAt: new Date()
    };
    posts.unshift(newPost);
    res.status(201).json(newPost);
});

app.post('/api/posts/:id/like', function(req, res) {
    const userId = req.body.userId;
    const post = posts.find(function(p) { return p.id === req.params.id; });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const index = post.likedBy.indexOf(userId);
    if (index === -1) {
        post.likedBy.push(userId);
        post.likes += 1;
    } else {
        post.likedBy.splice(index, 1);
        post.likes -= 1;
    }
    res.json({ likes: post.likes, likedBy: post.likedBy });
});

app.post('/api/posts/:id/comment', function(req, res) {
    const userName = req.body.userName;
    const text = req.body.text;
    const post = posts.find(function(p) { return p.id === req.params.id; });

    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!text) return res.status(400).json({ error: "Comment text is required" });

    const newComment = {
        id: 'c-' + Date.now(),
        userName: userName || "Anonymous",
        text: text
    };
    post.comments.push(newComment);
    res.status(201).json(newComment);
});

const PORT = process.env.port || 5000;
app.listen(PORT, function() {
    console.log("Backend server running perfectly on port " + PORT);
});