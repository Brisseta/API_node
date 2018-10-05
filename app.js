var express = require('express');
var session = require('cookie-session'); // Charge le middleware de sessions
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var mongoose = require('mongoose'),autoIncrement = require('mongoose-auto-increment');


var app = express();

/* On utilise les sessions */
app.use(session({secret: 'todotopsecret'}))


/* S'il n'y a pas de todolist dans la session,
on en crée une vide sous forme d'array avant la suite */
.use(function(req, res, next){
    if (typeof(req.session.todolist) === 'undefined') {
        req.session.todolist = [];
    }
    next();
})

/* On affiche la todolist et le formulaire */
.get('/wup', function(req, res) {
    res.render('todo.ejs', {todolist: req.session.todolist});
})
/* On ajoute un élément à la todolist */
.post('/wup/add/', urlencodedParser, function(req, res) {
    if (req.body.libelle !== '') {
        var nouvelle_entry = new Entry(req.body.libelle);
        // nouvelle_entry.save_Entry_to_DB(this);
        req.session.todolist.push(nouvelle_entry.toString());
        console.log(nouvelle_entry.toString())
    }
    res.redirect('/todo');
})

/* Supprime un élément de la todolist */
.get('/wup/delete/:id', function(req, res) {
    if (req.params.id !== '') {
        req.session.todolist.splice(req.params.id, 1);
    }
    res.redirect('/todo');
})
/* On redirige vers la todolist si la page demandée n'est pas trouvée */
.use(function(req, res, next){
    res.redirect('/wup');
})

.listen(8080);

class Entry {

    constructor(libelle,ip,statut,SLA){
        this._action = "à renseigner";
        this._libelle = libelle;
        this._ip = ip;
        this._statut = statut;
        this._SLA = SLA;
    }

    get libelle() {
        return this._libelle;
    }

    get ip() {
        return this._ip;
    }

    get statut() {
        return this._statut;
    }

    get SLA() {
        return this._SLA;
    }

    get action() {
        return this._action;
    }

    set action(value) {
        this._action = value;
    }
    toString(){
        return JSON.stringify({libelle:this.libelle,ip:this.ip,statut:this.statut,SLA:this.SLA,action:this.action});
    }
    save_Entry_to_DB(entry){
        var db = mongoose.connect('mongodb://localhost:27017/WUP',{ useNewUrlParser: true });
        autoIncrement.initialize(mongoose.connection);
        var Shema_Entry = mongoose.Schema({
            libelle : String,
            ip : String,
            statut : String,
            sla : String,
            action : String
        });
        Shema_Entry.plugin(autoIncrement.plugin,'Entry');
        let Entry = mongoose.model('Entry',Shema_Entry);
        var entry_tosave = new Entry(this.libelle,this.ip,this.statut,this.SLA,this.action);
        entry_tosave.save(function (err) {
           if(err) throw err;
            console.log("entrée ajoutée" + entry_tosave);
        });
    }

}
