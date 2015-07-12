var app = angular.module('ws', []);
app.controller('', [ '$scope',
    function ($scope) {
    }
]);

app.directive('scramble', function () {
    function linkingFunction(scope, element, attrs) {
      window.addEventListener("keydown", scope.type, false);
      scope.getWord();
      scope.setTimer();
    }
    function controller($scope, $timeout, $http) {

      $scope.shuffledWord = ""; //shuffled word
      $scope.userWord = ""; //apears on left
      $scope.tansitionColor = "neutral";
      $scope.score = 0;
      $scope.correct = 0;
      $scope.usedLetters = [];
      $scope.timer = 100;
      $scope.transitionTime = 2;

      $scope.getWord = function(){
        var path = "http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=adverb&excludePartOfSpeech=verb&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=8&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";
        $http.get(path).then($scope.onGetWord);
      };

      $scope.onGetWord = function(response){
        console.log(response.data.word);
        $scope.tansitionColor = "neutral";
        $scope.retrivedWord = response.data.word.toLowerCase();
        $scope.makeWordObject();
      };

      $scope.makeWordObject = function(){
        $scope.letters = [];
        $scope.shuffledWord = $scope.shuffle($scope.retrivedWord);

        for(var i in $scope.shuffledWord){
          $scope.letters.push({
            letter : $scope.shuffledWord[i],
            used : false,
            color : "unused",
          });
        }
      };

      $scope.setTimer = function(){
        $scope.mytimeout = $timeout($scope.onTimeout, 1000);
      };

      $scope.onTimeout = function() {
        if($scope.timer ===  0) {
            $timeout.cancel(mytimeout);
            $scope.userWord = "";
            $scope.letters = [{}];
            $scope.message = "";
            alert("time is up, your score:" +$scope.score);
            return;
        }
        $scope.timer--;
        mytimeout = $timeout($scope.onTimeout, 1000);
      };

      $scope.onTransitionTimeout = function(){
        if($scope.transitionTime ===  0) {
            $timeout.cancel(transitionTimeout);
            return;
        }
        $scope.transitionTime--;
        transitionTimeout = $timeout($scope.onTransitionTimeout, 1000);
      };
      //scrambles a word
      $scope.shuffle = function(string) {
        var parts = string.split('');
        for (var i = parts.length; i > 0;) {
          var random = parseInt(Math.random() * i);
          var temp = parts[--i];
          parts[i] = parts[random];
          parts[random] = temp;
        }
        return parts.join('');
      };
      //catches what the user typing
      $scope.type = function(e){
        //if it's a backspace
        if(e.keyCode === 8){
          var temp = $scope.usedLetters.pop();
          for(var i in $scope.letters){
            if($scope.letters[i].letter === temp && ($scope.letters[i].used === true)){
              $scope.letters[i].used = false;
              $scope.letters[i].color = "unused";
              $scope.userWord = $scope.userWord.substring(0, $scope.userWord.length - 1);
              break;
            }
          }
          e.preventDefault();
        }
        else{
          var letter =String.fromCharCode(e.keyCode).toLowerCase();
          var index = $scope.shuffledWord.indexOf(letter);
          if(index > -1){
            for(var j in $scope.letters){
              if(($scope.letters[j].letter === letter) && ($scope.letters[j].used === false)){
                $scope.letters[j].used = true;
                $scope.letters[j].color = "used";
                $scope.userWord += letter;
                $scope.usedLetters.push($scope.letters[j].letter);
                $scope.checkWord();
                break;
              }
            }
          }
        }
      };

      $scope.checkWord = function(){
        var reverse = $scope.userWord.split("").reverse().join("");
        //if all characters were used
        if($scope.userWord.length === $scope.retrivedWord.length){
          //same
          if($scope.retrivedWord === $scope.userWord ){
            $scope.tansitionColor = "correct";
            $scope.transitionTimeout = $timeout($scope.onTransitionTimeout, 1000);
            $scope.score += 5;
            $scope.correct++;
            $scope.message = "correct";
            $scope.userWord = "";
            $scope.getWord();

          }
          //anagram
          else if(reverse === $scope.userWord){
            $scope.tansitionColor = "correct";
            $scope.transitionTimeout = $timeout($scope.onTransitionTimeout, 1000);
            $scope.score += 5;
            $scope.correct++;
            $scope.message = "correct, it's a anagram of it";
            $scope.userWord = "";
            $scope.getWord();
          }
          //wrong
          else{
            $scope.tansitionColor = "incorrect";
            $scope.message = "incorrect";
            $scope.transitionTimeout = $timeout($scope.onTransitionTimeout, 1000);
            $scope.reset();
          }
        }
      };

      //resets from wrong answer
      $scope.reset = function(){
        $scope.tansitionColor = "neutral";
        $scope.userWord = "";
        for(var i in $scope.letters){
          $scope.letters[i].color = "unused";
          $scope.letters[i].used = false;
        }
      };
    }
    return {
        restrict: 'E',
        templateUrl:"scramble.html",
        scope: {},
        link: linkingFunction,
        controller: controller
    };
});