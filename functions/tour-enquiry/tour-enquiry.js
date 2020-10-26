require('dotenv').config()

const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_URL, FROM_EMAIL_ADDRESS, CONTACT_TO_EMAIL_ADDRESS } = process.env

const mailgun = require('mailgun-js')({ apiKey: MAILGUN_API_KEY, domain: MAILGUN_DOMAIN, host: "api.eu.mailgun.net" })

exports.handler = async (event, context, callback) => {

// console.log(event.body)

const data = JSON.parse(event.body)	

var text = `Dear traveller, \n\n`
text += `Thanks a lot for your enquiry. We would love to see you visit India.\n\n`
text += `We will get back to you as soon as possible with an interesting itinerary.\n\n`
text += `Kind regards,\n\nOdyssey Team`
text += `\n\nYour message: \n\n`
text += `Interest: ${data.interest} \n`
text += `Region: ${data.region} \n`
text += `Month of travel: ${data.month} \n`
text += `Number of people: ${data.number} \n`

const style = "<style> </style>"
var body = `<html>${style}<div>`
body += `<p>Dear traveller,</p>`
body += "<p>Thanks a lot for your enquiry. We would love to see you visit India. </p>"
body += "<p>We will get back to you as soon as possible with an interesting itinerary.</p>"
body += "<p>Kind regards,</p><p>Odyssey Team</p>"
body += `<h4>Your message:</h4><p>${data.message}</p>`
body += `<p>Interest: ${data.interest}</p>`
body += `<p>Region: ${data.region}</p>`
body += `<p>Month of travel: ${data.month}</p>`
body += `<p>Number of people: ${data.number}</p>`
body += `</div></html>`

	let response
	try {
		response = await mailgun.messages().send({
		  	to: data.email,
		  	bcc: CONTACT_TO_EMAIL_ADDRESS,
		  	from: FROM_EMAIL_ADDRESS,
		  	subject: `Enquiry for a tour of India in ${data.month}`,
		  	text: text,
		  	html: body
		})
	} 
	catch (error) {
		console.log('Error: ', error)
		return {
		  	statusCode: error.statusCode || 500,
		  	headers: { "Access-Control-Allow-Origin": "*" },
		  	body: JSON.stringify({	error: error.message })
		}
	}

	return {
		statusCode: 200,
		headers: { "Access-Control-Allow-Origin": "*" },
		body: JSON.stringify({ result: 200	})
	}
}