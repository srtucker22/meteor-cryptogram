<br>
<div class="container">
  <div class="row">
    <h1 class="col-xs-12 text-center">Meteor-Cryptogram</h1>
  </div>
  <div class="row">
    <div class="col-xs-12 text-center" ng-show="!dashboardctrl.cryptogram">
      <div class="btn btn-primary" ng-click="dashboardctrl.getCryptogram()">play</div>
    </div>
  </div>
  <div class="row" ng-if="dashboardctrl.cryptogram">
    <div class="col-xs-12 text-center">
      <cryptogram puzzle="dashboardctrl.cryptogram.puzzle" solution="data.currentSolution"></cryptogram>
    </div>
    <div class="col-xs-12 text-center" ng-hide="dashboardctrl.answer">
      <div class="btn btn-success" ng-click="dashboardctrl.submit()">submit</div>
      <div class="btn btn-warning" ng-disabled="!dashboardctrl.currentUser" ng-click="dashboardctrl.getHint()">hint<span class="badge">{{dashboardctrl.currentUser.cryptograms.current.hints}}</span></div>
      <div class="btn btn-danger" ng-click="dashboardctrl.giveUp()">give up</div>
    </div>
    <div class="col-xs-12 text-center" ng-hide="dashboardctrl.answer">
      <p ng-hide="dashboardctrl.currentUser">login to get hints</p>
    </div>
    <div class="col-xs-12 text-center" ng-show="dashboardctrl.solved">
      <h1 class="success">you solved the cryptogram!</h1>
    </div>
    <div class="col-xs-12 text-center" ng-show="dashboardctrl.answer">
      <div class="btn btn-primary" ng-click="dashboardctrl.getCryptogram()">new cryptogram</div>
    </div>
  </div>
</div>
<br>