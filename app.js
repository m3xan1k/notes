const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

// Connect to mongoose
mongoose.connect('mongodb://localhost/notes-dev', {
    useNewUrlParser: true
})
.then(() => console.log('Mongodb connected...'))
.catch(err => console.log(err));

// Load Note Model
require('./models/Note');
const Note = mongoose.model('notes');

// Handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: {
        trimDetails: (string) => {
            let words = string.split(' ');
            let newString = words.slice(0, 5).join(' ');
            return newString;
        }
    }
}));
app.set('view engine', 'handlebars');


// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Method override middleware
app.use(methodOverride('_method'));

// Session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

// Connect flash middleware
app.use(flash());

// Global vars for messages
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})


// Static Routes
app.get('/', (req, res) => {
    const title = 'Welcome1';
    res.render('index', {title: title});
})

app.get('/about', (req, res) => {
    res.render('about');
})

// Notes

app.get('/notes', (req, res) => {
    Note.find()
        .sort({date: 'desc'})
        .then(notes => res.render('notes/list', {notes: notes}))
        .catch(err => console.log(err));
})

app.get('/notes/add', (req, res) => {
    res.render('notes/add');
})

app.get('/notes/edit/:id', (req, res) => {
    const note = Note.findOne({_id: req.params.id})
        .then(note => res.render('notes/edit', {note: note}))
        .catch(err => console.log(err));
})

app.put('/notes/:id', (req, res) => {
    let errors = [];

    if(!req.body.title){
        errors.push({ text: 'Please fill out the title' });
    }
    if(!req.body.details) {
        errors.push({ text: 'Please fill out the body' });
    }
    if(errors.length > 0) {
        res.render('notes/edit', {
            errors: errors,
            note: note
        });
    } else {
        const updNote = {
            title: req.body.title,
            details: req.body.details
        }
        Note.findOneAndUpdate({_id: req.params.id}, updNote, () => {
            req.flash('success_msg', 'Note updated')
            res.redirect('/notes');
        })
    }
})

app.post('/notes', (req, res) => {
    let errors = [];

    if(!req.body.title) {
        errors.push({text: 'Please fill out the title'});
    }
    if(!req.body.details) {
        errors.push({text: 'Please fill out the details'});
    }
    if(errors.length > 0) {
        res.render('notes/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        const newNote = {
            title: req.body.title,
            details: req.body.details
        }
        new Note(newNote)
            .save()
            .then(note => {
                req.flash('success_msg', 'Note created');
                res.redirect('/notes');
            });
    }
})

app.get('/notes/:id', (req, res) => {
    Note.findOne({_id: req.params.id})
        .then(note => res.render('notes/show', {note: note}))
        .catch(err => console.log(err));
})

app.delete('/notes/:id', (req, res) => {
    Note.remove({_id: req.params.id})
        .then(() => {
            req.flash('success_msg', 'Note deleted');
            res.redirect('/notes');
        })
        .catch(err => console.log(err));
})


const port = 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});