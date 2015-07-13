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
      $scope.tansitionColor = "neutral";
      $scope.shuffledWord = "";
      $scope.userWord = ""; //what the user types
      $scope.usedLetters = [];
      $scope.timer = 100;
      $scope.score = 0;
      $scope.correct = 0;


      $scope.getWord = function(){
        var path = "http://api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=adverb&excludePartOfSpeech=verb&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=8&api_key=a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5";
        $http.get(path).then($scope.onGetWord);
      };

      $scope.onGetWord = function(response){
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
            $scope.letters = [];
            $scope.message = "";
            alert("time is up, your score: " +$scope.score);
            return;
        }
        $scope.timer--;
        mytimeout = $timeout($scope.onTimeout, 1000);
      };

      //when wrong answer
      $scope.onTransitionWrongTimeout = function(){
        $scope.tansitionColor = "neutral";
        $scope.userWord = "";
        $scope.message = "";
        for(var i in $scope.letters){
          $scope.letters[i].color = "unused";
          $scope.letters[i].used = false;
        }
      };
      //when right answer
      $scope.onTransitionRightTimeout = function(){
        $scope.score += 5;
        $scope.correct++;
        $scope.tansitionColor = "neutral";
        $scope.userWord = "";
        $scope.message = "";
        $scope.getWord();
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
      //catches what the user is typing
      $scope.type = function(e){
        //if it's a backspace
        if(e.keyCode === 8){
          var temp = $scope.usedLetters.pop();
          for(var i in $scope.letters){
            //if it is the letter and it hasnt been used
            if($scope.letters[i].letter === temp && ($scope.letters[i].used === true)){
              $scope.letters[i].used = false;
              $scope.letters[i].color = "unused";
              //delete last char
              $scope.userWord = $scope.userWord.substring(0, $scope.userWord.length - 1);
              break;
            }
          }
          //prevents default use of backspace for the browser
          e.preventDefault();
        }
        else{
          var letter = String.fromCharCode(e.keyCode).toLowerCase();
          var index = $scope.shuffledWord.indexOf(letter);
          //if character exist on word
          if(index > -1){
            for(var j in $scope.letters){
              //if the letter is found and it hasn't been used
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
          //same or it's anagram
          if($scope.retrivedWord === $scope.userWord || reverse === $scope.userWord){
            $scope.message = "correct";
            $scope.tansitionColor = "correct";
            $scope.transitionTimeout = $timeout($scope.onTransitionRightTimeout, 3000);
          }
          //wrong
          else{
            $scope.tansitionColor = "incorrect";
            $scope.message = "incorrect";
            $scope.transitionTimeout = $timeout($scope.onTransitionWrongTimeout, 3000);
          }
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