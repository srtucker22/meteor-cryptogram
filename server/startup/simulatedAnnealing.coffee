# iterations per temperature
iterations = 2000

# max characters in puzzle + last letters of a word
maxCharacters = 2000


cartesianProduct = ->
  return _.reduceRight(arguments, (a,b) ->
    _.flatten(_.map(a,(x) -> _.map b, (y) -> x+y), true)
  , [ [] ])


occurrences = (string, subString, allowOverlapping = true) ->
  string+="" 
  subString+=""
  if subString.length <= 0 
    return string.length+1

  n=0 
  pos=0
  step = allowOverlapping ? 1: subString.length;

  while true
    pos=string.indexOf subString, pos
    if pos>=0 
      n++
      pos+=step 
    else break

  return n


getCipherText = (cipher, puzzle) ->
  answer = ((if _.has cipher, x then cipher[x] else x) for x in puzzle).join ""
  return answer


getFrequencies = (text, ngrams = digrams) ->
  ngramCounts = (occurrences text, ngram for ngram in ngrams)
  ngramTotal = ngramCounts.reduce (t, s) -> t + s
  return _.object ngrams, (count/ngramTotal for count in ngramCounts)


getSortedLetterFrequencies = (text) ->
  frequencies = getFrequencies text, alphabet
  return (elem.key for elem in _.sortBy (_.map frequencies, (v, k) -> return key: k, freq: v), 'freq')


cost = (cipherText) ->
  cipherDigramFrequency = getFrequencies cipherText, digrams
  return (_.map cipherDigramFrequency, (val, key) ->
    return Math.abs (val - expectedDigramFrequencies[key])).reduce (t,s) -> t + s


alphabet = 'abcdefghijklmnopqrstuvwxyz'
letters = alphabet + ' '
digrams = cartesianProduct letters, letters

# filename declaration and method running
filename = 'moby_dick.txt'

# read the file
mobyDick = Assets.getText filename

# get the expected letter and digram frequencies from moby dick
expectedDigramFrequencies = getFrequencies mobyDick, digrams
expectedSortedLetterFrequencies = getSortedLetterFrequencies mobyDick


Meteor.methods
  simulatedAnnealing: (guessId) ->
    check guessId, String

    this.unblock()

    guess = Guesses.findOne({_id: guessId})

    # end the job if the user changes their mind or whatever
    kill = false
    (Guesses.find guessId).observeChanges
      added: (id, fields) ->
        if fields.kill
          log.info 'killed ' + guessId
          kill = true
          return 'killed ' + guessId
      changed: (id, fields) ->
        if fields.kill
          log.info 'killed ' + guessId
          kill = true
          return 'killed ' + guessId

    this.connection.onClose () ->
      log.info 'killed ' + guessId
      kill = true
      return 'killed ' + guessId

    fullPuzzle = guess.puzzle.toLowerCase()

    # shorten the puzzle for faster iterations -- 2000 characters for now
    puzzle
    if fullPuzzle.length > maxCharacters
      nextSpace = fullPuzzle.indexOf ' ', maxCharacters
      puzzle = (fullPuzzle.substring 0, maxCharacters) + (if nextSpace > 0 then fullPuzzle.substring maxCharacters, nextSpace else "")
    else
      puzzle = fullPuzzle;

    # get the sorted letter frequency for the puzzle
    puzzleSortedLetterFrequencies = getSortedLetterFrequencies puzzle

    # create a cipher based on most common letters in puzzle mapped to training letter frequency
    cipher = _.object ([puzzleSortedLetterFrequencies[i], expectedSortedLetterFrequencies[i]] for i in [0..25])
    cipherText = getCipherText cipher, puzzle
    parentCost = cost cipherText

    bestCipher = _.clone cipher
    bestCost = parentCost

    # update the guess object
    Guesses.update {_id: guessId}, {$set: status: 
      'status': 'starting to solve the puzzle',
      'cipher': bestCipher,
      'cost': bestCost,
      'guess': getCipherText bestCipher, fullPuzzle
    }

    t = 0.1

    while t > .001 && !kill
      counter = 0
      for j in [1..iterations]

        # manually observe if kill has been issued otherwise this will run through all iterations before observeChanges
        if counter == iterations/10
          currentGuess = Guesses.findOne({_id: guessId})
          if currentGuess.kill
            kill = true
            return
          counter = 0

        a = _.sample alphabet
        b = _.sample alphabet

        childCipher = _.clone cipher

        # swap letters in the cipher
        temp = childCipher[a].slice(0)
        childCipher[a] = childCipher[b]
        childCipher[b] = temp

        childCost = cost getCipherText childCipher, puzzle

        if childCost < parentCost
          parentCost = childCost
          cipher = childCipher
          if childCost < bestCost
            bestCipher = _.clone cipher
            bestCost = childCost
        else
          r = Math.random()
          p = Math.pow Math.E, ((parentCost - childCost)/t)

          if p > r
            parentCost = childCost
            cipher = childCipher

        counter += 1

      Guesses.update {_id: guessId}, {$set: status: 
        'status': 'solving the puzzle',
        'cipher': bestCipher,
        'cost': bestCost,
        'guess': getCipherText bestCipher, fullPuzzle,
        'temperature' : t
      }

      t *= 2/3

    Guesses.update {_id: guessId}, {$set: status: 
      'status': 'final guess',
      'cipher': bestCipher,
      'cost': bestCost,
      'guess': getCipherText bestCipher, fullPuzzle,
      'temperature' : t
    }