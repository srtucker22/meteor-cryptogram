var spawn = Npm.require('child_process').spawn;
var Future = Npm.require('fibers/future');
var readline = Npm.require('readline');

Meteor.methods({
  updateGuess: function(guessId, statusObject){
    check(guessId, String);
    console.log(guessId);

    var alphabet = 'abcdefghijklmnopqrstuvwxyz';
    var cipherMatch = _.object(_.map(alphabet, function(l){
      return [l,String];
    }));

    check(statusObject, {
      status: Match.OneOf(String, undefined, null),
      cipher: Match.OneOf(cipherMatch, undefined, null),
      cost: Match.OneOf(Number, undefined, null),
      guess: Match.OneOf(String, undefined, null),
      temperature: Match.OneOf(Number, undefined, null)
    });

    if(Roles.userIsInRole(this.userId, ['admin'])){
      Guesses.update({_id: guessId}, {$set: {status: statusObject}});
    }
  },

  // doesn't work when deployed to cryptograms.meteor.com because there is no python on the machine and no directory available
  localPythonSolver: function(guessId) {
    check(guessId, String);
    
    log.info('solving ', guessId);
    
    this.unblock();

    var simulated_annealing;

    // kill the task if the user closes the tab
    this.connection.onClose(function(){
      if(simulated_annealing){
        simulated_annealing.kill();
      }
      return;
    });

    if(!guessId)
      throw new Meteor.Error("no data passed");

    var guess = Guesses.findOne({_id: guessId});

    // end the job if the user changes their mind or whatever
    Guesses.find(guessId).observeChanges({
      added: function(id, fields){
        if(fields.kill){
          if(simulated_annealing){
            simulated_annealing.stdin.pause();
            simulated_annealing.kill();
          }
          return;
        }
      },
      changed: function(id, fields){
        if(fields.kill){
          if(simulated_annealing){
            simulated_annealing.stdin.pause();
            simulated_annealing.kill();
          }
          return;
        }
      }
    });

    if(!guess)
      throw new Meteor.Error("no guess found");

    // get the base path
    var base = process.env.PWD;

    var fut = new Future();

    // use spawn to get the stream as it flows
    simulated_annealing = spawn('python', [base  + '/public/scripts/simulated_annealing.py', base + '/public/scripts', guess.puzzle, '-u']);
    
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
            log.info(data.toString());
            log.error(err.toString());
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
        log.error(err.toString());
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
          log.error('no final guess');
          fut.throw(new Meteor.Error('no final guess'));
          returned = true;
        }
      }
    }));

    return fut.wait();
  },

  // doesn't work when deployed to cryptograms.meteor.com because ddp keeps changing
  herokuFlaskSolver: function(guessId){
    check(guessId, String);
    
    this.unblock();

    HTTP.call('POST', 'https://gentle-atoll-5114.herokuapp.com/solve', {params: {id: guessId}}, function(callback){
      log.info(callback);
    });
  },
});