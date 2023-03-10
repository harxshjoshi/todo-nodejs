const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dotenv = require("dotenv");
const Todo = require("./models/TodoModel");

// configure environment variable
dotenv.config();

// to serve static file 
app.use("/static", express.static("public"));

app.use(express.urlencoded({ extended: true }));

// set view templates config
app.set("view engine", "ejs");

// GET METHOD
app.get("/", (req, res) => {
    console.log(`FindAll Method`);
    Todo.find({}, (err, todos) => {
        res.render("todo.ejs", { todos });
    });
});

// SAVE METHOD
app.post('/', async (req, res) => {
    console.log(`Save Method`);
    const todo = new Todo({
        content: req.body.content
    });

    try {
        await todo.save();
        console.log("Save successfully");
        res.redirect("/");
    } catch (err) {
        console.log("Failed to save, please try again")
        res.redirect("/");
    }
});

// UPDATE METHOD
app.route("/edit/:id")
    .get((req, res) => {
        console.log(`Edit Method`);
        const id = req.params.id;
        Todo.find({}, (err, todos) => {
            res.render("todoEdit.ejs", { todos, todoId: id });
        });
    })
    .post((req, res) => {
        const id = req.params.id;
        Todo.findByIdAndUpdate(id, { content: req.body.content }, err => {
            if (err) return res.send(500, err);
            res.redirect("/");
        });
    });

// DELETE METHOD
app.route("/remove/:id").get((req, res) => {
    console.log(`Remove Method`);
    const id = req.params.id;
    Todo.findByIdAndRemove(id, err => {
        if (err) return res.send(500, err);
        res.redirect("/");
    });
});

// use when starting application locally
const mongoUrlLocal = "mongodb://username:password@localhost:27017"
// use when starting application as docker container
const mongoUrlDocker = "mongodb://username:password@mongodb"
// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4, // use IPv4, mongoose default IPv6
};

// connection to db
mongoose.set("strictQuery", false);
mongoose.connect(mongoUrlDocker, mongoClientOptions);
const db = mongoose.connection;
db.on('error', () => {
    console.error.bind(console, `Connection error: `)
});

db.once('open', function () {
    console.log("Connection successful!");
    // run server
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Express server listening on port: ${PORT}`)
    });
});