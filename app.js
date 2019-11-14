const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis);
let client = redis.createClient();


// client.getAsync('name').then(function(res) {
//   console.log(res); // => 'bar'
// });

/* client.xaddAsync('mystream','*','age',23).then(function(res){
  console.log(res);
}); */
/* 
client.xrangeAsync('mystream','-','+').then(function(res){
  res.forEach(element => {
    element.forEach((element,index)=>{
      if(index === 0){
        console.log(`Timestamp: ${element}`);
      }else{
        element.forEach(element=>{
          console.log(element)
        })
      }
    })
  });
});
 */
/* client.XGROUPAsync('DESTROY','mystream','consumer1').then(res=>{
  console.log(res);
})

 client.XGROUPAsync('CREATE','mystream','consumer1','0').then(res=>{
  console.log(res);
})
 
client.XINFOAsync('GROUPS','mystream').then(res=>{
  console.log(res)
})*/
/* 
client.xreadAsync('count',1,'Streams','mystream',0-0).then(res=>{
  res.forEach(element => {
    element.forEach((element,index)=>{
      if(index === 0){
        console.log(`Stream Name: ${element}`);
      }else{
        element.forEach((element,index)=>{
          element.forEach((element,index)=>{
            if(index === 0){
              console.log(`Timestamp: ${element}`);
            }else if(index === 1){
              element.forEach(element=>{
                console.log(element)
              })
            }
          })
        })
    }
    })
  });
})

client.onAsync('connect',()=>{
  console.log('Server started......')
});

client.onAsync('error',(err)=>{
  console.log(`Something went wrong ${err}`)
});

client.quit(); */

//random number generation and insertion into stream
async function genRnd(){
 for(let x = 0; x < 10;){
 await client.xaddAsync('mystream','MAXLEN','~','1000','*','rnd',Math.floor(Math.random()*10000)).then(res=>{
    //console.log(res);
});  
  }
}

//Iterating over array retrieved from redis
function* myIterator(val){
    for(let i = 0; i < val.length; i++){
    yield val[i];
    }
};

//reading data from redis stream
const FeedsIterator = function ({name = "mystream", blockMs = 0, check = '0-0'}) {
  let instructions = ["count","20",'STREAMS',name, check];
    if (!!blockMs) {
      instructions = ["BLOCK", `${blockMs}`, ...instructions];
    }
 
      return client
          .xreadAsync(...instructions)
          .then(res => {
              let [[,stream] = []] = res
              return stream;
          })
        
}

//FeedsIterator({});

const execute = async function(check = '0-0',blockMs = '20000') {
  for (let streams = await FeedsIterator({blockMs,check}); streams.length > 0;) {
      const myStreams = myIterator(streams);
      let {value, done} = myStreams.next();
       //console.log(value);
      while(!done) {      
          check = value[0];
          let[,[,data] = []] = value; 
          console.log(`Id: ${check}`);
          console.log(`Data: ${data}`);
          ({value, done} = myStreams.next());
      }
      streams = await FeedsIterator({check})
  }
}

genRnd();
execute();