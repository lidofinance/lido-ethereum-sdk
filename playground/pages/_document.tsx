import Document, {
  Head,
  Html,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document';
import { Fonts, LidoUIHead } from '@lidofinance/lido-ui';
import { ServerStyleSheet } from 'styled-components';
import { dynamics, serverRuntimeConfig } from '../config';

// for prod and dev use https and real domain
let host = 'http://localhost';

export default class MyDocument extends Document {
  static async getInitialProps(
    ctx: DocumentContext,
  ): Promise<DocumentInitialProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    if (ctx?.req?.headers?.host) {
      host = `https://${ctx?.req?.headers?.host}`;
    }

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);

      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  get basePath(): string {
    const { basePath } = serverRuntimeConfig;
    return basePath;
  }

  get metaTitle(): string {
    return 'Lido SDK Playground | Lido';
  }

  get metaPreviewImgUrl(): string {
    return `${host}/lido-preview.png`;
  }

  render(): JSX.Element {
    return (
      <Html lang="en">
        <Head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" type="image/svg+xml" href="favicon-512x512.svg" />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="194x194"
            href="/favicon-194x194.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <meta property="og:type" content="website" />
          <meta property="og:title" content={this.metaTitle} />
          <meta property="og:image" content={this.metaPreviewImgUrl} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={this.metaTitle} />
          <meta name="twitter:image:src" content={this.metaPreviewImgUrl} />
          <meta name="twitter:site" content="@lidofinance" />
          <meta name="twitter:creator" content="@lidofinance" />
          <meta name="currentChain" content={String(dynamics.defaultChain)} />
          <Fonts />
          <LidoUIHead />
          <script src={`${this.basePath}/runtime/window-env.js`} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
