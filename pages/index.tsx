import Image from "next/image";
import { Pixelify_Sans } from "next/font/google";

const pixelSans = Pixelify_Sans({ subsets: ['latin'] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${pixelSans.className}`}
    >
      <h1 className="text-5xl">Circle Employee Anniversary NFTs</h1>
    </main>
  );
}
