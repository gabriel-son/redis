
const PubNub = require('pubnub');
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis);
let client = redis.createClient();

 pubnub = new PubNub({
 subscribe_key: 'sub-c-78806dd4-42a6-11e4-aed8-02ee2ddab7fe'
 });
 pubnub.addListener({
    message: function(message) {
        //console.log(message.message);
      client.xaddAsync("mystream","MAXLEN","~","1000","*","twitter",JSON.stringify(message.message)).then(rep=>{
           //console.log(`Reply:${rep}`, message.message.id)
        }); 
    }
 });
 pubnub.subscribe({
 channels: ['pubnub-twitter']
 });  


 const myIterator = function* (dataset) {
    for (let i=0; i<dataset.length; i++) {
      yield dataset[i];
    }
  }

  const FeedsIterator = function ({name = "mystream", blockMs = 0, check = '0-0'}) {
    let instructions = ["count","20",'STREAMS',name, check];
      if (!!blockMs) {
        instructions = ["BLOCK", `${blockMs}`, ...instructions];
      }
   
        return client
            .xreadAsync(...instructions)
            .then((res) => {
                let [[, streams] = []] = res || [];
                //console.log("Hey",streams);
                return streams;
            })
          
  }

  //FeedsIterator({});
/* 
  const execute = async function({check = '0-0',blockMs = 0}) {
    for (let streams = await FeedsIterator({blockMs,check}); (streams || []).length > 0;) {
        const myStreams = myIterator(streams);
        let {value, done} = myStreams.next();
         //console.log(value);
        while(!done) {
            check = value[0];
            let twitter =  JSON.parse(value[1][1]);
            if(twitter.user['followers_count'] >= 1){
                console.log(`Twitter Handle: ${twitter.user['screen_name']}`)
                console.log(`Fellower Count: ${twitter.user['followers_count']}`);
            }
            ({value, done} = myStreams.next());
        }
        streams = await FeedsIterator({blockMs,check})
        // console.log({myarr})
    }
}
 */
const execute1 = async function({check = '0-0',blockMs = 0}) {
    let streams = await FeedsIterator({blockMs,check});
    //console.log(Array.isArray(streams));
    //console.log('');
    if(streams){
        for(let [key, [source, data]] of streams){
            check = key;
            let twitter = JSON.parse(data);
            //console.log(twitter);
            if(twitter.user['followers_count'] >= 10000){
                console.log(`Twitter Handle: ${twitter.user['screen_name']}`)
                console.log(`Fellower Count: ${twitter.user['followers_count']}`);
            }
        }
    } 
    return await execute1({check, blockMs});
}



execute1({});
        
/* 
 const myIterator = function* (dataset) {
    for (let i=0; i<dataset.length; i++) {
      yield dataset[i];
    }
  }

  const FeedsIterator = function ({name = "mystream", blockMs = 0, check = '0-0'}) {
    let instructions = ["count","20",'STREAMS',name, check];
      if (!!blockMs) {
        instructions = ["BLOCK", `${blockMs}`, ...instructions];
      }
   
        return client
            .xreadAsync(...instructions)
            .then(res => {
                let [[, streams] = []] = res || [];
                console.log(res);
                return streams;
            }) //console.log("New check"+check);
          
  }

  //FeedsIterator()
  const execute = function({check = '0-0',blockMs = '1000'}) {
    for (let streams = FeedsIterator({blockMs,check}); streams.length > 0;) {
        const myStreams = myIterator(streams);
        let {value, done} = myStreams.next();
         //console.log(value);
        while(!done) {
            check = value[0];
            let twitter =  JSON.parse(value[1][1]);
            if(twitter.user['followers_count'] >= 10000){
                console.log(`Twitter Handle: ${twitter.user['screen_name']}`)
                console.log(`Fellower Count: ${twitter.user['followers_count']}`);
            }
            ({value, done} = myStreams.next());
        }
        streams = FeedsIterator({check})
        // console.log({myarr})
    }
}

execute({});
        
  */