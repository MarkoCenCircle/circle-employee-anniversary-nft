import "@/styles/globals.css";
import type { AppProps } from "next/app";
import {DefaultSeo, DefaultSeoProps } from "next-seo";
import {VT323} from "next/font/google";

const seoOptions: DefaultSeoProps = {
  defaultTitle: 'Circle Anniversary NFTs',
  themeColor: '#29233b',
  norobots: true,
  canonical: 'https://circle-employee-anniversary-nft.vercel.app/',
  description: 'Sign up to receive NFTs on your Circle anniversaries!',
  openGraph: {
    title: 'Circle Anniversary NFTs',
    url: 'https://circle-employee-anniversary-nft.vercel.app/',
    type: 'website',
    description: 'Sign up to receive NFTs on your Circle anniversaries!',
    siteName: 'Circle Anniversary NFTs',
    locale: 'en_US',
    images: [{
      url: 'https://circle-employee-anniversary-nft.vercel.app/nft-pics/1.png',
      width: 500,
      height: 500,
      alt: 'Sign up to receive NFTs on your Circle anniversaries!',
      type: 'image/png'
    }],
    defaultImageHeight: 500,
    defaultImageWidth: 500,
  },
  twitter: {
    site: 'https://circle-employee-anniversary-nft.vercel.app/',
    cardType: 'summary_large_image'
  }
}

const pixelSans = VT323({ weight: ['400'], subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <DefaultSeo {...seoOptions} />
    <main className={pixelSans.className}>
      <Component {...pageProps} />
    </main>
  </>;
}
