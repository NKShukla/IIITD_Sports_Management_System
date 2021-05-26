const express= require('express');
const bodyParser= require('body-parser');
const favicon= require('serve-favicon');
const session= require('express-session');
const request = require('request');
var path = require('path');
const router  = express.Router();

var connection = mysql.createConnection({
	host     : 'dbms-project.crmqxi53aesr.ap-south-1.rds.amazonaws.com',
    port     :  3306,
	user     : 'admin',
	password : "&lrigh!y",
	database : 'sports_management'
});

var app = express();
app.use(express.static(__dirname+"/public"));
app.set('views', './public/html')
app.set('view engine','ejs');
// app.use(expressEjsLayout);
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.render('index');
});

app.post('/auth', function(request, response) {
	var pid = request.body.personid;
	var password = request.body.password;
	if (pid && password) {
		connection.query('SELECT * FROM person WHERE person_ID = ? AND password = ?', [pid, password], function(error, results) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.personID = pid;
				response.redirect('/profile');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	}else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
app.get('/profile', function(request, response) {
	if (request.session.loggedin) {
		// response.send('Welcome back, ' + request.session.personID + '!');
		console.log("profile");
		response.render('profile', {pid: request.session.personID});
	} else {
		response.send('Please login to view this page!');
	}
	
});
app.get('/sportsDay', function(request, response) {
	if (request.session.loggedin) {
		// response.send('Welcome back, ' + request.session.personID + '!');
		console.log("sports_day");
		response.render('sports_day', {pid: request.session.personID});
	} else {
		response.send('Please login to view this page!');
	}
	
});
app.get('/guardDetails', function(request, response) {
	if (request.session.loggedin) {
		// response.send('Welcome back, ' + request.session.personID + '!');
		console.log("guardDetails");
		response.render('guardDetails', {pid: request.session.personID});
	} else {
		response.send('Please login to view this page!');
	}
	
});
app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		// response.send('Welcome back, ' + request.session.personID + '!');
		console.log("home");
		response.render('home');
	} else {
		response.send('Please login to view this page!');
	}
	
});
app.get('/tournamentDetails', function(request, response) {
	if (request.session.loggedin) {
		// response.send('Welcome back, ' + request.session.personID + '!');
		console.log("tournament");
		response.render('tournament');
	} else {
		response.send('Please login to view this page!');
	}
	
});
app.post('/accountInfo', function (request, res) {
    res.header("Set-Cookie", "HttpOnly;SameSite=Strict");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    const id=request.body.pid.trim();
    const params= {};
    params['id']=id;
    // console.log(id);
    if (id===request.session.personID) {
        AccountInfo(params).then(function (response) {
            console.log(response);
            res.end(response);
        }).catch(function (response) {
            res.end(response);
        });
    }else {
        //login verification failed
        const response= {};
        response['code']= -1;
        response['info']= "Unauthorized access";
        res.end(JSON.stringify(response));
    }
});

app.post('/tournamentDetails', function (req, res) {
    res.header("Set-Cookie", "HttpOnly;SameSite=Strict");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const event=req.body.event.trim();
    const sport=req.body.sport.trim();
    const params= {};
    params['event']=event;
    params['sport']=sport;
    console.log(event+" "+sport);
    if(sport=="Football"){
        footballInfo(params).then(function (response) {
            console.log(response);
            res.end(response);

        }).catch(function (response) {
            res.end(response);
        });
    }else{
        cricketInfo(params).then(function (response) {
            console.log(response);
            res.end(response);

        }).catch(function (response) {
            res.end(response);
        });
    }
});

app.post('/guardInfo', function (req, res){
    res.header("Set-Cookie", "HttpOnly;SameSite=Strict");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const timings=req.body.timings.trim();
    const params= {};
    params['timings']=timings;
    console.log(timings);
    GuardInfo(params).then(function (response) {
        // console.log(response);
        res.end(response);

    }).catch(function (response) {
        res.end(response);
    });
});
app.post('/sportsDay', function (req, res){
    res.header("Set-Cookie", "HttpOnly;SameSite=Strict");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    checkInEntries().then(function (response) {
        // console.log(response);
        res.end(response);

    }).catch(function (response) {
        res.end(response);
    });
});

app.post('/save', function(req,res){
    res.header("Set-Cookie", "HttpOnly;SameSite=Strict");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const params= {};
    params['id']=req.body.id;
    params['mname']=req.body.mname;
    params['lname']=req.body.lname;
    params['gender']=req.body.gender;
    console.log(req.body.id+" "+req.body.mname + " " + req.body.lname + " "+ req.body.gender);
    save(params).then(function (response) {
        // console.log(response);
        res.end(response);

    }).catch(function (response) {
        res.end(response);
    });
});
let save= function save(params){
    return new Promise(function (resolve, reject) {
        const response= {};
            connection.query('update person set middle_name = ? , last_name = ? , gender = ? where person_ID = ?',[params['mname'],params['lname'],params['gender'],params['id']], function (err, result) {
                if (err) {
                    console.log(err);
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                } else {
                    response['code']=1;
                    response['info']="updated database!";
                    console.log("updated");
                    resolve(JSON.stringify(response));
                }
            });
    });
};
let AccountInfo= function AccountInfo(params) {
    return new Promise(function (resolve, reject) {
        const response= {};
            connection.query(`select * from person where person_ID='`+params['id']+`';`, function (err, result) {
                if (err) {
                    connection.end();
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                } else {
                    response['code']=1;
                    response['info']= "Account Details";
                    let obj= {};
                    obj['id']=result[0].id;
                    obj['first_name']=result[0].first_name;
                    obj['middle_name']=result[0].middle_name;
                    obj['last_name']=result[0].last_name;
                    obj['email']=result[0].email;
                    obj['gender']=result[0].gender;
                    if(result[0].priority==0){
                        obj['role']="Student";
                    }else if(result[0].priority==1){
                        obj['role']="Student Council Member";
                    }else{
                        obj['role']="Faculty";
                    }
                    response['user']=obj;
                    resolve(JSON.stringify(response));
                }
            })
    });
};
let GuardInfo= function GuardInfo(params){
    return new Promise(function (resolve, reject) {
        const response= {};
            connection.query(`select * from guard_info where guard_ID in 
            (select guard_ID from guard where timings='`+params['timings']+`');`, function (err, result) {
                if (err) {
                    connection.end();
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                
                } else {
                    response['guard']=[];
                    for (let i=0;i<result.length; i++) {
                        //console.log(result[i].name);
                        response['code']=1;
                        response['info']= "Account Details";
                        let obj= {};
                        obj['id']=result[i].guard_ID;
                        obj['name']=result[i].name;
                        obj['contact_number']=result[i].contact_number;
                        response['guard'].push(obj);
                        
                    }
                    
                    resolve(JSON.stringify(response));
                }
            })
    });
};
let checkInEntries= function checkInEntries(){
    return new Promise(function (resolve, reject) {
        const response= {};
            connection.query(`select slot, sport_name, count(slot) as entries from
            sports_item 
            natural join (check_in_slot natural join tracks)
            group by slot,sport_name with rollup`, function (err, result) {
                if (err) {
                    connection.end();
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                
                } else {
                    response['entry']=[];
                    for (let i=0;i<result.length; i++) {
                        //console.log(result[i].name);
                        response['code']=1;
                        response['info']= "entry details";
                        let obj= {};
                        obj['slot']=result[i].slot;
                        obj['sport']=result[i].sport_name;
                        obj['count']=result[i].entries;
                        response['entry'].push(obj);
                        
                    }
                    
                    resolve(JSON.stringify(response));
                }
            })
    });
};
let footballInfo= function footballInfo(params){
    return new Promise(function (resolve, reject) {
        const response= {};
            connection.query(`SELECT team_name, ROUND(AVG(goals), 2) AS 'Goals_per_match'
            FROM 
            (
            SELECT team_ID, match_ID, score as goals 
            FROM match_team
            WHERE match_ID IN(
                SELECT match_ID
                FROM sports_match
                WHERE sport_name = ? and event_name= ? )
            ) as m
            NATURAL JOIN
                (SELECT team_ID, team_name
                    FROM team
                    WHERE sport_name = ? ) as t
            GROUP BY m.team_ID;`,[params['sport'],params['event'],params['sport']], function (err, result) {
                if (err) {
                    connection.end();
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                
                } else {
                    response['records']=[];
                    for (let i=0;i<result.length; i++) {
                        //console.log(result[i].name);
                        response['code']=1;
                        response['info']= "Team Details";
                        let obj= {};
                        obj['name']=result[i].team_name;
                        obj['av_goals']=result[i].Goals_per_match;
                        response['records'].push(obj);
                        
                    }
                    
                    resolve(JSON.stringify(response));
                }
            })
    });
};
let cricketInfo= function cricketInfo(params){
    return new Promise(function (resolve, reject) {
        const response= {};
            connection.query(`SELECT team_name, SUM(runs) AS 'Total_runs'
            FROM (
                SELECT team_ID, match_ID, SUBSTRING_INDEX(score, '/', 1) AS runs, SUBSTRING_INDEX(score, '/', -1) AS wickets 
                FROM match_team
                WHERE match_ID IN(
                        SELECT match_ID
                        FROM sports_match
                        WHERE sport_name = ? and event_name = ? )
            ) 
            as m
            NATURAL JOIN
                (SELECT team_ID, team_name
                    FROM team
                    WHERE sport_name = ?) as t
            GROUP BY m.team_ID;`,[params['sport'],params['event'],params['sport']], function (err, result) {
                if (err) {
                    connection.end();
                    response['code']=-1;
                    response['info']= "Oops! looks like we have some problem with our database. Please try again";
                    reject(JSON.stringify(response));
                
                } else {
                    response['records']=[];
                    for (let i=0;i<result.length; i++) {
                        //console.log(result[i].name);
                        response['code']=1;
                        response['info']= "Account Details";
                        let obj= {};
                        obj['name']=result[i].team_name;
                        obj['runs']=result[i].Total_runs;
                        response['records'].push(obj);
                        
                    }
                    
                    resolve(JSON.stringify(response));
                }
            })
    });
};
app.get('/logout',(req,res)=>{
    //session destroy
    req.session = null;
    res.redirect('/');
});

//!process.env.PORT has to be included
app.listen(process.env.PORT || 8080, function () {
    console.log("Listening on server port: 8080");
});