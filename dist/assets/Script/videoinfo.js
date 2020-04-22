

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
    var keyTube='AIzaSyDwkQH4OOeYn27ZthmxO-_ZjJx3yNzGI4U';
    var v=url.searchParams.get('v');
    $.getJSON('https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id='+v+'&key='+keyTube,function(data){
        resolve(data.items[0].contentDetails.duration.replace('PT','').replace('M',':').replace('S',''))
       })
  })
}

function getInfoVimeo(src){
    return new Promise(function(resolve){
      var keyVimeo='02013d39440018853077055dd7b6dd2a';  
      var v=src.src.replace('https://vimeo.com/','');
      $.getJSON('https://api.vimeo.com/videos/'+v+'?access_token='+keyVimeo,function(data){
          resolve(data.duration)
         })
    })
  }
  


function updateTimeColection(colection,player){

 let result = colection.reduce(function(accumulatorPromise, nextID)  {
    return accumulatorPromise.then(function()  {
      var source=nextID.sources[0];  
      if(source.type=== "video/mp4" || source.type=== "video/webm" || source.type=== "video/ogg")  
       return getInfoVideo(source,player).then(function(d){nextID.duration=d});
      else if(source.type=== "video/youtube"){
       return getInfoTube(source).then(function(d){nextID.duration=d}); 
      }else if(source.type=== "video/vimeo"){
        return getInfoVimeo(source).then(function(d){nextID.duration=d}); 
      }else{
        return Promise.resolve()
      }
      
    });
  }, Promise.resolve());
  
  return result.then(function(e)  {
    console.log("Resolution is complete! Let's party.",colection)
  });

}


function delay(time){
    return new Promise(function(resolve){
        setTimeout(resolve,time)
    })

}


