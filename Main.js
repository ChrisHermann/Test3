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
      if ($(this).width()>CrateWidth) CrateWidth=$(this).width();
      $(this).remove();
      ++Loaded;
      if (Loaded == Images)
      {
        CreateLevel();
        Started = true;
        Crates[FullCrate].Open();
      }
    });
  }
  $("#Test_0").attr('src','./FlamingoBoxBack.png');
  $("#Test_1").attr('src','./FlamingoBoxKids.png');
  $("#Test_2").attr('src','./FlamingoBoxTop.png');
  $("#Test_3").attr('src','./FlamingoBoxFront.png');
  
  
  $("#MessageHUD").hide();
  $("#BlurEffect").hide();
  $("#MessageButton").hide();
  
  
  CreateLevel = function(){
    ++Level;
    TurnsThisLevel=Level+1;
    SpeedThisLevel=Math.min(2.5/(Level+1));
    CratesThisLevel=Math.min(5,3+Math.floor(Level/4));
    for(i=0; i<CratesThisLevel; ++i)
    {
      if ($("#Crate_"+i).length==0)
      {
        $("#Crates").append('<div id="Crate_'+i+'" class="CrateDiv"><img id="ImgCrateB_'+i+'" src="./FlamingoBoxBack.png" Number="1" class="crate" draggable="false"/><img id="ImgCrateK_'+i+'" src="./FlamingoBoxKids.png" Number="1" class="crate" draggable="false"/><img id="ImgCrateF_'+i+'" src="./FlamingoBoxFront.png" Number="1" class="crate" draggable="false"/><img id="ImgCrateT_'+i+'" src="./FlamingoBoxTop.png" Number="1" class="crate" draggable="false"/></div>');
        
        Crates[i]=$("#Crate_"+i);
        Crates[i].css({left: 200*(i-(CratesThisLevel/2-0.5))+$("#HustlerGamePlayground").width()/2 - CrateWidth/2, top: 400});
        Crates[i].css("position", "absolute");
        CrateToSort = new Array();
        for(j=0; j<i; ++j)
        {
          CrateToSort[j] = {number: j, x: Crates[j].offset().left};
        }
        CrateToSort.sort(CustomSort);
        if (i==CratesThisLevel-1)
        for(j=0; j<i; ++j)
        {
          Crates[CrateToSort[j].number].animate({left: 200*(j-(CratesThisLevel/2-0.5))+$("#HustlerGamePlayground").width()/2 - CrateWidth/2, top: 400}, {duration: 500});
        }
        Crates[i].attr('number',i);
        Crates[i].click(function(e){
          if (Turning==false && !ShowingMessage && !Paused) {
            if (FullCrate==$(this).attr('number'))
              Win($(this).attr('number'));
            else
              Lose($(this).attr('number'));
          }
        });
        
        if (i==FullCrate)
          $("#ImgCrateK_"+i).css({top: 40});
        else
          $("#ImgCrateK_"+i).css({top: 40, visibility:'hidden'});
        
        Crates[i].Open = function() {
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
          
          
          
          Paused=true;
        }
        
        
        Crates[i].OpenFalse = function() {
          $("#ImgCrateT_"+$(this).attr('number')).animate({ top: -90},{
          complete: function()
          {
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
  
  
  Lose = function(BoxID){
    Crates[BoxID].OpenFalse();
  }
  
  Win = function(BoxID){
    Crates[BoxID].Open();
    CreateLevel();
  }
  
  function sign(x) { return x ? x < 0 ? -1 : 1 : 0; }
  
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
  
  $("#MessageButton").click(function(e) { UnshowMessage() });
  
  
  Step = function(){
    if (Started)
    {
      //Calcualte how many miliseconds passed since last frame, to get smoother animations.
      Now = new Date().getTime();
      Delta = Now - Then;
      if (!ShowingMessage && !Paused)
      {
        if (Lost) 
          RestartGame();
        if (Turning==false && TurnsThisLevel>0)
        {
          $(".CrateDiv").css('zIndex',2);
          var CurrentCrates=[].concat(Crates);
          var n = Math.floor(Math.random()*CurrentCrates.length);
          Crate1 = CurrentCrates[n];
          CurrentCrates.splice(n,1);
          Crate2 = CurrentCrates[Math.floor(Math.random()*CurrentCrates.length)];
          
          
          Crate1.Desto=Crate2.position().left;
          Crate1.css('zIndex',3);
          Crate2.Desto=Crate1.position().left;
          Crate2.css('zIndex',1);
          PathPercent=0;
          
          
          Turning=true;
        }
        else
        {
          PathPercent+=Delta*(1/SpeedThisLevel)/1000
          if (PathPercent <= 1)
            Crate1.css({left: Crate2.Desto + (Crate1.Desto - Crate2.Desto)*PathPercent, top: 400+ Math.sin(PathPercent*Math.PI)*Math.min(Math.abs(Crate2.Desto - Crate1.Desto),500)*0.3 });
          if (PathPercent <= 1)
            Crate2.css({left: Crate1.Desto + (Crate2.Desto - Crate1.Desto)*PathPercent, top: 400- Math.sin(PathPercent*Math.PI)*Math.min(Math.abs(Crate2.Desto - Crate1.Desto),500)*0.3 });
            
            if (PathPercent >= 1){
              Crate1.css({left: Crate1.Desto,top: 400});
              Crate2.css({left: Crate2.Desto,top: 400});
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
