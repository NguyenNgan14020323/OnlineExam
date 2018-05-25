var express = require('express'),
  cors = require('cors'),
  wait = require('wait.for'),
  moment = require('moment'),
  app = express();


var bodyParser = require('body-parser');
var multer = require('multer');

var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

app.use(cors());

var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit : 30,
  host : '128.199.145.205',
  user : 'dev',
  password : 'dev123',
  database : 'online_exam'
});




process.on('uncaughtException', function (err) {
    console.log(err);
}); 

app.use(bodyParser.json());
var storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
  }
});

var upload = multer({ //multer settings
  storage: storage,
  fileFilter : function(req, file, callback) { //file filter
    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
      return callback(new Error('Wrong extension type'));
    }
    callback(null, true);
  }
}).single('file');

app.post('/upload', function(req, res) {
    var exceltojson; //Initialization
    upload(req,res,function(err){
        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }
        /** Multer gives us file info in req.file object */
        if(!req.file){
            res.json({error_code:1,err_desc:"No file passed"});
            return;
        }
        //start convert process
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
        if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        try {
            exceltojson({
                input: req.file.path, //the same path where we uploaded our file
                output: null, //since we don't need output.json
                lowerCaseHeaders:true
            }, function(err,result){
                if(err) {
                    return res.json({error_code:1,err_desc:err, data: null});
                }
                student = [];
                for(var i = 0; i<result.length; i++){
                  a = {
                    name: result[i].name,
                    email: result[i].email,
                  };
                  values = [
                    [result[i].name, result[i].email, 4]
                  ];
                  var sql = "insert into student (name, email, user_id) value ?";
                  pool.query(sql, [values], function (err1, result1) {
                    if (err1) throw err1;
                  });
                  student.push(a);
                }
                return res.redirect('http://localhost:8888/#/students');
            });
        } catch (e){
          res.json({error_code:1,err_desc:"Corupted excel file"});
        }
    });
});

function db_function(f, req, res){
  wait.launchFiber(f,req,res);
};

var path= require("path");
app.use(express.static(__dirname));
app.use(express.static(__dirname + '/online_exam'));

var bodyParser = require('body-parser')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());
app.get('/api', function (req, res) {
  res.send('Hello World!');
});

function get_categories(req, res){
  var rows = wait.forMethod(pool, 'query', "SELECT * FROM category", []);
  res.json(rows);
};

app.delete('/api/section_questions/:id', function(req, res){
  pool.query('delete from section_question where id = ?', req.params.id, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/categories', function (req,res) {
  db_function(get_categories, req,res);
});

app.get('/api/categories/:id', function (req,res) {
  pool.query('SELECT * FROM question where category_id = ?',req.params.id, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/students/:id', function(req, res){
  pool.query('select * from student where user_id = ?',req.params.id, function(err, students, fields){
    if (err) throw err;
    res.json(students);
  })
})
app.put('/api/students/:id', function (req, res) {
  pool.query('UPDATE student SET ? WHERE id = ?',[req.body , req.body.id], function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});
app.delete('/api/students/:id', function(req, res){
  pool.query('delete from student where id = ?', req.params.id, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});
app.post('/api/students', function (req, res) {
  pool.query('insert into student SET ?',[req.body], function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.post('/api/categories', function (req, res) {
  pool.query('insert into category SET ?',[req.body], function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/questions', function (req,res) {
  pool.query('SELECT question.id,question.title, question.filetype, question.category_id, question.content, question.answers, question.type, question.file, category.name   FROM question INNER JOIN category ON question.category_id = category.id ORDER BY question.id;', function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/questions/edit/:id', function (req,res) {
  pool.query('SELECT * FROM question where id = ?', req.params.id, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.delete('/api/question/:id', function(req, res){
  pool.query('delete from question where id = ?', req.params.id, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.put('/api/categories/:id', function (req, res) {
  pool.query('UPDATE category SET ? WHERE id = ?',[req.body , req.body.id], function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.delete('/api/categories/:id', function(req, res){
  pool.query('delete from category where id = ?', req.params.id, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/questions/:id', function(req,res){
  pool.query('select id, content from question where id = ?', req.params.id, function(err, rows, fields){
    if (err) throw err;
    res.json(rows);
  });
});

app.post('/api/addQuestions', function (req, res) {
  req.body.answers = JSON.stringify(req.body.answers);
  pool.query('insert into question SET ?',[req.body], function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.put('/api/editQuestions', function (req, res) {
  req.body.answers = JSON.stringify(req.body.answers);
  pool.query('UPDATE question SET ? WHERE id = ?',[req.body , req.body.id], function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/examies', function (req,res) {
  pool.query('SELECT * FROM exam', function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.post('/api/examies', function(req, res){
  req.body.open_time = moment.utc(req.body.open_time).local().format('YYYY MMMM DD h:mm:ss');
  req.body.close_time = moment.utc(req.body.close_time).local().format('YYYY MMMM DD h:mm:ss');
  pool.query('insert into exam SET ?',[req.body], function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});
  
app.put('/api/examies/:id', function(req, res){
  req.body.open_time = moment.utc(req.body.open_time).local().format('YYYY MMMM DD h:mm:ss');
  req.body.close_time = moment.utc(req.body.close_time).local().format('YYYY MMMM DD h:mm:ss');
  pool.query('update exam SET ? where id=?',[req.body, req.body.id], function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.delete('/api/examies/:id', function(req, res){
  pool.query('delete from exam where id = ?', req.params.id, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/examies/:id', function(req, res){
  pool.query('SELECT * FROM exam where id = ?', req.params.id, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/examies/:id/sections', function(req, res){
  pool.query('SELECT * FROM section where exam_id = ?', req.params.id, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.put('/api/examies/:exam_id/sections/:id', function(req, res){
  pool.query('update section set ? where id = ?', [req.body, req.params.id], function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/examies/:id/question', function(req, res){
  pool.query('SELECT section_question.mark, question.filetype, question.title, question.id, question.content,question.type, question.answers,question.file FROM section_question INNER JOIN question ON question.id = section_question.question_id where section_id = ?', req.params.id, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.post('/api/examies/:exam_id/sections', function(req, res){
  pool.query('insert into section SET ?',[req.body], function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.delete('/api/examies/:exam_id/sections/:id', function(req, res){
  pool.query('delete from section where id = ?', req.params.id, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.post('/api/section_questions', function(req, res){
  pool.query('insert into section_question set ?',[req.body], function(err, rows, fields){
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/:examName/id/:id', function(req,res){
  res.sendFile(__dirname + "/src/templates/examies/index.html");
})

app.get('/api/section_questions', function(req, res){
  pool.query('select * from section_question', function(err, rows, fields){
    if (err) throw err;
    res.json(rows);
  });
});
app.get('/api/section_questions/:id', function(req, res){
  pool.query('select * from section_question where section_id = ?',req.params.id, function(err, rows, fields){
    if (err) throw err;
    res.json(rows);
  });
});

app.delete('api/section_questions/:id', function(req, res){
  pool.query('delete from section_question where id = ?', req.params.id, function(err, rows, fields){
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/sections/:id', function(req, res){
  pool.query('select * from section_question where section_id = ?', req.params.id, function(err, rows, fields){
    if (err) throw err;
    res.json(rows);;
  });
});

app.post('/api/signup', function (req, res) {
  console.log(req.body);
  pool.query('insert into user SET ?',[req.body], function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/getByEmail/:email', function (req, res) {
  pool.query('select * from user  where email = ?',req.params.email, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/getById/:id', function (req, res) {
  pool.query('select * from user  where id = ?',req.params.id, function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});
app.put('/api/updateUser', function (req, res) {
  pool.query('UPDATE user SET ? WHERE id = ?',[req.body , req.body.id], function(err, rows, fields) {
    if (err) throw err;
    res.json(rows);
  });
});

app.get('/api/examies/:id/details', function(req, res){
  db_function(get_exam, req, res);
});

function get_exam(req, res){
  var exam = wait.forMethod(pool, 'query', "select * from exam where id = ?", [req.params.id]);
  for(var i = 0; i < exam.length; i++) {
    var sections = wait.forMethod(pool, 'query', "select * from section where exam_id = ?", [exam[i].id]);
    exam[i].section = sections;
    for(var j = 0; j < sections.length; j++){
      var section_questions = wait.forMethod(pool, 'query', "select * from section_question where section_id = ?", [sections[j].id]);
      var questions = [];
      for(var z = 0; z < section_questions.length; z++){
        var question = wait.forMethod(pool, 'query', "select * from question where id = ?", [section_questions[z].question_id]);
        questions.push(question);
      }
      sections[j].question = questions;
    }
  }
  res.json(exam);
}
app.put('/api/section_questions/:id', function(req, res){
   pool.query('UPDATE section_question set ? WHERE id = ?',[req.body , req.body.id], function(err, rows, fields){
    res.json(rows);
  });
});

// app.get('/',function(req,res){
//   res.sendFile(__dirname + "/online_exam/index.html");
// });
app.get('/upload',function(req,res){
  res.sendFile(__dirname + "/index.html");
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
