// Initialize app
var myApp = new Framework7();
var db;

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

//Delete event to delete individual workouts from webSQL
$$(document).on('deleted', '.remove-callback', function() {
  var workoutId = $$(this).attr('id');

  deleteWorkout(workoutId);
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    //use open databse (webSql -  built in db in web browser)
    //1000000 bytes = 1MB (db size)
    db = window.openDatabase('workouttracker', '1.0', 'Workout Tracker', 1000000);
    //function call to create db if not exists
    createDatabase();
    //get the pre existing workouts from db
    getWorkouts();
});
myApp.onPageInit('add', function (page) {
  //catch the submit event
  $$('#workout-form').on('submit', function (e) {
    var data = {
      id: guid(),
      title: $$('#title').val(),
      date: $$('#date').val(),
      type: $$('#type').val(),
      length: $$('#length').val()
    }
    addWorkout(data);
  });

})

function createDatabase() {
  db.transaction(createTable,
    //error function
    //tx = transaction
    function(tx, err) {
      alert ('DB error ' + err);
    },
    //succes
    function () {
      // console.log('Database and table created...');
  });
}


function createTable(tx) {
  //drop table syntax
  //tx.executeSql('DROP TABLE IF EXISTS workouts');
   tx.executeSql('CREATE TABLE IF NOT EXISTS workouts (id unique, title, date, type, length)');
}

//code snippet taken from stackoverflow
function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

//store workouts in database
function addWorkout(workout){
  db.transaction(function (tx) {
    tx.executeSql('INSERT INTO workouts (id, title, date, type, length)  VALUES("'+workout.id+'","'+workout.title+'","'+workout.date+'","'+workout.type+'","'+workout.length+'")');
  },
  //error
  function (tx, err) {
    //console.log(err + ' ' + tx.message);
  },
  //success
  function () {
      window.location.href = 'index.html';
  });
}

//get all the pre-existing workouts from db
function getWorkouts() {
  //[] is set to empty because we are not providing any options to the query
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM workouts ORDER BY date DESC', [],
    //success
    function (tx, results) {
      var len = results.rows.length;
      //console.log('Workouts table: ' +len+ ' rows found');
      for (var i = 0; i < len; i++) {
        $$('#workout-list').append(`
          <li class="swipeout remove-callback" id="${results.rows.item(i).id}"> <a href="details.html?id=${results.rows.item(i).id}" class="item-link swipeout-content item-content">
            <div class='item-inner'>
              <div class="item-title">${results.rows.item(i).title}</div>
              <div class="item-after">${results.rows.item(i).date}</div>
            </div>
          </a>
          <div class="swipeout-actions-right">
            <a href="#" class="swipeout-delete">Delete</a>
          </div>
          </li>
          `);
      }
    },
    //errror
    function () {

    });
  });
}

//delete the particular workout using its ID
function deleteWorkout(id) {
  db.transaction(function(tx) {
    tx.executeSql('DELETE FROM workouts WHERE id ="'+id+'"');
  },
  //error
  function (err) {
    //console.log(err + ' '+ tx.message);
  },
  //success
  function () {
    //console.log('workout Deleted');
  });
}
