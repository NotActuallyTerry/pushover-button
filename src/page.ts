import { html, raw } from 'hono/html'
import { HtmlEscapedString } from 'hono/utils/html'

export interface PageLayoutProps {
  notify: HtmlEscapedString | Promise<HtmlEscapedString>
  emerg: HtmlEscapedString | Promise<HtmlEscapedString>
}

const NotifyBanner = (message: string) => html`
<h4>Sent message to Terry:</h4>
<pre><code>${message}</code></pre>
`

const EmergencySwitch = html`
<div>
  <label htmlFor="emerg">Send at Emergency level? </label>
  <input name="emerg" type="checkbox" role="switch" />
</div>
`


const PageLayout = (props: PageLayoutProps) => html`
        <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="color-scheme" content="light dark" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/picocss/2.1.1/pico.classless.amber.min.css" crossOrigin="anonymous" referrerPolicy="no-referrer" />
          <title>Wake the Terry</title>
        </head>
        <body>
          <header>
            <h1>Wake the Terry</h1>
          </header>
          <main>
           ${props.notify}
           <form action="" method="post">
              <div>
                <label htmlFor="message">Message: </label>
                <input type="text" name="message" id="message" required />
              </div>
              ${props.emerg}
              <div style="margin-top: 1rem">
                <input type="submit" value="Send message" />
              </div>
            </form>
          </main>
        </body>
      </html>
  `.toString()

export { EmergencySwitch, NotifyBanner, PageLayout }
