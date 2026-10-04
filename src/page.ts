import { html, raw } from 'hono/html'
import { HtmlEscapedString } from 'hono/utils/html'

const NotifyBanner = html`
<h1>Message sent!</h1>
`

const EmergencySwitch = html`
<div>
  <label htmlFor="emerg">Send at Emergency level? </label>
  <input name="emerg" type="checkbox" role="switch" />
</div>
`

export interface PageLayoutProps {
  notify: HtmlEscapedString | Promise<HtmlEscapedString>
  emerg: HtmlEscapedString | Promise<HtmlEscapedString>
}

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
            ${props.notify}
            <h2>Wake the Terry</h2>
          </header>
          <main>
           <form action="" method="post">
              <div>
                <label htmlFor="message">Message: </label>
                <input type="text" name="message" id="message" required />
              </div>
              ${props.emerg}
              <div>
                <input type="submit" value="Send message" />
              </div>
            </form>
          </main>
        </body>
      </html>
  `.toString()

export { EmergencySwitch, NotifyBanner, PageLayout }
