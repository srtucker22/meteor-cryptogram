<br>
<div class="container">
  <div class="row">
    <h1 class="col-xs-12 text-center">Meteor-Cryptogram</h1>
  </div>
  <div class="row">
    <div class="col-xs-12 text-center" ng-show="!dashboardctrl.cryptogram" ng-click="dashboardctrl.getCryptogram()">
      <div class="btn btn-primary">play</div>
    </div>
  </div>
  <div class="row" ng-if="dashboardctrl.cryptogram">
    <div class="col-xs-12 text-center">
      <cryptogram puzzle="dashboardctrl.cryptogram.puzzle" answer="dashboardctrl.cryptogram"></cryptogram>
    </div>
    <div class="col-xs-12 text-center">
      <div class="btn btn-success" ng-click="dashboardctrl.submit()">submit</div>
      <div class="btn btn-warning" ng-click="dashboardctrl.hint()">hint</div>
      <div class="btn btn-danger" ng-click="dashboardctrl.giveUp()">give up</div>
    </div>
  </div>
</div>
<br>