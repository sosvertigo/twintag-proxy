import { serve,  type ConnInfo } from "https://deno.land/std@0.152.0/http/server.ts";

const forward = async (url:string, method:string) => {
  try {
    const headers = new Headers()
    headers.set('x-twintag-url', url)
    headers.set('x-twintag-method', method)
    headers.set('x-twintag-denodeploy-trace', `${Math.floor(Date.now())}`)
    const rsp = await fetch('https://worker-proxy.sosvertigo.workers.dev', {
      method: method,
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
    return await forward('https://twintag.io/ABCD', 'POST')
  }

  return new Response(null, { status: 404 } )
}

serve(handler, {
  onListen: ({ port, hostname }) => { 
    console.log("Listening on", hostname, 'port', port)
  }
});
