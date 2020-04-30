var VideoListInvers = {
  getTemplate: getTemplate,
  createElementItemPlayer: createElementItemPlayer,
  playerVideolist: playerlist,
  loadvideo:loadvideo,
  getResolution:getResolution,
  vidObj:null,
  videoActive:null,
  info:{
    small_max:900,
    //medium_max:900,
    large_max:2000
  }
};

/**
 * Modelo de Video 
 * @param {el} data 
 */
// {
//   name: 'Disney\'s Oceans 1',
//   description: '',
//   duration: 0,
//   sources: [
//   { src: 'http://vjs.zencdn.net/v/oceans.mp4?2', type: 'video/mp4' },  
//   { src: 'http://vjs.zencdn.net/v/oceans.webm?2', type: 'video/webm' },
//   ,
   
//   ],
//   poster: 'http://media.w3.org/2010/05/sintel/poster.png',
//   posters:{
//      large: 'http://localhost:8080/assets/example.png',
//      medium: 'http://media.w3.org/2010/05/sintel/poster.png',
//      smmall: 'http://media.w3.org/2010/05/sintel/poster.png',
//   },
//   thumbs:{
//     large: 'http://localhost:8080/assets/example.png',
//     medium: 'http://media.w3.org/2010/05/sintel/poster.png',
//     smmall: 'http://media.w3.org/2010/05/sintel/poster.png',
//   },
// }


function loadvideo(src,posters){
  if(VideoListInvers.getResolution()==='large'){
    VideoListInvers.vidObj.poster(posters.large);
  }else{
    VideoListInvers.vidObj.poster(posters.small);
  }
  
  VideoListInvers.vidObj.src(src);
}



/**
 *  Template for every File
 * @param {} data
 */
function getTemplate(data) {
  const html = `<li>
<div class="card">
  <div class="card-content">
    <div class="content">
      <div class="name">${data.name}</div>
      <div class="time"> </div>

      <img src="" class="img-video-large"/>
      <img src="" class="img-video-small"/>

      <div class="content-active">
        <span class="repro">Reproduciendo</span>
      <div>
    </div>
  </div>
</div>
</li>`;
  return html;
}

/**
 * Create elment DOM for video File
 * @param {*} data
 */
function createElementItemPlayer(data, playCall, playerData) {
  const divItem = document.createElement("div");
  divItem.innerHTML = VideoListInvers.getTemplate(data);
  const time = divItem.querySelector(".time");
  const imgLarge = divItem.querySelector(".img-video-large");
  const imgSmall = divItem.querySelector(".img-video-small");
  const content = divItem.querySelector(".content");
  const contentActive = divItem.querySelector(".content-active");
  
  time.textContent = (data.duration).toPrecision(3);
  imgLarge.setAttribute('src',data.thumbs.large);
  imgSmall.setAttribute('src',data.thumbs.small);

  var setActive= function(){
    // clean active video
    if(VideoListInvers.videoActive){
      VideoListInvers.videoActive.contentActive.style.display = "none"
    }
    //set this active video
     contentActive.style.display = "block";   
     VideoListInvers.videoActive={
      contentActive:contentActive
     }
  }
    
  content.addEventListener("click", function () {
     VideoListInvers.loadvideo(data.sources[0],data.posters)
     setActive()
    
  });





  // stop.style.display = "none";

  // data.howl = new Howl({
  //  // src: ["./audio/" + data.file + ".webm", "./audio/" + data.file + ".mp3"],
  //  src: [ data.file ],
  //  html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
  //   onplay: function () {
  //     // Display the duration.
  //     play.style.display = "none";
  //     stop.style.display = "block";

  //     // add extra operations
  //     divItem.classList.add("active");

  //   },
  //   onload: function () {
  //     const timeplay = data.howl.duration();
  //     if(timeplay){
  //       const timeFormat= (timeplay/60).toPrecision(3)
  //       time.textContent = timeFormat;
  //       data.duration= timeFormat;
  //     }

  //   },

  //   onend: function () {
  //     play.style.display = "block";
  //     stop.style.display = "none";
  //   },

  //   onstop: function () {
  //     play.style.display = "block";
  //     stop.style.display = "none";

  //     // add extra operations
  //     divItem.classList.remove("active");
  //   },
  //});

  // play.addEventListener("click", function () {
  //   if (playerData.howCurrent) {
  //     playerData.howCurrent.stop();
  //   }
  //   data.howl.play();
  //   playerData.howCurrent = data.howl;
  //   playCall(data);
  // });

  // stop.addEventListener("click", function () {
  //   data.howl.stop();
  // });

  return divItem;
}

/**
 * Create Player Video list from listplay
 * @param {*} idContainer
 * @param {*} listPlay
 */
function playerlist(idContainer, listPlay,videojs, playCall) {
  const playerData = { howCurrent: null };
  VideoListInvers.vidObj=videojs;

  const playerCont = document.getElementById(idContainer);

  listPlay.forEach(function (data) {
    playerCont.appendChild(VideoListInvers.createElementItemPlayer(data, playCall, playerData));
  });
}


function getResolution(){
  console.log('resolution avil',window.outerWidth)
  if(window.outerWidth > VideoListInvers.info.small_max){
    return 'large';
  }else{
    return 'small'
  }
  ///console.log('resolution',screen.width)
  
}
