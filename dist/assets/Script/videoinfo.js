

function getInfoVideo(src,player){

    return new Promise(function(resolve){
        //alert(src.src)
        
        // if (player.readyState() < 1) {
            // wait for loadedmetdata event
            player.one("loadedmetadata", function () {
                //   alert(player.duration());
                var dur= player.duration()
             
                   resolve(dur)
       
               });
        //}
        // else {
        //     // metadata already loaded
        //     onLoadedMetadata();
        // }
        player.src(src);
        
       
    });


}


function getInfoTube(src){
  return new Promise(function(resolve){
    var url= new URL(src.src);
    var v=url.searchParams.get('v');
    $.getJSON('https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id='+v+'&key=AIzaSyDwkQH4OOeYn27ZthmxO-_ZjJx3yNzGI4U',function(data){
        // alert(JSON.stringify(data))
        resolve(data.items[0].contentDetails.duration.replace('PT','').replace('M',':').replace('S',''))
       })
  })
}

function getInfoVimeo(src){
    return new Promise(function(resolve){
      var v=src.src.replace('https://vimeo.com/','');
      $.getJSON('https://api.vimeo.com/videos/'+v+'?access_token=02013d39440018853077055dd7b6dd2a',function(data){
          // alert(JSON.stringify(data))
          resolve(data.duration)
         })
    })
  }
  


function updateColection(colection,player){

 let result = colection.reduce( (accumulatorPromise, nextID) => {
    return accumulatorPromise.then(() => {
      var source=nextID.sources[0];  
      if(source.type=== "video/mp4" || source.type=== "video/webm" || source.type=== "video/ogg")  
       return getInfoVideo(source,player).then(d=>nextID.duration=d);
      else if(source.type=== "video/youtube"){
       return getInfoTube(source).then(d=>nextID.duration=d); 
      }else if(source.type=== "video/vimeo"){
        return getInfoVimeo(source).then(d=>nextID.duration=d); 
      }else{
        return Promise.resolve()
       // return delay(20000)
      }
      
    });
  }, Promise.resolve());
  
  return result.then(e => {
    console.log("Resolution is complete! Let's party.",colection)
  });

}


function delay(time){
    return new Promise(resolve=>{
        setTimeout(resolve,time)
    })

}


