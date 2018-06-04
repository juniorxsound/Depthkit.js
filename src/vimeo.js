
// Requests to the vimeo API
const Vimeo = require('vimeo').Vimeo;

export default class VimeoWrapper{

  constructor(vimeo_token){

    if(vimeo_token == null){
      console.warn('A Vimeo API token was not provided');
      return;
    }

    this.api = new Vimeo(null, null, vimeo_token);
  }

  //A method for requesting vimeo videos
  requestVideo(video_id){
    return new Promise((resolve, reject)=>{

      //Vimeo API request for videos
      this.api.request({
        method: 'GET',
        path: '/videos/' + video_id
      }, (error, body, status, headers)=>{

        //Handle errors
        if(error) reject(error);

        //Sort the files
        let version = 1;

        if (body['metadata']['connections'] && body['metadata']['connections']['versions']) {
          version = body['metadata']['connections']['versions']['total'];
        }

        // Prep the files to include the correct type and exclude uncessary files
        if (body['files'] != null) {
          body['files'] = body['files'].map(function(file, i) {
            if (file['quality'] == 'hls') {
              file['type'] = 'application/x-mpegurl';
            }
            if (file['quality'] == 'source') {
              return;
            }

            file['link'] = file['link'].replace(/^http:/, 'https:') + '&v=' + version;

            return file;
          }).sort(function(a, b) {
            if (parseInt(a['height']) > parseInt(b['height'])) return -1;
            return 1;
          });
        }

        //Return the video links array
        resolve(body['files']);
      });
    });
  }
}
