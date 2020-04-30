

function getInfoVideo(src,player,model){

    return new Promise(function(resolve){
        
        // if (player.readyState() < 1) {
            // wait for loadedmetdata event
            player.one("loadedmetadata", function () {
                //   alert(player.duration());
                var dur= player.duration()
                var info={duration:null,canvas:null};
                info.duration=dur;
                if(!model.thumbs){
                  setTimeout(function(){
                    info.canvas=getImgVideoCanvas()
                    resolve(info)
                  },500) ;
                }else{
                  resolve(info)
                }
                  
                 
       
               });

             player.on('error', function(e) {
               console.error('error',src.src,e)
               resolve(0) })

        
        player.src(src);
        
       
    });


}


function getInfoTube(src,model){
  return new Promise(function(resolve,reject){
  //  var url= new URL(src.src);
    var keyTube='AIzaSyDwkQH4OOeYn27ZthmxO-_ZjJx3yNzGI4U';
    //var v=url.searchParams.get('v');
    var v=getParameterByName('v',src.src);
    console.log('parameter v',v);
   
    ajxJson('https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id='+v+'&key='+keyTube)
    .then(function(data){
            console.log('respond yputube',data)
            var info={duration:null,posters:null,thumbs:null};
            info.duration=data.items[0].contentDetails.duration.replace('PT','').replace('M',':').replace('S','')
            if(!model.posters){
              info.posters={
                large: getImgTube(v,'large'),
                small: getImgTube(v,'small')
              } 
            }
            if(!model.thumbs){
              info.thumbs={
                large: getImgTube(v,'large'),
                small: getImgTube(v,'small')
              } 
            }
            resolve(info);
           }).catch(function(fromReject) {
            console.error(fromReject);
            resolve({});
            })



  })
}

function getImgTube(idVideo,type){
  var urlImg='https://img.youtube.com/vi/' +idVideo;  
  if(type==='large'){
    return urlImg+'/0.jpg';
  }else{
    return urlImg+'/1.jpg';
  } 
}

function getImgVimeo(data,type){
  if(type==='large'){
    return data.pictures.sizes[2].link
  }else{
    return data.pictures.sizes[0].link
  } 
}

function getInfoVimeo(src,model){
    return new Promise(function(resolve){
      var keyVimeo='02013d39440018853077055dd7b6dd2a';  
      var v=src.src.replace('https://vimeo.com/','');
   
         ajxJson('https://api.vimeo.com/videos/'+v+'?access_token='+keyVimeo)
         .then(function(data){
          var info={duration:null,posters:null,thumbs:null};
            info.duration=data.duration;
            if(!model.posters){
              info.posters={
                large: getImgVimeo(data,'large'),
                small: getImgVimeo(data,'small')
              } 
            }
            if(!model.thumbs){
              info.thumbs={
                large: getImgVimeo(data,'large'),
                small: getImgVimeo(data,'small')
              } 
            }
            resolve(info);
                   
           }).catch(function(fromReject) {
            console.error(fromReject);
            resolve({});
            })
     

    })
  }
  

function updateTimeColection(colection,player){

  var getvideoDom=document.getElementsByTagName('video');
  var video=getvideoDom.item(0)

  video.style.visibility='hidden';

 let result = colection.reduce(function(accumulatorPromise, nextID)  {
    return accumulatorPromise.then(function()  {
      var source=nextID.sources[0];  
      if(source.type=== "video/mp4" || source.type=== "video/webm" || source.type=== "video/ogg")  
       return getInfoVideo(source,player,nextID).then(function(info){
        nextID.duration=info.duration;
        nextID.thumbCanvas=info.canvas;
       });
      else if(source.type=== "video/youtube"){
       return getInfoTube(source,nextID).then(function(info){
         nextID.duration=info.duration;
         nextID.thumbs=info.thumbs? info.thumbs: nextID.thumbs;
        }); 
      }else if(source.type=== "video/vimeo"){
        return getInfoVimeo(source,nextID).then(function(info){
          nextID.duration=info.duration;
          nextID.thumbs=info.thumbs? info.thumbs: nextID.thumbs;
         }); 
      }else{
        return promise()
      }
      
    });
  },  promise());
  
  return result.then(function(e)  {
    console.log("Collection time is ended",colection)
    video.style.visibility='visible';
    return colection;
  });

}


function delay(time){
    return new Promise(function(resolve){
        setTimeout(resolve,time)
    })

}

function promise(data){
    return new Promise(function(resolve){
     resolve(data)
    })
  }


  function getParameterByName(name,url) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

function ajxJson(url){
    return new Promise(function(resolve,reject){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        
        // request state change event
        xhr.onreadystatechange = function() {
        
          // request completed?
          if (xhr.readyState !== 4) return;
        
          if (xhr.status === 200) {
            // request successful - show response
            console.log(xhr.responseText);
            resolve(JSON.parse(xhr.responseText))
          }
          else {
            // request error
            console.log('HTTP error', xhr.status, xhr.statusText);
            reject(xhr.statusText)
          }
        };
        
        // start request
        xhr.send();
     });
    
}


function getImgVideoCanvas(){
  //var thecanvas=document.getElementById('thecanvas');
  var thecanvas = document.createElement('canvas');
  var getvideoDom=document.getElementsByTagName('video');
  var video=getvideoDom.item(0)
  var scaleFactor=1;
	var w = video.videoWidth * scaleFactor;
	var h = video.videoHeight * scaleFactor;
  
   thecanvas.width=w
   thecanvas.height=h

  
  // get the canvas context for drawing
  var context = thecanvas.getContext('2d');

  console.log('video**',video)
  console.log('canvas**',thecanvas)
  // draw the video contents into the canvas x, y, width, height
  context.drawImage( video, 0, 0, w, h);
  console.log('video**',video)

  // get the image data from the canvas object
  var dataURL;
  // try{
  //    dataURL = thecanvas.toDataURL();
  // }catch(e){
  //   console.error(e)
  // }
  
    // set the source of the img tag
  //img.setAttribute('src', dataURL);
  //return dataURL;

  return thecanvas;
}
