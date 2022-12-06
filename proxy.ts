import { serve,  type ConnInfo } from "https://deno.land/std@0.152.0/http/server.ts";

const log = (line:string, text:string) => {
	console.log(line)
	return `${text}\n${line}`
}

const logHeaders = (headers:Headers, text:string) => {
	let lines = ''
	for (const header of headers) {
		lines = log(` ${header[0]}: ${header[1]}`, lines)
	}
	return `${text}${lines}`
}

const forward = async () => {
  try {
    const headers = new Headers()
    headers.set('x-twintag-denodeploy-trace', `${Math.floor(Date.now())}`)
    const rsp = await fetch('https://worker-proxy.sosvertigo.workers.dev', {
      headers: headers,
    })
    return new Response(rsp.body, {
      headers: rsp.headers,
    })
  } catch(err) {
    return new Response(err, {status:502})
  }
}

const test = async (url:string, method:string) => {
  try {
		const u = new URL(url)
		const headers = new Headers()
		headers.set('host', u.host)
		headers.set('x-twintag-cloudflare-trace', `${Math.floor(Date.now())}`)
	
		// log request
		let text = log('\nChecking ...\n', '')
		text = log(`${method} ${url}`, text)
		text = logHeaders(headers, text)

		// execute fetch
    const rsp = await fetch(url, {
			method: method,
			headers: headers,
		})

		// log response
		text = log(`Status ${rsp.status} `, text)
		text = logHeaders(rsp.headers, text)
	
		// log body length
    const body = await rsp.text()
		text = log(`${body.length} body bytes`, text)

		return text
  } catch(err) {
		console.error(err)
		return `${err}`
  }
}

async function handler(req: Request, connInfo: ConnInfo): Promise<Response> {
  console.log(req, connInfo)

  const url = new URL(req.url)
  if (url.pathname === '/test') {
    return await forward()
  }

  if (url.pathname === '/ngrok') {
    const text = await test('https://7588-87-67-226-224.eu.ngrok.io/', 'POST')
    return new Response(text, { status: 200 } )
  }

  return new Response(null, { status: 404 } )
}

serve(handler, {
  onListen: ({ port, hostname }) => { 
    console.log("Listening on", hostname, 'port', port)
  }
});
