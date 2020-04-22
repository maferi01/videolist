/**
 *  Template for every File
 * @param {} data 
 */
function getTemplate(data) {

    const html = `<div class="wrapper-content" data-img="${data.image}">
        <div class="title">${data.title}</div>
        <time>${data.date}</time> 
        <span class="time">${data.duration}</span>
    </div>
    <div class="wrapper-action">
        <span class="ondas">
        <div class="audio-anim-frame">
            <div class="audio-anim-block first-block"></div>
            <div class="audio-anim-block second-block"></div>
            <div class="audio-anim-block third-block"></div>
            <div class="audio-anim-block first-block"></div>
            <div class="audio-anim-block second-block"></div>
            
        </div>
        </span>
        <span class="play">
            <div class="playaction action "><i class="fas fa-play-circle"></i></div>
            <div class="stopaction action"><i class="fas fa-stop-circle"></i></div>
        </span>
    </div>`;


    return html;
  }
  
  /**
   * Create elment DOM for sound File
   * @param {*} data 
   */
  function createElementItemPlayer(data, playCall) {
    const divItem = document.createElement("li");
    divItem.innerHTML = getTemplate(data);
    const play = divItem.querySelector(".playaction");
    const stop = divItem.querySelector(".stopaction");
    const time = divItem.querySelector(".time");
    stop.style.display = "none";
  
    data.howl = new Howl({
     // src: ["./audio/" + data.file + ".webm", "./audio/" + data.file + ".mp3"],
     src: [ data.file ],
     html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
      onplay: function () {
        // Display the duration.
      },
      onload: function () {
        const timeplay = data.howl.duration();
        console.log("duration",timeplay);
        time.textContent = (timeplay/60);
        data.duration= timeplay;
      },
  
      onend: function () {
        play.style.display = "block";
        stop.style.display = "none";
      },
    });
  
    play.addEventListener("click", function () {
      //alert('pulsado en'+data.title)
      data.howl.play();
      playCall(data)
      play.style.display = "none";
      stop.style.display = "block";
    });
  
    stop.addEventListener("click", function () {
      //alert('pulsado en'+data.title)
      data.howl.stop();
      play.style.display = "block";
      stop.style.display = "none";
    });
  
    return divItem;
  }
  
  
  /**
   * Create Player list from listplay  
   * @param {*} idContainer 
   * @param {*} listPlay 
   */
  function playerlist(idContainer,listPlay,playCall){
    const playerCont = document.getElementsByClassName(idContainer);
  
    listPlay.forEach(function (data) {
      playerCont[0].appendChild(createElementItemPlayer(data,playCall));
    });
    
  }  