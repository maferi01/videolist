function VideoListInvers() {

  this.blankVideo={ src: ' http://127.0.0.1:8080/assets/videos/blank.mp4', type: 'video/mp4' };
  this.vidObj= null;
  this.videoActive= null;
  this.videoFirst= null
  this.info= {
    videoTag:null,
    small_max: 900,
    //medium_max:900,
    large_max: 2000,
    thumbs: {
      large: null,
      small: null,
    }
  };



  /**
   *  Template for every File
   * @param {} data
   */
  this.getTemplate = function (data) {
    var ht =
      ' <li>   <div class="card">' +
      ' <div class="card-content">' +
      '  <div class="content"> ' +
      '   <div class="name">' +
      data.name +
      "</div>" +
      '    <div class="time"> </div>' +
      '    <img src="" class="img-video-large"/>' +
      '    <img src="" class="img-video-small"/>' +
      '    <div class="content-active">' +
      '      <span class="repro">Reproduciendo</span>' +
      "    <div>" +
      "  </div>" +
      "</div>" +
      "</div>" +
      "</li> ";
    return ht;
  };

  /**
   * Create elment DOM for video File
   * @param {*} data
   */
  this.createElementItemPlayer = function (data) {
    var self=this;
    var divItem = document.createElement("div");
    divItem.innerHTML = self.getTemplate(data);
    var time = divItem.querySelector(".time");
    var imgLarge = divItem.querySelector(".img-video-large");
    var imgSmall = divItem.querySelector(".img-video-small");
    var content = divItem.querySelector(".content");
    var contentActive = divItem.querySelector(".content-active");

    if (!self.videoFirst) {
      self.videoFirst = {
        content: content,
      };
    }

    var timeVal;
    if (data.duration) {
      if (typeof data.duration == "string" && data.duration.includes(":")) {
        timeVal = data.duration;
      } else {
        timeVal = data.duration.toPrecision(3);
      }
      time.textContent = timeVal;
    }

    if (data.thumbs) {
      imgLarge.setAttribute("src", data.thumbs.large);
      imgSmall.setAttribute("src", data.thumbs.small);
    }
    if (data.thumbCanvas) {
      data.thumbCanvas.classList.add("canvasimg");
      content.appendChild(data.thumbCanvas);
    }

    var setActive = function () {
      // clean active video
      if (self.videoActive) {
        self.videoActive.contentActive.style.display = "none";
      }
      //set this active video
      contentActive.style.display = "block";
      self.videoActive = {
        contentActive: contentActive,
        data: data,
        resolutionActive: self.getResolution(),
      };
    };

    content.addEventListener("click", function () {
      self.loadvideo(data.sources[0], data.posters).then(function(){
        setActive();
      });
      
    });
    return divItem;
  };

  /**
   * Create Player Video list from listplay
   * @param {*} idContainer
   * @param {*} listPlay
   */
  this.playerVideolist = function (idContainer, listPlay, videojs, playCall) {
    var self=this;
    var playerData = { howCurrent: null };
    self.vidObj = videojs;

    var playerCont = document.getElementById(idContainer);

    listPlay.forEach(function (data) {
      playerCont.appendChild(
        self.createElementItemPlayer(data, playCall, playerData)
      );
    });

    // set first video
    self.videoFirst.content.click();

    window.addEventListener("resize", function () {
      if (
        self.videoActive &&
        self.videoActive.resolutionActive !==
          self.getResolution()
      ) {
        // cambio de resoluion devideo activo
        self.loadvideo(
          self.videoActive.data.sources[0],
          self.videoActive.data.posters
        );
        self.videoActive.resolutionActive = self.getResolution();
      }
    });
  };

  this.loadVideosList = function (colec, idPlayer, idList, infoGeneral) {
    var self=this;

   var player = videojs(idPlayer,{
   //   crossOrigin: "Anonymous"
       //  fluid:false, // videojs settings
        // controls:true,
  });

    var playerDom=document.getElementById(idPlayer);   

    var getvideoDom = playerDom.getElementsByTagName("video");
    var video = getvideoDom.item(0);
    self.info.videoTag=video;    

    var playerCont = document.getElementById(idList);
    var loading = document.createElement("div");
    playerCont.appendChild(loading);
    loading.textContent = "Loading Videos...";
    loading.style.fontSize = "2.5em";
    video.style.visibility = "hidden";

    if (infoGeneral && infoGeneral.thumbs) {
      self.info.thumbs = infoGeneral.thumbs;
    }

    return updateInfoColection(colec, player, self.info)
      .then(function (col) {
        video.style.visibility = "visible";
        loading.style.display = "none";
        self.playerVideolist(idList, col, player);
      })
      .catch(function (fromReject) {
        console.error(fromReject);
      });
  };

  
  
  this.preload=function(){
    var self=this;
  
    if(self.videoActive && self.videoActive.data.sources[0].type==='video/vimeo'){
      return new Promise(function (resolve, reject) {
        self.vidObj.one("loadedmetadata", function () {
          resolve()
        }
        )
        self.vidObj.poster('')
        self.vidObj.src(self.blankVideo);
         })
  
    }else{
      return promise('')
    }

        
  }
  
  
  
  this.loadvideo = function (src, posters) {
    var self=this;
    
   return self.preload().then(function(){
      if (posters) {
        if (self.getResolution() === "large") {
          self.vidObj.poster(posters.large);
        } else {
          self.vidObj.poster(posters.small);
        }
      } else {
        self.vidObj.poster("");
      }
        
        self.vidObj.src(src);
    })
  };

  this.getResolution = function () {
    var self=this;
    console.log("resolution avil", window.outerWidth);
    if (window.outerWidth > self.info.small_max) {
      return "large";
    } else {
      return "small";
    }
    ///console.log('resolution',screen.width)
  };
}


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
