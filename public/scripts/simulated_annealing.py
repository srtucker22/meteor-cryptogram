from __future__ import division
import itertools
import random
import operator
import math
import copy
import os
import sys
import json

alphabet = 'abcdefghijklmnopqrstuvwxyz'
letters = alphabet + ' '

def get_ngram_frequencies(text, n, l=letters):
  ngrams = map(''.join, itertools.product(l, repeat=n))
  ngram_count = map(text.count, ngrams)
  return dict(zip(ngrams, [x/sum(ngram_count) for x in ngram_count]))

def cost(cipher_text):
  cipher_digram_freq = get_ngram_frequencies(cipher_text, 2)
  return sum([abs(cipher_digram_freq[x] - exp_digram_freq[x]) for x in exp_digram_freq.keys()])


def get_cipher_text(cipher, puzzle):
  return ''.join(map(lambda x: cipher.get(x, x), puzzle))


def update_status(updates):
  status_object.update(updates)
  print json.dumps(status_object)
  sys.stdout.flush()


# json object to display the status at each step in the process
status_object = {}


# iterations per temperature
iterations = 2000

# max characters in puzzle + last letters of a word
max_characters = 2000

# filename declaration and method running
filename = sys.argv[1] + '/moby_dick.txt'

# open the file and run the method
with open(filename, 'r') as f:

  # put the data in the string
  moby_dick = f.read()

  # get the sorted letter frequency for the training data
  letter_freq = sorted(get_ngram_frequencies(moby_dick, 1, alphabet).items(), key=operator.itemgetter(1), reverse=True)  # don't include spaces

  # get the digram frequency for the training data
  exp_digram_freq = get_ngram_frequencies(moby_dick, 2)

  # get the text and lowercase it
  full_puzzle = sys.argv[2].lower()

  # shorten the puzzle for faster iterations -- 1000 characters for now
  if len(full_puzzle) > max_characters:
    next_space = full_puzzle.find(' ', max_characters)
    puzzle = full_puzzle[:max_characters] + (full_puzzle[max_characters: next_space] if next_space > 0 else [])
  else:
    puzzle = full_puzzle

  # get the sorted letter frequency for the puzzle
  puzzle_letter_freq = sorted(get_ngram_frequencies(full_puzzle, 1, alphabet).items(), key=operator.itemgetter(1), reverse=True)
  
  # create a cipher based on most common letters in puzzle mapped to training letter frequency
  cipher = {puzzle_letter_freq[x][0] : letter_freq[x][0] for x in range(26)}
  cipher_text = get_cipher_text(cipher, puzzle)
  parent_cost = cost(cipher_text)

  best_cipher = copy.copy(cipher)
  best_cost = parent_cost

  update_status({
    'status': 'starting to solve the puzzle',
    'cipher': best_cipher,
    'cost': best_cost,
    'guess': get_cipher_text(best_cipher, full_puzzle)
  })

  t = 0.1
  while t > .001:
    for j in range(iterations):

      a = random.choice(alphabet)
      b = random.choice(alphabet)

      child_cipher = copy.copy(cipher)

      child_cipher[a], child_cipher[b] = child_cipher[b], child_cipher[a]
      child_cost = cost(get_cipher_text(child_cipher, puzzle))

      if child_cost < parent_cost:
        parent_cost = child_cost
        cipher = child_cipher
        if child_cost < best_cost:
          best_cipher = copy.copy(cipher)
          best_cost = child_cost
      else:
        r = random.random()
        p = math.e**((parent_cost - child_cost)/t)

        if p > r:
          parent_cost = child_cost
          cipher = child_cipher

    update_status({
      'status': 'solving the puzzle',
      'cipher': best_cipher,
      'cost': best_cost,
      'guess': get_cipher_text(best_cipher, full_puzzle),
      'temperature': t
    })

    t *= 2/3

  update_status({
    'status': 'final guess',
    'cipher': best_cipher,
    'cost': best_cost,
    'guess': get_cipher_text(best_cipher, full_puzzle),
    'temperature': t
  })
