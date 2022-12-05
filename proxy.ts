import { serve,  type ConnInfo } from "https://deno.land/std@0.152.0/http/server.ts";

const test = async (url:string) => {
  try {
    const rsp = await fetch(url)
    let h = ''
    for (const header of rsp.headers) {
      h += `${header[0]}: ${header[1]}\n`
    }
    const text = await rsp.text()
    return `${url}\n${rsp.status}\n${h}\n${text.length} body bytes\n${text}\n`
  } catch(err) {
    return `${err}`
  }
}

const forward = async (url:string) => {
  try {
    const headers = new Headers()
    headers.set('x-twintag-url', url)
    headers.set('x-twintag-method', 'GET')
    headers.set('x-twintag-denodeploy-trace', `${Math.floor(Date.now())}`)
    const rsp = await fetch('https://worker-proxy.sosvertigo.workers.dev', {
      method: 'POST',
      headers: headers,
    })
    return new Response(rsp.body, {
      headers: rsp.headers,
    })
  } catch(err) {
    return new Response(err, {status:502})
  }
}

async function handler(req: Request, connInfo: ConnInfo): Promise<Response> {
  console.log(req, connInfo)

  const url = new URL(req.url)
  if (url.pathname === '/test') {
    const result = await test('https://twintag.io/ABCD')
    console.log(result)
    return forward('https://twintag.io/ABCD')
  }

  const headers = new Headers()
  return new Response(null, {
    status: 404,
    headers: headers
  })
}


serve(handler, {
  hostname: '127.0.0.1',
  port: 8000,
  onListen: ({ port, hostname }) => { 
    console.log("Listening on", hostname, 'port', port)
  }
});
