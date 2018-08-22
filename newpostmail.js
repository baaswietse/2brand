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
      to: 'info@2brand.be', // list of receivers
      subject: 'Nieuwe post door @' + post.instaname, // Subject line
      html: '<table> <tbody style="font-size: 15x"> <tr> <th align="left">Instagram: </th> <td>' + post.instaname + '</td> </tr> <tr> <th align="left">email: </th> <td>' + post.email + '</td> </tr> <tr> <th align="left">partner: </th> <td>' + post.partner + '</td> </tr> <tr> <th align="left">voordeel: </th> <td>' + post.voordeel + '</td> </tr> <tr> <th align="left">link: </th> <td>'+ post.link +'</td> </tr> </tbody></table>'
    };
    
    transporter.sendMail(mailOptions, function(err, info) {
      if (err)
        console.log(err)
      else
        console.log(info);
    });
}

module.exports = sendmail