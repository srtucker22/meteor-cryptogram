var spawn = Npm.require('child_process').spawn;
var Future = Npm.require('fibers/future');
var readline = Npm.require('readline');

Meteor.methods({

  simulatedAnnealing: function(guessId) {
    check(guessId, String);
    
    this.unblock();

    var simulated_annealing;

    // kill the task if the user closes the tab
    this.connection.onClose(function(){
      if(simulated_annealing){
        simulated_annealing.kill();
        return;
      }
    });

    if(!guessId)
      throw new Meteor.Error("no data passed");

    var guess = Guesses.findOne({_id: guessId});

    // end the job if the user changes their mind or whatever
    Guesses.find(guessId).observeChanges({
      added: function(id, fields){
        console.log(id);
        console.log(fields);
      },
      changed: function(id, fields){
        console.log('changed', id);
        console.log('changed', fields);
      }
    });

    if(!guess)
      throw new Meteor.Error("no guess found");

    // get the base path
    var base = process.env.PWD;

    var fut = new Future();

    // use spawn to get the stream as it flows
    simulated_annealing = spawn('python', [base  + '/.scripts/simulated_annealing.py', base + '/.scripts', guess.puzzle, '-u']);
    
    var statusObject;

    var returned = false;

    readline.createInterface({
      input     : simulated_annealing.stdout,
      terminal  : false
    }).on('line', Meteor.bindEnvironment(function(data) {
      if(!returned){
        try{
          statusObject = JSON.parse(data.toString());
          Guesses.update({_id: guessId}, {$set: {status: statusObject}});
        } catch(err){
          if(!returned){
            console.log(data.toString());
            console.log(err.toString());
            simulated_annealing.stdin.pause();
            simulated_annealing.kill();
            fut.throw(new Meteor.Error(err.toString()));
            returned = true;
          }
        }
      }
    }));

    simulated_annealing.stderr.on('data', Meteor.bindEnvironment(function (err) {
      if(!returned){
        console.log(err.toString());
        simulated_annealing.stdin.pause();
        simulated_annealing.kill();
        fut.throw(new Meteor.Error(err.toString()));
        returned = true;
      }
    }));

    simulated_annealing.on('close', Meteor.bindEnvironment(function(data) {
      if(statusObject && statusObject.status === 'final guess')
        fut.return(Guesses.findOne(guessId));
      else{
        if(!returned){
          console.log('no final guess');
          fut.throw(new Meteor.Error('no final guess'));
          returned = true;
        }
      }
    }));

    return fut.wait();
  },

});