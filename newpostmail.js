const nodemailer = require('nodemailer');



function sendmail(post){
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'wietse.spam69@gmail.com',
        pass: 'W942018d'
      },
      tls:{
            rejectUnauthorized: false
        }
    })
    
    
    const mailOptions = {
      from: 'wietse.spam69@gmail.com', // sender address
      to: 'wietse.delclef@gmail.com', // list of receivers
      subject: 'Subject of your email', // Subject line
      html: '<!DOCTYPE html><html lang="en"><head> <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css"> <title>Document</title></head><body> <div class="divider"> <p class="h1">Niewe post!</p> <table class="table"> <tbody> <tr> <th scope="row:">Instagram</th> <td>' + post.instaname + '</td> </tr> <tr> <th scope="row">email</th> <td>' + post.email + '</td> </tr> <tr> <th scope="row">partner</th> <td>' + post.partner + '</td> </tr> <tr> <th scope="row">voordeel</th> <td>' + post.voordeel + '</td> </tr> <tr> <th scope="row">link</th> <td>' + post.link + '</td> </tr> </tbody> </table> </div></body></html>'
    };
    
    transporter.sendMail(mailOptions, function(err, info) {
      if (err)
        console.log(err)
      else
        console.log(info);
    });
}

module.exports = sendmail