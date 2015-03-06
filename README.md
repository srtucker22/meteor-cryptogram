# meteor-cryptogram
View the project at <a href="http://cryptograms.meteor.com">cryptograms.meteor.com</a>

Build and solve cryptograms, or have a robot do it for you!
Cryptobot is a project I put together in my spare time over a short vacation in Keystone, Colorado. Cryptobot currently uses simulated annealing to solve cryptograms to its best potential.

FE: angular-meteor

BE: meteor

## Code Example

If you wanna get straight to the simmulated annealing, you should either check out <a href="public/scripts/simulated_annealing.py">simulated_annealing.py</a> or <a href="server/startup/simulatedAnnealing.coffee"">simulatedAnnealing.coffee</a>
Simulated annealing methodology is explained in the 'about' section. I've tuned the algorithm to my liking -- for example, we only need 2000 characters to get 95% accuracy, so slice oversized cryptograms which will clog up the algorithm.

If you wanna get wrapped up in the cryptogram playing section it's right <a href="client/cryptogram">here</a>. 
It uses a complicated iso-scope directive, so you can only have 1 per page. 
The cool features here are intelligent compiling and responsive design. 
The cryptogram directive minimizes watchers and recompiles for fast loading and interaction with verbose cryptograms. 
It will only re-render when the cryptogram changes, or the screen is resized. 
Recompilation will change the letters per line depending on screen size with no word breaks.

## Motivation

I built this site on a whim while snowed-in in a cabin in Colorado. 
This site presented a bunch of fun little challenges. 
Simulated annealing turned out to be the easiest thing about this little app. 
The real challenge was baking Python code into Meteor via Node, having it stream data, and break nicely (yikes!). Even after that worked, Meteor's hosting won't run python scripts. So I built a Flask server on Heroku to run the simulated annealing and connected it to Meteor via DDP. But that didn't work in production either because Meteor's hosting has variable DDP connections! In the end, the version you're viewing doesn't even use Python, it uses Coffescript!

This site is also a first attempt at combining Meteor best-practices I've learned so far into one app. E.g. XSS protection via browser-policy and audit-argument-checks.

## To Do

-  Replace meteor-bower packages with custom packages to eliminate angular double-loading
-  Animations
-  Whatever else the people want

## Installation

Provide code examples and explanations of how to get the project.

## License

The MIT License

Copyright (c) 2015 Glipcode http://angularjs.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
