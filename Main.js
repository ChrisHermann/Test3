/**
* @file
* The this file is main javascript file
*/

var REFRESH_RATE = 30;

/**
* This game is purely made in the DOM and as such does not use canvas at all.
*/

$(function(){

/**
   * Custom sorting function, so the array knows to sort based on an attribute.
   * @param a
   *   object a to be sorted.
   * @param b
   *   object b to be sorted.
   */
  function CustomSort(a,b) {
    return(a.x-b.x);
  }
  
  //Initiating variables.
  var Level=2;
  var FullCrate=0;
  var TurnsThisLevel=8;
  var SpeedThisLevel=0.2;
  var CratesThisLevel=5;
  var CrateWidth = 0;
  var Delta = 0;
  var Then = new Date().getTime();
  var Turning = false;
  var Crates = new Array();
  var ShowingMessage = false;
  var Paused = false;
  var Lost=false;
  var Started = false;
  var Loaded = 0;
  var Images = 4;
  
  //Initiate Loading scripts
  for (i=0; i<Images; ++i)
  {
    //Append a test image for each image we need loaded, this way we can pre-buffer them.
    $("#HustlerGamePlayground").append("<img id='Test_"+i+"' class='crate'  /img>");
    //Hide them since they should not be seen.
    $("#Test_"+i).hide();
    $("#Test_"+i).load(function() {
      //On Load, if we are the widest object, save out width, which will be used for calculations later on.
      if ($(this).width()>CrateWidth) CrateWidth=$(this).width();
      //We are no longer needed
      $(this).remove();
      ++Loaded;
      //If all images has been loaded.
      if (Loaded == Images)
      {
        //Start the game and create the first level.
        CreateLevel();
        Started = true;
        Crates[FullCrate].Open();
      }
    });
  }
  //Assign the actual images to be loaded.
  $("#Test_0").attr('src','./FlamingoBoxBack.png');
  $("#Test_1").attr('src','./FlamingoBoxKids.png');
  $("#Test_2").attr('src','./FlamingoBoxTop.png');
  $("#Test_3").attr('src','./FlamingoBoxFront.png');
  
  //Hide the divs that are only there for later use.
  $("#MessageHUD").hide();
  $("#BlurEffect").hide();
  $("#MessageButton").hide();
  
  //A function to create and set up hte next level
  CreateLevel = function(){
    ++Level;
    //Update the levelHUD.
    $("#LevelHUD").html("<p>RUNDE: "+Level+"</p>");
    //Calculate how many turns, boxes and how much speed we need this level. Adjusting these three lines will change
    //The diffculty of the game.
    TurnsThisLevel=Level+1;
    SpeedThisLevel=Math.min(2.5/(Level+1));
    CratesThisLevel=Math.min(5,3+Math.floor(Level/4));
    //Run this script for all the crates this level.
    for(i=0; i<CratesThisLevel; ++i)
    {
      //If the crate does not already exist.
      if ($("#Crate_"+i).length==0)
      {
        //Append a bunch of images in a div, that together creates the crate.
        $("#Crates").append('<div id="Crate_'+i+'" class="CrateDiv"><img id="ImgCrateB_'+i+'" src="./FlamingoBoxBack.png" Number="1" class="crate" draggable="false"/><img id="ImgCrateK_'+i+'" src="./FlamingoBoxKids.png" Number="1" class="crate" draggable="false"/><img id="ImgCrateF_'+i+'" src="./FlamingoBoxFront.png" Number="1" class="crate" draggable="false"/><img id="ImgCrateT_'+i+'" src="./FlamingoBoxTop.png" Number="1" class="crate" draggable="false"/></div>');
        
        //Add it to the array, and apply the needed css.
        Crates[i]=$("#Crate_"+i);
        Crates[i].css({left: 200*(i-(CratesThisLevel/2-0.5))+$("#HustlerGamePlayground").width()/2 - CrateWidth/2, top: 400});
        Crates[i].css("position", "absolute");
        //Create an array to sort the crates based on precision.
        CrateToSort = new Array();
        for(j=0; j<i; ++j)
        {
          CrateToSort[j] = {number: j, x: Crates[j].offset().left};
        }
        CrateToSort.sort(CustomSort);
        //Apply it only the laststep of the loop (No reason to do it each step really.
        if (i==CratesThisLevel-1)
        for(j=0; j<i; ++j)
        {
          //Animate the crates into a position, this is to create a smooth transition when more crates arrive.
          Crates[CrateToSort[j].number].animate({left: 200*(j-(CratesThisLevel/2-0.5))+$("#HustlerGamePlayground").width()/2 - CrateWidth/2, top: 400}, {duration: 500});
        }
        //Give each crate a reference number. and a click event, that checks if it's the right crate, if it is run Win(), if not run Lose().
        Crates[i].attr('number',i);
        Crates[i].click(function(e){
          if (Turning==false && !ShowingMessage && !Paused) {
            if (FullCrate==$(this).attr('number'))
              Win($(this).attr('number'));
            else
              Lose($(this).attr('number'));
          }
        });
        
        //Apply css for the children in the crates.
        if (i==FullCrate)
          $("#ImgCrateK_"+i).css({top: 40});
        else
          $("#ImgCrateK_"+i).css({top: 40, visibility:'hidden'});
        
        //Open function, call this function to run hte opening animation of a crate.
        Crates[i].Open = function() {
          //A lot of animations in animations essentially, no reason to explain them all.
          $("#ImgCrateT_"+$(this).attr('number')).animate({ top: -90},{
          complete: function()
          {
            $("#ImgCrateK_"+$(this).parent().attr('number')).animate({ top: 3},{
            complete: function()
            {
              $(this).animate({ top: 3},{
              complete: function()
              {
                $(this).animate({ top: 40},{
                complete: function()
                {
                  $("#ImgCrateT_"+$(this).parent().attr('number')).animate({ top: 0},{
                  complete: function()
                  {
                    Paused=false;
                  },  duration: 500},'linear');
                },  duration: 150},'easeOutQuint');
              },  duration: 300},'linear');
            },  duration: 150},'easeInQuint');
          },  duration: 500},'linear');
          
          
          //Pause the game, it will be unpaused once the animation is done anyway.
          Paused=true;
        }
        
        //The function to run when opening a wrong crate.
        Crates[i].OpenFalse = function() {
          //Run a brief animation.
          $("#ImgCrateT_"+$(this).attr('number')).animate({ top: -90},{
          complete: function()
          {
            //Show a message and set the game up for restart once the message is done.
            ShowMessage("Flot klaret, du kom til bane "+Level, "Prøv Igen");
            Lost=true;
            Paused=false;
            
            Crates[FullCrate].Open();
          },  duration: 1000},'linear');
          
          Paused=true;
        }
        if (Level!=1) $(Crates[i]).fadeIn();
      }
      
      
      
    }
  }
  
  
  
  
  //Temp debug stuff
  document.body.style.overflow = "hidden";
  PLAYGROUND_WIDTH = $("#HustlerGamePlayground").width();
  PLAYGROUND_HEIGHT = $("#HustlerGamePlayground").height();
  
  //Sets up the main loop to be runnable.
  (function() {
    var onEachFrame;
    if (window.webkitRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); webkitRequestAnimationFrame(_cb); }
      _cb();
    };
    } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); mozRequestAnimationFrame(_cb); }
      _cb();
    };
    } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
    }
    window.onEachFrame = onEachFrame;
  })();
  
  //Run this when you lose a game
  Lose = function(BoxID){
    Crates[BoxID].OpenFalse();
  }
  
  //Run this when you win a game.
  Win = function(BoxID){
    Crates[BoxID].Open();
    CreateLevel();
  }
  
  //Restart the game.
  RestartGame = function(){
      $(".CrateDiv").remove();
      Level=0;
      Turning = false;
      Crates = new Array();
      CreateLevel();
      Crates[FullCrate].Open();
      Lost=false;
  }
  
  
  /**
  * This function shows a message, with the proper css.
  *
  * @param string Message
  * The message for the user
  *
  * @param string ButtonMessage
  * The text on the button
  */
  function ShowMessage(Message, ButtonMessage) {
    //Tell the game it is currently showing a message to pseudo-pause it.
    ShowingMessage = true;
    
    //Append the needed containers.
    $("#MessageHUD").show();
    $("#BlurEffect").show();
    $("#MessageButton").show();
    $("#MessageButton").attr('value', ButtonMessage);
    
    
    Current = $("#MessageText");
    //Apply the string to the div, scale it, and then recenter it.
    Current.html(Message);
  }

  /**
  * Unshows the message, basicly, this should only be called by the Ok button.
  */
  function UnshowMessage(Message) {
    ShowingMessage = false;
    
    $("#MessageHUD").hide();
    $("#BlurEffect").hide();
    
  }
  
  //Assign the unshow message function to the right button.
  $("#MessageButton").click(function(e) { UnshowMessage() });
  
  //The actual step event.
  Step = function(){
    //If the game is started.
    if (Started)
    {
      //Calcualte how many miliseconds passed since last frame, to get smoother animations.
      Now = new Date().getTime();
      Delta = Now - Then;
      //If the game is not paused and not showing a message
      if (!ShowingMessage && !Paused)
      {
        //If the game is lost, restart it.
        if (Lost) 
          RestartGame();
        
        //If we are not currently turning, and we have any turns left
        if (Turning==false && TurnsThisLevel>0)
        {
          //Set all crates to a neutral z-index.
          $(".CrateDiv").css('zIndex',2);
          
          //Choose two random crates, avoid while-stuck by using an array.
          var CurrentCrates=[].concat(Crates);
          var n = Math.floor(Math.random()*CurrentCrates.length);
          Crate1 = CurrentCrates[n];
          CurrentCrates.splice(n,1);
          Crate2 = CurrentCrates[Math.floor(Math.random()*CurrentCrates.length)];
          
          //Tell the crates which destinations they have to to get to, and set their z-index
          //so that it looks like they are behind or in front of the other crates.
          Crate1.Desto=Crate2.position().left;
          Crate1.css('zIndex',3);
          Crate2.Desto=Crate1.position().left;
          Crate2.css('zIndex',1);
          PathPercent=0;
          
          //Tell the game we are currently turning.
          Turning=true;
        }
        else
        {
          //First add the time that has passed to the delta-time.
          PathPercent+=Delta*(1/SpeedThisLevel)/1000
          //The snap the cratets to the position along their route that matches the current time passed.
          if (PathPercent <= 1)
            Crate1.css({left: Crate2.Desto + (Crate1.Desto - Crate2.Desto)*PathPercent, top: 400+ Math.sin(PathPercent*Math.PI)*Math.min(Math.abs(Crate2.Desto - Crate1.Desto),500)*0.3 });
          if (PathPercent <= 1)
            Crate2.css({left: Crate1.Desto + (Crate2.Desto - Crate1.Desto)*PathPercent, top: 400- Math.sin(PathPercent*Math.PI)*Math.min(Math.abs(Crate2.Desto - Crate1.Desto),500)*0.3 });
          
          //If the animation should be done, snap them to their final destination before proceeding to avoid tearing.
          if (PathPercent >= 1){
            Crate1.css({left: Crate1.Desto,top: 400});
            Crate2.css({left: Crate2.Desto,top: 400});
            //We are no longer turning, and substract one from turns we have left this level.
            Turning=false;
            --TurnsThisLevel;
          }
        }
      }
      Then = Now;
    }
  }
  
  //Starts the main loop
  window.onEachFrame(Step);

  /**
  * This function is used for the loading spinner.
  * We have little idea how it works.
  */
  $.fn.spin = function(opts) {
  this.each(function() {
    var $this = $(this),
    spinner = $this.data('spinner');

    if (spinner) spinner.stop();
    if (opts !== false) {
    opts = $.extend({color: $this.css('color')}, opts);
    spinner = new Spinner(opts).spin(this);
    $this.data('spinner', spinner);
    }
    });
    return this;
  };
  $(function() {
    $(".spinner-link").click(function(e) {
      e.preventDefault();
      $(this).hide();
      var opts = {
      lines: 12, // The number of lines to draw
      length: 7, // The length of each line
      width: 5, // The line thickness
      radius: 10, // The radius of the inner circle
      color: '#fff', // #rbg or #rrggbb
      speed: 1, // Rounds per second
      trail: 66, // Afterglow percentage
      shadow: true // Whether to render a shadow
      };
      $("#spin").show().spin(opts);

    });
  });
});
