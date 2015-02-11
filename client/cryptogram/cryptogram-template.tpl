<div class="text-left" recompile="settings.recompileBool" use-boolean>
  <div class="row cryptogram-line" ng-repeat="line in lines track by $index">
    <div class="col-xs-12" ng-show="puzzle">
      <cryptogram-letter ng-repeat="c in line track by $index" style="width: {{letterWidth}}%" letter="c" guess="code[c]" focus="focusLetter===c" is-error="invalidCharacters[code[c]]" count="letterIndexMap[c].length"></cryptogram-letter>
    </div>
    <div class="col-xs-12">
      <br>
    </div>
  </div>
  <div class="row text-uppercase text-center">
    <div class="col-xs-12">
      <p>letters remaining:</p>
    </div>
    <div class="col-xs-12 cryptogram-letters-remaining">
      <p>{{remainingLetters()}}</p>
    </div>
  </div>
</div>
<br />
