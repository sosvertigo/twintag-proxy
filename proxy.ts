import { serve,  type ConnInfo } from "https://deno.land/std@0.152.0/http/server.ts";

const test = async (url:string) => {
  try {
    const rsp = await fetch(url)
    let h = ''
    for (const header of rsp.headers) {
      h += `${header[0]}: ${header[1]}\n`
    }
    const text = await rsp.text()
    return `${url}\n${rsp.status}\n${h}\n${text.length} body bytes`
  } catch(err) {
    return `${err}`
  }
}

async function handler(req: Request, connInfo: ConnInfo): Promise<Response> {
  console.log(req, connInfo)

  const url = new URL(req.url)
  if (url.pathname === '/test') {
    const result = await test('https://twintag.io')
    console.log(result)
    return new Response(result, {
      status: 200,
    })
  }

  if (url.pathname === '/admin') {
    const result = await test('https://admin.twintag.io')
    console.log(result)
    return new Response(result, {
      status: 200,
    })
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
