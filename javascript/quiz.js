var score = 0;
var mainStage = "#popop";
var correctSound = new Audio('/sounds/correct.wav');
var wrongSound = new Audio('/sounds/wrong.wav');
$(document).ready(function() {   
    var questionNumber = 0;
    var questionBank = new Array();
    var stage = "#questions";
    var questionLock = false;
    var buttonDisable = false;
    var numberOfQuestions;
    var running = true;
    var timer;
    var bar = new ldBar("#watermeterbar");
    var loseWater = 10;
    var gainWater = 5;
    var waterRate = 1;
    var correct = "#correct";
    
    $.ajax({
        dataType: "json",
        url: "../php/getQuestions.php"
    })
        .done(function(data) {

            //Timer functions
            function startTimer(duration) {
                timer = duration;
                var myTimer = setInterval(function () {//Interal timer
                    if(running){
                        timer-= waterRate; 
                    }
                    if(bar.value <= 0){
                        running = false;
                        bar.set(0);
                        clearInterval(myTimer);
                        endGame();
                    }}, 1000);
                    
                var updateTimerVisual = setInterval(function(){ //Display update (should be different from interal timer to preserve accuracy)
                    bar.set(timer);
                    if(bar.value <= 0){
                            running = false;
                            bar.set(0);
                            clearInterval(updateTimerVisual);}
                }, 200);
                     
            }
            
            //Correct Animation functions
            function correctAnimation(id) {
                $(correct).append('<img id="correctDrippy" src="../images/correct-drippy.png">');
                $(correct).fadeIn(500,"swing",function(){
                $(correct).fadeOut(500, "swing", function(){
                    $(correct).html("");
                });
                });
            }

            function correctStart(){
                correctAnimation("correct");
                clickDisabled = true;
            };
                
            //End Game function
            function endGame() {
                score = Math.round(score + (timer*0.5));   
                document.getElementById('questions').innerHTML = "<div id='endd'>Game Over!</div><div id = 'score'>Your score is "  + score + "<div class='form-group'><label for='usr'>Name:</label><input type='text' id = 'sendNames' class='form-control' placeholder = 'e.g. Jacob Smith' id='endgamename' maxlength='12' required></div><button type='button'  id = 'submitBut' onclick = 'sendName()' class='btn btn-info' value='Submit Button'>Submit</button><div id = 'share'><a class='twitter-share-button' onclick='window.open(\"https://twitter.com/intent/tweet?text=My%20new%20highscore%20is%20"+score+".%20How%20much%20can%20you%20get?%20https://waterqwiz.azurewebsites.net/\")'><img id = 'tweet' src = '../images/tweet-button.png'></a></div>";
            }
            
            //Set timer to low number to test if it works with endgame
            //start timer
            startTimer(100);         // set actual value
                    
            //Load question
            for (i = 0; i < data.length; i++) {
                questionBank[i] = new Array();
                questionBank[i][0] = data[i].question;
                questionBank[i][1] = data[i].answer;
                questionBank[i][2] = data[i].option1;
                questionBank[i][3] = data[i].option2;
                questionBank[i][4] = data[i].option3;
                questionBank[i][5] = data[i].drippyhint;
            }
                
            numberOfQuestions = questionBank.length;
            scrambleDatabase();
            displayQuestion();
            
            //Randomize questions from database
            function scrambleDatabase(){
                for(i = 0; i < 50; i++){ 
                    var rnd1 = Math.floor(Math.random() * questionBank.length);
                    var rnd2 = Math.floor(Math.random() * questionBank.length);
                    var temp = questionBank[rnd1];
                    questionBank[rnd1] = questionBank[rnd2];
                    questionBank[rnd2] = temp;
                }

            }
            //Display questions 
            function displayQuestion(){
                var rnd=Math.random()*4;
                rnd=Math.ceil(rnd);
                var q1;
                var q2;
                var q3;
                var q4;

                if(rnd==1){
                    q1=questionBank[questionNumber][1];
                    q2=questionBank[questionNumber][2];
                    q3=questionBank[questionNumber][3];
                    q4=questionBank[questionNumber][4];
                }
                if(rnd==2){
                    q2=questionBank[questionNumber][1];
                    q3=questionBank[questionNumber][2];
                    q1=questionBank[questionNumber][3];
                    q4=questionBank[questionNumber][4];
                }
                if(rnd==3){
                    q3=questionBank[questionNumber][1];
                    q1=questionBank[questionNumber][2];
                    q2=questionBank[questionNumber][3];
                    q4=questionBank[questionNumber][4];
                }
                if (rnd == 4) {
                    q4 = questionBank[questionNumber][1];
                    q1=questionBank[questionNumber][4];
                    q2=questionBank[questionNumber][2];
                    q3=questionBank[questionNumber][3];
                }
          
                $(stage).append('<div class="questionText">'+questionBank[questionNumber][0]+'</div><div><button type="button" id = "1" class="option btn btn-default btn-lg btn-quiz">'+q1+'</button></div><div><button type="button" id = "2" class=" option btn btn-default btn-lg btn-quiz">'+q2+'</button></div><div><button type="button" id = "3" class="option btn btn-default btn-lg btn-quiz">'+q3+'</button></div><div><button type="button" id = "4" class="option btn btn-default btn-lg btn-quiz">'+q4+'</button></div>');
                $(stage).css("right","-1000px");
                $(stage).animate({opacity: "1"}, {duration: 1000, queue: false});
                $(stage).animate({"right": "+=1000px"},"slow","swing");
                
                //Answer click response
                $('.option').click(function() {
                    if(questionLock==false){
                        questionLock=true;	
                        if(this.id==rnd){ //If answer is correct
                            correctStart();
                            correctSound.play();
                            $("#"+this.id+"").css('background-image', 'linear-gradient(to right, #006600 0%, #00FF00 51%, #00b200 100%)');
                            document.getElementById("totalScore").innerHTML = ++score; //increase score and update to html
                            timer = (timer+gainWater) > 100 ? 100 : (timer+gainWater); //Gain time
                            changeQuestion();
                        }
                        if(this.id!=rnd){//If answer is wrong
                            buttonDisable = true;
                            setTimeout(function(){buttonDisable = false;}, 500);
                            wrongSound.play();
                            running = false;
                            timer = (timer-loseWater) < 0 ? 0:(timer-loseWater); 
                            if(timer <=0){
                                endGame()
                            } else {
                            $("body").css('box-shadow', 'inset 0px 0px 400px 110px rgba(0, 0, 0, .7)');
                            $(".option").css('filter', 'brightness(80%)');
                            $("#"+this.id+"").css('background-image', 'linear-gradient(to right, #ff0000 0%, #ff4c4c 51%, #900 100%)');
                            $(mainStage).append('<div class = "modal-dialog" id="popup"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">Wrong!</h4></div><div class="modal-body">'+questionBank[questionNumber][5]+'</div><div class="modal-footer"><div class = "col-xs-5"><img id = "modal-drippy-wrong" src = "../images/wrong-drippy.png"></div><div class = "col-xs-7"><button type="button" id="next-question" class="btn btn-default btn-lg">Next</button></div></div>');
                            }}
                }});
            }
            
            //next button response
            $(document).on('click', '#next-question', function(){
                if(buttonDisable){
                    return;
                }
                running = true;
                changeQuestion();
                $("body").css('box-shadow', 'inset 0px 0px 400px 110px rgba(0, 0, 0, 0)');
            })
            
            //change question function
            function changeQuestion() { 
                document.getElementById('popop').innerHTML = "";
                questionNumber++;
                if(questionNumber<numberOfQuestions && running) {
                    $(stage).animate({opacity: "0"}, {duration: 300, queue: false});
                    $(stage).animate({right: "+=1000px"},"slow","swing",function(){
                        $(stage).empty();
                        displayQuestion();});
                    setTimeout(function(){questionLock = false;}, 300);
                } else {
                    running = false;
                    endGame();
                }
            }
        })
        
        //prompt before user leaves
        window.onbeforeunload = function(evt){
            if (typeof evt == 'undefined') {
                evt = window.event;
            }
            if (evt) {
                evt.returnValue = confirm("Are you sure you want to leave?");
            }
            return  evt.returnValue;
        };
});

//Submit user info
function sendName() {
    document.getElementById("submitBut").setAttribute('disabled',false);
    var name = document.getElementById("sendNames").value;
    if (name.length > 0 && name.length < 13) {
        $.ajax({
            type: "POST",
             url: "../php/addScore.php",
            data: {name : name, score : score}
        })
        .done(function(data) {
            $.ajax({
                dataType: "json",
                url: "../php/getLeaderboard.php"
            })
            .done(function(data) {
                var leaders = new Array();
                var count = 0;
                var code = "";

                for (i = 0; i < data.length; i++) {
                    leaders[i] = new Array();
                    leaders[i][0] = data[i].name;
                    leaders[i][1] = data[i].score;
                }

                displayLeaderboards();
                
                //display scores from leaderboard
                function displayLeaderboards() {
                    code += "<div class = 'table-responsive'><table class = 'table'><tr><th>#</th><th>NAME</th><th>SCORE</th></tr>";
                    for (i = 0; i < leaders.length && i < 5; i++) {
                        var currentNumb = i;
                        code += "<tr><th>";
                        code += "" + (currentNumb + 1) + "";
                        code += "</th><th>"; 
                        code += leaders[i][0]; 
                        code += "</th><th>"; 
                        code += leaders[i][1]; 
                        code += "</th></tr>";
                    }
                    code += "</table></div>";

                    for (i = 0; i < leaders.length; i++) {
                        if (leaders[i][0] == name) {
                            if (leaders[i][1] == score) {
                                code += "<div>Your Place:<div class = 'table-responsive'><table class = 'table'><tr><th>" + (i + 1) + "</th><th>" + leaders[i][0] + "</th><th>" + leaders[i][1] + "</th></tr></table></div></div>";
                                return;
                            }
                        }
                    } 
                }

                document.getElementById('popop').innerHTML = "";
                document.getElementById("howTo").setAttribute('disabled',false);
                $("body").css('box-shadow', 'inset 0px 0px 400px 110px rgba(0, 0, 0, .7)');
                $(mainStage).append('<div class = "modal-dialog" id="leaderboard-modal"><div class="modal-content"><div class="modal-header"><h4 class="modal-title">Leaderboard</h4></div><div id = "leaders" class="modal-body">There was an error loading the leaderboard. Sorry.</div><div class="modal-footer"><div class = "modal-footer-spacing"><div class = "col-xs-6"><img id = "modal-drippy" src = "../images/points-drippy.png"></div><div class = "col-xs-6"><button type="button" class="btn btn-danger" id = "endGameBTN" onclick = "location.href = \'../index.html\'" data-dismiss="modal">Close</button></div></div>');
                document.getElementById("leaders").innerHTML = code;
                    })
                .fail(function() {
                    alert( "error" );
                })
        })
    } else {    
        document.getElementById('questions').innerHTML = "<div id='endd'>Game Over!</div><div id = 'score'>Your score is "  + score + "<div class='form-group'><label for='usr'>Name:</label><input type='text' id = 'sendNames' class='form-control' placeholder = 'e.g. Jacob Smith' id='endgamename'></div><div id = 'lessChars'>Name cannot be blank and name should be 12 characters or less!</div><button type='button' id = 'submitBut' onclick = 'sendName()' class='btn btn-info' value='Submit Button'>Submit</button><div id = 'share'><a class='twitter-share-button' onclick='window.open(\"https://twitter.com/intent/tweet?text=My%20new%20highscore%20is%20"+score+".%20How%20much%20can%20you%20get?%20https://waterqwiz.azurewebsites.net/\")'><img id = 'tweet' src = '../images/tweet-button.png'></a></div>";
    }

}

