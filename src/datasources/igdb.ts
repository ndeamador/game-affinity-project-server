// import { RESTDataSource, RequestOptions } from 'apollo-datasource-rest';
// // const { RESTDataSource } = require('apollo-datasource-rest');
// import fetch from 'node-fetch';


// class GamesAPI extends RESTDataSource {
//   constructor() {
//     // Super calls are used to call the constructor of the base class.
//     // In other words, we need it to access the RESTDataSource class, which GamesAPI extends.
//     // We need to use it before calling "this" in a constructor.
//     super();
//     this.baseURL = 'https://api.igdb.com/v4/';
//     // this.initialize({});
//     // this.baseURL = "https://api.randomuser.me/";
//   }

//   // async getAuthorizationToken() {
//   //   // await this.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`);

//   //   await this.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`)
//   //     .then(res => {
//   //       console.log(res.body);
//   //     })
//   //     .catch(err => console.log(err));
//   // }


//   // willSendRequest(request: RequestOptions) {
//   //   request.headers.set('Authorization', `Bearer oiwm1jc771tptwsogi37u34xanb00v`);
//   //   request.headers.set('Client-ID', process.env.TWITCH_CLIENT_ID || 'no-client-id');
//   // }

//   async testRequest() {
//     // console.log('THIS: ', this);
//     // console.log('BASEURL: ', this.baseURL);

//     const body = `fields name, first_release_date, platforms, summary;
//     limit 10;
//     search "warcraft";`;

//     await this.post('games', {
//       body: body,
//       headers: {
//         'Authorization': 'Bearer 8ol59wt1ij91a8z3d2m0boqtwxc69k',
//         'Client-ID': '0p4eyjkjp2gh0zxi6v5kln3fmwdkh1'
//       }
//     })
//       .then(res => console.log('response: ', res.body))
//       .catch(err => console.log('Error: ', err));


//   }

//   async getPerson() {
//     await this.get("")
//       .then(res => res.json())
//       .then(body => console.log(body))
//       .catch(err => console.log(err));
//   }
// }

// // const testing = new GamesAPI;
// // testing.testRequest().catch(err => console.log(err));



// const body = `fields name, first_release_date, platforms, summary;
// limit 10;
// search "warcraft";`;

// fetch("https://api.igdb.com/v4/games", {
//   method: 'post',
//   body: body,
//   headers: {
//     'Authorization': 'Bearer 8ol59wt1ij91a8z3d2m0boqtwxc69k',
//     'Client-ID': '0p4eyjkjp2gh0zxi6v5kln3fmwdkh1'
//   }
// })
//   .then(res => res.json())
//   .then(body => console.log(body))
//   .catch(err => console.log(err));



// export default GamesAPI;