

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

             player.on('error', function(e) {
               console.error('error',src.src,e)
               resolve(0) })

        
        player.src(src);
        
       
    });


}


function getInfoTube(src){
  return new Promise(function(resolve){
  //  var url= new URL(src.src);
    var keyTube='AIzaSyDwkQH4OOeYn27ZthmxO-_ZjJx3yNzGI4U';
    //var v=url.searchParams.get('v');
    var v=getParameterByName('v',src.src);
    console.log('parameter v',v);
   
    ajxJson('https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id='+v+'&key='+keyTube)
    .then(function(data){
            console.log('respond yputube',data)
            resolve(data.items[0].contentDetails.duration.replace('PT','').replace('M',':').replace('S',''))
           })



  })
}

function getInfoVimeo(src){
    return new Promise(function(resolve){
      var keyVimeo='02013d39440018853077055dd7b6dd2a';  
      var v=src.src.replace('https://vimeo.com/','');
   
         ajxJson('https://api.vimeo.com/videos/'+v+'?access_token='+keyVimeo)
         .then(function(data){
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
        return promise()
      }
      
    });
  },  promise());
  
  return result.then(function(e)  {
    console.log("Collection time is ended",colection)
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
