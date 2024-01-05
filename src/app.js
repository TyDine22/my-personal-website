const axios = require('axios');

require('dotenv').config();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const express = require('express');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages/index.html'));
})

app.get('/about', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages/about.html'));
})

app.get('/contact', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages/contact.html'));
})

app.get('/send-email', (req,res) => {
    res.sendFile(path.join(__dirname, 'pages/submitted.html'));
})

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD
    }
})

app.post('/send-email', async (req,res) => {
    const { name, email, coverletter, 'g-recaptcha-response': gRecaptchaResponse } = req.body;

    const recaptchaSecretKey = '6Lf0zUYpAAAAAF9-rJQMjnoFqLWQG6BqGus_Zyeh';
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${gRecaptchaResponse}`;

    try {
        const recaptchaResponse = await axios.post(recaptchaVerifyUrl);
        if (!recaptchaResponse.data.success) {
            return res.status(400).send('reCAPTCHA verification failed');
        }

        const mailOptions = {
            from: process.env.EMAIL_ID,
            to: process.env.EMAIL_ID,
            subject: 'Message from personal website',
            html:`
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong> ${coverletter}</p>
                `
        };
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                res.status(500).send('Error sending email');
            } else {
                console.log('Email sent: ' + info.response);
                res.redirect('/send-email')
            }
        });
    } catch (error) {
        console.error('reCAPTCHA verification error: ', error);
        res.status(500).send('Error verifiying reCAPTCHA');
    }   
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
})