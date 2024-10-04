import nodemailer from 'nodemailer';
// import hbs from 'nodemailer-express-handlebars';

import 'dotenv/config';






const transport = nodemailer.createTransport({
  service:'Gmail',
    host: process.env.HOST_MAIL,
    port: 465,
    tls:{
      rejectUnauthorized: false
 },
    auth: {
      user:  process.env.USER_MAIL,
      pass:  process.env.PASS_MAIL
    }
    
  });

  // transport.use('compile', hbs({
  //     viewEngine: 'handlebars',
  //     viewPath: path.resolve('./src/recursos/mail/'),
  //     extName: '.html',
  // }))
 


  export default transport;