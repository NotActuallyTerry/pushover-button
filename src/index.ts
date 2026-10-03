import { Pushover } from 'pushover-sdk';

export default {
  async fetch(request, env, ctx): Promise<Response> {
	  const pushover = new Pushover({
 	    token: env.PUSHOVER_API_TOKEN,
 	    user: env.PUSHOVER_USER_KEY    
 	  })

 		/**
		 * readRequestBody reads in the incoming request body
		 * Use await readRequestBody(..) in an async function to get the string
		 * @param {Request} request the incoming request to read from
		 */
		async function readRequestBody(request: Request) {
			const contentType = request.headers.get("content-type");
		  if (contentType.includes("form")) {
				const formData = await request.formData();
				const body = {};
				for (const entry of formData.entries()) {
					body[entry[0]] = entry[1];
				}
				return body;
			} else {
			  throw new Error("POST data not accepted by this worker");
			}
		}

		const { url } = request;
		const contentType = request.headers.get("content-type");

		if (request.method === "POST" && contentType.includes("form")) {
			const postBody = await readRequestBody(request);

			if (!Object.hasOwn(postBody, "name") || !Object.hasOwn(postBody, "message")) {
				return Response("Invalid POST body", { status: 400 })
			}

			const pushoverResponse = await pushover.sendMessage({
				title: `(CF Button) From ${postBody.name}`,
				message: `${postBody.message}`
			})
			const retBody = `Sent message ${postBody.message} to Terry. Pushover status: ${pushoverResponse.status}`;

			return new Response(retBody);
		} else {
    const response = await env.ASSETS.fetch(request);
    
    if (response.status !== 404) {
      return response;
    }

		return new Response("Not Found", { status: 404 });
		}
	},
} satisfies ExportedHandler;
