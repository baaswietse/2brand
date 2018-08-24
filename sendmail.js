const nodemailer = require('nodemailer');
var fs = require('fs')


function confirmMail(post){                                         //naar de poster
  fs.readFile('confirmmail.txt', 'utf8', function(err, data) { 
    if (err) throw err
    var transporter = nodemailer.createTransport({
    host: 'smtp-auth.mailprotect.be',
    port: 2525,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'info@2brand.be', // your domain email address
      pass: '2brandpw63' // your password
      }
    });
    
    
    var mailOptions = {
      from: 'Wietse van 2brand <info@2brand.be>', // sender address
      to: post.email, // list of receivers
      subject: 'We hebben je post goed ontvangen!', 
      html: data
    };
    
    transporter.sendMail(mailOptions, function(err, info) {
      if (err)
        console.log(err)
      else
        console.log(info);
    });
  })
}



//================================================================================================================
function notificationMail(post){                                                    //naar ons
    var transporter = nodemailer.createTransport({  
    host: 'smtp-auth.mailprotect.be',
    port: 2525,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'info@2brand.be', // your domain email address
      pass: '2brandpw63' // your password
    }
  });
    
    
    var mailOptions = {
      from:'NEW POST <info@2brand.be>', // sender address
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


//=======================================================================================
function codeMail(post){
  fs.readFile('codemail.txt', 'utf8', function(err, data) {  
    if (err) throw err
    
    var os = require("os");
    var mail = data.split(os.EOL) //array splitted by 'new lines'
    
    
    var transporter = nodemailer.createTransport({
      host: 'smtp-auth.mailprotect.be',
      port: 2525,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'info@2brand.be', // your domain email address
        pass: '2brandpw63' // your password
      }
    });
    
    
    var mailOptions = {
      from: 'Wietse van 2brand <info@2brand.be>', // sender address
      to: post.email, // list of receivers
      subject: 'Je code: ' + post.code,// Subject line
      html: mail[0] + post.instaname + mail[1] + post.code + mail[2] +post.voordeel  + mail[3]
    };
    
    transporter.sendMail(mailOptions, function(err, info) {
      if (err)
        console.log(err)
      else
        console.log(info);
    });
        
        
        
        
  });
    
}



module.exports = {confirm: confirmMail, notification: notificationMail, code: codeMail}